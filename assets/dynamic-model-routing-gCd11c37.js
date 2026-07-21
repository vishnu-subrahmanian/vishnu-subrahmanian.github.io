var e=`Not every query needs GPT-4.

That's the core insight most AI agent architectures miss early on. When you're building a demo, defaulting to the most capable model makes sense — you want the best output, fast. But in production, that default becomes a cost and latency problem at scale.

The better question isn't *which model is best*. It's *which model is sufficient for this specific query, right now*.

That's model routing. And there are four practical patterns worth knowing.

---

## Pattern 1 — Keyword routing

The simplest approach. Inspect the query for known keywords or phrases, and dispatch to a model tier based on what you find.

\`\`\`python
def route_by_keyword(query: str) -> str:
    sensitive_keywords = ["contract", "legal", "compliance", "medical"]
    if any(kw in query.lower() for kw in sensitive_keywords):
        return "gpt-4o"
    return "gpt-4o-mini"
\`\`\`

**When it works:** When your query space is well-defined and you know ahead of time which topics need higher capability. Good for domain-specific apps where the vocabulary is controlled — a legal assistant, a compliance tool, an internal HR bot.

**Where it breaks:** Users don't always phrase things the way you expect. "Can you check if our vendor agreement covers this?" might miss every keyword in your list but still need careful handling. Keyword matching is brittle on natural language inputs.

**Tradeoff:** Zero latency overhead, completely deterministic, easy to audit. But low coverage and high maintenance as the keyword list grows.

---

## Pattern 2 — Cost-tier routing

Classify the query by complexity first, then dispatch to the appropriate cost tier. A lightweight classifier (rule-based, or a small fine-tuned model) decides whether the query is simple, medium, or complex before the main model call.

\`\`\`python
def classify_complexity(query: str) -> str:
    # Simple heuristic: query length + question type
    if len(query.split()) < 10 and "?" not in query:
        return "simple"
    elif len(query.split()) < 30:
        return "medium"
    return "complex"

MODEL_MAP = {
    "simple": "gpt-4o-mini",
    "medium": "gpt-4o-mini",
    "complex": "gpt-4o"
}
\`\`\`

**When it works:** When your traffic has a real distribution of complexity — most queries are simple, a minority are genuinely hard. A customer support agent, a general-purpose assistant, a search interface.

**Where it breaks:** Query length is a poor proxy for complexity. "Explain quantum entanglement" is short but hard. "List the steps to reset my password" can be long and simple. Better classifiers use semantic signals, not heuristics.

**Tradeoff:** Needs a calibrated complexity classifier to work well. The classification step adds latency — make sure the saving on the main call outweighs the overhead of routing.

---

## Pattern 3 — Tool-intent routing

Inspect what tools or capabilities the query requires, and route based on that. An agent that can call tools (web search, code execution, database queries) routes to a model known to handle tool use well. A simple conversational query routes to a lighter model.

\`\`\`python
TOOL_SIGNALS = ["search", "find", "look up", "calculate", "run", "execute", "query"]

def route_by_tool_intent(query: str) -> str:
    needs_tools = any(signal in query.lower() for signal in TOOL_SIGNALS)
    if needs_tools:
        return "gpt-4o"   # stronger function-calling capability
    return "gpt-4o-mini"
\`\`\`

Or use a proper intent classifier trained on your query distribution rather than a keyword list.

**When it works:** When your agent has a meaningful split between tool-use queries and conversational queries. Agentic systems where tool selection quality directly affects the answer — code agents, data agents, research agents.

**Where it breaks:** Tool intent isn't always explicit in the query. "What's the weather going to be like this weekend?" implies tool use (web search) but contains no obvious signal word. Works better when intent is structured (an explicit action field in the request) than when it's inferred from free text.

**Tradeoff:** Naturally aligns model capability with actual task demand. Requires understanding your query taxonomy well enough to define meaningful intent categories.

---

## Pattern 4 — Try cheap, fallback to advanced

Send every query to the cheaper model first. If it fails a confidence check or quality threshold, retry with the more capable model. No upfront classification needed.

\`\`\`python
async def route_with_fallback(query: str) -> str:
    response = await call_model("gpt-4o-mini", query)

    if is_low_confidence(response) or response.get("refused"):
        response = await call_model("gpt-4o", query)

    return response

def is_low_confidence(response) -> bool:
    # Check for refusals, uncertainty markers, or empty outputs
    uncertainty_markers = ["I'm not sure", "I don't know", "I cannot"]
    return any(marker in response["content"] for marker in uncertainty_markers)
\`\`\`

**When it works:** When you can define a reliable quality signal from the cheap model's output. Works well when cheap model refusals or low-confidence responses are meaningful signals — the model genuinely knows when it's out of its depth.

**Where it breaks:** The cheap model sometimes produces a confident but wrong answer. If your confidence check can't detect that, you never escalate — and get a plausible-sounding incorrect response. The double call also means higher latency on the escalated path.

**Tradeoff:** No classification overhead on the happy path (most queries). Adds latency on the escalated path (two calls). Best when the escalation rate is low — if you're escalating 60% of queries, you've negated the savings.

---

## Combining patterns

These aren't mutually exclusive. A production routing layer might combine all four:

\`\`\`
Incoming query
    ↓
Keyword check (pattern 1) → high-sensitivity topics → GPT-4o directly
    ↓ (no keyword match)
Tool-intent check (pattern 3) → tool call needed → GPT-4o
    ↓ (no tool needed)
Try cheap with fallback (pattern 4) → GPT-4o-mini → escalate if uncertain
\`\`\`

The cost-tier classifier (pattern 2) can replace the keyword check if you have enough training data to build it reliably.

---

## The routing decision framework

| Signal available | Pattern to use |
|---|---|
| Known vocabulary / domain | Keyword routing |
| Query complexity measurable | Cost-tier routing |
| Tool use intent detectable | Tool-intent routing |
| No upfront signal available | Try cheap, fallback |
| Multiple signals available | Combine in sequence |

---

## What most teams get wrong

The most common mistake is treating model routing as a cost optimization problem only. It's also a reliability problem. A cheaper model that confidently produces wrong answers for 5% of queries is worse than a slightly expensive model that handles everything correctly. Route for capability, not just cost — and measure output quality, not just call count.

The second mistake is over-engineering the classifier before understanding the actual query distribution. Spend a week logging your queries, cluster them, and look at what actually comes in before writing routing logic. The patterns will be more obvious than you expect.

---

*This post was originally published as a LinkedIn carousel on dynamic model selection patterns.*`;export{e as default};