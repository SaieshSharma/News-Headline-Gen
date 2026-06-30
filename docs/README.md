# NewsScribe Engineering Knowledge Base

This folder is the long-form engineering memory for NewsScribe. It was created for Future Me: someone returning after months away who needs to understand the system before touching code.

## Reading Order

| File | Purpose |
|---|---|
| [`00_Project_Overview.md`](00_Project_Overview.md) | Start here for product purpose, workflow, maturity, and constraints. |
| [`01_Architecture.md`](01_Architecture.md) | Component, sequence, deployment, dependency, and tradeoff diagrams. |
| [`02_Decision_Log.md`](02_Decision_Log.md) | Reconstructed architectural decisions and assumptions. |
| [`03_First_Principles.md`](03_First_Principles.md) | Concepts used by the project, explained from fundamentals. |
| [`04_DataFlow.md`](04_DataFlow.md) | How user input becomes model output. |
| [`05_Backend.md`](05_Backend.md) | FastAPI, scraping, inference, lifecycle, and backend risks. |
| [`06_Frontend.md`](06_Frontend.md) | React UI, state, API calls, rendering, and PDF export. |
| [`07_AI_Model.md`](07_AI_Model.md) | Training, datasets, evaluation, inference, artifacts, and limitations. |
| [`08_Database.md`](08_Database.md) | Current no-database state and future schema ideas. |
| [`09_APIs.md`](09_APIs.md) | Endpoint-by-endpoint backend contract. |
| [`10_Deployment.md`](10_Deployment.md) | Docker, GitHub Actions, EC2, Nginx, secrets, rollback. |
| [`11_Debugging.md`](11_Debugging.md) | Common failures, root causes, commands, and debug flows. |
| [`12_Learning_Journal.md`](12_Learning_Journal.md) | Lessons inferred from implementation and git history. |
| [`13_Glossary.md`](13_Glossary.md) | Alphabetical technical term reference. |
| [`14_Project_Timeline.md`](14_Project_Timeline.md) | Reconstructed project evolution from git history. |
| [`15_Future_Work.md`](15_Future_Work.md) | Refactoring, scaling, AI, product, ops, and security roadmap. |

## Source Boundaries

The docs are based on the repository contents, the training notebook, deployment workflow, README/SETUP notes, model metadata, and git history. Where rationale was not explicit in code or commits, the docs mark it as an assumption or cautious inference.
