// Components
export { JournalApp } from './components/JournalApp'

// Database
export { initializeNeonClient } from './db/neonClient'

// Hooks
export { useSpeechToText } from './hooks/useSpeechToText'
export { useEntryStorage } from './hooks/useEntryStorage'
export { useCalendarEntries } from './hooks/useCalendarEntries'

// Hooks - types
export type { UseSpeechToTextReturn, RecordingState } from './hooks/useSpeechToText.types'
export type { UseEntryStorageReturn } from './hooks/useEntryStorage.types'

// Utils
export { formatEntryKey, formatEntryKeyReadable } from './utils/formatEntryKey'
export { formatDateForDisplay } from './utils/entryDateUtils'
export { suppressKnownWarnings } from './utils/suppressLogs'
