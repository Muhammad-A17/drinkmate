"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock, Star, Heart, Utensils, Search, X } from "lucide-react"
import { useState } from "react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import { useRecipeRotation, formatTimeRemaining } from "@/hooks/use-recipe-rotation"
import { toArabicNumerals } from "@/lib/utils"

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

  // Helper function to convert recipe data to Arabic numerals and translations if language is Arabic
  const convertRecipeToArabic = (recipe: any) => {
    if (language !== 'AR') return recipe

    // Translation mappings
    const difficultyTranslations: Record<string, string> = {
      'Easy': 'سهل',
      'Intermediate': 'متوسط',
      'Advanced': 'متقدم'
    }

    const tagTranslations: Record<string, string> = {
      'refreshing': 'منعش',
      'summer': 'صيفي',
      'popular': 'شائع',
      'tequila': 'تيكيلا',
      'margarita': 'مارغريتا',
      'spicy': 'حار',
      'tropical': 'استوائي',
      'jalapeño': 'هالبينو',
      'brunch': 'غداء متأخر',
      'mimosa': 'ميموزا',
      'citrus': 'حمضيات',
      'celebration': 'احتفال',
      'winter': 'شتوي',
      'pomegranate': 'رمان',
      'ginger': 'زنجبيل',
      'seasonal': 'موسمي',
      'warm': 'دافئ',
      'pear': 'إجاص',
      'cinnamon': 'قرفة',
      'gin': 'جن',
      'tea': 'شاي',
      'peach': 'خوخ',
      'whisky': 'ويسكي',
      'classic': 'كلاسيكي',
      'patriotic': 'وطني',
      'mocktail': 'مشروب غير كحولي',
      'cranberry': 'توت بري',
      'blue': 'أزرق',
      'gatorade': 'جاتوريد',
      'pina': 'أناناس',
      'orange': 'برتقالي',
      'lemon': 'ليمون',
      'lime': 'ليمون أخضر',
      'apple': 'تفاح',
      'fruit': 'فواكه',
      'infused': 'مغمس',
      'sparkling': 'متلألئ',
      'diet': 'دايت',
      'fizzy': 'فيزي',
      'grape': 'عنب',
      'grapefruit': 'جريب فروت',
      'juice': 'عصير',
      'spritzer': 'سبريتزر',
      'raspberry': 'توت أحمر',
      'delight': 'لذة',
      'cucumber': 'خيار',
      'sparkler': 'متلألئ',
      'healthy': 'صحي',
      'natural': 'طبيعي',
      'homemade': 'محلي الصنع',
      'colorful': 'ملون',
      'easy': 'سهل',
      'kid-friendly': 'مناسب للأطفال',
      'sweet': 'حلو',
      'herbal': 'عشبي',
      'light': 'خفيف',
      'berry': 'توت',
      'sunset': 'غروب',
      'rum': 'روم',
      'fall': 'خريف'
    }

    // Comprehensive recipe title translations
    const titleTranslations: Record<string, string> = {
      'Firecracker Margarita Recipe': 'وصفة مارغريتا النارية',
      'Next Level Carbonated Margarita': 'مارغريتا متكربنة من المستوى التالي',
      'Signature Mother\'s Day Mimosa Recipe': 'وصفة ميموزا يوم الأم المميزة',
      'Winter Margarita': 'مارغريتا الشتاء',
      'The Pear-fect Warmer': 'الدافئ المثالي بالإجاص',
      'Classic Peach Tea Cocktail Recipe': 'وصفة كوكتيل الشاي بالخوخ الكلاسيكي',
      'Red, White, & Blue Mocktail Recipe': 'وصفة مشروب غير كحولي أحمر أبيض أزرق',
      'Signature Mother\'s Day Mimosa Recipe (Mocktail)': 'وصفة ميموزا يوم الأم المميزة (مشروب غير كحولي)',
      'Homemade Orange Soda Recipe': 'وصفة صودا البرتقال المنزلية',
      'Homemade Lemon Lime Soda': 'صودا الليمون والليمون الأخضر المنزلية',
      'Homemade Lime Green Soda': 'صودا الليمون الأخضر المنزلية',
      'Carbonated Apple Cider': 'عصير التفاح المتكربن',
      'Fruit Infused Sparkling Water': 'ماء متلألئ مغمس بالفواكه',
      'Drinkmate Diet Fizzy Grape Juice': 'عصير العنب الفيزي الدايت من درينكميت',
      'Drinkmate Diet Fizzy Grapefruit Juice': 'عصير الجريب فروت الفيزي الدايت من درينكميت',
      'Drinkmate Fruit Juice Spritzer': 'سبريتزر عصير الفواكه من درينكميت',
      'Drinkmate Raspberry Delight': 'لذة التوت الأحمر من درينكميت',
      'Drinkmate Cucumber Sparkler': 'متلألئ الخيار من درينكميت',
      'Tropical Sunset Spritzer': 'سبريتزر غروب استوائي',
      'Berry Blast Fizz': 'فيز توت متفجر',
      'Mint Lemonade Sparkler': 'متلألئ ليمون نعناع',
      'Ginger Lime Fizz': 'فيز زنجبيل ليمون'
    }

    const categoryTranslations: Record<string, string> = {
      'cocktails': 'كوكتيلات',
      'mocktails': 'مشروبات غير كحولية',
      'infused': 'مشروبات مغمسة'
    }

    // Ingredient translations
    const ingredientTranslations: Record<string, string> = {
      '2 oz Tequila': '٢ أونصة تيكيلا',
      '1 oz Lime Juice': '١ أونصة عصير ليمون أخضر',
      '1 oz Blue Curaçao': '١ أونصة كوراساو أزرق',
      'Lemonade': 'ليمونادة',
      'Optional: red sugar for rim': 'اختياري: سكر أحمر للحافة',
      '2 oz Tres Generaciones Tequila': '٢ أونصة تيكيلا تريس جينيراسيونز',
      '1/2 oz Grand Marnier Cuvee Louis Alexander': '١/٢ أونصة غراند مارنييه كوڤيه لويس ألكسندر',
      '1 oz fresh lime juice': '١ أونصة عصير ليمون أخضر طازج',
      '3/4 oz Jalapeño liquor': '٣/٤ أونصة ليكور هالبينو',
      '3/4 oz simple syrup': '٣/٤ أونصة شراب بسيط',
      '3/4 oz Mango nectar': '٣/٤ أونصة عصير مانجو',
      '3/4 oz Peach nectar': '٣/٤ أونصة عصير خوخ',
      'Lime wedge for garnish': 'شريحة ليمون للزينة',
      'Orange Juice': 'عصير برتقال',
      'Limeade or Lemonade': 'ليمونادة أو ليمونادة',
      'White Wine (optional)': 'نبيذ أبيض (اختياري)',
      'Cocktail rimming sugar': 'سكر لزينة الحافة',
      'Tangerine for garnish': 'يوسفي للزينة',
      'Pomegranate seeds (muddled and for garnish)': 'بذور رمان (مهروسة وللزينة)',
      '25ml Fresh pink grapefruit juice': '٢٥ مل عصير جريب فروت وردي طازج',
      '20ml Fresh lime juice': '٢٠ مل عصير ليمون أخضر طازج',
      '50ml Tequila': '٥٠ مل تيكيلا',
      '4 oz Ginger Concentrate or Syrup': '٤ أونصة مركز زنجبيل أو شراب',
      '50ml Pear-infused Gin': '٥٠ مل جن مغمس بالإجاص',
      '20ml Homemade cinnamon syrup': '٢٠ مل شراب قرفة منزلي',
      '20ml Fresh lemon juice': '٢٠ مل عصير ليمون طازج',
      'Hot water': 'ماء ساخن',
      '40ml Johnnie Walker Black Label': '٤٠ مل جوني ووكر بلاك لايبل',
      '80ml Breakfast Tea': '٨٠ مل شاي الإفطار',
      '40ml Peach Nectar': '٤٠ مل عصير خوخ',
      '15ml Lemon Juice': '١٥ مل عصير ليمون',
      '25ml Sugar Syrup': '٢٥ مل شراب سكر',
      '2 oz Cran-Apple Juice': '٢ أونصة عصير كرنبري تفاح',
      '2 oz Blue Gatorade or Powerade': '٢ أونصة جاتوريد أزرق أو باوريد',
      '1 oz Pina Colada Juice': '١ أونصة عصير بينا كولادا',
      'Freshly Squeezed Orange Juice': 'عصير برتقال طازج معصور',
      'Freshly Squeezed Lemon': 'ليمون طازج معصور',
      'Freshly Squeezed Lime': 'ليمون أخضر طازج معصور',
      'Raw Honey': 'عسل خام',
      'Water': 'ماء',
      '1 Cup Sugar': '١ كوب سكر',
      '1 Liter Water': '١ لتر ماء',
      '1/4 Cup Lime Juice, plus rind from 1 Lime': '١/٤ كوب عصير ليمون أخضر، بالإضافة إلى قشر ليمونة واحدة',
      '6-8 Drops Green Food Coloring': '٦-٨ قطرات صبغة غذائية خضراء',
      'Lime Slices for Garnish': 'شرائح ليمون أخضر للزينة',
      'Fresh Apple Cider': 'عصير تفاح طازج',
      'Optional: Cinnamon sticks': 'اختياري: عصي قرفة',
      'Optional: Apple slices for garnish': 'اختياري: شرائح تفاح للزينة',
      'Fresh fruits (berries, citrus, herbs)': 'فواكه طازجة (توت، حمضيات، أعشاب)',
      'Optional: Honey or agave': 'اختياري: عسل أو أغاف',
      'Grape Juice': 'عصير عنب',
      'Optional: Sweetener': 'اختياري: محلي',
      'Grapefruit Juice': 'عصير جريب فروت',
      'Your favorite fruit juice': 'عصير الفواكه المفضل لديك',
      'Optional: Fresh fruit for garnish': 'اختياري: فواكه طازجة للزينة',
      'Fresh raspberries': 'توت أحمر طازج',
      'Optional: Honey or sugar': 'اختياري: عسل أو سكر',
      'Fresh cucumber slices': 'شرائح خيار طازج',
      'Optional: Mint leaves': 'اختياري: أوراق نعناع',
      'Optional: Lime juice': 'اختياري: عصير ليمون أخضر',
      '2 oz Coconut Rum': '٢ أونصة رم جوز الهند',
      '1 oz Pineapple Juice': '١ أونصة عصير أناناس',
      '1 oz Orange Juice': '١ أونصة عصير برتقال',
      '1/2 oz Grenadine': '١/٢ أونصة غرينادين',
      'Club Soda': 'صودا كلوب',
      'Mixed berries (strawberries, blueberries, raspberries)': 'توت مختلط (فراولة، توت أزرق، توت أحمر)',
      'Honey': 'عسل',
      'Lemon juice': 'عصير ليمون',
      'Fresh mint leaves': 'أوراق نعناع طازجة',
      'Sugar or honey': 'سكر أو عسل',
      '2 oz Gin': '٢ أونصة جن',
      '1 oz Fresh lime juice': '١ أونصة عصير ليمون أخضر طازج',
      '1 oz Ginger syrup': '١ أونصة شراب زنجبيل',
      'Soda water': 'ماء صودا'
    }

    // Instruction translations
    const instructionTranslations: Record<string, string> = {
      'Prepare margarita glass by wetting the rim in water or agave syrup, then dipping in red sanding sugar.': 'أعد كوب المارغريتا برطب الحافة في الماء أو شراب الأغاف، ثم اغمسها في سكر الرمل الأحمر.',
      'Fill a cocktail shaker at least halfway with ice. Add tequila, blue curaçao, lemonade and lime juice. Cover and shake vigorously for 30 seconds.': 'املأ شاكر الكوكتيل نصفاً على الأقل بالثلج. أضف التيكيلا، الكوراساو الأزرق، الليمونادة وعصير الليمون الأخضر. غطِ وهز بقوة لمدة ٣٠ ثانية.',
      'Strain into the Drinkmate carbonation bottle and add sparkle!': 'صفِ في زجاجة التكربن درينكميت وأضف التلألؤ!',
      'Pour the carbonated mixture into your favorite cocktail glass over 1/2 cup of ice cubes or crushed ice.': 'صب الخليط المتكربن في كوب الكوكتيل المفضل لديك فوق ١/٢ كوب مكعبات ثلج أو ثلج مطحون.',
      'Enjoy!': 'استمتع!',
      'Combine the tequila, Grand Marnier, lime juice, jalapeño liquor and simple syrup in a drink shaker with 1/2 cup of ice.': 'اجمع التيكيلا، غراند مارنييه، عصير الليمون الأخضر، ليكور الهالبينو والشراب البسيط في شاكر مشروبات مع ١/٢ كوب ثلج.',
      'Shake vigorously.': 'هز بقوة.',
      'Strain into the Drinkmate carbonation bottle and add sparkle ... careful, this mixture may bubble over!': 'صفِ في زجاجة التكربن درينكميت وأضف التلألؤ ... احذر، قد يفور هذا الخليط!',
      'Add the mango and peach nectar gently to the top of your cocktail to create a brightly colored layer effect.': 'أضف عصير المانجو والخوخ بلطف إلى أعلى كوكتيلك لإنشاء تأثير طبقة ملونة مشرقة.',
      'Garnish with lime wedge.': 'زين بشريحة ليمون أخضر.',
      'Pour all ingredients into your Drinkmate OmniFizz to carbonate.': 'صب جميع المكونات في درينكميت أومني فيز الخاص بك للتكربن.',
      'Rim glass with sugar (get the rim wet first so it sticks!)': 'زين الحافة بالسكر (بلل الحافة أولاً حتى يلتصق!)',
      'Pour into glass without touching the rim.': 'صب في الكوب دون لمس الحافة.',
      'Garnish with a tangerine slice.': 'زين بشريحة يوسفي.',
      'Combine all ingredients in a cocktail shaker with ice': 'اجمع جميع المكونات في شاكر كوكتيل مع الثلج',
      'Shake vigorously until well-chilled': 'هز بقوة حتى يبرد جيداً',
      'Pour into a glass over ice and garnish with pomegranate seeds': 'صب في كوب فوق الثلج وزين ببذور الرمان',
      'Combine gin, cinnamon syrup, and lemon juice in a glass': 'اجمع الجن، شراب القرفة، وعصير الليمون في كوب',
      'Add hot water and stir gently': 'أضف الماء الساخن وقلب بلطف',
      'Pour into Drinkmate and carbonate for a unique fizzy hot cocktail': 'صب في درينكميت وكربن للحصول على كوكتيل ساخن فيزي فريد',
      'Serve warm with a cinnamon stick garnish': 'قدم دافئاً مع زينة عصا قرفة',
      'Carbonate any drink—not just water': 'كربن أي مشروب - ليس الماء فقط',
      'Preserve bold flavors like whisky, tea, and nectar': 'احتفظ بالنكهات الجريئة مثل الويسكي، الشاي، والعصير',
      'Reduce waste from cans and mixers': 'قلل النفايات من العلب والخلاطات',
      'Customize your bubbles to match your vibe': 'خصص فقاعاتك لتتناسب مع مزاجك',
      'Fill your Drinkmate with the Cran-Apple, Blue Gatorade, and Pina Colada juice.': 'املأ درينكميت بعصير الكرنبري التفاح، الجاتوريد الأزرق، وعصير البينا كولادا.',
      'Add sparkle!': 'أضف التلألؤ!',
      'Pour into a glass over ice and enjoy!': 'صب في كوب فوق الثلج واستمتع!',
      'All-natural ingredients – No artificial flavors or added sugar': 'مكونات طبيعية ١٠٠% - لا نكهات صناعية أو سكر مضاف',
      'Soothing and refreshing – A little honey, a lot of citrusy goodness': 'مهدئ ومنعش - قليل من العسل، الكثير من النكهة الحمضية',
      'Perfect for mornings or wind-down evenings': 'مثالي للصباح أو مساءات الاسترخاء',
      'Kid-friendly, brunch-ready, and endlessly customizable': 'مناسب للأطفال، جاهز للغداء المتأخر، وقابل للتخصيص بلا حدود',
      'Mix lemon and lime juice with honey and water': 'اخلط عصير الليمون والليمون الأخضر مع العسل والماء',
      'Pour into Drinkmate and carbonate': 'صب في درينكميت وكربن',
      'Serve over ice for a refreshing citrus soda': 'قدم فوق الثلج للحصول على صودا حمضيات منعشة',
      '1. In a small pot on medium heat dissolve sugar in water. Raise the heat, add the lime rind and bring to a boil. Lower the heat to a simmer and cook until slightly reduced. Remove from heat and discard the lime rinds. Stir in the food coloring and cool, add ice.': '١. في قدر صغير على نار متوسطة، ذوب السكر في الماء. زد النار، أضف قشر الليمون الأخضر واطبخ حتى الغليان. خفف النار إلى نار هادئة واطبخ حتى يقل قليلاً. أزل عن النار وتخلص من قشور الليمون الأخضر. قلب في الصبغة الغذائية وبرد، أضف الثلج.',
      '2. Next Pour into your drinkmate machine to carbonate. Pour into glass and garnish with lime slice.': '٢. بعد ذلك صب في آلة درينكميت للتكربن. صب في الكوب وزين بشريحة ليمون أخضر.',
      'Pour fresh apple cider into your Drinkmate': 'صب عصير التفاح الطازج في درينكميت الخاص بك',
      'Add sparkle for a fizzy fall treat': 'أضف التلألؤ للحصول على علاج خريفي فيزي',
      'Serve with cinnamon sticks and apple slices': 'قدم مع عصي القرفة وشرائح التفاح',
      'Add fresh fruits and herbs to water': 'أضف الفواكه الطازجة والأعشاب إلى الماء',
      'Let infuse for 10-15 minutes': 'اترك ينقع لمدة ١٠-١٥ دقيقة',
      'Serve with fresh fruit garnish': 'قدم مع زينة فواكه طازجة',
      'Mix grape juice with water to your preferred ratio': 'اخلط عصير العنب مع الماء بنسبة تفضلها',
      'Pour grapefruit juice into your Drinkmate carbonation bottle': 'صب عصير الجريب فروت في زجاجة التكربن درينكميت الخاصة بك',
      'Mix fruit juice with water to your preferred ratio': 'اخلط عصير الفواكه مع الماء بنسبة تفضلها',
      'Muddle fresh raspberries in a glass': 'اهرس التوت الأحمر الطازج في كوب',
      'Add water and optional sweetener': 'أضف الماء والمحلي الاختياري',
      'Serve with fresh raspberries': 'قدم مع توت أحمر طازج',
      'Add cucumber slices and optional mint to water': 'أضف شرائح الخيار والنعناع الاختياري إلى الماء',
      'Let infuse for 5 minutes': 'اترك ينقع لمدة ٥ دقائق',
      'Serve with fresh cucumber and mint garnish': 'قدم مع زينة خيار ونعناع طازجة',
      'Combine rum, pineapple juice, and orange juice in a shaker with ice': 'اجمع الروم، عصير الأناناس، وعصير البرتقال في شاكر مع الثلج',
      'Shake well and strain into Drinkmate carbonation bottle': 'هز جيداً وصفِ في زجاجة التكربن درينكميت',
      'Pour into glass over ice': 'صب في كوب فوق الثلج',
      'Slowly pour grenadine to create sunset effect': 'صب الغرينادين ببطء لإنشاء تأثير غروب الشمس',
      'Top with club soda and garnish with pineapple wedge': 'أضف صودا كلوب وزين بشريحة أناناس',
      'Muddle fresh berries with honey and lemon juice': 'اهرس التوت الطازج مع العسل وعصير الليمون',
      'Add water and mix well': 'أضف الماء واخلط جيداً',
      'Serve over ice with fresh berry garnish': 'قدم فوق الثلج مع زينة توت طازج',
      'Muddle mint leaves with sugar or honey': 'اهرس أوراق النعناع مع السكر أو العسل',
      'Add lemon juice and water': 'أضف عصير الليمون والماء',
      'Serve with fresh mint garnish': 'قدم مع زينة نعناع طازج',
      'Combine gin, lime juice, and ginger syrup in a shaker': 'اجمع الجن، عصير الليمون الأخضر، وشراب الزنجبيل في شاكر',
      'Shake with ice and strain into Drinkmate': 'هز مع الثلج وصفِ في درينكميت',
      'Top with soda water and garnish with lime wheel': 'أضف ماء صودا وزين بدائرة ليمون أخضر'
    }

    return {
      ...recipe,
      title: titleTranslations[recipe.title] || recipe.title,
      category: categoryTranslations[recipe.category] || recipe.category,
      ingredients: recipe.ingredients.map((ing: string) => {
        const translated = ingredientTranslations[ing] || toArabicNumerals(ing)
        return translated
      }),
      instructions: recipe.instructions.map((inst: string) => {
        const translated = instructionTranslations[inst] || toArabicNumerals(inst)
        return translated
      }),
      time: toArabicNumerals(recipe.time),
      rating: recipe.rating,
      reviews: recipe.reviews,
      difficulty: difficultyTranslations[recipe.difficulty] || recipe.difficulty,
      tags: recipe.tags.map((tag: string) => tagTranslations[tag] || tag)
    }
  }

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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151606/Screenshot_2025-09-06_143948_ijhtye.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152674/next-level_ktxiit.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152676/signature_rb6rxf.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152676/winter_migrata_fyyvno.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152675/pear-fect_warm_ha2rm7.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152675/classic-peach-tea_dryr3g.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152967/red-white_fcsmys.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152676/signature_rb6rxf.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153192/orange-soda_jrydsp.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153192/lemon-lime_f5s32g.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153192/green-lime_wuvika.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153190/apple-cipher_xkrtz7.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153629/fruit-soda_sxrpfb.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153629/grapes_gnnfeu.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153629/grapefruit_bxlgzd.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153628/juice_spritzer_hbegny.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153628/raspberry_hklbsd.png",
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
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153628/cucumber_ptedtj.png",
      tags: ["cucumber", "sparkler", "refreshing", "light"],
    },
    {
      id: 19,
      category: "cocktails",
      url: "#",
      title: "Tropical Sunset Spritzer",
      ingredients: ["2 oz Coconut Rum", "1 oz Pineapple Juice", "1 oz Orange Juice", "1/2 oz Grenadine", "Club Soda"],
      instructions: [
        "Combine rum, pineapple juice, and orange juice in a shaker with ice",
        "Shake well and strain into Drinkmate carbonation bottle",
        "Add sparkle and pour into glass over ice",
        "Slowly pour grenadine to create sunset effect",
        "Top with club soda and garnish with pineapple wedge",
      ],
      isFeatured: false,
      difficulty: "Intermediate",
      time: "8 min",
      rating: 4.7,
      reviews: 92,
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151606/Screenshot_2025-09-06_143948_ijhtye.png",
      tags: ["tropical", "sunset", "rum", "colorful"],
    },
    {
      id: 20,
      category: "mocktails",
      url: "#",
      title: "Berry Blast Fizz",
      ingredients: ["Mixed berries (strawberries, blueberries, raspberries)", "Honey", "Lemon juice", "Water"],
      instructions: [
        "Muddle fresh berries with honey and lemon juice",
        "Add water and mix well",
        "Pour into Drinkmate and carbonate",
        "Serve over ice with fresh berry garnish",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "6 min",
      rating: 4.8,
      reviews: 134,
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153192/lemon-lime_f5s32g.png",
      tags: ["berry", "fizz", "natural", "sweet"],
    },
    {
      id: 21,
      category: "infused",
      url: "#",
      title: "Mint Lemonade Sparkler",
      ingredients: ["Fresh mint leaves", "Lemon juice", "Sugar or honey", "Water"],
      instructions: [
        "Muddle mint leaves with sugar or honey",
        "Add lemon juice and water",
        "Let infuse for 5 minutes",
        "Pour into Drinkmate and carbonate",
        "Serve with fresh mint garnish",
      ],
      isFeatured: false,
      difficulty: "Easy",
      time: "7 min",
      rating: 4.5,
      reviews: 67,
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757152676/winter_migrata_fyyvno.png",
      tags: ["mint", "lemonade", "refreshing", "herbal"],
    },
    {
      id: 22,
      category: "cocktails",
      url: "#",
      title: "Ginger Lime Fizz",
      ingredients: ["2 oz Gin", "1 oz Fresh lime juice", "1 oz Ginger syrup", "Soda water"],
      instructions: [
        "Combine gin, lime juice, and ginger syrup in a shaker",
        "Shake with ice and strain into Drinkmate",
        "Add sparkle and pour into glass",
        "Top with soda water and garnish with lime wheel",
      ],
      isFeatured: false,
      difficulty: "Intermediate",
      time: "9 min",
      rating: 4.6,
      reviews: 89,
      image: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757153629/fruit-soda_sxrpfb.png",
      tags: ["ginger", "lime", "gin", "spicy"],
    },
  ]

  // Dynamic categories based on real data
  const categories = [
    { name: "all", count: recipesData.length },
    { name: "cocktails", count: recipesData.filter((r) => r.category === "cocktails").length },
    { name: "mocktails", count: recipesData.filter((r) => r.category === "mocktails").length },
    { name: "infused", count: recipesData.filter((r) => r.category === "infused").length },
  ]

  // Use dynamic recipe rotation for the featured recipe
  const { currentRecipe: dynamicRecipe, timeUntilNext, isRotating } = useRecipeRotation(recipesData, 10)
  const rawFeaturedRecipe = dynamicRecipe || recipesData.find((recipe) => recipe.isFeatured)
  const featuredRecipe = rawFeaturedRecipe ? (language === 'AR' ? convertRecipeToArabic(rawFeaturedRecipe) : rawFeaturedRecipe) : null

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
  }).map(recipe => convertRecipeToArabic(recipe))

  const clearFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "cocktails":
        return isRTL ? "كوكتيلات" : "Cocktails"
      case "mocktails":
        return isRTL ? "مشروبات غير كحولية" : "Mocktails"
      case "infused":
        return isRTL ? "مشروبات مغمسة" : "Infused Drinks"
      default:
        return category
    }
  }

  const handleSubmitRecipe = () => {
    // Validate form
    if (!newRecipe.title.trim() || newRecipe.ingredients[0].trim() === "" || newRecipe.instructions[0].trim() === "") {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة!" : "Please fill in all required fields!")
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
    
    alert(isRTL ? "تم إرسال الوصفة بنجاح! شكراً لمشاركتك!" : "Recipe submitted successfully! Thank you for sharing!")
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
        <section className="relative py-8 md:py-16 bg-white animate-fade-in-up overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/water-366586_bd4us9.jpg"
              alt="Recipes Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center space-y-4 md:space-y-6">
              <h1
                className={`text-3xl md:text-5xl font-bold text-white leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-tight`}
              >
                {isRTL ? "وصفات المشروبات" : "Drink Recipes"}
              </h1>
              <p
                className={`text-base md:text-xl text-gray-200 max-w-3xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200 leading-relaxed`}
              >
                {isRTL ? "اكتشف وصفات المشروبات اللذيذة مع شراباتنا الممتازة." : "Discover delicious drink recipes with our premium syrups."}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Recipe Section */}
        {featuredRecipe && (
          <section className="py-16 bg-white animate-fade-in-up">
            <div className="max-w-7xl mx-auto px-4">
              <div className={`bg-white rounded-3xl p-8 shadow-lg transition-all duration-500 ${isRotating ? 'scale-105 shadow-2xl' : ''}`}>
                {/* Top Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="inline-flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4 fill-current" />
                    <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                      {isRTL ? "وصفة الأسبوع" : "Recipe of the Week"}
                    </span>
                  </div>
                  
                  <div className="inline-flex items-center space-x-2 bg-[#12d6fa] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    <Clock className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                    <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                      {isRTL ? "الوصفة التالية خلال:" : "Next recipe in:"} {formatTimeRemaining(timeUntilNext)}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="mb-8">
                  <h2
                    className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} transition-all duration-300 ${isRotating ? 'text-[#12d6fa]' : ''}`}
                  >
                    {featuredRecipe.title}
                  </h2>
                  <p
                    className={`text-gray-600 text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                  >
                    {isRTL ? "تُظهر وصفة هذا الأسبوع توازنًا مثاليًا في النكهات وهي مثالية لأي مناسبة." : "This week's featured recipe showcases the perfect balance of flavors and is perfect for any occasion."}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                  <div className="space-y-8">
                    {/* Recipe Details */}
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#12d6fa]/10 rounded-full flex items-center justify-center mb-3">
                          <Clock className="w-6 h-6 text-[#12d6fa]" />
                        </div>
                        <p className={`text-sm text-gray-600 mb-1 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {isRTL ? "وقت التحضير" : "Prep Time"}
                        </p>
                        <p className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>{featuredRecipe.time}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#12d6fa]/10 rounded-full flex items-center justify-center mb-3">
                          <Utensils className="w-6 h-6 text-[#12d6fa]" />
                        </div>
                        <p className={`text-sm text-gray-600 mb-1 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {isRTL ? "الصعوبة" : "Difficulty"}
                        </p>
                        <p className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>{featuredRecipe.difficulty}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#12d6fa]/10 rounded-full flex items-center justify-center mb-3">
                          <Heart className="w-6 h-6 text-[#12d6fa]" />
                        </div>
                        <p className={`text-sm text-gray-600 mb-1 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {isRTL ? "الوجبات" : "Servings"}
                        </p>
                        <p className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                          {language === 'AR' ? toArabicNumerals("1-2") : "1-2"}
                        </p>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h3
                        className={`text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                      >
                        {isRTL ? "المكونات" : "Ingredients"}
                      </h3>
                      <ul className="space-y-3">
                        {featuredRecipe.ingredients.map((ingredient: string, index: number) => (
                          <li key={index} className={`text-gray-700 text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3
                        className={`text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                      >
                        {isRTL ? "التعليمات" : "Instructions"}
                      </h3>
                      <div className="space-y-3">
                        {Array.isArray(featuredRecipe.instructions) ? (
                          featuredRecipe.instructions.map((instruction: string, index: number) => (
                            <p key={index} className={`text-gray-700 text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {instruction}
                            </p>
                          ))
                        ) : (
                          <p className={`text-gray-700 text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            {featuredRecipe.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
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
                        className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-8 py-3 rounded-lg font-semibold"
                      >
                        <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                          {isRTL ? "مشاركة" : "Share"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Recipe Image */}
                  <div className="relative">
                    <div className="relative bg-pink-50 h-96 flex items-center justify-center overflow-hidden rounded-2xl">
                      <Image
                        src={featuredRecipe.image || "/placeholder.svg"}
                        alt={featuredRecipe.title}
                        width={500}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
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
                    <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                      {category.name === "all" ? (isRTL ? "الكل" : "All") : getCategoryDisplayName(category.name)}
                    </span>
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
                  <div className="relative bg-gray-100 h-48 md:h-64 overflow-hidden rounded-t-3xl">
                    <Image
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                        <span className={`text-sm font-semibold text-gray-800 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                          {language === 'AR' ? toArabicNumerals(recipe.rating.toString()) : recipe.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Details */}
                  <div className="p-6 space-y-4">
                    <h3 className={`text-xl font-semibold text-black leading-tight ${isRTL ? "font-cairo" : "font-montserrat"}`}>{recipe.title}</h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag: string, index: number) => (
                        <span key={index} className={`bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Quick Info */}
                    <div className={`flex items-center justify-between text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                        <span>
                        {language === 'AR' ? toArabicNumerals(recipe.reviews.toString()) : recipe.reviews} {isRTL ? "تقييم" : "reviews"}
                      </span>
                      <span>
                        {language === 'AR' ? toArabicNumerals(recipe.ingredients.length.toString()) : recipe.ingredients.length} {isRTL ? "مكون" : "ingredients"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => toggleRecipeDetails(recipe.id)}
                        className="flex-1 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                      >
                        <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                          {expandedRecipes.has(recipe.id) ? (isRTL ? "إخفاء التفاصيل" : "Hide Details") : (isRTL ? "عرض التفاصيل" : "Show Details")}
                        </span>
                      </Button>
                    </div>

                    {expandedRecipes.has(recipe.id) && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <div className="space-y-4">
                          {/* Ingredients */}
                          <div>
                            <h4 className={`font-semibold text-gray-800 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                              {isRTL ? "المكونات:" : "Ingredients:"}
                            </h4>
                            <ul className={`list-disc list-inside space-y-1 text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {recipe.ingredients.map((ingredient: string, index: number) => (
                                <li key={index}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Instructions */}
                          <div>
                            <h4 className={`font-semibold text-gray-800 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                              {isRTL ? "التعليمات:" : "Instructions:"}
                            </h4>
                            <ol className={`list-decimal list-inside space-y-1 text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                              {recipe.instructions.map((instruction: string, index: number) => (
                                <li key={index}>{instruction}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Difficulty & Time */}
                          <div className={`flex items-center gap-4 text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                            <span>{isRTL ? "الصعوبة:" : "Difficulty:"} {recipe.difficulty}</span>
                            <span>{isRTL ? "الوقت:" : "Time:"} {recipe.time}</span>
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
                {isRTL ? "نصائح سريعة للوصفات" : "Quick Recipe Tips"}
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                {isRTL ? "أتقن فن المشروبات المتلألئة المثالية مع هذه النصائح الأساسية" : "Master the art of perfect sparkling drinks with these essential tips"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#12d6fa]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {isRTL ? "التوقيت المثالي" : "Perfect Timing"}
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {isRTL ? "أكربن الماء أولاً، ثم أضف الشراب والنكهات. هذا يمنع الفيضان ويضمن طعمًا متسقًا." : "Carbonate water first, then add syrups and flavors. This prevents overflow and ensures consistent taste."}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#a8f387]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#a8f387] to-[#9ae374] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {isRTL ? "التحكم في درجة الحرارة" : "Temperature Control"}
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {isRTL ? "استخدم الماء البارد والمكونات. السوائل الباردة تحتفظ بالتكربنة بشكل أفضل وتكون أكثر انتعاشًا." : "Use chilled water and ingredients. Cold liquids hold carbonation better and taste more refreshing."}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#12d6fa]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {isRTL ? "توازن النكهة" : "Flavor Balance"}
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {isRTL ? "ابدأ بكمية أقل من الشراب وقم بالتعديل حسب الذوق. يمكنك دائمًا إضافة المزيد، لكن لا يمكنك إزالته." : "Start with less syrup and adjust to taste. You can always add more, but you can't take it away."}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#a8f387]/20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#a8f387] to-[#9ae374] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold text-black mb-3 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {isRTL ? "الزينة الطازجة" : "Fresh Garnishes"}
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                  {isRTL ? "أضف الفواكه الطازجة أو الأعشاب أو قشر الحمضيات بعد التكربنة لتعزيز النكهة والمظهر البصري." : "Add fresh fruits, herbs, or citrus zest after carbonation for enhanced flavor and visual appeal."}
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
                {isRTL ? "وصفات المجتمع" : "Community Recipes"}
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                {isRTL ? "وصفات رائعة شاركها مجتمعنا" : "Amazing recipes shared by our community"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {recipesData
                .filter(recipe => recipe.rating >= 4.8)
                .slice(0, 2)
                .map((recipe, index) => {
                  const convertedRecipe = language === 'AR' ? convertRecipeToArabic(recipe) : recipe;
                  return (
                  <div key={convertedRecipe.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                        {convertedRecipe.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className={`text-sm text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                          {language === 'AR' ? toArabicNumerals(convertedRecipe.rating.toString()) : convertedRecipe.rating}
                        </span>
                      </div>
                    </div>
                    <p className={`text-gray-600 mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                      {convertedRecipe.ingredients.slice(0, 3).join(", ")} {isRTL ? "بنكهة منعشة" : "with a refreshing twist"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm text-gray-500 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                        {isRTL ? "بواسطة" : "by"} {convertedRecipe.category === "cocktails" ? (isRTL ? "خبير كوكتيلات" : "Mixologist") : convertedRecipe.category === "mocktails" ? (isRTL ? "نادل" : "Bartender") : (isRTL ? "طباخ" : "Chef")} {convertedRecipe.id % 2 === 0 ? (isRTL ? "سارة م." : "Sarah M.") : (isRTL ? "أحمد ك." : "Ahmed K.")}
                      </span>
                      <span
                        className={`text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      >
                        {isRTL ? "موثق" : "Verified"}
                      </span>
                    </div>
                  </div>
                  );
                })}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="bg-[#12d6fa] hover:bg-[#0fb8e6] text-white font-medium py-3 px-8 rounded-lg"
              >
                <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                  {isRTL ? "أرسل وصفتك" : "Submit Your Recipe"}
                </span>
              </Button>
            </div>
          </div>
        </section>

        {/* Nutritional Information Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                {isRTL ? "المعلومات الغذائية" : "Nutritional Information"}
              </h2>
              <p className={`text-xl text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
                {isRTL ? "تعرف على الفوائد الصحية والمحتوى الغذائي لمشروباتنا" : "Learn about the health benefits and nutritional content of our drinks"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {isRTL ? "محتوى السعرات الحرارية" : "Calorie Content"}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span
                      className={`text-sm md:text-base text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "ماء متلألئ عادي" : "Plain Sparkling Water"}
                    </span>
                    <span className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? toArabicNumerals("0") : "0"} {isRTL ? "سعرة حرارية" : "calories"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm md:text-base text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "مع شراب طبيعي" : "With Natural Syrup"}
                    </span>
                    <span className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? toArabicNumerals("15-25") : "15-25"} {isRTL ? "سعرة حرارية" : "calories"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-sm md:text-base text-gray-600 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "خليط شراب ممتاز" : "Premium Syrup Mix"}
                    </span>
                    <span className={`font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? toArabicNumerals("30-45") : "30-45"} {isRTL ? "سعرة حرارية" : "calories"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {isRTL ? "الفوائد الصحية" : "Health Benefits"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "ترطيب بدون إضافة سكريات" : "Hydration without added sugars"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "نكهات طبيعية من مكونات حقيقية" : "Natural flavors from real ingredients"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#a8f387] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "بديل منخفض السعرات الحرارية للصودا" : "Low-calorie alternative to sodas"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {isRTL ? "معلومات الحساسية" : "Allergen Information"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "جميع الشرابات خالية من الغلوتين" : "All syrups are gluten-free"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "مصنوعة من مكونات طبيعية" : "Made with natural ingredients"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      className={`text-sm md:text-base text-gray-700 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                    >
                      {isRTL ? "لا تحتوي على مواد حافظة صناعية" : "No artificial preservatives"}
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
                    {isRTL ? "أرسل وصفتك" : "Submit Your Recipe"}
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
                      {isRTL ? "عنوان الوصفة *" : "Recipe Title *"}
                    </label>
                    <input
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      placeholder={isRTL ? "أدخل عنوان الوصفة" : "Enter recipe title"}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? "الفئة *" : "Category *"}
                    </label>
                    <select
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                      aria-label={isRTL ? "اختر الفئة" : "Select category"}
                    >
                      <option value="cocktails">{isRTL ? "كوكتيلات" : "Cocktails"}</option>
                      <option value="mocktails">{isRTL ? "مشروبات غير كحولية" : "Mocktails"}</option>
                      <option value="infused">{isRTL ? "مشروبات مغمسة" : "Infused Drinks"}</option>
                    </select>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? "المكونات *" : "Ingredients *"}
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
                          placeholder={isRTL ? `المكون ${index + 1}` : `Ingredient ${index + 1}`}
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
                      {isRTL ? "+ أضف مكوناً" : "+ Add Ingredient"}
                    </button>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? "التعليمات *" : "Instructions *"}
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
                          placeholder={isRTL ? `الخطوة ${index + 1}` : `Step ${index + 1}`}
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
                      {isRTL ? "+ أضف خطوة" : "+ Add Step"}
                    </button>
                  </div>

                  {/* Difficulty & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                        {isRTL ? "الصعوبة" : "Difficulty"}
                      </label>
                      <select
                        value={newRecipe.difficulty}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, difficulty: e.target.value }))}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                        aria-label={isRTL ? "اختر مستوى الصعوبة" : "Select difficulty level"}
                      >
                        <option value="Easy">{isRTL ? "سهل" : "Easy"}</option>
                        <option value="Intermediate">{isRTL ? "متوسط" : "Intermediate"}</option>
                        <option value="Advanced">{isRTL ? "متقدم" : "Advanced"}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                        {isRTL ? "الوقت" : "Time"}
                      </label>
                      <input
                        type="text"
                        value={newRecipe.time}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, time: e.target.value }))}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                        placeholder={isRTL ? "مثال: ١٠ دقيقة" : "e.g., 10 min"}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                      {isRTL ? "العلامات" : "Tags"}
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
                          placeholder={isRTL ? "مثال: منعش، صيفي" : "e.g., refreshing, summer"}
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
                      {isRTL ? "+ أضف علامة" : "+ Add Tag"}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-[#12d6fa] hover:bg-[#0bc4e8] text-white"
                    >
                      <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                        {isRTL ? "إرسال الوصفة" : "Submit Recipe"}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      <span className={isRTL ? "font-cairo" : "font-montserrat"}>
                        {isRTL ? "إلغاء" : "Cancel"}
                      </span>
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
