'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { format } from 'date-fns'
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react'
import { getOrderById } from '@/data/orders'
import { Order, OrderStatus, OrderHandler } from '@/types/types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image'

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'bg-yellow-500',
  [OrderStatus.PAYMENT_FAILED]: 'bg-red-500',
  [OrderStatus.PAID]: 'bg-green-500',
  [OrderStatus.PROCESSING]: 'bg-blue-500',
  [OrderStatus.ON_DELIVERY]: 'bg-purple-500',
  [OrderStatus.DELIVERED]: 'bg-gray-500',
  [OrderStatus.CANCELLED]: 'bg-red-700',
  [OrderStatus.CASH_PAYMENT]: 'bg-green-700',
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge className={`${statusColors[status]} text-white`}>
    {status.replace('_', ' ')}
  </Badge>
)

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getToken } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken()
      setToken(authToken)
    }
    fetchToken()
  }, [getToken])

  const { data: order, isLoading, error } = useQuery<Order, Error>({
    queryKey: ['order', params.id],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token available')
      return getOrderById(params.id, token)
    },
    enabled: !!token,
  })

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading order details...</div>
  if (error) return <div className="flex justify-center items-center h-screen">Error loading order: {error.message}</div>
  if (!order) return <div className="flex justify-center items-center h-screen">Order not found</div>

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.push('/orders/daily-orders')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Date:</strong> {format(new Date(order.createdAt), 'PPP')}</p>
              <div><strong>Status:</strong> <OrderStatusBadge status={order.status} /></div>
              <p><strong>Total:</strong> AED{(+order.total).toFixed(2)}</p>
              <p><strong>Processed By:</strong> {order.processedBy || 'Not processed yet'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Phone:</strong> {order.customerPhone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Address:</strong> {order.shippingAddress.addressLine1}</p>
          <p><strong>State:</strong> {order.shippingAddress.state}, {order.shippingAddress.country} {order.shippingAddress.postalCode}</p>
          <p><strong>Recepient Number:</strong> {order.shippingAddress.phone}</p>
          <p><strong>Recepient Name:</strong> {order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variation</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {item.product.mainImage && (
                        <Image
                          src={item.product.mainImage.url}
                          alt={item.product.name_en}
                          width={50}
                          height={50}
                          className="rounded-md"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.product.name_en}</p>
                        <p className="text-sm text-gray-500">{item.product.category.name_en}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.productVariation.size?.name_en && <p><strong>Size:</strong> {item.productVariation.size?.name_en}</p>}
                    {item.productVariation.infinityColor?.name_en && <p><strong>Infinity:</strong> {item.productVariation.infinityColor?.name_en}</p>}
                    {item.productVariation.boxColor?.name_en && <p><strong>Box:</strong> {item.productVariation.boxColor?.name_en}</p>}
                    {item.productVariation.wrappingColor?.name_en && <p><strong>Wrapping:</strong> {item.productVariation.wrappingColor?.name_en}</p>}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>AED{(+item.price).toFixed(2)}</TableCell>
                  <TableCell>AED{(+item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.items.some(item => item.addons && item.addons.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Addons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Addon</TableHead>
                  <TableHead>Variation</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.flatMap(item => 
                  (item.addons || []).map(addon => (
                    <TableRow key={`${item.id}-${addon.id}`}>
                      <TableCell>{item.product.name_en}</TableCell>
                      <TableCell>{addon.addon.name_en}</TableCell>
                      <TableCell>{addon.addonVariation.size?.name_en || 'N/A'}</TableCell>
                      <TableCell>{addon.quantity}</TableCell>
                      <TableCell>AED{(+addon.price).toFixed(2)}</TableCell>
                      <TableCell>AED{(+addon.price * addon.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>AED{(+order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>AED{(+order.shippingCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>AED{(+order.taxInfo).toFixed(2)}</span>
            </div>
            {order.coupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-AED{(order.subtotal * (order.coupon.discount / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>AED{(+order.total).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.cardMessage && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Card Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.cardMessage}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-gray-200 dark:border-gray-700">
            <div className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <Package className="w-5 h-5 text-blue-800 dark:text-blue-300" />
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">Order Placed</h3>
              <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{format(new Date(order.createdAt), 'PPP')}</time>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">Order was placed and is awaiting processing.</p>
            </div>
            {order.status !== OrderStatus.PENDING_PAYMENT && (
              <div className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900">
                  <Truck className="w-5 h-5 text-blue-800 dark:text-blue-300" />
                </span>
                <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">Order Processing</h3>
                <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{format(new Date(order.updatedAt), 'PPP')}</time>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                  Order is being processed and prepared for shipping.
                  {order.processedBy && <span className="ml-2">Processed by: {order.processedBy}</span>}
                </p>
              </div>
            )}
            {order.status === OrderStatus.DELIVERED && (
              <div className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900">
                  <CheckCircle className="w-5 h-5 text-blue-800 dark:text-blue-300" />
                </span>
                <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">Order Delivered</h3>
                <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{format(new Date(order.updatedAt), 'PPP')}</time>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                  Order has been successfully delivered.
                  {order.processedBy && <span className="ml-2">Processed by: {order.processedBy}</span>}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}