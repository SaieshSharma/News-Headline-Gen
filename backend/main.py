import time
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration, pipeline
import torch

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODEL LOADING ---
LOCAL_MODEL_PATH = "./model_weights"
device = "cpu"

if os.path.exists(LOCAL_MODEL_PATH) and os.listdir(LOCAL_MODEL_PATH):
    print(f"--- 🏰 Loading your TRAINED model from {LOCAL_MODEL_PATH} ---")
    model_source = LOCAL_MODEL_PATH
else:
    print("--- 🌐 Local model not found. Using 't5-small' cloud weights ---")
    model_source = "t5-small"

tokenizer = T5Tokenizer.from_pretrained(model_source)
model = T5ForConditionalGeneration.from_pretrained(model_source).to(device)
sentiment_task = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
print("MODEL SOURCE:", model.config._name_or_path)
class Article(BaseModel):
    text: str

@app.get("/")
async def root():
     return {
        "status": "healthy",
        "model": model.config._name_or_path
    }

@app.post("/generate")
async def generate_summary(article: Article):

    start_time = time.time()

    sentiment_result = sentiment_task(article.text[:512])[0]

    with torch.no_grad():

        inputs = tokenizer(
            "summarize: " + article.text,
            return_tensors="pt",
            truncation=True,
            max_length=512
        ).to(device)

        output = model.generate(
            inputs["input_ids"],
            num_beams=5,
            max_length=40,
            min_length=10,
            early_stopping=True
        )

        summary = tokenizer.decode(
            output[0],
            skip_special_tokens=True
        )

    end_time = time.time()

    return {
        "summary": summary,
        "metadata": {
            "latency_ms": round((end_time - start_time) * 1000, 2),
            "input_tokens": inputs["input_ids"].shape[1],
            "device": device,
            "model": model.config._name_or_path,
            "sentiment": sentiment_result["label"],
            "score": round(sentiment_result["score"], 4)
        }
    }