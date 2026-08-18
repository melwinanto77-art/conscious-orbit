# RAG Document Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a RAG pipeline that extracts text from uploaded documents, embeds them into Pinecone, and retrieves relevant chunks to ground AI assessment generation.

**Architecture:** Document upload triggers text extraction, chunking, Gemini embedding, and Pinecone storage. At assessment time, a query built from report data retrieves top-K chunks which are injected into the Gemini prompt as document evidence.

**Tech Stack:** LangChain (text splitting), Pinecone (vector store), Gemini embeddings (REST API), PyPDF2/openpyxl/python-pptx (text extraction), existing Gemini REST client.

## Global Constraints

- Python 3.11+, FastAPI, SQLAlchemy 2.0
- All integrations degrade gracefully - no PINECONE_API_KEY means no crash, just no RAG
- JSON columns in SQLAlchemy must be reassigned, never mutated in place
- Follow existing gemini.py lazy-init pattern for Pinecone client
- Chunk size: 1000 chars, overlap: 200
- Embedding model: models/gemini-embedding-001 (768 dimensions)
- Pinecone index: conscious-orbit-docs, namespace per report_id
- Top-K: 8 chunks per assessment query

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| server_python/integrations/document_processor.py | Create | Text extraction + chunking |
| server_python/integrations/pinecone_client.py | Create | Pinecone init, embedding, upsert, query |
| server_python/integrations/report_ai.py | Modify | Add _build_rag_context(), inject into prompt |
| server_python/routers/documents.py | Modify | Call processor after file save |
| server_python/models.py | Modify | Add indexed, chunk_count columns |
| server_python/requirements.txt | Modify | Add 7 new dependencies |
| server_python/.env.example | Modify | Add Pinecone env vars |
| scratchpad/verify_rag.py | Create | End-to-end verification script |

---

### Task 1: Add dependencies and environment variables

**Files:**
- Modify: server_python/requirements.txt
- Modify: server_python/.env.example

**Interfaces:**
- Consumes: nothing
- Produces: installable dependencies, env vars for downstream tasks

- [ ] **Step 1: Add dependencies to requirements.txt**

Append to server_python/requirements.txt:

```
# RAG pipeline - document processing, embedding, and vector search
langchain>=0.3.0
langchain-text-splitters>=0.3.0
pinecone-client>=5.0.0
PyPDF2>=3.0.0
openpyxl>=3.1.0
python-pptx>=1.0.0
```

- [ ] **Step 2: Add environment variables to .env.example**

Append to server_python/.env.example:

```
# --- RAG / Vector search (Pinecone) ---------------------------
# Without these, document upload works normally but the AI assessment
# cannot ground its analysis in uploaded document content.
PINECONE_API_KEY=
PINECONE_INDEX_NAME=conscious-orbit-docs
```

- [ ] **Step 3: Install dependencies**

Run: `cd server_python && pip install -r requirements.txt`
Expected: All packages install successfully.

- [ ] **Step 4: Commit**

```bash
git add server_python/requirements.txt server_python/.env.example
git commit -m "feat(rag): add RAG dependencies and env vars"
```

---

### Task 2: Create the document processor

**Files:**
- Create: server_python/integrations/document_processor.py

**Interfaces:**
- Consumes: file path, MIME content type string
- Produces: extract_text(path, content_type) -> str, chunk_text(text) -> list[str], PROCESSABLE_TYPES set

- [ ] **Step 1: Create document_processor.py with extract_text**

Create server_python/integrations/document_processor.py with the full content shown in the spec (Task 2 of the design doc). The file includes:
- PROCESSABLE_TYPES set (10 MIME types)
- extract_text() dispatcher that routes to type-specific extractors
- _extract_pdf, _extract_docx, _extractPlainText, _extract_csv, _extract_xlsx, _extract_pptx
- Legacy .doc/.xls/.ppt best-effort wrappers
- All extractors catch exceptions and return empty string on failure

- [ ] **Step 2: Add chunk_text function**

Append to the same file:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

_text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""],
    length_function=len,
)


def chunk_text(text: str) -> list[str]:
    if not text or not text.strip():
        return []
    return [chunk for chunk in _text_splitter.split_text(text) if chunk.strip()]
