import { useState, useRef, useCallback } from 'react'
import { transcribeWithWhisperApi } from '../utils/whisperApi'
import type { RecordingState, UseSpeechToTextReturn } from './useSpeechToText.types'

const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

export function useSpeechToText(): UseSpeechToTextReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const lastRecordingBlobRef = useRef<Blob | null>(null)

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return

    if (!VITE_OPENAI_API_KEY) {
      console.error('VITE_OPENAI_API_KEY environment variable is not set')
      setTranscript('[API key not configured]')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Stop microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        lastRecordingBlobRef.current = audioBlob
        setHasRecordedAudio(true)

        if (audioBlob.size === 0) {
          console.error('No audio data recorded')
          setTranscript('[No audio recorded]')
          setRecordingState('idle')
          return
        }

        console.log('Audio recorded:', (audioBlob.size / 1024).toFixed(1), 'KB')

        try {
          setRecordingState('transcribing')
          console.log('Sending to Whisper API...')
          const startTime = Date.now()

          const result = await transcribeWithWhisperApi(audioBlob, {
            apiKey: VITE_OPENAI_API_KEY!,
          })

          console.log('Transcription completed in', ((Date.now() - startTime) / 1000).toFixed(1), 'seconds')
          setTranscript(result.text.trim())
        } catch (error) {
          console.error('Transcription error:', error)
          setTranscript('[Transcription failed]')
        }

        setRecordingState('idle')
      }

      mediaRecorder.start()
      setRecordingState('recording')
      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      setRecordingState('idle')
    }
  }, [recordingState])

  const stopRecording = useCallback(() => {
    if (recordingState !== 'recording') return

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [recordingState])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    lastRecordingBlobRef.current = null
    setHasRecordedAudio(false)
  }, [])

  const playRecording = useCallback(() => {
    const audioBlob = lastRecordingBlobRef.current
    if (!audioBlob) {
      console.warn('No recorded audio to play')
      return
    }

    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)

    audio.onended = () => {
      URL.revokeObjectURL(url)
    }

    audio.play().catch(err => {
      console.error('Failed to play audio:', err)
      URL.revokeObjectURL(url)
    })
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
  }
}
