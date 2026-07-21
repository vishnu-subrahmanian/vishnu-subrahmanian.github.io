var e=`Google published a new spec for how AI agents should consume structured knowledge - markdown files with YAML frontmatter, linked to each other like a wiki, no database, no vendor.

I wanted to actually understand it, so I built both sides: a producer that generates a conformant knowledge bundle from a live Postgres database, and a consumer that reads that bundle back to answer natural-language questions.

---

## What is OKF

The **Open Knowledge Format** (spec v0.1, Google Cloud Platform) represents knowledge as a directory tree of markdown files called a *bundle*. Every concept - a table, a metric, a runbook - is one file. Concepts link to each other with bundle-relative paths (\`/postgres/tables/orders.md\`), the same way HTML links express relationships. Two reserved filenames carry the structure: \`index.md\` for progressive-disclosure directory listings, \`log.md\` for a chronological changelog.

Conformance is deliberately loose. The only hard rule: every concept file needs parseable YAML frontmatter with a non-empty \`type\` field. Everything else - description, tags, resource, timestamp - is optional. Unknown types, missing fields, and broken links are not validation failures. The spec is built to let bundles grow messily and still work.

---

## What I built

**Producer** - introspects a Postgres schema (\`information_schema\`), samples a few rows per table, sends that to an LLM to draft a description and tags, and writes one concept file per table. Foreign keys become bundle-relative links in the body text. A hand-authored \`Metric\` concept with no \`resource\` field sits alongside the table concepts, to test the format's claim that it can describe abstract ideas, not just physical assets.

**Validator** - walks the bundle and enforces exactly the §9 conformance rules, nothing more. It's intentionally permissive: it will not fail a bundle for a broken link or a missing description.

**Consumer** - takes a natural-language question, scores every concept by weighted keyword overlap against the query (title × 3, description × 2, tags × 2, body × 1), takes the top matches, then follows their FK links one hop to pull in related tables before building the SQL-generation context. No vector database, no embeddings, anywhere.

---

## The retrieval mechanism is lexical search, wearing a different outfit

This is the part worth sitting with. My \`ask\` command's relevance scoring - weighted term overlap over frontmatter fields - is structurally the same thing as the Postgres full-text search I benchmarked in [an earlier project](https://github.com/vishnu-subrahmanian/lexical-vs-semantic-search). Different implementation (Python dict scoring vs. \`tsvector\`/\`ts_rank\`), same underlying mechanism: it matches words, not meaning.

In that earlier eval, lexical search scored **0.00 hit@5 on every semantically-phrased query** - it found nothing for "how do I make the agent remember previous turns" because none of those words appeared in the target document. The failure mode transfers directly here: if someone asks the OKF consumer a question using different words than what's in the concept's \`description\` or \`tags\`, keyword overlap has no way to bridge that gap. The FK one-hop expansion helps *after* the first concept is found, but it does nothing if the first match fails.

I ran six queries against this bundle - three using vocabulary that appears directly in the LLM-generated descriptions and tags, three paraphrased away from it:

| Query | Kind | Top matched concepts | Verdict |
|---|---|---|---|
| "which products had the most orders" | vocab match | \`orders\` (9.0), \`products\` (8.0), \`shipments\` (4.0) | ✓ correct |
| "show me total shipment value by region" | vocab match | \`total_shipment_value\` metric, \`shipments\`, \`orders\` | ✓ correct |
| "how many reports were generated per tenant" | vocab match | \`reports\`, \`tenants\`, \`reporting_sessions\` | ✓ correct |
| "which items sold the best" | paraphrase | \`report_draft_items\` (2.0) | ✗ wrong table - "items" matched the word in \`report_draft_items\`, not orders/products |
| "what merchandise moved the most units last quarter" | paraphrase | *(none)* | ✗ complete miss - zero overlap with any concept |
| "show me delivery performance across geographies" | paraphrase | \`verified_queries\`, \`reports\`, \`report_sections\` | ✗ wrong tables - \`shipments\` not retrieved at all |

3/3 on vocabulary-matching queries. 0/3 on paraphrased ones - and the two non-zero paraphrase results returned entirely wrong tables with very low scores (2.0–4.0 vs. 8.0–9.0 for true matches), which would produce bad SQL and wrong answers.

The third paraphrase failure is the sharpest illustration: "delivery performance across geographies" is a natural way to ask about shipments, but \`shipments.md\` has \`description: "This table tracks shipment details, including carrier information, delivery status, and delays."\` - the word "delivery" does appear there. The scorer missed it because \`performance\` and \`geographies\` had zero overlap, the combined score was below the top-3 threshold, and \`verified_queries\` / \`reports\` edged it out on incidental word matches. The retrieval isn't just weak on pure synonyms; it's sensitive to the specific word mix in the whole query.


The links-as-relationships mechanism is a genuinely different idea from embeddings, though: pulling \`products\` into context because \`orders.product_id\` literally links to it is deterministic and inspectable, where a vector store hopes semantically related chunks land close together and gives you no way to check its reasoning. The concept-retrieval step is where OKF is weakest against RAG; the link-traversal step is where it's arguably stronger.

---

## OKF vs. traditional RAG

| | OKF (as built here) | Traditional vector RAG |
|---|---|---|
| Retrieval | Keyword overlap over frontmatter | Embedding similarity (cosine) |
| Unit of knowledge | Author-defined concept (one table, one metric) | Arbitrary chunk, boundary set by a splitter |
| Relationship modeling | Explicit markdown links, human/agent-readable | Implicit - hoped-for proximity in embedding space |
| Freshness | Re-run \`generate\`, diff in git | Re-embed and re-index |
| Editability | Open any file, fix a sentence | Opaque index, no direct edit |
| Infra | None - filesystem + markdown | Vector database, embedding API, index maintenance |
| Paraphrase handling | Weak (see above) | Strong - this is what embeddings are for |

---

## Where I'd actually reach for this

**OKF fits:** structured, curatable knowledge with natural single-file boundaries - schemas, metric definitions, runbooks, API references. Places where a human is going to write or review the concept anyway, so "no chunking problem" is a real advantage, not a missing feature.

**Vector RAG still wins:** unstructured or long-form material - contracts, support tickets, chat logs, documentation prose that doesn't decompose into one-concept-per-file. Anywhere a user's question won't share vocabulary with the source text.

**The honest middle ground:** OKF's bundle *structure* (authored concepts, explicit links, git-diffable) combined with embeddings for the free-text \`body\` of each concept - structure for retrieval precision, embeddings for paraphrase tolerance. I didn't build that hybrid here; it's the obvious next step.

---

## Stack

- Python, FastAPI-adjacent tooling (no server - this is a CLI)
- PostgreSQL (\`information_schema\` introspection, \`psycopg2\`)
- OpenAI API - JSON-mode for enrichment, SQL generation
- \`python-frontmatter\` / \`pyyaml\` for the format layer
- Markdown + git as the entire storage layer - no database for the bundle itself

---

## What I'd do differently

Only Postgres is wired as a source, though the adapter is built as an interface specifically so CSV/MySQL/BigQuery are a new implementation, not a rewrite - I haven't proven that by actually adding a second one yet, so treat that claim as untested.

The retrieval scorer is the piece I'd revisit first: either replace keyword overlap with a small local embedding model over concept descriptions (cheap, no external vector DB needed for a corpus this size), or run the same 15-query exact/semantic/ambiguous eval structure from my search-methods project directly against this bundle, so the paraphrase weakness above is a measured number instead of an inference from a different project.

---

*Full code on [GitHub](https://github.com/vishnu-subrahmanian/okf)*`;export{e as default};