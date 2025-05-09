import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { processPdf, prepareDocsForEmbedding } from '@/lib/pdf-utils';
import { generateEmbeddings, storeEmbeddings } from '@/lib/embeddings';

export const maxDuration = 60; // Increase timeout for PDF processing

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data with error handling
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    
    if (!file || !sessionId) {
      return NextResponse.json({ error: 'Missing file or session ID' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Verify the chat session belongs to the user
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Create a source record
    const source = await prisma.source.create({
      data: {
        title: file.name,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        userId,
        chatSessions: {
          connect: { id: sessionId }
        }
      }
    });

    try {
      // Process the PDF
      const buffer = Buffer.from(await file.arrayBuffer());
      const docs = await processPdf(buffer);
      
      // Prepare documents for embedding
      const vectorDocs = prepareDocsForEmbedding(docs, source.id, file.name);
      
      // Generate embeddings
      const texts = vectorDocs.map(doc => doc.metadata.text);
      const embeddings = await generateEmbeddings(texts);
      
      // Add embeddings to vector documents
      for (let i = 0; i < vectorDocs.length; i++) {
        vectorDocs[i].values = embeddings[i];
      }
      
      // Store in Pinecone
      await storeEmbeddings(vectorDocs);
    } catch (error) {
      console.error('Error processing PDF:', error);
      // Still return success with the source, but log the error
      // This allows the UI to continue working even if PDF processing fails
      return NextResponse.json({ 
        success: true, 
        warning: 'File uploaded but processing failed. Please try again later.',
        source: {
          id: source.id,
          title: source.title,
          fileName: source.fileName
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      source: {
        id: source.id,
        title: source.title,
        fileName: source.fileName
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}