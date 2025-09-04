# Reflect
**A private, AI-powered journaling companion.**

Reflect helps you build a consistent journaling habit with **encrypted, on-device storage**, mood tracking, and insightful monthly reflections — all while keeping your data 100% private.

## Design Documentation
For a deeper dive into the architecture, design tradeoffs, and tech stack, see the [Design Documentation](DOCUMENTATION.md).

---

## Features
- **Quick feelings & dynamic prompts** to make writing easier.
- **Mood trend chart** to visualize emotional patterns over time.
- **Monthly reflections** that highlight recurring themes.
- **AI-powered reflections** – uses the OpenAI API to generate summaries, suggestions, and recurring theme analysis from your entries.

---

## Getting Started

1. Clone the repo and install dependencies in both / (frontend) and /server (backend).

2. Run ChromaDB in Docker to handle embeddings + retrieval.

3. Create a .env file in /server with your OpenAI API key and model settings.

4. Start both servers: one for the API, one for the frontend UI.

---

## Tech Stack

* [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* [Recharts](https://recharts.org/) for data visualization
* [CryptoJS](https://www.npmjs.com/package/crypto-js) for encryption
* [Sentiment](https://www.npmjs.com/package/sentiment) for mood scoring
* [OpenAI API](https://platform.openai.com/docs/) for natural language processing, embeddings, and monthly reflection generation
