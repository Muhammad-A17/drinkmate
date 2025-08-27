"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MessageCircle,
  Bookmark,
  Tag,
  Utensils,
  BookOpen
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Define types for blog posts and recipes
// Type guards
function isBlogPost(item: BlogPost | Recipe): item is BlogPost {
  return 'author' in item && 'comments' in item;
}

function isRecipe(item: BlogPost | Recipe): item is Recipe {
  return 'difficulty' in item && 'prepTime' in item && 'ingredients' in item;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: Date | null;
  status: string;
  featured: boolean;
  comments: number;
  image: string | null;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  difficulty: string;
  prepTime: string;
  ingredients: number;
  publishedAt: Date | null;
  status: string;
  featured: boolean;
  image: string | null;
}

// Mock blog posts data
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Creative Drinks to Make with Your Drinkmate",
    slug: "10-creative-drinks-with-drinkmate",
    excerpt: "Discover exciting and refreshing drink recipes you can easily make at home with your Drinkmate soda maker.",
    category: "recipes",
    author: "Ahmed Al-Farsi",
    publishedAt: new Date(2023, 9, 15), // October 15, 2023
    status: "published",
    featured: true,
    comments: 12,
    image: "/images/drink-recipes.png"
  },
  {
    id: "2",
    title: "Health Benefits of Homemade Carbonated Drinks",
    slug: "health-benefits-homemade-carbonated-drinks",
    excerpt: "Learn about the health advantages of making your own carbonated beverages instead of buying store-bought sodas.",
    category: "health",
    author: "Sara Al-Qahtani",
    publishedAt: new Date(2023, 9, 10), // October 10, 2023
    status: "published",
    featured: false,
    comments: 8,
    image: "/images/health-benefits.png"
  },
  {
    id: "3",
    title: "How to Properly Clean Your Drinkmate Machine",
    slug: "how-to-clean-drinkmate-machine",
    excerpt: "A comprehensive guide to maintaining and cleaning your Drinkmate soda maker for optimal performance and longevity.",
    category: "guides",
    author: "Mohammed Al-Otaibi",
    publishedAt: new Date(2023, 9, 5), // October 5, 2023
    status: "published",
    featured: false,
    comments: 5,
    image: "/images/how-to-use-drinkmate.png"
  },
  {
    id: "4",
    title: "Eco-Friendly Benefits of Using a Soda Maker",
    slug: "eco-friendly-benefits-soda-maker",
    excerpt: "Discover how using a Drinkmate soda maker can help reduce plastic waste and benefit the environment.",
    category: "sustainability",
    author: "Fatima Al-Harbi",
    publishedAt: new Date(2023, 8, 28), // September 28, 2023
    status: "published",
    featured: true,
    comments: 15,
    image: "/images/plastic-impact.png"
  },
  {
    id: "5",
    title: "Upcoming Drinkmate Accessories for 2024",
    slug: "upcoming-drinkmate-accessories-2024",
    excerpt: "Get a sneak peek at the exciting new accessories and products coming to Drinkmate in the next year.",
    category: "news",
    author: "Admin",
    publishedAt: null,
    status: "draft",
    featured: false,
    comments: 0,
    image: null
  }
];

