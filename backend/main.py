import time
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
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

class Article(BaseModel):
    text: str

@app.post("/generate")
async def generate_headlines(article: Article):
    start_time = time.time()
    
    # Task prefixes tell T5 exactly what kind of headline to generate
    # 1. 'headline:' triggers a formal title mode
    # 2. 'summarize:' triggers a descriptive overview
    # 3. 'tldr:' triggers a punchy, short alert
    prompts = {
        "royal": "headline: ", 
        "bard": "summarize: ", 
        "messenger": "tldr: "
    }

    results = {}
    with torch.no_grad():
        # --- 1. PRIMARY FORMAL HEADLINE ---
        input_1 = tokenizer(prompts["royal"] + article.text, return_tensors="pt", truncation=True, max_length=512).to(device)
        out1 = model.generate(
            input_1["input_ids"], 
            num_beams=5, 
            max_length=40, 
            min_length=10, 
            early_stopping=True
        )
        results["royal"] = tokenizer.decode(out1[0], skip_special_tokens=True)

        # --- 2. DETAILED/DESCRIPTIVE HEADLINE ---
        input_2 = tokenizer(prompts["bard"] + article.text, return_tensors="pt", truncation=True, max_length=512).to(device)
        out2 = model.generate(
            input_2["input_ids"], 
            do_sample=True, 
            temperature=0.7, 
            max_length=60, 
            top_p=0.9
        )
        results["bard"] = tokenizer.decode(out2[0], skip_special_tokens=True)

        # --- 3. SHORT BREAKING NEWS ALERT ---
        input_3 = tokenizer(prompts["messenger"] + article.text, return_tensors="pt", truncation=True, max_length=512).to(device)
        out3 = model.generate(
            input_3["input_ids"], 
            max_length=20, 
            length_penalty=2.5, 
            num_beams=2
        )
        results["messenger"] = tokenizer.decode(out3[0], skip_special_tokens=True)

    end_time = time.time()
    
    return {
        "results": results,
        "metadata": {
            "latency_ms": round((end_time - start_time) * 1000, 2),
            "input_tokens": input_1["input_ids"].shape[1],
            "device": device,
            "model": "T5-Small (News-Optimized)"
        }
    }