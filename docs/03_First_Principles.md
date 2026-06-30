# First Principles

This document explains the concepts actually used in NewsScribe. Technologies not present in the repository, such as Kubernetes, Terraform, Redis, JWT, OAuth, WebSockets, vector databases, RAG, and Postgres, are not part of the current implementation.

## React

| Topic | Explanation |
|---|---|
| Definition | React is a JavaScript library for building user interfaces from components. |
| First principles | A UI is a function of state. When state changes, React computes what the screen should look like and updates the DOM. |
| Why invented | Direct DOM manipulation becomes hard to reason about as screens gain state and interactions. |
| How it works internally | React builds a virtual representation of the UI, compares it with the previous render, and commits changes to the browser DOM. |
| Project usage | [`frontend/src/App.jsx`](../frontend/src/App.jsx) uses `useState` for input text, result, loading, and error state. |
| Alternatives | Vue, Svelte, plain JavaScript, server-rendered templates. |
| Pitfalls | State updates are asynchronous; component rerenders can surprise developers; large components become hard to maintain. |
| Best practices | Keep components focused, isolate API logic, handle loading/error/empty states explicitly. |

## JavaScript and JSX

| Topic | Explanation |
|---|---|
| Definition | JavaScript is the browser runtime language; JSX is syntax that lets React components describe UI with HTML-like tags. |
| First principles | Browser code reacts to events, mutates state, and performs network requests. |
| Project usage | `handleSummarize`, `exportToPDF`, and `ResultCard` are defined in [`frontend/src/App.jsx`](../frontend/src/App.jsx). |
| Alternatives | TypeScript, Elm, ClojureScript. |
| Pitfalls | Runtime type errors, encoding issues, and unhandled promise failures. |
| Best practices | Validate API responses, avoid mixing too many responsibilities in one component, prefer TypeScript for larger apps. |

## Vite

| Topic | Explanation |
|---|---|
| Definition | Vite is a frontend build tool and dev server. |
| First principles | During development, modules can be served directly to modern browsers. For production, files are bundled and optimized. |
| Project usage | [`frontend/vite.config.js`](../frontend/vite.config.js) enables React and Tailwind plugins. |
| Alternatives | Webpack, Parcel, Next.js. |
| Pitfalls | Environment variables must use the `VITE_` prefix to be exposed to browser code. |
| Best practices | Keep build config small and use `.env` only for non-secret browser-safe values. |

## Tailwind CSS

| Topic | Explanation |
|---|---|
| Definition | Tailwind is a utility-first CSS framework. |
| First principles | Instead of writing many named CSS classes, compose small single-purpose classes in markup. |
| Project usage | [`frontend/src/index.css`](../frontend/src/index.css) defines theme colors and base body styles; [`App.jsx`](../frontend/src/App.jsx) uses utility classes. |
| Alternatives | Plain CSS, CSS Modules, Sass, styled-components. |
| Pitfalls | Markup can become visually dense; inconsistent utility composition can create design drift. |
| Best practices | Centralize theme tokens and extract repeated UI patterns. |

## HTTP and REST

| Topic | Explanation |
|---|---|
| Definition | HTTP is the request/response protocol of the web. REST-style APIs expose resources/actions through URLs and methods. |
| First principles | A client sends method, URL, headers, and body; a server returns status, headers, and body. |
| Project usage | The frontend uses `fetch` to call `POST /generate` and `POST /scrape`; the backend exposes those routes in [`backend/main.py`](../backend/main.py). |
| Alternatives | GraphQL, gRPC, WebSockets. |
| Pitfalls | Missing error handling, CORS failures, mixed HTTP/HTTPS content. |
| Best practices | Return meaningful status codes, validate input, keep response schemas stable. |

## CORS

