// Components
export { JournalApp } from './components/JournalApp'

// Database
export { initializeNeonClient } from './db/neonClient'

// Hooks
export { useSpeechToText } from './hooks/useSpeechToText'
export { useEntryStorage } from './hooks/useEntryStorage'
export { useCalendarEntries } from './hooks/useCalendarEntries'
export { useInsights } from './hooks/useInsights'

// Hooks - types
export type { UseSpeechToTextReturn, RecordingState } from './hooks/useSpeechToText.types'
export type { UseEntryStorageReturn } from './hooks/useEntryStorage.types'
export type { UseInsightsReturn, FeedbackType } from './hooks/useInsights'

// Utils
export { formatEntryKey, formatEntryKeyReadable, formatEntryLabel } from './utils/formatEntryKey'
export { formatDateForDisplay } from './utils/entryDateUtils'
export { suppressKnownWarnings } from './utils/suppressLogs'
export { generateInsights } from './utils/generateInsights'
export type { InsightItem, InsightType, InsightsResult } from './utils/generateInsights'
