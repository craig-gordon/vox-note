import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { useWhisper } from './hooks/useWhisper'

const STORAGE_PREFIX = 'journal_'

function formatEntryKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const hoursStr = String(hours).padStart(2, '0')
  return `${month}-${day}-${year}_${hoursStr}:${minutes}:${seconds}${ampm}`
}

function loadAllEntryKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ''))
    }
  }
  return keys.sort().reverse()
}

function App() {
  const [entryKeys, setEntryKeys] = useState<string[]>([])
  const [selectedEntry, setSelectedEntry] = useState<{ key: string; content: string } | null>(null)

  const {
    modelReady,
    isRecording,
    isTranscribing,
    transcript,
    hasRecordedAudio,
    startRecording,
    stopRecording,
    clearTranscript,
    playRecording,
  } = useWhisper()

  useEffect(() => {
    setEntryKeys(loadAllEntryKeys())
  }, [])

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isTranscribing) {
      startRecording()
    }
  }

  const handleSave = () => {
    const key = formatEntryKey(new Date())
    localStorage.setItem(STORAGE_PREFIX + key, transcript)
    setEntryKeys(loadAllEntryKeys())
    clearTranscript()
    setSelectedEntry(null)
  }

  const handleSelectEntry = (key: string) => {
    const content = localStorage.getItem(STORAGE_PREFIX + key)
    if (content) {
      setSelectedEntry({ key, content })
    }
  }

  const handleBackToList = () => {
    setSelectedEntry(null)
  }

  const handleClearAllEntries = () => {
    const keysToDelete: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key))
    setEntryKeys([])
    setSelectedEntry(null)
  }

  const getButtonText = () => {
    if (isRecording) return 'Stop Recording'
    if (isTranscribing && !modelReady) return 'Getting things ready...'
    if (isTranscribing) return 'Transcribing...'
    return 'Start Recording'
  }

  const isButtonDisabled = isTranscribing

  if (selectedEntry) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Journal</Text>
        <Pressable style={styles.backButton} onPress={handleBackToList}>
          <Text style={styles.backButtonText}>← Back to entries</Text>
        </Pressable>
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>{selectedEntry.key}</Text>
          <Text style={styles.transcriptText}>{selectedEntry.content}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Journal</Text>

      {/* Recording Button */}
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

      {/* Play Recording Button (for debugging) */}
      {hasRecordedAudio && !isRecording && (
        <Pressable style={styles.playButton} onPress={playRecording}>
          <Text style={styles.playButtonText}>▶ Play Recording</Text>
        </Pressable>
      )}

      {/* Model Status Indicator */}
      {!modelReady && !isTranscribing && (
        <Text style={styles.statusText}>Loading speech recognition model...</Text>
      )}

      {/* Transcript Display */}
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Your Entry:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}

      {/* Save Button */}
      {transcript && (
        <View style={styles.buttonRow}>
          <Pressable style={styles.secondaryButton} onPress={clearTranscript}>
            <Text style={styles.secondaryButtonText}>Record Again</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </Pressable>
        </View>
      )}

      {/* Saved Entries List */}
      {entryKeys.length > 0 && (
        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesSectionTitle}>Saved Entries</Text>
            <Pressable onPress={handleClearAllEntries}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.entriesList}>
            {entryKeys.map((key) => (
              <Pressable
                key={key}
                style={styles.entryItem}
                onPress={() => handleSelectEntry(key)}
              >
                <Text style={styles.entryItemText}>{key}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
  entriesSection: {
    marginTop: 30,
    flex: 1,
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
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
})

export default App
