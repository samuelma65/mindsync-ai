'use client'

import { useState, useEffect } from 'react'

interface DocumentViewerProps {
  document: {
    text: string
    name: string
  }
  onComplete: () => void
}

interface UnfamiliarWord {
  word: string
  definition: string
  example?: string
}

export default function DocumentViewer({ document, onComplete }: DocumentViewerProps) {
  const [unfamiliarWords, setUnfamiliarWords] = useState<UnfamiliarWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedText, setHighlightedText] = useState('')

  useEffect(() => {
    const analyzeDocument = async () => {
      try {
        const response = await fetch('/api/document/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: document.text }),
        })

        if (!response.ok) {
          throw new Error('Failed to analyze document')
        }

        const data = await response.json()
        setUnfamiliarWords(data.unfamiliarWords)
        
        // Create highlighted text with unfamiliar words
        let text = document.text
        data.unfamiliarWords.forEach((word: UnfamiliarWord) => {
          const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
          text = text.replace(regex, `<span class="bg-yellow-200 cursor-help" title="${word.definition}">${word.word}</span>`)
        })
        setHighlightedText(text)
      } catch (error) {
        console.error('Error analyzing document:', error)
      } finally {
        setIsLoading(false)
      }
    }

    analyzeDocument()
  }, [document.text])

  const handleMarkAsKnown = async (word: string) => {
    try {
      const response = await fetch('/api/vocabulary/mark-known', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark word as known')
      }

      setUnfamiliarWords(prev => prev.filter(w => w.word !== word))
    } catch (error) {
      console.error('Error marking word as known:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">{document.name}</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />
      </div>

      {unfamiliarWords.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Unfamiliar Words</h3>
          <div className="space-y-4">
            {unfamiliarWords.map((word) => (
              <div key={word.word} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">{word.word}</h4>
                    <p className="text-gray-600">{word.definition}</p>
                    {word.example && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        Example: {word.example}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleMarkAsKnown(word.word)}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Mark as Known
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
        >
          Continue to Quiz
        </button>
      </div>
    </div>
  )
} 