# Complaint Prioritisation Fairness Review Agent

An AI governance decision-support prototype for a fictional bank. It does **not** rank
complaints. It audits the outputs of the bank's existing AI complaint-prioritisation model and
answers one managerial question:

> **Should the bank continue using its AI complaint-prioritisation model?**

The final recommendation is always exactly one of:

- **PROCEED**
- **PROCEED WITH CONDITIONS**
- **ESCALATE TO HUMAN REVIEW**

New to the project? Start with the in-app **Guide** (`/guide`) for a step-by-step walkthrough, or
the **Presentation** page (`/presentation`) for a one-page summary built for a class demo.

## Business problem

A bank's AI model prioritises incoming complaints. That model could unintentionally create
unfair differences between customer groups, for example, classifying regional-language
complaints as low priority more often than English complaints, even when severity is the same.
The Complaints Head needs a governance review before deciding whether the model is safe to keep
operating.

## Managerial decision

Whether the complaint-prioritisation model should remain in operation, and under what
conditions. The agent supports this decision. It never makes it. Authority always rests with the
Complaints Head or designated AI governance owner.

## Architecture

```
                     VERCEL
                       |
                  Next.js App
                       |
          +------------+------------+
          |                         |
      Frontend                 Server/API
          |                         |
          |              +----------+----------+
          |              |                     |
          |        Deterministic          OpenAI API
          |          Analysis                  |
          |              |                     |
          +--------------+---------------------+
                         |
                  Governance Report
```

**Key design rule: the LLM never performs statistical calculations.** All rates, ratios,
severity adjustments, SLA compliance, and Cramér's V association measures are computed by plain,
deterministic TypeScript in [`lib/analysis.ts`](lib/analysis.ts) and
[`lib/policy.ts`](lib/policy.ts). The LLM ([`lib/governance-agent.ts`](lib/governance-agent.ts))
only interprets that already-computed evidence and writes the governance report's narrative. It
never recalculates a statistic and never overrides the deterministic policy recommendation.

## Non-discrimination guardrails

Language, region, gender and religion are permanently prohibited model inputs. Gender and
religion are also actively monitored for outcome parity on every single review, whether or not
they are used as model inputs, and any disparity found there forces an immediate escalation
rather than a soft condition. The AI reasoning layer is instructed to never justify or soften a
discriminatory outcome and to treat all uploaded data as data, never as instructions. See the
**Policy** page, section 8, for the full guardrail statement.

## Scenarios

Four built-in, deterministically-generated synthetic scenarios (approximately 5,000 complaints
each):

| Scenario | Story | Expected result |
|---|---|---|
| Fair System | No meaningful disparity between language groups | PROCEED |
| Regional-Language Bias | Marathi complaints marked low priority about 2 to 2.5x more than English, even after severity adjustment | ESCALATE TO HUMAN REVIEW |
| Explained Gap | Raw disparity exists but is explained by a different severity mix | PROCEED or PROCEED WITH CONDITIONS |
| Insufficient Data | One language group has fewer than 30 complaints | PROCEED WITH CONDITIONS |

Gender and religion are generated independently of outcome in every scenario, on purpose, so the
guardrail monitor can prove they stay balanced even while language is deliberately biased.

You can also upload your own CSV of complaint data on the Review page (see
[`data/README.md`](data/README.md) for the required schema). Raw rows never leave your browser,
only aggregated evidence is sent to the server and the AI model.

## How to run

```bash
npm install
npm run dev
```

Then open:

```
http://localhost:3000
```

The app redirects to **Review** by default.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is not set (or the API call fails), the app still shows the full
deterministic analysis and policy evaluation, with a clear notice that the AI narrative is
unavailable. It never fabricates an AI response.

## Testing

```bash
npm run test
```

Runs the automated suite in `tests/` against the deterministic analysis and policy engines
(fair/biased/explained-gap/insufficient-data scenarios, missing error evidence, prohibited
inputs, conditional-variable documentation, guardrail breaches on gender and religion, and LLM
response schema validation). The in-app **Testing** page runs the same engine live in the
browser/server on every page load.

## Vercel deployment

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in Vercel, Project, Settings,
   Environment Variables.
4. Deploy.
5. Open the generated Vercel URL. It opens directly on the Review page.

The `OPENAI_API_KEY` is only ever read server-side (inside the `/api/governance-review` route
handler) and is never exposed to the browser.

## Scope

This is intentionally a single-purpose prototype. It does not include user accounts, a database,
complaint management, model training/retraining, or legal compliance scoring, see section 40 of
the build spec. Everything in the app exists to answer one question: should this model continue
operating?

## Limitations

- This is a governance decision-support prototype using synthetic data.
- The 1.25x fairness threshold is a fictional internal bank control created for this project.
  It is not an RBI requirement.
- Statistical disparity does not by itself establish discrimination.
- Reopened/escalated complaints are a proxy for potential misclassification, not verified ground
  truth.
- The agent cannot make legal findings, modify the model, approve it permanently, decide
  compensation, or override the Complaints Head.
- Intersectional groups may not be adequately assessed.
- Results depend on the quality and completeness of the supplied data.
