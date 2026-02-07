'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Mic,
  MicOff,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  disclaimer?: string
  timestamp: Date
}

interface CFOVirtualProps {
  companyId: number
  companyName?: string
  onSendMessage: (message: string) => Promise<{
    response: string
    sources: string[]
    disclaimer: string
  }>
}

const quickPrompts = [
  { icon: TrendingUp, text: '¿Cómo está mi flujo de efectivo?' },
  { icon: AlertTriangle, text: '¿Tengo riesgo de liquidez?' },
  { icon: Sparkles, text: '¿Cuál es mi concentración de clientes?' },
]

export function CFOVirtual({ companyId, companyName, onSendMessage }: CFOVirtualProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `¡Hola! Soy tu CFO Virtual 🤖. Puedo analizar tus datos financieros de ${companyName || 'tu empresa'} y responder preguntas sobre flujo de efectivo, liquidez, concentración de clientes y más. ¿En qué puedo ayudarte?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await onSendMessage(text.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        disclaimer: response.disclaimer,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      handleSend(transcript)
    }

    recognition.start()
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-white tracking-tight">
              CFO Virtual
            </h1>
            <p className="text-white/40 text-[13px]">
              Inteligencia financiera conversacional · {companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-[#0d1321] border border-white/[0.06]'
                }`}
              >
                <p className="text-white text-sm whitespace-pre-wrap">
                  {message.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i}>{part.slice(2, -2)}</strong>
                    }
                    if (part.startsWith('_') && part.endsWith('_')) {
                      return <em key={i} className="text-white/50">{part.slice(1, -1)}</em>
                    }
                    return part
                  })}
                </p>

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-white/30 text-xs">
                      Fuentes: {message.sources.join(', ')}
                    </p>
                  </div>
                )}

                {message.disclaimer && (
                  <p className="text-amber-400/60 text-xs mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {message.disclaimer}
                  </p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white/60" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-[#0d1321] border border-white/[0.06] rounded-xl p-4">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length < 3 && (
        <div className="py-3 flex gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSend(prompt.text)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm whitespace-nowrap hover:bg-white/[0.1] transition-colors"
            >
              <prompt.icon size={14} />
              {prompt.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex gap-3">
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl border transition-colors ${
              isListening
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-white/[0.06] border-white/[0.08] text-white/60 hover:bg-white/[0.1]'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre tus finanzas..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f1a] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
