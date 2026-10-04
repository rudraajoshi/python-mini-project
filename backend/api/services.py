"""Retrieval helpers plus a small OpenAI-compatible answer-writing client."""
import logging
import re
import time
from collections import Counter
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)
STOP_WORDS = {"a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in", "is", "it", "of", "on", "or", "the", "to", "what", "when", "where", "which", "who", "why", "with", "you"}
SYSTEM_PROMPT = """You are the answer writer inside a personal study-notes app. You are given numbered passages taken from the user's own documents, and a question. Answer using ONLY information found in those passages; never use outside knowledge. If the passages only partly answer the question, answer the part they cover and say plainly what is missing. If they do not contain the answer, say you could not find it in the user's documents.

Write for a student who wants to understand, not to read raw excerpts. Do not copy passages word for word; explain in your own clear words, merge points that repeat across passages, and drop irrelevant text.

Format rules (the app shows plain text only, so Markdown would appear as stray symbols): write plain text in short paragraphs separated by exactly one blank line. Do not use Markdown, asterisks, hash headings, bullet characters, numbered-list syntax, tables or code fences. Structure the answer as follows. First paragraph: the direct answer in one or two sentences. Next one to three short paragraphs: the explanation, covering the key points. If the passages contain a worked example, finish with a paragraph that begins with "Example:" and describes it briefly. For a question that compares two things, write one short paragraph for each thing and then one paragraph stating the difference. Keep the whole answer under about 200 words unless the question clearly needs more.

Cite the passages you used with their numbers in square brackets at the end of the sentence, for example [1] or [2][3]. Do not mention "passage", "context" or "excerpt" in the prose itself."""


class LLMFailure(Exception):
    def __init__(self, code, message, status=None):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status


class LLMEmptyResponse(LLMFailure):
    def __init__(self):
        super().__init__("empty", "The model returned no text. LLM_MAX_TOKENS may be too low.")


def clean_text(value):
    value = (value or "").replace("\x00", "").replace("\r\n", "\n").replace("\r", "\n")
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[^\S\n]+", " ", value)).strip()


def terms(value):
    return [word.lower() for word in re.findall(r"[\w-]+", value) if len(word) > 1 and word.lower() not in STOP_WORDS]


def chunk_text(text, target_size=900, overlap=120):
    paragraphs = [part.strip() for part in clean_text(text).split("\n\n") if part.strip()]
    chunks, current = [], ""
    for paragraph in paragraphs:
        if len(paragraph) > target_size:
            if current: chunks.append(current); current = ""
            start = 0
            while start < len(paragraph):
                end = min(start + target_size, len(paragraph))
                if end < len(paragraph):
                    split_at = paragraph.rfind(". ", start, end)
                    if split_at > start + target_size // 2: end = split_at + 1
                chunks.append(paragraph[start:end].strip())
                if end >= len(paragraph): break
                start = max(end - overlap, start + 1)
        elif current and len(current) + len(paragraph) + 2 > target_size:
            chunks.append(current); current = current[-overlap:] + "\n\n" + paragraph if overlap else paragraph
        else: current = f"{current}\n\n{paragraph}".strip()
    if current: chunks.append(current)
    return chunks


def score_chunk(question, text):
    query_terms = terms(question)
    if not query_terms: return 0.0
    counts = Counter(terms(text))
    score = sum(min(counts[term], 3) for term in query_terms) / len(query_terms)
    if len(query_terms) > 1 and " ".join(query_terms) in clean_text(text).lower(): score += 1.0
    return score


