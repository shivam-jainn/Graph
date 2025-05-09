import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionCookie } from 'better-auth/cookies'
import { getSession } from '@/lib/auth-client'
import {auth} from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(req: NextRequest) {
  
  const session = await auth.api.getSession({
    headers : await headers()
  })

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const chatSessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      sources: {
        select: { id: true, title: true },
      },
    },
  })

  return NextResponse.json(chatSessions)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers : await headers()
  })

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title } = body

  const createdChatSession = await prisma.chatSession.create({
    data: {
      title,
      userId
    },
  })

  return NextResponse.json(createdChatSession)
}
