const mongoose = require('mongoose');
const Blog = require('../Models/blog-model');
const User = require('../Models/user-model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://test1234:IhpDHsYWshrvtLQc@cluster0.y205sfi.mongodb.net/drinkmate?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample blog posts data
const sampleBlogPosts = [
  {
    title: "Our Impact on One Time Plastic Use",
    slug: "our-impact-on-one-time-plastic-use",
    excerpt: "Discover how Drinkmate is reducing plastic waste and contributing to a greener environment through our innovative soda making solutions.",
    content: "Plastic pollution is one of the most pressing environmental issues of our time. Every year, millions of plastic bottles end up in landfills and oceans, taking hundreds of years to decompose. At Drinkmate, we're committed to making a difference by providing sustainable alternatives to single-use plastic bottles...",
    category: "environment",
    tags: ["environment", "sustainability", "plastic", "green"],
    image: "/images/plastic-impact.png",
    readTime: 8,
    isPublished: true,
    isFeatured: true,
    language: "en",
    publishDate: new Date(),
    views: 0,
    likes: 0,
    comments: []
  },
  {
    title: "How Our Natural Flavors Are Made",
    slug: "how-our-natural-flavors-are-made",
    excerpt: "Learn about our premium Italian natural flavor extraction process and how we ensure the highest quality ingredients for your drinks.",
    content: "Our natural flavors are carefully crafted using traditional Italian methods passed down through generations. We source only the finest ingredients from trusted suppliers across Italy, ensuring that every flavor captures the authentic taste and aroma of the original fruit...",
    category: "products",
    tags: ["natural", "flavors", "italian", "quality"],
    image: "/images/natural-flavors.png",
    readTime: 6,
    isPublished: true,
    isFeatured: false,
    language: "en",
    publishDate: new Date(),
    views: 0,
    likes: 0,
    comments: []
  },
  {
    title: "Health Benefits of Sparkling Water",
    slug: "health-benefits-of-sparkling-water",
    excerpt: "Explore the surprising health benefits of sparkling water and how it can be a healthier alternative to sugary sodas.",
    content: "Sparkling water has gained popularity as a refreshing and healthy alternative to sugary sodas. But did you know that it offers several health benefits beyond just being calorie-free? From aiding digestion to improving hydration, sparkling water can be a great addition to your daily routine...",
    category: "health",
    tags: ["health", "sparkling-water", "benefits", "hydration"],
    image: "/images/health-benefits.png",
    readTime: 7,
    isPublished: true,
    isFeatured: false,
    language: "en",
    publishDate: new Date(),
    views: 0,
    likes: 0,
    comments: []
  }
];

const seedBlogPosts = async () => {
  try {
    await connectDB();
    
    // Find or create a default admin user for blog posts
    let adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@drinkmate.com' });
      if (!adminUser) {
        console.log('No admin user found. Please create an admin user first.');
        return;
      }
    }
    
    console.log('Seeding blog posts...');
    
    // Clear existing blog posts (optional - remove this if you want to keep existing posts)
    // await Blog.deleteMany({});
    
    // Add sample blog posts
    for (const postData of sampleBlogPosts) {
      // Check if post already exists
      const existingPost = await Blog.findOne({ slug: postData.slug });
      if (existingPost) {
        console.log(`Blog post "${postData.title}" already exists, skipping...`);
        continue;
      }
      
      const blogPost = new Blog({
        ...postData,
        author: adminUser._id,
        authorName: adminUser.name || 'Drinkmate Team'
      });
      
      await blogPost.save();
      console.log(`Created blog post: "${postData.title}"`);
    }
    
    console.log('Blog posts seeded successfully!');
    
    // Display created posts
    const allPosts = await Blog.find({ isPublished: true }).sort({ publishDate: -1 });
    console.log(`\nTotal published blog posts: ${allPosts.length}`);
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (${post.category})`);
    });
    
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding function
seedBlogPosts();
