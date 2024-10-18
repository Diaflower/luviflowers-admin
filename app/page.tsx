'use client'

import { fetchUserData } from '@/data/user';
import { useAuth } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server'
import { useQuery } from '@tanstack/react-query';
import { redirect } from "next/navigation";

export default function HomePage() {
  // const { userId } = auth();
  // const { userId } = auth();

  const { isLoaded, userId, getToken } = useAuth()

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchUserData(token)
    },
    enabled: isLoaded && !!userId,
  })

  if (!userId) {
    redirect("/sign-in");
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading user data</div>
  }


  if (userData.role === 'ORDER_HANDLER') {
    redirect("/orders/daily-orders")
  } else if (userData.role === 'ADMIN') {
    redirect("/overview")
  } 
}