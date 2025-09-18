import { CoachEvaluationStatus, CoachSessionState, CoachTagSeverity, Prisma } from '@prisma/client';
import { prisma } from '@/shared/database/prisma';
import { logger } from '@/shared/utils/logger';
import type { CoachEvaluationJob } from './coach.queue';

interface EvaluationThresholds {
  greenGte: number;
  yellowRange: [number, number];
}

interface TagRule {
  when?: ConditionGroup;
  score?: ScoreDefinition;
  traffic?: {
    green_if_score_gte?: number;
    yellow_if_score_between?: [number, number];
  };
}

interface ScoreDefinition {
  base?: number;
  decay_per_candle_since_cross?: number;
}

interface ConditionGroup {
  all_of?: Condition[];
  any_of?: Condition[];
}

type Condition =
  | { compare: CompareCondition }
  | { touch: TouchCondition }
  | { cross: CrossCondition }
  | { market_open_within_min: number }
  | { higher_tf_confirms: HigherTimeframeCondition };

interface CompareCondition {
  left: ValueRef;
  op: '>' | '<' | '>=' | '<=' | '==' | '!=' | string;
  right: ValueRef;
}

interface TouchCondition {
  series: string;
  band: string;
  tolerance_pct?: number;
}

interface CrossCondition {
  a: string;
  b: string;
  direction?: 'up' | 'down' | 'any';
  lookback_candles?: number;
}

interface HigherTimeframeCondition {
  timeframe: number | string;
  condition: Condition;
}

type ValueRef = number | string | { value?: number; path?: string };

type JsonLike = Prisma.JsonValue | undefined | null;

interface EvaluationContext {
  session: Awaited<ReturnType<typeof prisma.coachSession.findFirst>>;
  snapshot: Awaited<ReturnType<typeof prisma.coachSnapshot.findUnique>> | Awaited<ReturnType<typeof prisma.coachSnapshot.findFirst>>;
  features: any;
  payload: any;
}

interface TagEvaluationResult {
  score: number;
  status: CoachEvaluationStatus;
  satisfied: boolean;
  details: Record<string, unknown>;
}

const GREEN_DEFAULT = 0.85;
const YELLOW_DEFAULT: [number, number] = [0.6, 0.85];

export class CoachEvaluatorService {
  async handleJob(job: CoachEvaluationJob) {
    const session = await prisma.coachSession.findUnique({
      where: { id: job.sessionId },
      include: {
        ruleSet: {
          include: { tags: true },
        },
      },
    });

    if (!session || !session.ruleSet) {
      logger.warn('Coach session missing or rule set not found during evaluation', { job });
      return;
    }

    const snapshot = job.snapshotId
      ? await prisma.coachSnapshot.findUnique({ where: { id: job.snapshotId } })
      : await prisma.coachSnapshot.findFirst({
          where: { sessionId: session.id },
          orderBy: { capturedAt: 'desc' },
        });

    if (!snapshot) {
      logger.warn('No snapshot available for coach session evaluation', { job });
      return;
    }

    const features = this.normalizeJson(snapshot.features);
    const payload = this.normalizeJson(snapshot.payload);
    const thresholds = this.resolveThresholds(session.ruleSet.thresholds as JsonLike);

    const evaluations: { tagId: string; result: TagEvaluationResult }[] = [];

    for (const tag of session.ruleSet.tags) {
      const rule = this.normalizeJson(tag.rule) as TagRule | undefined;
      if (!rule) {
        continue;
      }

      const context: EvaluationContext = { session, snapshot, features, payload };
      const result = this.evaluateTag(rule, context);
      const status = this.resolveStatus(result.score, result.satisfied, thresholds, rule);
      evaluations.push({ tagId: tag.id, result: { ...result, status } });
    }

    if (evaluations.length === 0) {
      logger.warn('No evaluations produced for session', { sessionId: session.id });
      return;
    }

    await this.persistEvaluations(session, snapshot, evaluations);
  }

  private normalizeJson(value: JsonLike) {
    if (value === null || value === undefined) {
      return undefined;
    }
    return value as unknown as any;
  }

  private resolveThresholds(raw: JsonLike): EvaluationThresholds {
    const parsed = (raw as any) ?? {};
    const range = parsed?.yellow_if_score_between || parsed?.yellowRange || YELLOW_DEFAULT;
    const normalizedRange: [number, number] = Array.isArray(range) && range.length === 2 ? [Number(range[0]), Number(range[1])] : YELLOW_DEFAULT;

    return {
      greenGte: Number(parsed?.green_if_score_gte ?? parsed?.greenGte ?? GREEN_DEFAULT),
      yellowRange: normalizedRange,
    };
  }

  private evaluateTag(rule: TagRule, context: EvaluationContext): TagEvaluationResult {
    const satisfied = this.evaluateConditionGroup(rule.when, context);
    const score = this.resolveScore(rule.score, context, satisfied);

    return {
      score,
      satisfied,
      status: CoachEvaluationStatus.RED,
      details: {
        satisfied,
        score,
      },
    };
  }

