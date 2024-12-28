-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "encryptedMessage" TEXT NOT NULL,
    "password" TEXT,
    "validUntil" TIMESTAMP(3),
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_uuid_key" ON "messages"("uuid");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
