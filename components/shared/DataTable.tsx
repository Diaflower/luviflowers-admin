'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { fetchItems, deleteItem, deleteCoupon } from '@/data/categoriesOrTags'
import { fetchAddons, fetchProducts, deleteAddon, deleteProduct } from '@/data/products'
import DeleteItemButton from './DeleteItemButton'
import EditItemButton from './EditItemButton'
import { Item, ItemType, Coupon } from '@/types/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
interface DataTableProps {
  initialItems: {
    items: (Item | Coupon)[]
    totalPages: number
  }
  itemType: ItemType
}

export default function DataTable({ initialItems, itemType }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const { getToken } = useAuth()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [itemType, currentPage],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      if (itemType === 'products') {
        return fetchProducts(currentPage, 10, token)
      } else if (itemType === 'addons') {
        return fetchAddons(currentPage, 10, token)
      } else {
        return fetchItems(itemType, currentPage, 10, token)
       
      }
    },
    initialData: initialItems,
  })


  const handleDeleteItem = async (id: number | string, forceDelete: boolean) => {
    try {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      
      if (itemType === 'products') {
        await deleteProduct(id as number, token, forceDelete)
      } else if (itemType === 'addons') {
        await deleteAddon(id as number, token)
      } else if (itemType === 'coupons') {
        await deleteCoupon(id as string, token)
      } else {
        await deleteItem(itemType, id as number, token)
      }
      
      refetch()
    } catch (error) {
      console.error("Error deleting item:", error)
      throw error
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">Error: {(error as Error).message}</div>

  const items = itemType === 'coupons'? data: data?.items || []
  const totalPages = data?.totalPages || 1

  const renderTableHeaders = () => {
    switch (itemType) {
      case 'boxColors':
      case 'wrappingColors':
        return (
          <>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Alt Text (EN)</TableHead>
            <TableHead>Alt Text (AR)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'products':
        return (
          <>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name (English)</TableHead>
            <TableHead>Name (Arabic)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'addons':
        return (
          <>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name (English)</TableHead>
            <TableHead>Name (Arabic)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'coupons':
        return (
          <>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      default:
        return (
          <>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name (English)</TableHead>
            <TableHead>Name (Arabic)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
    }
  }

  const renderTableRow = (item: Item | Coupon) => {
    switch (itemType) {
      case 'boxColors':
      case 'wrappingColors':
        const colorItem = item as Item
        return (
          <>
            <TableCell>{colorItem.id}</TableCell>
            <TableCell>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: colorItem.color }}
              ></div>
            </TableCell>
            <TableCell>
              {colorItem.image && (
                <Image 
                  src={colorItem.image.url} 
                  alt={colorItem.image.altText_en || ''} 
                  className="w-10 h-10 object-cover rounded" 
                />
              )}
            </TableCell>
            <TableCell>{colorItem.image?.altText_en}</TableCell>
            <TableCell>{colorItem.image?.altText_ar}</TableCell>
          </>
        )
      case 'products':
        const productItem = item as Item
        return (
          <>
            <TableCell>{productItem.id}</TableCell>
            <TableCell>{productItem.name_en}</TableCell>
            <TableCell>{productItem.name_ar}</TableCell>
            <TableCell>{productItem.status}</TableCell>
            <TableCell>{productItem.category?.name_en}</TableCell>
          </>
        )
      case 'addons':
        const addonItem = item as Item
        return (
          <>
            <TableCell>{addonItem.id}</TableCell>
            <TableCell>{addonItem.name_en}</TableCell>
            <TableCell>{addonItem.name_ar}</TableCell>
          </>
        )
      case 'coupons':
        const couponItem = item as Coupon
        return (
          <>
            <TableCell>{couponItem.id}</TableCell>
            <TableCell>{couponItem.name}</TableCell>
            <TableCell>{couponItem.code}</TableCell>
            <TableCell>{couponItem.discount}%</TableCell>
            <TableCell>{new Date(couponItem.expiryDate).toLocaleDateString()}</TableCell>
          </>
        )
      default:
        const defaultItem = item as Item
        return (
          <>
            <TableCell>{defaultItem.id}</TableCell>
            <TableCell>{defaultItem.name_en}</TableCell>
            <TableCell>{defaultItem.name_ar}</TableCell>
          </>
        )
    }
  }
  console.log("iteeeeems:::",items)
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {renderTableHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: Item | Coupon) => (
              <TableRow key={item.id}>
                {renderTableRow(item)}
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {itemType === 'products' || itemType === 'addons' ? (
                      <>
                        <Link href={`/${itemType}/edit/${item.id}`} passHref>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteItemButton item={item} itemType={itemType} onDelete={handleDeleteItem} />
                      </>
                    ) : (
                      <>
                        <EditItemButton
                          item={item}
                          itemType={itemType}
                          onUpdate={() => refetch()}
                        />
                        <DeleteItemButton item={item} itemType={itemType} onDelete={handleDeleteItem} />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}