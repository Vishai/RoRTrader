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

-- CreateEnum
CREATE TYPE "CoachRuleSetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CoachTagSeverity" AS ENUM ('INFO', 'SETUP', 'ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "CoachSnapshotSource" AS ENUM ('ALERT', 'EXTENSION', 'DESKTOP');

-- CreateEnum
CREATE TYPE "CoachEvaluationStatus" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "CoachSessionState" AS ENUM ('SCANNING', 'SETUP_FORMING', 'READY', 'TRIGGERED', 'IN_TRADE', 'MANAGE', 'EXITED');

-- CreateEnum
CREATE TYPE "CoachTradeDirection" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "CoachTradeOrigin" AS ENUM ('MANUAL', 'AUTO');

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
    "exitStrategyId" TEXT,
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

-- CreateTable
CREATE TABLE "CoachRuleSet" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "botId" TEXT,
    "strategyId" TEXT,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "summary" TEXT,
    "config" JSONB NOT NULL,
    "thresholds" JSONB,
    "status" "CoachRuleSetStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachTagDefinition" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "tagKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "severity" "CoachTagSeverity" NOT NULL DEFAULT 'INFO',
    "rule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachTagDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT,
    "ruleSetId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframeMinutes" INTEGER NOT NULL,
    "state" "CoachSessionState" NOT NULL DEFAULT 'SCANNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEvaluatedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachSnapshot" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "source" "CoachSnapshotSource" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "features" JSONB,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "tagId" TEXT NOT NULL,
    "status" "CoachEvaluationStatus" NOT NULL,
    "score" DECIMAL(5,4),
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachAdvice" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "sessionState" "CoachSessionState" NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachTrade" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "evaluationId" TEXT,
    "direction" "CoachTradeDirection" NOT NULL,
    "origin" "CoachTradeOrigin" NOT NULL DEFAULT 'AUTO',
    "entryPrice" DECIMAL(20,8),
    "stopPrice" DECIMAL(20,8),
    "targetPrice" DECIMAL(20,8),
    "riskReward" DECIMAL(10,4),
    "rMultiple" DECIMAL(10,4),
    "positionSize" DECIMAL(20,8),
    "tagsApplied" JSONB,
    "notes" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachMetrics" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "tagSetHash" TEXT NOT NULL,
    "samples" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "expectedValue" DECIMAL(10,4),
    "winRatePosterior" DECIMAL(5,4),
    "riskRewardMean" DECIMAL(10,4),
    "priorAlpha" DECIMAL(10,4),
    "priorBeta" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachMetrics_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "StrategyCondition_exitStrategyId_idx" ON "StrategyCondition"("exitStrategyId");

-- CreateIndex
CREATE INDEX "StrategyBacktest_strategyId_createdAt_idx" ON "StrategyBacktest"("strategyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyTemplate_name_key" ON "StrategyTemplate"("name");

-- CreateIndex
CREATE INDEX "StrategyTemplate_category_idx" ON "StrategyTemplate"("category");

-- CreateIndex
CREATE INDEX "StrategyTemplate_difficulty_idx" ON "StrategyTemplate"("difficulty");

-- CreateIndex
CREATE INDEX "CoachRuleSet_ownerUserId_idx" ON "CoachRuleSet"("ownerUserId");

-- CreateIndex
CREATE INDEX "CoachRuleSet_botId_idx" ON "CoachRuleSet"("botId");

-- CreateIndex
CREATE INDEX "CoachRuleSet_strategyId_idx" ON "CoachRuleSet"("strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachRuleSet_ownerUserId_name_version_key" ON "CoachRuleSet"("ownerUserId", "name", "version");

-- CreateIndex
CREATE INDEX "CoachTagDefinition_ruleSetId_idx" ON "CoachTagDefinition"("ruleSetId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachTagDefinition_ruleSetId_tagKey_key" ON "CoachTagDefinition"("ruleSetId", "tagKey");

-- CreateIndex
CREATE INDEX "CoachSession_userId_idx" ON "CoachSession"("userId");

-- CreateIndex
CREATE INDEX "CoachSession_botId_idx" ON "CoachSession"("botId");

-- CreateIndex
CREATE INDEX "CoachSession_ruleSetId_idx" ON "CoachSession"("ruleSetId");

-- CreateIndex
CREATE INDEX "CoachSession_symbol_timeframeMinutes_idx" ON "CoachSession"("symbol", "timeframeMinutes");

-- CreateIndex
CREATE INDEX "CoachSnapshot_sessionId_capturedAt_idx" ON "CoachSnapshot"("sessionId", "capturedAt");

-- CreateIndex
CREATE INDEX "CoachEvaluation_sessionId_idx" ON "CoachEvaluation"("sessionId");

-- CreateIndex
CREATE INDEX "CoachEvaluation_snapshotId_idx" ON "CoachEvaluation"("snapshotId");

-- CreateIndex
CREATE INDEX "CoachEvaluation_tagId_createdAt_idx" ON "CoachEvaluation"("tagId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoachAdvice_evaluationId_key" ON "CoachAdvice"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachTrade_evaluationId_key" ON "CoachTrade"("evaluationId");

-- CreateIndex
CREATE INDEX "CoachTrade_sessionId_idx" ON "CoachTrade"("sessionId");

-- CreateIndex
CREATE INDEX "CoachTrade_evaluationId_idx" ON "CoachTrade"("evaluationId");

-- CreateIndex
CREATE INDEX "CoachMetrics_ruleSetId_idx" ON "CoachMetrics"("ruleSetId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachMetrics_ruleSetId_tagSetHash_key" ON "CoachMetrics"("ruleSetId", "tagSetHash");

-- AddForeignKey
ALTER TABLE "BotStrategy" ADD CONSTRAINT "BotStrategy_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotStrategy" ADD CONSTRAINT "BotStrategy_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StrategyTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyIndicator" ADD CONSTRAINT "StrategyIndicator_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCondition" ADD CONSTRAINT "StrategyCondition_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCondition" ADD CONSTRAINT "StrategyCondition_exitStrategyId_fkey" FOREIGN KEY ("exitStrategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCondition" ADD CONSTRAINT "StrategyCondition_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "StrategyIndicator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyBacktest" ADD CONSTRAINT "StrategyBacktest_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachRuleSet" ADD CONSTRAINT "CoachRuleSet_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachRuleSet" ADD CONSTRAINT "CoachRuleSet_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachRuleSet" ADD CONSTRAINT "CoachRuleSet_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "BotStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachTagDefinition" ADD CONSTRAINT "CoachTagDefinition_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "CoachRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSession" ADD CONSTRAINT "CoachSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSession" ADD CONSTRAINT "CoachSession_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSession" ADD CONSTRAINT "CoachSession_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "CoachRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSnapshot" ADD CONSTRAINT "CoachSnapshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachEvaluation" ADD CONSTRAINT "CoachEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachEvaluation" ADD CONSTRAINT "CoachEvaluation_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CoachSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachEvaluation" ADD CONSTRAINT "CoachEvaluation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CoachTagDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachAdvice" ADD CONSTRAINT "CoachAdvice_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "CoachEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachTrade" ADD CONSTRAINT "CoachTrade_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachTrade" ADD CONSTRAINT "CoachTrade_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "CoachEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachMetrics" ADD CONSTRAINT "CoachMetrics_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "CoachRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
