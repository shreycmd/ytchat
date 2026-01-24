import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import data from "./data.js";
import { z } from "zod";

// import { MemoryVectorStore } from "@langchain/core/vectorstores/memory";

import { MemorySaver } from "@langchain/langgraph";
import { addVideo, vectorStore } from "./embeddings.js";
const v1 = data[0];
const v2 = data[1];

// await addVideo(v2);
// console.log("Chunks:", chunks);
const llm = new ChatOpenAI({
  model: "qwen/qwen3-32b",
  apiKey: process.env.QWEN_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: "https://api.groq.com/openai/v1",
  },
});

//retrieving

// console.log("Results:", results);
//retrieval tool
//testing
// const v_id = "eur8dUO9mvE";
const v_id = "j2lGFm1i91s";
const retrievalTool = tool(
  async ({ query }, { configurable: { video_id } }) => {
    console.log("VIDEO ID:", video_id);

    const filter = {
      must: [
        {
          key: "metadata.video_id",
          match: { value: video_id },
        },
      ],
    };

    const docs = await vectorStore.similaritySearch(query, 5, filter);

    console.log("DOC COUNT:", docs);

    if (!docs.length) {
      return "No relevant transcript found for this video.";
    }

    return docs.map((d) => d.pageContent).join("\n\n");
  },
  {
    name: "retrievalTool",
    description:
      "this tool let you retrive information from the video transcript",
    schema: z.object({
      query: z.string(),
    }),
  },
);

const memory = new MemorySaver();
export const agent = createAgent({
  model: llm,
  tools: [retrievalTool],
  checkpointer: memory,
});

// const res1 = await agent.invoke(
//   {
//     messages: [
//       {
//         role: "user",
//         content: "tell the name of racing track where the race is happening?",
//       },
//     ],
//   },
//   config,
// );

// const lastMessage = res1.messages[res1.messages.length - 1];
// console.log("--------------ai message:----------\n", lastMessage.content);
// await addVideo(v1);
