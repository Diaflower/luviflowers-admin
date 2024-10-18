
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const page = () => {
    
    return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$12,345</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">123</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">45</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Product</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">Red Rose Bouquet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
}

export default page