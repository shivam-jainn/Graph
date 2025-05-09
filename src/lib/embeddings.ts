import OpenAI from 'openai';
import { dbindex } from './pinecone';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate embeddings for a text
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  
  return response.data[0].embedding;
}

// Function to generate embeddings for multiple texts
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(
    texts.map(text => generateEmbedding(text))
  );
  
  return embeddings;
}

// Function to store embeddings in Pinecone
export async function storeEmbeddings(vectors: any[]) {
  const index = dbindex;
  await index.upsert(vectors);
}

// Function to query similar documents
export async function querySimilarDocuments(query: string, sourceIds: string[] = [], limit: number = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const index = dbindex;
  
  const queryOptions: any = {
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true,
  };
  
  // Add filter if sourceIds are provided
  if (sourceIds.length > 0) {
    queryOptions.filter = {
      sourceId: { $in: sourceIds },
    };
  }
  
  const results = await index.query(queryOptions);
  return results.matches;
}