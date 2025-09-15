"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Phone, Eye, CreditCard, Calendar } from "lucide-react"
import { syncManager } from "@/lib/sync-manager"

interface PendingReceipt {
  receiptNumber: string
  receiptDate: string
  totalAmount: number
  amountReceived: number
  pendingAmount: number
}

interface Shopkeeper {
  id: number
  name: string
  phone: string
  balance: number
  totalOrders: number
  status: string
  pendingReceipts: PendingReceipt[]
  totalPendingAmount: number
}

export function Shopkeepers() {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<Shopkeeper | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")

  useEffect(() => {
    const loadShopkeepers = async () => {
      try {
        const shopkeepersData = await syncManager.getShopkeepers()
        console.log("[v0] Loaded shopkeepers from database:", shopkeepersData)

        if (shopkeepersData && shopkeepersData.length > 0) {
          const formattedShopkeepers = await Promise.all(
            shopkeepersData.map(async (sk: any) => {
              // Get receipts for this shopkeeper to calculate balance
              const receipts = await syncManager.getReceipts()
              const shopkeeperReceipts = receipts.filter(
                (receipt: any) => receipt.customer_name === sk.name && receipt.customer_phone === sk.contact,
              )

              const totalOrders = shopkeeperReceipts.length
              const totalAmount = shopkeeperReceipts.reduce(
                (sum: number, receipt: any) => sum + (receipt.total_amount || 0),
                0,
              )
              const totalReceived = shopkeeperReceipts.reduce(
                (sum: number, receipt: any) => sum + (receipt.amount_received || 0),
                0,
              )
              const pendingAmount = totalAmount - totalReceived

              const pendingReceipts = shopkeeperReceipts
                .filter((receipt: any) => (receipt.total_amount || 0) > (receipt.amount_received || 0))
                .map((receipt: any) => ({
                  receiptNumber: receipt.receipt_number,
                  receiptDate: receipt.receipt_date,
                  totalAmount: receipt.total_amount || 0,
                  amountReceived: receipt.amount_received || 0,
                  pendingAmount: (receipt.total_amount || 0) - (receipt.amount_received || 0),
                }))

              return {
                id: sk.id,
                name: sk.name,
                phone: sk.contact || sk.phone || "",
                balance: sk.current_balance || totalReceived - totalAmount, // Negative if customer owes money
                totalOrders: totalOrders,
                status: sk.is_active ? "active" : "inactive",
                pendingReceipts: pendingReceipts,
                totalPendingAmount: pendingAmount,
              }
            }),
          )
          setShopkeepers(formattedShopkeepers)
        }
      } catch (error) {
        console.error("[v0] Failed to load shopkeepers:", error)
      }
    }

    loadShopkeepers()

    const handleBalanceUpdate = (event: CustomEvent) => {
      const {
        shopkeeperName,
        shopkeeperPhone,
        receiptNumber,
        receiptDate,
        totalAmount,
        amountReceived,
        pendingAmount,
      } = event.detail

      setShopkeepers((prev) => {
        const existingShopkeeper = prev.find((s) => s.name === shopkeeperName && s.phone === shopkeeperPhone)

        if (existingShopkeeper) {
          return prev.map((s) =>
            s.id === existingShopkeeper.id
              ? {
                  ...s,
                  pendingReceipts: [
                    ...s.pendingReceipts,
                    {
                      receiptNumber,
                      receiptDate,
                      totalAmount,
                      amountReceived,
                      pendingAmount,
                    },
                  ],
                  totalPendingAmount: s.totalPendingAmount + pendingAmount,
                }
              : s,
          )
        } else {
          const newShopkeeper: Shopkeeper = {
            id: Date.now(),
            name: shopkeeperName,
            phone: shopkeeperPhone,
            balance: 0,
            totalOrders: 1,
            status: "active",
            pendingReceipts: [
              {
                receiptNumber,
                receiptDate,
                totalAmount,
                amountReceived,
                pendingAmount,
              },
            ],
            totalPendingAmount: pendingAmount,
          }
          return [...prev, newShopkeeper]
        }
      })
    }

    window.addEventListener("update-shopkeeper-balance", handleBalanceUpdate as EventListener)
    return () => window.removeEventListener("update-shopkeeper-balance", handleBalanceUpdate as EventListener)
  }, [])

  const handlePayment = (shopkeeperId: number, receiptNumber: string) => {
    const amount = Number.parseFloat(paymentAmount)
    if (!amount || amount <= 0) return

    setShopkeepers((prev) =>
      prev.map((shopkeeper) => {
        if (shopkeeper.id === shopkeeperId) {
          const updatedReceipts = shopkeeper.pendingReceipts
            .map((receipt) => {
              if (receipt.receiptNumber === receiptNumber) {
                const newPendingAmount = Math.max(0, receipt.pendingAmount - amount)
                return {
                  ...receipt,
                  amountReceived: receipt.amountReceived + Math.min(amount, receipt.pendingAmount),
                  pendingAmount: newPendingAmount,
                }
              }
              return receipt
            })
            .filter((receipt) => receipt.pendingAmount > 0)

          const newTotalPending = updatedReceipts.reduce((sum, receipt) => sum + receipt.pendingAmount, 0)

          return {
            ...shopkeeper,
            pendingReceipts: updatedReceipts,
            totalPendingAmount: newTotalPending,
          }
        }
        return shopkeeper
      }),
    )

    setPaymentAmount("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shopkeepers</h1>
          <p className="text-muted-foreground">Manage registered shopkeepers and their accounts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Shopkeeper
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search shopkeepers..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopkeepers.map((shopkeeper) => (
          <Card key={shopkeeper.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{shopkeeper.name}</h3>
                  <Badge variant={shopkeeper.status === "active" ? "default" : "outline"}>{shopkeeper.status}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{shopkeeper.phone}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Balance:</span>
                    <span
                      className={`text-sm font-medium ${shopkeeper.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      PKR {Math.abs(shopkeeper.balance).toLocaleString()}
                      {shopkeeper.balance < 0 && " (Due)"}
                    </span>
                  </div>

                  {shopkeeper.totalPendingAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pending Amount:</span>
                      <span className="text-sm font-medium text-red-600">
                        PKR {shopkeeper.totalPendingAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Orders:</span>
                    <span className="text-sm font-medium">{shopkeeper.totalOrders}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => setSelectedShopkeeper(shopkeeper)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedShopkeeper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedShopkeeper.name} - Payment Details</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedShopkeeper(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedShopkeeper.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                  <p className="font-medium text-red-600">
                    PKR {selectedShopkeeper.totalPendingAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedShopkeeper.pendingReceipts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Pending Receipts</h4>
                  {selectedShopkeeper.pendingReceipts.map((receipt) => (
                    <Card key={receipt.receiptNumber} className="border-red-200">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{receipt.receiptNumber}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(receipt.receiptDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="destructive">Pending</Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium">PKR {receipt.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Received</p>
                              <p className="font-medium text-green-600">
                                PKR {receipt.amountReceived.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pending</p>
                              <p className="font-medium text-red-600">PKR {receipt.pendingAmount.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Payment amount"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handlePayment(selectedShopkeeper.id, receipt.receiptNumber)}
                              disabled={!paymentAmount || Number.parseFloat(paymentAmount) <= 0}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedShopkeeper.pendingReceipts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending payments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
