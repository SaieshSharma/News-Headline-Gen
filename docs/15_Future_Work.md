# Future Work

## Highest-Leverage Improvements

| Priority | Work | Why |
|---|---|---|
| P0 | Add readiness health check that verifies model files loaded. | Current `/` only proves the app can respond, not that inference is ready. |
| P0 | Align frontend fallback API port with backend docs. | Frontend defaults to `8001`, README backend command uses `8000`. |
| P1 | Add structured response models and error codes. | Stabilizes frontend/backend contract. |
| P1 | Make generation/thread settings environment-configurable. | CPU tuning should change by host size without code edits. |
| P1 | Add deployment image tags by commit SHA. | Enables reliable rollback. |
| P2 | Split backend into modules. | `main.py` is readable but will grow awkward as features expand. |

## Refactoring Roadmap

Proposed backend structure:

```text
backend/
  app/
    main.py
    api/
      routes.py
      schemas.py
    services/
      inference.py
      scraping.py
    core/
      config.py
      model_loader.py
```

Why:

| Module | Responsibility |
|---|---|
| `schemas.py` | Pydantic request/response contracts. |
| `scraping.py` | URL extraction and fallback logic. |
| `inference.py` | Sentiment and T5 generation. |
| `model_loader.py` | Startup model loading and readiness checks. |
| `config.py` | Environment variables for paths, device, generation settings. |

## Scaling Roadmap

| Stage | Architecture |
|---|---|
| Current | One backend container on one EC2 host. |
| Next | Add request timeouts, readiness checks, structured logs. |
| Moderate | Add Redis queue for slow jobs and cache repeated URLs. |
| Larger | Separate scraping service from inference service. |
| Large | Use GPU inference or managed model endpoint; autoscale frontend/API separately. |

## AI Research Directions

| Direction | Reason |
|---|---|
| Compare T5-small with BART/Pegasus | News summarization may improve with summarization-specialized checkpoints. |
| Add factuality checks | Abstractive summaries can hallucinate. |
| Add extraction confidence | Many bad summaries start with bad scraped text. |
| Train/evaluate on more diverse sources | CNN/DailyMail may not represent all news styles. |
| Replace binary sentiment | News tone often needs neutral, mixed, financial risk, urgency, or topic labels. |

## Product Ideas

| Feature | Notes |
|---|---|
| Summary history | Requires database and privacy policy decisions. |
| User feedback buttons | Creates training/evaluation signal. |
| Multiple summary lengths | Expose concise/standard/detailed generation presets. |
| Article preview | Show extracted title/source/text snippet before summarizing. |
| Batch URL mode | Useful for news monitoring, but needs queueing/rate limits. |
| Export formats | Markdown, DOCX, or email-ready brief. |

## Operational Improvements

| Improvement | Why |
|---|---|
| JSON structured logs | Easier debugging and dashboards. |
| Latency histograms | Track p50/p95/p99 model behavior. |
| Scrape failure metrics | Identify domains needing custom extractors. |
| Nginx config in repo | Makes production recoverable from code alone. |
| Backup model artifact process | Rebuild server without hunting for local files. |
| Automated smoke test after deploy | Catch broken containers before declaring success. |

## Security Improvements

| Improvement | Why |
|---|---|
| Restrict CORS origins | Avoid overly broad browser access. |
| Validate URL hosts | Reduce SSRF risk from arbitrary backend URL fetches. |
| Add request size limits | Prevent memory and latency abuse. |
| Avoid returning raw exception strings | Reduce information leakage. |
| Add rate limits at app/proxy layer | Nginx rate limit exists per README; app-level protection can add defense in depth. |

