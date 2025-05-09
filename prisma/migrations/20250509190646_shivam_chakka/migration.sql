/*
  Warnings:

  - You are about to drop the column `filePath` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the `MessageSourceRef` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SessionSources` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `title` on table `ChatSession` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `fileName` to the `Source` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Source` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "MessageSourceRef" DROP CONSTRAINT "MessageSourceRef_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageSourceRef" DROP CONSTRAINT "MessageSourceRef_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_userId_fkey";

-- DropForeignKey
ALTER TABLE "_SessionSources" DROP CONSTRAINT "_SessionSources_A_fkey";

-- DropForeignKey
ALTER TABLE "_SessionSources" DROP CONSTRAINT "_SessionSources_B_fkey";

-- AlterTable
ALTER TABLE "ChatSession" ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Source" DROP COLUMN "filePath",
DROP COLUMN "fileType",
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- DropTable
DROP TABLE "MessageSourceRef";

-- DropTable
DROP TABLE "_SessionSources";

-- CreateTable
CREATE TABLE "SourceRef" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "quote" TEXT,
    "pageNumber" INTEGER,

    CONSTRAINT "SourceRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatSessionToSource" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChatSessionToSource_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChatSessionToSource_B_index" ON "_ChatSessionToSource"("B");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceRef" ADD CONSTRAINT "SourceRef_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceRef" ADD CONSTRAINT "SourceRef_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatSessionToSource" ADD CONSTRAINT "_ChatSessionToSource_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatSessionToSource" ADD CONSTRAINT "_ChatSessionToSource_B_fkey" FOREIGN KEY ("B") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
