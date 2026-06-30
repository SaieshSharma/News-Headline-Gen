# Architecture

## Architecture Goal

NewsScribe is shaped around one primary goal: take unstructured news text or a news URL and return a concise generated summary quickly enough to feel interactive. Every component exists to support one of four responsibilities:

| Responsibility | Component |
|---|---|
| Collect user input and display output | React/Vite frontend |
| Validate requests and coordinate inference | FastAPI backend |
| Extract article text from URLs | `newspaper4k` and BeautifulSoup |
| Generate AI outputs | Fine-tuned T5 summarizer and DistilBERT sentiment classifier |

## Component Diagram

```mermaid
flowchart TB
  subgraph Browser
    APP["App.jsx\nReact state + UI"]
    PDF["jsPDF exporter"]
  end

  subgraph BackendContainer["Docker container: newsscribe-backend"]
    API["FastAPI app\nbackend/main.py"]
    VALID["Pydantic request models"]
    SCRAPER["Scrape fallback layer\nnewspaper4k + BeautifulSoup"]
    INFER["run_pipeline_inference"]
    T5TOK["T5Tokenizer"]
    T5MODEL["T5ForConditionalGeneration"]
    SENTTOK["AutoTokenizer"]
    SENTMODEL["AutoModelForSequenceClassification"]
  end

  subgraph HostVolumes["EC2 host-mounted model volumes"]
    W1["/home/ubuntu/model_weights -> /app/model_weights"]
    W2["/home/ubuntu/sentiment_model -> /app/sentiment_model"]
  end

  APP -->|fetch JSON| API
  APP --> PDF
  API --> VALID
  API --> SCRAPER
  API --> INFER
  INFER --> T5TOK
  INFER --> T5MODEL
  INFER --> SENTTOK
  INFER --> SENTMODEL
  W1 --> T5MODEL
  W2 --> SENTMODEL
```

## Request Sequence

```mermaid
sequenceDiagram
  participant User
  participant FE as React frontend
  participant API as FastAPI backend
  participant Scraper as newspaper4k/BeautifulSoup
  participant Sent as DistilBERT sentiment
  participant T5 as Fine-tuned T5

  User->>FE: Paste text or URL
  FE->>FE: Determine URL vs plain text
  alt URL
    FE->>API: POST /scrape { url }
    API->>Scraper: Download and parse article
    Scraper-->>API: Extracted text
  else Plain text
    FE->>API: POST /generate { text }
  end
  API->>Sent: Classify sentiment on truncated text
  Sent-->>API: label + probability
  API->>T5: Generate summary
  T5-->>API: summary text
  API-->>FE: summary + metadata
  FE-->>User: Render output and export controls
```

## Deployment Diagram

```mermaid
flowchart LR
  DEV["Developer pushes to main"] --> GHA["GitHub Actions\n.github/workflows/deploy.yml"]
  GHA --> DH["DockerHub\nnewsscribe-backend:latest"]
  GHA --> SSH["SSH to AWS EC2"]
  SSH --> PULL["docker pull latest"]
  PULL --> RUN["docker run -p 8000:8000\n-v model volumes\n--restart unless-stopped"]
  USER["Internet user"] --> VERCEL["Vercel frontend"]
  VERCEL --> NGINX["Nginx on EC2\nHTTPS + rate limit"]
  NGINX --> RUN
```

## Why Each Component Exists

| Component | Why It Exists | Relevant Files |
|---|---|---|
| React | Provides a responsive single-page UI and local state for input/result/loading/error. | [`frontend/src/App.jsx`](../frontend/src/App.jsx) |
| Vite | Fast frontend dev server and production bundler for React. | [`frontend/vite.config.js`](../frontend/vite.config.js) |
| Tailwind CSS v4 | Utility-first styling with custom theme variables. | [`frontend/src/index.css`](../frontend/src/index.css) |
| jsPDF | Creates a local PDF report in the browser without backend storage. | [`frontend/src/App.jsx`](../frontend/src/App.jsx) |
| FastAPI | Lightweight Python HTTP API with async route handlers and Pydantic validation. | [`backend/main.py`](../backend/main.py) |
| Pydantic | Defines request schemas for article text and URL payloads. | [`backend/main.py`](../backend/main.py) |
| newspaper4k | Attempts semantic news article extraction from a URL. | [`backend/main.py`](../backend/main.py) |
| BeautifulSoup | Fallback parser when newspaper extraction looks short or polluted. | [`backend/main.py`](../backend/main.py) |
| PyTorch | Runs transformer models on CPU. | [`backend/requirements.txt`](../backend/requirements.txt) |
| HuggingFace Transformers | Loads tokenizers/models and performs T5 generation/sentiment classification. | [`backend/main.py`](../backend/main.py) |
| Docker | Packages backend runtime dependencies reproducibly. | [`backend/Dockerfile`](../backend/Dockerfile) |
| GitHub Actions | Builds/pushes backend image and redeploys EC2 container. | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |
| Nginx | Production reverse proxy, TLS termination, and rate limiting, described in README. | [`README.md`](../README.md) |

## Tradeoffs and Rejected Alternatives

The repository does not contain explicit ADR files, so the following rationale is inferred from code and commit history.

| Decision | Likely Alternatives | Why Current Choice Fits | Tradeoff |
|---|---|---|---|
| Single FastAPI backend | Flask, Django, Node/Express | FastAPI is concise, typed, and common for Python ML services. | Synchronous model work still blocks request handling unless scaled separately. |
| CPU deployment | GPU VM, hosted inference endpoint | CPU EC2 is cheaper and simpler. | Requires aggressive inference optimizations; quality/speed tradeoffs are visible. |
| Local model volumes | Bake weights into image, download from Hub on boot | Host volumes keep Docker image smaller and avoid repeated weight downloads. | Server must be provisioned with correct files before deploy. |
| Greedy decoding (`num_beams=1`) | Beam search, sampling | Faster and less CPU-intensive. | May produce less polished summaries than beam search. |
| No database | Postgres, MongoDB, Redis | App does not need persistence for MVP workflow. | No history, analytics, users, caching, or feedback loop. |
| GitHub Actions SSH deploy | Terraform, Kubernetes, ECS | Simple and enough for one EC2 host. | Harder to roll back, scale, or audit than managed deployments. |

## Dependency Map

```mermaid
flowchart TD
  REQ["User request"] --> FAST["FastAPI"]
  FAST --> PYD["Pydantic"]
  FAST --> SCR["newspaper4k"]
  SCR --> LXML["lxml-html-clean"]
  FAST --> BS4["BeautifulSoup"]
  FAST --> HF["transformers"]
  HF --> TORCH["torch CPU"]
  HF --> SP["sentencepiece"]
  FAST --> NLTK["NLTK punkt assets"]
```

