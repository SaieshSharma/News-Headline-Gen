from fastapi import FastAPI
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

app = FastAPI()

# Load model (assume it's in a folder called 'model_weights')
device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = T5Tokenizer.from_pretrained("./model_weights")
model = T5ForConditionalGeneration.from_pretrained("./model_weights").to(device)

class NewsInput(BaseModel):
    text: str

@app.post("/generate-variants")
async def generate_variants(input_data: NewsInput):
    text = "summarize: " + input_data.text
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(device)
    
    # Variant 1: Conservative (Beam Search)
    out1 = model.generate(inputs["input_ids"], num_beams=5, max_length=20)
    
    # Variant 2: Creative (Sampling + Temperature)
    # Temperature > 1.0 makes the model "braver" with word choices
    out2 = model.generate(inputs["input_ids"], do_sample=True, temperature=1.2, top_k=50, max_length=20)
    
    # Variant 3: Concise (Length Penalty)
    out3 = model.generate(inputs["input_ids"], length_penalty=0.5, max_length=15)

    return {
        "professional": tokenizer.decode(out1[0], skip_special_tokens=True),
        "creative": tokenizer.decode(out2[0], skip_special_tokens=True),
        "concise": tokenizer.decode(out3[0], skip_special_tokens=True)
    }