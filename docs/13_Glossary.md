# Glossary

| Term | Meaning in This Project |
|---|---|
| Abstractive summarization | Generating new summary text rather than only selecting source sentences. T5 performs this task. |
| API | HTTP interface exposed by FastAPI: `/`, `/generate`, and `/scrape`. |
| ASGI | Python async server interface used by FastAPI/Uvicorn. |
| Attention | Transformer mechanism that lets tokens weigh other tokens when forming contextual representations. |
| BeautifulSoup | Python HTML parsing library used as a fallback article extractor. |
| Beam search | A decoding strategy that explores multiple likely output sequences. NewsScribe uses greedy decoding instead for speed. |
| Certbot | Tool mentioned in README for Let's Encrypt certificate management. |
| CNN/DailyMail | News summarization dataset used in the training notebook. |
| CORS | Browser security policy controlling cross-origin API calls. |
| Docker image | Packaged backend filesystem/runtime built from `backend/Dockerfile`. |
| Docker container | Running instance of the backend image. |
| DockerHub | Registry where GitHub Actions pushes the backend image. |
| DistilBERT | Smaller BERT-style transformer used for sentiment classification. |
| EC2 | AWS virtual machine hosting the backend container and Nginx proxy. |
| Embedding | Numeric vector representation of a token or text unit inside a model. |
| FastAPI | Python framework used for backend routes. |
| Fine-tuning | Continuing pretrained model training on task-specific data. |
| Greedy decoding | Generation mode that picks the best next token at each step; used with `num_beams=1`. |
| HuggingFace Transformers | Library used to load T5, DistilBERT, tokenizers, and generation utilities. |
| Inference | Running a trained model to produce predictions. |
| jsPDF | Browser library used to export summary reports as PDF. |
| Metadata | Extra response data: latency, input tokens, device, sentiment, score. |
| Nginx | Reverse proxy described in README for HTTPS, forwarding, and rate limiting. |
| NLTK | NLP toolkit dependency; punkt assets are downloaded into the Docker image. |
| `newspaper4k` | Article extraction library used for URL scraping. |
| Pydantic | Data validation library used by FastAPI request models. |
| PyTorch | Tensor library and model execution runtime. |
| Rate limiting | Restricting request frequency; README describes Nginx `5r/s` with burst `10`. |
| React | Frontend UI library used for the single-page app. |
| ROUGE | Summary evaluation metric used in the notebook. |
| Safetensors | Model weight file format used by T5 and sentiment artifacts. |
| SentencePiece | Tokenization dependency commonly used by T5 tokenizers. |
| Sentiment analysis | Classifying text as positive or negative with DistilBERT SST-2. |
| SST-2 | Stanford Sentiment Treebank binary sentiment task used by the DistilBERT checkpoint. |
| Tailwind CSS | Utility-first CSS framework used for styling. |
| T5 | Text-to-text transformer used for summarization. |
| Token | Integer-coded text piece consumed by a model. |
| Tokenizer | Converts strings into token IDs and back. |
| Uvicorn | ASGI server that runs the FastAPI app. |
| Vercel | Frontend hosting platform referenced by the production frontend URL. |
| Vite | Frontend dev/build tool. |
| Volume | Docker mount that maps host model directories into the container. |

