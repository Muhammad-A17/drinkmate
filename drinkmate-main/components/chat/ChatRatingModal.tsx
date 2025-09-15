"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Star, 
  Heart, 
  ThumbsUp, 
  Smile, 
  Frown,
  CheckCircle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatRatingModalProps {
  isOpen: boolean
  onClose: () => void
  onRate: (rating: ChatRating) => void
  chatId: string
  customerName: string
}

interface ChatRating {
  score: number
  feedback: string
  category: string
}

const ratingCategories = [
  { value: 'excellent', label: 'Excellent', icon: Star, color: 'text-yellow-500', description: 'Outstanding service' },
  { value: 'good', label: 'Good', icon: ThumbsUp, color: 'text-green-500', description: 'Satisfied with help' },
  { value: 'average', label: 'Average', icon: Smile, color: 'text-blue-500', description: 'Service was okay' },
  { value: 'poor', label: 'Poor', icon: Frown, color: 'text-orange-500', description: 'Could be better' },
  { value: 'terrible', label: 'Terrible', icon: X, color: 'text-red-500', description: 'Very disappointed' }
]

const feedbackPrompts = {
  excellent: [
    "What made this experience great?",
    "What did our agent do well?",
    "How can we keep providing this level of service?"
  ],
  good: [
    "What did you like about the service?",
    "How can we make it even better?",
    "Any suggestions for improvement?"
  ],
  average: [
    "What could we improve?",
    "What was missing from your experience?",
    "How can we better assist you next time?"
  ],
  poor: [
    "What went wrong?",
    "How can we improve this experience?",
    "What would you have preferred?"
  ],
  terrible: [
    "We're sorry for the poor experience. What happened?",
    "How can we make this right?",
    "What would have made this better?"
  ]
}

export default function ChatRatingModal({
  isOpen,
  onClose,
  onRate,
  chatId,
  customerName
}: ChatRatingModalProps) {
  const [selectedScore, setSelectedScore] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score)
    
    // Auto-select category based on score
    if (score >= 5) setSelectedCategory('excellent')
    else if (score >= 4) setSelectedCategory('good')
    else if (score >= 3) setSelectedCategory('average')
    else if (score >= 2) setSelectedCategory('poor')
    else setSelectedCategory('terrible')
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSubmit = async () => {
    if (selectedScore === 0) return

    setIsSubmitting(true)
    try {
      await onRate({
        score: selectedScore,
        feedback: feedback.trim(),
        category: selectedCategory
      })
      
      // Reset form
      setSelectedScore(0)
      setSelectedCategory('')
      setFeedback('')
      onClose()
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFeedbackPrompt = () => {
    if (!selectedCategory) return "Please share your feedback..."
    const prompts = feedbackPrompts[selectedCategory as keyof typeof feedbackPrompts]
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  const isFormValid = selectedScore > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span>Rate Your Experience</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              How was your chat experience with us?
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div>
            <Label className="text-sm font-medium mb-3 block text-center">
              Overall Rating
            </Label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreSelect(score)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 hover:scale-110",
                    selectedScore >= score
                      ? "text-yellow-500 bg-yellow-50"
                      : "text-gray-300 hover:text-yellow-400"
                  )}
                >
                  <Star className={cn(
                    "w-8 h-8",
                    selectedScore >= score ? "fill-current" : ""
                  )} />
                </button>
              ))}
            </div>
            {selectedScore > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {selectedScore === 5 && "Excellent!"}
                {selectedScore === 4 && "Good!"}
                {selectedScore === 3 && "Average"}
                {selectedScore === 2 && "Poor"}
                {selectedScore === 1 && "Terrible"}
              </p>
            )}
          </div>

          {/* Category Selection */}
          {selectedScore > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                How would you describe your experience?
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {ratingCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all duration-200",
                        selectedCategory === category.value
                          ? "border-blue-200 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-5 h-5", category.color)} />
                        <div>
                          <div className="font-medium text-gray-900">{category.label}</div>
                          <div className="text-sm text-gray-600">{category.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Feedback */}
          {selectedCategory && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {getFeedbackPrompt()}
              </Label>
              <Textarea
                placeholder="Share your thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your feedback helps us improve our service
              </p>
            </div>
          )}

          {/* Thank You Message */}
          {selectedScore > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Thank you for your feedback!
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                We'll use your input to improve our customer service.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              'Submit Rating'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

