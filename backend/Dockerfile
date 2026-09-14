# 1. Brug en officiel, let Python-byggeklods
FROM python:3.10-slim

# 2. Installer de nødvendige Linux-værktøjer
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    ca-certificates \
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# 3. Hent den officielle Google Chrome browser via den nye, sikre nøgle-metode
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# 4. Sæt arbejdsmappen inde i containeren
WORKDIR /app

# 5. Kopier requirements og installer alle Python-pakker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Kopier resten af dine backend-filer ind i containeren
COPY . .

# 7. Start din FastAPI applikation på den port, Google Cloud Run tildeler den
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}"]
