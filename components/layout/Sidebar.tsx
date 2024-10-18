'use client'

import Link from 'next/link'
import { SignOutButton, UserButton, useAuth } from "@clerk/nextjs"
import { useQuery } from '@tanstack/react-query'
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  PackageIcon, 
  UsersIcon, 
  BarChartIcon, 
  TagIcon, 
  LayersIcon, 
  FolderIcon, 
  PackageOpen, 
  Flower, 
  Diameter, 
  Kanban, 
  PlusCircle, 
  ChevronDown, 
  Bell,
  CalendarIcon,
  Users
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { fetchUserData } from '@/data/user'

export default function Sidebar() {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const { isLoaded, userId, getToken } = useAuth()
  console.log("userid",userId)

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchUserData(token)
    },
    enabled: isLoaded && !!userId,
  })

  console.log("datauser",userData)
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading user data</div>
  }

  const isAdmin = userData?.role === 'ADMIN'
  const isOrderHandler = userData?.role === 'ORDER_HANDLER'

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">DiaFlower Admin</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {isAdmin && (
          <>
            <Link href="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
              <HomeIcon className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </Link>

            <Collapsible open={openSection === 'products'} onOpenChange={() => toggleSection('products')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <PackageIcon className="w-5 h-5 mr-3" />
                  <span>Products</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'products' ? 'transform rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-gray-50">
                <Link href="/products" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <LayersIcon className="w-4 h-4 mr-3" />
                  <span>All Products</span>
                </Link>
                <Link href="/products/create" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <PlusCircle className="w-4 h-4 mr-3" />
                  <span>Create Product</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSection === 'addons'} onOpenChange={() => toggleSection('addons')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <PackageOpen className="w-5 h-5 mr-3" />
                  <span>Addons</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'addons' ? 'transform rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-gray-50">
                <Link href="/addons" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <LayersIcon className="w-4 h-4 mr-3" />
                  <span>All Addons</span>
                </Link>
                <Link href="/addons/create" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <PlusCircle className="w-4 h-4 mr-3" />
                  <span>Create Addon</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSection === 'additionals'} onOpenChange={() => toggleSection('additionals')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <FolderIcon className="w-5 h-5 mr-3" />
                  <span>Additionals</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'additionals' ? 'transform rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-gray-50">
                <Link href="/categories" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <FolderIcon className="w-4 h-4 mr-3" />
                  <span>Categories</span>
                </Link>
                <Link href="/tags" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <TagIcon className="w-4 h-4 mr-3" />
                  <span>Tags</span>
                </Link>
                <Link href="/infinity-color" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <Flower className="w-4 h-4 mr-3" />
                  <span>Infinity Color</span>
                </Link>
                <Link href="/box-color" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <PackageOpen className="w-4 h-4 mr-3" />
                  <span>Box Color</span>
                </Link>
                <Link href="/product-size" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <Diameter className="w-4 h-4 mr-3" />
                  <span>Product Size</span>
                </Link>
                <Link href="/addon-size" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <Diameter className="w-4 h-4 mr-3" />
                  <span>Addon Size</span>
                </Link>
                <Link href="/wrapping-color" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <Kanban className="w-4 h-4 mr-3" />
                  <span>Wrapping Color</span>
                </Link>
                <Link href="/coupons" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <TagIcon className="w-4 h-4 mr-3" />
                  <span>Coupons</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        <Collapsible open={openSection === 'orders'} onOpenChange={() => toggleSection('orders')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-100">
            <div className="flex items-center">
              <ShoppingCartIcon className="w-5 h-5 mr-3" />
              <span>Orders</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'orders' ? 'transform rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-gray-50">
            {isAdmin && (
              <Link href="/orders/all-orders" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                <LayersIcon className="w-4 h-4 mr-3" />
                <span>All Orders</span>
              </Link>
            )}
            <Link href="/orders/daily-orders" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
              <CalendarIcon className="w-4 h-4 mr-3" />
              <span>Daily Orders</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {isAdmin && (
          <>
            <Collapsible open={openSection === 'customers'} onOpenChange={() => toggleSection('customers')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <UsersIcon className="w-5 h-5 mr-3" />
                  <span>Customers</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'customers' ? 'transform rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-gray-50">
                <Link href="/customers/all" className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100">
                  <Users className="w-4 h-4 mr-3" />
                  <span>All Customers</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            <Link href="/analytics" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
              <BarChartIcon className="w-5 h-5 mr-3" />
              <span>Analytics</span>
            </Link>
          </>
        )}
      </nav>
      <div className="p-4 border-t flex items-center justify-between">
        <SignOutButton />
        <UserButton afterSignOutUrl="/sign-in" />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  )
}