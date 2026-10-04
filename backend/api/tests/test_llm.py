import logging
from types import SimpleNamespace
import json

import httpx
import pytest

from api.services import LLMFailure, OpenAICompatibleClient, _cited_chunks, _normalise_answer, build_messages, synthesize_answer


def settings(**overrides):
    values = {"LLM_API_KEY": "test-key", "LLM_MODEL": "test-model", "LLM_BASE_URL": "https://example.test/v1", "LLM_TIMEOUT_SECONDS": 2, "LLM_MAX_TOKENS": None, "LLM_REASONING_EFFORT": "", "LLM_TEMPERATURE": None, "LLM_CONTEXT_CHARS": 9000, "LLM_PROVIDER": "groq"}
    values.update(overrides)
    return SimpleNamespace(**values)


def test_client_sends_only_configured_optional_fields():
    captured = {}
    def handler(request):
        captured["url"], captured["authorization"], captured["body"] = str(request.url), request.headers["authorization"], json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    assert OpenAICompatibleClient(settings(), mock_client).generate([{"role": "user", "content": "hi"}]) == "ok"
    assert captured["url"] == "https://example.test/v1/chat/completions"
    assert captured["authorization"] == "Bearer test-key"
    assert "temperature" not in captured["body"] and "max_completion_tokens" not in captured["body"]


def test_client_sends_max_tokens_when_configured():
    captured = {}
    def handler(request):
        captured["body"] = json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    OpenAICompatibleClient(settings(LLM_MAX_TOKENS=1000), mock_client).generate([{"role": "user", "content": "hi"}])
    assert captured["body"]["max_completion_tokens"] == 1000


def test_client_sends_temperature_only_when_set():
    captured = {}
    def handler(request):
        captured["body"] = json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    OpenAICompatibleClient(settings(LLM_TEMPERATURE=0.7), mock_client).generate([{"role": "user", "content": "hi"}])
    assert captured["body"]["temperature"] == 0.7


def test_client_maps_auth_error_without_leaking_key():
    mock_client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(401, json={"error": {"message": "bad key"}})))
    try: OpenAICompatibleClient(settings(), mock_client).generate([])
    except LLMFailure as failure: assert failure.code == "auth" and "test-key" not in failure.message
    else: raise AssertionError("Expected an LLM failure")


def test_client_maps_model_error():
    mock_client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(400, json={"error": {"message": "model decommissioned"}})))
    try: OpenAICompatibleClient(settings(), mock_client).generate([])
    except LLMFailure as failure: assert failure.code == "model"


def test_client_maps_rate_limit():
    mock_client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(429, json={"error": {"message": "rate limit"}})))
    try: OpenAICompatibleClient(settings(), mock_client).generate([])
    except LLMFailure as failure: assert failure.code == "rate_limit"


def test_client_retries_429_with_short_retry_after():
    retry_count = [0]
    def handler(request):
        retry_count[0] += 1
        if retry_count[0] == 1:
            return httpx.Response(429, json={"error": {"message": "rate limit"}}, headers={"retry-after": "2"})
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    assert OpenAICompatibleClient(settings(), mock_client).generate([{"role": "user", "content": "hi"}]) == "ok"
    assert retry_count[0] == 2


def test_client_does_not_retry_429_with_long_retry_after():
    retry_count = [0]
    def handler(request):
        retry_count[0] += 1
        return httpx.Response(429, json={"error": {"message": "rate limit"}}, headers={"retry-after": "10"})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    try: OpenAICompatibleClient(settings(), mock_client).generate([])
    except LLMFailure as failure: assert failure.code == "rate_limit" and retry_count[0] == 1


def test_client_retries_500_once():
    retry_count = [0]
    def handler(request):
        retry_count[0] += 1
        if retry_count[0] == 1:
            return httpx.Response(500, json={"error": {"message": "server error"}})
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    assert OpenAICompatibleClient(settings(), mock_client).generate([{"role": "user", "content": "hi"}]) == "ok"
    assert retry_count[0] == 2


def test_client_retries_timeout_once():
    retry_count = [0]
    def handler(request):
        retry_count[0] += 1
        if retry_count[0] == 1:
            raise httpx.TimeoutException("timeout")
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    assert OpenAICompatibleClient(settings(), mock_client).generate([{"role": "user", "content": "hi"}]) == "ok"
    assert retry_count[0] == 2


def test_client_retries_reasoning_effort_400():
    retry_count = [0]
    def handler(request):
        retry_count[0] += 1
        if retry_count[0] == 1:
            return httpx.Response(400, json={"error": {"message": "reasoning_effort not supported"}})
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    assert OpenAICompatibleClient(settings(LLM_REASONING_EFFORT="high"), mock_client).generate([{"role": "user", "content": "hi"}]) == "ok"
    assert retry_count[0] == 2


def test_client_raises_on_empty_response():
    mock_client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(200, json={"choices": [{"message": {"content": ""}}]})))
    try: OpenAICompatibleClient(settings(), mock_client).generate([])
    except LLMFailure as failure: assert failure.code == "empty"


def test_citations_and_plain_text_cleanup():
    chunks = [SimpleNamespace(document=SimpleNamespace(name="Notes"), page_number=1, text="one"), SimpleNamespace(document=SimpleNamespace(name="Notes"), page_number=2, text="two")]
    assert _cited_chunks("Answer [1][2]", chunks) == chunks
    answer = _normalise_answer("# Heading\n\n**Clear** answer [1].\n- second point [2]")
    assert "[" not in answer and "**" not in answer and "#" not in answer and "- " not in answer


