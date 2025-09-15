"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateReturnModalProps {
  onClose: () => void
}

export function CreateReturnModal({ onClose }: CreateReturnModalProps) {
  const [receiptId, setReceiptId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [productName, setProductName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [refundMethod, setRefundMethod] = useState("")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!receiptId || !customerName || !customerPhone || !productName || !quantity || !reason || !refundMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Return Request Created",
      description: `Return request for ${customerName} has been submitted for review.`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Create Return Request</CardTitle>
            <CardDescription>Submit a new product return request</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiptId">Receipt ID *</Label>
              <Input
                id="receiptId"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                placeholder="Enter receipt ID (e.g., R001)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
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
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity to return"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Return Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select return reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Defective product">Defective product</SelectItem>
                  <SelectItem value="Customer changed mind">Customer changed mind</SelectItem>
                  <SelectItem value="Wrong item received">Wrong item received</SelectItem>
                  <SelectItem value="Item not as described">Item not as described</SelectItem>
                  <SelectItem value="Damaged during shipping">Damaged during shipping</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description of the issue..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refundMethod">Preferred Refund Method *</Label>
            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original_payment">Original Payment Method</SelectItem>
                <SelectItem value="store_credit">Store Credit</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supporting Images (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload images to support your return request</p>
              <Button variant="outline" size="sm">
                Choose Images
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Return Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
