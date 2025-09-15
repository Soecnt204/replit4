"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, BarChart3, PieChart, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for charts and reports
const salesData = {
  daily: [
    { date: "2024-01-10", sales: 45000, orders: 12 },
    { date: "2024-01-11", sales: 52000, orders: 15 },
    { date: "2024-01-12", sales: 38000, orders: 9 },
    { date: "2024-01-13", sales: 67000, orders: 18 },
    { date: "2024-01-14", sales: 71000, orders: 21 },
    { date: "2024-01-15", sales: 85000, orders: 25 },
  ],
  monthly: {
    current: 2450000,
    previous: 2180000,
    growth: 12.4,
  },
  topProducts: [
    { name: "iPhone 15 Pro", sales: 450000, units: 15, percentage: 18.4 },
    { name: "Samsung Galaxy S24", sales: 340000, units: 12, percentage: 13.9 },
    { name: "MacBook Air M3", sales: 625000, units: 5, percentage: 25.5 },
    { name: "AirPods Pro", sales: 200000, units: 8, percentage: 8.2 },
  ],
  categories: [
    { name: "Smartphones", sales: 1200000, percentage: 49 },
    { name: "Laptops", sales: 750000, percentage: 31 },
    { name: "Accessories", sales: 350000, percentage: 14 },
    { name: "Tablets", sales: 150000, percentage: 6 },
  ],
}

const inventoryData = {
  totalProducts: 1247,
  totalValue: 15750000,
  lowStock: 8,
  outOfStock: 3,
  topCategories: [
    { name: "Smartphones", count: 45, value: 4500000 },
    { name: "Laptops", count: 23, value: 2875000 },
    { name: "Accessories", count: 67, value: 1675000 },
    { name: "Tablets", count: 18, value: 2250000 },
  ],
  stockMovement: [
    { date: "2024-01-10", inbound: 25, outbound: 18 },
    { date: "2024-01-11", inbound: 12, outbound: 22 },
    { date: "2024-01-12", inbound: 8, outbound: 15 },
    { date: "2024-01-13", inbound: 35, outbound: 28 },
    { date: "2024-01-14", inbound: 18, outbound: 31 },
    { date: "2024-01-15", inbound: 22, outbound: 25 },
  ],
}

const customerData = {
  totalCustomers: 156,
  activeCustomers: 89,
  newCustomers: 12,
  averageOrderValue: 15750,
  topCustomers: [
    { name: "Rajesh Kumar", orders: 15, spent: 235000 },
    { name: "Priya Sharma", orders: 12, spent: 186000 },
    { name: "Amit Patel", orders: 18, spent: 298000 },
    { name: "Sarah Wilson", orders: 9, spent: 145000 },
  ],
  orderFrequency: [
    { range: "1-2 orders", customers: 45, percentage: 28.8 },
    { range: "3-5 orders", customers: 67, percentage: 42.9 },
    { range: "6-10 orders", customers: 32, percentage: 20.5 },
    { range: "10+ orders", customers: 12, percentage: 7.7 },
  ],
}

export function Reports() {
  const [dateRange, setDateRange] = useState("last_30_days")
  const [activeTab, setActiveTab] = useState("sales")
  const { toast } = useToast()

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Exporting Report",
      description: `${reportType} report is being generated and will be downloaded shortly.`,
    })
  }

  const handleGeneratePDF = () => {
    toast({
      title: "Generating PDF",
      description: "Comprehensive report PDF is being generated.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleGeneratePDF}>
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">₹{salesData.monthly.current.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-green-600">
                +{salesData.monthly.growth}%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{inventoryData.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="text-orange-600">
                {inventoryData.lowStock} Low Stock
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{customerData.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-green-600">
                {customerData.newCustomers} New
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">₹{customerData.averageOrderValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
              </div>
              <TrendingUp className="h-8 w-8 text-cyan-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-green-600">
                +8.2%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="customers">Customer Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Sales Trend
                  <Button variant="outline" size="sm" onClick={() => handleExportReport("Sales Trend")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>Daily sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Sales trend chart would be displayed here</p>
                    <p className="text-sm text-muted-foreground">Peak: ₹85,000 on Jan 15</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      ₹{salesData.daily.reduce((sum, day) => sum + day.sales, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{salesData.daily.reduce((sum, day) => sum + day.orders, 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ₹
                      {Math.round(
                        salesData.daily.reduce((sum, day) => sum + day.sales, 0) /
                          salesData.daily.reduce((sum, day) => sum + day.orders, 0),
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Order</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Top Selling Products
                  <Button variant="outline" size="sm" onClick={() => handleExportReport("Top Products")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{product.sales.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{product.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Category Performance
                <Button variant="outline" size="sm" onClick={() => handleExportReport("Category Performance")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>Revenue breakdown by product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {salesData.categories.map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <Badge variant="outline">{category.percentage}%</Badge>
                    </div>
                    <p className="text-2xl font-bold">₹{category.sales.toLocaleString()}</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Inventory Overview
                  <Button variant="outline" size="sm" onClick={() => handleExportReport("Inventory Overview")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>Current inventory status and value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{inventoryData.totalProducts}</p>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">₹{inventoryData.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{inventoryData.lowStock}</p>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{inventoryData.outOfStock}</p>
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Movement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Stock Movement
                  <Button variant="outline" size="sm" onClick={() => handleExportReport("Stock Movement")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>Inbound vs outbound inventory flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Stock movement chart would be displayed here</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {inventoryData.stockMovement.reduce((sum, day) => sum + day.inbound, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Items Added</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {inventoryData.stockMovement.reduce((sum, day) => sum + day.outbound, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Items Sold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Inventory by Category
                <Button variant="outline" size="sm" onClick={() => handleExportReport("Inventory by Category")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>Product count and value by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryData.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{category.value.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {((category.value / inventoryData.totalValue) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Customer Overview
                  <Button variant="outline" size="sm" onClick={() => handleExportReport("Customer Overview")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>Customer base statistics and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{customerData.totalCustomers}</p>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{customerData.activeCustomers}</p>
                      <p className="text-sm text-muted-foreground">Active Customers</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{customerData.newCustomers}</p>
                      <p className="text-sm text-muted-foreground">New This Month</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">₹{customerData.averageOrderValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Top Customers
                  <Button variant="outline" size="sm" onClick={() => handleExportReport("Top Customers")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>Highest value customers by total spent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{customer.spent.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Customer Order Frequency
                <Button variant="outline" size="sm" onClick={() => handleExportReport("Order Frequency")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>Distribution of customers by order frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customerData.orderFrequency.map((freq, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{freq.range}</h3>
                      <Badge variant="outline">{freq.percentage}%</Badge>
                    </div>
                    <p className="text-2xl font-bold">{freq.customers}</p>
                    <p className="text-sm text-muted-foreground">customers</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${freq.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
