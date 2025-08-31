"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock, Star, Heart, Utensils, Search, X } from "lucide-react"
import { useState } from "react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"

export default function Recipes() {
  const { t, isRTL, language } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRecipes, setExpandedRecipes] = useState<Set<number>>(new Set())
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    category: "cocktails",
    ingredients: [""],
    instructions: [""],
    difficulty: "Easy",
    time: "5 min",
    tags: [""]
  })

  const toggleRecipeDetails = (recipeId: number) => {
    setExpandedRecipes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId)
      } else {
        newSet.add(recipeId)
      }
      return newSet
    })
  }

  const recipesData = [
    {
      id: 1,
      category: "cocktails",
      url: "#",
      title: "Firecracker Margarita Recipe",
      ingredients: ["2 oz Tequila", "1 oz Lime Juice", "1 oz Blue Curaçao", "Lemonade", "Optional: red sugar for rim"],
      instructions: [
        "Prepare margarita glass by wetting the rim in water or agave syrup, then dipping in red sanding sugar.",
        "Fill a cocktail shaker at least halfway with ice. Add tequila, blue curaçao, lemonade and lime juice. Cover and shake vigorously for 30 seconds.",
        "Strain into the Drinkmate carbonation bottle and add sparkle!",
        "Pour the carbonated mixture into your favorite cocktail glass over 1/2 cup of ice cubes or crushed ice.",
        "Enjoy!",
      ],
      isFeatured: true,
      difficulty: "Intermediate",
      time: "10 min",
      rating: 4.9,
      reviews: 156,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["refreshing", "summer", "popular", "tequila", "margarita"],
    },
    {
      id: 2,
      category: "cocktails",
      url: "#",
      title: "Next Level Carbonated Margarita",
      ingredients: [
        "2 oz Tres Generaciones Tequila",
        "1/2 oz Grand Marnier Cuvee Louis Alexander",
        "1 oz fresh lime juice",
        "3/4 oz Jalapeño liquor",
        "3/4 oz simple syrup",
        "3/4 oz Mango nectar",
        "3/4 oz Peach nectar",
        "Lime wedge for garnish",
      ],
      instructions: [
        "Combine the tequila, Grand Marnier, lime juice, jalapeño liquor and simple syrup in a drink shaker with 1/2 cup of ice.",
        "Shake vigorously.",
        "Strain into the Drinkmate carbonation bottle and add sparkle ... careful, this mixture may bubble over!",
        "Pour the carbonated mixture into your favorite cocktail glass over 1/2 cup of ice cubes or crushed ice.",
        "Add the mango and peach nectar gently to the top of your cocktail to create a brightly colored layer effect.",
        "Garnish with lime wedge.",
        "Enjoy!",
      ],
      isFeatured: false,
      difficulty: "Advanced",
      time: "15 min",
      rating: 4.8,
      reviews: 89,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["spicy", "tropical", "margarita", "jalapeño"],
    },
    {
      id: 3,
      category: "cocktails",
      url: "#",
      title: "Signature Mother's Day Mimosa Recipe",
      ingredients: [
        "Orange Juice",
        "Limeade or Lemonade",
        "White Wine (optional)",
        "Cocktail rimming sugar",
        "Tangerine for garnish",
      ],
      instructions: [
        "Pour all ingredients into your Drinkmate OmniFizz to carbonate.",
        "Rim glass with sugar (get the rim wet first so it sticks!)",
        "Pour into glass without touching the rim.",
        "Garnish with a tangerine slice.",
        "Enjoy!",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.7,
      reviews: 67,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["brunch", "mimosa", "citrus", "celebration"],
    },
    {
      id: 4,
      category: "cocktails",
      url: "#",
      title: "Winter Margarita",
      ingredients: [
        "Pomegranate seeds (muddled and for garnish)",
        "25ml Fresh pink grapefruit juice",
        "20ml Fresh lime juice",
        "50ml Tequila",
        "4 oz Ginger Concentrate or Syrup",
      ],
      instructions: [
        "Combine all ingredients in a cocktail shaker with ice",
        "Shake vigorously until well-chilled",
        "Strain into the Drinkmate carbonation bottle and add sparkle!",
        "Pour into a glass over ice and garnish with pomegranate seeds",
      ],
      isFeatured: false,
      difficulty: "Intermediate",
      time: "12 min",
      rating: 4.5,
      reviews: 45,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["winter", "pomegranate", "ginger", "seasonal"],
    },
    {
      id: 5,
      category: "cocktails",
      url: "#",
      title: "The Pear-fect Warmer",
      ingredients: ["50ml Pear-infused Gin", "20ml Homemade cinnamon syrup", "20ml Fresh lemon juice", "Hot water"],
      instructions: [
        "Combine gin, cinnamon syrup, and lemon juice in a glass",
        "Add hot water and stir gently",
        "Pour into Drinkmate and carbonate for a unique fizzy hot cocktail",
        "Serve warm with a cinnamon stick garnish",
      ],
      isFeatured: false,
      difficulty: "Advanced",
      time: "20 min",
      rating: 4.6,
      reviews: 34,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["warm", "pear", "cinnamon", "gin"],
    },
    {
      id: 6,
      category: "cocktails",
      url: "#",
      title: "Classic Peach Tea Cocktail Recipe",
      ingredients: [
        "40ml Johnnie Walker Black Label",
        "80ml Breakfast Tea",
        "40ml Peach Nectar",
        "15ml Lemon Juice",
        "25ml Sugar Syrup",
      ],
      instructions: [
        "Carbonate any drink—not just water",
        "Preserve bold flavors like whisky, tea, and nectar",
        "Reduce waste from cans and mixers",
        "Customize your bubbles to match your vibe",
      ],
      isFeatured: false,
      difficulty: "Intermediate",
      time: "8 min",
      rating: 4.4,
      reviews: 56,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["tea", "peach", "whisky", "classic"],
    },
    {
      id: 7,
      category: "mocktails",
      url: "#",
      title: "Red, White, & Blue Mocktail Recipe",
      ingredients: ["2 oz Cran-Apple Juice", "2 oz Blue Gatorade or Powerade", "1 oz Pina Colada Juice"],
      instructions: [
        "Fill your Drinkmate with the Cran-Apple, Blue Gatorade, and Pina Colada juice.",
        "Add sparkle!",
        "Pour into a glass over ice and enjoy!",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "3 min",
      rating: 4.8,
      reviews: 78,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["patriotic", "colorful", "tropical", "easy"],
    },
    {
      id: 8,
      category: "mocktails",
      url: "#",
      title: "Signature Mother's Day Mimosa Recipe (Mocktail)",
      ingredients: ["Orange Juice", "Limeade or Lemonade", "Cocktail rimming sugar", "Tangerine for garnish"],
      instructions: [
        "Pour all ingredients into your Drinkmate OmniFizz to carbonate.",
        "Rim glass with sugar (get the rim wet first so it sticks!)",
        "Pour into glass without touching the rim.",
        "Garnish with a tangerine slice.",
        "Enjoy!",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.7,
      reviews: 67,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["brunch", "mimosa", "citrus", "celebration"],
    },
    {
      id: 9,
      category: "mocktails",
      url: "#",
      title: "Homemade Orange Soda Recipe",
      ingredients: ["Freshly Squeezed Orange Juice", "Raw Honey", "Water"],
      instructions: [
        "All-natural ingredients – No artificial flavors or added sugar",
        "Soothing and refreshing – A little honey, a lot of citrusy goodness",
        "Perfect for mornings or wind-down evenings",
        "Kid-friendly, brunch-ready, and endlessly customizable",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.9,
      reviews: 123,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["natural", "orange", "honey", "kid-friendly"],
    },
    {
      id: 10,
      category: "mocktails",
      url: "#",
      title: "Homemade Lemon Lime Soda",
      ingredients: ["Freshly Squeezed Lemon", "Freshly Squeezed Lime", "Raw Honey", "Water"],
      instructions: [
        "Mix lemon and lime juice with honey and water",
        "Pour into Drinkmate and carbonate",
        "Serve over ice for a refreshing citrus soda",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.6,
      reviews: 89,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["citrus", "lemon", "lime", "refreshing"],
    },
    {
      id: 11,
      category: "mocktails",
      url: "#",
      title: "Homemade Lime Green Soda",
      ingredients: [
        "1 Cup Sugar",
        "1 Liter Water",
        "1/4 Cup Lime Juice, plus rind from 1 Lime",
        "6-8 Drops Green Food Coloring",
        "Lime Slices for Garnish",
      ],
      instructions: [
        "1. In a small pot on medium heat dissolve sugar in water. Raise the heat, add the lime rind and bring to a boil. Lower the heat to a simmer and cook until slightly reduced. Remove from heat and discard the lime rinds. Stir in the food coloring and cool, add ice.",
        "2. Next Pour into your drinkmate machine to carbonate. Pour into glass and garnish with lime slice.",
      ],
      isFeatured: false,
      difficulty: "Intermediate",
      time: "15 min",
      rating: 4.5,
      reviews: 67,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["lime", "green", "homemade", "colorful"],
    },
    {
      id: 12,
      category: "mocktails",
      url: "#",
      title: "Carbonated Apple Cider",
      ingredients: ["Fresh Apple Cider", "Optional: Cinnamon sticks", "Optional: Apple slices for garnish"],
      instructions: [
        "Pour fresh apple cider into your Drinkmate",
        "Add sparkle for a fizzy fall treat",
        "Serve with cinnamon sticks and apple slices",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "3 min",
      rating: 4.7,
      reviews: 45,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["apple", "cider", "fall", "seasonal"],
    },
    {
      id: 13,
      category: "infused",
      url: "#",
      title: "Fruit Infused Sparkling Water",
      ingredients: ["Fresh fruits (berries, citrus, herbs)", "Water", "Optional: Honey or agave"],
      instructions: [
        "Add fresh fruits and herbs to water",
        "Let infuse for 10-15 minutes",
        "Pour into Drinkmate and carbonate",
        "Serve with fresh fruit garnish",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.8,
      reviews: 156,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["infused", "fruit", "water", "healthy"],
    },
    {
      id: 14,
      category: "infused",
      url: "#",
      title: "Drinkmate Diet Fizzy Grape Juice",
      ingredients: ["Grape Juice", "Water", "Optional: Sweetener"],
      instructions: [
        "Mix grape juice with water to your preferred ratio",
        "Pour into Drinkmate and carbonate",
        "Serve over ice for a refreshing grape soda",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "3 min",
      rating: 4.6,
      reviews: 78,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["grape", "diet", "juice", "fizzy"],
    },
    {
      id: 15,
      category: "infused",
      url: "#",
      title: "Drinkmate Diet Fizzy Grapefruit Juice",
      ingredients: ["Grapefruit Juice", "Water", "Optional: Sweetener"],
      instructions: [
        "Pour grapefruit juice into your Drinkmate carbonation bottle",
        "Add sparkle!",
        "Pour into glass over ice and enjoy!",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "3 min",
      rating: 4.5,
      reviews: 67,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["grapefruit", "diet", "juice", "citrus"],
    },
    {
      id: 16,
      category: "infused",
      url: "#",
      title: "Drinkmate Fruit Juice Spritzer",
      ingredients: ["Your favorite fruit juice", "Water", "Optional: Fresh fruit for garnish"],
      instructions: [
        "Mix fruit juice with water to your preferred ratio",
        "Pour into Drinkmate and carbonate",
        "Serve over ice with fresh fruit garnish",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "3 min",
      rating: 4.7,
      reviews: 89,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["spritzer", "fruit", "juice", "refreshing"],
    },
    {
      id: 17,
      category: "infused",
      url: "#",
      title: "Drinkmate Raspberry Delight",
      ingredients: ["Fresh raspberries", "Water", "Optional: Honey or sugar"],
      instructions: [
        "Muddle fresh raspberries in a glass",
        "Add water and optional sweetener",
        "Pour into Drinkmate and carbonate",
        "Serve with fresh raspberries",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.8,
      reviews: 112,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["raspberry", "delight", "berry", "sweet"],
    },
    {
      id: 18,
      category: "infused",
      url: "#",
      title: "Drinkmate Cucumber Sparkler",
      ingredients: ["Fresh cucumber slices", "Water", "Optional: Mint leaves", "Optional: Lime juice"],
      instructions: [
        "Add cucumber slices and optional mint to water",
        "Let infuse for 10-15 minutes",
        "Pour into Drinkmate and carbonate",
        "Serve with fresh cucumber and mint garnish",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "5 min",
      rating: 4.6,
      reviews: 78,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      tags: ["cucumber", "sparkler", "refreshing", "light"],
    },
  ]

  // Dynamic categories based on real data
  const categories = [
    { name: "all", count: recipesData.length },
    { name: "cocktails", count: recipesData.filter((r) => r.category === "cocktails").length },
    { name: "mocktails", count: recipesData.filter((r) => r.category === "mocktails").length },
    { name: "infused", count: recipesData.filter((r) => r.category === "infused").length },
  ]

  const featuredRecipe = recipesData.find((recipe) => recipe.isFeatured)

  const baseFiltered =
    selectedCategory === "all" ? recipesData : recipesData.filter((recipe) => recipe.category === selectedCategory)

  const query = searchQuery.trim().toLowerCase()

  const filteredRecipes = baseFiltered.filter((recipe) => {
    const matchesSearch =
      !query ||
      recipe.title.toLowerCase().includes(query) ||
      recipe.ingredients.join(" ").toLowerCase().includes(query) ||
      recipe.tags.join(" ").toLowerCase().includes(query)
    return matchesSearch
  })

  const clearFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "cocktails":
        return "Cocktails"
      case "mocktails":
        return "Mocktails"
      case "infused":
        return "Infused Drinks"
      default:
        return category
    }
  }

  const handleSubmitRecipe = () => {
    // Validate form
    if (!newRecipe.title.trim() || newRecipe.ingredients[0].trim() === "" || newRecipe.instructions[0].trim() === "") {
      alert("Please fill in all required fields!")
      return
    }

    // Create new recipe object
    const submittedRecipe = {
      id: recipesData.length + 1,
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter(ing => ing.trim() !== ""),
      instructions: newRecipe.instructions.filter(inst => inst.trim() !== ""),
      tags: newRecipe.tags.filter(tag => tag.trim() !== ""),
      rating: 4.5, // Default rating for new submissions
      reviews: 0,
      image: "/images/02 - Soda Makers/Artic-Black-Machine---Front.png",
      url: "#",
      isFeatured: false
    }

    // Add to recipes data (in a real app, this would go to a database)
    recipesData.push(submittedRecipe)
    
    // Reset form and close modal
    setNewRecipe({
      title: "",
      category: "cocktails",
      ingredients: [""],
      instructions: [""],
      difficulty: "Easy",
      time: "5 min",
      tags: [""]
    })
    setShowSubmitForm(false)
    
    alert("Recipe submitted successfully! Thank you for sharing!")
  }

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ""]
    }))
  }

  const addInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }))
  }

  const addTag = () => {
    setNewRecipe(prev => ({
      ...prev,
      tags: [...prev.tags, ""]
    }))
  }

  return (
    <PageLayout currentPage="recipes">
      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <section className="py-16 bg-white  animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1
                  className={`text-5xl font-bold text-black leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-left`}
                >
                  {t("recipes.hero.title")}
                  <br />
                  <span className="text-[#12d6fa]">{t("recipes.hero.subtitle")}</span>
                </h1>
                <p
                  className={`text-xl text-gray-600 leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-left delay-200`}
                >
                  {t("recipes.hero.description")}
                </p>
                
              
              </div>
              <div className="relative flex justify-center">
                <Image
                  src="/images/drink-recipes.png"
                  alt="Drink Recipes"
                  width={400}
                  height={320}
                  className="w-full max-w-md h-auto object-contain"
                />
                <div className="absolute -top-4 -right-8 bg-yellow-400 rounded-full w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center text-white font-bold text-center p-2 shadow-lg">
                  <span className={`text-xs ${isRTL ? "font-cairo" : "font-montserrat"}`}>{recipesData.length}</span>
                  <span className={`text-sm md:text-lg ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("recipes.hero.recipesLabel")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Recipe Section */}
        {featuredRecipe && (
          <section className="py-16 bg-white animate-fade-in-up">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white rounded-3xl p-12 shadow-lg">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-slide-in-up">
                    <Star className="w-4 h-4 fill-current" />
                    <span className={isRTL ? "font-cairo" : "font-montserrat"}>{t("recipes.featuredRecipe.recipeOfTheWeek")}</span>
                  </div>
                  <h2
                    className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up delay-200`}
                  >
                    {featuredRecipe.title}
                  </h2>
                  <p
                    className={`text-gray-600 max-w-2xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-300`}
                  >
                    {t("recipes.featuredRecipe.description")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="flex gap-6 justify-start">
                      <div className="text-left">
                        <Clock className="w-8 h-8 text-[#12d6fa] mb-2" />
                        <p className={`text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {t("recipes.featuredRecipe.prepTime")}
                        </p>
                        <p className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>{featuredRecipe.time}</p>
                      </div>
                      <div className="text-left">
                        <Utensils className="w-8 h-8 text-[#12d6fa] mb-2" />
                        <p className={`text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {t("recipes.featuredRecipe.difficulty")}
                        </p>
                        <p className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>{featuredRecipe.difficulty}</p>
                      </div>
                      <div className="text-left">
                        <Heart className="w-8 h-8 text-[#12d6fa] mb-2" />
                        <p className={`text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>Servings</p>
                        <p className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>1-2</p>
                      </div>
                    </div>

                    <div>
                      <h3
                        className={`text-lg font-semibold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                      >
                        {t("recipes.featuredRecipe.ingredients")}
                      </h3>
                      <ul className="space-y-2">
                        {featuredRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                            <span className={`text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {ingredient}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3
                        className={`text-lg font-semibold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                      >
                        {t("recipes.featuredRecipe.instructions")}
                      </h3>
                      <div className="space-y-2">
                        {Array.isArray(featuredRecipe.instructions) ? (
                          featuredRecipe.instructions.map((instruction, index) => (
                            <p key={index} className={`text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {instruction}
                            </p>
                          ))
                        ) : (
                          <p className={`text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            {featuredRecipe.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => alert("Recipe saved to favorites!")}
                        className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 py-3"
                      >
                        <span className={isRTL ? "font-cairo" : "font-montserrat"}>{t("recipes.featuredRecipe.saveRecipe")}</span>
                      </Button>
                      <Button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: featuredRecipe.title,
                              text: `Check out this amazing recipe: ${featuredRecipe.title}`,
                              url: featuredRecipe.url,
                            })
                          } else {
                            navigator.clipboard.writeText(featuredRecipe.url)
                            alert("Link copied to clipboard!")
                          }
                        }}
                        variant="outline"
                        className="px-6 py-3 text-gray-600 border-gray-300"
                      >
                        <span className={isRTL ? "font-cairo" : "font-montserrat"}>{t("recipes.featuredRecipe.share")}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="relative flex justify-center">
                    <div className="relative bg-white p-4 md:p-6 h-48 md:h-64 flex items-center justify-center overflow-hidden rounded-2xl">
                      <Image
                        src={featuredRecipe.image || "/placeholder.svg"}
                        alt={featuredRecipe.title}
                        width={350}
                        height={400}
                        className="w-full max-w-sm h-auto object-contain"
                      />
                      <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recipes Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                {isRTL ? "جميع الوصفات" : "All Recipes"}
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                {isRTL ? "اكتشف مجموعتنا الكاملة من وصفات المشروبات اللذيذة" : "Discover our complete collection of delicious drink recipes"}
              </p>
            </div>
            
            {/* Filter Bar */}
            <div className="space-y-4 mb-8">
              {/* Search */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRTL ? "ابحث في الوصفات..." : "Search recipes..."}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#12d6fa]/30 focus:border-[#12d6fa] text-sm ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                  />
                </div>
                {(selectedCategory !== "all" || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  >
                    <X className="w-3.5 h-3.5" /> <span className={isRTL ? "font-cairo" : "font-montserrat"}>{isRTL ? "مسح" : "Clear"}</span>
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                      selectedCategory === category.name
                        ? "bg-[#12d6fa] text-white border-[#12d6fa]"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className={isRTL ? "font-cairo" : "font-montserrat"}>{category.name === "all" ? "All" : getCategoryDisplayName(category.name)}</span>
                    <span
                      className={`ml-2 inline-flex items-center justify-center rounded-full text-[10px] px-2 py-0.5 ${
                        selectedCategory === category.name ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      } ${isRTL ? "font-cairo" : "font-montserrat"}`}
                    >
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tags filter removed */}
            </div>
            <div id="recipes-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  id={`recipe-${recipe.id}`}
                  className="recipe-card bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Recipe Image */}
                  <div className="relative bg-white p-4 md:p-6 h-48 md:h-64 flex items-center justify-center overflow-hidden rounded-2xl">
                    <Image
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      width={180}
                      height={180}
                      className="w-full max-w-[180px] h-auto object-contain transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Recipe Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className={`flex items-center justify-between text-sm ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                        <span className="text-gray-600">{recipe.time}</span>
                        <span className="text-gray-600">{recipe.difficulty}</span>
                        <span className="text-gray-600">{recipe.rating}</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className={`absolute top-4 left-4 bg-[#12d6fa] text-white px-3 py-1 rounded-full text-xs font-semibold ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {getCategoryDisplayName(recipe.category)}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 shadow-md">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className={`text-sm font-semibold text-gray-800 ${isRTL ? "font-cairo" : "font-montserrat"}`}>{recipe.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Details */}
                  <div className="p-6 space-y-4">
                    <h3 className={`text-xl font-semibold text-black leading-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}>{recipe.title}</h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <span key={index} className={`bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Quick Info */}
                    <div className={`flex items-center justify-between text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                      <span>
                        {recipe.reviews} {isRTL ? "تقييم" : "reviews"}
                      </span>
                      <span>
                        {recipe.ingredients.length} {isRTL ? "مكون" : "ingredients"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => toggleRecipeDetails(recipe.id)}
                        className="flex-1 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                      >
                        <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                          {expandedRecipes.has(recipe.id) ? "Hide Details" : "Show Details"}
                        </span>
                      </Button>
                      <Button
                        onClick={() => alert(`Added ${recipe.title} to favorites!`)}
                        variant="outline"
                        className="px-4 border-gray-300"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {expandedRecipes.has(recipe.id) && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <div className="space-y-4">
                          {/* Ingredients */}
                          <div>
                            <h4 className={`font-semibold text-gray-800 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>Ingredients:</h4>
                            <ul className={`list-disc list-inside space-y-1 text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {recipe.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Instructions */}
                          <div>
                            <h4 className={`font-semibold text-gray-800 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>Instructions:</h4>
                            <ol className={`list-decimal list-inside space-y-1 text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {recipe.instructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Difficulty & Time */}
                          <div className={`flex items-center gap-4 text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            <span>Difficulty: {recipe.difficulty}</span>
                            <span>Time: {recipe.time}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recipe Quick Tips Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                Quick Recipe Tips
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                Master the art of perfect sparkling drinks with these essential tips
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#12d6fa]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  Perfect Timing
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  Carbonate water first, then add syrups and flavors. This prevents overflow and ensures consistent
                  taste.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#a8f387]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#a8f387] to-[#9ae374] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  Temperature Control
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  Use chilled water and ingredients. Cold liquids hold carbonation better and taste more refreshing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#12d6fa]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  Flavor Balance
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  Start with less syrup and adjust to taste. You can always add more, but you can't take it away.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#a8f387]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#a8f387] to-[#9ae374] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  Fresh Garnishes
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  Add fresh fruits, herbs, or citrus zest after carbonation for enhanced flavor and visual appeal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Submitted Recipes Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                Community Recipes
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                Amazing recipes shared by our community
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {recipesData
                .filter(recipe => recipe.rating >= 4.8)
                .slice(0, 2)
                .map((recipe, index) => (
                  <div key={recipe.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                        {recipe.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className={`text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {recipe.rating}
                        </span>
                      </div>
                    </div>
                    <p className={`text-gray-600 mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                      {recipe.ingredients.slice(0, 3).join(", ")} with a refreshing twist
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm text-gray-500 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                        by {recipe.category === "cocktails" ? "Mixologist" : recipe.category === "mocktails" ? "Bartender" : "Chef"} {recipe.id % 2 === 0 ? "Sarah M." : "Ahmed K."}
                      </span>
                      <span
                        className={`text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="bg-[#12d6fa] hover:bg-[#0fb8e6] text-white font-medium py-3 px-8 rounded-lg"
              >
                <span className={isRTL ? "font-cairo" : "font-montserrat"}>Submit Your Recipe</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Nutritional Information Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                Nutritional Information
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                Learn about the health benefits and nutritional content of our drinks
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  Calorie Content
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span
                      className={`text-sm md:text-base text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Plain Sparkling Water
                    </span>
                    <span className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>0 calories</span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm md:text-base text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      With Natural Syrup
                    </span>
                    <span className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>15-25 calories</span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm md:text-base text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Premium Syrup Mix
                    </span>
                    <span className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>30-45 calories</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  Health Benefits
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Hydration without added sugars
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Natural flavors from real ingredients
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Low-calorie alternative to sodas
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  Allergen Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      All syrups are gluten-free
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      Made with natural ingredients
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      No artificial preservatives
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Submission Modal */}
        {showSubmitForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                    Submit Your Recipe
                  </h2>
                  <button
                    onClick={() => setShowSubmitForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmitRecipe(); }} className="space-y-6">
                  {/* Recipe Title */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      Recipe Title *
                    </label>
                    <input
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      placeholder="Enter recipe title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      Category *
                    </label>
                    <select
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      <option value="cocktails">Cocktails</option>
                      <option value="mocktails">Mocktails</option>
                      <option value="infused">Infused Drinks</option>
                    </select>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      Ingredients *
                    </label>
                    {newRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => {
                            const newIngredients = [...newRecipe.ingredients]
                            newIngredients[index] = e.target.value
                            setNewRecipe(prev => ({ ...prev, ingredients: newIngredients }))
                          }}
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          placeholder={`Ingredient ${index + 1}`}
                          required={index === 0}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newIngredients = newRecipe.ingredients.filter((_, i) => i !== index)
                              setNewRecipe(prev => ({ ...prev, ingredients: newIngredients }))
                            }}
                            className="px-3 py-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addIngredient}
                      className={`text-sm text-[#12d6fa] hover:text-[#0bc4e8] ${isRTL ? "font-cairo" : "font-montserrat"}`}
                    >
                      + Add Ingredient
                    </button>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      Instructions *
                    </label>
                    {newRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <span className={`text-sm text-gray-500 mt-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => {
                            const newInstructions = [...newRecipe.instructions]
                            newInstructions[index] = e.target.value
                            setNewRecipe(prev => ({ ...prev, instructions: newInstructions }))
                          }}
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          placeholder={`Step ${index + 1}`}
                          required={index === 0}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newInstructions = newRecipe.instructions.filter((_, i) => i !== index)
                              setNewRecipe(prev => ({ ...prev, instructions: newInstructions }))
                            }}
                            className="px-3 py-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addInstruction}
                      className={`text-sm text-[#12d6fa] hover:text-[#0bc4e8] ${isRTL ? "font-cairo" : "font-montserrat"}`}
                    >
                      + Add Step
                    </button>
                  </div>

                  {/* Difficulty & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                        Difficulty
                      </label>
                      <select
                        value={newRecipe.difficulty}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, difficulty: e.target.value }))}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                        Time
                      </label>
                      <input
                        type="text"
                        value={newRecipe.time}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, time: e.target.value }))}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                        placeholder="e.g., 10 min"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      Tags
                    </label>
                    {newRecipe.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => {
                            const newTags = [...newRecipe.tags]
                            newTags[index] = e.target.value
                            setNewRecipe(prev => ({ ...prev, tags: newTags }))
                          }}
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                          placeholder="e.g., refreshing, summer"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = newRecipe.tags.filter((_, i) => i !== index)
                              setNewRecipe(prev => ({ ...prev, tags: newTags }))
                            }}
                            className="px-3 py-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTag}
                      className={`text-sm text-[#12d6fa] hover:text-[#0bc4e8] ${isRTL ? "font-cairo" : "font-montserrat"}`}
                    >
                      + Add Tag
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                    >
                      <span className={isRTL ? "font-cairo" : "font-montserrat"}>Submit Recipe</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      <span className={isRTL ? "font-cairo" : "font-montserrat"}>Cancel</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
