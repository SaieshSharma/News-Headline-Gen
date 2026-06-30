# NewsScribe

---

![NewsScribe banner](./frontend/src/assets/hero.png)

NewsScribe is a full‑stack, production‑oriented AI service that ingests news articles (URL or pasted text), runs lightweight sentiment analysis, and generates concise, abstractive headlines/summaries using a fine‑tuned T5 transformer model.

Badges
- Build: GitHub Actions (CI/CD) — [See .github/workflows/deploy.yml]

Table of contents
- Motivation
- Features
- Demo
- Architecture Overview
- Folder Structure
- Tech Stack
- Installation
- Environment Variables
- Running the Project
- API Documentation
- Database (N/A)
- AI / ML Pipeline
- System Design
- Security
- Testing
- CI/CD
- Monitoring
- Performance Optimizations
- Roadmap
- Known Limitations
- Contributing
- License
- Acknowledgements

---

**Motivation**

NewsScribe exists to automate fast, readable headline and summary generation from long news articles. It targets editorial teams, independent researchers, and applications that need to surface short, informative headlines and a sentiment cue for quick triage. The project emphasizes a small, fast inference footprint so it can run on CPU‑only hosts while still producing human‑quality, abstractive headlines.

Who benefits
- Journalists: rapid summarization of source content.
- Product teams: feed concise headlines to dashboards.
- Researchers: dataset & pipeline examples for fine‑tuning summarizers.
- Maintainers: infrastructure friendly to lightweight VM deployments.

---

**Features**

Core features
- Accepts raw article text or a public URL and returns an abstractive headline/summary.
- Returns lightweight sentiment classification (POSITIVE / NEGATIVE) with confidence.
- Fast inference defaults to CPU-friendly settings and reduced token budgets.

Advanced features
- Robust HTML fallback parsing using BeautifulSoup when `newspaper` extraction underperforms.
- Early stopping + no_repeat_ngram_size enforced in generation to reduce repetition.

AI features
- Fine‑tuned T5 model for abstractive summarization (stored in `backend/model_weights`).
- DistilBERT‑based sentiment model saved under `backend/sentiment_model` (downloaded via script).

Infrastructure features
- Dockerfile (CPU) optimized for minimal image and prepackaged NLTK data.
- GitHub Actions workflow to build/push backend image and perform a remote deployment swap via SSH.

Developer features
- Vite + React frontend scaffold with simple UI and PDF export.
- `SETUP.md` with local dev steps and model placement guidance.

---

**Demo**

- Live frontend: https://newsscribe.saieshsharma.me
- Live backend API: https://api.saieshsharma.me

Screenshots
- See `frontend/src/assets/hero.png` for the visual header asset used in the app.

GIF / Video placeholders
- GIF: docs/demo/summarize-flow.gif (suggested)
- Video: docs/demo/overview.mp4 (suggested)

---

**Architecture Overview**

A concise view of runtime architecture (production):

```mermaid
flowchart TD
  subgraph CDN
    A[User Browser / Client] -->|HTTPS| B[Nginx Reverse Proxy (EC2)]
  end
  B --> C[Docker Host: FastAPI Container]
  C --> D[T5 Model (mounted /app/model_weights)]
  C --> E[Sentiment Model (mounted /app/sentiment_model)]
  C --> F[Logging / Metrics]
```

Sequence example: client → POST /scrape → backend fetches + parses → sentiment → summarizer → response.

---

**Folder Structure**

- backend/: FastAPI app and model artifacts (excluded from git: model_weights/, sentiment_model/)
  - Dockerfile: builds the CPU image and pre-downloads NLTK punkt
  - main.py: FastAPI app with `/`, `/generate`, `/scrape` endpoints and inference pipeline
  - download_sentiment.py: small helper to fetch & save a HuggingFace sentiment model locally
  - requirements.txt: pinned Python dependencies used to build the image
- frontend/: Vite + React UI
  - src/: React app entry points and components
  - public/: static assets
  - package.json: frontend package manifest
- notebooks/: Colab notebook used for training / experiments (CNN/DailyMail preprocessing)
- .github/workflows/deploy.yml: CI/CD to build, push image, and deploy via SSH
- SETUP.md: developer setup instructions and model placement guidance

---

**Tech Stack**

- Frontend: React (Vite). Chosen for fast dev iteration and small production footprint.
- Backend: Python 3.11, FastAPI, Uvicorn. Chosen for asynchronous endpoints and simple deployment.
- ML: HuggingFace Transformers, PyTorch CPU wheel. T5 for summarization and DistilBERT for sentiment.
- Parsing: `newspaper4k` + BeautifulSoup fallback to handle diverse news markup.
- Containerization: Docker, single lightweight image targeting CPU hosts.
- CI/CD: GitHub Actions building Docker image and deploying via SSH on push to `main`.

