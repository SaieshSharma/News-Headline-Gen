from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

app = FastAPI()

# Enable CORS so your React app can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load T5-Small from the internet temporarily
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "t5-small" 

print(f"Loading {model_name} on {device}...")
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name).to(device)

class Article(BaseModel):
    text: str

@app.post("/generate")
async def generate_headlines(article: Article):
    input_text = "summarize: " + article.text
    inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512).to(device)
    
    with torch.no_grad():
        outputs = model.generate(inputs["input_ids"], max_length=30, num_beams=4)
    
    headline = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"headline": headline}