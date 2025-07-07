-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER', 'STOCHASTIC', 'ATR', 'VOLUME', 'VWAP', 'PIVOT_POINTS', 'FIBONACCI', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "ConditionOperator" AS ENUM ('CROSSES_ABOVE', 'CROSSES_BELOW', 'GREATER_THAN', 'LESS_THAN', 'EQUALS', 'BETWEEN');

-- CreateEnum
CREATE TYPE "CompareToType" AS ENUM ('VALUE', 'INDICATOR', 'PRICE');

-- CreateEnum
CREATE TYPE "LogicalOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('TREND_FOLLOWING', 'MEAN_REVERSION', 'MOMENTUM', 'VOLATILITY', 'VOLUME', 'SCALPING', 'SWING', 'POSITION');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "BotStrategy" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyIndicator" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "indicatorType" "IndicatorType" NOT NULL,
    "params" JSONB NOT NULL,
    "color" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyCondition" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "type" "ConditionType" NOT NULL,
    "indicatorId" TEXT,
    "operator" "ConditionOperator" NOT NULL,
    "compareToType" "CompareToType" NOT NULL,
    "compareToValue" JSONB NOT NULL,
    "logicalOperator" "LogicalOperator",
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyBacktest" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "initialCapital" DECIMAL(20,8) NOT NULL,
    "finalCapital" DECIMAL(20,8) NOT NULL,
    "totalTrades" INTEGER NOT NULL,
    "winningTrades" INTEGER NOT NULL,
    "losingTrades" INTEGER NOT NULL,
    "totalReturn" DECIMAL(10,4) NOT NULL,
    "sharpeRatio" DECIMAL(8,4),
    "sortinoRatio" DECIMAL(8,4),
    "maxDrawdown" DECIMAL(8,4) NOT NULL,
    "profitFactor" DECIMAL(8,4),
    "winRate" DECIMAL(5,2) NOT NULL,
    "avgWin" DECIMAL(20,8),
    "avgLoss" DECIMAL(20,8),
    "results" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyBacktest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "timeframe" TEXT NOT NULL,
    "assetTypes" "AssetType"[],
    "configuration" JSONB NOT NULL,
    "performance" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "author" TEXT NOT NULL DEFAULT 'RoR Trader',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotStrategy_botId_key" ON "BotStrategy"("botId");

-- CreateIndex
CREATE INDEX "BotStrategy_botId_idx" ON "BotStrategy"("botId");

-- CreateIndex
CREATE INDEX "BotStrategy_templateId_idx" ON "BotStrategy"("templateId");

-- CreateIndex
CREATE INDEX "StrategyIndicator_strategyId_idx" ON "StrategyIndicator"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyCondition_strategyId_type_idx" ON "StrategyCondition"("strategyId", "type");

-- CreateIndex
CREATE INDEX "StrategyBacktest_strategyId_createdAt_idx" ON "StrategyBacktest"("strategyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyTemplate_name_key" ON "StrategyTemplate"("name");

-- CreateIndex
CREATE INDEX "StrategyTemplate_category_idx" ON "StrategyTemplate"("category");

-- CreateIndex
CREATE INDEX "StrategyTemplate_difficulty_idx" ON "StrategyTemplate"("difficulty");

-- AddForeignKey
ALTER TABLE "BotStrategy" ADD CONSTRAINT "BotStrategy_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotStrategy" ADD CONSTRAINT "BotStrategy_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StrategyTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyIndicator" ADD CONSTRAINT "StrategyIndicator_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCondition" ADD CONSTRAINT "StrategyCondition_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCondition" ADD CONSTRAINT "StrategyCondition_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "StrategyIndicator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyBacktest" ADD CONSTRAINT "StrategyBacktest_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
