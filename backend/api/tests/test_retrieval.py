from types import SimpleNamespace

from api.services import chunk_text, extractive_fallback, score_chunk


def test_chunking_keeps_large_text_bounded():
    chunks = chunk_text("Circular queue uses a ring buffer.\n\n" * 100, target_size=120, overlap=20)
    assert chunks
    assert max(len(chunk) for chunk in chunks) <= 140


def test_circular_queue_ranks_above_unrelated_text():
    relevant = "A circular queue is a queue in which the last position connects back to the first."
    unrelated = "The data link layer detects frames and handles physical addressing."
    assert score_chunk("what is circular queue", relevant) > score_chunk("what is circular queue", unrelated)


def test_fallback_is_concise_and_grounded():
    chunk = SimpleNamespace(text="A circular queue is a queue in which the last position connects back to the first.")
    answer = extractive_fallback([chunk])
    assert answer.startswith("Closest passages in your library:")
    assert "last position connects back" in answer


def test_unrelated_question_does_not_receive_context_dump():
    chunk = SimpleNamespace(text="A circular queue reuses buffer space by wrapping indices.")
    answer = extractive_fallback([])
    assert "couldn't find relevant information" in answer
