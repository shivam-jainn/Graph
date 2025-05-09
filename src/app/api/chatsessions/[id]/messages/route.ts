import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // The issue is here - params.id should be properly accessed
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

  // Get message data from request body
  const { content, role } = await req.json()

  // Create the message
  const message = await prisma.chatMessage.create({
    data: {
      content,
      role,
      sessionId
    }
  })

  return NextResponse.json(message)
}