```

- [ ] **Step 3: Verify extraction works**

Run: `cd server_python && python -c "from integrations.document_processor import extract_text, chunk_text, PROCESSABLE_TYPES; print('PROCESSABLE_TYPES:', len(PROCESSABLE_TYPES)); print('chunk_text works:', len(chunk_text('Hello world. This is a test.')))"`

Expected output: PROCESSABLE_TYPES: 10, chunk_text works: 1

- [ ] **Step 4: Commit**

```bash
git add server_python/integrations/document_processor.py
git commit -m "feat(rag): add document text extraction and chunking"
```

---

### Task 3: Create the Pinecone client

**Files:**
- Create: server_python/integrations/pinecone_client.py

**Interfaces:**
- Consumes: PINECONE_API_KEY env var, Gemini API key (via GEMINI_API_KEY env)
- Produces: get_pinecone_index(), embed_text(text), embed_texts(texts), embed_and_store(chunks, doc_metadata, report_id), query_document_chunks(query, report_id, top_k)

- [ ] **Step 1: Create pinecone_client.py**

Create server_python/integrations/pinecone_client.py with the full content shown in the spec (Task 3 of the design doc). The file includes:
- Lazy Pinecone index initialization with auto-creation
- _gemini_embed() using Gemini REST API (matches gemini.py pattern)
- embed_text(), embed_texts() with BATCH_SIZE=100
- embed_and_store() with metadata per vector and namespace isolation
- query_document_chunks() returning list of dicts
- All functions return empty/0 on failure (never raises)

- [ ] **Step 2: Verify module imports**

Run: `cd server_python && python -c "from integrations.pinecone_client import embed_text, embed_and_store, query_document_chunks, get_pinecone_index; print('Pinecone client module OK')"`

Expected: Pinecone client module OK

- [ ] **Step 3: Commit**

```bash
git add server_python/integrations/pinecone_client.py
git commit -m "feat(rag): add Pinecone client with Gemini embedding"
```

---

### Task 4: Update DocumentModel with indexing fields

**Files:**
- Modify: server_python/models.py (DocumentModel class, lines 209-241)

**Interfaces:**
- Consumes: nothing
- Produces: DocumentModel.indexed (Boolean), DocumentModel.chunk_count (Integer), updated to_json()

- [ ] **Step 1: Add Boolean import**

On line 11 of models.py, add Boolean to the sqlalchemy import:

```python
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text, UniqueConstraint, Boolean
```

- [ ] **Step 2: Add columns to DocumentModel**

After the uploaded_by column (line 226), before created_at (line 227), add:

```python
    indexed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
```

- [ ] **Step 3: Add fields to to_json()**

In DocumentModel.to_json(), after the 'note' field and before 'uploadedBy', add:

```python
            'indexed': self.indexed or False,
            'chunkCount': self.chunk_count or 0,
```

- [ ] **Step 4: Verify model loads**

Run: `cd server_python && python -c "from models import DocumentModel; print('indexed col:', DocumentModel.indexed); print('chunk_count col:', DocumentModel.chunk_count)"`

Expected: Both columns print as Column objects.

- [ ] **Step 5: Commit**

```bash
git add server_python/models.py
git commit -m "feat(rag): add indexed and chunk_count fields to DocumentModel"
```

---

### Task 5: Integrate document processor into upload flow

**Files:**
- Modify: server_python/routers/documents.py (upload_document function, lines 43-92)

**Interfaces:**
- Consumes: extract_text, chunk_text from document_processor; embed_and_store from pinecone_client
- Produces: documents are indexed on upload; doc.indexed and doc.chunk_count are set

- [ ] **Step 1: Add imports**

Add at the top of server_python/routers/documents.py after the existing imports:

```python
import logging
from integrations.document_processor import extract_text, chunk_text, PROCESSABLE_TYPES
from integrations.pinecone_client import embed_and_store
```

- [ ] **Step 2: Add logger**

After the imports, add:

```python
logger = logging.getLogger(__name__)
```

- [ ] **Step 3: Add RAG indexing after document save**

In the upload_document function, replace the db.refresh(doc) and return block (lines 91-92) with:

```python
    db.refresh(doc)

    # RAG indexing - extract text, chunk, embed, store in Pinecone.
    # Non-blocking: failures are logged but upload always succeeds.
    if file.content_type in PROCESSABLE_TYPES:
        try:
            saved_path = str(UPLOAD_DIR / stored_name)
            text = extract_text(saved_path, file.content_type)
            if text:
                chunks = chunk_text(text)
                if chunks:
                    doc_meta = {
                        "doc_id": doc.id,
                        "filename": original,
                        "category": doc.category,
                    }
                    stored = embed_and_store(chunks, doc_meta, reportId or "")
                    doc.indexed = stored > 0
                    doc.chunk_count = stored
                    db.commit()
        except Exception as e:
            logger.warning("RAG indexing failed for %s: %s", original, e)

    return {"document": doc.to_json()}
