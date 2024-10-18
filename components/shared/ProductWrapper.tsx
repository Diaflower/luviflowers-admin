'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { getProductById } from '@/data/products'
import ProductFormNew from '../forms/ProductFormNew'
import { Loader2 } from 'lucide-react'

export default function ProductWrapper() {
  const { id } = useParams()
  const { getToken } = useAuth()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return getProductById(Number(id), token)
    },
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return <ProductFormNew productId={Number(id)} initialData={product} />
}