| Topic | Explanation |
|---|---|
| Definition | Cross-Origin Resource Sharing controls whether browser JavaScript can call a different origin. |
| First principles | Browsers protect users by blocking cross-origin reads unless the server permits them. |
| Project usage | FastAPI allows all origins, methods, and headers in [`backend/main.py`](../backend/main.py). |
| Alternatives | Same-origin deployment through a reverse proxy, strict allowlist. |
| Pitfalls | `allow_origins=["*"]` is permissive. |
| Best practices | In production, allow only known frontend origins unless public API access is intentional. |

## FastAPI

| Topic | Explanation |
|---|---|
| Definition | FastAPI is a Python web framework for building APIs. |
| First principles | Decorated Python functions map to HTTP routes; Pydantic models validate JSON input. |
| Project usage | [`backend/main.py`](../backend/main.py) defines `/`, `/generate`, and `/scrape`. |
| Alternatives | Flask, Django REST Framework, Starlette. |
| Pitfalls | CPU-heavy work inside request handlers blocks capacity. |
| Best practices | Validate inputs, separate business logic, add observability, and avoid broad exception masking where possible. |

## Pydantic

| Topic | Explanation |
|---|---|
| Definition | Pydantic validates and parses Python data based on type annotations. |
| First principles | Data crossing a boundary should be checked before business logic uses it. |
| Project usage | `Article` and `ScrapeRequest` models in [`backend/main.py`](../backend/main.py). |
| Alternatives | dataclasses plus manual validation, Marshmallow. |
| Pitfalls | Validation only covers declared shape; semantic checks still need code. |
| Best practices | Keep request/response schemas explicit and version them when public clients depend on them. |

## Docker

| Topic | Explanation |
|---|---|
| Definition | Docker packages an application with its runtime dependencies into an image, then runs it as a container. |
| First principles | An image is a filesystem plus metadata; a container is a running isolated process created from that image. |
| Why invented | "Works on my machine" happens when environments differ. Containers make runtime environments reproducible. |
| Project usage | [`backend/Dockerfile`](../backend/Dockerfile) builds a Python 3.11 slim image, installs dependencies, downloads NLTK assets, and starts Uvicorn. |
| Alternatives | Direct VM install, Conda environment, serverless container service. |
| Pitfalls | Large images, missing system libraries, secrets baked into images, missing mounted files. |
| Best practices | Pin dependencies, keep images small, mount large mutable artifacts, add health checks. |

## Linux, Processes, and Threads

| Topic | Explanation |
|---|---|
| Definition | A process is a running program with isolated memory; threads are execution contexts inside a process. |
| First principles | CPU cores execute threads. Too many compute-heavy threads can cause context switching and cache contention. |
| Project usage | [`backend/main.py`](../backend/main.py) sets PyTorch intra-op and inter-op thread counts to `1`. |
| Alternatives | Let PyTorch auto-tune threads, use multiple worker processes, use GPU. |
| Pitfalls | Thread counts that are ideal on one host may be bad on another. |
| Best practices | Benchmark under production-like load and make tuning configurable. |

## Transformers

| Topic | Explanation |
|---|---|
| Definition | Transformers are neural network architectures built around attention mechanisms. |
| First principles | Instead of reading text strictly left-to-right, attention lets each token weigh other tokens when building representations. |
| Why invented | Earlier RNN/LSTM models struggled with long-range dependencies and parallel training. |
| How it works internally | Text becomes token IDs, IDs become embeddings, attention layers mix contextual information, feed-forward layers transform it, and output heads produce predictions. |
| Project usage | T5 generates summaries; DistilBERT classifies sentiment in [`backend/main.py`](../backend/main.py). |
| Alternatives | RNNs, CNN text models, extractive summarizers, hosted LLM APIs. |
| Pitfalls | Hallucination, domain bias, long-input truncation, expensive inference. |
| Best practices | Evaluate on representative data, cap inputs deliberately, expose model limitations to users. |

## Attention

