# Data Flow

## Text Input Flow

```mermaid
sequenceDiagram
  participant User
  participant App as frontend/src/App.jsx
  participant API as backend/main.py
  participant Sent as Sentiment model
  participant T5 as T5 summarizer

  User->>App: Paste article text
  App->>App: isUrl = false
  App->>API: POST /generate {"text": "..."}
  API->>API: Validate Article model
  API->>API: Reject empty text
  API->>Sent: Tokenize first 384 chars
  Sent-->>API: label and score
  API->>T5: Tokenize "summarize: " + raw_text, max_length=320
  T5-->>API: Generated token IDs
  API->>API: Decode summary and compute latency
  API-->>App: summary + metadata
  App->>User: Render summary, metadata, PDF/copy controls
```

## URL Input Flow

```mermaid
sequenceDiagram
  participant User
  participant App as React frontend
  participant API as FastAPI
  participant News as newspaper4k
  participant BS as BeautifulSoup
  participant Model as Inference pipeline

  User->>App: Paste URL
  App->>App: isUrl = true
  App->>API: POST /scrape {"url": "..."}
  API->>API: Trim and validate URL scheme
  API->>News: Download and parse
  News-->>API: article.text + article.html
  API->>API: Check junk phrases and length
  alt Junk or too short
    API->>BS: Remove script/style/nav/header/footer/aside
    BS-->>API: Paragraph text blocks
    API->>API: Keep paragraphs longer than 50 chars without bad phrases
  end
  API->>API: Reject if extracted text < 150 chars
  API->>Model: Summarize extracted_text[:4000]
  Model-->>API: summary + metadata
  API-->>App: JSON response
```

## Backend Data Objects

| Object | Defined In | Fields | Purpose |
|---|---|---|---|
| `Article` | [`backend/main.py`](../backend/main.py) | `text: str` | Request model for direct text summarization. |
| `ScrapeRequest` | [`backend/main.py`](../backend/main.py) | `url: str` | Request model for URL scraping and summarization. |
| Inference response | [`backend/main.py`](../backend/main.py) | `summary`, `metadata` | Unified response shape for both endpoints. |
| Metadata | [`backend/main.py`](../backend/main.py) | `latency_ms`, `input_tokens`, `device`, `sentiment`, `score` | Operational and model side-channel details shown in frontend. |

## Important Transformations

| Step | Input | Transformation | Output |
|---|---|---|---|
| URL detection | User textarea string | `startsWith("http://") || startsWith("https://")` | Endpoint choice |
| URL validation | JSON URL | Trim and require HTTP/HTTPS prefix | Accepted target URL or 400 |
| Article parsing | URL | `newspaper4k` download/parse | Candidate article text |
| Fallback parsing | HTML | Remove layout tags, collect valid paragraphs | Better article body |
| Sentiment truncation | Raw text | First 384 characters, tokenizer max 384 | DistilBERT inputs |
| T5 prompt | Raw text | Prefix with `summarize:`, max 320 tokens | T5 input IDs |
| Decoding | Generated IDs | `tokenizer.decode(..., skip_special_tokens=True)` | Summary string |
| PDF export | Browser result object | jsPDF text and metadata rendering | Local PDF file |

## Error Flow

| Failure | Location | User-Facing Result |
|---|---|---|
| Empty direct text | `/generate` | HTTP 400 `Empty text stream.` |
| URL missing HTTP/HTTPS | `/scrape` | HTTP 400 `Invalid URI.` |
| Extracted text too short | `/scrape` | HTTP 400 `Unable to safely parse main news body from this layout.` |
| Unexpected scraping/inference exception | `/scrape` catch block | HTTP 500 with exception string |
| Network/API error in browser | `handleSummarize` catch | Error panel in UI |

## Data That Is Not Stored

NewsScribe currently does not persist:

| Data | Reason |
|---|---|
| User accounts | No authentication system exists. |
| Article URLs or text | No database or file logging in repo. |
| Generated summaries | Rendered in browser only. |
| Sentiment history | Returned per request only. |
| Feedback labels | No feedback UI or backend endpoint. |