Why choices were made
- FastAPI: minimal, async, supports JSON schema via Pydantic for clear request/response contracts.
- T5: well suited for abstractive summarization and fine‑tuning on news corpora.
- DistilBERT: small, fast sequence classifier for sentiment with good CPU throughput.

---

**Installation**

Quick local setup (Linux / Mac / Windows WSL recommended)

1) Backend (recommended: Docker)

```bash
cd backend
# Build image (CPU)
docker build -t newsscribe-backend .
# Start container (bind model directories if you have weights locally)
docker run -d --name newsscribe-backend \
  -p 8000:8000 \
  -v $(pwd)/model_weights:/app/model_weights:ro \
  -v $(pwd)/sentiment_model:/app/sentiment_model:ro \
  newsscribe-backend
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

Non-Docker (venv)

```bash
cd backend
python -m venv venv
# Windows
.\\venv\\Scripts\\activate
# macOS / Linux
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

**Environment Variables**

Frontend
- `VITE_API_URL` — URL to the backend API used at runtime. Defaults to `http://127.0.0.1:8001` in the UI code. Set in `.env` files for Vite as `VITE_API_URL=`.

Backend (deployment)
- No explicit `.env` fields are required by the app itself. However, in production you will mount model weight directories at `/app/model_weights` and `/app/sentiment_model` and run the container with appropriate restart policies.

Security considerations
- Do not check model weights into git. They are excluded via `.gitignore` and `.dockerignore`.
- Do not expose model files to public buckets without access control; they contain licensed artifacts in some cases.

---

**Running the Project**

Development
- Start backend (Docker or uvicorn) and frontend (`npm run dev`).
- Use `VITE_API_URL` to point the frontend to the backend.

Production (reference)
- CI builds the backend image and pushes to DockerHub.
- Deployment script (GitHub Action) SSHes to the host, pulls the image, mounts model weight directories, and runs the container:
  - Container expects `model_weights` and `sentiment_model` mounted under `/app`.

Docker specifics
- The container exposes port `8000`. Nginx is recommended as a reverse proxy in front of it for TLS and rate limiting.

Kubernetes
- No manifests included. If you deploy to k8s, use a `Deployment` + `Service` + `PersistentVolume` for model weights. Consider a HorizontalPodAutoscaler only after ensuring GPU/CPU footprint is acceptable.

---

**API Documentation**

Base URL: `http://<host>:8000`

1) GET /
- Purpose: health check
- Response: {"status": "healthy"}

2) POST /generate
- Purpose: generate a summary/headline from raw text
- Request body (JSON): {"text": "<article text>"}
- Responses:
  - 200: {"summary": "...", "metadata": {...}}
  - 400: Empty text

3) POST /scrape
- Purpose: fetch a URL, attempt to extract main article body, and summarize
- Request body (JSON): {"url": "https://..."}
- Behavior: uses `newspaper` to download and parse; falls back to BeautifulSoup paragraph extraction when content is short or noisy.
- Responses:
  - 200: {"summary": "...", "metadata": {...}}
  - 400: Malformed URL or unable to extract text
  - 500: Internal processing error

Metadata keys returned
- `latency_ms`: inference latency in ms
- `input_tokens`: tokenizer input length
- `device`: currently always `cpu` by default
- `sentiment`: sentiment label (e.g., POSITIVE/NEGATIVE)
- `score`: float confidence score

Examples (curl)

```bash
# Summarize text
curl -X POST http://localhost:8000/generate \
  -H 'Content-Type: application/json' \
  -d '{"text":"Your long article text..."}'

# Scrape a public article and summarize
curl -X POST http://localhost:8000/scrape \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/news/story"}'
```

---

**Database**

This repository does not ship a persistence layer. If you introduce history or user accounts, consider adding:
- PostgreSQL for durable storage
- Redis for short-lived caches (parsed HTML, rate limiting)
- Object storage for model artifacts if you need a central model registry

---

**AI / ML Pipeline**

Training (not included as a runnable pipeline)
- A Colab notebook (`notebooks/headline_gen.ipynb`) shows example preprocessing for CNN/DailyMail dataset and tokenization flow.

Inference
- Summarization: `backend/main.py` loads a T5 tokenizer from `google-t5/t5-base` and loads model weights from `/app/model_weights`.
  - Generation config: `num_beams=1`, `max_new_tokens=70`, `min_new_tokens=20`, `no_repeat_ngram_size=3`.
- Sentiment: a DistilBERT model packaged into `/app/sentiment_model` using `download_sentiment.py`.

