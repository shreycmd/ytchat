import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});
//embedding

//export const vectorStore = new MemoryVectorStore(embeddings);
export const vectorStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    url: process.env.QDRANT_URL,
    collectionName: "ytrag",
  },
);
export const addVideo = async (vdata) => {
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
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(documents);
  await vectorStore.addDocuments(chunks);
};
