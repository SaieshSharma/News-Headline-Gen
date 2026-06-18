# 📜 NewsScribe

### 🖋️ Executive Summary
**NewsScribe** is an AI-powered application for news summarization and sentiment analysis. It converts long-form news articles into concise summaries and provides sentiment scoring to help editors gauge tone. The frontend delivers a modern interface for submitting articles and viewing summarized outputs with sentiment metadata.

---

### 🧠 The Intelligence (Model & Training)
* **Base Architecture:** `t5-small` (Encoder-Decoder Transformer)
* **Dataset:** 10% slice (~28,000 samples) of the **CNN/DailyMail** dataset.
* **Training Strategy:**
    * Fine-tuned for 3 epochs on a T4 GPU.
    * 90/10 Train-Validation split for robust generalization.
    * **Mixed Precision (FP16)** utilized to optimize training throughput.
* **Performance Metrics:**
    * **ROUGE-1:** ~0.25 (Measuring unigram overlap).
    * **ROUGE-L:** ~0.20 (Ensuring structural and sequential consistency).

---

### 🛠️ The Tech Stack
* **Backend:** FastAPI (Python) - High-performance, asynchronous inference.
* **Frontend:** Vite + React (JavaScript) - Modern, fast, and responsive.
* **Styling:** Tailwind CSS v4 - Utilizing a "Medieval-Minimal" design system.
* **Inference Engine:** PyTorch + Hugging Face Transformers.

---

### ⚙️ Decoding Strategies (The "Voices")
To provide utility to the end-user, the backend implements three distinct decoding logic gates:

| Voice | Strategy | Technical Reasoning |
| :--- | :--- | :--- |
| **The Royal Record** | **Beam Search** | Explores multiple paths to find the mathematically highest probability sequence. Reliable and formal. |
| **The Bard's Tale** | **Top-P Sampling** | Nucleus sampling ($p=0.95$) + Temperature ($0.9$) to allow for creative word choices and higher entropy. |
| **The Messenger** | **Length Penalty** | Applied length penalty ($0.5$) to force the model toward extreme brevity for "breaking news" style alerts. |

---

### 📊 Observability (The Technical Ledger)
The application features a built-in **Metadata Ledger** for real-time performance monitoring:
* **Inference Latency:** Measured in milliseconds ($ms$).
* **Token Count:** Displays the complexity of the input article.
* **Hardware Tracking:** Detects if the engine is running on **CUDA** (RTX 3050) or **CPU**.

---

### 📁 Project Structure
```text
news-scribe/
├── backend/                 # FastAPI Logic
│   ├── model_weights/       # Local Fine-tuned Weights (.bin, .json)
│   └── main.py              # Inference Server
├── frontend/                # Vite + React Source
│   ├── src/                 # UI Components
│   └── index.css            # Tailwind v4 Theme
├── notebooks/               # Research & Training
│   └── headline_gen.ipynb   # Colab Training History
└── README.md