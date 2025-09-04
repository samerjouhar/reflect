Got it — here’s your updated README with the **OpenAI API** integrated info woven into the existing sections, without adding new sections:

# Reflect
**A private, AI-powered journaling companion.**

Reflect helps you build a consistent journaling habit with **encrypted, on-device storage**, mood tracking, and insightful monthly reflections — all while keeping your data 100% private.

---

## Features
- **Local-only encryption** – your entries never leave your browser.
- **Quick feelings & dynamic prompts** to make writing easier.
- **Mood trend chart** to visualize emotional patterns over time.
- **Monthly reflections** that highlight recurring themes.
- **Offline-first** – works without an internet connection.
- **AI-powered reflections** – uses the OpenAI API to generate summaries, suggestions, and recurring theme analysis from your entries.

---

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
````

2. **Set up environment variables**
   Create a `.env` file and add your OpenAI API key:

   ```bash
   VITE_OPENAI_API_KEY=your_api_key_here
   ```
3. **Run locally**

   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠 Tech Stack

* [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* [Recharts](https://recharts.org/) for data visualization
* [CryptoJS](https://www.npmjs.com/package/crypto-js) for encryption
* [Sentiment](https://www.npmjs.com/package/sentiment) for mood scoring
* [OpenAI API](https://platform.openai.com/docs/) for natural language processing, embeddings, and monthly reflection generation