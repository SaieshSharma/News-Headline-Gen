FROM python:3.11-bookworm

WORKDIR /app

COPY requirements.txt .

# Enforce pure CPU package distribution mappings explicitly
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple \
    -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]