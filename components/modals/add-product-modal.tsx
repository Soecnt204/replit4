"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { syncManager } from "@/lib/sync-manager"

interface AddProductModalProps {
  onClose: () => void
  onAddProduct: (product: any) => void
}

export function AddProductModal({ onClose, onAddProduct }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchasePrice: "",
    salePrice: "",
    stock: "",
    minStock: "",
    description: "",
    youtubeLink: "",
    specifications: {} as Record<string, string>,
  })
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { toast } = useToast()

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const categoriesData = await syncManager.getCategories()
      setCategories(categoriesData || [])
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

  useEffect(() => {
    loadCategories()
  }, [toast])

  // Listen for category updates
  useEffect(() => {
    const handleCategoryUpdates = () => {
      loadCategories()
    }

    window.addEventListener('categoriesUpdated', handleCategoryUpdates)
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdates)
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [newSpecKey]: newSpecValue },
      }))
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return { ...prev, specifications: newSpecs }
    })
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.purchasePrice || !formData.salePrice || !formData.stock) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const selectedCategory = categories.find((cat) => cat.name === formData.category)
    if (!selectedCategory) {
      toast({
        title: "Invalid Category",
        description: "Please select a valid category.",
        variant: "destructive",
      })
      return
    }

    const newProduct = {
      id: `product_${Date.now()}`,
      name: formData.name,
      category_id: selectedCategory.id,
      cost_price: Number(formData.purchasePrice),
      selling_price: Number(formData.salePrice),
      current_stock: Number(formData.stock),
      min_stock_level: Number(formData.minStock) || 5,
      description: formData.description,
      youtube_link: formData.youtubeLink,
      specifications: formData.specifications,
      images: imageUrls,
      image_url: imageUrls[0] || null,
      is_active: true,
      sku: `SKU-${Date.now()}`,
      profit: Number(formData.salePrice) - Number(formData.purchasePrice),
      profit_margin: (
        ((Number(formData.salePrice) - Number(formData.purchasePrice)) / Number(formData.purchasePrice)) *
        100
      ).toFixed(1),
      status: Number(formData.stock) <= Number(formData.minStock || 5) ? "Low Stock" : "In Stock",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onAddProduct(newProduct)
    toast({
      title: "Product Added",
      description: `${formData.name} has been added to your inventory.`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Add a new product to your inventory</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange("minStock", e.target.value)}
                    placeholder="Enter minimum stock level"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="youtubeLink">YouTube Link (Optional)</Label>
                  <Input
                    id="youtubeLink"
                    value={formData.youtubeLink}
                    onChange={(e) => handleInputChange("youtubeLink", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                    placeholder="Enter purchase price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price *</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange("salePrice", e.target.value)}
                    placeholder="Enter sale price"
                  />
                </div>
                {formData.purchasePrice && formData.salePrice && (
                  <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Profit Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Profit per unit:</span>
                        <p className="font-medium text-green-600">
                          ₹{(Number(formData.salePrice) - Number(formData.purchasePrice)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit margin:</span>
                        <p className="font-medium text-green-600">
                          {(
                            ((Number(formData.salePrice) - Number(formData.purchasePrice)) /
                              Number(formData.purchasePrice)) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Specification name (e.g., Brand)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                  />
                  <Input
                    placeholder="Specification value (e.g., Apple)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                  />
                  <Button onClick={addSpecification}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium capitalize">{key}:</span>
                        <span className="ml-2">{value}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSpecification(key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addImageUrl} disabled={!newImageUrl.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Added Images:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 rounded object-cover bg-muted"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/broken-image.png"
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => removeImageUrl(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>• Enter direct image URLs (jpg, png, webp formats recommended)</p>
                    <p>• Images will be displayed in the order you add them</p>
                    <p>• First image will be used as the main product image</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Product</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
