import { Providers } from '@/components/layout/Providers'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import NotificationHandler from '@/components/shared/NotificationHandler'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dashboard',
  description: 'Your powerful dashboard application',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkPubkey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers clerkPubKey={clerkPubkey}>
          <NotificationHandler />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}