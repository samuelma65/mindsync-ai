'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceChatProps {
  document: {
    text: string
    name: string
  }
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function VoiceChat({ document }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await handleAudioSubmission(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleAudioSubmission = async (audioBlob: Blob) => {
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('audio', audioBlob)
    formData.append('documentText', document.text)

    try {
      const response = await fetch('/api/chat/voice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process voice message')
      }

      const data = await response.json()
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.transcription,
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('Error processing voice message:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = async (text: string) => {
    if (!text.trim()) return

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date(),
      },
    ])

    try {
      const response = await fetch('/api/chat/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          documentText: document.text,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('Error sending text message:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Ask Questions About the Document</h2>

        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.isUser
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-3 rounded-lg ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/90'
            } text-white`}
          >
            {isRecording ? 'Stop' : 'Record'}
          </button>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center text-gray-600">
            Processing your message...
          </div>
        )}
      </div>
    </div>
  )
} 