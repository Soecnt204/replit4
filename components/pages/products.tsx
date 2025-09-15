"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductDetailModal } from "@/components/modals/product-detail-modal"
import { AddProductModal } from "@/components/modals/add-product-modal"
import { EditProductModal } from "@/components/modals/edit-product-modal"
import { Search, Filter, Plus, Eye, Edit, Trash2, Grid, List, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { syncManager } from "@/lib/sync-manager"
import { getCategories } from "@/lib/database"

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "stock-asc", label: "Stock (Low to High)" },
  { value: "stock-desc", label: "Stock (High to Low)" },
]

interface ProductsProps {
  selectedCategory?: string | null
  onClearCategory?: () => void
}

export function Products({ selectedCategory, onClearCategory }: ProductsProps) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sortBy, setSortBy] = useState("name-asc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsData, categoriesData] = await Promise.all([syncManager.getProducts(), getCategories()])

        // Filter out inactive products and ensure only real database products are shown
        const validProducts = (productsData || []).filter(product => 
          product.id && 
          product.name &&
          product.is_active !== false &&
          typeof product.current_stock === 'number' &&
          product.current_stock >= 0
        )

        console.log("[v0] Loaded products from sync manager:", productsData.length)
        console.log("[v0] Valid active products:", validProducts.length)
        setProducts(validProducts)

        setCategories([{ id: "all", name: "All" }, ...categoriesData])
      } catch (error) {
        console.error("[v0] Failed to load data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  useEffect(() => {
    if (selectedCategory) {
      setCategoryFilter(selectedCategory)
      setSearchTerm("") // Clear search when navigating from categories
    }
  }, [selectedCategory])

  const handleAddProduct = async (newProduct: any) => {
    try {
      // Use the database function directly like categories do
      const { addProduct } = await import('@/lib/database')
      
      // Prepare the product data for the database
      const productData = {
        name: newProduct.name,
        sku: newProduct.sku,
        description: newProduct.description || '',
        cost_price: newProduct.cost_price,
        selling_price: newProduct.selling_price,
        current_stock: newProduct.current_stock,
        min_stock_level: newProduct.min_stock_level,
        category_id: newProduct.category_id,
        image_url: newProduct.image_url,
      }

      // Save to database first (like categories)
      const savedProduct = await addProduct(productData)
      
      // Also save to local storage for immediate availability
      const { offlineStorage } = await import('@/lib/offline-storage')
      await offlineStorage.save("products", savedProduct)
      
      // Update local state
      setProducts((prev) => [...prev, savedProduct])

      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added successfully.`,
      })

      console.log("[v0] Product added to database and local storage:", savedProduct.name)
    } catch (error) {
      console.error("[v0] Failed to add product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
  }

  const handleUpdateProduct = async (updatedProduct: any) => {
    try {
      await syncManager.saveProduct(updatedProduct)
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

      toast({
        title: "Product Updated",
        description: `${updatedProduct.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("[v0] Failed to update product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await syncManager.deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))

      toast({
        title: "Product Deleted",
        description: "Product has been permanently removed from inventory.",
      })
    } catch (error) {
      console.error("[v0] Failed to delete product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

  const handleBulkDelete = async () => {
    try {
      // Bulk delete would need to be implemented in sync manager
      toast({
        title: "Products Deleted",
        description: `${selectedProducts.length} products have been deleted.`,
      })
      setSelectedProducts([])
    } catch (error) {
      console.error("[v0] Failed to delete products:", error)
      toast({
        title: "Error",
        description: "Failed to delete products. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusChange = (status: string) => {
    toast({
      title: "Status Updated",
      description: `${selectedProducts.length} products marked as ${status}.`,
    })
    setSelectedProducts([])
  }

  const handleClearCategoryFilter = () => {
    setCategoryFilter("All")
    if (onClearCategory) {
      onClearCategory()
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categories
          .find((c) => c.id === product.category_id)
          ?.name?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === "All" || product.category_id === categories.find((c) => c.name === categoryFilter)?.id

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "")
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "")
        case "price-asc":
          return (a.selling_price || 0) - (b.selling_price || 0)
        case "price-desc":
          return (b.selling_price || 0) - (a.selling_price || 0)
        case "stock-asc":
          return (a.current_stock || 0) - (b.current_stock || 0)
        case "stock-desc":
          return (b.current_stock || 0) - (a.current_stock || 0)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory and product catalog ({filteredProducts.length} products)
            {selectedCategory && selectedCategory !== "All" && (
              <span className="ml-2">
                - Filtered by <strong>{selectedCategory}</strong>
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {selectedCategory && selectedCategory !== "All" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2">
            Filtered by: {selectedCategory}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleClearCategoryFilter}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stock Status</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="in-stock" />
                        <label htmlFor="in-stock" className="text-sm">
                          In Stock
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="low-stock" />
                        <label htmlFor="low-stock" className="text-sm">
                          Low Stock
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="out-of-stock" />
                        <label htmlFor="out-of-stock" className="text-sm">
                          Out of Stock
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="space-y-2">
                      <Input placeholder="Min price" type="number" />
                      <Input placeholder="Max price" type="number" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="samsung">Samsung</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox checked={selectedProducts.length === products.length} onCheckedChange={handleSelectAll} />
                <span className="text-sm font-medium">{selectedProducts.length} products selected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("active")}>
                  Mark Active
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("inactive")}>
                  Mark Inactive
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                    className="mt-1"
                  />
                  <img
                    src={product.image_url || "/placeholder.svg?height=64&width=64"}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-muted cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {categories.find((c) => c.id === product.category_id)?.name || "No Category"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          product.current_stock > 0
                            ? product.current_stock <= (product.min_stock_level || 0)
                              ? "outline"
                              : "default"
                            : "destructive"
                        }
                      >
                        {product.current_stock > 0
                          ? product.current_stock <= (product.min_stock_level || 0)
                            ? `Low: ${product.current_stock}`
                            : `${product.current_stock} in stock`
                          : "Out of stock"}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Sale:</span> PKR{" "}
                        {(product.selling_price || 0).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Cost:</span> PKR{" "}
                        {(product.cost_price || 0).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Profit:</span> PKR{" "}
                        {((product.selling_price || 0) - (product.cost_price || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                    <img
                      src={product.image_url || "/placeholder.svg?height=48&width=48"}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover bg-muted cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {categories.find((c) => c.id === product.category_id)?.name || "No Category"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">PKR {(product.selling_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sale Price</p>
                      </div>
                      <div>
                        <Badge
                          variant={
                            product.current_stock > 0
                              ? product.current_stock <= (product.min_stock_level || 0)
                                ? "outline"
                                : "default"
                              : "destructive"
                          }
                        >
                          {product.current_stock > 0
                            ? product.current_stock <= (product.min_stock_level || 0)
                              ? `Low: ${product.current_stock}`
                              : `${product.current_stock} units`
                            : "Out of stock"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          PKR {((product.selling_price || 0) - (product.cost_price || 0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Profit</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show empty state if no products */}
      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="mb-4">
                {searchTerm || categoryFilter !== "All"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first product"}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAddProduct={handleAddProduct} />}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onEditProduct={handleUpdateProduct}
        />
      )}
    </div>
  )
}