```

- [ ] **Step 4: Verify the router still loads**

Run: `cd server_python && python -c "from routers.documents import router; print('documents router OK, routes:', len(router.routes))"`

Expected: documents router OK, routes: 4

- [ ] **Step 5: Commit**

```bash
git add server_python/routers/documents.py
git commit -m "feat(rag): trigger RAG indexing on document upload"
```

---

### Task 6: Enhance AI assessment with RAG context

**Files:**
- Modify: server_python/integrations/report_ai.py (generate_report_assessment function)

**Interfaces:**
- Consumes: query_document_chunks from pinecone_client
- Produces: _build_rag_context() function; modified generate_report_assessment() includes document evidence in prompt

- [ ] **Step 1: Add import**

Add at the top of server_python/integrations/report_ai.py after the existing imports:

```python
from integrations.pinecone_client import query_document_chunks
```

- [ ] **Step 2: Add _build_rag_context function**

Add this function before generate_report_assessment (before line 127):

```python
def _build_rag_context(report_json: dict, module_results: list) -> str:
    clusters = report_json.get("clusters") or {}
    query_parts = [
        clusters.get("problem", ""),
        clusters.get("pain", ""),
        clusters.get("icp", ""),
        report_json.get("name", ""),
        report_json.get("vertical", ""),
    ]
    query = " ".join(p for p in query_parts if p)

    if not query.strip():
        return ""

    results = query_document_chunks(query, report_json.get("id", ""), top_k=8)

    if not results:
        return ""

    context_parts = []
    for r in results:
        meta = r.get("metadata", {})
        content = meta.get("page_content", "")
        if not content:
            continue
        context_parts.append(
            f"[Source: {meta.get('filename', 'unknown')} "
            f"({meta.get('category', 'unknown')})]\n"
            f"{content}"
        )

    return "\n\n---\n\n".join(context_parts)
```

- [ ] **Step 3: Modify generate_report_assessment to use RAG context**

Replace the user_prompt construction block (lines 148-178) with:

```python
    rag_context = _build_rag_context(report_json, module_results or [])

    prompt_parts = [
        f"# Venture: {report_json.get('name')}",
        f"Vertical: {report_json.get('vertical')} | Stage: {client.get('stage')} | "
        f"Business model: {client.get('businessModel')} | Geography: {client.get('geography')}",
        "",
        "## Evidence quality (computed, not self-reported)",
        f"Intake completeness: {evidence['completeness']}%",
        f"Narrative detail: {evidence['words']} words "
        f"({'sufficient' if evidence['enriched'] else 'THIN - under the 50-word threshold'})",
        f"Modules completed: {len(modules)} of 10",
        "",
        "## What the client told us",
        "```json",
        _pretty(clusters),
        "```",
        "",
        "## Pipeline module scores and their computed outputs",
        "Audit these: does each score follow from its own output data?",
        "```json",
        _pretty(modules),
        "```",
        "",
        "## Supporting documents the client uploaded",
        _pretty(documents or []) if documents else "None uploaded - no third-party evidence to corroborate claims.",
        "",
    ]

    if rag_context:
        prompt_parts.extend([
            "## Document evidence (retrieved from uploaded files)",
            rag_context,
            "",
            "Use the document evidence above to ground your analysis. When you reference",
            "a document, cite the filename. If document evidence contradicts client claims,",
            "flag the discrepancy.",
            "",
        ])

    prompt_parts.extend([
        "## Indian Brand Equity assessment",
        _pretty(brand_equity) if brand_equity else "Not submitted.",
        "",
        "Produce your assessment. The administrator will weigh it against their own judgement "
        "before deciding the published mark.",
    ])

    user_prompt = "\n".join(prompt_parts)
```

- [ ] **Step 4: Verify module loads**

Run: `cd server_python && python -c "from integrations.report_ai import generate_report_assessment, _build_rag_context; print('report_ai module OK')"`

Expected: report_ai module OK

- [ ] **Step 5: Commit**

```bash
git add server_python/integrations/report_ai.py
git commit -m "feat(rag): inject retrieved document chunks into AI assessment prompt"
```

---

### Task 7: Write verification script

**Files:**
- Create: scratchpad/verify_rag.py

**Interfaces:**
- Consumes: all functions from Tasks 2-6
- Produces: manual verification output

- [ ] **Step 1: Create verify_rag.py**

Create scratchpad/verify_rag.py that:
1. Creates a temp .txt file with known content, calls extract_text, verifies text is extracted
2. Calls chunk_text on long text, verifies chunk count and max size
3. If GEMINI_API_KEY is set, calls embed_text, verifies a list of floats is returned
4. If PINECONE_API_KEY is set, calls get_pinecone_index, embed_and_store, query_document_chunks round-trip
5. Prints PASS/FAIL for each test

- [ ] **Step 2: Run verification**

Run: `cd server_python && python ../scratchpad/verify_rag.py`

Expected: All tests pass (Pinecone tests skip gracefully if keys are not set).

- [ ] **Step 3: Commit**

```bash
git add scratchpad/verify_rag.py
git commit -m "feat(rag): add RAG pipeline verification script"
```