  private resolveScore(definition: ScoreDefinition | undefined, context: EvaluationContext, satisfied: boolean): number {
    if (!satisfied) {
      return 0;
    }

    const base = definition?.base ?? 1;
    let score = base;

    if (definition?.decay_per_candle_since_cross) {
      const candlesSince = this.getNumber(['meta', 'candlesSinceCross'], context.features);
      if (typeof candlesSince === 'number') {
        score = Math.max(
          0,
          base - definition.decay_per_candle_since_cross * candlesSince,
        );
      }
    }

    return Math.min(1, Math.max(0, score));
  }

  private resolveStatus(
    baseScore: number,
    satisfied: boolean,
    defaults: EvaluationThresholds,
    rule: TagRule,
  ): CoachEvaluationStatus {
    const traffic = rule.traffic ?? {};
    const greenGte = Number(traffic.green_if_score_gte ?? defaults.greenGte);
    const yellowRange = (traffic.yellow_if_score_between ?? defaults.yellowRange) as [number, number];

    if (satisfied && baseScore >= greenGte) {
      return CoachEvaluationStatus.GREEN;
    }

    const [yellowMin, yellowMax] = yellowRange;
    if (satisfied && baseScore >= yellowMin && baseScore < yellowMax) {
      return CoachEvaluationStatus.YELLOW;
    }

    return CoachEvaluationStatus.RED;
  }

