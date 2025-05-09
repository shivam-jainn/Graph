import { PrismaClient } from '@prisma/client'

declare global {
  // Prevent multiple PrismaClient instances in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn','query']
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}