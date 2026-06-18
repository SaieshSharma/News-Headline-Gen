# 🛠️ Installation & Setup Guide

This guide details the steps required to get the **News Scribe** environment running locally on your machine.

---

### 📋 Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **NVIDIA GPU** (Optional, but recommended for CUDA acceleration)

---

### 🔹 1. Model Preparation
Once you have the fine-tuned model files from the training session:
1. Create the directory: `backend/model_weights/`
2. Extract the following files into that folder:
   - `pytorch_model.bin`
   - `config.json`
   - `tokenizer_config.json`
   - `special_tokens_map.json`
   - `vocab.json` / `tokenizer.model`

---

### 🔹 2. Backend Setup (FastAPI)
Navigate to the backend directory and initialize the Python environment.

```bash
# Enter backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\\venv\\Scripts\\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload

# Enter frontend directory
cd frontend

# Install packages
npm install

# Start the development server
npm run dev