"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useTranslation } from "@/lib/translation-context"
import PageLayout from "@/components/layout/PageLayout"
import RecipeCard from "@/components/recipes/RecipeCard"
import RecipeCardSkeleton from "@/components/recipes/RecipeCardSkeleton"
import FilterBar from "@/components/recipes/FilterBar"
import { useRecipeRotation, formatTimeRemaining } from "@/hooks/use-recipe-rotation"

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
  isFeatured?: boolean
}

// Mock recipes data - replace with actual API call
const mockRecipes: Recipe[] = [
    {
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
    description: "Perfect balance of flavors with a refreshing grapefruit twist.",
    ingredients: ["Grapefruit juice", "Water", "Sweetener (optional)"],
    instructions: ["Pour grapefruit juice into Drinkmate bottle", "Add sparkle!", "Pour over ice and enjoy!"],
    isFeatured: true
  },
  {
    id: 2,
    title: "Italian Strawberry Lemonade",
    slug: "italian-strawberry-lemonade",
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/strawberry-lemonade.jpg",
    category: "Fruity",
      rating: 4.6,
    prepTime: 5,
      difficulty: "Easy",
    servings: 4,
    tags: ["fruity", "summer", "refreshing", "italian"],
    description: "Classic Italian strawberry lemonade with a sparkling twist.",
    ingredients: ["Strawberry syrup", "Lemon juice", "Water", "Ice"],
    instructions: ["Mix strawberry syrup with lemon juice", "Add water and ice", "Carbonate with Drinkmate"],
    isFeatured: false
  },
  {
    id: 3,
    title: "Blue Raspberry Blast",
    slug: "blue-raspberry-blast",
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/blue-raspberry.jpg",
    category: "Berry",
      rating: 4.7,
    prepTime: 4,
      difficulty: "Easy",
    servings: 2,
    tags: ["berry", "blue", "sweet", "colorful"],
    description: "A burst of blue raspberry flavor that's both sweet and refreshing.",
    ingredients: ["Blue raspberry syrup", "Water", "Ice"],
    instructions: ["Add blue raspberry syrup to water", "Carbonate with Drinkmate", "Serve over ice"],
    isFeatured: false
  },
  {
    id: 4,
    title: "Lime Mojito Sparkle",
    slug: "lime-mojito-sparkle",
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/lime-mojito.jpg",
    category: "Citrus",
    rating: 4.9,
    prepTime: 6,
      difficulty: "Intermediate",
    servings: 2,
    tags: ["citrus", "mint", "refreshing", "mocktail"],
    description: "A sparkling twist on the classic mojito with fresh lime and mint.",
    ingredients: ["Lime juice", "Mint leaves", "Simple syrup", "Water"],
    instructions: ["Muddle mint leaves", "Add lime juice and syrup", "Carbonate and serve"],
    isFeatured: false
  },
  {
    id: 5,
    title: "Orange Creamsicle Delight",
    slug: "orange-creamsicle-delight",
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/orange-creamsicle.jpg",
    category: "Fruity",
      rating: 4.5,
    prepTime: 5,
      difficulty: "Easy",
    servings: 3,
    tags: ["fruity", "orange", "creamy", "dessert"],
    description: "Creamy orange delight that tastes just like the classic ice cream treat.",
    ingredients: ["Orange syrup", "Cream", "Water", "Vanilla extract"],
    instructions: ["Mix orange syrup with cream", "Add vanilla and water", "Carbonate and chill"],
    isFeatured: false
  },
  {
    id: 6,
    title: "Grape Soda Supreme",
    slug: "grape-soda-supreme",
    image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/grape-soda.jpg",
    category: "Cola",
    rating: 4.4,
    prepTime: 3,
      difficulty: "Easy",
    servings: 2,
    tags: ["grape", "soda", "classic", "purple"],
    description: "The ultimate grape soda experience with premium flavor.",
    ingredients: ["Grape syrup", "Water", "Ice"],
    instructions: ["Add grape syrup to water", "Carbonate with Drinkmate", "Serve chilled"],
    isFeatured: false
  }
]

