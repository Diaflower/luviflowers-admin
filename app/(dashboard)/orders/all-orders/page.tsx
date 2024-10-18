import { Suspense } from 'react'
import OrdersTable from '@/components/shared/OrdersTable'

export default function AllOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-64">Loading orders...</div>}>
        <OrdersTable showCoupons={true} showExcelDownload={true} isAdmin={true} />
      </Suspense>
    </div>
  )
}