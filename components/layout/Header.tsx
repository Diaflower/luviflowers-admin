'use client'

import { UserButton } from "@clerk/nextjs"
import { Bell, Search } from "lucide-react"
import Image from "next/image"

export default function Header() {
  // //////
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Image className="h-8 w-auto" src="/logo.svg" alt="Logo" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Search</span>
                <Search className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="ml-3 flex-shrink-0">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="ml-3 relative">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}