// Mock recipes data
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Homemade Italian Soda",
    slug: "homemade-italian-soda",
    excerpt: "Create delicious Italian sodas with your Drinkmate using our premium fruit syrups.",
    category: "beverages",
    difficulty: "easy",
    prepTime: "5 minutes",
    ingredients: 5,
    publishedAt: new Date(2023, 9, 20), // October 20, 2023
    status: "published",
    featured: true,
    image: "/images/italian-strawberry-lemon-syrup.png"
  },
  {
    id: "2",
    title: "Sparkling Mojito Mocktail",
    slug: "sparkling-mojito-mocktail",
    excerpt: "A refreshing non-alcoholic mojito made with fresh mint, lime, and carbonated water.",
    category: "mocktails",
    difficulty: "medium",
    prepTime: "10 minutes",
    ingredients: 7,
    publishedAt: new Date(2023, 9, 18), // October 18, 2023
    status: "published",
    featured: true,
    image: "/images/01 - Flavors/Mojito-Mocktails.png"
  },
  {
    id: "3",
    title: "Fizzy Fruit Punch",
    slug: "fizzy-fruit-punch",
    excerpt: "A colorful and delicious fruit punch perfect for parties and gatherings.",
    category: "party drinks",
    difficulty: "easy",
    prepTime: "15 minutes",
    ingredients: 6,
    publishedAt: new Date(2023, 9, 12), // October 12, 2023
    status: "published",
    featured: false,
    image: "/images/premium-italian-flavors.png"
  },
  {
    id: "4",
    title: "Carbonated Cold Brew Coffee",
    slug: "carbonated-cold-brew-coffee",
    excerpt: "An innovative twist on cold brew coffee with a sparkling fizz that will energize your day.",
    category: "coffee",
    difficulty: "medium",
    prepTime: "12 hours (including brewing)",
    ingredients: 4,
    publishedAt: new Date(2023, 9, 5), // October 5, 2023
    status: "published",
    featured: false,
    image: null
  },
  {
    id: "5",
    title: "Holiday Spiced Apple Cider",
    slug: "holiday-spiced-apple-cider",
    excerpt: "A warm and festive spiced apple cider with a carbonated twist for the holiday season.",
    category: "seasonal",
    difficulty: "hard",
    prepTime: "30 minutes",
    ingredients: 9,
    publishedAt: null,
    status: "draft",
    featured: false,
    image: null
  }
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("blog")
  const [blogPosts, setBlogPosts] = useState(mockBlogPosts)
  const [recipes, setRecipes] = useState(mockRecipes)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false)
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false)
  
  const router = useRouter()

  // Filter blog posts based on search term, category and status
  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter && categoryFilter !== "all" ? post.category === categoryFilter : true
    const matchesStatus = statusFilter && statusFilter !== "all" ? post.status === statusFilter : true
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Filter recipes based on search term, category and status
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter && categoryFilter !== "all" ? recipe.category === categoryFilter : true
    const matchesStatus = statusFilter && statusFilter !== "all" ? recipe.status === statusFilter : true
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get current items based on active tab
  const currentItems: (BlogPost | Recipe)[] = activeTab === "blog" ? filteredBlogPosts : filteredRecipes
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(currentItems.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
    setCategoryFilter("")
    setStatusFilter("")
    setCurrentPage(1)
  }

  // Handle delete item
  const handleDeleteItem = (id: string) => {
    if (activeTab === "blog") {
      setBlogPosts(blogPosts.filter(post => post.id !== id))
    } else {
      setRecipes(recipes.filter(recipe => recipe.id !== id))
    }
  }

  // Handle feature toggle
  const toggleFeature = (id: string) => {
    if (activeTab === "blog") {
      setBlogPosts(blogPosts.map(post => 
        post.id === id ? { ...post, featured: !post.featured } : post
      ))
    } else {
      setRecipes(recipes.map(recipe => 
        recipe.id === id ? { ...recipe, featured: !recipe.featured } : recipe
      ))
    }
  }

  // Get blog categories
  const blogCategories = [...new Set(blogPosts.map(post => post.category))]
  
  // Get recipe categories
  const recipeCategories = [...new Set(recipes.map(recipe => recipe.category))]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        {activeTab === "blog" ? (
          <Dialog open={isAddBlogOpen} onOpenChange={setIsAddBlogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
                <Plus className="mr-2 h-4 w-4" />
                Create Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <p className="text-gray-600">Blog post creation form will be implemented here.</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => setIsAddBlogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => {
                      // Add mock blog post
                      const newPost: BlogPost = {
                        id: Date.now().toString(),
                        title: "New Blog Post",
                        slug: "new-blog-post",
                        excerpt: "This is a new blog post",
                        category: "general",
                        author: "Admin",
                        publishedAt: null,
                        status: "draft",
                        featured: false,
                        comments: 0,
                        image: null
                      }
                      setBlogPosts([...blogPosts, newPost])
                      setIsAddBlogOpen(false)
                    }}
                  >
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isAddRecipeOpen} onOpenChange={setIsAddRecipeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
                <Plus className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Recipe</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <p className="text-gray-600">Recipe creation form will be implemented here.</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => setIsAddRecipeOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => {
                      // Add mock recipe
                      const newRecipe: Recipe = {
                        id: Date.now().toString(),
                        title: "New Recipe",
                        slug: "new-recipe",
                        excerpt: "This is a new recipe",
                        category: "general",
                        difficulty: "easy",
                        prepTime: "15 min",
                        ingredients: 5,
                        publishedAt: null,
                        status: "draft",
                        featured: false,
                        image: null
                      }
                      setRecipes([...recipes, newRecipe])
                      setIsAddRecipeOpen(false)
                    }}
                  >
                    Add Recipe
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="blog" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Recipes
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${activeTab === "blog" ? "blog posts" : "recipes"}...`}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {(activeTab === "blog" ? blogCategories : recipeCategories).map((category) => (
                        <SelectItem key={category} value={category} className="capitalize">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="blog" className="mt-0">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Blog Posts ({filteredBlogPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <FileText className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{post.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{post.excerpt}</p>
                          </div>
                          {post.featured && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 ml-auto">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{isBlogPost(post) ? post.author : ''}</TableCell>
                      <TableCell>
                        {post.publishedAt ? (
                          format(post.publishedAt, 'MMM d, yyyy')
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {post.status === "published" ? (
                          <Badge className="bg-green-100 text-green-800">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log("View", post.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Edit", post.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFeature(post.id)}>
                              <Bookmark className="mr-2 h-4 w-4" />
                              {post.featured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(post.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">No blog posts found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {currentItems.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, currentItems.length)} of {currentItems.length} {activeTab === "blog" ? "posts" : "recipes"}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageToShow = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3 && i === 0) {
                          pageToShow = 1;
                        } else if (currentPage > 3 && i === 1) {
                          return (
                            <span key="ellipsis-start" className="px-2">
                              ...
                            </span>
                          );
                        } else if (currentPage > 3 && i < 4) {
                          pageToShow = currentPage + i - 2;
                        } else if (i === 4) {
                          if (currentPage + 2 >= totalPages) {
                            pageToShow = totalPages;
                          } else {
                            return (
                              <span key="ellipsis-end" className="px-2">
                                ...
                              </span>
                            );
                          }
                        }
                      }
                      
                      if (pageToShow <= totalPages) {
                        return (
                          <Button
                            key={pageToShow}
                            variant={currentPage === pageToShow ? "default" : "outline"}
                            size="icon"
                            onClick={() => paginate(pageToShow)}
                            className={currentPage === pageToShow ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                          >
                            {pageToShow}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recipes" className="mt-0">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Recipes ({filteredRecipes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                            {recipe.image ? (
                              <Image
                                src={recipe.image}
                                alt={recipe.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Utensils className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{recipe.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{recipe.excerpt}</p>
                          </div>
                          {recipe.featured && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 ml-auto">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {recipe.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isRecipe(recipe) && (
                          <Badge 
                            variant="secondary" 
                            className={`capitalize ${
                              recipe.difficulty === "easy" 
                                ? "bg-green-100 text-green-800" 
                                : recipe.difficulty === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {recipe.difficulty}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {isRecipe(recipe) && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            {recipe.prepTime}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {recipe.status === "published" ? (
                          <Badge className="bg-green-100 text-green-800">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log("View", recipe.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View recipe
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Edit", recipe.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit recipe
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFeature(recipe.id)}>
                              <Bookmark className="mr-2 h-4 w-4" />
                              {recipe.featured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(recipe.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete recipe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <Utensils className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">No recipes found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {currentItems.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, currentItems.length)} of {currentItems.length} {activeTab === "blog" ? "posts" : "recipes"}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageToShow = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3 && i === 0) {
                          pageToShow = 1;
                        } else if (currentPage > 3 && i === 1) {
                          return (
                            <span key="ellipsis-start" className="px-2">
                              ...
                            </span>
                          );
                        } else if (currentPage > 3 && i < 4) {
                          pageToShow = currentPage + i - 2;
                        } else if (i === 4) {
                          if (currentPage + 2 >= totalPages) {
                            pageToShow = totalPages;
                          } else {
                            return (
                              <span key="ellipsis-end" className="px-2">
                                ...
                              </span>
                            );
                          }
                        }
                      }
                      
                      if (pageToShow <= totalPages) {
                        return (
                          <Button
                            key={pageToShow}
                            variant={currentPage === pageToShow ? "default" : "outline"}
                            size="icon"
                            onClick={() => paginate(pageToShow)}
                            className={currentPage === pageToShow ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                          >
                            {pageToShow}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

    </AdminLayout>
  )
}
