# 🎬 YouTube RAG Chatbot (React + Express + Bright Data + QDrant DB)

![Architecture](https://img.shields.io/badge/Architecture-RAG-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20BrightData%20%7C%20DrantDB-orange)
![Status](https://img.shields.io/badge/Status-Working-green)

---

## 🚀 Overview

This project is a **YouTube Retrieval-Augmented Generation (RAG)** chatbot that answers user questions about any YouTube video using:

- **Scraping video content**
- **Embedding and storing chunks in Drant DB**
- **Retrieving relevant chunks**
- **Using an LLM (qwenn / embedding=Gemini) to answer**

---

## 🧩 Architecture Components

### ✅ Frontend (React)
- User enters:
  - YouTube URL
  - Query
- Displays:
  - Processing status
  - Final answer

---

### ✅ Backend (Express)
- API endpoints:
  - `/user_query` → receives URL + query
  - Triggers:
    - **retrieval tool**
    - **scrape tool**
    - **LLM inference**
- Handles thread/session management

---

### ✅ Scraping (Bright Data)
- Scrapes:
  - Video description
  - Transcript

- Creates text chunks
-recieved data through webhook

---

### ✅ Embedding Model
- Uses:
  - `gemini-text-001` (or any embedding model)
- Converts each chunk into vector embeddings

---

### ✅ Vector Database (QDrant DB)
- Stores:
  - Chunk text
  - Embedding
  - Metadata (URL, timestamp, chunk index)

- Used for:
  - Similarity search
  - Top-K retrieval

---

### 🛠️ Tools (LangChain Agent)

#### Tool 1: **scrapeTool**
- Scrapes video if not already in DB
- Adds chunks to Drant DB

#### Tool 2: **retrievalTool**
- Checks DB for existing video chunks
- Retrieves relevant chunks

---

## 🧠 Agent Logic (Workflow)

1. User sends URL + query
2. Agent checks vector DB via `retrievalTool`
3. If not found:
   - Run `scrapeTool`
   - Add data to DB
   - Then run `retrievalTool`
4. Generate answer using retrieved chunks

### ✔️ Duplicate Prevention
System prompt ensures:
- “Never add same document twice”
- “Always check DB first”
- “Skip scraping if already exists”

---

## 🧰 System Prompt Example

```txt
You are a YouTube chatbot assistant.
- Always check vector store first using retrieval tool.
- If video exists, retrieve relevant chunks and answer.
- If not, scrape the video first, store in vector DB, then retrieve.
- Never add the same document twice.
- If video is being processed, tell user "video processing, try later".
- Keep answers concise.
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd ytchat
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Add environment variables

Create `.env`:

```env
QWENN_API_KEY=your_api_key
BRIGHTDATA_TOKEN=your_brightdata_token
QDRANT_HOST=http://localhost:8000
QDRANT_COLLECTION=ytchat
GOOGLE_API_KEY=api key
```

---

### 4. Run backend

```bash
node server/index.js
```

---

### 5. Run frontend

```bash
cd client
npm start
```

---

## 🧩 API Endpoints

### ✅ POST `/user_query`

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=xxx",
  "query": "What is this video about?",
  "thread_id": "unique_thread_id"
}
```

**Responses:**

| Status | Response |
|--------|----------|
| 200 | Answer from LLM |
| 202 | “Video processing, try again later” |
| 500 | Error |

---

## 🔥 Example Workflow

1. User enters YouTube URL + query  
2. Backend checks Drant DB  
3. If not found:
   - Scrapes video via Bright Data
   - Adds chunks to DB
4. Retrieves top-K chunks
5. Sends answer to user

---

## 🧪 Notes

- **QDrant DB** stores vectors for semantic search.
- **Bright Data** scrapes YouTube content.
- **Gemini-004** (or any embedding model) is used for embeddings.
- Agent ensures no duplicate documents.

---

## ✅ License

MIT License
