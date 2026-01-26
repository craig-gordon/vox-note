import { useState, useCallback } from 'react'
import type { RecordingState, UseSpeechToTextReturn } from './useSpeechToText.types'

// Stub implementation for Expo Go - speech recognition requires a development build
// To enable speech recognition, run: npx expo prebuild && npx expo run:android

export function useSpeechToText(): UseSpeechToTextReturn {
  const [transcript, setTranscript] = useState('')

  const startRecording = useCallback(async () => {
    console.warn('Speech recognition requires a development build. Run: npx expo prebuild && npx expo run:android')
  }, [])

  const stopRecording = useCallback(() => {}, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  const playRecording = useCallback(() => {}, [])

  return {
    modelReady: false,
    isRecording: false,
    isTranscribing: false,
    transcript,
    recordingState: 'idle' as RecordingState,
    hasRecordedAudio: false,
    startRecording,
    stopRecording,
    clearTranscript,
    playRecording,
  }
}
