import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import data from "./data.js";
import { url, z } from "zod";
import dotenv from "dotenv";
dotenv.config();
// import { MemoryVectorStore } from "@langchain/core/vectorstores/memory";

import { MemorySaver } from "@langchain/langgraph";
import { addVideo, vectorStore } from "./embeddings.js";
import { scrape } from "./scrapper.js";
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
const scrapeTool = tool(
  async ({ url }) => {
    console.log("Scraping URL:", url);
    const snapshot_id = await scrape(url);
    return snapshot_id;
  },

  {
    name: "scrapeTool",
    description:
      "this tool will scrape the youtube video transcript given the video url.the tool starts a craping job that usually takes 7 seconds use the tool only if the video is not in the vevotr store already the tool will reuturn the snapshot/jobid which canbe uses to check the status of the scraping job",
    schema: z.object({
      url: z.string(),
    }),
  },
);
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
  tools: [retrievalTool, scrapeTool],
  checkpointer: memory,
});

// const res1 = await agent.invoke(
//   {
//     messages: [
//       {
//         role: "user",
//         content:
//           "scrape this yt  url https://www.youtube.com/watch?v=j2lGFm1i91s",
//       },
//     ],
//   },
//   { configurable: { thread_id: "23", video_id: 5 } },
// );

// const lastMessage = res1.messages[res1.messages.length - 1];
// console.log("--------------ai message:----------\n", lastMessage.content);
// await addVideo(v1);
