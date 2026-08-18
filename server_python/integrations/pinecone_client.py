"""Pinecone client — vector store for RAG document retrieval.

Follows the same lazy-init, never-throw pattern as gemini.py: if
PINECONE_API_KEY is missing or Pinecone is unreachable, every function
returns an empty result and logs a warning. The assessment degrades to
its current behavior (no document context) rather than crashing.

Two namespaces:
  - report_id   : per-report document chunks (isolated per client)
  - _shared     : cross-report knowledge that grows with every published report
"""
import json
import logging
import os
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "conscious-orbit-docs")
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768
BATCH_SIZE = 100  # max texts per embedding API call
SHARED_NAMESPACE = "_shared"  # cross-report knowledge base

_pinecone_index = None
_initialized = False


def _pinecone_available():
    return bool(os.getenv("PINECONE_API_KEY"))


def get_pinecone_index():
    """Return the Pinecone index, creating it if it doesn't exist.

    Returns None if PINECONE_API_KEY is not set.
    """
    global _pinecone_index, _initialized

    if not _pinecone_available():
        return None

    if _initialized and _pinecone_index is not None:
        return _pinecone_index

    try:
        from pinecone import Pinecone
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

        # Create index if it doesn't exist
        existing = [idx.name for idx in pc.list_indexes()]
        if PINECONE_INDEX_NAME not in existing:
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=EMBEDDING_DIMENSIONS,
                metric="cosine",
                spec={"serverless": {"cloud": "aws", "region": "us-east-1"}},
            )

        _pinecone_index = pc.Index(PINECONE_INDEX_NAME)
        _initialized = True
        return _pinecone_index
    except Exception as e:
        logger.warning("Pinecone initialization failed: %s", e)
        _initialized = True  # don't retry on every call
        return None


def _gemini_embed(text: str) -> list[float]:
    """Embed a single text using the Gemini embedding REST API."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return []

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{EMBEDDING_MODEL}:embedContent?key={api_key}"
    payload = {
        "model": f"models/{EMBEDDING_MODEL}",
        "content": {"parts": [{"text": text}]},
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body.get("embedding", {}).get("values", [])
    except Exception as e:
        logger.warning("Gemini embedding failed: %s", e)
        return []


def embed_text(text: str) -> list[float]:
    """Embed a single text. Returns empty list on failure."""
    if not text or not text.strip():
        return []
    return _gemini_embed(text)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch embed texts. Processes in batches of BATCH_SIZE.

    Returns a list of embedding vectors (one per input text).
    Failed individual texts get an empty vector.
    """
    all_embeddings = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i:i + BATCH_SIZE]
        for text in batch:
            emb = _gemini_embed(text)
            all_embeddings.append(emb)
    return all_embeddings


def embed_and_store(chunks: list[str], doc_metadata: dict, report_id: str) -> int:
    """Embed chunks and upsert to Pinecone. Returns count of stored vectors.

    Each chunk gets metadata: {doc_id, report_id, category, filename,
    chunk_index, page_content}.

    Namespace = report_id for isolation between clients.
    Returns 0 on any failure (never raises).
    """
    index = get_pinecone_index()
    if not index or not chunks:
        return 0

    try:
        embeddings = embed_texts(chunks)
        vectors = []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            if not emb:
                continue
            vectors.append({
                "id": f"{doc_metadata['doc_id']}_chunk_{i}",
                "values": emb,
                "metadata": {
                    "doc_id": doc_metadata["doc_id"],
                    "report_id": report_id,
                    "category": doc_metadata.get("category", "SUPPORTING"),
                    "filename": doc_metadata.get("filename", "unknown"),
                    "chunk_index": i,
                    "page_content": chunk[:10000],  # Pinecone metadata value limit
                },
            })

        if not vectors:
            return 0

        # Upsert in batches of 100
        for i in range(0, len(vectors), 100):
            batch = vectors[i:i + 100]
            index.upsert(vectors=batch, namespace=report_id)

        return len(vectors)
    except Exception as e:
        logger.warning("Pinecone upsert failed: %s", e)
        return 0


def query_document_chunks(query: str, report_id: str, top_k: int = 8) -> list[dict]:
    """Query Pinecone for relevant chunks within a report's namespace.

    Returns list of dicts with 'metadata' and 'score' keys.
    Empty list on any failure.
    """
    index = get_pinecone_index()
    if not index or not query.strip():
        return []

    try:
        query_emb = embed_text(query)
        if not query_emb:
            return []

        results = index.query(
            namespace=report_id,
            vector=query_emb,
            top_k=top_k,
            include_metadata=True,
        )

        return [
            {"metadata": m.get("metadata", {}), "score": m.get("score", 0)}
            for m in results.get("matches", [])
        ]
    except Exception as e:
        logger.warning("Pinecone query failed: %s", e)
        return []


# ---------------------------------------------------------------------------
# Shared knowledge base — cross-report insights that grow over time
# ---------------------------------------------------------------------------

