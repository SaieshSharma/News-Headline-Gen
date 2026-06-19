# NewsScribe

A full-stack AI news aggregator that extracts web articles and generates abstractive headlines with a fine-tuned T5 model.

Live frontend: https://newsscribe.saieshsharma.me

Live backend API: https://api.saieshsharma.me

## Architecture

```text
[ Next.js Client via Vercel ]
               |
               v
( Port 443 HTTPS )
               |
               v
[ Nginx Reverse Proxy & Rate Limiter on AWS EC2 ]
               |
               v
( Internal Port Mapping )
               |
               v
[ Docker Container running Python FastAPI Engine + T5 Model ]
```

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Backend application layer: Python, FastAPI
- Machine learning: HuggingFace Transformers, PyTorch, fine-tuned T5 model weights
- DevOps and cloud: Docker, AWS EC2, Nginx, Certbot (Let's Encrypt SSL)

## Production Hardening Features

- Nginx terminates public traffic on port 443 and forwards requests to the internal FastAPI service at `http://127.0.0.1:8000`.
- Let's Encrypt certificates are handled through Certbot so HTTPS stays in place without manual renewal work.
- The reverse proxy also avoids browser-side CORS and mixed-content failures by presenting a single secure public origin.
- Rate limiting is defined in `nginx.conf` with `limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s` and enforced with `limit_req zone=api_limit burst=10 nodelay` to keep bot traffic from exhausting the model process.
- The FastAPI container uses `--restart unless-stopped` so the service comes back after an unexpected EC2 host reboot.

## Local Development Setup

```bash
# Build the backend Docker image
cd backend
docker build -t newsscribe-backend .

# Run the backend on port 8000
docker run -d --name newsscribe-backend --restart unless-stopped -p 8000:8000 newsscribe-backend

# Start the frontend dev environment
cd ../frontend
npm install
npm run dev
```