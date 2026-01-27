import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Platform } from 'react-native'
import { useSpeechToText } from '../hooks/useSpeechToText'
import { useEntryStorage } from '../hooks/useEntryStorage'
import { formatEntryKeyReadable } from '../utils/formatEntryKey'

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
  } = useSpeechToText()

  const {
    entryKeys,
    saveEntry,
    loadEntry,
    deleteAllEntries,
  } = useEntryStorage()

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isTranscribing) {
      startRecording()
    }
  }

  const handleSave = async () => {
    await saveEntry(transcript)
    clearTranscript()
    setSelectedEntry(null)
  }

  const handleRecordAgain = () => {
    clearTranscript()
    startRecording()
  }

  const handleSelectEntry = useCallback(async (key: string) => {
    const content = await loadEntry(key)
    if (content) {
      setSelectedEntry({ key, content })
    }
  }, [loadEntry])

  const handleBackToList = () => {
    setSelectedEntry(null)
  }

  const handleClearAllEntries = async () => {
    await deleteAllEntries()
    setSelectedEntry(null)
  }

  const getButtonText = () => {
    if (isRecording) return 'Stop Recording'
    if (isTranscribing) return 'Transcribing'
    return 'Start Recording'
  }

  const isButtonDisabled = isTranscribing

  const isWeb = Platform.OS === 'web'

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
              <Pressable style={styles.secondaryButton} onPress={handleRecordAgain}>
                <Text style={styles.secondaryButtonText}>Record Again</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={clearTranscript}>
                <Text style={styles.deleteButtonText}>Delete Entry</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={[styles.rightColumn, !isWeb && styles.rightColumnMobile]}>
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesSectionTitle}>Saved Entries</Text>
            {entryKeys.length > 0 ? (
              <Pressable onPress={handleClearAllEntries}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            ) : null}
          </View>

          {entryKeys.length === 0 ? (
            <Text style={styles.emptyText}>No entries yet</Text>
          ) : (
            <ScrollView style={styles.entriesList}>
              {entryKeys.map((key) => (
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
          )}

          {selectedEntry ? (
            <View style={styles.selectedEntryContainer}>
              <View style={styles.selectedEntryHeader}>
                <Text style={styles.selectedEntryLabel}>{formatEntryKeyReadable(selectedEntry.key)}</Text>
                <Pressable onPress={handleBackToList}>
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
  statusText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
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
  },
  buttonRowMobile: {
    flexDirection: 'column',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
  },
  saveButtonText: {
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
  entriesList: {
    flex: 1,
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
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  selectedEntryContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 16,
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
