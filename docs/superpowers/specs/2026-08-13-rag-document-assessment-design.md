# RAG Document Assessment Design

**Date:** 2026-08-13
**Status:** Approved
**Approach:** Direct Pinecone + LangChain (Approach A)

## Problem

Documents uploaded by clients (pitch decks, financials, market research) are stored as opaque blobs. The AI assessment only sees metadata (filename, category, size) — never the actual content. This means the AI generates assessments based on module scores and client-reported data alone, without grounding in the evidence the client actually provided.

## Goal

Build a RAG (Retrieval-Augmented Generation) pipeline that:
1. Extracts text from uploaded documents on upload
2. Chunks and embeds the text into Pinecone
3. Retrieves relevant chunks when generating AI assessments
4. Injects retrieved document evidence into the Gemini prompt for grounded analysis

## Architecture

```
Upload Flow:
  Client uploads doc → documents.py saves file to uploads/
    → extract_text() parses content by type
    → chunk_text() splits into 1000-char chunks with 200-char overlap
    → embed_chunks() calls Gemini embedding API
    → upsert to Pinecone index (namespace = report_id)
    → mark document as indexed in PostgreSQL

Assessment Flow:
  Admin triggers assessment → assessment.py gathers report data
    → build RAG query from report clusters + module outputs
    → query Pinecone (top-K=8 chunks, namespace=report_id)
    → format retrieved chunks as context block
    → inject into existing Gemini assessment prompt
    → Gemini generates assessment with document-grounded analysis
```

## Components

### 1. Document Processor (`server_python/integrations/document_processor.py`)

**New file.** Handles text extraction and chunking.

```
extract_text(file_path, content_type) -> str
  - .pdf → PyPDF2
  - .docx → python-docx (already in requirements)
  - .txt/.md → plain read
  - .csv → read as text with headers
  - .xls/.xlsx → openpyxl, extract cell text
  - .ppt/.pptx → python-pptx, extract slide text
  - Returns empty string on failure (degrades gracefully)

chunk_text(text, chunk_size=1000, chunk_overlap=200) -> list[str]
  - Uses LangChain's RecursiveCharacterTextSplitter
  - Separators: ["\n\n", "\n", ". ", " ", ""]
  - Returns list of text chunks

PROCESSABLE_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
}
```

### 2. Pinecone Client (`server_python/integrations/pinecone_client.py`)

**New file.** Pinecone + Gemini embedding integration.

```python
PINECONE_INDEX = "conscious-orbit-docs"
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768

def get_pinecone_index():
    """Returns Pinecone index, creating it if needed. Lazy init."""

def embed_text(text: str) -> list[float]:
    """Embed single text via Gemini embedding REST API."""

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch embed texts (batches of 100)."""

def embed_and_store(chunks, doc_metadata, report_id):
    """Embed chunks and upsert to Pinecone with metadata.
    Namespace = report_id for isolation.
    Metadata per chunk: {doc_id, report_id, category, filename, chunk_index, page_content}
    """

def query_document_chunks(query: str, report_id: str, top_k: int = 8) -> list[dict]:
    """Query Pinecone for relevant chunks within a report's namespace."""
```

**Lazy initialization pattern** (matches `gemini.py`):
- If `PINECONE_API_KEY` is not set, all functions return empty/None and log a warning
- No crash, no exception — degrade gracefully

### 3. Assessment Enhancement (`server_python/integrations/report_ai.py`)

**Modified file.** Add RAG context retrieval before prompt construction.

```python
def _build_rag_context(report_json, module_results, pinecone_index) -> str:
    """Build search query from report data, retrieve relevant doc chunks."""
    query_parts = [
        report_json.get("clusters", {}).get("problem", ""),
        report_json.get("clusters", {}).get("pain", ""),
        report_json.get("clusters", {}).get("icp", ""),
        report_json.get("name", ""),
        report_json.get("vertical", ""),
    ]
    query = " ".join(p for p in query_parts if p)
    
    if not query.strip():
        return ""
    
    results = query_document_chunks(query, report_json["id"], top_k=8)
    
    if not results:
        return ""
    
    context_parts = []
    for r in results:
        meta = r.get("metadata", {})
        context_parts.append(
            f"[Source: {meta.get('filename', 'unknown')} "
            f"({meta.get('category', 'unknown')})]\n"
            f"{meta.get('page_content', '')}"
        )
    
    return "\n\n---\n\n".join(context_parts)
```

