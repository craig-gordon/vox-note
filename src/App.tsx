import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useWhisper } from './hooks/useWhisper'

function App() {
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

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isTranscribing) {
      startRecording()
    }
  }

  const handleSave = () => {
    console.log('Save entry:', transcript)
    clearTranscript()
  }

  const getButtonText = () => {
    if (isRecording) return 'Stop Recording'
    if (isTranscribing && !modelReady) return 'Getting things ready...'
    if (isTranscribing) return 'Transcribing...'
    return 'Start Recording'
  }

  const isButtonDisabled = isTranscribing

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
})

export default App
