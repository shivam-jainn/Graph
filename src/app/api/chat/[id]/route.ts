import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chatId = params.id
  
  // Fetch the chat session and verify it belongs to the user
  const chatSession = await prisma.chatSession.findUnique({
    where: {
      id: chatId,
      userId: userId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!chatSession) {
    return NextResponse.json({ error: 'Chat session not found' }, { status: 404 })
  }

  return NextResponse.json(chatSession)
}