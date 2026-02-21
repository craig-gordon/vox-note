import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Platform } from 'react-native'
import { Calendar } from 'react-native-calendars'
import type { DateData } from 'react-native-calendars'
import { format } from 'date-fns'
import { useSpeechToText } from '../hooks/useSpeechToText'
import { useEntryStorage } from '../hooks/useEntryStorage'
import { useCalendarEntries } from '../hooks/useCalendarEntries'
import { formatEntryKeyReadable } from '../utils/formatEntryKey'
import { formatDateForDisplay } from '../utils/entryDateUtils'

export function JournalApp() {
  const [selectedEntry, setSelectedEntry] = useState<{ key: string; content: string } | null>(null)

  const {
    isRecording,
    isTranscribing,
    transcript,
    hasRecordedAudio,
    startRecording,
    stopRecording,
    clearTranscript,
    playRecording,
    persistAudio,
  } = useSpeechToText()

  const {
    entryKeys,
    saveEntry,
    loadEntry,
    deleteAllEntries,
  } = useEntryStorage()

  const {
    selectedDate,
    setSelectedDate,
    markedDates,
    entriesForSelectedDate,
    mostRecentEmptyDate,
  } = useCalendarEntries(entryKeys)

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isTranscribing) {
      startRecording()
    }
  }

  const handleSave = async () => {
    const key = await saveEntry(transcript)
    await persistAudio(key)
    clearTranscript()
    setSelectedEntry(null)
  }

  const handleSaveToDate = async () => {
    if (mostRecentEmptyDate) {
      const key = await saveEntry(transcript, mostRecentEmptyDate)
      await persistAudio(key)
      clearTranscript()
      setSelectedEntry(null)
    }
  }

  const handleRecordAgain = () => {
    clearTranscript()
    startRecording()
  }

  const handleDayPress = useCallback(async (day: DateData) => {
    setSelectedEntry(null)
    setSelectedDate(day.dateString)
  }, [setSelectedDate])

  const handleSelectEntry = useCallback(async (key: string) => {
    const content = await loadEntry(key)
    if (content) {
      setSelectedEntry({ key, content })
    }
  }, [loadEntry])

  const handleCloseEntry = () => {
    setSelectedEntry(null)
  }

  const handleClearAllEntries = async () => {
    await deleteAllEntries()
    setSelectedEntry(null)
    setSelectedDate(null)
  }

  const getButtonText = () => {
    if (isRecording) return 'Stop Recording'
    if (isTranscribing) return 'Transcribing'
    return 'Start Recording'
  }

  const isButtonDisabled = isTranscribing

  const isWeb = Platform.OS === 'web'

  // Auto-load entry when selecting a date with single entry
  const autoLoadSingleEntry = useCallback(async () => {
    if (entriesForSelectedDate.length === 1 && !selectedEntry) {
      const key = entriesForSelectedDate[0]
      const content = await loadEntry(key)
      if (content) {
        setSelectedEntry({ key, content })
      }
    }
  }, [entriesForSelectedDate, selectedEntry, loadEntry])

  // Effect to auto-load single entry
  if (entriesForSelectedDate.length === 1 && !selectedEntry) {
    autoLoadSingleEntry()
  }

  const formatTestButtonDate = () => {
    if (!mostRecentEmptyDate) return ''
    return format(mostRecentEmptyDate, 'MMM d')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Journal</Text>

      <View style={[styles.columns, !isWeb && styles.columnsMobile]}>
        <View style={[styles.leftColumn, !isWeb && styles.leftColumnMobile]}>
          <Pressable
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              isButtonDisabled && styles.recordButtonDisabled,
            ]}
            onPress={handleRecordPress}
            disabled={isButtonDisabled}
          >
            {isTranscribing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.recordButtonText}>{getButtonText()}</Text>
              </View>
            ) : (
              <Text style={styles.recordButtonText}>{getButtonText()}</Text>
            )}
          </Pressable>

          {hasRecordedAudio && !isRecording && isWeb ? (
            <Pressable style={styles.playButton} onPress={playRecording}>
              <Text style={styles.playButtonText}>Play Recording</Text>
            </Pressable>
          ) : null}

          {transcript ? (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Your Entry:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          ) : null}

          {transcript ? (
            <View style={[styles.buttonRow, !isWeb && styles.buttonRowMobile]}>
              <Pressable style={[styles.secondaryButton, !isWeb && styles.buttonMobile]} onPress={handleRecordAgain}>
                <Text style={styles.secondaryButtonText}>Record Again</Text>
              </Pressable>
              <Pressable style={[styles.saveButton, !isWeb && styles.buttonMobile]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </Pressable>
              {mostRecentEmptyDate ? (
                <Pressable style={[styles.testButton, !isWeb && styles.buttonMobile]} onPress={handleSaveToDate}>
                  <Text style={styles.testButtonText}>Save to {formatTestButtonDate()}</Text>
                </Pressable>
              ) : null}
              <Pressable style={[styles.deleteButton, !isWeb && styles.buttonMobile]} onPress={clearTranscript}>
                <Text style={styles.deleteButtonText}>Delete Entry</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={[styles.rightColumn, !isWeb && styles.rightColumnMobile]}>
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesSectionTitle}>Journal Calendar</Text>
            {entryKeys.length > 0 ? (
              <Pressable onPress={handleClearAllEntries}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            ) : null}
          </View>

          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'white',
              textSectionTitleColor: '#666',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007AFF',
              dayTextColor: '#333',
              textDisabledColor: '#d9e1e8',
              dotColor: '#007AFF',
              selectedDotColor: '#ffffff',
              arrowColor: '#007AFF',
              monthTextColor: '#333',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
            }}
            style={styles.calendar}
          />

          {selectedDate && entriesForSelectedDate.length > 1 ? (
            <View style={styles.entriesListContainer}>
              <Text style={styles.dateLabel}>
                {formatDateForDisplay(selectedDate)} ({entriesForSelectedDate.length} entries)
              </Text>
              <ScrollView style={styles.entriesList}>
                {entriesForSelectedDate.map((key) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.entryItem,
                      selectedEntry?.key === key && styles.entryItemSelected,
                    ]}
                    onPress={() => handleSelectEntry(key)}
                  >
                    <Text style={styles.entryItemText}>{formatEntryKeyReadable(key)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {selectedDate && entriesForSelectedDate.length === 0 ? (
            <View style={styles.noEntriesContainer}>
              <Text style={styles.noEntriesText}>
                No entries for {formatDateForDisplay(selectedDate)}
              </Text>
            </View>
          ) : null}

          {selectedEntry ? (
            <View style={styles.selectedEntryContainer}>
              <View style={styles.selectedEntryHeader}>
                <Text style={styles.selectedEntryLabel}>{formatEntryKeyReadable(selectedEntry.key)}</Text>
                <Pressable onPress={handleCloseEntry}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>
              <Text style={styles.selectedEntryText}>{selectedEntry.content}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    ...(Platform.OS === 'web' ? { minHeight: '100vh' as unknown as number } : {}),
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  columnsMobile: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: 1,
    alignItems: 'center',
  },
  leftColumnMobile: {
    flex: 0,
    marginBottom: 24,
  },
  rightColumn: {
    flex: 1,
  },
  rightColumnMobile: {
    flex: 2,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 200,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonDisabled: {
    backgroundColor: '#999',
  },
  playButton: {
    backgroundColor: '#5856D6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  transcriptContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 150,
    width: '100%',
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
    flexWrap: 'wrap',
  },
  buttonRowMobile: {
    flexDirection: 'column',
  },
  buttonMobile: {
    flex: 0,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entriesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  calendar: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  entriesListContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  entriesList: {
    maxHeight: 150,
  },
  entryItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  entryItemText: {
    fontSize: 16,
    color: '#007AFF',
  },
  entryItemSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  noEntriesContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  noEntriesText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedEntryContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
  },
  selectedEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedEntryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  closeText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectedEntryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
})

export default JournalApp
