"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/contexts/translation-context"
import PageLayout from "@/components/layout/PageLayout"
import StatPill from "@/components/recipes/StatPill"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Copy, Clock, Star, Utensils } from "lucide-react"
import { toast } from "sonner"
import { recipeAPI } from "@/lib/api/recipe-api"

interface Recipe {
  _id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: string
  prepTime: number
  cookTime: number
  servings: number
  featured: boolean
  published: boolean
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
    publicId?: string
  }>
  ingredients: Array<{
    name: string
    amount?: string
    unit?: string
  }>
  instructions: Array<{
    step: number
    instruction: string
  }>
  tags: string[]
  author?: {
    _id: string
    username: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
  rating?: {
    average: number
    count: number
  }
}

// Mock recipe data - replace with actual API call
const mockRecipe: Recipe = {
  _id: "1",
  title: "Drinkmate Diet Fizzy Grapefruit Juice",
  slug: "drinkmate-diet-fizzy-grapefruit-juice",
  description: "Perfect balance of flavors with a refreshing grapefruit twist that's perfect for any occasion.",
  category: "Mocktails",
  rating: {
    average: 4.8,
    count: 24
  },
  prepTime: 3,
  cookTime: 0,
  difficulty: "Easy",
  servings: 2,
  tags: ["refreshing", "low-calorie", "citrus", "diet"],
  featured: false,
  published: true,
  images: [
    {
      url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/grapefruit-juice.jpg",
      alt: "Drinkmate Diet Fizzy Grapefruit Juice",
      isPrimary: true
    }
  ],
  ingredients: [
    { name: "1 cup fresh grapefruit juice" },
    { name: "1/2 cup water" },
    { name: "2 tbsp sweetener (optional)" },
    { name: "Ice cubes" },
    { name: "Fresh mint leaves for garnish" }
  ],
  instructions: [
    { step: 1, instruction: "Pour grapefruit juice into Drinkmate bottle" },
    { step: 2, instruction: "Add water and sweetener if desired" },
    { step: 3, instruction: "Add sparkle using your Drinkmate device" },
    { step: 4, instruction: "Pour over ice and garnish with mint" },
    { step: 5, instruction: "Enjoy immediately for best taste" }
  ],
  author: {
    _id: "mock-author-id",
    username: "drinkmate",
    firstName: "Drinkmate",
    lastName: "Team"
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export default function RecipeDetail() {
  const { t, isRTL, isHydrated } = useTranslation()
  const params = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!params.slug) return
      
      setLoading(true)
      try {
        console.log('Fetching recipe by slug:', params.slug)
        const data = await recipeAPI.getRecipeBySlug(params.slug as string)
        
        if (data.success && data.recipe) {
          console.log('Recipe fetched successfully:', data.recipe.title)
          setRecipe(data.recipe)
        } else {
          throw new Error(data.message || 'Recipe not found')
        }
      } catch (error) {
        console.error('Error fetching recipe:', error)
        toast.error('Failed to load recipe')
        // Fallback to mock data for development
        setRecipe(mockRecipe as any)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [params.slug])

  const toggleLike = () => {
    setLiked(!liked)
    toast.success(liked ? "Removed from favorites" : "Added to favorites")
  }

  const copyIngredients = () => {
    const ingredientsText = recipe?.ingredients.map(ingredient => 
      ingredient.amount && ingredient.unit 
        ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
        : ingredient.name
    ).join('\n') || ''
    navigator.clipboard.writeText(ingredientsText)
    toast.success("Ingredients copied to clipboard")
  }

  const shareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        text: recipe?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Recipe link copied to clipboard")
    }
  }

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  if (loading) {
    return (
      <PageLayout currentPage="recipes">
        <div className="min-h-screen bg-gray-50 py-8" suppressHydrationWarning>
          <div className="max-w-[1100px] mx-auto px-4 md:px-6" suppressHydrationWarning>
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-6 order-last lg:order-first">
                  <div className="rounded-2xl w-full aspect-[4/3] bg-gray-200"></div>
                </div>
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!recipe) {
    return (
      <PageLayout currentPage="recipes">
        <div className="min-h-screen bg-gray-50 py-8" suppressHydrationWarning>
          <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center" suppressHydrationWarning>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h1>
            <Link href="/recipes" className="text-sky-500 hover:text-sky-600">
              ← Back to recipes
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout currentPage="recipes">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": recipe.title,
            "image": recipe.images?.map(img => img.url) || [],
            "description": recipe.description,
            "prepTime": `PT${recipe.prepTime}M`,
            "cookTime": `PT${recipe.cookTime}M`,
            "recipeCategory": recipe.category,
            "recipeCuisine": "International",
            "recipeIngredient": recipe.ingredients.map(ingredient => 
              ingredient.amount && ingredient.unit 
                ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                : ingredient.name
            ),
            "recipeInstructions": recipe.instructions.map((instruction, index) => ({
              "@type": "HowToStep",
              "text": instruction.instruction,
              "position": instruction.step || index + 1
            })),
            "aggregateRating": recipe.rating ? {
              "@type": "AggregateRating",
              "ratingValue": recipe.rating.average.toString(),
              "ratingCount": recipe.rating.count.toString()
            } : undefined,
            "author": {
              "@type": "Person",
              "name": recipe.author ? `${recipe.author.firstName} ${recipe.author.lastName}` : "Drinkmate"
            },
            "datePublished": recipe.createdAt,
            "recipeYield": recipe.servings.toString()
          })
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8" suppressHydrationWarning>
        <article className="max-w-[1100px] mx-auto px-4 md:px-6" suppressHydrationWarning>
          <header className="mb-8">
            <h1 className={`text-[clamp(26px,4.2vw,40px)] font-extrabold tracking-tight ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {recipe.title}
            </h1>
            <p className={`mt-2 text-black/70 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {recipe.description}
            </p>
            <div className="mt-3 flex gap-2 flex-wrap text-sm">
              <StatPill 
                icon="⏱" 
                label={isRTL ? "التحضير" : "Prep"} 
                value={`${recipe.prepTime} min`} 
              />
              <StatPill 
                icon="🍹" 
                label={isRTL ? "الصعوبة" : "Difficulty"} 
                value={recipe.difficulty} 
              />
              <StatPill 
                icon="👥" 
                label={isRTL ? "الحصص" : "Servings"} 
                value={recipe.servings.toString()} 
              />
              {recipe.rating && (
                <StatPill 
                  icon="⭐" 
                  label={isRTL ? "التقييم" : "Rating"} 
                  value={recipe.rating.average.toFixed(1)} 
                />
              )}
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-12">
            <figure className="lg:col-span-6 order-last lg:order-first">
              {recipe.images && recipe.images.length > 0 ? (
                <div className="relative group">
                  <Image
                    src={recipe.images.find(img => img.isPrimary)?.url || recipe.images[0].url}
                    alt={recipe.images.find(img => img.isPrimary)?.alt || recipe.title}
                    width={600}
                    height={450}
                    className="rounded-2xl w-full aspect-[4/3] object-cover shadow-2xl"
                    priority
                  />
                  
                  {/* Image Gallery Indicator */}
                  {recipe.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {recipe.images.findIndex(img => img.isPrimary) + 1} / {recipe.images.length}
                    </div>
                  )}
                  
                  {/* Image Gallery Overlay */}
                  {recipe.images.length > 1 && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 text-gray-900 hover:bg-white"
                        onClick={() => {
                          // TODO: Open image gallery modal
                          toast.info('Image gallery coming soon!')
                        }}
                      >
                        View Gallery ({recipe.images.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-2xl">
                  <div className="text-center text-gray-400">
                    <Utensils className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm font-medium">No image available</p>
                  </div>
                </div>
              )}
            </figure>

            <div className="lg:col-span-6">
              <section className="mb-6">
                <h2 className={`font-semibold mb-4 text-lg ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {isRTL ? "المكونات" : "Ingredients"}
                </h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                        checked={checkedIngredients.has(index)}
                        onChange={() => toggleIngredient(index)}
                        aria-label={`Check off ingredient: ${ingredient.name || ingredient}`}
                        title={`Check off ingredient: ${ingredient.name || ingredient}`}
                      />
                      <span className={`${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                        {ingredient.amount && ingredient.unit 
                          ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                          : ingredient.name
                        }
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-6">
                <h2 className={`font-semibold mb-4 text-lg ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {isRTL ? "التعليمات" : "Instructions"}
                </h2>
                <ol className="space-y-3 list-decimal list-inside">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className={`${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                      {instruction.instruction}
                    </li>
                  ))}
                </ol>
              </section>

              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={copyIngredients}
                  variant="outline"
                  className="h-10 px-4 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {isRTL ? "نسخ المكونات" : "Copy ingredients"}
                </Button>
                <Button
                  onClick={shareRecipe}
                  className="h-10 px-4 rounded-xl bg-sky-500 text-white hover:bg-sky-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isRTL ? "مشاركة" : "Share"}
                </Button>
                <Button
                  onClick={toggleLike}
                  variant="outline"
                  className={`h-10 w-10 rounded-full border ${
                    liked ? "bg-rose-50 border-rose-200 text-rose-600" : ""
                  }`}
                  aria-pressed={liked}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </PageLayout>
  )
}