export default function Recipes() {
  const { t, isRTL, isHydrated } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popular")
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { currentRecipe, timeUntilNext } = useRecipeRotation(recipes)

  // Fetch recipes from API
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          // Load 3 rows at a time (3 columns x 3 rows = 9)
          limit: '9'
        })
        
        if (searchQuery) {
          // Use starts-with server search by sending a caret-anchored regex
          const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          params.append('search', `^${escaped}`)
        }
        if (selectedCategory !== 'all') params.append('category', selectedCategory)

        const response = await fetch(`/api/recipes?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes')
        }

        const data = await response.json()
        if (data.success && data.recipes) {
          // Transform API data to match frontend interface
          const transformedRecipes = data.recipes.map((recipe: any) => ({
            id: recipe._id,
            title: recipe.title,
            slug: recipe.slug,
            image: recipe.images && recipe.images.length > 0 ? recipe.images[0].url : 'https://via.placeholder.com/400x300?text=No+Image',
            category: recipe.category,
            rating: recipe.rating?.average || 0,
            prepTime: recipe.prepTime,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            tags: recipe.tags || [],
            description: recipe.description,
            ingredients: recipe.ingredients?.map((ing: any) => `${ing.amount} ${ing.unit} ${ing.name}`) || [],
            instructions: recipe.instructions?.map((inst: any) => inst.instruction) || [],
            isFeatured: recipe.featured || false
          }))
          // Append on load more, replace on first page or new filters
          setRecipes(prev => currentPage === 1 ? transformedRecipes : [...prev, ...transformedRecipes])
          setHasMore(data.pagination?.hasNext || false)
        } else {
          // Fallback to mock data if API fails
          setRecipes(prev => currentPage === 1 ? mockRecipes : [...prev, ...mockRecipes])
          setHasMore(false)
        }
      } catch (error) {
        console.error('Error fetching recipes:', error)
        // Fallback to mock data if API fails
        setRecipes(prev => currentPage === 1 ? mockRecipes : [...prev, ...mockRecipes])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [currentPage, searchQuery, selectedCategory])

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === "all" || recipe.category.toLowerCase() === selectedCategory.toLowerCase()
      
      return matchesSearch && matchesCategory
    })

    // Sort recipes
    switch (sortBy) {
      case "new":
        filtered.sort((a, b) => b.id - a.id)
        break
      case "time":
        filtered.sort((a, b) => a.prepTime - b.prepTime)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
      default:
        // Keep original order for popular
        break
    }

    return filtered
  }, [recipes, searchQuery, selectedCategory, sortBy])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // Reset list for a fresh server-side search
    setRecipes([])
    setHasMore(true)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setRecipes([])
    setHasMore(true)
    setCurrentPage(1)
  }

  const loadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  return (
    <PageLayout currentPage="recipes">
      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/water-366586_bd4us9.jpg"
              alt="Recipes background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay with opacity */}
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'} tracking-tight`}>
                {isRTL ? "الوصفات" : "Recipes"}
              </h1>
              <p className={`text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {isRTL ? "اكتشف وصفات المشروبات اللذيذة مع شراباتنا الممتازة." : "Discover delicious drink recipes with our premium Italian syrups."}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Recipe Section */}
        {currentRecipe && (
          <section className="py-16 bg-gradient-to-r from-sky-50 to-emerald-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={currentRecipe.image || '/images/placeholder-recipe.jpg'}
                      alt={currentRecipe.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-sm font-medium">
                      {isRTL ? "وصفة الأسبوع" : "Recipe of the Week"}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-sm font-medium">
                      {formatTimeRemaining(timeUntilNext)}
                    </div>
                  </div>
                  <div className="p-8">
                    <h2 className={`text-2xl font-bold mb-4 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                      {currentRecipe.title}
                    </h2>
                    <p className={`text-gray-600 mb-6 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                      {isRTL ? "وصفة هذا الأسبوع تظهر التوازن المثالي للنكهات وهي مثالية لأي مناسبة." : "This week's featured recipe showcases the perfect balance of flavors and is perfect for any occasion."}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>⏱ {currentRecipe.time}</span>
                      <span>🍹 {currentRecipe.difficulty}</span>
                      <span>⭐ {currentRecipe.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
            
            {/* Filter Bar */}
        <section className="py-8 bg-white">
          <div className="max-w-[1100px] mx-auto px-4 md:px-6">
            <FilterBar
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
              onCategoryChange={handleCategoryChange}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
                  />
                </div>
        </section>

        {/* Recipes Grid */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-[1100px] mx-auto px-4 md:px-6">
            {loading ? (
              <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li key={index}>
                    <RecipeCardSkeleton />
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedRecipes.map(recipe => (
                    <li key={recipe.id}>
                      <RecipeCard recipe={recipe} />
                    </li>
                              ))}
                            </ul>

                {filteredAndSortedRecipes.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {isRTL ? "لم يتم العثور على وصفات" : "No recipes found"}
                </h3>
                    <p className={`text-gray-600 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {isRTL ? "جرب البحث بكلمات مختلفة أو تصفح الفئات الأخرى." : "Try searching with different keywords or browse other categories."}
                </p>
              </div>
                )}

                {hasMore && filteredAndSortedRecipes.length > 0 && (
            <div className="text-center mt-8">
                  <button
                      onClick={loadMore}
                      className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                  >
                      {isRTL ? "تحميل المزيد" : "Load More"}
                  </button>
                </div>
                )}
              </>
                        )}
                      </div>
        </section>
      </div>
    </PageLayout>
  )
}
