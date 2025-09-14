const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drinkmate';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get the User and Recipe models
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      firstName: String,
      lastName: String
    }, { timestamps: true }), 'users');
    
    const Recipe = mongoose.model('Recipe', new mongoose.Schema({
      title: String,
      slug: String,
      description: String,
      ingredients: [{
        name: String,
        amount: String,
        unit: String
      }],
      instructions: [{
        step: Number,
        instruction: String
      }],
      prepTime: Number,
      cookTime: Number,
      servings: Number,
      difficulty: String,
      category: String,
      tags: [String],
      images: [{
        url: String,
        alt: String,
        isPrimary: Boolean
      }],
      featured: Boolean,
      published: Boolean,
      author: mongoose.Schema.Types.ObjectId,
      views: Number,
      likes: Number,
      rating: {
        average: Number,
        count: Number
      },
      nutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        sugar: Number,
        fiber: Number
      },
      equipment: [String],
      tips: [String],
      variations: [{
        title: String,
        description: String,
        modifications: [String]
      }],
      relatedRecipes: [mongoose.Schema.Types.ObjectId],
      seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
      }
    }, { timestamps: true }), 'recipes');
    
    // Find or create a default author
    let author = await User.findOne({ username: 'admin' });
    if (!author) {
      author = await User.findOne();
      if (!author) {
        author = new User({
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User'
        });
        await author.save();
        console.log('Created default author');
      }
    }
    
    const now = new Date();
    
    // Sample recipes that will show up in the storefront
    const recipes = [
      {
        title: 'DrinkMate Diet Fizzy Grapefruit Juice',
        slug: 'drinkmate-diet-fizzy-grapefruit-juice',
        description: 'Perfect balance of flavors with a refreshing grapefruit twist. This low-calorie drink is perfect for those watching their sugar intake while still enjoying a delicious sparkling beverage.',
        ingredients: [
          { name: 'Fresh grapefruit juice', amount: '1', unit: 'cup' },
          { name: 'Cold water', amount: '1', unit: 'cup' },
          { name: 'Stevia or sweetener', amount: '1', unit: 'tsp' },
          { name: 'Fresh mint leaves', amount: '4-5', unit: 'leaves' },
          { name: 'Ice cubes', amount: '1', unit: 'cup' }
        ],
        instructions: [
          { step: 1, instruction: 'Pour fresh grapefruit juice into your DrinkMate bottle' },
          { step: 2, instruction: 'Add cold water and sweetener, mix well' },
          { step: 3, instruction: 'Add fresh mint leaves for extra freshness' },
          { step: 4, instruction: 'Carbonate using your DrinkMate machine' },
          { step: 5, instruction: 'Pour over ice and enjoy immediately' }
        ],
        prepTime: 3,
        cookTime: 0,
        servings: 2,
        difficulty: 'Easy',
        category: 'Refreshing',
        tags: ['refreshing', 'low-calorie', 'citrus', 'diet', 'healthy'],
        images: [{
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
          alt: 'DrinkMate Diet Fizzy Grapefruit Juice',
          isPrimary: true
        }],
        featured: true,
        published: true,
        author: author._id,
        views: 1250,
        likes: 89,
        rating: { average: 4.8, count: 23 },
        nutrition: {
          calories: 45,
          protein: 1.2,
          carbs: 11,
          fat: 0.1,
          sugar: 8,
          fiber: 2.1
        },
        equipment: ['DrinkMate machine', 'Measuring cup', 'Spoon'],
        tips: [
          'Use fresh grapefruit juice for best flavor',
          'Adjust sweetness to your preference',
          'Serve immediately after carbonation for maximum fizz'
        ],
        seo: {
          metaTitle: 'DrinkMate Diet Fizzy Grapefruit Juice Recipe',
          metaDescription: 'Learn how to make a refreshing low-calorie grapefruit sparkling drink with your DrinkMate machine.',
          keywords: ['grapefruit', 'diet', 'sparkling', 'low calorie', 'healthy drinks']
        }
      },
      {
        title: 'Italian Strawberry Lemonade',
        slug: 'italian-strawberry-lemonade',
        description: 'Classic Italian strawberry lemonade with a sparkling twist. This fruity and refreshing drink combines the sweetness of strawberries with the tartness of fresh lemons.',
        ingredients: [
          { name: 'Fresh strawberries', amount: '1', unit: 'cup' },
          { name: 'Fresh lemon juice', amount: '1/2', unit: 'cup' },
          { name: 'Simple syrup', amount: '1/4', unit: 'cup' },
          { name: 'Cold water', amount: '1', unit: 'cup' },
          { name: 'Ice cubes', amount: '1', unit: 'cup' }
        ],
        instructions: [
          { step: 1, instruction: 'Mash fresh strawberries in a bowl' },
          { step: 2, instruction: 'Mix strawberry puree with lemon juice and simple syrup' },
          { step: 3, instruction: 'Add cold water and stir well' },
          { step: 4, instruction: 'Carbonate using your DrinkMate machine' },
          { step: 5, instruction: 'Strain and serve over ice' }
        ],
        prepTime: 5,
        cookTime: 0,
        servings: 4,
        difficulty: 'Easy',
        category: 'Fruity',
        tags: ['fruity', 'summer', 'refreshing', 'italian', 'strawberry'],
        images: [{
          url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
          alt: 'Italian Strawberry Lemonade',
          isPrimary: true
        }],
        featured: false,
        published: true,
        author: author._id,
        views: 890,
        likes: 67,
        rating: { average: 4.6, count: 18 },
        nutrition: {
          calories: 85,
          protein: 0.8,
          carbs: 22,
          fat: 0.2,
          sugar: 19,
          fiber: 1.5
        },
        equipment: ['DrinkMate machine', 'Mixing bowl', 'Strainer', 'Spoon'],
        tips: [
          'Use ripe strawberries for best flavor',
          'Adjust sweetness with more or less simple syrup',
          'Garnish with fresh strawberry slices'
        ],
        seo: {
          metaTitle: 'Italian Strawberry Lemonade Recipe with DrinkMate',
          metaDescription: 'Make authentic Italian strawberry lemonade with a sparkling twist using your DrinkMate machine.',
          keywords: ['strawberry lemonade', 'italian', 'fruity', 'sparkling', 'summer drinks']
        }
      },
      {
        title: 'Blue Raspberry Blast',
        slug: 'blue-raspberry-blast',
        description: 'A burst of blue raspberry flavor that\'s both sweet and refreshing. This vibrant drink is perfect for kids and adults alike, with its eye-catching blue color and delicious taste.',
        ingredients: [
          { name: 'Blue raspberry syrup', amount: '2', unit: 'tbsp' },
          { name: 'Cold water', amount: '1', unit: 'cup' },
          { name: 'Lemon juice', amount: '1', unit: 'tbsp' },
          { name: 'Ice cubes', amount: '1', unit: 'cup' },
          { name: 'Blue food coloring', amount: '2-3', unit: 'drops' }
        ],
        instructions: [
          { step: 1, instruction: 'Mix blue raspberry syrup with cold water' },
          { step: 2, instruction: 'Add lemon juice for a slight tartness' },
          { step: 3, instruction: 'Add a few drops of blue food coloring for vibrant color' },
          { step: 4, instruction: 'Carbonate using your DrinkMate machine' },
          { step: 5, instruction: 'Serve over ice and enjoy the blast of flavor' }
        ],
        prepTime: 4,
        cookTime: 0,
        servings: 2,
        difficulty: 'Easy',
        category: 'Fruity',
        tags: ['berry', 'blue', 'sweet', 'colorful', 'kids-friendly'],
        images: [{
          url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
          alt: 'Blue Raspberry Blast',
          isPrimary: true
        }],
        featured: false,
        published: true,
        author: author._id,
        views: 650,
        likes: 45,
        rating: { average: 4.7, count: 15 },
        nutrition: {
          calories: 95,
          protein: 0.1,
          carbs: 24,
          fat: 0,
          sugar: 22,
          fiber: 0.2
        },
        equipment: ['DrinkMate machine', 'Measuring spoons', 'Spoon'],
        tips: [
          'Use high-quality blue raspberry syrup',
          'Adjust sweetness to taste',
          'Add more food coloring for deeper blue color'
        ],
        seo: {
          metaTitle: 'Blue Raspberry Blast Recipe - DrinkMate',
          metaDescription: 'Create a vibrant blue raspberry sparkling drink with your DrinkMate machine.',
          keywords: ['blue raspberry', 'colorful drinks', 'fruity', 'sparkling', 'kids drinks']
        }
      },
      {
        title: 'Lime Mojito Sparkle',
        slug: 'lime-mojito-sparkle',
        description: 'A sparkling twist on the classic mojito with fresh lime and mint. This refreshing mocktail is perfect for summer gatherings and adds a sophisticated touch to any occasion.',
        ingredients: [
          { name: 'Fresh lime juice', amount: '1/2', unit: 'cup' },
          { name: 'Fresh mint leaves', amount: '10-12', unit: 'leaves' },
          { name: 'Simple syrup', amount: '1/4', unit: 'cup' },
          { name: 'Cold water', amount: '1', unit: 'cup' },
          { name: 'Ice cubes', amount: '1', unit: 'cup' }
        ],
        instructions: [
          { step: 1, instruction: 'Muddle fresh mint leaves in the bottom of your DrinkMate bottle' },
          { step: 2, instruction: 'Add fresh lime juice and simple syrup' },
          { step: 3, instruction: 'Add cold water and mix well' },
          { step: 4, instruction: 'Carbonate using your DrinkMate machine' },
          { step: 5, instruction: 'Strain into glasses over ice and garnish with mint' }
        ],
        prepTime: 6,
        cookTime: 0,
        servings: 2,
        difficulty: 'Medium',
        category: 'Refreshing',
        tags: ['citrus', 'mint', 'refreshing', 'mocktail', 'sophisticated'],
        images: [{
          url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
          alt: 'Lime Mojito Sparkle',
          isPrimary: true
        }],
        featured: true,
        published: true,
        author: author._id,
        views: 1100,
        likes: 78,
        rating: { average: 4.9, count: 21 },
        nutrition: {
          calories: 65,
          protein: 0.3,
          carbs: 17,
          fat: 0.1,
          sugar: 15,
          fiber: 0.5
        },
        equipment: ['DrinkMate machine', 'Muddler', 'Strainer', 'Spoon'],
        tips: [
          'Use fresh mint for best flavor',
          'Muddle gently to release oils without tearing leaves',
          'Serve immediately for maximum freshness'
        ],
        seo: {
          metaTitle: 'Lime Mojito Sparkle Mocktail Recipe',
          metaDescription: 'Learn to make a refreshing sparkling mojito mocktail with your DrinkMate machine.',
          keywords: ['mojito', 'lime', 'mint', 'mocktail', 'sparkling', 'refreshing']
        }
      },
      {
        title: 'Orange Creamsicle Delight',
        slug: 'orange-creamsicle-delight',
        description: 'Creamy orange delight that tastes just like the classic ice cream treat. This nostalgic drink combines the sweetness of orange with the creaminess of vanilla for a perfect dessert beverage.',
        ingredients: [
          { name: 'Orange juice', amount: '1', unit: 'cup' },
          { name: 'Heavy cream', amount: '1/4', unit: 'cup' },
          { name: 'Vanilla extract', amount: '1', unit: 'tsp' },
          { name: 'Simple syrup', amount: '2', unit: 'tbsp' },
          { name: 'Cold water', amount: '1/2', unit: 'cup' }
        ],
        instructions: [
          { step: 1, instruction: 'Mix orange juice with heavy cream' },
          { step: 2, instruction: 'Add vanilla extract and simple syrup' },
          { step: 3, instruction: 'Add cold water and stir well' },
          { step: 4, instruction: 'Carbonate using your DrinkMate machine' },
          { step: 5, instruction: 'Chill and serve over ice' }
        ],
        prepTime: 5,
        cookTime: 0,
        servings: 3,
        difficulty: 'Easy',
        category: 'Creamy',
        tags: ['fruity', 'orange', 'creamy', 'dessert', 'nostalgic'],
        images: [{
          url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop',
          alt: 'Orange Creamsicle Delight',
          isPrimary: true
        }],
        featured: false,
        published: true,
        author: author._id,
        views: 720,
        likes: 52,
        rating: { average: 4.5, count: 16 },
        nutrition: {
          calories: 120,
          protein: 1.8,
          carbs: 18,
          fat: 4.2,
          sugar: 16,
          fiber: 0.8
        },
        equipment: ['DrinkMate machine', 'Measuring cup', 'Spoon'],
        tips: [
          'Use fresh orange juice for best flavor',
          'Adjust creaminess by adding more or less heavy cream',
          'Serve well chilled for best taste'
        ],
        seo: {
          metaTitle: 'Orange Creamsicle Delight Recipe',
          metaDescription: 'Make a creamy orange sparkling drink that tastes like the classic ice cream treat.',
          keywords: ['orange creamsicle', 'creamy', 'dessert drink', 'vanilla', 'nostalgic']
        }
      },
      {
        title: 'Grape Soda Supreme',
        slug: 'grape-soda-supreme',
        description: 'The ultimate grape soda experience with premium flavor. This classic drink gets a modern twist with your DrinkMate machine, creating the perfect balance of sweetness and fizz.',
        ingredients: [
          { name: 'Grape syrup', amount: '3', unit: 'tbsp' },
          { name: 'Cold water', amount: '1', unit: 'cup' },
          { name: 'Lemon juice', amount: '1', unit: 'tsp' },
          { name: 'Ice cubes', amount: '1', unit: 'cup' },
          { name: 'Purple food coloring', amount: '2-3', unit: 'drops' }
        ],
        instructions: [
          { step: 1, instruction: 'Mix grape syrup with cold water' },
          { step: 2, instruction: 'Add a splash of lemon juice for balance' },
          { step: 3, instruction: 'Add purple food coloring for vibrant color' },
          { step: 4, instruction: 'Carbonate using your DrinkMate machine' },
          { step: 5, instruction: 'Serve chilled over ice' }
        ],
        prepTime: 3,
        cookTime: 0,
        servings: 2,
        difficulty: 'Easy',
        category: 'Classic',
        tags: ['grape', 'soda', 'classic', 'purple', 'sweet'],
        images: [{
          url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
          alt: 'Grape Soda Supreme',
          isPrimary: true
        }],
        featured: false,
        published: true,
        author: author._id,
        views: 580,
        likes: 38,
        rating: { average: 4.4, count: 12 },
        nutrition: {
          calories: 110,
          protein: 0.1,
          carbs: 28,
          fat: 0,
          sugar: 26,
          fiber: 0.1
        },
        equipment: ['DrinkMate machine', 'Measuring spoons', 'Spoon'],
        tips: [
          'Use high-quality grape syrup',
          'Adjust sweetness to taste',
          'Add more food coloring for deeper purple color'
        ],
        seo: {
          metaTitle: 'Grape Soda Supreme Recipe - DrinkMate',
          metaDescription: 'Create the ultimate grape soda with your DrinkMate machine.',
          keywords: ['grape soda', 'classic', 'purple', 'sweet', 'sparkling']
        }
      }
    ];
    
    // Insert or update recipes
    for (const recipeData of recipes) {
      const recipe = await Recipe.findOneAndUpdate(
        { slug: recipeData.slug },
        recipeData,
        { upsert: true, new: true }
      );
      console.log(`✅ Recipe: ${recipe.title} (${recipe.slug}) - ${recipe.difficulty}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${recipes.length} recipes!`);
    console.log('Recipes should now be visible at:');
    console.log('- /recipes (frontend)');
    console.log('- /admin/recipes (admin panel)');
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    mongoose.connection.close();
  }
});
