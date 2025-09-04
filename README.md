# Reflect
**A private, AI-powered journaling companion.**

Reflect helps you build a consistent journaling habit with **encrypted, on-device storage**, mood tracking, and insightful monthly reflections — all while keeping your data 100% private.

---
## Design Documentation
For a deeper dive into the architecture, design tradeoffs, and tech stack, see the [Design Documentation](DOCUMENTATION.md).

---
## Video Presentation
For a live tech demo, [watch here](https://youtu.be/9Nd6bHfSnm8).

---
## Features

-  **Quick feelings & dynamic prompts** to make writing easier.

-  **Mood trend chart** to visualize emotional patterns over time.

-  **Monthly reflections** that highlight recurring themes.

-  **AI-powered reflections** – uses the OpenAI API to generate summaries, suggestions, and recurring theme analysis from your entries.
---

## Tech Stack

* [React](https://react.dev/) + [Vite](https://vitejs.dev/)

* [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

* [Recharts](https://recharts.org/) for data visualization

* [CryptoJS](https://www.npmjs.com/package/crypto-js) for encryption

* [Sentiment](https://www.npmjs.com/package/sentiment) for mood scoring

* [OpenAI API](https://platform.openai.com/docs/) for natural language processing, embeddings, and monthly reflection generation

---
## Getting Started

### 0) What you’ll install (once)

- **Node.js 20 LTS** (includes `npm`)  
  - Recommended via **nvm** (Node Version Manager):
    ```bash
    # macOS/Linux
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    # restart your terminal, then:
    nvm install 20
    nvm use 20
    node -v   # should print v20.x
    npm -v    # should print 10.x or newer
    ```
  - Windows users: install Node.js 20 LTS from the official Node website.

- **Docker Desktop** (to run ChromaDB locally)  
  - Install Docker Desktop for your OS and open it once so it finishes setup.
  - Confirm it works:
    ```bash
    docker --version
    ```
---
### 1) Get the code

```bash
git clone https://github.com/<your-username>/reflect.git
cd reflect
```
----------
### 2) Install dependencies

**Frontend (React app):**

```bash
# from the project root
npm install
```

**Backend (API server):**

```bash
cd server
npm install
cd ..
```
----------
### 3) Configure environment variables (backend)

Create a file named `.env` inside the `server` folder. Open `server/.env` in a text editor and set these values:

```
# REQUIRED
OPENAI_API_KEY=sk-...your-key-here...

# OPTIONAL (defaults shown)
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
CHROMA_URL=http://localhost:8000
PORT=8787
```

**Where do I get OPENAI_API_KEY?**  
Create one in your OpenAI dashboard (Account → API Keys). Copy the key and paste it as the value for `OPENAI_API_KEY`.  
**Never commit this key** to Git.
---
### 4) Start ChromaDB (vector database)

Pull the official image and run it locally:

```bash
# pull latest Chroma image
docker pull ghcr.io/chroma-core/chroma:latest

# run it and keep data on your disk (creates ./chroma-data)
docker run -d --name chroma \
  -p 8000:8000 \
  -v "$PWD/chroma-data:/chroma" \
  ghcr.io/chroma-core/chroma:latest
```

Confirm it’s running:

```bash
docker ps           # should list a container named "chroma"
```

Stop/start later if needed:

```bash
docker stop chroma
docker start chroma
```
---
### 5) Run the backend (API server)

In a new terminal window:

```bash
cd reflect/server
npm run dev
```

You should see something like:

```
AI prompt server (RAG) running on http://localhost:8787
Chroma: http://localhost:8000 | Model: gpt-4o-mini | Key set: true
```

Health check (optional):

```bash
curl http://localhost:8787/api/health
```
---
### 6) Run the frontend (web app)

In another terminal window:

```bash
cd reflect
npm run dev
```

Open the app at:

```
http://localhost:5173
```

Once you visit the site and press **Unlock**, you should be presented with a page like this: 
<img width="1680" height="1050" alt="Screenshot 2025-09-04 at 5 43 42 PM" src="https://github.com/user-attachments/assets/ec44e940-b31e-4cd4-b497-99a955c4e09e" />

