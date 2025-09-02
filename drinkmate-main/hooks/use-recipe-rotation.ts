import { useState, useEffect } from 'react'

interface Recipe {
  id: number
  category: string
  url: string
  title: string
  ingredients: string[]
  instructions: string[]
  isFeatured: boolean
  difficulty: string
  time: string
  rating: number
  reviews: number
  image: string
  tags: string[]
}

interface UseRecipeRotationReturn {
  currentRecipe: Recipe | null
  timeUntilNext: number
  isRotating: boolean
}

export function useRecipeRotation(recipes: Recipe[], rotationIntervalMinutes: number = 10): UseRecipeRotationReturn {
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0)
  const [timeUntilNext, setTimeUntilNext] = useState(rotationIntervalMinutes * 60 * 1000) // Convert to milliseconds
  const [isRotating, setIsRotating] = useState(false)

  // Filter recipes that are suitable for rotation (exclude the original featured one)
  const rotationRecipes = recipes.filter(recipe => !recipe.isFeatured)

  useEffect(() => {
    if (rotationRecipes.length === 0) return

    // Set initial recipe based on current time to ensure consistency across page refreshes
    const now = new Date()
    const minutesSinceEpoch = Math.floor(now.getTime() / (rotationIntervalMinutes * 60 * 1000))
    const initialIndex = minutesSinceEpoch % rotationRecipes.length
    setCurrentRecipeIndex(initialIndex)

    // Calculate time until next rotation
    const nextRotationTime = (minutesSinceEpoch + 1) * rotationIntervalMinutes * 60 * 1000
    const timeUntilNextRotation = nextRotationTime - now.getTime()
    setTimeUntilNext(timeUntilNextRotation)

    const interval = setInterval(() => {
      setIsRotating(true)
      
      // Update to next recipe
      setCurrentRecipeIndex(prev => (prev + 1) % rotationRecipes.length)
      
      // Reset timer
      setTimeUntilNext(rotationIntervalMinutes * 60 * 1000)
      
      // Reset rotation animation after a short delay
      setTimeout(() => setIsRotating(false), 500)
    }, rotationIntervalMinutes * 60 * 1000)

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setTimeUntilNext(prev => {
        if (prev <= 1000) {
          return rotationIntervalMinutes * 60 * 1000
        }
        return prev - 1000
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
    }
  }, [rotationRecipes.length, rotationIntervalMinutes])

  const currentRecipe = rotationRecipes[currentRecipeIndex] || null

  return {
    currentRecipe,
    timeUntilNext,
    isRotating
  }
}

// Helper function to format time remaining
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}
