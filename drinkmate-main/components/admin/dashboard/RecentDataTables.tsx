"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star
} from "lucide-react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

interface RecentOrder {
  _id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface RecentProduct {
  _id: string
  name: string
  price: number
  stock: number
  category: string
  isBestSeller: boolean
}

interface RecentDataTablesProps {
  recentOrders: RecentOrder[]
  recentProducts: RecentProduct[]
  isLoading: boolean
  onViewOrder?: (orderId: string) => void
  onViewProduct?: (productId: string) => void
}

export default function RecentDataTables({ 
  recentOrders, 
  recentProducts, 
  isLoading,
  onViewOrder,
  onViewProduct 
}: RecentDataTablesProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'processing': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'shipped': { color: 'bg-purple-100 text-purple-800', icon: ArrowUpRight },
      'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (stock < 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <SaudiRiyal amount={order.total} className="text-sm font-medium" />
                    {getStatusBadge(order.status)}
                    {onViewOrder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order._id)}
                        className="h-6 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Products</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent products</p>
            ) : (
              recentProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <div className="flex items-center gap-2">
                      {getStockBadge(product.stock)}
                      {product.isBestSeller && (
                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Best Seller
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <SaudiRiyal amount={product.price} className="text-sm font-medium" />
                    <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                    {onViewProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProduct(product._id)}
                        className="h-6 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
