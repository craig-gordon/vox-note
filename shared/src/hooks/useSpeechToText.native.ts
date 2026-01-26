import { useState, useCallback, useEffect } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'
import type { RecordingState, UseSpeechToTextReturn } from './useSpeechToText.types'

export function useSpeechToText(): UseSpeechToTextReturn {
  const [modelReady, setModelReady] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)

  // Check permissions on mount
  useEffect(() => {
    async function checkPermissions() {
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync()
      if (result.granted) {
        setModelReady(true)
      } else {
        const requestResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
        setModelReady(requestResult.granted)
      }
    }
    checkPermissions()
  }, [])

  // Handle speech recognition results
  useSpeechRecognitionEvent('result', (event) => {
    if (event.isFinal) {
      const finalTranscript = event.results[0]?.transcript || ''
      setTranscript(finalTranscript)
      setRecordingState('idle')
      setHasRecordedAudio(true)
    }
  })

  // Handle errors
  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error, event.message)
    setRecordingState('idle')
  })

  // Handle end of speech
  useSpeechRecognitionEvent('end', () => {
    if (recordingState === 'recording') {
      setRecordingState('transcribing')
    }
  })

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return

    if (!modelReady) {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
      if (!result.granted) {
        console.error('Speech recognition permission not granted')
        return
      }
      setModelReady(true)
    }

    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: false,
        continuous: false,
      })
      setRecordingState('recording')
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
    }
  }, [recordingState, modelReady])

  const stopRecording = useCallback(() => {
    if (recordingState !== 'recording') return

    ExpoSpeechRecognitionModule.stop()
    setRecordingState('transcribing')
  }, [recordingState])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setHasRecordedAudio(false)
  }, [])

  const playRecording = useCallback(() => {
    // Native speech recognition doesn't store audio for playback
    console.warn('Audio playback is not available on native')
  }, [])

  return {
    modelReady,
    isRecording: recordingState === 'recording',
    isTranscribing: recordingState === 'transcribing',
    transcript,
    recordingState,
    hasRecordedAudio,
    startRecording,
    stopRecording,
    clearTranscript,
    playRecording,
  }
}
