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

const scrapeTool = tool(
  async ({ url }) => {
    console.log("----------scraper TOOL CALLED----------");
    console.log("Scraping URL:", url);
    const snapshot_id = await scrape(url);
    return snapshot_id;
  },

  {
    name: "scrapeTool",
    description:
      "this tool will scrape the youtube video transcript given the video url. use the tool only if the video is not present in the vector store the tool will reuturn the ",
    schema: z.object({
      url: z.string(),
    }),
  },
);
const retrievalTool = tool(
  async ({ query, video_id }, { configurable: {} }) => {
    console.log("----------RETRIEVAL TOOL CALLED----------");
    console.log("VIDEO ID:", video_id);
    console.log("QUERY:", query);

    const filter = {
      must: [
        {
          key: "metadata.video_id",
          match: { value: video_id },
        },
      ],
    };

    const docs = await vectorStore.similaritySearch(query, 5, filter);

    console.log("DOC COUNT:", docs.length);

    if (!docs.length) {
      return "No relevant transcript found for this video.";
    }

    return docs.map((d) => d.pageContent).join("\n\n");
  },
  {
    name: "retrievalTool",
    description: `this tool let you retrive information about the user query regarding youtube video whose transctipt is stored in the vector store.
      use this tool to answer user queries about a video.
      always use this tool before answering a user query if the vector store does not have any thing about the video 
      call the scarper tool to add it in the store and tell user that video is being processed and will be available soon.
      and then use this tool to answer user query once the video is added to the vector store.
      example :
      user query : what is the video about https://www.youtube.com/watch?v=j2lGFm1i91s?
      user query : tell me about the video with id or snap shot id eur8dUO9mvE
      some thing regrding the video after your reply of the video is being processed  most likely the next question of user would be about the video only.`,
    schema: z.object({
      query: z.string(),
      video_id: z.string(),
    }),
  },
);
const systemPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an yt chat bot assistant to whom user provide a url and you scrape the video and with that data answer there query. Never add the same document twice. If content already exists,always check the vector store first before scraping. If content is not found in vector store, use the scrape tool to get the content first and then use retrieval tool to get the relevant information to answer user query. Always use the tools when needed. If video is being processed inform the user that video is being processed and will be available soon. Keep your answers concise and to the point.",
  ],
  ["user", "{input}"],
]);

const memory = new MemorySaver();
export const agent = createAgent({
  model: llm,
  prompt: systemPrompt,
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
