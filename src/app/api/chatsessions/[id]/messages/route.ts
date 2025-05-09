import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fix: Properly access params.id
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }
    
    const sessionId = params.id

    // Make sure the chat session exists and belongs to the user
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId
      }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 })
    }

    // Get message data from request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { content, role } = body;
    
    if (!content || !role) {
      return NextResponse.json({ error: 'Missing content or role' }, { status: 400 });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content,
        role,
        sessionId
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}