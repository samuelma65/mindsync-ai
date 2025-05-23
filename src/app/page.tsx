'use client'

import { useState } from 'react'
import DocumentUpload from '@/components/DocumentUpload'
import VocabularySelector from '@/components/VocabularySelector'
import DocumentViewer from '@/components/DocumentViewer'
import QuizSection from '@/components/QuizSection'
import VoiceChat from '@/components/VoiceChat'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'vocab' | 'view' | 'quiz' | 'chat'>('upload')
  const [document, setDocument] = useState<{ text: string; name: string } | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        MindSync AI
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {currentStep === 'upload' && (
          <DocumentUpload
            onUpload={(doc) => {
              setDocument(doc)
              setCurrentStep('vocab')
            }}
          />
        )}

        {currentStep === 'vocab' && (
          <VocabularySelector
            onComplete={() => setCurrentStep('view')}
          />
        )}

        {currentStep === 'view' && document && (
          <DocumentViewer
            document={document}
            onComplete={() => setCurrentStep('quiz')}
          />
        )}

        {currentStep === 'quiz' && document && (
          <QuizSection
            document={document}
            onComplete={() => setCurrentStep('chat')}
          />
        )}

        {currentStep === 'chat' && document && (
          <VoiceChat document={document} />
        )}
      </div>
    </div>
  )
} 