import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

// Function to load and split PDF content
export async function processPdf(file: Buffer): Promise<Document[]> {
  // Create a Blob from the buffer
  const blob = new Blob([file]);
  
  // Load the PDF
  const loader = new PDFLoader(blob);
  const docs = await loader.load();
  
  // Split the document into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const splitDocs = await textSplitter.splitDocuments(docs);
  return splitDocs;
}

// Function to prepare documents for embedding
export function prepareDocsForEmbedding(docs: Document[], sourceId: string, fileName: string) {
  return docs.map((doc, i) => ({
    id: `${sourceId}-${i}`,
    values: [], // This will be filled with embeddings
    metadata: {
      text: doc.pageContent,
      sourceId,
      fileName,
      pageNumber: doc.metadata.loc?.pageNumber || 0,
    },
  }));
}