**Prompt modification:** Add `DOCUMENT EVIDENCE` section to the user prompt:

```
DOCUMENT EVIDENCE (retrieved from uploaded documents):
{rag_context}

Use the document evidence above to ground your analysis. When you reference
a document, cite the filename. If document evidence contradicts client claims,
flag the discrepancy. If no document evidence is available, note this in your
analysis.
```

**Fallback:** If Pinecone is unavailable or no chunks retrieved, the prompt proceeds without document evidence — same behavior as today.

### 4. Upload Integration (`server_python/routers/documents.py`)

**Modified file.** Call processor after saving file to disk.

```python
# After saving file to uploads/ and creating the Document record:
if content_type in PROCESSABLE_TYPES:
    try:
        text = extract_text(saved_path, content_type)
        if text:
            chunks = chunk_text(text)
            embed_and_store(chunks, doc_meta, report_id)
            mark_document_indexed(doc_id, len(chunks))
    except Exception as e:
        logger.warning(f"RAG indexing failed for {filename}: {e}")
        # Upload still succeeds — RAG failure is non-blocking
```

### 5. Database Changes (`server_python/models.py`)

**Modified file.** Add indexing status columns to `DocumentModel`:

```python
indexed = Column(Boolean, default=False)
chunk_count = Column(Integer, default=0)
```

**Migration note:** `create_all()` only creates missing tables, never adds columns. For existing databases, run:
```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS indexed BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS chunk_count INTEGER DEFAULT 0;
```

### 6. Dependencies (`server_python/requirements.txt`)

**Modified file.** Add:

```
langchain>=0.3.0
langchain-pinecone>=0.2.0
langchain-google-genai>=2.0.0
pinecone-client>=5.0.0
PyPDF2>=3.0.0
openpyxl>=3.1.0
python-pptx>=1.0.0
```

### 7. Environment Variables (`.env.example`)

**Modified file.** Add:

```
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=conscious-orbit-docs
```

## Error Handling

All integrations degrade gracefully (matches existing pattern):

| Failure | Behavior |
|---------|----------|
| No `PINECONE_API_KEY` | Log warning, skip RAG, assessment proceeds without doc context |
| Pinecone unreachable | Catch, log, degrade — assessment works as before |
| Document extraction fails | Log warning, mark doc as un-indexed, upload succeeds |
| Embedding API fails | Catch, log, skip that batch |
| Empty namespace (no docs for report) | Assessment proceeds without doc context |
| Corrupt/empty PDF | Returns empty string, no chunks created |

## Pinecone Index Configuration

- **Index name:** `conscious-orbit-docs`
- **Dimension:** 768 (Gemini embedding-001)
- **Metric:** cosine
- **Namespace:** report_id (isolates each client's documents)
- **Metadata per vector:** `{doc_id, report_id, category, filename, chunk_index, page_content}`

## Files Summary

| File | Action | Lines (est.) |
|------|--------|-------------|
| `server_python/integrations/document_processor.py` | **New** | ~120 |
| `server_python/integrations/pinecone_client.py` | **New** | ~100 |
| `server_python/integrations/report_ai.py` | **Modify** | +40 |
| `server_python/routers/documents.py` | **Modify** | +25 |
| `server_python/models.py` | **Modify** | +4 |
| `server_python/requirements.txt` | **Modify** | +7 |
| `server_python/.env.example` | **Modify** | +2 |
| `scratchpad/verify_rag.py` | **New** | ~60 |

## Verification

Write `scratchpad/verify_rag.py` that:
1. Creates a test PDF with known content
2. Calls `extract_text()` and verifies text extraction
3. Calls `chunk_text()` and verifies chunk count
4. Calls `embed_and_store()` and verifies Pinecone upsert
5. Calls `query_document_chunks()` and verifies retrieval
6. Prints results for manual inspection

No automated test framework exists in this repo — verification is manual via scratch scripts, matching the project's established pattern.
