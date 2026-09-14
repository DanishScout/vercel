# 1. Brug en officiel, let Python-byggesten
FROM python:3.10-slim

# 2. Installer de nødvendige Linux-pakker for at Google Chrome kan køre
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# 3. Hent og installer den officielle Google Chrome browser stable version
RUN wget -q -O - https://google.com | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://google.com stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# 4. Sæt arbejdsmappen inde i containeren
WORKDIR /app

# 5. Kopier dine requirements og installer alle Python-pakker (inkl. selenium og selenium-stealth)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Kopier resten af dine backend-filer (app.py, routers, data-filer osv.) ind i containeren
COPY . .

# 7. Start din FastAPI applikation på den port, Google Cloud Run tildeler den
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}"]
