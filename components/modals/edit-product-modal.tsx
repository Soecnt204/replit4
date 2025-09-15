"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { syncManager } from "@/lib/sync-manager"

interface EditProductModalProps {
  product: any
  onClose: () => void
  onEditProduct: (updatedProduct: any) => void
}

export function EditProductModal({ product, onClose, onEditProduct }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    category: "", // Will be set after categories load
    cost_price: product.cost_price || 0,
    selling_price: product.selling_price || 0,
    current_stock: product.current_stock || 0,
    min_stock_level: product.min_stock_level || 0,
    max_stock_level: product.max_stock_level || 100,
    brand: product.brand || "",
    model: product.model || "",
    sku: product.sku || "",
    barcode: product.barcode || "",
    weight: product.weight || 0,
    dimensions: product.dimensions || "",
    color: product.color || "",
    size: product.size || "",
    material: product.material || "",
    warranty_period: product.warranty_period || "",
    supplier_info: product.supplier_info || "",
    images: product.images || [],
    tags: product.tags || [],
    featured: product.featured || false,
    active: product.active !== false,
  })

  const [newImageUrl, setNewImageUrl] = useState("")
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const categoriesData = await syncManager.getCategories()
        setCategories(categoriesData || [])

        if (product.category_id && categoriesData) {
          const currentCategory = categoriesData.find((cat) => cat.id === product.category_id)
          if (currentCategory) {
            setFormData((prev) => ({ ...prev, category: currentCategory.name }))
          }
        }
      } catch (error) {
        console.error("[v0] Failed to load categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [toast, product.category_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedCategory = categories.find((cat) => cat.name === formData.category)
      if (!selectedCategory && formData.category) {
        toast({
          title: "Invalid Category",
          description: "Please select a valid category.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const updatedProduct = {
        ...product,
        ...formData,
        category_id: selectedCategory ? selectedCategory.id : product.category_id, // Use category_id instead of category
        image_url: formData.images[0] || product.image_url, // Set main image URL
        is_active: formData.active, // Map active to is_active
        updated_at: new Date().toISOString(),
      }

      delete updatedProduct.category

      onEditProduct(updatedProduct)

      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully.`,
      })

      onClose()
    } catch (error) {
      console.error("[v0] Failed to update product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }))
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                    {categories.length === 0 && !loadingCategories && (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cost_price: Number.parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, selling_price: Number.parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stock Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_stock">Current Stock *</Label>
                <Input
                  id="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, current_stock: Number.parseInt(e.target.value) || 0 }))
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Min Stock Level</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, min_stock_level: Number.parseInt(e.target.value) || 0 }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_stock_level">Max Stock Level</Label>
                <Input
                  id="max_stock_level"
                  type="number"
                  value={formData.max_stock_level}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_stock_level: Number.parseInt(e.target.value) || 100 }))
                  }
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Images</h3>

            <div className="space-y-2">
              <Label>Add Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
                <Button type="button" onClick={addImageUrl} disabled={!newImageUrl.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = "/broken-image.png"
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Settings</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="featured">Featured Product</Label>
                <p className="text-sm text-muted-foreground">Display this product prominently</p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Product</Label>
                <p className="text-sm text-muted-foreground">Product is available for sale</p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
