'use client'

import { useEffect, useCallback } from 'react'
import { useOrderWebSocket,requestNotificationPermission } from '@/lib/websockets'
import { useToast } from "@/components/ui/use-toast"
import { Order } from '@/types/types'
import { useQueryClient } from '@tanstack/react-query'

export function OrderNotificationHandler({ token }: { token: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const handleNewPaidOrder = useCallback((order: Order) => {
    // Show toast notification
    toast({
      title: "New Paid Order!",
      description: `Order #${order.id} has been paid. Total: $${order.total}`,
    })

    // Show desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Paid Order!', {
        body: `Order #${order.id} has been paid. Total: $${order.total}`,
        icon: '/path/to/your/icon.png', // Replace with your actual icon path
      });
    }

    // Invalidate and refetch orders query
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }, [toast, queryClient])

  const { isConnected } = useOrderWebSocket(token, handleNewPaidOrder)

  return (
    isConnected && (
      <div className="fixed bottom-4 right-4 p-2 bg-green-100 text-green-800 rounded shadow">
        Real-time updates active
      </div>
    )
  )
}