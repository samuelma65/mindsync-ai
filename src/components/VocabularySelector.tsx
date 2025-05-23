'use client'

import { useState } from 'react'

interface VocabularySelectorProps {
  onComplete: () => void
}

type DifficultyLevel = 'easy' | 'medium' | 'hard'

export default function VocabularySelector({ onComplete }: VocabularySelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedLevel) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/vocabulary/set-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level: selectedLevel }),
      })

      if (!response.ok) {
        throw new Error('Failed to set vocabulary level')
      }

      onComplete()
    } catch (error) {
      console.error('Error setting vocabulary level:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Select Your Vocabulary Level
      </h2>

      <div className="space-y-4">
        {(['easy', 'medium', 'hard'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`w-full p-4 rounded-lg border-2 transition-colors
              ${selectedLevel === level
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
              }`}
          >
            <h3 className="text-lg font-medium capitalize mb-1">{level}</h3>
            <p className="text-sm text-gray-600">
              {level === 'easy' && 'Basic vocabulary suitable for beginners'}
              {level === 'medium' && 'Intermediate vocabulary for regular readers'}
              {level === 'hard' && 'Advanced vocabulary for experienced readers'}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedLevel || isLoading}
        className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium
          ${selectedLevel && !isLoading
            ? 'bg-primary hover:bg-primary/90'
            : 'bg-gray-300 cursor-not-allowed'
          }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
} 