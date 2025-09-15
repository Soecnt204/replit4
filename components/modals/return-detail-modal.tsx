"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReturnItem {
  id: string
  receiptId: string
  customerName: string
  customerPhone: string
  productName: string
  productId: number
  quantity: number
  amount: number
  reason: string
  description: string
  date: string
  status: string
  images: string[]
  approvedBy: string | null
  processedDate: string | null
  refundMethod: string | null
  notes: string
}

interface ReturnDetailModalProps {
  returnItem: ReturnItem
  onClose: () => void
}

export function ReturnDetailModal({ returnItem, onClose }: ReturnDetailModalProps) {
  const { toast } = useToast()

  const handleApprove = () => {
    toast({
      title: "Return Approved",
      description: `Return ${returnItem.id} has been approved for processing.`,
    })
  }

  const handleReject = () => {
    toast({
      title: "Return Rejected",
      description: `Return ${returnItem.id} has been rejected.`,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Return #{returnItem.id}</CardTitle>
            <CardDescription>Return request details</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {returnItem.status === "pending" && (
              <>
                <Button variant="outline" size="sm" className="text-green-600 bg-transparent" onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={handleReject}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Return Status</h3>
              <p className="text-sm text-muted-foreground">Current status of this return request</p>
            </div>
            <Badge
              variant={
                returnItem.status === "approved"
                  ? "default"
                  : returnItem.status === "pending"
                    ? "outline"
                    : "destructive"
              }
              className="text-sm"
            >
              {returnItem.status}
            </Badge>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{returnItem.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{returnItem.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receipt ID</p>
                <p className="font-medium">{returnItem.receiptId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Request Date</p>
                <p className="font-medium">{new Date(returnItem.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3 className="font-semibold mb-3">Product Information</h3>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{returnItem.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{returnItem.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">PKR {returnItem.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Method</p>
                  <p className="font-medium capitalize">
                    {returnItem.refundMethod?.replace("_", " ") || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Return Details */}
          <div>
            <h3 className="font-semibold mb-3">Return Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="font-medium">{returnItem.reason}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{returnItem.description}</p>
              </div>
            </div>
          </div>

          {/* Supporting Images */}
          {returnItem.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Supporting Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {returnItem.images.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Return evidence ${index + 1}`}
                    className="w-full h-24 rounded object-cover bg-muted cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Processing Information */}
          {returnItem.status !== "pending" && (
            <div>
              <h3 className="font-semibold mb-3">Processing Information</h3>
              <div className="border rounded-lg p-4 space-y-2">
                {returnItem.approvedBy && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Processed by:</span>
                    <span className="font-medium">{returnItem.approvedBy}</span>
                  </div>
                )}
                {returnItem.processedDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Processed on:</span>
                    <span className="font-medium">{new Date(returnItem.processedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {returnItem.notes && (
            <div>
              <h3 className="font-semibold mb-3">Admin Notes</h3>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{returnItem.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
