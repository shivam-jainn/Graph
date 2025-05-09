import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-client'

export async function GET(req: NextRequest) {
  const { data: session } = await getSession()
  const userId = session?.user?.id

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await prisma.chatSession.findMany({
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

  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const { data: session } = await getSession()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, sourceIds } = body

  const createdSession = await prisma.chatSession.create({
    data: {
      title,
      userId,
      sources: sourceIds && sourceIds.length > 0
        ? { connect: sourceIds.map((id: string) => ({ id })) }
        : undefined,
    },
  })

  return NextResponse.json(createdSession)
}
