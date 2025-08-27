"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock, Star, Heart, Utensils } from "lucide-react"
import { useState, useEffect } from "react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"

export default function Recipes() {
  const { t, isRTL, language } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState(t('recipes.categories.all'))

  const categories = [
    { name: t('recipes.categories.all'), count: 45 },
    { name: t('recipes.categories.fruity'), count: 18 },
    { name: t('recipes.categories.citrus'), count: 12 },
    { name: t('recipes.categories.berry'), count: 8 },
    { name: t('recipes.categories.cola'), count: 7 }
  ]

  const recipes = [
    {
      id: 1,
      name: t('recipes.recipeData.italianStrawberryLemonade.name'),
      category: t('recipes.recipeData.italianStrawberryLemonade.category'),
      difficulty: t('recipes.recipeData.italianStrawberryLemonade.difficulty'),
      time: t('recipes.recipeData.italianStrawberryLemonade.time'),
      rating: 4.9,
      reviews: 156,
      image: "/placeholder.jpg",
      ingredients: [t('recipes.ingredients.strawberryLemonSyrup'), t('recipes.ingredients.sparklingWater'), t('recipes.ingredients.freshLemon'), t('recipes.ingredients.ice')],
      instructions: t('recipes.recipeData.italianStrawberryLemonade.instructions'),
      isFeatured: true,
      calories: `45 ${t('recipes.nutritionalInfo.calorieUnit')}`,
      tags: [t('recipes.tags.refreshing'), t('recipes.tags.summer'), t('recipes.tags.popular')]
    },
    {
      id: 2,
      name: t('recipes.recipeData.cherryColaFizz.name'),
      category: t('recipes.recipeData.cherryColaFizz.category'),
      difficulty: t('recipes.recipeData.cherryColaFizz.difficulty'),
      time: t('recipes.recipeData.cherryColaFizz.time'),
      rating: 4.7,
      reviews: 89,
      image: "/placeholder.jpg",
      ingredients: [t('recipes.ingredients.cherryColaSyrup'), t('recipes.ingredients.sparklingWater'), t('recipes.ingredients.ice')],
      instructions: t('recipes.recipeData.cherryColaFizz.instructions'),
      isFeatured: false,
      calories: `38 ${t('recipes.nutritionalInfo.calorieUnit')}`,
      tags: [t('recipes.tags.classic'), t('recipes.tags.bold'), t('recipes.tags.fizzy')]
    },
    {
      id: 3,
      name: t('recipes.recipeData.blueRaspberryBlast.name'),
      category: t('recipes.recipeData.blueRaspberryBlast.category'),
      difficulty: t('recipes.recipeData.blueRaspberryBlast.difficulty'),
      time: t('recipes.recipeData.blueRaspberryBlast.time'),
      rating: 4.8,
      reviews: 67,
      image: "/placeholder.jpg",
      ingredients: [t('recipes.ingredients.blueRaspberrySyrup'), t('recipes.ingredients.sparklingWater'), t('recipes.ingredients.freshBlueberries'), t('recipes.ingredients.mint'), t('recipes.ingredients.ice')],
      instructions: t('recipes.recipeData.blueRaspberryBlast.instructions'),
      isFeatured: true,
      calories: `52 ${t('recipes.nutritionalInfo.calorieUnit')}`,
      tags: [t('recipes.tags.berry'), t('recipes.tags.refreshing'), t('recipes.tags.gourmet')]
    },
    {
      id: 4,
      name: t('recipes.recipeData.limeMojitoSparkle.name'),
      category: t('recipes.recipeData.limeMojitoSparkle.category'),
      difficulty: t('recipes.recipeData.limeMojitoSparkle.difficulty'),
      time: t('recipes.recipeData.limeMojitoSparkle.time'),
      rating: 4.6,
      reviews: 94,
      image: "/placeholder.jpg",
      ingredients: [t('recipes.ingredients.limeSyrup'), t('recipes.ingredients.sparklingWater'), t('recipes.ingredients.freshLemon'), t('recipes.ingredients.mintLeaves'), t('recipes.ingredients.sugar'), t('recipes.ingredients.ice')],
      instructions: t('recipes.recipeData.limeMojitoSparkle.instructions'),
      isFeatured: false,
      calories: `41 ${t('recipes.nutritionalInfo.calorieUnit')}`,
      tags: [t('recipes.tags.citrus'), t('recipes.tags.mojito'), t('recipes.tags.fresh')]
    },
    {
      id: 5,
      name: t('recipes.recipeData.orangeCreamsicle.name'),
      category: t('recipes.recipeData.orangeCreamsicle.category'),
      difficulty: t('recipes.recipeData.orangeCreamsicle.difficulty'),
      time: t('recipes.recipeData.orangeCreamsicle.time'),
      rating: 4.5,
      reviews: 78,
      image: "/placeholder.jpg",
      ingredients: [t('recipes.ingredients.orangeSyrup'), t('recipes.ingredients.vanillaSyrup'), t('recipes.ingredients.sparklingWater'), t('recipes.ingredients.cream'), t('recipes.ingredients.ice')],
      instructions: t('recipes.recipeData.orangeCreamsicle.instructions'),
      isFeatured: false,
      calories: `67 ${t('recipes.nutritionalInfo.calorieUnit')}`,
      tags: [t('recipes.tags.creamy'), t('recipes.tags.orange'), t('recipes.tags.dessert')]
    },
    {
      id: 6,
      name: t('recipes.recipeData.grapeSodaSupreme.name'),
      category: t('recipes.recipeData.grapeSodaSupreme.category'),
      difficulty: t('recipes.recipeData.grapeSodaSupreme.difficulty'),
      time: t('recipes.recipeData.grapeSodaSupreme.time'),
      rating: 4.4,
      reviews: 45,
      image: "/placeholder.jpg",
      ingredients: [t('recipes.ingredients.grapeSyrup'), t('recipes.ingredients.sparklingWater'), t('recipes.ingredients.ice')],
      instructions: t('recipes.recipeData.grapeSodaSupreme.instructions'),
      isFeatured: false,
      calories: `35 ${t('recipes.nutritionalInfo.calorieUnit')}`,
      tags: [t('recipes.tags.grape'), t('recipes.tags.simple'), t('recipes.tags.classic')]
    }
  ]

  const featuredRecipe = recipes.find(recipe => recipe.isFeatured)

  const filteredRecipes = selectedCategory === t('recipes.categories.all') 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory)

  return (
    <PageLayout currentPage="recipes">
      <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#f3f3f3] animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
                          <div className="space-y-6">
                <h1 className={`text-5xl font-bold text-black leading-tight ${isRTL ? 'font-cairo' : 'font-montserrat'} animate-slide-in-left`}>
                  {t('recipes.hero.title')}
                  <br />
                  <span className="text-[#12d6fa]">{t('recipes.hero.subtitle')}</span>
                </h1>
                <p className={`text-xl text-gray-600 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'} animate-slide-in-left delay-200`}>
                  {t('recipes.hero.description')}
                </p>
                <div className="flex space-x-4 animate-slide-in-left delay-400">
                  <Button 
                    onClick={() => window.location.href = '/recipes'}
                    className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 py-3"
                  >
                    {t('recipes.hero.exploreRecipes')}
                  </Button>
                  <Button 
                    onClick={() => window.open('/recipes.pdf', '_blank')}
                    variant="outline" 
                    className="px-6 py-3 text-gray-600 border-gray-300"
                  >
                    {t('recipes.hero.downloadPDF')}
                  </Button>
                </div>
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
                <span className="text-xs">{t('recipes.hero.recipesCountNumber')}</span>
                <span className="text-sm md:text-lg">{t('recipes.hero.recipesLabel')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipe Section */}
      {featuredRecipe && (
        <section className="py-16 bg-white animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-b from-white to-[#f3f3f3] rounded-3xl p-12 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-slide-in-up">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{t('recipes.featuredRecipe.recipeOfTheWeek')}</span>
                </div>
                <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'} animate-slide-in-up delay-200`}>{featuredRecipe.name}</h2>
                <p className={`text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'} animate-slide-in-up delay-300`}>
                  {t('recipes.featuredRecipe.description')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex gap-6 justify-start">
                    <div className="text-left">
                      <Clock className="w-8 h-8 text-[#12d6fa] mb-2" />
                      <p className={`text-sm text-gray-600 ${isRTL ? 'font-noto-arabic' : ''}`}>{t('recipes.featuredRecipe.prepTime')}</p>
                      <p className="font-semibold text-black">{featuredRecipe.time}</p>
                    </div>
                    <div className="text-left">
                      <Utensils className="w-8 h-8 text-[#12d6fa] mb-2" />
                      <p className={`text-sm text-gray-600 ${isRTL ? 'font-noto-arabic' : ''}`}>{t('recipes.featuredRecipe.difficulty')}</p>
                      <p className="font-semibold text-black">{featuredRecipe.difficulty}</p>
                    </div>
                    <div className="text-left">
                      <Heart className="w-8 h-8 text-[#12d6fa] mb-2" />
                      <p className={`text-sm text-gray-600 ${isRTL ? 'font-noto-arabic' : ''}`}>Servings</p>
                      <p className="font-semibold text-black">1-2</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-semibold text-black mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.featuredRecipe.ingredients')}</h3>
                    <ul className="space-y-2">
                      {featuredRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                          <span className={`text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-semibold text-black mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.featuredRecipe.instructions')}</h3>
                    <p className={`text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{featuredRecipe.instructions}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => alert('Recipe saved to favorites!')}
                      className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 py-3"
                    >
                      {t('recipes.featuredRecipe.saveRecipe')}
                    </Button>
                    <Button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: featuredRecipe.name,
                            text: `Check out this amazing recipe: ${featuredRecipe.name}`,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      variant="outline" 
                      className="px-6 py-3 text-gray-600 border-gray-300"
                    >
                      {t('recipes.featuredRecipe.share')}
                    </Button>
                  </div>
                </div>
                
                <div className="relative flex justify-center">
                  <Image
                    src={featuredRecipe.image}
                    alt={featuredRecipe.name}
                    width={350}
                    height={400}
                    className="w-full max-w-sm h-auto object-contain rounded-2xl"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-gradient-to-b from-white to-[#f3f3f3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.name
                    ? "bg-[#12d6fa] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Recipe Image */}
                <div className="relative bg-gradient-to-b from-white to-[#f3f3f3] p-4 md:p-6 h-48 md:h-64 flex items-center justify-center overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={180}
                    height={180}
                    className="w-full max-w-[180px] h-auto object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Recipe Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{recipe.time}</span>
                      <span className="text-gray-600">{recipe.difficulty}</span>
                      <span className="text-gray-600">{recipe.calories}</span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-[#12d6fa] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {recipe.category}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 shadow-md">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-800">{recipe.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Details */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-black leading-tight">{recipe.name}</h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quick Info */}
                                     <div className="flex items-center justify-between text-sm text-gray-600">
                     <span>{recipe.reviews} {t('recipes.recipeCard.reviews')}</span>
                     <span>{recipe.ingredients.length} {t('recipes.recipeCard.ingredients')}</span>
                   </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => alert(`Viewing recipe: ${recipe.name}`)}
                      className="flex-1 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                    >
                      {t('recipes.recipeCard.viewRecipe')}
                    </Button>
                    <Button 
                      onClick={() => alert(`Added ${recipe.name} to favorites!`)}
                      variant="outline" 
                      className="px-4 border-gray-300"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Recipe Quick Tips Section */}
      <section className="py-16 bg-[#f3f3f3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Quick Recipe Tips</h2>
            <p className={`text-xl text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>Master the art of perfect sparkling drinks with these essential tips</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#12d6fa]/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Perfect Timing</h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>Carbonate water first, then add syrups and flavors. This prevents overflow and ensures consistent taste.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#a8f387]/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#a8f387] to-[#9ae374] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Temperature Control</h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>Use chilled water and ingredients. Cold liquids hold carbonation better and taste more refreshing.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#12d6fa]/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Flavor Balance</h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>Start with less syrup and adjust to taste. You can always add more, but you can't take it away.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#a8f387]/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#a8f387] to-[#9ae374] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Fresh Garnishes</h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>Add fresh fruits, herbs, or citrus zest after carbonation for enhanced flavor and visual appeal.</p>
            </div>
          </div>

        </div>
      </section>

      {/* User Submitted Recipes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.communityRecipes.title')}</h2>
            <p className={`text-xl text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold text-black ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.communityRecipes.tropicalParadise.title')}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.8</span>
                </div>
              </div>
              <p className={`text-gray-600 mb-4 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.tropicalParadise.description')}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.tropicalParadise.by')}</span>
                <span className={`text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.tropicalParadise.verified')}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold text-black ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.communityRecipes.berryBlast.title')}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.9</span>
                </div>
              </div>
              <p className={`text-gray-600 mb-4 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.berryBlast.description')}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.berryBlast.by')}</span>
                <span className={`text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.communityRecipes.berryBlast.verified')}</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={() => alert('Recipe submission feature coming soon!')}
              className="bg-[#12d6fa] hover:bg-[#0fb8e6] text-white font-medium py-3 px-8 rounded-lg"
            >
              {t('recipes.communityRecipes.submitYourRecipe')}
            </Button>
          </div>
        </div>
      </section>

      {/* Nutritional Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.nutritionalInfo.title')}</h2>
            <p className={`text-xl text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-4 md:p-6 rounded-2xl">
              <h3 className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.nutritionalInfo.calorieContent.title')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm md:text-base text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.calorieContent.plainSparklingWater')}</span>
                  <span className="font-semibold text-black">0 calories</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm md:text-base text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.calorieContent.withNaturalSyrup')}</span>
                  <span className="font-semibold text-black">15-25 calories</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm md:text-base text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.calorieContent.premiumSyrupMix')}</span>
                  <span className="font-semibold text-black">30-45 calories</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl">
              <h3 className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.nutritionalInfo.healthBenefits.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                  <span className={`text-sm md:text-base text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.healthBenefits.benefit1')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                  <span className={`text-sm md:text-base text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.healthBenefits.benefit2')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                  <span className={`text-sm md:text-base text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.healthBenefits.benefit3')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl">
              <h3 className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('recipes.nutritionalInfo.allergenInfo.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                  <span className={`text-sm md:text-base text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.allergenInfo.info1')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                  <span className={`text-sm md:text-base text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.allergenInfo.info2')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                  <span className={`text-sm md:text-base text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('recipes.nutritionalInfo.allergenInfo.info3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </PageLayout>
  )
}