  private async persistEvaluations(
    session: Prisma.CoachSessionGetPayload<{ include: { ruleSet: { include: { tags: true } } } }>,
    snapshot: Prisma.CoachSnapshotGetPayload<{}>,
    evaluations: { tagId: string; result: TagEvaluationResult }[],
  ) {
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      for (const evaluation of evaluations) {
        const created = await tx.coachEvaluation.create({
          data: {
            sessionId: session.id,
            snapshotId: snapshot.id,
            tagId: evaluation.tagId,
            status: evaluation.result.status,
            score: evaluation.result.score,
            context: evaluation.result.details,
          },
        });

        const linkedTag = session.ruleSet.tags.find((t) => t.id === evaluation.tagId);
        const adviceCopy = this.resolveAdvice(linkedTag, evaluation.result);

        await tx.coachAdvice.create({
          data: {
            evaluationId: created.id,
            sessionState: adviceCopy.state,
            headline: adviceCopy.headline,
            body: adviceCopy.body,
          },
        });
      }

      const sessionState = this.deriveSessionState(evaluations, session.ruleSet.tags);
      await tx.coachSession.update({
        where: { id: session.id },
        data: {
          lastEvaluatedAt: now,
          state: sessionState,
        },
      });
    });
  }

  private resolveAdvice(tag: Prisma.CoachTagDefinitionGetPayload<{}> | undefined, result: TagEvaluationResult) {
    const severity = tag?.severity ?? CoachTagSeverity.INFO;
    let state = CoachSessionState.SCANNING;

    if (result.status === CoachEvaluationStatus.GREEN) {
      state = severity === CoachTagSeverity.ENTRY || severity === CoachTagSeverity.SETUP ? CoachSessionState.READY : CoachSessionState.MANAGE;
    } else if (result.status === CoachEvaluationStatus.YELLOW) {
      state = CoachSessionState.SETUP_FORMING;
    }

    const tagName = tag?.name ?? 'Condition';
    const headline = `${tagName} → ${result.status}`;
    const body = result.satisfied
      ? `Condition satisfied with score ${result.score.toFixed(2)}.`
      : 'Conditions not met yet. Monitor inputs.';

    return { state, headline, body };
  }

  private deriveSessionState(
    evaluations: { tagId: string; result: TagEvaluationResult }[],
    tags: Prisma.CoachTagDefinitionGetPayload<{}>[],
  ): CoachSessionState {
    let hasGreenEntry = false;
    let hasYellow = false;

    for (const evaluation of evaluations) {
      const tag = tags.find((t) => t.id === evaluation.tagId);
      if (!tag) continue;

      if (evaluation.result.status === CoachEvaluationStatus.GREEN && (tag.severity === CoachTagSeverity.ENTRY || tag.severity === CoachTagSeverity.SETUP)) {
        hasGreenEntry = true;
      }

      if (evaluation.result.status === CoachEvaluationStatus.YELLOW) {
        hasYellow = true;
      }
    }

    if (hasGreenEntry) {
      return CoachSessionState.READY;
    }

    if (hasYellow) {
      return CoachSessionState.SETUP_FORMING;
    }

    return CoachSessionState.SCANNING;
  }

  private evaluateConditionGroup(group: ConditionGroup | undefined, context: EvaluationContext): boolean {
    if (!group) {
      return true;
    }

    if (group.all_of) {
      return group.all_of.every((condition) => this.evaluateCondition(condition, context));
    }

    if (group.any_of) {
      return group.any_of.some((condition) => this.evaluateCondition(condition, context));
    }

    return true;
  }

  private evaluateCondition(condition: Condition, context: EvaluationContext): boolean {
    if ('compare' in condition) {
      return this.evaluateCompare(condition.compare, context);
    }

    if ('touch' in condition) {
      return this.evaluateTouch(condition.touch, context);
    }

    if ('cross' in condition) {
      return this.evaluateCross(condition.cross, context);
    }

    if ('market_open_within_min' in condition) {
      const minutes = this.getNumber(['meta', 'minutesSinceMarketOpen'], context.features);
      return typeof minutes === 'number' && minutes <= condition.market_open_within_min;
    }

    if ('higher_tf_confirms' in condition) {
      return this.evaluateHigherTimeframe(condition.higher_tf_confirms, context);
    }

    return false;
  }

  private evaluateCompare(condition: CompareCondition, context: EvaluationContext): boolean {
    const left = this.resolveValue(condition.left, context);
    const right = this.resolveValue(condition.right, context);

    if (left === undefined || right === undefined) {
      return false;
    }

    switch (condition.op) {
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      default:
        return false;
    }
  }

  private evaluateTouch(condition: TouchCondition, context: EvaluationContext): boolean {
    const price = this.resolveValue(condition.series, context);
    const band = this.resolveValue(condition.band, context);

    if (price === undefined || band === undefined) {
      return false;
    }

    const tolerance = condition.tolerance_pct ?? 0.01;
    const diffPct = Math.abs(price - band) / (band === 0 ? 1 : Math.abs(band));
    return diffPct <= tolerance;
  }

  private evaluateCross(condition: CrossCondition, context: EvaluationContext): boolean {
    const seriesA = this.resolveSeries(condition.a, context);
    const seriesB = this.resolveSeries(condition.b, context);

    if (!seriesA || !seriesB || seriesA.length < 2 || seriesB.length < 2) {
      return false;
    }

    const lookback = condition.lookback_candles ?? 1;
    const direction = condition.direction ?? 'any';

    const maxIndex = Math.min(seriesA.length, seriesB.length);

    for (let i = 1; i <= lookback && i < maxIndex; i++) {
      const currentIndex = maxIndex - i;
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) break;

      const prevA = seriesA[prevIndex];
      const prevB = seriesB[prevIndex];
      const currentA = seriesA[currentIndex];
      const currentB = seriesB[currentIndex];

      const crossedUp = prevA < prevB && currentA >= currentB;
      const crossedDown = prevA > prevB && currentA <= currentB;

      if (direction === 'up' && crossedUp) return true;
      if (direction === 'down' && crossedDown) return true;
      if (direction === 'any' && (crossedUp || crossedDown)) return true;
    }

    return false;
  }

  private evaluateHigherTimeframe(condition: HigherTimeframeCondition, context: EvaluationContext): boolean {
    const higher = this.lookupValue(['higherTimeframes', String(condition.timeframe)], context.features);
    if (!higher) {
      return false;
    }

    const nestedContext: EvaluationContext = {
      session: context.session,
      snapshot: context.snapshot,
      features: higher,
      payload: context.payload,
    };

    return this.evaluateCondition(condition.condition, nestedContext);
  }

  private resolveSeries(name: string, context: EvaluationContext): number[] | undefined {
    const series = this.lookupValue(['series', name], context.features);
    if (Array.isArray(series)) {
      return series.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
    }

    return undefined;
  }

  private resolveValue(ref: ValueRef, context: EvaluationContext): number | undefined {
    if (typeof ref === 'number') {
      return ref;
    }

    if (typeof ref === 'string') {
      const resolved = this.lookupValue(ref.split('.'), context.features) ?? this.lookupValue(ref.split('.'), context.payload);
      return typeof resolved === 'number' ? resolved : undefined;
    }

    if (typeof ref === 'object') {
      if (typeof ref.value === 'number') {
        return ref.value;
      }
      if (ref.path) {
        const resolved = this.lookupValue(ref.path.split('.'), context.features) ?? this.lookupValue(ref.path.split('.'), context.payload);
        return typeof resolved === 'number' ? resolved : undefined;
      }
    }

    return undefined;
  }

  private getNumber(path: (string | number)[], container: any): number | undefined {
    const value = this.lookupValue(path, container);
    return typeof value === 'number' ? value : undefined;
  }

  private lookupValue(path: (string | number)[] | string, container: any): any {
    if (!container) {
      return undefined;
    }

    if (typeof path === 'string') {
      if (path in container) {
        return container[path];
      }

      const normalized = this.normalizeKey(path);
      for (const key of Object.keys(container)) {
        if (this.normalizeKey(key) === normalized) {
          return container[key];
        }
      }

      const segments = path.split('.');
      return this.lookupValue(segments, container);
    }

    let current = container;
    for (const segment of path) {
      if (current === undefined || current === null) {
        return undefined;
      }

      const key = typeof segment === 'number' ? segment : segment;

      if (typeof key === 'number' && Array.isArray(current)) {
        current = current[key];
        continue;
      }

      if (typeof key === 'string') {
        if (key in current) {
          current = current[key];
          continue;
        }

        const normalized = this.normalizeKey(key);
        const matchedKey = Object.keys(current).find((entry) => this.normalizeKey(entry) === normalized);
        if (matchedKey) {
          current = current[matchedKey];
          continue;
        }

        return undefined;
      }
    }

    return current;
  }

  private normalizeKey(key: string) {
    return key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }
}
