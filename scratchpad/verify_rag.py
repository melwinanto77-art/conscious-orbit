"""Verify the RAG pipeline end-to-end.

Run: cd server_python && python ../scratchpad/verify_rag.py

Tests:
1. Text extraction from a sample text file
2. Chunking produces expected count
3. Pinecone client initializes (requires PINECONE_API_KEY)
4. Embedding produces a vector
5. Full round-trip: store chunks, query, retrieve

Set PINECONE_API_KEY and GEMINI_API_KEY in server_python/.env to run
the Pinecone-dependent tests. Without them, only extraction/chunking
are verified.
"""
import os
import sys
import tempfile
from pathlib import Path

# Add server_python to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "server_python"))

from integrations.document_processor import extract_text, chunk_text, PROCESSABLE_TYPES
from integrations.pinecone_client import (
    get_pinecone_index,
    embed_text,
    embed_and_store,
    query_document_chunks,
)


def test_extraction():
    """Test text extraction from a plain text file."""
    print("=== Test 1: Text extraction ===")
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("This is a test document about fintech startups in India.\n"
                "The market size is $50 billion and growing at 25% CAGR.\n"
                "Key competitors include Paytm, PhonePe and Google Pay.")
        tmp_path = f.name

    try:
        text = extract_text(tmp_path, "text/plain")
        assert text, "Extraction returned empty string"
        assert "fintech" in text.lower(), "Expected content not found"
        print(f"  PASS: extracted {len(text)} chars")
        print(f"  Preview: {text[:100]}...")
    finally:
        os.unlink(tmp_path)


def test_chunking():
    """Test chunking produces reasonable output."""
    print("\n=== Test 2: Chunking ===")
    text = "Hello world. " * 200  # ~2600 chars
    chunks = chunk_text(text)
    assert len(chunks) >= 2, f"Expected >=2 chunks, got {len(chunks)}"
    assert all(len(c) <= 1200 for c in chunks), "Chunk exceeds max size"
    print(f"  PASS: {len(text)} chars -> {len(chunks)} chunks")
    for i, c in enumerate(chunks[:3]):
        print(f"  Chunk {i}: {len(c)} chars")


def test_embedding():
    """Test Gemini embedding produces a vector."""
    print("\n=== Test 3: Embedding ===")
    if not os.getenv("GEMINI_API_KEY"):
        print("  SKIP: GEMINI_API_KEY not set")
        return
    emb = embed_text("This is a test embedding.")
    assert isinstance(emb, list), f"Expected list, got {type(emb)}"
    assert len(emb) > 0, "Embedding is empty"
    assert all(isinstance(v, float) for v in emb), "Embedding contains non-float values"
    print(f"  PASS: got {len(emb)}-dimensional vector")


def test_pinecone_roundtrip():
    """Test full round-trip: store chunks, query, retrieve."""
    print("\n=== Test 4: Pinecone round-trip ===")
    if not os.getenv("PINECONE_API_KEY"):
        print("  SKIP: PINECONE_API_KEY not set")
        return
    if not os.getenv("GEMINI_API_KEY"):
        print("  SKIP: GEMINI_API_KEY not set (needed for embedding)")
        return

    index = get_pinecone_index()
    if not index:
        print("  SKIP: Pinecone index not available")
        return

    test_report_id = "test_report_verify_rag"
    test_doc_id = "doc_test_verify"
    chunks = [
        "India's fintech market is worth $50 billion and growing rapidly.",
        "Paytm dominates with 300 million users, followed by PhonePe.",
        "Google Pay is gaining market share through UPI integration.",
    ]
    doc_meta = {"doc_id": test_doc_id, "filename": "test.txt", "category": "MARKET_RESEARCH"}

    # Store
    stored = embed_and_store(chunks, doc_meta, test_report_id)
    print(f"  Stored {stored} vectors")
    assert stored > 0, "No vectors stored"

    # Query
    results = query_document_chunks("fintech market size India", test_report_id, top_k=3)
    print(f"  Retrieved {len(results)} chunks")
    assert len(results) > 0, "No results retrieved"
    assert any("fintech" in r.get("metadata", {}).get("page_content", "").lower()
               for r in results), "Expected fintech content in results"

    print("  PASS: round-trip successful")
    for r in results:
        meta = r.get("metadata", {})
        print(f"    [{r.get('score', 0):.3f}] {meta.get('filename', '?')}: "
              f"{meta.get('page_content', '')[:80]}...")


def main():
    print("RAG Pipeline Verification\n")
    passed = 0
    total = 0

    for test_fn in [test_extraction, test_chunking, test_embedding, test_pinecone_roundtrip]:
        total += 1
        try:
            test_fn()
            passed += 1
        except AssertionError as e:
            print(f"  FAIL: {e}")
        except Exception as e:
            print(f"  ERROR: {e}")

    print(f"\n{'='*40}")
    print(f"Results: {passed}/{total} tests passed")
    if passed == total:
        print("All tests passed!")
    else:
        print("Some tests failed or were skipped.")
        sys.exit(1)


if __name__ == "__main__":
    main()
