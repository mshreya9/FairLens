# Version Log

## v1
- Initial fairness review
- Basic disparity detection

## v2
- Added small-sample protection
- Added severity adjustment
- Added missing-data warnings

## v3
- Added model-input policy checks
- Added explicit human escalation
- Improved explained-gap reasoning

## v4
- Added gender and religion as protected attributes, monitored on every review even though the model never uses them
- Added a dedicated non-discrimination guardrail breach path that forces escalation
- Added the Guide and Presentation pages
- Hardened the AI governance narrative against prompt injection and discrimination-justifying language
- Rewrote the app copy to remove em dashes throughout
- Named the project FairLens
