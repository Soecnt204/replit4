"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Edit, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  category_id: string
  cost_price: number
  selling_price: number
  current_stock: number
  min_stock_level: number
  images: string[]
  status: string
  description: string
  specifications: Record<string, string>
  youtube_link: string
  created_at: string
  updated_at: string
}

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
}

export function ProductDetailModal({ product, onClose, onEdit, onDelete }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images || []
  const hasImages = images.length > 0

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product.id)
    }
  }

  console.log("[v0] Displaying product details:", {
    id: product.id,
    name: product.name,
    category: product.category,
    category_id: product.category_id,
    images: product.images?.length || 0,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">{product.name || "Unnamed Product"}</CardTitle>
            <CardDescription>{product.category || product.category_id || "No Category"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative">
                    <img
                      src={hasImages ? images[currentImageIndex] : "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 rounded-lg object-cover bg-muted"
                      onError={(e) => {
                        e.currentTarget.src = "/broken-image.png"
                      }}
                    />
                    {hasImages && images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {hasImages && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className={`w-16 h-16 rounded object-cover cursor-pointer ${
                            index === currentImageIndex ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                          onError={(e) => {
                            e.currentTarget.src = "/broken-image.png"
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Product Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={product.status === "active" ? "default" : "destructive"}>
                          {product.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-medium">
                          {product.current_stock} units
                          {product.current_stock <= product.min_stock_level && (
                            <Badge variant="outline" className="ml-2">
                              Low Stock
                            </Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Stock:</span>
                        <span>{product.min_stock_level} units</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Pricing</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="font-medium">₹{(product.cost_price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sale Price:</span>
                        <span className="font-medium">₹{(product.selling_price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit per unit:</span>
                        <span className="font-medium text-green-600">
                          ₹{((product.selling_price || 0) - (product.cost_price || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit margin:</span>
                        <span className="font-medium text-green-600">
                          {product.cost_price && product.cost_price > 0
                            ? (
                                (((product.selling_price || 0) - (product.cost_price || 0)) / product.cost_price) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>

                  {product.youtube_link && (
                    <div>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <a href={product.youtube_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Watch Product Video
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications &&
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-3 border rounded-lg">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              {hasImages ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-48 rounded-lg object-cover bg-muted"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No images available for this product</div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="font-medium">Date Added:</span>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="font-medium">Last Updated:</span>
                  <span>{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Recent Changes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Stock updated from 15 to {product.current_stock}</span>
                      <span className="text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Price updated to ₹{(product.selling_price || 0).toLocaleString()}</span>
                      <span className="text-muted-foreground">1 week ago</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Product added to inventory</span>
                      <span className="text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
