# data/

This project does not ship a persisted dataset. All complaint data is either:

1. **Synthetic, generated deterministically at request time** by [`lib/scenarios.ts`](../lib/scenarios.ts) for the four built-in review scenarios (Fair System, Regional-Language Bias, Explained Gap, Insufficient Data), or
2. **Optionally uploaded as CSV** by the user on the Review page, validated against the schema in [`lib/validation.ts`](../lib/validation.ts).

No real customer data is used anywhere in this application. Synthetic records use a seeded random number generator so the same scenario always produces the same dataset. Results are reproducible across runs and across machines.

Every synthetic and uploaded record also carries two protected attributes, `gender` and `religion`. The prioritisation model is never allowed to use them (see the Policy page, section 8), but the agent checks outcomes across them on every review as a non-discrimination guardrail. In the synthetic data they are always generated independently of outcome, by design, so the guardrail monitor can prove they stay balanced even in the biased scenario.

## Required CSV columns (if uploading your own data)

```
complaint_id
severity
product
language
region
customer_value_tier
gender
religion
prior_complaints
vulnerability_flag
ai_priority
resolution_days
reopened_after_low_priority
escalated
model_input_language
model_input_region
model_input_customer_value
model_input_gender
model_input_religion
```

Allowed values: `severity` is Critical, High or Standard. `product` is Savings Account, Credit Card, Personal Loan, Digital Banking or Payments. `language` is English, Hindi, Marathi, Tamil or Bengali. `region` is North, West, South or East. `customer_value_tier` is Standard, Premium or High Value. `gender` is Male, Female or Other. `religion` is Hindu, Muslim, Christian, Sikh or Other. `ai_priority` is High or Low.

If `reopened_after_low_priority` is omitted, the application continues to work and explicitly states that error/misclassification fairness cannot be assessed, rather than inventing a rate.

## Where to get more data for a real deployment

The synthetic generator is a stand-in for data this tool would need from the bank's own systems
in a real deployment:

- The complaint-handling system, for `complaint_id`, `severity`, `product`, `resolution_days`, `escalated`, and the AI model's own `ai_priority` output log.
- Customer records, for `language`, `region`, `customer_value_tier`, `gender`, `religion`, `prior_complaints` and `vulnerability_flag`, strictly limited to what is needed for this fairness check and handled under the bank's data protection policy.
- A reopened-complaint or quality-audit log, for `reopened_after_low_priority`, so the error/misclassification indicator is based on real outcomes rather than being left unavailable.
- The model's own technical documentation, confirmed by the model owner, for the `model_input_*` flags. This should never be inferred or guessed.
