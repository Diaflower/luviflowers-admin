
'use client'

import ProductForm from '@/components/forms/ProductForm'
import { useParams } from 'next/navigation'

export default function EditProductPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Edit Product</h1>
      <ProductForm productId={productId} />
    </div>
  )
}