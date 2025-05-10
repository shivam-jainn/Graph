import { streamText } from 'ai';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { querySimilarDocuments } from '@/lib/embeddings';
import { groq as groqModel } from '@ai-sdk/groq';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Invalid JSON:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages } = body;
    console.log('Request received with', messages?.length, 'messages');

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract last user message
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    if (!lastUserMessage?.content) {
      return new Response(JSON.stringify({ error: 'User message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Last user message:', lastUserMessage.content);

    // Optional auth (can remove if not needed)
    try {
      const session = await auth.api.getSession({
        headers: await headers()
      });

      const userId = session?.user?.id;
      if (!userId) throw new Error('Unauthorized');
      console.log('User authenticated:', userId);
    } catch (error) {
      console.warn('Auth skipped or failed:', error);
    }

    // 🔍 Query Pinecone for relevant documents
    let contextText = '';
    try {
      const similarDocs = await querySimilarDocuments(lastUserMessage.content, undefined, 5); // No source filter
      console.log('Pinecone returned', similarDocs.length, 'docs');

      if (similarDocs.length > 0) {
        contextText = similarDocs.map(doc => doc.metadata?.text).join('\n\n');
        console.log('Context built from Pinecone. Length:', contextText.length);
      }
    } catch (error) {
      console.error('Error querying Pinecone:', error);
    }

    // 🧠 Add system prompt
    const systemMessage = {
      role: 'system',
      content: contextText
        ? `You are a helpful assistant. Use the following information to help answer the user's question, but do not say explicitly where the info came from:\n\n${contextText}`
        : 'You are a helpful assistant.'
    };

    const messagesWithContext = [systemMessage, ...messages];

    // 🧵 Stream response from Groq model
    const result = await streamText({
      model: groqModel('gemma2-9b-it'),
      messages: messagesWithContext,
    });

    console.log('Sending streamed response');
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
