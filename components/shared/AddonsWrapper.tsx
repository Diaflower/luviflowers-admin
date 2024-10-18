'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
// import ProductForm from './ProductForm'
import { fetchAddonById} from '@/data/products'
import { Loader2 } from 'lucide-react'
import AddonForm from '@/components/forms/AddonForm';

export default function ProductFormWrapper() {
  const { id } = useParams()
  const { getToken } = useAuth()

  const { data: addon, isLoading } = useQuery({
    queryKey: ['addon', id],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchAddonById(Number(id), token)
    },
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return <AddonForm addonId={id ? Number(id) : undefined} initialData={addon} />
}