"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/translation-context"
import PageLayout from "@/components/layout/PageLayout"
import StatPill from "@/components/recipes/StatPill"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Copy, Clock, Star, Utensils } from "lucide-react"
import { toast } from "sonner"

interface Recipe {
  id: number
  title: string
  slug: string
  image: string
  category: string
  rating: number
  prepTime: number
  difficulty: string
  servings: number
  tags: string[]
  description?: string
  ingredients: string[]
  instructions: string[]
  author?: string
  publishedAt?: string
}

// Mock recipe data - replace with actual API call
const mockRecipe: Recipe = {
  id: 1,
  title: "Drinkmate Diet Fizzy Grapefruit Juice",
  slug: "drinkmate-diet-fizzy-grapefruit-juice",
  image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/grapefruit-juice.jpg",
  category: "Mocktails",
  rating: 4.8,
  prepTime: 3,
  difficulty: "Easy",
  servings: 2,
  tags: ["refreshing", "low-calorie", "citrus", "diet"],
  description: "Perfect balance of flavors with a refreshing grapefruit twist that's perfect for any occasion.",
  ingredients: [
    "1 cup fresh grapefruit juice",
    "1/2 cup water",
    "2 tbsp sweetener (optional)",
    "Ice cubes",
    "Fresh mint leaves for garnish"
  ],
  instructions: [
    "Pour grapefruit juice into Drinkmate bottle",
    "Add water and sweetener if desired",
    "Add sparkle using your Drinkmate device",
    "Pour over ice and garnish with mint",
    "Enjoy immediately for best taste"
  ],
  author: "Drinkmate Team",
  publishedAt: "2024-01-15"
}

export default function RecipeDetail() {
  const { t, isRTL, isHydrated } = useTranslation()
  const params = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Simulate API call
    const fetchRecipe = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecipe(mockRecipe)
      setLoading(false)
    }
    fetchRecipe()
  }, [params.slug])

  const toggleLike = () => {
    setLiked(!liked)
    toast.success(liked ? "Removed from favorites" : "Added to favorites")
  }

  const copyIngredients = () => {
    const ingredientsText = recipe?.ingredients.join('\n') || ''
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-[1100px] mx-auto px-4 md:px-6">
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
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
            "image": [recipe.image],
            "description": recipe.description,
            "prepTime": `PT${recipe.prepTime}M`,
            "recipeCategory": recipe.category,
            "recipeCuisine": "International",
            "recipeIngredient": recipe.ingredients,
            "recipeInstructions": recipe.instructions.map((instruction, index) => ({
              "@type": "HowToStep",
              "text": instruction,
              "position": index + 1
            })),
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": recipe.rating.toString(),
              "ratingCount": "156"
            },
            "author": {
              "@type": "Organization",
              "name": recipe.author || "Drinkmate"
            },
            "datePublished": recipe.publishedAt,
            "recipeYield": recipe.servings.toString()
          })
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <article className="max-w-[1100px] mx-auto px-4 md:px-6">
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
              <StatPill 
                icon="⭐" 
                label={isRTL ? "التقييم" : "Rating"} 
                value={recipe.rating.toFixed(1)} 
              />
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-12">
            <figure className="lg:col-span-6 order-last lg:order-first">
              <Image
                src={recipe.image}
                alt={recipe.title}
                width={600}
                height={450}
                className="rounded-2xl w-full aspect-[4/3] object-cover"
                priority
              />
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
                      />
                      <span className={`${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                        {ingredient}
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
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className={`${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                      {step}
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
