import { useState, useEffect, useRef, useCallback } from 'react'
import { pipeline, AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'
import { suppressKnownWarnings } from '../utils/suppressLogs'
import type { RecordingState, UseSpeechToTextReturn } from './useSpeechToText.types'

const SAMPLE_RATE = 16000

function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size
  view.setUint16(20, 1, true) // AudioFormat (PCM)
  view.setUint16(22, 1, true) // NumChannels
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // ByteRate
  view.setUint16(32, 2, true) // BlockAlign
  view.setUint16(34, 16, true) // BitsPerSample
  writeString(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // Convert Float32 to Int16
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [modelReady, setModelReady] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)

  const pipelineRef = useRef<AutomaticSpeechRecognitionPipeline | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioChunksRef = useRef<Float32Array[]>([])
  const pendingStartRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)
  const lastRecordedAudioRef = useRef<Float32Array | null>(null)

  // Load model eagerly on mount
  useEffect(() => {
    let cancelled = false
    const restoreConsole = suppressKnownWarnings()

    async function loadModel() {
      try {
        console.log('Loading Whisper model (WebGPU)...')
        const transcriber = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-small.en',
          { device: 'webgpu', dtype: 'fp32' }
        )

        if (!cancelled) {
          console.log('Whisper model loaded successfully (WebGPU)')
          pipelineRef.current = transcriber
          setModelReady(true)

          if (pendingStartRef.current) {
            pendingStartRef.current = false
            startRecordingInternal()
          }
        }
      } catch (error) {
        console.error('Failed to load Whisper model with WebGPU:', error)
        // Fallback to CPU if WebGPU fails
        console.log('Retrying Whisper with CPU...')
        try {
          const transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-small.en',
          )
          if (!cancelled) {
            console.log('Whisper model loaded successfully (CPU fallback)')
            pipelineRef.current = transcriber
            setModelReady(true)

            if (pendingStartRef.current) {
              pendingStartRef.current = false
              startRecordingInternal()
            }
          }
        } catch (fallbackError) {
          console.error('Failed to load Whisper model (CPU fallback):', fallbackError)
        }
      }
    }

    loadModel()

    return () => {
      cancelled = true
      restoreConsole()
    }
  }, [])

  const startRecordingInternal = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
        }
      })
      streamRef.current = stream
      audioChunksRef.current = []

      // Create audio context at 16kHz for Whisper
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
      audioContextRef.current = audioContext

      // Create source from microphone
      const source = audioContext.createMediaStreamSource(stream)

      // Use ScriptProcessorNode to capture raw audio samples
      // (AudioWorklet would be better but requires more setup)
      const bufferSize = 4096
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        // Copy the data since the buffer gets reused
        const chunk = new Float32Array(inputData.length)
        chunk.set(inputData)
        audioChunksRef.current.push(chunk)
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      // Store processor reference for cleanup
      workletNodeRef.current = processor as unknown as AudioWorkletNode

      setRecordingState('recording')
      console.log('Recording started at', audioContext.sampleRate, 'Hz')
    } catch (error) {
      console.error('Failed to start recording:', error)
      setRecordingState('idle')
      pendingStartRef.current = false
    }
  }, [])

  const stopRecording = useCallback(async () => {
    if (pendingStartRef.current) {
      pendingStartRef.current = false
      setRecordingState('idle')
      return
    }

    if (recordingState !== 'recording') return

    setRecordingState('transcribing')

    // Stop audio processing
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect()
      workletNodeRef.current = null
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Combine all audio chunks into single Float32Array
    const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
    const audioData = new Float32Array(totalLength)
    let offset = 0
    for (const chunk of audioChunksRef.current) {
      audioData.set(chunk, offset)
      offset += chunk.length
    }

    console.log('Audio recorded:', totalLength, 'samples,', (totalLength / SAMPLE_RATE).toFixed(1), 'seconds')

    // Store for playback
    lastRecordedAudioRef.current = audioData
    setHasRecordedAudio(true)

    // Check if we actually have audio
    if (totalLength === 0) {
      console.error('No audio data recorded')
      setTranscript('[No audio recorded]')
      setRecordingState('idle')
      return
    }

    // Check audio levels
    let maxAmp = 0
    for (let i = 0; i < audioData.length; i++) {
      maxAmp = Math.max(maxAmp, Math.abs(audioData[i]))
    }
    console.log('Max amplitude:', maxAmp)

    if (maxAmp < 0.01) {
      console.warn('Audio is very quiet, may not transcribe well')
    }

    try {
      if (pipelineRef.current) {
        console.log('Starting transcription...')
        console.log('Audio data length:', audioData.length, 'samples')
        console.log('Audio duration:', (audioData.length / SAMPLE_RATE).toFixed(2), 'seconds')
        const startTime = Date.now()

        const result = await pipelineRef.current(audioData)

        console.log('Transcription completed in', ((Date.now() - startTime) / 1000).toFixed(1), 'seconds')
        console.log('Result:', result)

        const text = Array.isArray(result) ? result[0]?.text : result.text
        setTranscript(text?.trim() || '')
      } else {
        console.error('Pipeline not ready')
        setTranscript('[Model not loaded]')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      setTranscript('[Transcription failed]')
    }

    setRecordingState('idle')
  }, [recordingState])

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return

    if (!modelReady) {
      pendingStartRef.current = true
      setRecordingState('transcribing')
      return
    }

    await startRecordingInternal()
  }, [modelReady, recordingState, startRecordingInternal])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    lastRecordedAudioRef.current = null
    setHasRecordedAudio(false)
  }, [])

  const playRecording = useCallback(() => {
    const audioData = lastRecordedAudioRef.current
    if (!audioData || audioData.length === 0) {
      console.warn('No recorded audio to play')
      return
    }

    // Convert Float32Array to WAV blob
    const wavBlob = float32ToWav(audioData, SAMPLE_RATE)
    const url = URL.createObjectURL(wavBlob)
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
