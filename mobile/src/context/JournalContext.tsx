import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
  useSpeechToText,
  useEntryStorage,
  useCalendarEntries,
  type UseSpeechToTextReturn,
  type UseEntryStorageReturn,
} from '@journaling-app/shared'

interface SelectedEntry {
  key: string
  content: string
}

interface JournalContextValue {
  // Speech to text
  isRecording: boolean
  isTranscribing: boolean
  transcript: string
  hasRecordedAudio: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  playRecording: () => void

  // Entry storage
  entryKeys: string[]
  isLoading: boolean
  saveEntry: (content: string, customDate?: Date) => Promise<string>
  loadEntry: (key: string) => Promise<string | null>
  deleteEntry: (key: string) => Promise<void>
  deleteAllEntries: () => Promise<void>
  refreshEntries: () => Promise<void>
  isRefreshing: boolean

  // Calendar entries
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  markedDates: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }>
  entriesForSelectedDate: string[]
  mostRecentEmptyDate: Date | null

  // Selected entry state
  selectedEntry: SelectedEntry | null
  setSelectedEntry: (entry: SelectedEntry | null) => void
  handleSelectEntry: (key: string) => Promise<void>
}

const JournalContext = createContext<JournalContextValue | null>(null)

interface JournalProviderProps {
  children: ReactNode
}

export function JournalProvider({ children }: JournalProviderProps) {
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const speechToText = useSpeechToText()
  const entryStorage = useEntryStorage()
  const calendarEntries = useCalendarEntries(entryStorage.entryKeys)

  const refreshEntries = useCallback(async () => {
    setIsRefreshing(true)
    await entryStorage.refreshEntries()
    setIsRefreshing(false)
  }, [entryStorage])

  const handleSelectEntry = useCallback(async (key: string) => {
    const content = await entryStorage.loadEntry(key)
    if (content) {
      setSelectedEntry({ key, content })
    }
  }, [entryStorage])

  const value: JournalContextValue = {
    // Speech to text
    isRecording: speechToText.isRecording,
    isTranscribing: speechToText.isTranscribing,
    transcript: speechToText.transcript,
    hasRecordedAudio: speechToText.hasRecordedAudio,
    startRecording: speechToText.startRecording,
    stopRecording: speechToText.stopRecording,
    clearTranscript: speechToText.clearTranscript,
    playRecording: speechToText.playRecording,

    // Entry storage
    entryKeys: entryStorage.entryKeys,
    isLoading: entryStorage.isLoading,
    saveEntry: entryStorage.saveEntry,
    loadEntry: entryStorage.loadEntry,
    deleteEntry: entryStorage.deleteEntry,
    deleteAllEntries: entryStorage.deleteAllEntries,
    refreshEntries,
    isRefreshing,

    // Calendar entries
    selectedDate: calendarEntries.selectedDate,
    setSelectedDate: calendarEntries.setSelectedDate,
    markedDates: calendarEntries.markedDates,
    entriesForSelectedDate: calendarEntries.entriesForSelectedDate,
    mostRecentEmptyDate: calendarEntries.mostRecentEmptyDate,

    // Selected entry state
    selectedEntry,
    setSelectedEntry,
    handleSelectEntry,
  }

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal(): JournalContextValue {
  const context = useContext(JournalContext)
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider')
  }
  return context
}
