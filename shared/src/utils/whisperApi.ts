export interface WhisperTranscriptionResult {
  text: string
}

export interface WhisperApiOptions {
  apiKey: string
  language?: string
  model?: string
}

// React Native file descriptor for FormData
export interface FileDescriptor {
  uri: string
  type: string
  name: string
}

export type AudioInput = Blob | FileDescriptor

/**
 * Transcribes audio using OpenAI's Whisper API
 * @param audio - Audio file as a Blob (web) or FileDescriptor (native)
 * @param options - API configuration options
 * @returns Transcription result with text
 */
export async function transcribeWithWhisperApi(
  audio: AudioInput,
  options: WhisperApiOptions
): Promise<WhisperTranscriptionResult> {
  const { apiKey, language = 'en', model = 'whisper-1' } = options

  const formData = new FormData()
  // React Native accepts {uri, type, name} objects, web uses Blob with filename
  if (audio instanceof Blob) {
    // Web: append with filename (3-arg form)
    (formData.append as (name: string, value: Blob, filename: string) => void)('file', audio, 'recording.webm')
  } else {
    // Native: append file descriptor (2-arg form)
    formData.append('file', audio as unknown as Blob)
  }
  formData.append('model', model)
  formData.append('language', language)

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Whisper API error (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  return { text: result.text }
}