| Topic | Explanation |
|---|---|
| Definition | Attention is a mechanism that scores how much one token should consider another token. |
| First principles | For each token, the model forms query, key, and value vectors. Query-key similarity determines how values are mixed. |
| Project usage | T5 and DistilBERT both rely on attention internally. |
| Pitfalls | Attention cost grows with sequence length, so longer inputs are slower and more memory-hungry. |
| Best practices | Choose max token lengths based on measured latency and quality. |

## Embeddings

| Topic | Explanation |
|---|---|
| Definition | Embeddings are numeric vectors representing tokens or text. |
| First principles | Neural networks cannot process raw strings; token IDs are mapped to vectors learned during training. |
| Project usage | Tokenizers in [`backend/main.py`](../backend/main.py) convert strings to token IDs, then models embed those IDs internally. |
| Alternatives | Bag-of-words, TF-IDF, character models. |
| Pitfalls | Tokenization differences can break model compatibility. |
| Best practices | Load tokenizer and model artifacts from compatible checkpoints. |

## T5

| Topic | Explanation |
|---|---|
| Definition | T5 is an encoder-decoder transformer that frames every task as text-to-text. |
| First principles | The encoder reads input text; the decoder generates output tokens autoregressively. |
| Project usage | Inputs are prefixed with `"summarize: "` in both training notebook and backend inference. |
| Alternatives | BART, Pegasus, GPT-style models, extractive methods. |
| Pitfalls | Inference speed depends heavily on decoding parameters; truncation can remove important context. |
| Best practices | Keep training and inference prefixes aligned; evaluate generation settings on real articles. |

## Fine-Tuning

| Topic | Explanation |
|---|---|
| Definition | Fine-tuning continues training a pretrained model on a task-specific dataset. |
| First principles | Pretraining teaches general language patterns; fine-tuning shifts behavior toward a target task. |
| Project usage | [`notebooks/headline_gen.ipynb`](../notebooks/headline_gen.ipynb) fine-tunes `t5-small` on CNN/DailyMail. |
| Alternatives | Prompting a hosted model, training from scratch, instruction-tuned checkpoints. |
| Pitfalls | Overfitting, dataset mismatch, weak evaluation. |
| Best practices | Keep validation split, log metrics, version datasets and training args. |

## ROUGE

| Topic | Explanation |
|---|---|
| Definition | ROUGE measures overlap between generated text and reference summaries. |
| First principles | It rewards n-gram and sequence overlap, not necessarily factual correctness. |
| Project usage | Notebook loads `evaluate.load("rouge")` and computes metrics during training. |
| Alternatives | BLEU, BERTScore, human review, factuality metrics. |
| Pitfalls | High ROUGE does not guarantee good or faithful summaries. |
| Best practices | Use ROUGE as one signal, not the only quality gate. |

## Reverse Proxy and Nginx

| Topic | Explanation |
|---|---|
| Definition | A reverse proxy receives public traffic and forwards it to internal services. |
| First principles | Clients talk to one stable public endpoint; internal apps can run on private ports. |
| Project usage | README describes Nginx terminating HTTPS and forwarding to FastAPI on `127.0.0.1:8000`. |
| Alternatives | Caddy, Traefik, cloud load balancer, direct Uvicorn exposure. |
| Pitfalls | Misconfigured headers, TLS renewal failures, proxy timeouts. |
| Best practices | Use HTTPS, rate limiting, health checks, and explicit upstream timeouts. |

## CI/CD and GitHub Actions

| Topic | Explanation |
|---|---|
| Definition | CI/CD automates build, test, and deployment tasks after code changes. |
| First principles | A repeatable script is safer than manual commands typed differently each time. |
| Project usage | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) builds and pushes Docker image, then restarts the EC2 container over SSH. |
| Alternatives | Manual deploy, Jenkins, GitLab CI, AWS CodeDeploy. |
| Pitfalls | Secrets leakage, deploying broken images, no rollback. |
| Best practices | Use immutable tags, health checks, staged rollouts, and least-privilege secrets. |

