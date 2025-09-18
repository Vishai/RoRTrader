const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export type CoachEvaluationStatus = 'GREEN' | 'YELLOW' | 'RED'

export type CoachEvaluationTag = {
  id: string
  name: string
  severity: 'INFO' | 'SETUP' | 'ENTRY' | 'EXIT'
}

export type CoachEvaluationAdvice = {
  headline: string
  body?: string | null
}

export type CoachEvaluation = {
  id: string
  status: CoachEvaluationStatus
  score: number | null
  tag?: CoachEvaluationTag | null
  advice?: CoachEvaluationAdvice | null
  createdAt: string
}

export type CoachSessionState = 'SCANNING' | 'SETUP_FORMING' | 'READY' | 'MANAGE'

export type CoachSession = {
  id: string
  symbol: string
  timeframeMinutes: number
  state: CoachSessionState
  updatedAt: string
}

// Mock fallback data so UI renders without backend
const MOCK_SESSIONS: CoachSession[] = [
  {
    id: 'session-1',
    symbol: 'AAPL',
    timeframeMinutes: 5,
    state: 'READY',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'session-2',
    symbol: 'ETHUSDT',
    timeframeMinutes: 15,
    state: 'SETUP_FORMING',
    updatedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
]

const MOCK_EVALUATIONS: Record<string, CoachEvaluation[]> = {
  'session-1': [
    {
      id: 'eval-1',
      status: 'GREEN',
      score: 0.82,
      tag: { id: 'tag-1', name: 'EMA Cross Recent', severity: 'ENTRY' },
      advice: {
        headline: 'Cross confirmed with momentum strength',
        body: 'Consider entry on break of recent swing with stop below EMA20.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'eval-2',
      status: 'YELLOW',
      score: 0.65,
      tag: { id: 'tag-2', name: 'Volume Confirmation', severity: 'SETUP' },
      advice: {
        headline: 'Volume building but needs confirmation',
        body: 'Wait for 1.2x average volume on next candle.',
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ],
  'session-2': [
    {
      id: 'eval-3',
      status: 'YELLOW',
      score: 0.58,
      tag: { id: 'tag-3', name: 'Higher TF Momentum', severity: 'SETUP' },
      advice: {
        headline: '4h trend aligning',
        body: 'Wait for retrace into EMA20 on 15m for cleaner entry.',
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
}

async function safeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }

    const data = (await res.json()) as { success?: boolean; data?: T }
    if (data && typeof data === 'object' && 'data' in data) {
      return (data.data ?? fallback) as T
    }

    return (data as unknown as T) ?? (fallback as T)
  } catch (error) {
    console.warn(`Coach API fallback [${path}]`, error)
    return fallback as T
  }
}

export async function fetchCoachSessions(): Promise<CoachSession[]> {
  return safeFetch<CoachSession[]>(`/coach/sessions`, undefined, MOCK_SESSIONS)
}

export async function fetchCoachEvaluations(sessionId: string): Promise<CoachEvaluation[]> {
  return safeFetch<CoachEvaluation[]>(`/coach/sessions/${sessionId}/evaluations`, undefined, MOCK_EVALUATIONS[sessionId] ?? [])
}

export async function startCoachSession(payload: {
  ruleSetId: string
  symbol: string
  timeframeMinutes: number
}): Promise<CoachSession | null> {
  return safeFetch<CoachSession>(
    `/coach/sessions`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    null
  )
}

export async function stopCoachSession(sessionId: string): Promise<boolean> {
  try {
    await safeFetch(`/coach/sessions/${sessionId}`, { method: 'DELETE' }, null)
    return true
  } catch (error) {
    console.warn('Coach session stop fallback', error)
    return false
  }
}

