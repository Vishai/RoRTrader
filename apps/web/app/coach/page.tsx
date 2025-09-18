'use client'

import { useEffect, useState } from 'react'
import {
  CoachRibbon,
  CoachPanel,
  CoachSessionList,
  SessionLauncher,
  RuleSetEditor,
} from '@/components/coach'
import {
  CoachEvaluation,
  CoachSession,
  fetchCoachEvaluations,
  fetchCoachSessions,
  startCoachSession,
  stopCoachSession,
} from '@/lib/api/coach'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function CoachHubPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined)
  const [sessions, setSessions] = useState<CoachSession[]>([])
  const [evaluations, setEvaluations] = useState<CoachEvaluation[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)

  useEffect(() => {
    async function loadSessions() {
      setLoadingSessions(true)
      const data = await fetchCoachSessions()
      setSessions(data)
      setLoadingSessions(false)
      if (!selectedSessionId && data.length > 0) {
        setSelectedSessionId(data[0].id)
      }
    }
    void loadSessions()
  }, [selectedSessionId])

  useEffect(() => {
    if (!selectedSessionId) {
      setEvaluations([])
      return
    }
    async function loadEvaluations() {
      setLoadingEvaluations(true)
      const data = await fetchCoachEvaluations(selectedSessionId)
      setEvaluations(data)
      setLoadingEvaluations(false)
    }
    void loadEvaluations()
  }, [selectedSessionId])

  const activeSession = sessions.find((session) => session.id === selectedSessionId)

  return (
    <main className="min-h-screen bg-background-primary">
      <section className="relative overflow-hidden border-b border-border-default bg-gradient-dark">
        <div className="absolute inset-0 bg-gradient-primary/5 blur-3xl" />
        <div className="container relative mx-auto flex flex-col gap-8 px-6 py-16">
          <div className="max-w-3xl space-y-4">
            <Badge className="w-fit bg-accent-purple/20 text-accent-purple">Live Training</Badge>
            <h1 className="text-4xl font-semibold text-text-primary sm:text-5xl">
              Your real-time trading coach
            </h1>
            <p className="text-lg text-text-secondary">
              Launch guided sessions, track verified conditions, and manage rule sets to support you during live market execution.
            </p>
          </div>
          {activeSession && (
            <CoachRibbon
              sessionId={activeSession.id}
              evaluations={evaluations}
              riskReward={1.8}
              expectedValue={0.38}
              onOpenPanel={() => {
                const coachPanel = document.getElementById('coach-panel')
                coachPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            />
          )}
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 py-12 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <CoachSessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelect={(sessionId) => setSelectedSessionId(sessionId)}
          />
          <SessionLauncher
            isRunning={Boolean(activeSession)}
            defaultSymbol={activeSession?.symbol}
            defaultTimeframe={activeSession?.timeframeMinutes}
            onStart={async ({ symbol, timeframeMinutes }) => {
              if (!sessions.length) {
                await startCoachSession({
                  ruleSetId: 'ruleset-demo-001',
                  symbol,
                  timeframeMinutes,
                })
                const refreshed = await fetchCoachSessions()
                setSessions(refreshed)
                if (refreshed.length > 0) {
                  setSelectedSessionId(refreshed[0].id)
                }
              }
            }}
            onStop={async () => {
              if (!selectedSessionId) return
              const success = await stopCoachSession(selectedSessionId)
              if (success) {
                const refreshed = await fetchCoachSessions()
                setSessions(refreshed)
                setSelectedSessionId(refreshed[0]?.id)
              }
            }}
          />
          <RuleSetEditor ruleSetId="ruleset-demo-001" />
        </div>

        <div className="space-y-6" id="coach-panel">
          <CoachPanel
            sessionId={activeSession?.id}
            symbol={activeSession?.symbol}
            timeframeMinutes={activeSession?.timeframeMinutes}
            state={activeSession?.state}
            evaluations={evaluations}
            heartbeatLag={false}
          />

          <Card className="border-border-hover bg-background-secondary/70">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-text-primary">Upcoming Enhancements</h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>• Connect directly to TradingView webhooks for live metrics fetching.</li>
                <li>• Enable editing and versioning of rule sets from the browser.</li>
                <li>• Stream evaluations via websockets for instant ribbon updates.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {loadingSessions || loadingEvaluations ? (
        <div className="pb-12 text-center text-xs uppercase tracking-[0.2em] text-text-tertiary">
          Synchronizing coaching data…
        </div>
      ) : null}
    </main>
  )
}
