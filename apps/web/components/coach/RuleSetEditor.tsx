'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

type RuleSetEditorProps = {
  ruleSetId?: string
  onEdit?: () => void
}

export function RuleSetEditor({ ruleSetId, onEdit }: RuleSetEditorProps) {
  return (
    <Card className="border-border-hover bg-background-secondary/70 backdrop-blur-xs">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-text-primary">Rule Set</CardTitle>
        <CardDescription>
          Define the conditions, thresholds, and tags that power live coaching sessions. Full CRUD hooks coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-dashed border-border-default bg-background-primary/40 p-4 text-sm text-text-secondary">
          {ruleSetId ? (
            <div>
              <div className="text-text-primary">Active Rule Set</div>
              <div className="text-text-tertiary">ID: {ruleSetId}</div>
            </div>
          ) : (
            <p>No published rule set yet. Paste your strategy DSL or start from a template.</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary" htmlFor="ruleset-dsl">
            Strategy DSL (preview only)
          </label>
          <Textarea
            id="ruleset-dsl"
            placeholder={'{"name": "ema_cross_recent", "when": { ... }}'}
            className="min-h-[140px] bg-background-primary/60"
            disabled
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onEdit} disabled>
            Manage Rule Sets
          </Button>
          <Button disabled glow>
            Coming Soon
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RuleSetEditor
