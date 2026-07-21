var e=`I searched my own notes.

Query: *"how do I make the agent remember previous turns"*

Lexical search returned nothing.  
Vector search found it instantly.

That made me build a proper test.

---

## The setup

I have 10 markdown files — my personal LangChain study notes covering agents, memory, RAG, multimodal input, dynamic system prompts, custom middleware, and model selection.

I indexed them three ways:

- **Lexical search** — Postgres full-text search (\`tsvector\`, \`ts_rank\`, GIN index)
- **Vector search** — pgvector + OpenAI \`text-embedding-3-small\`
- **Hybrid search** — Reciprocal Rank Fusion (RRF) of both

Then ran 15 hand-crafted queries across three buckets: exact, semantic, and ambiguous.

---

## What each method actually does

**Lexical search** matches words literally. You search "custom middleware" — it finds documents containing "custom" and "middleware." Under the hood, text is tokenized, stemmed, and stop-words are removed. Stored as a \`tsvector\`. \`ts_rank\` scores by how often and where terms appear. Fast, predictable, zero ML involved. It has no idea what words mean — only that they exist.

**Vector search** matches meaning, not words. Your query is converted to a 1536-dimensional vector. Every document chunk is also a vector. Similarity is cosine distance between them. "How do I make the agent remember previous turns" finds a chunk about "memory" and "message history" even though none of those words appear in the query. It has no idea what exact words you used — only what you meant.

**Hybrid search (RRF)** combines both ranked lists. Each result gets a score of \`1 / (k + rank)\` from each method (k=60 default), summed across both, then re-sorted. No training, no tuning — just fusion.

---

## The results

| Bucket | Lexical hit@5 | Vector hit@5 | Hybrid hit@5 |
|---|---|---|---|
| Exact | 1.00 | 1.00 | 1.00 |
| Semantic | **0.00** | 1.00 | 1.00 |
| Ambiguous | 0.20 | **1.00** | 0.80 |

The 0.00 on semantic queries is not a typo. Lexical search found nothing useful for every single paraphrased question.

---

## Finding 1 — Lexical completely fails on semantic queries

Every semantic query in the test set returned nothing from lexical search:

- "how do I send an image along with text to the model" → **nothing** (should find: 2.4 Multimodal Input)
- "when should I use a cheaper model first then fallback" → **nothing** (should find: 2.7 Custom Model Selection)
- "how can the app adapt instructions for different users" → **nothing** (should find: 2.6 Dynamic System Prompt)

These aren't obscure queries. They're how a real user would describe what they want. If your users think in natural language, lexical search will miss them consistently.

---

## Finding 2 — Exact queries are a three-way tie

All three methods hit 1.00 on exact queries. This challenges the common narrative that vector search struggles on precise technical terms. On this corpus, searching "create_retriever_tool", "ToolRuntime context_schema", or "structured response" — vector search found the right chunk just as reliably as lexical.

The practical implication: on exact queries, you don't get better results from vector search, but you also don't get worse ones. The cost difference (embedding API call vs SQL query) matters here. Lexical is free. Vector costs a call.

---

## Finding 3 — Hybrid doesn't always beat vector alone

This is the most honest finding and the one most "hybrid search is always better" posts miss.

On ambiguous queries, hybrid hit@5 was **0.80** while vector alone hit **1.00**.

When lexical returns a wrong result, RRF pulls that wrong result upward — and dilutes the correct vector ranking. A concrete example:

> Query: "what can middleware change before or after a model call"

| Method | Top result |
|---|---|
| Lexical | Overview.md (wrong) |
| Vector | 2.8 Custom Middleware.md ✓ |
| Hybrid | 2.6 Dynamic System Prompt (neither) |

Hybrid wins on average. Not on every query. A bad lexical signal actively hurts fusion on individual cases. This is why more sophisticated systems weight the two sides dynamically rather than treating them as equal RRF inputs.

---

## When to use which

**Use lexical when:**
- Users search with technical terms, IDs, function names, or code snippets
- Exact recall is non-negotiable (legal, compliance, code search)
- Cost and latency matter more than fuzzy matching

**Use vector when:**
- Users describe what they want in plain language
- Paraphrase and intent matter more than exact wording
- Your queries are conceptual rather than keyword-driven

**Use hybrid when:**
- You don't know which pattern your users will follow
- As a safe default — but weight vector higher when exact terms are unlikely in your domain
- When you have enough queries to tune RRF weights (flat 60/40 isn't always optimal)

**Use lexical first, vector as fallback when:**
- Exact recall is the primary constraint
- You want deterministic results for known-good queries with semantic fallback for the rest

---

## Stack

- Postgres 16 + pgvector (Docker)
- FastAPI backend with \`/search/lexical\`, \`/search/vector\`, \`/search/hybrid\`, \`/search/compare\`
- OpenAI \`text-embedding-3-small\` for embeddings
- HNSW index (\`vector_cosine_ops\`) for vector search
- GIN index on \`tsvector\` generated column for lexical search
- Plain Python RRF implementation — no external library needed

---

## What I'd do differently

The corpus is small (10 files, ~50 chunks after header-based splitting). The findings are consistent with larger benchmarks, but this isn't a rigorous IR evaluation — it's a worked example for building intuition. At larger scale, IDF weighting in Postgres \`ts_rank\` behaves differently, and BM25-proper (via \`bm25s\`) would give more textbook-accurate lexical scoring than \`ts_rank\`. That's the planned v2.

---

*Full code and eval scripts on [GitHub](https://github.com/vishnu-subrahmanian/lexical-vs-semantic-search)*`;export{e as default};