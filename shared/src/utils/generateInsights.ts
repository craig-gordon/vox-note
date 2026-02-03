import { chatCompletion, type ChatMessage } from './llmApi'
import type { EntryWithContent } from '../db/entryRepository'

export type InsightType = 'mood' | 'energy' | 'productivity' | 'pattern' | 'suggestion'

export interface InsightItem {
  type: InsightType
  title: string
  description: string
  icon: string
}

export interface InsightsResult {
  insights: InsightItem[]
  analyzedEntryCount: number
}

const SYSTEM_PROMPT = `You are a thoughtful journal analyst helping users understand patterns in their life.
Analyze the provided journal entries and return insights in JSON format.

Return a JSON object with an "insights" array containing 3-5 insight objects. Each insight should have:
- type: one of "mood", "energy", "productivity", "pattern", or "suggestion"
- title: a short title (5-8 words max)
- description: a brief 1-2 sentence explanation
- icon: an Ionicons icon name that fits the insight (e.g., "happy-outline", "flash-outline", "trending-up-outline", "repeat-outline", "bulb-outline")

Focus on:
- Mood/emotional patterns across entries
- Energy levels and what affects them
- Behavioral patterns (recurring themes, habits)
- One actionable suggestion based on patterns

Be empathetic and constructive. Avoid clinical language.

IMPORTANT: Return ONLY valid JSON, no markdown or explanation.`

function formatEntriesForPrompt(entries: EntryWithContent[]): string {
  return entries
    .map((e) => {
      const date = e.entry_key.slice(0, 10) // YYYY-MM-DD
      return `[${date}]\n${e.content}`
    })
    .join('\n\n---\n\n')
}

export async function generateInsights(
  entries: EntryWithContent[],
  apiKey: string
): Promise<InsightsResult> {
  if (entries.length === 0) {
    return { insights: [], analyzedEntryCount: 0 }
  }

  const formattedEntries = formatEntriesForPrompt(entries)
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Here are my journal entries from the past week:\n\n${formattedEntries}` },
  ]

  const result = await chatCompletion(messages, { apiKey })

  // Parse JSON response
  const parsed = JSON.parse(result.content)
  const insights: InsightItem[] = parsed.insights || []

  return {
    insights,
    analyzedEntryCount: entries.length,
  }
}
