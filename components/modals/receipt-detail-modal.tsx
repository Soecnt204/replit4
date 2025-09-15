"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Download, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { syncManager } from "@/lib/sync-manager"

interface ReceiptItem {
  productName: string
  quantity: number
  price: number
  total: number
}

interface ReturnItem {
  productId: number
  productName: string
  quantity: number
  amount: number
  originalPrice: number
}

interface Receipt {
  id: string
  customerName: string
  customerPhone: string
  amount: number
  receivedAmount?: number
  changeAmount?: number
  items: ReceiptItem[]
  returnItems?: ReturnItem[]
  subtotal: number
  discount: number
  returnTotal?: number
  tax: number
  total: number
  paymentMethod: string
  date: string
  status: string
  notes: string
}

interface ReceiptDetailModalProps {
  receipt: Receipt
  onClose: () => void
  onDelete?: (receiptId: string) => void // Add delete callback
}

export function ReceiptDetailModal({ receipt, onClose, onDelete }: ReceiptDetailModalProps) {
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      // Create a canvas element to render the receipt as an image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size
      canvas.width = 600
      canvas.height = 800

      // Set background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set text properties
      ctx.fillStyle = "#000000"
      ctx.font = "20px Arial"
      ctx.textAlign = "center"

      // Draw receipt content
      let y = 40
      ctx.fillText("HZ Shop", canvas.width / 2, y)
      y += 30
      ctx.font = "14px Arial"
      ctx.fillText("Professional Retail Management", canvas.width / 2, y)
      y += 40

      ctx.textAlign = "left"
      ctx.fillText(`Receipt #: ${receipt.id}`, 40, y)
      y += 25
      ctx.fillText(`Date: ${new Date(receipt.date).toLocaleString()}`, 40, y)
      y += 25
      ctx.fillText(`Customer: ${receipt.customerName}`, 40, y)
      y += 25
      ctx.fillText(`Phone: ${receipt.customerPhone}`, 40, y)
      y += 40

      // Draw items
      ctx.font = "bold 16px Arial"
      ctx.fillText("Items:", 40, y)
      y += 25
      ctx.font = "14px Arial"

      receipt.items.forEach((item) => {
        ctx.fillText(`${item.productName} x${item.quantity} @ ₹${item.price.toLocaleString()}`, 40, y)
        ctx.textAlign = "right"
        ctx.fillText(`₹${item.total.toLocaleString()}`, canvas.width - 40, y)
        ctx.textAlign = "left"
        y += 20
      })

      y += 20
      ctx.fillText(`Total: ₹${receipt.total.toLocaleString()}`, 40, y)
      if (receipt.receivedAmount) {
        y += 20
        ctx.fillText(`Received: ₹${receipt.receivedAmount.toLocaleString()}`, 40, y)
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `HZ-Shop-Receipt-${receipt.id}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, "image/png")

      toast({
        title: "Receipt Downloaded",
        description: `Receipt ${receipt.id} has been downloaded as an image.`,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download receipt. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const shareText = generateReceiptText(receipt)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `HZ Shop Receipt #${receipt.id}`,
          text: shareText,
        })
        toast({
          title: "Receipt Shared",
          description: "Receipt has been shared successfully.",
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Receipt Copied",
          description: "Receipt details copied to clipboard for sharing.",
        })
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(shareText)
      toast({
        title: "Receipt Copied",
        description: "Receipt details copied to clipboard for sharing.",
      })
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete receipt #${receipt.id}? This action cannot be undone.`)) {
      try {
        await syncManager.deleteReceipt(receipt.id)
        onDelete?.(receipt.id)
        onClose()
        toast({
          title: "Receipt Deleted",
          description: `Receipt #${receipt.id} has been permanently deleted.`,
        })
      } catch (error) {
        console.error("Delete failed:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete receipt. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const generateReceiptText = (receipt: Receipt) => {
    return `
HZ SHOP RECEIPT
===============

Receipt #: ${receipt.id}
Date: ${new Date(receipt.date).toLocaleString()}
Customer: ${receipt.customerName}
Phone: ${receipt.customerPhone}

ITEMS:
------
${receipt.items
  .map(
    (item) =>
      `${item.productName} x${item.quantity} @ ₹${item.price.toLocaleString()} = ₹${item.total.toLocaleString()}`,
  )
  .join("\n")}

${
  receipt.returnItems && receipt.returnItems.length > 0
    ? `
RETURNS:
--------
${receipt.returnItems
  .map(
    (item) =>
      `${item.productName} x${item.quantity} @ ₹${(item.amount / item.quantity).toLocaleString()} = -₹${item.amount.toLocaleString()}`,
  )
  .join("\n")}
`
    : ""
}

SUMMARY:
--------
Subtotal: ₹${(receipt.subtotal || 0).toLocaleString()}
${(receipt.discount || 0) > 0 ? `Discount: -₹${(receipt.discount || 0).toLocaleString()}\n` : ""}${receipt.returnTotal && receipt.returnTotal > 0 ? `Returns: -₹${receipt.returnTotal.toLocaleString()}\n` : ""}Total: ₹${(receipt.total || 0).toLocaleString()}
${receipt.receivedAmount ? `Received: ₹${receipt.receivedAmount.toLocaleString()}\n` : ""}${receipt.changeAmount && receipt.changeAmount > 0 ? `Change: ₹${receipt.changeAmount.toLocaleString()}\n` : ""}
${receipt.notes ? `\nNotes: ${receipt.notes}\n` : ""}
===============
Thank you for your business!
HZ Shop - Your trusted retail partner
    `.trim()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Receipt #{receipt.id}</CardTitle>
            <CardDescription>{new Date(receipt.date).toLocaleString()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Search className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">HZ Shop</h2>
            <p className="text-muted-foreground">Professional Retail Management</p>
            <Separator className="my-4" />
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="space-y-1">
              <p>
                <strong>Name:</strong> {receipt.customerName}
              </p>
              <p>
                <strong>Phone:</strong> {receipt.customerPhone}
              </p>
              <p>
                <strong>Date:</strong> {new Date(receipt.date).toLocaleString()}
              </p>
              <p className="flex items-center gap-2">
                <strong>Status:</strong>
                <Badge variant={receipt.status === "paid" ? "default" : "outline"}>{receipt.status}</Badge>
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="border rounded-lg">
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted font-medium text-sm">
                <span>Product</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total</span>
              </div>
              {receipt.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-right">₹{item.price.toLocaleString()}</span>
                  <span className="text-right">₹{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Return Items */}
          {receipt.returnItems && receipt.returnItems.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-orange-600">Return Items</h3>
              <div className="border rounded-lg border-orange-200 bg-orange-50/30">
                <div className="grid grid-cols-4 gap-4 p-3 bg-orange-100 font-medium text-sm text-orange-800">
                  <span>Product</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Total</span>
                </div>
                {receipt.returnItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t border-orange-200">
                    <span className="font-medium text-orange-800">{item.productName}</span>
                    <span className="text-center text-orange-700">{item.quantity}</span>
                    <span className="text-right text-orange-700">
                      PKR {(item.amount / item.quantity).toLocaleString()}
                    </span>
                    <span className="text-right font-medium text-orange-800">-PKR {item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {(receipt.subtotal || 0).toLocaleString()}</span>
                </div>
                {(receipt.discount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-PKR {(receipt.discount || 0).toLocaleString()}</span>
                  </div>
                )}
                {receipt.returnTotal && receipt.returnTotal > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Returns:</span>
                    <span>-PKR {receipt.returnTotal.toLocaleString()}</span>
                  </div>
                )}
                {(receipt.tax || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>PKR {(receipt.tax || 0).toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>PKR {(receipt.total || 0).toLocaleString()}</span>
                </div>
                {receipt.receivedAmount && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Received Amount:</span>
                      <span>PKR {receipt.receivedAmount.toLocaleString()}</span>
                    </div>
                    {receipt.changeAmount && receipt.changeAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Change:</span>
                        <span>PKR {receipt.changeAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for your business!</p>
            <p>HZ Shop - Your trusted retail partner</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
