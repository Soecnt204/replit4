"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReturnDetailModal } from "@/components/modals/return-detail-modal"
import { Eye, Search, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { syncManager } from "@/lib/sync-manager"

export function Returns() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [reasonFilter, setReasonFilter] = useState("all")
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const loadReturns = async () => {
      try {
        setLoading(true)
        const returnsData = await syncManager.getReturns()
        setReturns(returnsData || [])
      } catch (error) {
        console.error("[v0] Failed to load returns:", error)
        toast({
          title: "Error",
          description: "Failed to load returns. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadReturns()
  }, [toast])

  useEffect(() => {
    const handleNewReturn = (event: CustomEvent) => {
      const newReturn = event.detail
      setReturns((prev) => [newReturn, ...prev])
    }

    window.addEventListener("new-return-created", handleNewReturn as EventListener)

    return () => {
      window.removeEventListener("new-return-created", handleNewReturn as EventListener)
    }
  }, [])

  // Filter returns based on search and filters
  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.receiptId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.productName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesReason = reasonFilter === "all" || returnItem.reason === reasonFilter

    const matchesTab = activeTab === "all"

    return matchesSearch && matchesReason && matchesTab
  })

  // Calculate summary stats
  const totalRefundAmount = returns.reduce((sum, r) => sum + (r.amount || 0), 0)

  const handleDeleteReturn = async (returnId: string) => {
    try {
      await syncManager.deleteReturn(returnId)
      setReturns((prev) => prev.filter((r) => r.id !== returnId))
      toast({
        title: "Return Deleted",
        description: "Return item has been deleted successfully.",
      })
    } catch (error) {
      console.error("[v0] Failed to delete return:", error)
      toast({
        title: "Error",
        description: "Failed to delete return. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Returns</h1>
            <p className="text-muted-foreground">Loading returns...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-28"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Returns</h1>
          <p className="text-muted-foreground">View product returns and refunds</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">PKR {totalRefundAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{returns.length}</div>
            <p className="text-xs text-muted-foreground">Total Returns</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Returns</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search returns by ID, receipt, customer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={reasonFilter} onValueChange={setReasonFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reasons</SelectItem>
                      <SelectItem value="Defective product">Defective</SelectItem>
                      <SelectItem value="Customer changed mind">Changed Mind</SelectItem>
                      <SelectItem value="Wrong item received">Wrong Item</SelectItem>
                      <SelectItem value="Return processed during receipt creation">Receipt Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returns List */}
          <div className="space-y-4">
            {filteredReturns.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No returns found matching your criteria.</p>
                    {returns.length === 0 && <p className="mt-2">No returns have been created yet.</p>}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredReturns.map((returnItem) => (
                <Card key={returnItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={returnItem.productImage || "/placeholder.svg?height=80&width=80&query=product"}
                            alt={returnItem.productName || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div>
                            <h3 className="font-semibold">Return #{returnItem.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Receipt: {returnItem.receiptId} • {returnItem.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">{returnItem.customerPhone}</p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium text-primary">Product Name:</p>
                                <p className="font-semibold">{returnItem.productName}</p>
                              </div>
                              <div>
                                <p className="font-medium text-primary">Customer Name:</p>
                                <p className="font-semibold">{returnItem.customerName}</p>
                              </div>
                              <div>
                                <p className="font-medium text-primary">Product ID:</p>
                                <p className="font-semibold">#{returnItem.productId}</p>
                              </div>
                              <div>
                                <p className="font-medium text-primary">Return Price:</p>
                                <p className="font-semibold">PKR {(returnItem.amount || 0).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium text-primary">Quantity:</p>
                                <p className="font-semibold">{returnItem.quantity || 1} unit(s)</p>
                              </div>
                              <div>
                                <p className="font-medium text-primary">Status:</p>
                                <p className="font-semibold capitalize">{returnItem.status || "pending"}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm">
                              <strong>Reason:</strong> {returnItem.reason}
                            </p>
                            {returnItem.description && (
                              <p className="text-sm text-muted-foreground">{returnItem.description}</p>
                            )}
                          </div>
                          {returnItem.notes && (
                            <div className="p-2 bg-muted rounded text-sm">
                              <strong>Notes:</strong> {returnItem.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="text-right">
                          <p className="font-bold">PKR {(returnItem.amount || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(returnItem.date).toLocaleDateString()}
                          </p>
                          {returnItem.processedDate && (
                            <p className="text-xs text-muted-foreground">
                              Processed: {new Date(returnItem.processedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReturn(returnItem)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReturn(returnItem.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedReturn && <ReturnDetailModal returnItem={selectedReturn} onClose={() => setSelectedReturn(null)} />}
    </div>
  )
}
