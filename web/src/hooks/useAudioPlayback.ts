import { useState, useCallback, useRef, useEffect } from 'react'
import { loadAudioBlob, checkAudioExists } from '../../../shared/src/utils/audioStorage'

export function useAudioPlayback(entryKey: string | null) {
  const [hasAudio, setHasAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setIsPlaying(false)
  }, [])

  // Check if audio exists when entryKey changes
  useEffect(() => {
    cleanup()

    if (!entryKey) {
      setHasAudio(false)
      return
    }

    checkAudioExists(entryKey).then(setHasAudio)
  }, [entryKey, cleanup])

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup])

  const play = useCallback(async () => {
    if (!entryKey) return

    cleanup()

    const blob = await loadAudioBlob(entryKey)
    if (!blob) return

    const url = URL.createObjectURL(blob)
    urlRef.current = url

    const audio = new Audio(url)
    audioRef.current = audio

    audio.onended = () => {
      setIsPlaying(false)
    }

    audio.play().catch(err => {
      console.error('Failed to play audio:', err)
      setIsPlaying(false)
    })
    setIsPlaying(true)
  }, [entryKey, cleanup])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  return { hasAudio, isPlaying, play, stop }
}
