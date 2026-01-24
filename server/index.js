import express from "express";
import cors from "cors";
import { agent } from "./agent.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
app.post("/user_query", async (req, res) => {
  const { query, video_id, thread_id } = req.body;
  console.log(
    "Received query:",
    query,
    "for video ID:",
    video_id,
    "for thread ID:",
    thread_id,
  );

  const res1 = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    },
    {
      configurable: { thread_id: thread_id, video_id: video_id },
    },
  );

  const lastMessage = res1.messages[res1.messages.length - 1];
  console.log("--------------ai message:----------\n", lastMessage.content);
  return res.json(res1.messages.at(-1).content);
  // await addVideo(v1);
});
app.get("/", (req, res) => {
  console.log("rag be");
  return res.send("Hello from RAG server!");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
