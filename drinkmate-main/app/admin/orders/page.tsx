"use client"

import { useState } from "react"

// Define Order interface
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  date: Date;
  total: number;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
}
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import { Input } from "@/components/ui/input"
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
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Ahmed Al-Farsi",
    email: "ahmed@example.com",
    date: new Date(2023, 9, 15), // October 15, 2023
    total: 649,
    status: "completed",
    paymentStatus: "paid",
    items: [
      { name: "OmniFizz Soda Maker", quantity: 1, price: 399 },
      { name: "Strawberry Lemon Flavor", quantity: 2, price: 49 },
      { name: "CO2 Cylinder", quantity: 1, price: 89 }
    ]
  },
  {
    id: "ORD-002",
    customerName: "Sara Al-Qahtani",
    email: "sara@example.com",
    date: new Date(2023, 9, 18), // October 18, 2023
    total: 599,
    status: "shipped",
    paymentStatus: "paid",
    items: [
      { name: "Drinkmate Luxe", quantity: 1, price: 599 }
    ]
  },
  {
    id: "ORD-003",
    customerName: "Mohammed Al-Otaibi",
    email: "mohammed@example.com",
    date: new Date(2023, 9, 20), // October 20, 2023
    total: 167,
    status: "processing",
    paymentStatus: "paid",
    items: [
      { name: "Cola Flavor", quantity: 2, price: 39 },
      { name: "Black Bottle 500ml", quantity: 1, price: 79 }
    ]
  },
  {
    id: "ORD-004",
    customerName: "Fatima Al-Harbi",
    email: "fatima@example.com",
    date: new Date(2023, 9, 22), // October 22, 2023
    total: 499,
    status: "processing",
    paymentStatus: "pending",
    items: [
      { name: "OmniFizz Starter Kit", quantity: 1, price: 499 }
    ]
  },
  {
    id: "ORD-005",
    customerName: "Khalid Al-Dosari",
    email: "khalid@example.com",
    date: new Date(2023, 9, 23), // October 23, 2023
    total: 128,
    status: "cancelled",
    paymentStatus: "refunded",
    items: [
      { name: "Mojito Mocktails", quantity: 2, price: 44 },
      { name: "Black Bottle 500ml", quantity: 1, price: 79 }
    ]
  },
  {
    id: "ORD-006",
    customerName: "Noura Al-Shammari",
    email: "noura@example.com",
    date: new Date(2023, 9, 25), // October 25, 2023
    total: 349,
    status: "completed",
    paymentStatus: "paid",
    items: [
      { name: "Drinkmate Arctic Blue", quantity: 1, price: 349 }
    ]
  },
  {
    id: "ORD-007",
    customerName: "Abdullah Al-Ghamdi",
    email: "abdullah@example.com",
    date: new Date(2023, 9, 27), // October 27, 2023
    total: 149,
    status: "shipped",
    paymentStatus: "paid",
    items: [
      { name: "Flavor Pack Bundle", quantity: 1, price: 149 }
    ]
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  
  const router = useRouter()

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter && statusFilter !== "all" ? order.status === statusFilter : true
    
    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Shipped
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        )
    }
  }

  // Payment status badge renderer
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            Refunded
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <Button className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
          <FileText className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Date Range</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">More Filters</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p>{order.customerName}</p>
                        <p className="text-gray-500 text-sm">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(order.date, 'MMM d, yyyy')}</TableCell>
                                          <TableCell className="text-right font-medium">
                        <SaudiRiyal amount={order.total} size="sm" />
                      </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPaymentBadge(order.paymentStatus)}
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
                          <DropdownMenuItem onClick={() => console.log("View", order.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Mark as Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "completed")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "cancelled")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No orders found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
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
    </AdminLayout>
  )
}
