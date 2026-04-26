import time
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SMART MODEL LOADER ---
# This path points to where you will unzip your Colab file
LOCAL_MODEL_PATH = "./model_weights"
device = "cuda" if torch.cuda.is_available() else "cpu"

if os.path.exists(LOCAL_MODEL_PATH) and os.listdir(LOCAL_MODEL_PATH):
    print(f"--- 🏰 Loading your TRAINED scribe model from {LOCAL_MODEL_PATH} ---")
    model_source = LOCAL_MODEL_PATH
else:
    print("--- 🌐 Local model not found. Using 't5-small' from the cloud temporarily ---")
    model_source = "t5-small"

tokenizer = T5Tokenizer.from_pretrained(model_source)
model = T5ForConditionalGeneration.from_pretrained(model_source).to(device)

class Article(BaseModel):
    text: str

@app.post("/generate")
async def generate_headlines(article: Article):
    start_time = time.time()
    # Professional standard: Add the task prefix
    input_text = "summarize: " + article.text
    inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512).to(device)
    input_token_count = inputs["input_ids"].shape[1] # Count the tokens

    with torch.no_grad():
        # Using 3 different decoding strategies to give the user variety
        # 1. Conservative
        out1 = model.generate(inputs["input_ids"], num_beams=4, max_length=25)
        # 2. Creative
        out2 = model.generate(inputs["input_ids"], do_sample=True, temperature=0.9, top_p=0.95, max_length=25)
        # 3. Concise
        out3 = model.generate(inputs["input_ids"], length_penalty=0.5, max_length=15)


        end_time = time.time()
        latency = round((end_time - start_time) * 1000, 2) # Convert to ms
    
    return {
"results": {
            "royal": tokenizer.decode(out1[0], skip_special_tokens=True),
            "bard": tokenizer.decode(out2[0], skip_special_tokens=True),
            "messenger": tokenizer.decode(out3[0], skip_special_tokens=True)
        },
        "metadata": {
            "latency_ms": latency,
            "input_tokens": input_token_count,
            "device": device,
            "model": "T5-Small (Fine-tuned)"
        }
    }