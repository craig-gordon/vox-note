import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { format } from 'date-fns'
import { useJournal } from '../context/JournalContext'

export function RecordScreen() {
  const {
    isRecording,
    isTranscribing,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    saveEntry,
    mostRecentEmptyDate,
  } = useJournal()

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
  }

  const handleSaveToDate = async () => {
    if (mostRecentEmptyDate) {
      await saveEntry(transcript, mostRecentEmptyDate)
      clearTranscript()
    }
  }

  const handleRecordAgain = () => {
    clearTranscript()
    startRecording()
  }

  const handleDiscard = () => {
    clearTranscript()
  }

  const getButtonText = () => {
    if (isRecording) return 'Stop Recording'
    if (isTranscribing) return 'Transcribing...'
    return 'Start Recording'
  }

  const isButtonDisabled = isTranscribing

  const formatTestButtonDate = () => {
    if (!mostRecentEmptyDate) return ''
    return format(mostRecentEmptyDate, 'MMM d')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.recordSection}>
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

        {transcript ? (
          <>
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Your Entry:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>

            <View style={styles.buttonRow}>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={handleRecordAgain}>
                <Text style={styles.secondaryButtonText}>Record Again</Text>
              </Pressable>
            </View>

            <View style={styles.buttonRow}>
              {mostRecentEmptyDate ? (
                <Pressable style={styles.testButton} onPress={handleSaveToDate}>
                  <Text style={styles.testButtonText}>Save to {formatTestButtonDate()}</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.discardButton} onPress={handleDiscard}>
                <Text style={styles.discardButtonText}>Discard</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isRecording
                ? 'Recording in progress...'
                : 'Tap the button above to start recording your journal entry'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  recordSection: {
    width: '100%',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonDisabled: {
    backgroundColor: '#999',
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
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 150,
    width: '100%',
    marginBottom: 20,
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
    width: '100%',
    marginBottom: 12,
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
  testButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
})