def _trim(value, limit):
    value = clean_text(value)
    if len(value) <= limit: return value
    cut = value.rfind(" ", 0, limit)
    return value[:cut if cut > limit // 2 else limit].rstrip() + "…"


def extractive_fallback(chunks):
    if not chunks: return "I couldn't find relevant information about that in your saved documents."
    return "Closest passages in your library:\n\n" + "\n\n".join(_trim(chunk.text, 350) for chunk in chunks[:3])


def _normalise_answer(value):
    value = re.sub(r"<think>.*?</think>", "", value or "", flags=re.S | re.I)
    value = re.sub(r"\[(?:\s*\d+\s*(?:,\s*\d+\s*)*)\]", "", value).replace("**", "").replace("__", "")
    lines = []
    for line in value.splitlines():
        line = re.sub(r"^\s*(?:[-*#]+|\d+[.)])\s*", "", line).strip()
        if line: lines.append(re.sub(r"\s+", " ", line))
    return re.sub(r"\s+([,.!?;:])", r"\1", "\n\n".join(lines)).strip()


def _cited_chunks(answer, chunks):
    cited = []
    for match in re.findall(r"\[(.*?)\]", answer):
        for raw_number in re.findall(r"\d+", match):
            number = int(raw_number)
            if 1 <= number <= len(chunks) and chunks[number - 1] not in cited: cited.append(chunks[number - 1])
    return _deduplicate_chunks(cited or chunks[:3])


def _deduplicate_chunks(chunks):
    result, seen = [], set()
    for chunk in chunks:
        document = chunk.document
        key = (getattr(chunk, "document_id", getattr(document, "id", id(document))), chunk.page_number)
        if key not in seen:
            seen.add(key); result.append(chunk)
    return result


def build_messages(question, chunks, history, context_chars):
    passages, used, remaining = [], [], context_chars
    for chunk in chunks:
        text = _trim(chunk.text, 1200)
        if len(text) > remaining: break
        used.append(chunk); passages.append(f"[{len(used)}] ({chunk.document.name}, page {chunk.page_number})\n{text}")
        remaining -= len(text)
    history_messages = [{"role": message.role, "content": _trim(message.content, 1000)} for message in history[-4:]]
    final = "Passages:\n" + "\n\n".join(passages) + f"\n\nQuestion: {question}"
    return [{"role": "system", "content": SYSTEM_PROMPT}, *history_messages, {"role": "user", "content": final}], used


class OpenAICompatibleClient:
    _reasoning_effort_supported = True

    def __init__(self, settings, client=None):
        self.settings, self.client = settings, client or httpx.Client(timeout=settings.LLM_TIMEOUT_SECONDS)

    def configuration_error(self):
        missing = []
        if not self.settings.LLM_API_KEY: missing.append("LLM_API_KEY or GROQ_API_KEY")
        if not self.settings.LLM_BASE_URL: missing.append("LLM_BASE_URL")
        if not self.settings.LLM_MODEL: missing.append("LLM_MODEL")
        return ", ".join(missing)

    def model_list_configuration_error(self):
        missing = []
        if not self.settings.LLM_API_KEY: missing.append("LLM_API_KEY or GROQ_API_KEY")
        if not self.settings.LLM_BASE_URL: missing.append("LLM_BASE_URL")
        return ", ".join(missing)

    def _payload(self, messages, include_reasoning=True):
        payload = {"model": self.settings.LLM_MODEL, "messages": messages}
        if self.settings.LLM_MAX_TOKENS is not None: payload["max_completion_tokens"] = self.settings.LLM_MAX_TOKENS
        if self.settings.LLM_TEMPERATURE is not None: payload["temperature"] = self.settings.LLM_TEMPERATURE
        if include_reasoning and self._reasoning_effort_supported and self.settings.LLM_REASONING_EFFORT: payload["reasoning_effort"] = self.settings.LLM_REASONING_EFFORT
        return payload

    @staticmethod
    def _message(response):
        try: return str(response.json().get("error", {}).get("message") or response.text)[:300]
        except ValueError: return response.text[:300]

    def _failure(self, response):
        message, status = self._message(response), response.status_code
        lowered = message.lower()
        if status in (401, 403): code = "auth"
        elif status in (400, 404) and any(word in lowered for word in ("model", "decommissioned", "not found")): code = "model"
        elif status == 429: code = "rate_limit"
        elif status >= 500: code = "server"
        else: code = "bad_response"
        return LLMFailure(code, message or f"HTTP {status}", status)

    def generate(self, messages):
        missing = self.configuration_error()
        if missing: raise LLMFailure("not_configured", f"Missing {missing}")
        url = self.settings.LLM_BASE_URL.rstrip("/") + "/chat/completions"
        headers = {"Authorization": f"Bearer {self.settings.LLM_API_KEY}", "Content-Type": "application/json"}
        retried, include_reasoning = False, True
        while True:
            try: response = self.client.post(url, headers=headers, json=self._payload(messages, include_reasoning))
            except httpx.TimeoutException: failure = LLMFailure("timeout", "Request timed out")
            except httpx.TransportError: failure = LLMFailure("network", "Could not reach the provider")
            else:
                if response.is_success:
                    try: content = response.json()["choices"][0]["message"]["content"]
                    except (ValueError, KeyError, IndexError, TypeError) as error: raise LLMFailure("bad_response", "Missing choices[0].message.content", response.status_code) from error
                    content = re.sub(r"<think>.*?</think>", "", content or "", flags=re.S | re.I).strip()
                    if not content:
                        failure = LLMEmptyResponse()
                        logger.warning("LLM request failed code=%s status=%s message=%s", failure.code, failure.status, failure.message)
                        raise failure
                    return content
                failure = self._failure(response)
                if failure.status == 400 and include_reasoning and self.settings.LLM_REASONING_EFFORT and "reasoning_effort" in failure.message.lower():
                    self._reasoning_effort_supported, include_reasoning = False, False; continue
                if failure.code == "rate_limit" and not retried:
                    try: wait = float(response.headers.get("retry-after", ""))
                    except ValueError: wait = 99
                    if wait <= 4: time.sleep(max(wait, 0)); retried = True; continue
            if failure.code in {"timeout", "network", "server"} and not retried:
                time.sleep(1); retried = True; continue
            logger.warning("LLM request failed code=%s status=%s message=%s", failure.code, failure.status, failure.message[:300])
            raise failure

    def list_models(self):
        missing = self.model_list_configuration_error()
        if missing: raise LLMFailure("not_configured", f"Missing {missing}")
        try: response = self.client.get(self.settings.LLM_BASE_URL.rstrip("/") + "/models", headers={"Authorization": f"Bearer {self.settings.LLM_API_KEY}"})
        except httpx.TimeoutException: raise LLMFailure("timeout", "Request timed out")
        except httpx.TransportError: raise LLMFailure("network", "Could not reach the provider")
        if not response.is_success: raise self._failure(response)
        try: return [item["id"] for item in response.json()["data"]]
        except (ValueError, KeyError, TypeError) as error: raise LLMFailure("bad_response", "Missing model list") from error


def synthesize_answer(question, chunks, history, settings):
    if not chunks: return extractive_fallback([]), [], False, None
    if settings.LLM_PROVIDER == "extractive": return extractive_fallback(chunks), _deduplicate_chunks(chunks[:3]), False, None
    client = OpenAICompatibleClient(settings)
    missing = client.configuration_error()
    if missing:
        logger.warning('LLM provider is "%s" but %s is not set; using extractive answers', settings.LLM_PROVIDER, missing)
        return extractive_fallback(chunks), _deduplicate_chunks(chunks[:3]), True, "not_configured"
    messages, sent_chunks = build_messages(question, chunks, history, settings.LLM_CONTEXT_CHARS)
    if not sent_chunks: return extractive_fallback(chunks), _deduplicate_chunks(chunks[:3]), True, "not_configured"
    try:
        raw_answer = client.generate(messages)
        return _normalise_answer(raw_answer), _cited_chunks(raw_answer, sent_chunks), False, None
    except LLMFailure as failure: return extractive_fallback(chunks), _deduplicate_chunks(chunks[:3]), True, failure.code


def summarize_with_llm(document, settings):
    pages = list(document.page_text.items())
    if not pages or settings.LLM_PROVIDER == "extractive": return None, False, None
    client = OpenAICompatibleClient(settings)
    if client.configuration_error(): return None, True, "not_configured"
    indexes = sorted({0, *[round(index * (len(pages) - 1) / 11) for index in range(min(12, len(pages)))]})
    samples = [f"({document.name}, page {int(pages[index][0])})\n{_trim(pages[index][1], 1500)}" for index in indexes]
    messages = [{"role": "system", "content": SYSTEM_PROMPT.replace("Cite the passages you used with their numbers in square brackets at the end of the sentence, for example [1] or [2][3]. Do not mention \"passage\", \"context\" or \"excerpt\" in the prose itself.", "Do not use citation markers.")}, {"role": "user", "content": "Summarize this document in at most three short paragraphs.\n\n" + "\n\n".join(samples)}]
    try: return _normalise_answer(client.generate(messages)), False, None
    except LLMFailure as failure: return None, True, failure.code


def provider_host(settings): return urlparse(settings.LLM_BASE_URL).netloc
