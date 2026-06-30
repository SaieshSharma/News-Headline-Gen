# Learning Journal

This journal reconstructs lessons from code, notebook choices, and git history. Where intent is not explicit, entries are marked **Assumption**.

## Product Lessons

| Lesson | Evidence |
|---|---|
| A single-textarea workflow is enough for an MVP. | [`frontend/src/App.jsx`](../frontend/src/App.jsx) supports both URLs and pasted text by detecting URL prefixes. |
| Users need feedback while inference runs. | The frontend includes `loading`, disabled button state, and `ScribeLoader`. |
| Output needs utility beyond display. | PDF export and clipboard copy exist in the result card. |
| Metadata makes AI behavior more inspectable. | Latency, token count, device, sentiment, and score are returned by backend. |

## Backend Lessons

| Lesson | Evidence |
|---|---|
| Scraping needs fallbacks. | `/scrape` first uses `newspaper4k`, then BeautifulSoup paragraph extraction. |
| NLTK data should be baked into container images. | Dockerfile downloads `punkt` and `punkt_tab`; backend points NLTK to `/app/nltk_data`. |
| Model compatibility is fragile. | Git history shows repeated tokenizer/config fixes before stabilization. |
| Broad catch blocks are useful early but risky later. | `/scrape` catches `Exception` and returns `str(err)`. |

## AI Lessons

| Lesson | Evidence |
|---|---|
| Training and inference prefixes must match. | Notebook and backend both use `summarize:`. |
| ROUGE is easy to add but incomplete. | Notebook computes ROUGE; no factuality/human eval exists. |
| CPU generation settings strongly affect usability. | Git history includes beam removal, KV cache, and thread throttling commits. |
| A sentiment classifier can add value, but binary labels are blunt. | DistilBERT SST-2 returns only POSITIVE/NEGATIVE. |

## Deployment Lessons

| Lesson | Evidence |
|---|---|
| Large model files should not live in normal git. | `.gitignore` excludes model directories. |
| Host-mounted volumes reduce image size. | Deploy workflow mounts `/home/ubuntu/model_weights` and `/home/ubuntu/sentiment_model`. |
| Single-host Docker deploys need stale state cleanup. | Deploy script removes port hogs, old named container, cached image, and prunes images. |
| HTTPS and reverse proxying simplify browser integration. | README explains Nginx TLS, proxying, rate limiting, and mixed-content avoidance. |

## Mistakes and Recovery Signals

Git history shows a real stabilization path:

| Pattern | Example Commits |
|---|---|
| Dependency/version fixes | `c361ca6`, `3ac1e8c`, `983f429` |
| Tokenizer/model loading fixes | `5a587a8`, `8fc91f5`, `b6ad208`, `13b4919` |
| Scraper fixes | `44ead2d`, `fcfc089` |
| Performance tuning | `451e801`, `7656efb` |
| Reverting unsafe optimization | `0124ad0` reverted native torch compilation graph layers |

The important engineering lesson: a local ML web app has more failure modes than a conventional CRUD app. Model files, tokenizers, native dependencies, CPU scheduling, HTML extraction, and deployment state all interact.

## Architecture Lessons

| Lesson | Future Implication |
|---|---|
| Keep the MVP stateless until persistence is truly needed. | Database work can wait for history, caching, or feedback features. |
| Put slow model work behind explicit boundaries. | `run_pipeline_inference` should eventually become a service module or worker. |
| Separate extraction quality from generation quality. | Store or log extracted text length and source parser outcome. |
| Make operational settings configurable. | Thread counts and generation settings should become env vars. |

## Performance Lessons

| Choice | Performance Effect |
|---|---|
| `num_beams=1` | Faster generation than beam search. |
| `max_length=320` | Less encoder work than 512-token inference. |
| `max_new_tokens=70` | Bounded decoder work. |
| Single PyTorch thread | Reduces virtual-core thrashing on constrained EC2. |
| Sentiment truncation to 384 chars | Keeps sentiment side-pass cheap. |

