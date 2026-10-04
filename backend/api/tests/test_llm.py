from types import SimpleNamespace
import json

import httpx

from api.services import LLMFailure, OpenAICompatibleClient, _cited_chunks, _normalise_answer, build_messages


def settings(**overrides):
    values = {"LLM_API_KEY": "test-key", "LLM_MODEL": "test-model", "LLM_BASE_URL": "https://example.test/v1", "LLM_TIMEOUT_SECONDS": 2, "LLM_MAX_TOKENS": None, "LLM_REASONING_EFFORT": "", "LLM_TEMPERATURE": None, "LLM_CONTEXT_CHARS": 9000}
    values.update(overrides)
    return SimpleNamespace(**values)


def test_client_sends_only_configured_optional_fields():
    captured = {}
    def handler(request):
        captured["url"], captured["authorization"], captured["body"] = str(request.url), request.headers["authorization"], json.loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})
    client = httpx.Client(transport=httpx.MockTransport(handler))
    assert OpenAICompatibleClient(settings(), client).generate([{"role": "user", "content": "hi"}]) == "ok"
    assert captured["url"] == "https://example.test/v1/chat/completions"
    assert captured["authorization"] == "Bearer test-key"
    assert "temperature" not in captured["body"] and "max_completion_tokens" not in captured["body"]


def test_client_maps_auth_error_without_leaking_key():
    client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(401, json={"error": {"message": "bad key"}})))
    try: OpenAICompatibleClient(settings(), client).generate([])
    except LLMFailure as failure: assert failure.code == "auth" and "test-key" not in failure.message
    else: raise AssertionError("Expected an LLM failure")


def test_citations_and_plain_text_cleanup():
    chunks = [SimpleNamespace(document=SimpleNamespace(name="Notes"), page_number=1, text="one"), SimpleNamespace(document=SimpleNamespace(name="Notes"), page_number=2, text="two")]
    assert _cited_chunks("Answer [1][2]", chunks) == chunks
    answer = _normalise_answer("# Heading\n\n**Clear** answer [1].\n- second point [2]")
    assert "[" not in answer and "**" not in answer and "#" not in answer and "- " not in answer


def test_context_budget_preserves_rank_order():
    chunks = [SimpleNamespace(document=SimpleNamespace(name=f"D{index}"), page_number=1, text="word " * 100) for index in range(3)]
    messages, used = build_messages("question", chunks, [], 700)
    assert used == chunks[:1]
    assert "[1] (D0" in messages[-1]["content"] and "[2]" not in messages[-1]["content"]
