'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, FolderOpen, Tag, Settings, Package } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  parentCategory: string | null;
  productCount: number;
  bundleCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  category: string | { _id: string; name: string; slug: string };
  productCount: number;
  bundleCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    color: '#12d6fa',
    sortOrder: 0,
    parentCategory: '' as string | ''
  });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Subcategory form state
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    color: '#6b7280',
    sortOrder: 0,
    category: ''
  });
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        adminAPI.getCategories(),
        adminAPI.getSubcategories()
      ]);
      
      setCategories(categoriesRes.categories || []);
      setSubcategories(subcategoriesRes.subcategories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch categories and subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...categoryForm,
        parentCategory: categoryForm.parentCategory ? categoryForm.parentCategory : null,
      };
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory._id, payload);
        toast.success('Category updated successfully');
      } else {
        await adminAPI.createCategory(payload);
        toast.success('Category created successfully');
      }
      
      resetCategoryForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubcategory) {
        await adminAPI.updateSubcategory(editingSubcategory._id, subcategoryForm);
        toast.success('Subcategory updated successfully');
      } else {
        await adminAPI.createSubcategory(subcategoryForm);
        toast.success('Subcategory created successfully');
      }
      
      resetSubcategoryForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save subcategory');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteSubcategory(subcategoryId);
      toast.success('Subcategory deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subcategory');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      await adminAPI.toggleCategoryStatus(categoryId);
      toast.success('Category status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  const handleToggleSubcategoryStatus = async (subcategoryId: string) => {
    try {
      await adminAPI.toggleSubcategoryStatus(subcategoryId);
      toast.success('Subcategory status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update subcategory status');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: '',
      icon: '',
      color: '#12d6fa',
      sortOrder: 0,
      parentCategory: ''
    });
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      name: '',
      description: '',
      image: '',
      icon: '',
      color: '#6b7280',
      sortOrder: 0,
      category: ''
    });
    setEditingSubcategory(null);
    setIsSubcategoryDialogOpen(false);
  };

  const openCategoryEdit = (category: Category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon,
      color: category.color,
      sortOrder: category.sortOrder,
      parentCategory: category.parentCategory || ''
    });
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const openSubcategoryEdit = (subcategory: Subcategory) => {
    setSubcategoryForm({
      name: subcategory.name,
      description: subcategory.description,
      image: subcategory.image,
      icon: subcategory.icon,
      color: subcategory.color,
      sortOrder: subcategory.sortOrder,
      category: typeof subcategory.category === 'string' ? subcategory.category : subcategory.category?._id || ''
    });
    setEditingSubcategory(subcategory);
    setIsSubcategoryDialogOpen(true);
  };

  const openCategoryCreate = () => {
    resetCategoryForm();
    setIsCategoryDialogOpen(true);
  };

  const openSubcategoryCreate = () => {
    resetSubcategoryForm();
    setIsSubcategoryDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-gray-600 mt-2">Manage product categories and subcategories</p>
          </div>
          <div className="flex gap-2">
            {/* Buttons are now part of the dialogs */}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="subcategories" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Subcategories ({subcategories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category._id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCategoryEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCategoryStatus(category._id)}
                          className={category.isActive ? 'text-green-600' : 'text-red-600'}
                        >
                          {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{category.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{category.productCount} products</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        <span>{category.bundleCount} bundles</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">Order: {category.sortOrder}</Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500">Parent Category:</p>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c._id === category.parentCategory)?.name || 'None'}
                      </Badge>
                    </div>
                    {category.icon && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Icon: {category.icon}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subcategories" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subcategories.map((subcategory) => (
                <Card key={subcategory._id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: subcategory.color }}
                        />
                        {subcategory.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSubcategoryEdit(subcategory)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSubcategoryStatus(subcategory._id)}
                          className={subcategory.isActive ? 'text-green-600' : 'text-red-600'}
                        >
                          {subcategory.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(subcategory._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{subcategory.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{subcategory.productCount} products</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        <span>{subcategory.bundleCount} bundles</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={subcategory.isActive ? 'default' : 'secondary'}>
                        {subcategory.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">Order: {subcategory.sortOrder}</Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500">Parent Category:</p>
                      <Badge variant="outline" className="text-xs">
                        {
                          (
                            typeof subcategory.category === 'string'
                              ? categories.find(c => c._id === subcategory.category)?.name
                              : subcategory.category?.name
                          ) || 'Unknown'
                        }
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCategoryCreate} className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Name *</Label>
                <Input
                  id="categoryName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="categoryParent">Parent Category</Label>
                <Select
                  value={categoryForm.parentCategory || ''}
                  onValueChange={(value) => setCategoryForm({ ...categoryForm, parentCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories
                      .filter(c => !editingCategory || c._id !== editingCategory._id)
                      .map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryIcon">Icon</Label>
                  <Input
                    id="categoryIcon"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="Icon name"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryColor">Color</Label>
                  <Input
                    id="categoryColor"
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="categorySortOrder">Sort Order</Label>
                <Input
                  id="categorySortOrder"
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetCategoryForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Subcategory Dialog */}
        <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openSubcategoryCreate} variant="outline">
              <Tag className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="subcategoryName">Name *</Label>
                <Input
                  id="subcategoryName"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="Subcategory name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subcategoryDescription">Description</Label>
                <Textarea
                  id="subcategoryDescription"
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  placeholder="Subcategory description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subcategoryIcon">Icon</Label>
                  <Input
                    id="subcategoryIcon"
                    value={subcategoryForm.icon}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, icon: e.target.value })}
                    placeholder="Icon name"
                  />
                </div>
                <div>
                  <Label htmlFor="subcategoryColor">Color</Label>
                  <Input
                    id="subcategoryColor"
                    type="color"
                    value={subcategoryForm.color}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subcategoryCategory">Parent Category *</Label>
                  <Select
                    value={subcategoryForm.category}
                    onValueChange={(value) => setSubcategoryForm({ ...subcategoryForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategorySortOrder">Sort Order</Label>
                  <Input
                    id="subcategorySortOrder"
                    type="number"
                    value={subcategoryForm.sortOrder}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
                  {editingSubcategory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetSubcategoryForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
