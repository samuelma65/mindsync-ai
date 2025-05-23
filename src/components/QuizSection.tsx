'use client'

import { useState, useEffect } from 'react'

interface QuizSectionProps {
  document: {
    text: string
    name: string
  }
  onComplete: () => void
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export default function QuizSection({ document, onComplete }: QuizSectionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const generateQuiz = async () => {
      try {
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: document.text }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate quiz')
        }

        const data = await response.json()
        setQuestions(data.questions)
      } catch (error) {
        console.error('Error generating quiz:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateQuiz()
  }, [document.text])

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer)
    setShowExplanation(true)

    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // Update vocabulary stats
    try {
      await fetch('/api/vocabulary/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: questions[currentQuestionIndex].question,
          isCorrect,
        }),
      })
    } catch (error) {
      console.error('Error updating vocabulary stats:', error)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      onComplete()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Quiz</h2>
          <span className="text-lg">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl mb-4">{currentQuestion.question}</h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !selectedAnswer && handleAnswerSelect(option)}
                  disabled={!!selectedAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors
                    ${selectedAnswer === option
                      ? option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-primary/50'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {showExplanation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {selectedAnswer === currentQuestion.correctAnswer
                  ? '✅ Correct!'
                  : '❌ Incorrect.'}
              </p>
              <p className="mt-2">{currentQuestion.explanation}</p>
            </div>
          )}

          {showExplanation && (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90"
            >
              {currentQuestionIndex < questions.length - 1
                ? 'Next Question'
                : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-gray-600">
        Score: {score} / {currentQuestionIndex + 1}
      </div>
    </div>
  )
} 