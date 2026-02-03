import { useState, useCallback, useRef } from 'react'
import { getEntriesForDateRange } from '../db/entryRepository'
import { generateInsights, type InsightsResult } from '../utils/generateInsights'

export interface UseInsightsReturn {
  insights: InsightsResult | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  fetchInsights: () => Promise<void>
}

export function useInsights(apiKey: string | undefined): UseInsightsReturn {
  const [insights, setInsights] = useState<InsightsResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)

  const fetchInsights = useCallback(async () => {
    if (!apiKey) {
      setError('API key not configured')
      return
    }

    if (isFetchingRef.current) return
    isFetchingRef.current = true

    // Show loading only if no cached insights
    if (!insights) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const entries = await getEntriesForDateRange(startDate, endDate)
      const result = await generateInsights(entries, apiKey)
      setInsights(result)
    } catch (err) {
      console.error('Failed to generate insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      isFetchingRef.current = false
    }
  }, [apiKey, insights])

  return {
    insights,
    isLoading,
    isRefreshing,
    error,
    fetchInsights,
  }
}
