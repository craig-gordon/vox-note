import { useState, useRef, useCallback } from 'react'
import { useAudioRecorder, RecordingPresets, createAudioPlayer, requestRecordingPermissionsAsync } from 'expo-audio'
import type { AudioPlayer } from 'expo-audio'
import * as FileSystem from 'expo-file-system'
import Constants from 'expo-constants'
import { transcribeWithWhisperApi } from '../utils/whisperApi'
import type { RecordingState, UseSpeechToTextReturn } from './useSpeechToText.types'

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey as string | undefined

export function useSpeechToText(): UseSpeechToTextReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)

  const lastRecordingUriRef = useRef<string | null>(null)
  const playerRef = useRef<AudioPlayer | null>(null)

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured in app.config.js')
      setTranscript('[API key not configured]')
      return
    }

    try {
      const { granted } = await requestRecordingPermissionsAsync()
      if (!granted) {
        console.error('Microphone permission denied')
        setTranscript('[Microphone permission denied]')
        return
      }

      await audioRecorder.prepareToRecordAsync()
      audioRecorder.record()
      setRecordingState('recording')
      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      setRecordingState('idle')
    }
  }, [recordingState, audioRecorder])

  const stopRecording = useCallback(async () => {
    if (recordingState !== 'recording') return

    try {
      await audioRecorder.stop()
      const uri = audioRecorder.uri

      if (!uri) {
        console.error('No recording URI')
        setTranscript('[Recording failed]')
        setRecordingState('idle')
        return
      }

      lastRecordingUriRef.current = uri
      setHasRecordedAudio(true)
      console.log('Recording URI:', uri)

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        console.error('Recording file does not exist')
        setTranscript('[Recording failed]')
        setRecordingState('idle')
        return
      }

      console.log('Audio recorded:', ((fileInfo.size || 0) / 1024).toFixed(1), 'KB')

      setRecordingState('transcribing')
      console.log('Sending to Whisper API...')
      const startTime = Date.now()

      // Use file URI directly - React Native's fetch handles this
      const result = await transcribeWithWhisperApi(
        { uri, type: 'audio/m4a', name: 'recording.m4a' },
        { apiKey: OPENAI_API_KEY! }
      )

      console.log('Transcription completed in', ((Date.now() - startTime) / 1000).toFixed(1), 'seconds')
      setTranscript(result.text.trim())
    } catch (error) {
      console.error('Transcription error:', error)
      setTranscript('[Transcription failed]')
    }

    setRecordingState('idle')
  }, [recordingState, audioRecorder])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    lastRecordingUriRef.current = null
    setHasRecordedAudio(false)
  }, [])

  const persistAudio = useCallback(async (entryKey: string) => {
    const uri = lastRecordingUriRef.current
    if (!uri) return

    const audioDir = `${FileSystem.documentDirectory}audio/`
    const dirInfo = await FileSystem.getInfoAsync(audioDir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true })
    }

    const safeFilename = entryKey.replace(/:/g, '-')
    await FileSystem.copyAsync({ from: uri, to: `${audioDir}${safeFilename}.m4a` })
    console.log('Audio persisted for entry:', entryKey)
  }, [])

  const playRecording = useCallback(async () => {
    const uri = lastRecordingUriRef.current
    if (!uri) {
      console.warn('No recorded audio to play')
      return
    }

    try {
      // Clean up previous player
      if (playerRef.current) {
        playerRef.current.release()
      }

      const player = createAudioPlayer(uri)
      playerRef.current = player
      player.play()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }, [])

  return {
    isRecording: recordingState === 'recording',
    isTranscribing: recordingState === 'transcribing',
    transcript,
    recordingState,
    hasRecordedAudio,
    startRecording,
    stopRecording,
    clearTranscript,
    playRecording,
    persistAudio,
  }
}
