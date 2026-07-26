import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});
//embedding

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

const collectionName = "ytrag";

// Ensure collection exists
const collections = await client.getCollections();
const exists = collections.collections.some((c) => c.name === collectionName);
if (!exists) {
  await client.createCollection(collectionName, {
    vectors: {
      size: 3072,
      distance: "Cosine",
    },
  });
  await client.createPayloadIndex(collectionName, {
    field_name: "metadata.video_id",
    field_schema: "keyword",
  });
}

//export const vectorStore = new MemoryVectorStore(embeddings);
export const vectorStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    client,
    collectionName,
  },
);
export const addVideo = async (vdata) => {
  console.log("Adding video to vector store:", vdata.video_id);
  const documents = [
    new Document({
      pageContent: vdata.transcript,
      metadata: { video_id: vdata.video_id },
    }),
    //   new Document({
    //     pageContent: v2.transcript,
    //     metadata: { video_id: v2.video_id },
    //   }),
  ];
  //splitting in chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 150,
  });
  const chunks = await splitter.splitDocuments(documents);
  await vectorStore.addDocuments(chunks);
};
