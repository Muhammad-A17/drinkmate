const mongoose = require('mongoose');
const Recipe = require('../Models/recipe-model');
const User = require('../Models/user-model');
require('dotenv').config({ path: './.env' });

const sampleRecipes = [
  {
    title: "Classic Strawberry Lemonade",
    slug: "classic-strawberry-lemonade",
    description: "A refreshing and tangy strawberry lemonade perfect for hot summer days. Made with fresh strawberries and real lemon juice.",
    ingredients: [
      { name: "Fresh strawberries", amount: "1 cup", unit: "chopped" },
      { name: "Fresh lemon juice", amount: "1/2 cup", unit: "" },
      { name: "Sugar", amount: "1/2 cup", unit: "" },
      { name: "Water", amount: "3 cups", unit: "" },
      { name: "Ice cubes", amount: "1 cup", unit: "" }
    ],
    instructions: [
      {
        step: 1,
        instruction: "In a blender, combine strawberries and 1/4 cup water. Blend until smooth."
      },
      {
        step: 2,
        instruction: "Strain the strawberry puree through a fine mesh sieve to remove seeds."
      },
      {
        step: 3,
        instruction: "In a large pitcher, combine strawberry puree, lemon juice, sugar, and remaining water."
      },
      {
        step: 4,
        instruction: "Stir until sugar is completely dissolved."
      },
      {
        step: 5,
        instruction: "Add ice cubes and serve immediately. Garnish with fresh strawberry slices."
      }
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: "Easy",
    category: "Fruity",
    tags: ["strawberry", "lemonade", "refreshing", "summer", "non-alcoholic"],
    images: [
      {
        url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/strawberry-lemonade.jpg",
        alt: "Classic Strawberry Lemonade",
        isPrimary: true
      }
    ],
    featured: true,
    published: true,
    nutrition: {
      calories: 120,
      protein: 1,
      carbs: 30,
      fat: 0,
      sugar: 28,
      fiber: 2
    },
    equipment: ["Blender", "Fine mesh sieve", "Large pitcher"],
    tips: [
      "Use fresh, ripe strawberries for the best flavor",
      "Adjust sugar amount based on sweetness of strawberries",
      "Serve immediately for best taste and texture"
    ],
    seo: {
      metaTitle: "Classic Strawberry Lemonade Recipe | Drinkmate",
      metaDescription: "Learn how to make the perfect strawberry lemonade with fresh ingredients. Easy recipe with step-by-step instructions.",
      keywords: ["strawberry lemonade", "lemonade recipe", "summer drinks", "refreshing drinks"]
    }
  },
  {
    title: "Lime Mojito Mocktail",
    slug: "lime-mojito-mocktail",
    description: "A refreshing non-alcoholic version of the classic mojito with fresh lime, mint, and sparkling water.",
    ingredients: [
      { name: "Fresh lime juice", amount: "1/4 cup", unit: "" },
      { name: "Fresh mint leaves", amount: "10-12", unit: "leaves" },
      { name: "Sugar", amount: "2 tablespoons", unit: "" },
      { name: "Sparkling water", amount: "1 cup", unit: "" },
      { name: "Lime slices", amount: "2", unit: "for garnish" },
      { name: "Ice cubes", amount: "1 cup", unit: "" }
    ],
    instructions: [
      {
        step: 1,
        instruction: "In a glass, muddle mint leaves with sugar and lime juice."
      },
      {
        step: 2,
        instruction: "Add ice cubes to the glass."
      },
      {
        step: 3,
        instruction: "Top with sparkling water and stir gently."
      },
      {
        step: 4,
        instruction: "Garnish with lime slices and additional mint leaves."
      },
      {
        step: 5,
        instruction: "Serve immediately while cold and bubbly."
      }
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: "Easy",
    category: "Refreshing",
    tags: ["lime", "mint", "mocktail", "sparkling", "refreshing"],
    images: [
      {
        url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/lime-mojito.jpg",
        alt: "Lime Mojito Mocktail",
        isPrimary: true
      }
    ],
    featured: true,
    published: true,
    nutrition: {
      calories: 80,
      protein: 0,
      carbs: 20,
      fat: 0,
      sugar: 18,
      fiber: 1
    },
    equipment: ["Muddler", "Highball glass"],
    tips: [
      "Muddle gently to release mint oils without tearing leaves",
      "Use fresh mint for the best aroma",
      "Serve immediately to maintain carbonation"
    ],
    seo: {
      metaTitle: "Lime Mojito Mocktail Recipe | Drinkmate",
      metaDescription: "Create a refreshing lime mojito mocktail with fresh mint and sparkling water. Perfect non-alcoholic summer drink.",
      keywords: ["lime mojito", "mocktail", "mint drink", "sparkling water", "non-alcoholic"]
    }
  },
  {
    title: "Grapefruit Juice Spritzer",
    slug: "grapefruit-juice-spritzer",
    description: "A light and refreshing grapefruit juice spritzer with a hint of sweetness and sparkling water.",
    ingredients: [
      { name: "Fresh grapefruit juice", amount: "1 cup", unit: "" },
      { name: "Sparkling water", amount: "1 cup", unit: "" },
      { name: "Honey", amount: "1 tablespoon", unit: "" },
      { name: "Fresh rosemary", amount: "1 sprig", unit: "" },
      { name: "Grapefruit slices", amount: "2", unit: "for garnish" },
      { name: "Ice cubes", amount: "1 cup", unit: "" }
    ],
    instructions: [
      {
        step: 1,
        instruction: "In a pitcher, mix grapefruit juice with honey until honey dissolves."
      },
      {
        step: 2,
        instruction: "Add ice cubes to serving glasses."
      },
      {
        step: 3,
        instruction: "Pour grapefruit mixture over ice, filling glasses halfway."
      },
      {
        step: 4,
        instruction: "Top with sparkling water."
      },
      {
        step: 5,
        instruction: "Garnish with grapefruit slices and rosemary sprig."
      }
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",
    category: "Refreshing",
    tags: ["grapefruit", "spritzer", "sparkling", "refreshing", "citrus"],
    images: [
      {
        url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/grapefruit-juice.jpg",
        alt: "Grapefruit Juice Spritzer",
        isPrimary: true
      }
    ],
    featured: false,
    published: true,
    nutrition: {
      calories: 90,
      protein: 1,
      carbs: 22,
      fat: 0,
      sugar: 20,
      fiber: 1
    },
    equipment: ["Pitcher", "Serving glasses"],
    tips: [
      "Use fresh grapefruit juice for the best flavor",
      "Adjust honey amount based on grapefruit sweetness",
      "Serve immediately to maintain carbonation"
    ],
    seo: {
      metaTitle: "Grapefruit Juice Spritzer Recipe | Drinkmate",
      metaDescription: "Make a refreshing grapefruit juice spritzer with sparkling water and fresh herbs. Light and healthy drink option.",
      keywords: ["grapefruit spritzer", "citrus drink", "sparkling water", "healthy drinks", "refreshing"]
    }
  },
  {
    title: "Blue Raspberry Slushie",
    slug: "blue-raspberry-slushie",
    description: "A vibrant and sweet blue raspberry slushie that's perfect for kids and adults alike. Made with real fruit and ice.",
    ingredients: [
      { name: "Frozen blueberries", amount: "1 cup", unit: "" },
      { name: "Raspberry syrup", amount: "1/4 cup", unit: "" },
      { name: "Sugar", amount: "2 tablespoons", unit: "" },
      { name: "Water", amount: "1/2 cup", unit: "" },
      { name: "Ice cubes", amount: "2 cups", unit: "" },
      { name: "Fresh blueberries", amount: "1/4 cup", unit: "for garnish" }
    ],
    instructions: [
      {
        step: 1,
        instruction: "In a blender, combine frozen blueberries, raspberry syrup, sugar, and water."
      },
      {
        step: 2,
        instruction: "Add ice cubes and blend until smooth and slushy consistency."
      },
      {
        step: 3,
        instruction: "Taste and adjust sweetness if needed."
      },
      {
        step: 4,
        instruction: "Pour into serving glasses."
      },
      {
        step: 5,
        instruction: "Garnish with fresh blueberries and serve immediately."
      }
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",
    category: "Fruity",
    tags: ["blueberry", "raspberry", "slushie", "frozen", "sweet"],
    images: [
      {
        url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/blue-raspberry.jpg",
        alt: "Blue Raspberry Slushie",
        isPrimary: true
      }
    ],
    featured: true,
    published: true,
    nutrition: {
      calories: 150,
      protein: 1,
      carbs: 38,
      fat: 0,
      sugar: 35,
      fiber: 3
    },
    equipment: ["Blender", "Serving glasses"],
    tips: [
      "Use frozen blueberries for the best slushie texture",
      "Blend in short pulses to achieve the right consistency",
      "Serve immediately to maintain slushie texture"
    ],
    seo: {
      metaTitle: "Blue Raspberry Slushie Recipe | Drinkmate",
      metaDescription: "Create a delicious blue raspberry slushie with frozen fruit and ice. Perfect summer treat for all ages.",
      keywords: ["blue raspberry slushie", "frozen drinks", "blueberry", "summer treats", "slushie recipe"]
    }
  },
  {
    title: "Orange Creamsicle Float",
    slug: "orange-creamsicle-float",
    description: "A creamy and dreamy orange creamsicle float that combines the best of orange and vanilla flavors.",
    ingredients: [
      { name: "Orange juice", amount: "1 cup", unit: "" },
      { name: "Vanilla ice cream", amount: "2 scoops", unit: "" },
      { name: "Orange soda", amount: "1/2 cup", unit: "" },
      { name: "Whipped cream", amount: "2 tablespoons", unit: "" },
      { name: "Orange slice", amount: "1", unit: "for garnish" },
      { name: "Maraschino cherry", amount: "1", unit: "for garnish" }
    ],
    instructions: [
      {
        step: 1,
        instruction: "Pour orange juice into a tall glass."
      },
      {
        step: 2,
        instruction: "Add vanilla ice cream scoops to the glass."
      },
      {
        step: 3,
        instruction: "Slowly pour orange soda over the ice cream."
      },
      {
        step: 4,
        instruction: "Top with whipped cream."
      },
      {
        step: 5,
        instruction: "Garnish with orange slice and cherry. Serve immediately."
      }
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: "Easy",
    category: "Creamy",
    tags: ["orange", "vanilla", "float", "ice cream", "creamy"],
    images: [
      {
        url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/orange-creamsicle.jpg",
        alt: "Orange Creamsicle Float",
        isPrimary: true
      }
    ],
    featured: false,
    published: true,
    nutrition: {
      calories: 280,
      protein: 4,
      carbs: 45,
      fat: 10,
      sugar: 40,
      fiber: 1
    },
    equipment: ["Tall glass", "Ice cream scoop"],
    tips: [
      "Use high-quality vanilla ice cream for best results",
      "Pour soda slowly to prevent overflow",
      "Serve immediately to prevent melting"
    ],
    seo: {
      metaTitle: "Orange Creamsicle Float Recipe | Drinkmate",
      metaDescription: "Make a delicious orange creamsicle float with vanilla ice cream and orange soda. Perfect dessert drink.",
      keywords: ["orange creamsicle", "float", "ice cream drink", "vanilla", "dessert drink"]
    }
  },
  {
    title: "Grape Soda Fizz",
    slug: "grape-soda-fizz",
    description: "A bubbly and refreshing grape soda made with real grape juice and sparkling water.",
    ingredients: [
      { name: "Grape juice", amount: "1 cup", unit: "" },
      { name: "Sparkling water", amount: "1 cup", unit: "" },
      { name: "Lime juice", amount: "1 tablespoon", unit: "" },
      { name: "Sugar", amount: "1 tablespoon", unit: "" },
      { name: "Grape slices", amount: "2", unit: "for garnish" },
      { name: "Ice cubes", amount: "1 cup", unit: "" }
    ],
    instructions: [
      {
        step: 1,
        instruction: "In a pitcher, mix grape juice with lime juice and sugar."
      },
      {
        step: 2,
        instruction: "Stir until sugar dissolves completely."
      },
      {
        step: 3,
        instruction: "Add ice cubes to serving glasses."
      },
      {
        step: 4,
        instruction: "Pour grape mixture over ice, filling glasses halfway."
      },
      {
        step: 5,
        instruction: "Top with sparkling water and garnish with grape slices."
      }
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",
    category: "Fruity",
    tags: ["grape", "soda", "sparkling", "fizzy", "refreshing"],
    images: [
      {
        url: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151071/grape-soda.jpg",
        alt: "Grape Soda Fizz",
        isPrimary: true
      }
    ],
    featured: false,
    published: true,
    nutrition: {
      calories: 100,
      protein: 0,
      carbs: 25,
      fat: 0,
      sugar: 23,
      fiber: 0
    },
    equipment: ["Pitcher", "Serving glasses"],
    tips: [
      "Use 100% grape juice for the best flavor",
      "Add lime juice to balance sweetness",
      "Serve immediately to maintain fizz"
    ],
    seo: {
      metaTitle: "Grape Soda Fizz Recipe | Drinkmate",
      metaDescription: "Create a refreshing grape soda fizz with real grape juice and sparkling water. Easy homemade soda recipe.",
      keywords: ["grape soda", "homemade soda", "grape juice", "sparkling water", "fizzy drinks"]
    }
  }
];

async function seedRecipes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user to assign as author, or create a default one
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating a default admin user for recipes...');
      try {
        adminUser = new User({
          username: 'recipe-admin',
          email: 'admin@drinkmate.com',
          password: 'admin123', // Default password for seeding
          firstName: 'Recipe',
          lastName: 'Admin',
          role: 'admin',
          isAdmin: true
        });
        await adminUser.save();
        console.log('✅ Created default admin user for recipes');
      } catch (error) {
        if (error.code === 11000) {
          console.log('⚠️  Admin user already exists, using existing user...');
          adminUser = await User.findOne({ email: 'admin@drinkmate.com' });
        } else {
          throw error;
        }
      }
    }

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('🗑️  Cleared existing recipes');

    // Add admin user ID to all recipes
    const recipesWithAuthor = sampleRecipes.map(recipe => ({
      ...recipe,
      author: adminUser._id
    }));

    // Insert sample recipes
    const createdRecipes = await Recipe.insertMany(recipesWithAuthor);
    console.log(`✅ Successfully seeded ${createdRecipes.length} recipes`);

    // Display summary
    console.log('\n📊 Recipe Summary:');
    console.log(`- Total recipes: ${createdRecipes.length}`);
    console.log(`- Featured recipes: ${createdRecipes.filter(r => r.featured).length}`);
    console.log(`- Published recipes: ${createdRecipes.filter(r => r.published).length}`);
    
    const categories = [...new Set(createdRecipes.map(r => r.category))];
    console.log(`- Categories: ${categories.join(', ')}`);

    console.log('\n🎉 Recipe seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding recipes:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedRecipes();
