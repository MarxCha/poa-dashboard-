'use client'

import { useState, useEffect, useCallback } from 'react'

type VoiceCommand =
  | 'mostrar-ingresos'
  | 'mostrar-egresos'
  | 'abrir-semaforo'
  | 'abrir-cfo'
  | 'cambiar-escenario-a'
  | 'cambiar-escenario-b'
  | 'cambiar-escenario-c'
  | 'sincronizar-sat'
  | 'unknown'

interface UseVoiceCommandsOptions {
  onCommand: (command: VoiceCommand, transcript: string) => void
  enabled?: boolean
}

interface UseVoiceCommandsReturn {
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  transcript: string
  lastCommand: VoiceCommand | null
}

const commandPatterns: [RegExp, VoiceCommand][] = [
  [/mostrar?\s*(los?\s*)?ingresos/i, 'mostrar-ingresos'],
  [/mostrar?\s*(los?\s*)?egresos/i, 'mostrar-egresos'],
  [/(abrir?|ver|mostrar?)\s*(el?\s*)?semáforo/i, 'abrir-semaforo'],
  [/(abrir?|ver|hablar?\s*con)\s*(el?\s*)?cfo/i, 'abrir-cfo'],
  [/(cambiar?|escenario|demo)\s*(a?\s*)?sme/i, 'cambiar-escenario-a'],
  [/(cambiar?|escenario|demo)\s*(a?\s*)?scale/i, 'cambiar-escenario-b'],
  [/(cambiar?|escenario|demo)\s*(a?\s*)?despacho/i, 'cambiar-escenario-c'],
  [/sincronizar?\s*(con?\s*)?(el?\s*)?sat/i, 'sincronizar-sat'],
]

export function useVoiceCommands({
  onCommand,
  enabled = true,
}: UseVoiceCommandsOptions): UseVoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    )
  }, [])

  const parseCommand = useCallback((text: string): VoiceCommand => {
    const normalizedText = text.toLowerCase().trim()

    for (const [pattern, command] of commandPatterns) {
      if (pattern.test(normalizedText)) {
        return command
      }
    }

    return 'unknown'
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported || !enabled || isListening) return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript
      setTranscript(result)

      const command = parseCommand(result)
      setLastCommand(command)
      onCommand(command, result)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isSupported, enabled, isListening, parseCommand, onCommand])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
    lastCommand,
  }
}
