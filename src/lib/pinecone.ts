import { Pinecone } from '@pinecone-database/pinecone';

// Pinecone for vector database
export const pinecone = new Pinecone({
    apiKey : process.env.PINECONE_API_KEY!
  });
  
  export const dbindex = pinecone.index(process.env.PINECONE_INDEX_NAME!, process.env.PINECONE_HOST);
  