Evaluation & metrics
- The repository contains no formal evaluation harness; the notebook shows ROUGE pipeline examples for offline evaluation.

Model lifecycle
- Models are expected to be placed into the `backend/model_weights` and `backend/sentiment_model` directories before running the container.
- The Dockerfile intentionally leaves these out of the image and mounts them at runtime to keep the image small and allow model swapping.

---

**System Design**

Scalability
- Single model process per container. For higher throughput, run multiple containers behind a load balancer and use sticky sessions only if you rely on local cache.
- If using GPUs, create a GPU‑enabled image and update PyTorch wheel and runtime flags.

Fault tolerance
- Container `--restart unless-stopped` ensures service comes back after host reboots.
- Deploy a reverse proxy (Nginx) with health checks and automatic failover.

Caching & Queues
- To protect the model process from spikes, add a small job queue (Redis + RQ) and rate limiting.
- Cache popular or recently scraped article text to speed repeated inference.

Performance
- Inference is optimized for CPU: token budgets reduced, `torch.set_num_threads(1)` applied.
- Fine‑tune model size vs latency tradeoffs; smaller models (DistilT5 variants) reduce cost.

---

**Security**

Authentication & Authorization
- No authentication in this repo. For production, add an API gateway with token or JWT auth.

Secrets & Keys
- DO NOT commit private keys or DockerHub credentials. Use GitHub Secrets for Actions (already used in deploy.yml).

Input validation
- The backend checks for empty text and validates that scraped URLs start with `http://` or `https://`.
- Additional sanitization is recommended (rate limiting and request throttling at the reverse proxy layer).

OWASP considerations
- Escape or sanitize any HTML returned by a future rich API.
- Limit maximum input size and enforce timeouts.

---

**Testing**

- No tests are included. Suggested tests:
  - Unit tests for `run_pipeline_inference` with small text samples.
  - Integration test spinning up the FastAPI app with `TestClient` and calling `/generate` and `/scrape`.
  - Load tests (locust or k6) to understand concurrency limits.

---

**CI/CD**

- GitHub Actions (see `.github/workflows/deploy.yml`) builds and pushes the backend image and performs an SSH deployment swap.
- The workflow expects DockerHub credentials and SSH private key in repository secrets:
  - `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `AWS_HOST`, `AWS_PRIVATE_KEY`.

Rollback strategy
- Workflow pulls `:latest` and replaces the running container. Use image tags per commit/semver for safe rollbacks and retain old images.

---

**Monitoring**

- No observability is implemented. Recommended:
  - Expose Prometheus metrics from the app (e.g., FastAPI metrics middleware).
  - Centralized logging (Fluentd / Filebeat → ELK or CloudWatch).
  - Tracing (OpenTelemetry) for request-level latency.

---

**Performance Optimizations**

What is implemented
- `torch.set_num_threads(1)` + `torch.set_num_interop_threads(1)` to reduce CPU thrashing.
- Reduced token lengths and `max_new_tokens` to cap generation time.
- Minimal Docker base image (python:3.11-slim) to reduce startup time.

Tradeoffs
- Lower token budgets may truncate longer articles and omit context. Consider offloading long-document summarization to chunking + aggregation.

---

**Roadmap**

Planned
- Add authentication & rate limiting at the API layer.
- Add a persistence layer for user history and auditing.
- Add GPU variant of the Docker image and k8s manifests.

Next
- Unit and integration tests.
- Add Prometheus metrics and healthchecks.

Future
- Online fine‑tuning workflow and model registry.
- More robust multi‑document summarization modes.

---

**Known Limitations**

- CPU‑only inference is slower and may struggle with high concurrency.
- No authentication / access control; the service should not be exposed publicly without a proxy.
- No formal tests or metrics collection in the repo.
- Model licensing and redistribution not managed in repo.

---

**Contributing**

Guidelines
- Fork, branch, implement, open PR against `main`.
- Follow the existing code style. Backend uses simple procedural FastAPI functions; prefer small, testable helpers.
- Write unit tests for new behavior.

Local development workflow
- Run backend locally with `uvicorn main:app --reload`.
- Run frontend with `npm run dev` and set `VITE_API_URL` if the backend is remote.

Branching & PR
- `main` is protected. Use feature branches and small PRs. Provide a short description and link to related issues.

---

**License**

This project is MIT licensed. (Replace with the desired license file in repository root.)

---

**Acknowledgements**

- HuggingFace Transformers and model authors.
- `newspaper4k` and `BeautifulSoup` authors for article extraction tooling.

---

If you want, I can now:
- Add an `API.md` with example requests and full response schemas.
- Add unit tests for `backend/main.py` inference flow.
- Add a `docs/` folder with Mermaid diagrams exported as PNGs.

Tell me which follow-up you'd like.