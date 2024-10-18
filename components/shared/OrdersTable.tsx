'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, differenceInMinutes, isToday, subDays, startOfMonth, endOfMonth, isBefore } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { Eye, MoreHorizontal, AlertCircle, ChevronDown, ChevronUp, Download, PackageIcon, CalendarIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fetchOrders, updateOrderStatus, fetchCoupons } from '@/data/orders'
import { Order, OrderStatus, OrdersResponse, OrderHandler, Coupon } from '@/types/types'
import { onMessage, Messaging } from 'firebase/messaging'
import { messaging } from '@/lib/firebase'
import { fetchItems } from '@/data/categoriesOrTags'



const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'bg-yellow-500',
  [OrderStatus.PAYMENT_FAILED]: 'bg-red-500',
  [OrderStatus.PAID]: 'bg-green-500',
  [OrderStatus.PROCESSING]: 'bg-blue-500',
  [OrderStatus.ON_DELIVERY]: 'bg-purple-500',
  [OrderStatus.DELIVERED]: 'bg-gray-500',
  [OrderStatus.CANCELLED]: 'bg-red-700',
  [OrderStatus.CASH_PAYMENT] :'bg-green-700'
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  return (
    <Badge variant="secondary" className={`${statusColors[status]} text-white`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

interface OrdersTableProps {
  showCoupons?: boolean;
  showExcelDownload?: boolean;
  isAdmin?: boolean;
}

export default function OrdersTable({ showCoupons = true, showExcelDownload = true, isAdmin = false }: OrdersTableProps) {
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<'createdAt' | 'total' | 'coupon'>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [selectedCoupon, setSelectedCoupon] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('today')
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)
  const pageSize = 10
  const router = useRouter()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null)

  const { data: couponsData } = useQuery<Coupon[], Error>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchItems('coupons', 1, 10, token)
    },
    enabled: showCoupons,
  })

  const { data, isLoading, error } = useQuery<OrdersResponse, Error>({
    queryKey: ['orders', page, sortField, sortDirection, filterStatus, selectedCoupon, dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchOrders(page, pageSize, token, sortField, sortDirection, filterStatus, selectedCoupon, dateFilter, customStartDate, customEndDate)
    },
  })



  const statusesRequiringHandler: OrderStatus[] = [
    OrderStatus.PROCESSING,
    OrderStatus.ON_DELIVERY,
    OrderStatus.CANCELLED
  ]

  const updateStatusMutation = useMutation<Order, Error, { orderId: number; newStatus: OrderStatus; processedBy?: OrderHandler }>({
    mutationFn: async ({ orderId, newStatus, processedBy }) => {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      return updateOrderStatus(orderId, newStatus, processedBy, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const handleStatusChange = (orderId: number, newStatus: OrderStatus, processedBy?: OrderHandler) => {
    if (statusesRequiringHandler.includes(newStatus) && !processedBy) {
      alert('Please select a handler for this status change.')
      return
    }
    updateStatusMutation.mutate({ orderId, newStatus, processedBy })
  }

  const isNewOrder = (createdAt: string) => {
    const orderDate = new Date(createdAt)
    const now = new Date()
    const diffMinutes = differenceInMinutes(now, orderDate)
    return diffMinutes <= 20
  }

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging as Messaging, (payload) => {
        console.log('Message received in OrdersTable:', payload)
        
        setNewOrderAlert(payload.notification?.body || 'New order received')
        
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      })
  
      return () => {
        unsubscribe()
      }
    }
  }, [queryClient])

 const handleSort = (field: 'createdAt' | 'total' | 'coupon') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredOrders = useMemo(() => {
    if (!data?.items) return []
    return data.items.filter(order => {
      if (filterStatus !== 'ALL' && order.status !== filterStatus) return false
      
      const orderDate = new Date(order.createdAt)
      const now = new Date()

      switch (dateFilter) {
        case 'today':
          return isToday(orderDate)
        case 'yesterday':
          return isToday(subDays(orderDate, 1))
        case 'week':
          return isBefore(subDays(now, 7), orderDate)
        case 'custom':
          if (customStartDate && customEndDate) {
            return isBefore(customStartDate, orderDate) && isBefore(orderDate, customEndDate)
          }
          return true
        default:
          return true
      }
    })
  }, [data?.items, filterStatus, dateFilter, customStartDate, customEndDate])

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(order => ({
      'Order Number': order.id,
      'Customer': order.customerName,
      'Date': format(new Date(order.createdAt), 'dd-MMM'),
      'Time': format(new Date(order.createdAt), 'hh:mm a'),
      'Total': `AED${order.total}`,
      'Coupon': order.coupon ? order.coupon.code : '-',
      'Status': order.status.replace('_', ' ')
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
    XLSX.writeFile(workbook, 'orders.xlsx')
  }

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading orders...</div>
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">Error loading orders: {error.message}</div>

  const orders = filteredOrders
  const totalPages = data?.totalPages || 1


  return (
    <div className="space-y-4">
      {newOrderAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>New Order Alert</AlertTitle>
          <AlertDescription>{newOrderAlert}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as OrderStatus | 'ALL')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showCoupons && (
            <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by coupon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Coupons</SelectItem>
                {couponsData?.map((coupon) => (
                  <SelectItem key={coupon.code} value={coupon.code}>{coupon.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              {isAdmin && (
                <>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {isAdmin && dateFilter === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate && customEndDate ? (
                    <>
                      {format(customStartDate, "LLL dd, y")} - {format(customEndDate, "LLL dd, y")}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={{ from: customStartDate, to: customEndDate }}
                  onSelect={(range) => {
                    setCustomStartDate(range?.from)
                    setCustomEndDate(range?.to)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {showExcelDownload && (
          <Button onClick={downloadExcel} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Excel</span>
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <PackageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No orders found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            There are no orders matching your current filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Date
                  {sortField === 'createdAt' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('total')}>
                  Total
                  {sortField === 'total' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                {showCoupons && (
                  <TableHead className="cursor-pointer" onClick={() => handleSort('coupon')}>
                    Coupon
                    {sortField === 'coupon' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                )}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {(page - 1) * pageSize + index + 1}
                    {isNewOrder(order.createdAt) && (
                      <Badge variant="secondary" className="ml-2">New</Badge>
                    )}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'dd - MMM')}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'hh:mm a')}</TableCell>
                  <TableCell>AED{order.total}</TableCell>
                  {showCoupons && (
                    <TableCell>{order.coupon ? order.coupon.code : '-'}</TableCell>
                  )}
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Select
                            onValueChange={(value) => {
                              const [status, handler] = value.split('|') as [OrderStatus, OrderHandler?]
                              handleStatusChange(order.id, status, handler)
                            }}
                            defaultValue={`${order.status}|${order.processedBy || ''}`}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(OrderStatus).map((status) => (
                                statusesRequiringHandler.includes(status) ? (
                                  Object.values(OrderHandler).map((handler) => (
                                    <SelectItem key={`${status}|${handler}`} value={`${status}|${handler}`}>
                                      {status.replace('_', ' ')} - {handler}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem key={status} value={`${status}|`}>
                                    {status.replace('_', ' ')}
                                  </SelectItem>
                                )
                              ))}
                            </SelectContent>
                          </Select>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {orders.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }} 
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(i + 1)
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

