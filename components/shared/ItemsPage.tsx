'use client'

import { Suspense } from 'react'
import { fetchItems } from '@/data/categoriesOrTags'
import { fetchAddons, fetchProducts } from '@/data/products'
import DataTable from './DataTable'
import AddItemButton from './AddItemButton'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { ItemType } from '@/types/types'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'

interface ItemsPageProps {
  itemType: ItemType
}

export default function ItemsPage({ itemType }: ItemsPageProps) {
  const { isLoaded, userId, getToken } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: [itemType, userId],
    queryFn: async () => {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (itemType === 'products') {
        return fetchProducts(1, 10, token)
      } else if (itemType === 'addons') {
        return fetchAddons(1, 10, token)
      } else {
        return fetchItems(itemType, 1, 10, token)
      }
    },
    refetchOnWindowFocus: false,
    enabled: isLoaded && !!userId,
  })

  console.log("hehehehe",data)
  if (!isLoaded || !userId) {
    return <div className="flex items-center justify-center h-full">Loading authentication...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {(error as Error).message}</div>
  }

  const capitalizedItemType = itemType.charAt(0).toUpperCase() + itemType.slice(1)

  console.log("data::::heheher",data)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{capitalizedItemType}</h1>
        {itemType === 'products' || itemType === 'addons' ? (
          <Link href={`/${itemType}/create`} passHref>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New {capitalizedItemType.slice(0, -1)}
            </Button>
          </Link>
        ) : (
          <AddItemButton itemType={itemType} />
        )}
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">Loading...</div>
        ) : data && data.items?.length > 0 || data.length > 0 ? (
          <DataTable initialItems={data} itemType={itemType} />
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">No {itemType} available. Please create one.</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}