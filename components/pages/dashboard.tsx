"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Package, Receipt, Users, AlertTriangle, Eye, ShoppingCart } from "lucide-react"
import { getDashboardMetrics, getRecentActivity } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface DashboardMetrics {
  totalProducts: number
  totalCategories: number
  todayReceipts: number
  todayRevenue: number
  lowStockItems: number
  activeShopkeepers: number
  monthlyGrowth: number
  lowStockProducts: Array<{
    id: string
    name: string
    current_stock: number
    min_stock_level: number
  }>
}

interface Activity {
  id: string
  type: "sale" | "product" | "return" | "stock"
  description: string
  time: string
  status: "completed" | "success" | "pending" | "warning"
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [metricsData, activityData] = await Promise.all([getDashboardMetrics(), getRecentActivity(5)])

        setMetrics(metricsData)
        setRecentActivity(activityData)
      } catch (error) {
        console.error("[v0] Failed to load dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{metrics.totalCategories} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{metrics.todayReceipts} receipts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.monthlyGrowth >= 0 ? "+" : ""}
              {metrics.monthlyGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shopkeepers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeShopkeepers}</div>
            <p className="text-xs text-muted-foreground">registered users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === "sale" && <Receipt className="h-4 w-4 text-green-500" />}
                        {activity.type === "product" && <Package className="h-4 w-4 text-blue-500" />}
                        {activity.type === "return" && <TrendingDown className="h-4 w-4 text-orange-500" />}
                        {activity.type === "stock" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "success"
                            ? "secondary"
                            : activity.status === "pending"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.lowStockProducts.length > 0 ? (
                metrics.lowStockProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Min level: {product.min_stock_level}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={product.current_stock === 0 ? "destructive" : "outline"}>
                        {product.current_stock} left
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">All products are well stocked</p>
              )}
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <ShoppingCart className="h-6 w-6" />
              New Sale
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Receipt className="h-6 w-6" />
              View Receipts
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