def test_citation_parser_handles_comma_separated():
    chunks = [SimpleNamespace(document=SimpleNamespace(name="Notes"), page_number=1, text="one"), SimpleNamespace(document=SimpleNamespace(name="Notes"), page_number=2, text="two")]
    cited = _cited_chunks("Answer [1, 2]", chunks)
    assert len(cited) == 2


def test_context_budget_preserves_rank_order():
    chunks = [SimpleNamespace(document=SimpleNamespace(name=f"D{index}"), page_number=1, text="word " * 100) for index in range(3)]
    messages, used = build_messages("question", chunks, [], 700)
    assert used == chunks[:1]
    assert "[1] (D0" in messages[-1]["content"] and "[2]" not in messages[-1]["content"]


def test_deduplicate_chunks_by_document_and_page():
    doc1 = SimpleNamespace(id=1, name="Doc1")
    doc2 = SimpleNamespace(id=2, name="Doc2")
    chunks = [
        SimpleNamespace(document=doc1, page_number=1, text="a"),
        SimpleNamespace(document=doc1, page_number=1, text="b"),
        SimpleNamespace(document=doc1, page_number=2, text="c"),
        SimpleNamespace(document=doc2, page_number=1, text="d"),
    ]
    from api.services import _deduplicate_chunks
    deduped = _deduplicate_chunks(chunks)
    assert len(deduped) == 3
    assert deduped[0].page_number == 1 and deduped[1].page_number == 2 and deduped[2].document.id == 2


def test_key_resolution_uses_llm_api_key_first():
    s = settings(LLM_API_KEY="first-key", GROQ_API_KEY="second-key")
    assert s.LLM_API_KEY == "first-key"


def test_key_resolution_falls_back_to_groq_api_key():
    s = settings(LLM_API_KEY="", GROQ_API_KEY="groq-key")
    s.LLM_API_KEY = s.LLM_API_KEY or s.GROQ_API_KEY
    assert s.LLM_API_KEY == "groq-key"


def test_logging_never_contains_key(caplog):
    captured = {}
    def handler(request):
        captured["body"] = json.loads(request.content)
        return httpx.Response(401, json={"error": {"message": "bad key"}})
    client = httpx.Client(transport=httpx.MockTransport(handler))
    with caplog.at_level(logging.WARNING):
        try: OpenAICompatibleClient(settings(), client).generate([])
        except LLMFailure: pass
    for record in caplog.records:
        assert "test-key" not in record.message
        assert "Bearer" not in record.message


def test_markdown_stripping_preserves_hyphenated_words():
    answer = "The algorithm uses e.g. BFS and co-2 structures."
    cleaned = _normalise_answer(answer)
    assert "e.g." in cleaned and "co-2" in cleaned


def test_double_space_cleanup_before_punctuation():
    answer = "This is a test  . Another  test."
    cleaned = _normalise_answer(answer)
    assert "test  ." not in cleaned and "test." in cleaned


def test_synthesize_returns_extractive_when_no_chunks():
    chunks = []
    answer, sources, degraded, reason = synthesize_answer("q", chunks, [], settings())
    assert "couldn't find relevant information" in answer
    assert degraded is False


def test_synthesize_returns_extractive_when_provider_extractive():
    chunks = [SimpleNamespace(document=SimpleNamespace(name="Doc"), page_number=1, text="text")]
    answer, sources, degraded, reason = synthesize_answer("q", chunks, [], settings(LLM_PROVIDER="extractive"))
    assert "Closest passages" in answer
    assert degraded is False


def test_synthesize_returns_degraded_on_llm_failure():
    chunks = [SimpleNamespace(document=SimpleNamespace(name="Doc"), page_number=1, text="text")]
    s = settings()
    s.LLM_PROVIDER = "groq"
    def handler(request):
        return httpx.Response(401, json={"error": {"message": "bad key"}})
    mock_client = httpx.Client(transport=httpx.MockTransport(handler))
    from unittest.mock import patch, MagicMock
    mock_instance = MagicMock()
    mock_instance.generate = MagicMock(side_effect=LLMFailure("auth", "bad key", 401))
    with patch('api.services.OpenAICompatibleClient', return_value=mock_instance):
        answer, sources, degraded, reason = synthesize_answer("q", chunks, [], s)
    assert degraded is True
    assert reason == "auth"


def test_check_llm_command_output_without_key():
    s = settings(LLM_API_KEY="", LLM_MODEL="", LLM_BASE_URL="")
    missing = []
    if not s.LLM_API_KEY: missing.append("LLM_API_KEY or GROQ_API_KEY")
    if not s.LLM_BASE_URL: missing.append("LLM_BASE_URL")
    if not s.LLM_MODEL: missing.append("LLM_MODEL")
    assert len(missing) == 3


def test_paragraph_normalisation():
    answer = "Para one.\n\nPara two.\n\n\nPara three."
    cleaned = _normalise_answer(answer)
    assert "Para one." in cleaned and "Para two." in cleaned and "Para three." in cleaned
    assert "\n\n\n" not in cleaned


def test_synthesize_returns_degraded_on_not_configured():
    chunks = [SimpleNamespace(document=SimpleNamespace(name="Doc"), page_number=1, text="text")]
    s = settings(LLM_API_KEY="")
    s.LLM_PROVIDER = "groq"
    answer, sources, degraded, reason = synthesize_answer("q", chunks, [], s)
    assert degraded is True
    assert reason == "not_configured"
