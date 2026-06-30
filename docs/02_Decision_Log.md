# Decision Log

This repository does not contain formal Architecture Decision Records. The entries below are reconstructed from source code, configuration, README text, and git history. Items marked **Assumption** are cautious inferences.

## ADR-001: Use a Split Frontend and Backend

| Field | Detail |
|---|---|
| Problem | The app needs both a browser UI and Python-native ML inference. |
| Options | One Python server rendering HTML; one Node server doing everything; React frontend plus Python API. |
| Chosen solution | React/Vite frontend calls a FastAPI backend. |
| Reason | Python is the natural runtime for HuggingFace/PyTorch. React gives a simple interactive UI. |
| Tradeoffs | Two deployable surfaces instead of one. Browser/backend integration requires CORS and production URL configuration. |
| Risks | Frontend and backend versions can drift. API URL environment config can break deployments. |
| Future improvements | Define an OpenAPI-generated client or shared API contract tests. |

## ADR-002: Use FastAPI for the Backend

| Field | Detail |
|---|---|
| Problem | Need HTTP endpoints for health, text summarization, and URL scraping. |
| Options | FastAPI, Flask, Django REST, Node/Express. |
| Chosen solution | FastAPI in [`backend/main.py`](../backend/main.py). |
| Reason | FastAPI integrates well with Pydantic validation and Python ML code while staying lightweight. |
| Tradeoffs | Async route functions do not make CPU-bound model generation non-blocking. |
| Risks | Concurrent requests can still contend for the single model process. |
| Future improvements | Use worker queues, multiple workers with careful memory planning, or a dedicated inference server. |

## ADR-003: Use Fine-Tuned T5 for Summarization

| Field | Detail |
|---|---|
| Problem | Need abstractive news headline/summary generation instead of extractive sentence selection. |
| Options | Rule-based summarization, extractive algorithms, OpenAI/hosted LLM API, BART, Pegasus, T5. |
| Chosen solution | T5-small fine-tuned on CNN/DailyMail, saved as local weights. |
| Reason | T5 supports text-to-text summarization and can be fine-tuned in Colab. |
| Tradeoffs | Local model serving requires CPU/GPU resources and model file management. |
| Risks | CNN/DailyMail domain bias, hallucination, weak handling of very long or unusual articles. |
| Future improvements | Compare against BART/Pegasus, evaluate with human tests, add confidence/quality checks. |

## ADR-004: Use DistilBERT SST-2 for Sentiment Metadata

| Field | Detail |
|---|---|
| Problem | The result should include a lightweight analysis signal beyond the summary. |
| Options | No sentiment, custom trained sentiment model, VADER/TextBlob, DistilBERT SST-2. |
| Chosen solution | `distilbert-base-uncased-finetuned-sst-2-english`, downloaded by [`backend/download_sentiment.py`](../backend/download_sentiment.py). |
| Reason | It is easy to save locally and fast enough for small text windows. |
| Tradeoffs | SST-2 is binary positive/negative and not designed specifically for news tone. |
| Risks | Political, financial, disaster, or neutral news can be misclassified. |
| Future improvements | Use a news-specific sentiment/tone classifier or expose sentiment as "rough signal." |

## ADR-005: Use `newspaper4k` First, BeautifulSoup Fallback Second

| Field | Detail |
|---|---|
| Problem | URLs need to become clean article text before summarization. |
| Options | User supplies only text; newspaper parser only; custom scraping only; third-party scraping API. |
| Chosen solution | `newspaper4k` parse first, fallback to paragraph extraction with BeautifulSoup. |
| Reason | `newspaper4k` handles many article pages, while BeautifulSoup gives a simple rescue path for bad extraction. |
| Tradeoffs | Static parsing cannot fully handle JavaScript-heavy or paywalled pages. |
| Risks | Junk phrases are filtered by a small hard-coded list; false positives/negatives are possible. |
| Future improvements | Add domain-specific extractors, readability scoring, boilerplate removal library, or Playwright-based extraction. |

## ADR-006: Optimize Inference for CPU

| Field | Detail |
|---|---|
| Problem | Transformer inference can saturate small EC2 CPUs. |
| Options | GPU instance, hosted inference API, slower high-quality decoding, CPU-tuned decoding. |
| Chosen solution | CPU device, `torch.set_num_threads(1)`, `torch.set_num_interop_threads(1)`, shorter windows, greedy decoding. |
| Reason | Git history shows performance work around thread thrashing and beam search removal. |
| Tradeoffs | Faster and more stable on constrained hardware, but summary quality may be lower. |
| Risks | One thread may underuse larger machines if deployed elsewhere. |
| Future improvements | Make concurrency and generation settings environment-configurable. |

## ADR-007: Keep Model Weights Out of Git

| Field | Detail |
|---|---|
| Problem | Model artifacts are large. The T5 safetensors file is about 242 MB and the sentiment model is about 268 MB. |
| Options | Commit weights, Git LFS, Docker image embedding, host-mounted volumes. |
| Chosen solution | `.gitignore` excludes model directories; deployment mounts host volumes. |
| Reason | Keeps git history and Docker image lighter. |
| Tradeoffs | New environments require manual or automated model provisioning. |
| Risks | Missing volume files cause backend startup failure. |
| Future improvements | Add a provisioning script with checksums or use a model artifact registry. |

## ADR-008: Dockerize Only the Backend

| Field | Detail |
|---|---|
| Problem | Backend has system and Python dependencies that need reproducible deployment. |
| Options | Install directly on EC2, Docker backend, Docker Compose full stack, Kubernetes. |
| Chosen solution | Backend Dockerfile in [`backend/Dockerfile`](../backend/Dockerfile); frontend deployed separately. |
| Reason | Python dependencies, NLTK assets, and service process are easier to freeze in an image. |
| Tradeoffs | The frontend deployment path is not codified in this repo's GitHub Actions. |
| Risks | Frontend and backend release processes are asymmetric. |
| Future improvements | Add frontend CI/deploy documentation or a full-stack compose file for local reproduction. |

## ADR-009: Deploy via GitHub Actions, DockerHub, and SSH

| Field | Detail |
|---|---|
| Problem | Backend changes should reach the EC2 host predictably after pushes to `main`. |
| Options | Manual SSH deploy, GitHub Actions SSH deploy, ECS, Kubernetes, Terraform pipeline. |
| Chosen solution | [`deploy.yml`](../.github/workflows/deploy.yml) builds/pushes image and swaps container over SSH. |
| Reason | Simple for one host and one backend container. |
| Tradeoffs | Less sophisticated than blue/green deploys or orchestrators. |
| Risks | A bad `latest` image can replace the live container; rollback is manual. |
| Future improvements | Tag releases by SHA, keep previous image, add health check before pruning. |

## ADR-010: No Database in MVP

| Field | Detail |
|---|---|
| Problem | Need to decide whether to persist requests/results. |
| Options | No database, SQLite, Postgres, MongoDB, Redis cache. |
| Chosen solution | No database. |
| Reason | Current workflow only needs immediate response rendering. |
| Tradeoffs | Very simple architecture, but no history, accounts, feedback, or analytics. |
| Risks | Cannot debug user-level behavior after the fact except via logs outside this repo. |
| Future improvements | Add Postgres for history and feedback; add Redis for caching repeated URLs. |

