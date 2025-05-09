import { OpenAI } from 'openai';
import { streamText } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { querySimilarDocuments } from '@/lib/embeddings';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();
  
  // Get the last user message for context retrieval
  const lastUserMessage = messages.findLast(m => m.role === 'user');
  
  // Default to using OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  let contextText = '';
  let sourceRefs = [];
  
  // If we have a chatId, retrieve relevant context from Pinecone
  if (chatId) {
    try {
      // Get session to check if user is authorized
      const session = await auth.api.getSession({
        headers: await headers()
      });
      
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }
      
      // Get the chat session and its sources
      const chatSession = await prisma.chatSession.findUnique({
        where: {
          id: chatId,
          userId
        },
        include: {
          sources: true
        }
      });
      
      if (chatSession && chatSession.sources.length > 0) {
        // Get source IDs for this chat session
        const sourceIds = chatSession.sources.map(source => source.id);
        
        // Query similar documents from Pinecone
        const similarDocs = await querySimilarDocuments(
          lastUserMessage.content,
          sourceIds,
          5
        );
        
        // Extract context and prepare source references
        if (similarDocs.length > 0) {
          contextText = similarDocs.map(doc => doc.metadata.text).join('\n\n');
          
          // Prepare source references for storing with the assistant's response
          sourceRefs = similarDocs.map(doc => ({
            sourceId: doc.metadata.sourceId,
            quote: doc.metadata.text.substring(0, 100) + '...',
            pageNumber: doc.metadata.pageNumber
          }));
        }
      }
    } catch (error) {
      console.error('Error retrieving context:', error);
      // Continue without context if there's an error
    }
  }
  
  // Prepare system message with context if available
  const systemMessage = {
    role: 'system',
    content: contextText 
      ? `You are a helpful assistant. Use the following information to answer the user's question, but don't explicitly mention that you're using this context unless asked:\n\n${contextText}`
      : 'You are a helpful assistant.'
  };
  
  // Add system message to the beginning of the messages array
  const messagesWithContext = [systemMessage, ...messages];
  
  // Stream the response
  const result = streamText({
    model: openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: messagesWithContext,
    }),
  });
  
  // Store source references for later use with the assistant's response
  if (chatId && sourceRefs.length > 0) {
    // We'll store these in the global scope or a cache to retrieve when storing the assistant's response
    global.pendingSourceRefs = {
      chatId,
      refs: sourceRefs
    };
  }
  
  return result.toDataStreamResponse();
}