def index_report_to_shared_knowledge(report_json: dict, module_results: list) -> int:
    """Index a published report's insights into the shared knowledge base.

    Extracts key information from the report (intake data, module outputs,
    scores, decision) and stores them as searchable chunks. This builds a
    growing knowledge base that improves future assessments.

    Returns count of vectors stored, or 0 on failure.
    """
    index = get_pinecone_index()
    if not index:
        return 0

    report_id = report_json.get("id", "")
    if not report_id:
        return 0

    try:
        chunks = _extract_report_insights(report_json, module_results)
        if not chunks:
            return 0

        embeddings = embed_texts([c["text"] for c in chunks])
        vectors = []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            if not emb:
                continue
            vectors.append({
                "id": f"shared_{report_id}_{i}",
                "values": emb,
                "metadata": {
                    "report_id": report_id,
                    "source_type": chunk["source_type"],
                    "vertical": report_json.get("vertical", ""),
                    "stage": (report_json.get("client") or {}).get("stage", ""),
                    "score": report_json.get("score", 0),
                    "decision": report_json.get("decision"),
                    "page_content": chunk["text"][:10000],
                },
            })

        if not vectors:
            return 0

        for i in range(0, len(vectors), 100):
            batch = vectors[i:i + 100]
            index.upsert(vectors=batch, namespace=SHARED_NAMESPACE)

        logger.info("Indexed %d chunks from report %s into shared knowledge", len(vectors), report_id)
        return len(vectors)
    except Exception as e:
        logger.warning("Shared knowledge indexing failed for %s: %s", report_id, e)
        return 0


def _extract_report_insights(report_json: dict, module_results: list) -> list[dict]:
    """Extract searchable insight chunks from a report's data."""
    chunks = []
    report_id = report_json.get("id", "")
    vertical = report_json.get("vertical", "")
    name = report_json.get("name", "")

    # 1. Intake / clusters — the client's own words
    clusters = report_json.get("clusters") or {}
    for field in ("problem", "pain", "icp", "solution", "revenue", "margin"):
        value = clusters.get(field, "")
        if value and len(str(value).strip()) > 20:
            chunks.append({
                "text": f"Venture: {name} ({vertical}). {field}: {value}",
                "source_type": "intake",
            })

    # 2. Module outputs — the analysis engine's findings
    for mr in (module_results or []):
        output = mr.output if isinstance(mr.output, dict) else {}
        score = mr.score
        key = mr.module_key

        # Build a summary from the module output
        summary_parts = []
        for k, v in output.items():
            if v and isinstance(v, str) and len(v) > 10:
                summary_parts.append(f"{k}: {v}")
            elif v and isinstance(v, (int, float)):
                summary_parts.append(f"{k}: {v}")

        if summary_parts:
            text = f"Report {name} ({vertical}), module {key} (score {score}): " + "; ".join(summary_parts[:5])
            chunks.append({"text": text, "source_type": "module_output"})

    # 3. Final assessment — the outcome
    score = report_json.get("score", 0)
    decision = report_json.get("decision")
    admin_analysis = report_json.get("admin_analysis") or report_json.get("adminAnalysis") or ""
    if admin_analysis and len(admin_analysis) > 30:
        chunks.append({
            "text": f"Published report {name} ({vertical}): score {score}/100, decision {'GO' if decision == 1 else 'PIVOT'}. Analysis: {admin_analysis[:2000]}",
            "source_type": "assessment",
        })

    # 4. Orbita AI analysis — if available
    orbita = report_json.get("orbita_analysis") or report_json.get("orbitaAnalysis") or {}
    if isinstance(orbita, dict):
        analysis_text = orbita.get("analysis", "")
        if analysis_text and len(analysis_text) > 30:
            chunks.append({
                "text": f"AI analysis of {name} ({vertical}): {analysis_text[:2000]}",
                "source_type": "ai_analysis",
            })
        # Strengths and risks as separate searchable insights
        for item in (orbita.get("strengths") or [])[:3]:
            if item and len(str(item)) > 10:
                chunks.append({
                    "text": f"Strength in {name} ({vertical}): {item}",
                    "source_type": "strength",
                })
        for item in (orbita.get("risks") or [])[:3]:
            if item and len(str(item)) > 10:
                chunks.append({
                    "text": f"Risk in {name} ({vertical}): {item}",
                    "source_type": "risk",
                })

    return chunks


def query_shared_knowledge(query: str, vertical: str = "", top_k: int = 5) -> list[dict]:
    """Query the shared knowledge base for cross-report insights.

    Optionally filters by vertical. Returns relevant chunks from past reports.
    """
    index = get_pinecone_index()
    if not index or not query.strip():
        return []

    try:
        query_emb = embed_text(query)
        if not query_emb:
            return []

        filter_expr = {"vertical": vertical} if vertical else None
        query_kwargs = {
            "namespace": SHARED_NAMESPACE,
            "vector": query_emb,
            "top_k": top_k,
            "include_metadata": True,
        }
        if filter_expr:
            query_kwargs["filter"] = filter_expr

        results = index.query(**query_kwargs)

        return [
            {"metadata": m.get("metadata", {}), "score": m.get("score", 0)}
            for m in results.get("matches", [])
        ]
    except Exception as e:
        logger.warning("Shared knowledge query failed: %s", e)
        return []
