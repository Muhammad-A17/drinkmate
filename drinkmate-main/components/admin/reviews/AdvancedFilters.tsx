"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import type { Product, User, ReviewFilters } from "@/lib/types/review"

interface AdvancedFiltersProps {
  filters: ReviewFilters
  onFiltersChange: (filters: ReviewFilters) => void
  products: Product[]
  users: User[]
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  products,
  users
}: AdvancedFiltersProps) {
  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleDateRangeChange = (key: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="product-filter">Product</Label>
            <Select value={filters.product} onValueChange={(value) => handleFilterChange('product', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="user-filter">User</Label>
            <Select value={filters.user} onValueChange={(value) => handleFilterChange('user', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date-from">Date From</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="date-to">Date To</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
