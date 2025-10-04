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
import { useCustomDialogs } from '@/hooks/use-custom-dialogs';
import { Plus, Edit, Trash2, Eye, EyeOff, FolderOpen, Tag, Settings, Package, Search, Filter, SortAsc, SortDesc, Copy, MoreHorizontal, CheckSquare, Square, Download, Upload, X, FileText, BarChart3, Save, RotateCcw, Calendar, Hash, Zap, Layers, History, BookOpen, Keyboard, RefreshCw } from 'lucide-react';

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
  const { confirm, showSuccess, showError } = useCustomDialogs();
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
  
  // Force delete confirmation state
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string; subcategoryCount: number } | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'sortOrder' | 'productCount'>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk actions state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  
  // Advanced features state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  
  // Advanced filters
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [productCountRange, setProductCountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Drag and drop
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  // Auto-save
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);

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
        parentCategory: categoryForm.parentCategory === 'none' || !categoryForm.parentCategory ? null : categoryForm.parentCategory,
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
      // Convert "none" to empty string for category field
      const formData = {
        ...subcategoryForm,
        category: subcategoryForm.category === 'none' ? '' : subcategoryForm.category
      };
      
      if (editingSubcategory) {
        await adminAPI.updateSubcategory(editingSubcategory._id, formData);
        toast.success('Subcategory updated successfully');
      } else {
        await adminAPI.createSubcategory(formData);
        toast.success('Subcategory created successfully');
      }
      
      resetSubcategoryForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save subcategory');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // First try to delete without force
      await adminAPI.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error: any) {
      // If error indicates subcategories exist, show force delete dialog
      const errorMessage = error.response?.data?.message || '';
      const hasSubcategories = error.response?.data?.hasSubcategories || 
                              errorMessage.includes('existing subcategories');
      
      console.log('Delete error:', {
        errorMessage,
        hasSubcategories,
        errorData: error.response?.data
      });
      
      if (hasSubcategories) {
        const subcategoryCount = error.response?.data?.subcategoryCount || 0;
        const category = categories.find(c => c._id === categoryId);
        console.log('Setting up force delete dialog:', {
          categoryId,
          categoryName: category?.name,
          subcategoryCount
        });
        setCategoryToDelete({
          id: categoryId,
          name: category?.name || 'Unknown',
          subcategoryCount
        });
        setIsForceDeleteDialogOpen(true);
      } else {
        toast.error(errorMessage || 'Failed to delete category');
      }
    }
  };

  const handleForceDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await adminAPI.deleteCategory(categoryToDelete.id, true); // Force deletion
      toast.success('Category and all subcategories deleted successfully');
      fetchData();
      setIsForceDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category with subcategories');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    const confirmed = await confirm({
      title: 'Delete Subcategory',
      description: 'Are you sure you want to delete this subcategory? This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Delete Subcategory',
      cancelText: 'Cancel'
    });
    
    if (!confirmed) {
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

  // Filter and sort functions
  const getFilteredCategories = () => {
    let filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && category.isActive) ||
                           (statusFilter === 'inactive' && !category.isActive);
      
      // Advanced filters
      const matchesDateRange = !dateRange.from || !dateRange.to || 
        (new Date(category.createdAt) >= new Date(dateRange.from) && 
         new Date(category.createdAt) <= new Date(dateRange.to));
      
      const matchesProductCount = (!productCountRange.min || category.productCount >= parseInt(productCountRange.min)) &&
                                 (!productCountRange.max || category.productCount <= parseInt(productCountRange.max));
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesProductCount;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'sortOrder':
          aValue = a.sortOrder;
          bValue = b.sortOrder;
          break;
        case 'productCount':
          aValue = a.productCount;
          bValue = b.productCount;
          break;
        default:
          aValue = a.sortOrder;
          bValue = b.sortOrder;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getFilteredSubcategories = () => {
    let filtered = subcategories.filter(subcategory => {
      const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subcategory.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && subcategory.isActive) ||
                           (statusFilter === 'inactive' && !subcategory.isActive);
      
      // Advanced filters
      const matchesDateRange = !dateRange.from || !dateRange.to || 
        (new Date(subcategory.createdAt) >= new Date(dateRange.from) && 
         new Date(subcategory.createdAt) <= new Date(dateRange.to));
      
      const matchesProductCount = (!productCountRange.min || subcategory.productCount >= parseInt(productCountRange.min)) &&
                                 (!productCountRange.max || subcategory.productCount <= parseInt(productCountRange.max));
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesProductCount;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'sortOrder':
          aValue = a.sortOrder;
          bValue = b.sortOrder;
          break;
        case 'productCount':
          aValue = a.productCount;
          bValue = b.productCount;
          break;
        default:
          aValue = a.sortOrder;
          bValue = b.sortOrder;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Bulk actions
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const currentItems = activeTab === 'categories' ? getFilteredCategories() : getFilteredSubcategories();
    const allIds = currentItems.map(item => item._id);
    setSelectedItems(selectedItems.length === allIds.length ? [] : allIds);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const confirmed = await confirm({
      title: 'Bulk Delete',
      description: `Are you sure you want to delete ${selectedItems.length} ${activeTab}? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete All',
      cancelText: 'Cancel'
    });
    
    if (!confirmed) return;

    try {
      for (const itemId of selectedItems) {
        if (activeTab === 'categories') {
          await adminAPI.deleteCategory(itemId, true); // Force delete for bulk
        } else {
          await adminAPI.deleteSubcategory(itemId);
        }
      }
      toast.success(`${selectedItems.length} ${activeTab} deleted successfully`);
      setSelectedItems([]);
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to delete ${activeTab}`);
    }
  };

  const handleBulkToggleStatus = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const itemId of selectedItems) {
        if (activeTab === 'categories') {
          await adminAPI.toggleCategoryStatus(itemId);
        } else {
          await adminAPI.toggleSubcategoryStatus(itemId);
        }
      }
      toast.success(`${selectedItems.length} ${activeTab} status updated`);
      setSelectedItems([]);
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to update ${activeTab} status`);
    }
  };

  // Consolidated duplicate functionality
  const handleDuplicateItem = (item: Category | Subcategory) => {
    if (activeTab === 'categories') {
      const category = item as Category;
      setCategoryForm({
        name: `${category.name} (Copy)`,
        description: category.description,
        image: category.image,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder + 1,
        parentCategory: category.parentCategory || ''
      });
      setEditingCategory(null);
      setIsCategoryDialogOpen(true);
    } else {
      const subcategory = item as Subcategory;
      setSubcategoryForm({
        name: `${subcategory.name} (Copy)`,
        description: subcategory.description,
        image: subcategory.image,
        icon: subcategory.icon,
        color: subcategory.color,
        sortOrder: subcategory.sortOrder + 1,
        category: typeof subcategory.category === 'string' ? subcategory.category : subcategory.category?._id || ''
      });
      setEditingSubcategory(null);
      setIsSubcategoryDialogOpen(true);
    }
  };

  // ==================== ADVANCED FUNCTIONALITIES ====================

  // Export functionality
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = activeTab === 'categories' ? getFilteredCategories() : getFilteredSubcategories();
      
      if (format === 'csv') {
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, `categories_export.${format}`, 'text/csv');
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, `categories_export.${format}`, 'application/json');
      }
      
      toast.success(`Exported ${data.length} ${activeTab} successfully`);
      setIsExportDialogOpen(false);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => key !== '_id');
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'object' ? JSON.stringify(value) : `"${value}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import functionality
  const handleImport = async (file: File) => {
    try {
      const content = await file.text();
      let data;
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(content);
      } else {
        throw new Error('Unsupported file format');
      }
      
      // Process imported data
      for (const item of data) {
        if (activeTab === 'categories') {
          await adminAPI.createCategory(item);
        } else {
          await adminAPI.createSubcategory(item);
        }
      }
      
      toast.success(`Imported ${data.length} ${activeTab} successfully`);
      setIsImportDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to import data');
    }
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0]?.split(',').map(h => h.replace(/"/g, '')) || [];
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim()) {
        const values = lines[i]?.split(',').map(v => v.replace(/"/g, '')) || [];
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = values[index];
        });
        data.push(item);
      }
    }
    
    return data;
  };

  // Bulk edit functionality
  const handleBulkEdit = async (updates: any) => {
    try {
      for (const itemId of selectedItems) {
        if (activeTab === 'categories') {
          await adminAPI.updateCategory(itemId, updates);
        } else {
          await adminAPI.updateSubcategory(itemId, updates);
        }
      }
      toast.success(`Updated ${selectedItems.length} ${activeTab} successfully`);
      setSelectedItems([]);
      setIsBulkEditDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update items');
    }
  };

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;
    
    try {
      // Update sort order based on drop position
      const items = activeTab === 'categories' ? getFilteredCategories() : getFilteredSubcategories();
      const draggedIndex = items.findIndex(item => item._id === draggedItem);
      const targetIndex = items.findIndex(item => item._id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;
      
      const newSortOrder = targetIndex + 1;
      
      if (activeTab === 'categories') {
        await adminAPI.updateCategory(draggedItem, { sortOrder: newSortOrder });
      } else {
        await adminAPI.updateSubcategory(draggedItem, { sortOrder: newSortOrder });
      }
      
      toast.success('Order updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setDraggedItem(null);
    }
  };

  // Auto-save functionality
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
    
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Auto-save logic here
      setHasUnsavedChanges(false);
    }, 2000);
    
    setAutoSaveTimeout(timeout);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            if (activeTab === 'categories') {
              openCategoryCreate();
            } else {
              openSubcategoryCreate();
            }
            break;
          case 'e':
            e.preventDefault();
            setIsExportDialogOpen(true);
            break;
          case 'i':
            e.preventDefault();
            setIsImportDialogOpen(true);
            break;
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'd':
            e.preventDefault();
            if (selectedItems.length > 0) {
              handleBulkDelete();
            }
            break;
          case 's':
            e.preventDefault();
            setIsKeyboardShortcutsOpen(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedItems]);

  // Analytics data
  const getAnalyticsData = () => {
    const totalCategories = categories.length;
    const totalSubcategories = subcategories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const activeSubcategories = subcategories.filter(s => s.isActive).length;
    const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);
    const totalBundles = categories.reduce((sum, c) => sum + c.bundleCount, 0);
    
    return {
      totalCategories,
      totalSubcategories,
      activeCategories,
      activeSubcategories,
      totalProducts,
      totalBundles,
      inactiveCategories: totalCategories - activeCategories,
      inactiveSubcategories: totalSubcategories - activeSubcategories
    };
  };

  // Template functionality
  const handleApplyTemplate = async (templateType: 'ecommerce' | 'food') => {
    try {
      const templates = {
        ecommerce: [
          { name: 'Electronics', description: 'Electronic devices and accessories', color: '#3b82f6', sortOrder: 1 },
          { name: 'Clothing', description: 'Fashion and apparel', color: '#ef4444', sortOrder: 2 },
          { name: 'Home & Garden', description: 'Home improvement and garden supplies', color: '#10b981', sortOrder: 3 },
          { name: 'Sports', description: 'Sports and fitness equipment', color: '#f59e0b', sortOrder: 4 }
        ],
        food: [
          { name: 'Beverages', description: 'Drinks and liquid refreshments', color: '#8b5cf6', sortOrder: 1 },
          { name: 'Snacks', description: 'Quick bites and treats', color: '#f97316', sortOrder: 2 },
          { name: 'Fresh Produce', description: 'Fresh fruits and vegetables', color: '#22c55e', sortOrder: 3 },
          { name: 'Pantry', description: 'Staple food items', color: '#6b7280', sortOrder: 4 }
        ]
      };

      const templateCategories = templates[templateType];
      
      for (const categoryData of templateCategories) {
        await adminAPI.createCategory(categoryData);
      }
      
      toast.success(`${templateCategories.length} categories created from ${templateType} template`);
      setIsTemplateDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to apply template');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Premium Header */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <FolderOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Category Management
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage product categories and subcategories with advanced features
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{getFilteredCategories().length}</div>
                    <div className="text-sm text-gray-500">Filtered Categories</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">{categories.length}</div>
                    <div className="text-sm text-gray-500">Total Categories</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button 
                    onClick={openCategoryCreate} 
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Category
                  </Button>

                  <Button 
                    onClick={openSubcategoryCreate} 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-[#12d6fa] hover:bg-[#12d6fa]/5 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Tag className="w-5 h-5 mr-2" />
                    Add Subcategory
                  </Button>

                  <Button 
                    onClick={() => setIsExportDialogOpen(true)} 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export
                  </Button>

                  <Button 
                    onClick={() => setIsImportDialogOpen(true)} 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Import
                  </Button>

                  {selectedItems.length > 0 && (
                    <Button 
                      onClick={() => setIsBulkEditDialogOpen(true)} 
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 px-6 py-3 rounded-xl transition-all duration-300"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Bulk Edit ({selectedItems.length})
                    </Button>
                  )}

                  <Button 
                    onClick={() => setIsAnalyticsDialogOpen(true)} 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Analytics
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Search & Filters */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-xl">
                  <Search className="h-6 w-6 text-[#12d6fa]" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Search & Filters
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#12d6fa]" />
                    Search Categories
                  </label>
                  <div className="relative group">
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:border-[#12d6fa]/50"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#12d6fa] transition-colors duration-300" />
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#12d6fa]" />
                    Status Filter
                  </label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl py-3 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#12d6fa]/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                      <SelectItem value="all" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#12d6fa] to-blue-500" />
                          All Status
                        </div>
                      </SelectItem>
                      <SelectItem value="active" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Active Only
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                          Inactive Only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <SortAsc className="h-4 w-4 text-[#12d6fa]" />
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl py-3 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#12d6fa]/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                      <SelectItem value="sortOrder" className="rounded-lg">Sort Order</SelectItem>
                      <SelectItem value="name" className="rounded-lg">Name</SelectItem>
                      <SelectItem value="createdAt" className="rounded-lg">Created Date</SelectItem>
                      <SelectItem value="productCount" className="rounded-lg">Product Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Quick Actions
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setSortBy('sortOrder')
                        setSortOrder('asc')
                      }}
                      className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Clear All
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tabs */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <FolderOpen className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Categories & Subcategories</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">
                            {getFilteredCategories().length} categories, {getFilteredSubcategories().length} subcategories
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger 
                      value="categories" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Categories ({getFilteredCategories().length}/{categories.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="subcategories" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      <Tag className="w-4 h-4" />
                      Subcategories ({getFilteredSubcategories().length}/{subcategories.length})
                    </TabsTrigger>
                  </TabsList>

          <TabsContent value="categories" className="mt-6">
            {/* Select All Checkbox */}
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="p-1"
              >
                {selectedItems.length === getFilteredCategories().length && getFilteredCategories().length > 0 ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
              </span>
            </div>

            {getFilteredCategories().length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by creating your first category.'}
                </p>
                {(!searchTerm && statusFilter === 'all') && (
                  <Button onClick={openCategoryCreate} className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredCategories().map((category) => (
                <Card 
                  key={category._id} 
                  className={`relative ${selectedItems.includes(category._id) ? 'ring-2 ring-blue-500' : ''} ${draggedItem === category._id ? 'opacity-50' : ''} cursor-move`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category._id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectItem(category._id)}
                          className="p-1"
                        >
                          {selectedItems.includes(category._id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div 
                            className="color-indicator" 
                            style={{ '--indicator-color': category.color } as React.CSSProperties}
                          />
                          {category.name}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateItem(category)}
                          title="Duplicate Category"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCategoryEdit(category)}
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCategoryStatus(category._id)}
                          className={category.isActive ? 'text-green-600' : 'text-red-600'}
                          title={category.isActive ? "Hide Category" : "Show Category"}
                        >
                          {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Category"
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
            )}
          </TabsContent>

          <TabsContent value="subcategories" className="mt-6">
            {/* Select All Checkbox */}
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="p-1"
              >
                {selectedItems.length === getFilteredSubcategories().length && getFilteredSubcategories().length > 0 ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
              </span>
            </div>

            {getFilteredSubcategories().length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by creating your first subcategory.'}
                </p>
                {(!searchTerm && statusFilter === 'all') && (
                  <Button onClick={openSubcategoryCreate} variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Add Subcategory
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredSubcategories().map((subcategory) => (
                <Card 
                  key={subcategory._id} 
                  className={`relative ${selectedItems.includes(subcategory._id) ? 'ring-2 ring-blue-500' : ''} ${draggedItem === subcategory._id ? 'opacity-50' : ''} cursor-move`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, subcategory._id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, subcategory._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectItem(subcategory._id)}
                          className="p-1"
                        >
                          {selectedItems.includes(subcategory._id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div 
                            className="color-indicator" 
                            style={{ '--indicator-color': subcategory.color } as React.CSSProperties}
                          />
                          {subcategory.name}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateItem(subcategory)}
                          title="Duplicate Subcategory"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSubcategoryEdit(subcategory)}
                          title="Edit Subcategory"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSubcategoryStatus(subcategory._id)}
                          className={subcategory.isActive ? 'text-green-600' : 'text-red-600'}
                          title={subcategory.isActive ? "Hide Subcategory" : "Show Subcategory"}
                        >
                          {subcategory.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(subcategory._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Subcategory"
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
            )}
          </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
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
                    <SelectItem value="none">None</SelectItem>
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

        {/* Force Delete Confirmation Dialog */}
        <Dialog open={isForceDeleteDialogOpen} onOpenChange={setIsForceDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Category with Subcategories</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The category <strong>"{categoryToDelete?.name}"</strong> has {categoryToDelete?.subcategoryCount} subcategories.
              </p>
              <p className="text-sm text-gray-600">
                Deleting this category will also delete all its subcategories. This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800 font-medium">Warning:</p>
                <p className="text-sm text-red-700">
                  Make sure there are no products or bundles assigned to this category or its subcategories before proceeding.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleForceDeleteCategory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Category & Subcategories
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsForceDeleteDialogOpen(false);
                  setCategoryToDelete(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export {activeTab}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose the format for exporting {getFilteredCategories().length} {activeTab}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => handleExport('csv')} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
                <Button onClick={() => handleExport('json')} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import {activeTab}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a CSV or JSON file to import {activeTab}
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <span className="text-sm text-gray-600">Click to select file</span>
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Edit {selectedItems.length} {activeTab}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updates = {
                color: formData.get('color') as string,
                isActive: formData.get('isActive') === 'on'
              };
              handleBulkEdit(updates);
            }} className="space-y-4">
              <div>
                <Label htmlFor="bulkColor">Color</Label>
                <Input
                  id="bulkColor"
                  name="color"
                  type="color"
                  defaultValue="#12d6fa"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="bulkActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked
                  aria-label="Set all categories as active"
                  title="Set all categories as active"
                />
                <Label htmlFor="bulkActive">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update All
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsBulkEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Category Analytics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {(() => {
                const analytics = getAnalyticsData();
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalCategories}</div>
                      <div className="text-sm text-blue-600">Total Categories</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.activeCategories}</div>
                      <div className="text-sm text-green-600">Active Categories</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analytics.totalSubcategories}</div>
                      <div className="text-sm text-purple-600">Total Subcategories</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{analytics.totalProducts}</div>
                      <div className="text-sm text-orange-600">Total Products</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Category Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use predefined templates to quickly create common category structures
              </p>
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">E-commerce Template</h3>
                  <p className="text-sm text-gray-600">Electronics, Clothing, Home & Garden, Sports</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleApplyTemplate('ecommerce')}
                  >
                    Apply Template
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Food & Beverage Template</h3>
                  <p className="text-sm text-gray-600">Beverages, Snacks, Fresh Produce, Pantry</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleApplyTemplate('food')}
                  >
                    Apply Template
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={isKeyboardShortcutsOpen} onOpenChange={setIsKeyboardShortcutsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Create New</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+N</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Export</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+E</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Import</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+I</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Select All</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+A</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Delete Selected</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+D</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Show Shortcuts</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </AdminLayout>
  );
}
