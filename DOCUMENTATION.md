# Reflect: Design Documentation

Reflect is a privacy-first journaling application that encourages consistent writing while providing personalized insights. The system combines a modern frontend with a lightweight backend that integrates retrieval-augmented generation (RAG). The focus is on clear separation of concerns, local-first storage, and minimizing how much user data is exposed to external services.


## Architecture

The system is split into three major parts: the frontend, the backend, and the vector database. The frontend is a React application built with Vite and TailwindCSS. It provides the user interface for writing, viewing, and reflecting on journal entries. All entries are encrypted locally using a passphrase before being stored, and the frontend is responsible for unlocking and persisting them.

The backend is implemented as a Node.js server using Express. Its job is to handle indexing of new journal entries, coordinate with the vector database, and call the OpenAI API when a prompt or reflection needs to be generated. It exposes endpoints for saving new entries, generating a daily prompt, and producing a monthly reflection. The backend does not store user entries in raw form; it only manages embeddings and metadata.

The vector database is ChromaDB, which acts as the long-term semantic memory for the system. Each journal entry is converted into an embedding using the OpenAI `text-embedding-3-small` model. The embedding is stored in Chroma along with metadata such as the entry date, a numeric timestamp, a sentiment score, and themes extracted from the text. When a prompt or reflection is requested, the backend queries Chroma to retrieve the most relevant past entries. The retrieved context is then passed to the OpenAI generation model, specifically`gpt-4o-mini`, which produces the final journaling prompt or monthly summary.


## Design Choices

The most important design choice is the local-first storage model. Journals are highly sensitive, so the application encrypts entries on-device with a passphrase known only to the user. This ensures that the raw text never leaves the user’s machine. Only embeddings and minimal metadata are stored in Chroma, and only small snippets of relevant entries are ever passed to OpenAI for prompt generation.

Another significant choice is the adoption of retrieval-augmented generation. Instead of sending the full journal history to OpenAI, which would be expensive and a privacy concern, the system retrieves only the top few relevant entries from Chroma. This makes the experience more personal while reducing cost and improving privacy.

Metadata-driven filtering is used for time-based queries, such as generating a reflection for the current month. Each entry stores both a human-readable ISO date and a numeric timestamp, allowing precise range queries with operators like `$gte` and `$lte`.

The design also follows a clear separation of concerns. The frontend is responsible for presentation and encryption, the backend handles indexing and AI orchestration, and ChromaDB provides semantic memory. This makes the system easier to extend, as each layer has a clear responsibility.


## Technical Stack

The frontend is written in TypeScript with React and Vite. TailwindCSS and shadcn/ui are used for styling and UI components. Framer Motion is included for lightweight animations. The backend is also written in TypeScript and runs on Node.js with Express. It uses dotenv for environment configuration and node-fetch for calling external APIs. ChromaDB is used as the vector store, accessed via the chromadb client library and the `@chroma-core/openai` integration. For AI tasks, the application uses the OpenAI API with `text-embedding-3-small` for embeddings and `gpt-4o-mini` for generation. A local sentiment analysis library is also used to produce quick numeric mood scores without needing to call an external API.


## Patterns and Architecture

The system implements the RAG design pattern. Journal entries are embedded and stored in a vector database. Queries are also embedded, and Chroma is used to find the most semantically similar entries. Those results are then passed to the OpenAI model, which generates a new prompt or reflection. This separation of retrieval and generation ensures that the AI responses are grounded in the user’s own writing, making them feel more personal.

Fallback strategies are also built in. If OpenAI is unavailable, the system falls back to locally generated prompts or heuristics. This ensures the app remains usable even without AI access. Scalability has also been considered. ChromaDB can handle larger collections of entries, and the system could be extended to support multiple users by creating separate collections or namespaces. The system is also designed for extensibility. New features such as weekly summaries, mood clustering, or richer visualizations can be added without changing the core architecture.


## Future Enhancements

There are several directions the system could evolve in future iterations.  

One area is personalization at the user level. Multi-user accounts with authentication could allow multiple people to use the same installation while keeping journals separate. These accounts could be backed by user-specific encrypted collections in Chroma. Similarly, prompt generation could be tuned to individual writing styles, making the AI feel more like a personal companion than a generic assistant.  

Another direction is privacy. While current entries are encrypted locally, future versions could support complete data management options such as a “clear all data” button that wipes both local storage and the vector index. On-device embedding models could replace OpenAI for users who prefer full offline privacy, and encrypted sync with providers such as iCloud or Dropbox could enable cross-device use without exposing plain text anywhere.  

The system could also benefit from richer visualization. Mood trends, theme clustering, and reflection summaries could be displayed together in an interactive timeline, helping users see long-term patterns. Weekly summaries or habit tracking could be layered on top of monthly reflections to provide multiple levels of insight.  

Finally, quality-of-life features would make the app feel more complete. Options for changing the cosmetic theme, customizing typography, or toggling between light and dark modes would make the journaling experience more personal. Usability could be improved with reminders, streak tracking, or shortcuts for quickly adding an entry. Together, these features would make the system more welcoming for everyday use while still respecting the privacy-first design.


## Summary

Reflect uses a retrieval-augmented generation architecture to provide personalized journaling prompts and reflections. By combining local encryption, ChromaDB for semantic memory, and OpenAI for generation, the system balances privacy, cost, and personalization. The design emphasizes modularity, security, and extensibility, making it well suited for growth beyond the MVP stage.
