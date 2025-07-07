/*
  Warnings:

  - Added the required column `symbol` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SignalMode" AS ENUM ('ANY', 'ALL', 'MAJORITY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "signalMode" "SignalMode" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "symbol" TEXT NOT NULL,
ADD COLUMN     "timeframe" TEXT NOT NULL DEFAULT '1h';

-- CreateTable
CREATE TABLE "BotIndicator" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "weight" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "buySignal" JSONB,
    "sellSignal" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotIndicator_botId_idx" ON "BotIndicator"("botId");

-- CreateIndex
CREATE INDEX "Bot_symbol_exchange_idx" ON "Bot"("symbol", "exchange");

-- AddForeignKey
ALTER TABLE "BotIndicator" ADD CONSTRAINT "BotIndicator_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
