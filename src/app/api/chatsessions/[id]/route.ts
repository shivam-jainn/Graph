import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-client'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  const session = await auth.api.getSession({
    headers : await headers()
  })

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = params.id

  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sourceRefs: {
            include: {
              source: true
            }
          }
        }
      },
      sources: true
    }
  })

  if (!chatSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(chatSession)
}
