"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, Search, RotateCcw, Edit2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { syncManager } from "@/lib/sync-manager"
import { getProducts } from "@/lib/database"
import { offlineStorage } from "@/lib/offline-storage"

interface CreateReceiptModalProps {
  onClose: () => void
  onCreateReceipt: (receipt: any) => void
  onCreateReturn?: (returnData: any) => void
  cartItems?: any[]
}

interface ReceiptItem {
  productId: number
  productName: string
  price: number
  quantity: number
  total: number
}

interface ReturnItem {
  productId: number
  productName: string
  quantity: number
  amount: number
  originalPrice: number
}

export function CreateReceiptModal({ onClose, onCreateReceipt, onCreateReturn, cartItems }: CreateReceiptModalProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [shopkeepers, setShopkeepers] = useState<any[]>([])
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([])
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [amountReceived, setAmountReceived] = useState(0)
  const [notes, setNotes] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [selectedReturnProduct, setSelectedReturnProduct] = useState<number | null>(null)
  const [returnQuantity, setReturnQuantity] = useState(1)
  const [returnProductPrice, setReturnProductPrice] = useState(0)
  const [returnProductSearch, setReturnProductSearch] = useState("")
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const [tempPrice, setTempPrice] = useState("")
  const [editingReturnPrice, setEditingReturnPrice] = useState<number | null>(null)
  const [tempReturnPrice, setTempReturnPrice] = useState("")
  const [previousReceipts, setPreviousReceipts] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingProducts(true)
        console.log("[v0] Loading receipt modal data...")

        const [syncProducts, dbProducts, shopkeepersData] = await Promise.all([
          syncManager.getProducts(),
          getProducts(),
          syncManager.getShopkeepers(),
        ])

        // Combine products from both sources, preferring sync manager data
        const allProducts = [...(syncProducts || []), ...(dbProducts || [])]
        const uniqueProducts = allProducts.filter(
          (product, index, self) => index === self.findIndex((p) => p.id === product.id),
        )

        console.log("[v0] Loaded products for receipt:", uniqueProducts.length)
        setProducts(uniqueProducts)
        setShopkeepers(shopkeepersData || [])
      } catch (error) {
        console.error("[v0] Failed to load data for receipt:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingProducts(false)
      }
    }

    loadData()
  }, [toast])

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        const receiptsData = await syncManager.getReceipts()
        setPreviousReceipts(receiptsData || [])
      } catch (error) {
        console.error("[v0] Failed to load receipts for returns:", error)
      }
    }

    loadReceipts()
  }, [])

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const cartReceiptItems = cartItems.map((item) => ({
        productId: item.product_id,
        productName: item.product?.name || "Unknown Product",
        price: item.product?.selling_price || 0,
        quantity: item.quantity,
        total: (item.product?.selling_price || 0) * item.quantity,
      }))
      setItems(cartReceiptItems)
      console.log("[v0] Auto-populated receipt with cart items:", cartReceiptItems.length)
    }
  }, [cartItems])

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value)

    if (value.length > 0) {
      const suggestions = shopkeepers
        .filter((shopkeeper) => shopkeeper.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
      setCustomerSuggestions(suggestions)
      setShowCustomerSuggestions(suggestions.length > 0)
    } else {
      setShowCustomerSuggestions(false)
    }
  }

  const selectCustomer = (shopkeeper: any) => {
    setCustomerName(shopkeeper.name)
    setCustomerPhone(shopkeeper.phone)
    setShowCustomerSuggestions(false)
  }

  const addItem = async (product: any) => {
    const requestedQuantity = 1
    const existingItem = items.find((item) => item.productId === product.id)
    const totalQuantity = existingItem ? existingItem.quantity + requestedQuantity : requestedQuantity

    if (product.current_stock < totalQuantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.current_stock} units available for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item,
        ),
      )
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          price: product.selling_price || 0,
          quantity: 1,
          total: product.selling_price || 0,
        },
      ])
    }
    setProductSearch("")
  }

  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && product.current_stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.current_stock} units available for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    setItems(
      items.map((item) => (item.productId === productId ? { ...item, quantity, total: quantity * item.price } : item)),
    )
  }

  const updateItemPrice = (productId: number, newPrice: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, price: newPrice, total: item.quantity * newPrice } : item,
      ),
    )
  }

  const startEditingPrice = (productId: number, currentPrice: number) => {
    setEditingPrice(productId)
    setTempPrice(currentPrice.toString())
  }

  const savePrice = (productId: number) => {
    const newPrice = Number.parseFloat(tempPrice) || 0
    if (newPrice > 0) {
      updateItemPrice(productId, newPrice)
    }
    setEditingPrice(null)
    setTempPrice("")
  }

  const cancelEditingPrice = () => {
    setEditingPrice(null)
    setTempPrice("")
  }

  const removeItem = (productId: number) => {
    setItems(items.filter((item) => item.productId !== productId))
  }

  const updateReturnItemPrice = (productId: number, newPrice: number) => {
    setReturnItems(
      returnItems.map((item) => (item.productId === productId ? { ...item, amount: item.quantity * newPrice } : item)),
    )
  }

  const startEditingReturnPrice = (productId: number, currentAmount: number, quantity: number) => {
    setEditingReturnPrice(productId)
    setTempReturnPrice((currentAmount / quantity).toString())
  }

  const saveReturnPrice = (productId: number, quantity: number) => {
    const newPrice = Number.parseFloat(tempReturnPrice) || 0
    if (newPrice > 0) {
      updateReturnItemPrice(productId, newPrice)
    }
    setEditingReturnPrice(null)
    setTempReturnPrice("")
  }

  const cancelEditingReturnPrice = () => {
    setEditingReturnPrice(null)
    setTempReturnPrice("")
  }

  const removeReturnItem = (productId: number) => {
    setReturnItems(returnItems.filter((item) => item.productId !== productId))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const returnTotal = returnItems.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal - discount - returnTotal
  const pendingAmount = Math.max(0, total - amountReceived)

  const handleSubmit = async () => {
    console.log("[v0] Starting receipt creation...")
    console.log("[v0] Customer:", customerName, customerPhone)
    console.log("[v0] Items:", items.length)

    if (!customerName || !customerPhone || items.length === 0) {
      console.log("[v0] Validation failed - missing required fields")
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Validating stock...")
      const stockValidation = await validateStockForReceipt(
        items.map((item) => ({ productId: item.productId.toString(), quantity: item.quantity })),
      )

      if (!stockValidation.isValid) {
        console.log("[v0] Stock validation failed:", stockValidation.invalidItems)
        const errorMessage = stockValidation.invalidItems
          .map((item) => `${item.productName}: Need ${item.requestedQuantity}, Available ${item.availableStock}`)
          .join("\n")

        toast({
          title: "Insufficient Stock",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Creating receipt...")
      const newReceipt = {
        id: `RCP-${Date.now()}`,
        receiptNumber: `RCP-${Date.now()}`,
        shopName: "HZ Shop",
        customerName,
        customerPhone,
        items,
        returnItems,
        subtotal,
        discount,
        returnTotal,
        total,
        receivedAmount: amountReceived,
        changeAmount: Math.max(0, amountReceived - total),
        notes,
        date: new Date().toISOString(),
        status: "Completed",
        createdBy: "Admin",
      }

      console.log("[v0] Saving receipt to sync manager...")
      await syncManager.saveReceipt(newReceipt)

      console.log("[v0] Updating product stock...")
      for (const item of items) {
        await updateProductStock(item.productId.toString(), item.quantity)
      }

      onCreateReceipt(newReceipt)

      console.log("[v0] Creating/updating shopkeeper...")
      await syncManager.createOrUpdateShopkeeper({
        name: customerName,
        phone: customerPhone,
        receiptNumber: newReceipt.receiptNumber,
        receiptDate: newReceipt.date,
        totalAmount: total,
        amountReceived,
        pendingAmount: Math.max(0, total - amountReceived),
      })

      window.dispatchEvent(
        new CustomEvent("update-shopkeeper-balance", {
          detail: {
            shopkeeperName: customerName,
            shopkeeperPhone: customerPhone,
            receiptNumber: newReceipt.receiptNumber,
            receiptDate: newReceipt.date,
            totalAmount: total,
            amountReceived,
            pendingAmount: Math.max(0, total - amountReceived),
          },
        }),
      )

      if (returnItems.length > 0) {
        for (const returnItem of returnItems) {
          const returnData = {
            id: `RT-${Date.now()}-${returnItem.productId}`,
            receiptId: newReceipt.receiptNumber,
            customerName,
            customerPhone,
            productName: returnItem.productName,
            productId: returnItem.productId,
            quantity: returnItem.quantity,
            amount: returnItem.amount,
            reason: "Return processed during receipt creation",
            description: "Return item processed automatically",
            date: new Date().toISOString(),
            status: "approved",
            images: [],
            approvedBy: "System",
            processedDate: new Date().toISOString(),
            refundMethod: "cash",
            notes: `Return created during receipt generation for ${newReceipt.receiptNumber}`,
          }

          await syncManager.saveReturn(returnData)
          if (onCreateReturn) {
            onCreateReturn(returnData)
          }
        }
      }

      console.log("[v0] Receipt created successfully!")
      toast({
        title: "Receipt Created",
        description: `Receipt ${newReceipt.receiptNumber} for ${customerName} has been created successfully.${
          returnItems.length > 0 ? ` ${returnItems.length} return(s) also recorded.` : ""
        }`,
      })
      onClose()
    } catch (error) {
      console.error("[v0] Failed to create receipt:", error)
      toast({
        title: "Error",
        description: `Failed to create receipt: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  const handleAddReturn = () => {
    if (!selectedReturnProduct || returnProductPrice <= 0) {
      toast({
        title: "Missing Return Information",
        description: "Please select a product and enter a valid return price.",
        variant: "destructive",
      })
      return
    }

    const allReceiptItems = previousReceipts.flatMap(
      (receipt) =>
        receipt.items?.map((item: any) => ({
          ...item,
          receiptId: receipt.receiptNumber,
          receiptDate: receipt.date,
          customerName: receipt.customerName,
        })) || [],
    )

    const selectedProduct = allReceiptItems.find((item) => item.productId === selectedReturnProduct)
    if (!selectedProduct) return

    const newReturn: ReturnItem = {
      productId: selectedReturnProduct,
      productName: selectedProduct.productName,
      quantity: returnQuantity,
      amount: returnProductPrice * returnQuantity,
      originalPrice: selectedProduct.price,
    }

    setReturnItems([...returnItems, newReturn])
    setSelectedReturnProduct(null)
    setReturnQuantity(1)
    setReturnProductPrice(0)
    setReturnProductSearch("")
    setShowReturnForm(false)

    toast({
      title: "Return Added",
      description: `Return for ${selectedProduct.productName} has been added to this receipt.`,
    })
  }

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const allReceiptItems = previousReceipts.flatMap(
    (receipt) =>
      receipt.items?.map((item: any) => ({
        ...item,
        receiptId: receipt.receiptNumber,
        receiptDate: receipt.date,
        customerName: receipt.customerName,
      })) || [],
  )

  const filteredPreviousItems = allReceiptItems.filter((item) =>
    item.productName?.toLowerCase().includes(returnProductSearch.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Create New Receipt</CardTitle>
            <CardDescription>Generate a new sales receipt</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                onFocus={() => customerName.length > 0 && setShowCustomerSuggestions(customerSuggestions.length > 0)}
                placeholder="Enter customer name"
              />
              {showCustomerSuggestions && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 border rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                  {customerSuggestions.map((shopkeeper) => (
                    <div
                      key={shopkeeper.id}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => selectCustomer(shopkeeper)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{shopkeeper.name}</p>
                          <p className="text-sm text-muted-foreground">{shopkeeper.phone}</p>
                        </div>
                        <Badge variant="outline">{shopkeeper.totalOrders || 0} orders</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone *</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="productSearch">Add Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="productSearch"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={loadingProducts ? "Loading products..." : "Search products to add..."}
                  className="pl-10"
                  disabled={loadingProducts}
                />
              </div>
              {productSearch && !loadingProducts && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => addItem(product)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              PKR {(product.selling_price || 0).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline">{product.current_stock || 0} in stock</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground">
                      No products found matching "{productSearch}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Items */}
            {items.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selected Items</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReturnForm(!showReturnForm)}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return Product
                  </Button>
                </div>
                <div className="border rounded-lg">
                  {items.map((item) => (
                    <div key={item.productId} className="p-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <div className="flex items-center gap-2">
                            {editingPrice === item.productId ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-24 h-6 text-xs"
                                  placeholder="Price"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => savePrice(item.productId)}
                                  className="h-6 px-2"
                                >
                                  ✓
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEditingPrice} className="h-6 px-2">
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">PKR {item.price.toLocaleString()} each</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingPrice(item.productId, item.price)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.productId, Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="font-medium w-24 text-right">PKR {item.total.toLocaleString()}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return Form */}
            {showReturnForm && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Add Return Item</CardTitle>
                  <CardDescription>Select a product from previous sales to return</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Previous Sales</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={returnProductSearch}
                        onChange={(e) => setReturnProductSearch(e.target.value)}
                        placeholder="Search products from previous sales..."
                        className="pl-10"
                      />
                    </div>
                    {returnProductSearch && (
                      <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                        {filteredPreviousItems.map((item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setSelectedReturnProduct(item.productId)
                              setReturnProductPrice(item.price)
                              setReturnProductSearch("")
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Receipt: {item.receiptId} • {item.customerName} •{" "}
                                  {new Date(item.receiptDate).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="text-sm font-medium">PKR {item.price.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Selected Product</Label>
                      <Input
                        value={
                          selectedReturnProduct
                            ? allReceiptItems.find((p) => p.productId === selectedReturnProduct)?.productName || ""
                            : ""
                        }
                        placeholder="Search and select product above"
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Return Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={returnQuantity}
                        onChange={(e) => setReturnQuantity(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Return Price (PKR)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={returnProductPrice}
                        onChange={(e) => setReturnProductPrice(Number.parseFloat(e.target.value) || 0)}
                        placeholder="Enter return price"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddReturn} size="sm">
                      Add Return
                    </Button>
                    <Button variant="outline" onClick={() => setShowReturnForm(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Return Items Display */}
            {returnItems.length > 0 && (
              <div className="space-y-2">
                <Label>Return Items</Label>
                <div className="border rounded-lg border-orange-200 bg-orange-50/30">
                  {returnItems.map((returnItem, index) => (
                    <div key={`${returnItem.productId}-${index}`} className="p-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-orange-800">{returnItem.productName}</p>
                          <div className="flex items-center gap-2">
                            {editingReturnPrice === returnItem.productId ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={tempReturnPrice}
                                  onChange={(e) => setTempReturnPrice(e.target.value)}
                                  className="w-24 h-6 text-xs"
                                  placeholder="Price"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveReturnPrice(returnItem.productId, returnItem.quantity)}
                                  className="h-6 px-2"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditingReturnPrice}
                                  className="h-6 px-2"
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-orange-600">
                                  Qty: {returnItem.quantity} • Price: PKR
                                  {(returnItem.amount / returnItem.quantity).toLocaleString()}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    startEditingReturnPrice(
                                      returnItem.productId,
                                      returnItem.amount,
                                      returnItem.quantity,
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-orange-800">-PKR {returnItem.amount.toLocaleString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReturnItem(returnItem.productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (PKR)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number.parseInt(e.target.value) || 0)}
                placeholder="Enter discount amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Amount Received (PKR)</Label>
              <Input
                id="amountReceived"
                type="number"
                min="0"
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter amount received"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">Receipt Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-PKR {discount.toLocaleString()}</span>
                </div>
                {returnTotal > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Returns:</span>
                    <span>-PKR {returnTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Amount Received:</span>
                  <span>PKR {amountReceived.toLocaleString()}</span>
                </div>
                {pendingAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Pending Amount:</span>
                    <span>PKR {pendingAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Receipt</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function validateStockForReceipt(items: { productId: string; quantity: number }[]) {
  try {
    console.log("[v0] Validating stock for items:", items)

    const { getProducts } = await import("@/lib/database")
    const { syncManager } = await import("@/lib/sync-manager")

    // Get products from both sources
    const [dbProducts, syncProducts] = await Promise.all([getProducts(), syncManager.getProducts()])

    // Combine and deduplicate products
    const allProducts = [...(dbProducts || []), ...(syncProducts || [])]
    const products = allProducts.filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))

    console.log("[v0] Available products for validation:", products.length)
    const invalidItems: any[] = []

    for (const item of items) {
      const product = products.find((p) => p.id.toString() === item.productId)
      console.log("[v0] Checking product:", item.productId, "found:", !!product, "stock:", product?.current_stock)

      if (!product || (product.current_stock || 0) < item.quantity) {
        invalidItems.push({
          productName: product?.name || "Unknown Product",
          requestedQuantity: item.quantity,
          availableStock: product?.current_stock || 0,
        })
      }
    }

    console.log("[v0] Stock validation result:", { isValid: invalidItems.length === 0, invalidItems })
    return {
      isValid: invalidItems.length === 0,
      invalidItems,
    }
  } catch (error) {
    console.error("[v0] Stock validation error:", error)
    return { isValid: false, invalidItems: [] }
  }
}

async function updateProductStock(productId: string, quantity: number) {
  try {
    // First try to update stock in local storage (sync manager)
    const localProducts = await offlineStorage.getAll("products")
    const localProduct = localProducts.find((p: any) => p.id === productId)
    
    if (localProduct) {
      // Update stock in local storage
      const newStock = Math.max(0, (localProduct.current_stock || 0) - quantity)
      const updatedProduct = { ...localProduct, current_stock: newStock }
      await offlineStorage.save("products", updatedProduct)
      console.log(`[v0] Updated local stock for product ${productId}: ${localProduct.current_stock} -> ${newStock}`)
      
      // Also update in sync manager for persistence
      await syncManager.saveProduct(updatedProduct)
    }

    // Also try to update in database if product exists there
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: dbProduct } = await supabase
      .from("products")
      .select("id, name, current_stock")
      .eq("id", productId)
      .single()

    if (dbProduct) {
      // Product exists in database, update it there too
      const { updateProductStock: dbUpdateStock } = await import("@/lib/database")
      await dbUpdateStock(productId, quantity)
      console.log(`[v0] Updated database stock for product ${productId}: -${quantity}`)
    }

    // If product exists in neither local nor database, log a warning
    if (!localProduct && !dbProduct) {
      console.warn(`[v0] Product ${productId} not found in local storage or database`)
    }

  } catch (error) {
    console.error(`[v0] Stock update error for product ${productId}:`, error)
    // Don't throw error to prevent receipt creation failure
    console.log(`[v0] Continuing receipt creation despite stock update failure`)
  }
}
