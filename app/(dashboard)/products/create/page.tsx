'use client'

import ProductForm from '@/components/forms/ProductForm'

export default function CreateProductPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Create New Product</h1>
      <ProductForm />
    </div>
  )
}