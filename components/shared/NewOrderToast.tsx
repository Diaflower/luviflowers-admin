import { useEffect } from 'react'
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Order } from '@/types/types'

export function NewOrderToast({ order }: { order: Order | null }) {
  const { toast } = useToast()

  useEffect(() => {
    if (order) {
      toast({
        title: "New Paid Order!",
        description: `Order #${order.id} has been paid. Total: $${order.total}`,
      })
    }
  }, [order, toast])

  return null
}

export function ToastContainer() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}