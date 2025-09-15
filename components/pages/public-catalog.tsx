"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Share2,
  RefreshCw,
  Eye,
  Search,
  Grid,
  List,
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  X,
  MessageCircle,
  Receipt,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getProducts,
  getCategories,
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/database"
import { CreateReceiptModal } from "@/components/modals/create-receipt-modal"

export function PublicCatalog() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncManager, setSyncManager] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showCart, setShowCart] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [sessionId] = useState(() => {
    // Try to get existing sessionId from localStorage, or create new one
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart_session_id')
      if (stored) {
        console.log("[v0] Using existing cart session:", stored)
        return stored
      }
    }
    const newSession = `session_${Date.now()}_${Math.random()}`
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_session_id', newSession)
      console.log("[v0] Created new cart session:", newSession)
    }
    return newSession
  })

  const { toast } = useToast()

  useEffect(() => {
    const loadSyncManager = async () => {
      try {
        const { syncManager: sm } = await import("@/lib/sync-manager")
        setSyncManager(sm)
        console.log("[v0] SyncManager loaded successfully")
      } catch (error) {
        console.error("[v0] Error loading syncManager:", error)
        setSyncManager(null)
      }
    }
    loadSyncManager()
  }, [])

  useEffect(() => {
    if (syncManager !== undefined) {
      loadData()
    }
  }, [syncManager])

  // Listen for category updates
  useEffect(() => {
    const handleCategoryUpdates = () => {
      if (syncManager) {
        loadData()
      }
    }

    window.addEventListener('categoriesUpdated', handleCategoryUpdates)
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdates)
    }
  }, [syncManager])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading catalog data...")

      // Use same data source as products section - syncManager reads from local storage
      // This ensures consistency and shows only real products that were saved locally
      const [catalogProducts, catalogCategories, cartData] = await Promise.all([
        syncManager ? syncManager.getProducts() : [],
        syncManager ? syncManager.getCategories() : [],
        getCartItems(sessionId),
      ])

      // Filter out inactive products and ensure valid data
      const validProducts = (catalogProducts || []).filter((product: any) => 
        product.id && 
        product.name &&
        product.is_active !== false &&
        typeof product.current_stock === 'number' &&
        product.current_stock >= 0
      )

      console.log("[v0] Loaded products from sync manager:", catalogProducts?.length || 0)
      console.log("[v0] Valid active products:", validProducts.length)
      console.log("[v0] Loaded categories:", catalogCategories?.length || 0)

      setProducts(validProducts)
      setCategories(catalogCategories || [])
      setCartItems(cartData || [])
    } catch (error) {
      console.error("[v0] Error loading catalog data:", error)
      toast({
        title: "Error",
        description: "Failed to load catalog data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory || product.category === selectedCategory

      const isActive = product.is_active !== false && product.status !== "inactive"

      return matchesSearch && matchesCategory && isActive
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        case "stock-high":
          return (b.current_stock || 0) - (a.current_stock || 0)
        case "stock-low":
          return (a.current_stock || 0) - (b.current_stock || 0)
        default:
          return 0
      }
    })

  const handleShareCatalog = () => {
    toast({
      title: "Catalog Shared",
      description: "Public catalog link has been copied to clipboard.",
    })
  }

  const handleUpdateCatalog = () => {
    console.log("[v0] Updating catalog...")
    loadData()
    toast({
      title: "Catalog Updated",
      description: "Public catalog has been refreshed with latest products.",
    })
  }

  const handleAddToCart = async (product: any) => {
    try {
      console.log("[v0] Adding to cart:", product.name)

      const currentStock = Number(product.current_stock) || 0

      if (currentStock <= 0) {
        toast({
          title: "Out of Stock",
          description: `${product.name} is currently out of stock.`,
          variant: "destructive",
        })
        return
      }

      if (!product.id) {
        toast({
          title: "Error",
          description: "Product ID is missing. Please refresh the catalog.",
          variant: "destructive",
        })
        return
      }

      const existingCartItem = cartItems.find((item) => item.product_id === product.id)
      const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0

      if (currentStock <= currentCartQuantity) {
        toast({
          title: "Cannot Add More",
          description: `You already have ${currentCartQuantity} ${product.name} in your cart. Only ${currentStock} available.`,
          variant: "destructive",
        })
        return
      }

      // OPTIMISTIC UPDATE: Update UI immediately for smooth experience
      const newQuantity = currentCartQuantity + 1
      if (existingCartItem) {
        // Update existing item
        const optimisticCartItems = cartItems.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: newQuantity }
            : item
        )
        setCartItems(optimisticCartItems)
      } else {
        // Add new item to cart
        const newCartItem = {
          id: `temp_${Date.now()}`, // Temporary ID for optimistic update
          product_id: product.id,
          quantity: 1,
          product: product
        }
        setCartItems([...cartItems, newCartItem])
      }

      // Show immediate feedback
      toast({
        title: "Added to Cart! 🛒",
        description: `${product.name} (${newQuantity} ${newQuantity === 1 ? "item" : "items"})`,
        duration: 2000,
      })

      // Background database operation
      try {
        await addToCart(sessionId, product.id, 1)
        // Refresh cart from database to get real IDs and ensure consistency
        const updatedCartItems = await getCartItems(sessionId)
        setCartItems(updatedCartItems || [])
      } catch (dbError: any) {
        // Rollback optimistic update on error
        setCartItems(cartItems)
        throw dbError
      }

    } catch (error: any) {
      console.error("[v0] Error adding to cart:", error)

      let errorMessage = "Failed to add item to cart"
      if (error.message?.includes("Insufficient stock")) {
        errorMessage = `${product.name} is out of stock or has insufficient quantity available.`
      } else if (error.message?.includes("Product not found")) {
        errorMessage = `${product.name} is not available in the database. Please refresh the catalog.`
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Cannot Add to Cart",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleAddToWishlist = (product: any) => {
    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been saved to your wishlist.`,
    })
  }

  const updateCartQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      // Store original cart for potential rollback
      const originalCartItems = [...cartItems]
      
      // OPTIMISTIC UPDATE: Update UI immediately for smooth experience
      if (newQuantity <= 0) {
        // Remove item from cart
        const optimisticCartItems = cartItems.filter(item => item.id !== cartItemId)
        setCartItems(optimisticCartItems)
        
        toast({
          title: "Removed from Cart",
          description: "Item removed from cart",
          duration: 1500,
        })
      } else {
        // Update quantity
        const optimisticCartItems = cartItems.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
        setCartItems(optimisticCartItems)
        
        toast({
          title: "Cart Updated",
          description: `Quantity updated to ${newQuantity}`,
          duration: 1500,
        })
      }

      // Background database operation
      try {
        await updateCartItemQuantity(cartItemId, newQuantity)
        // Refresh cart from database to ensure consistency
        const updatedCartItems = await getCartItems(sessionId)
        setCartItems(updatedCartItems || [])
      } catch (dbError: any) {
        // Rollback optimistic update on error
        setCartItems(originalCartItems)
        throw dbError
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      })
    }
  }

  const removeCartItem = async (cartItemId: string) => {
    try {
      // Store original cart for potential rollback
      const originalCartItems = [...cartItems]
      const item = cartItems.find((cartItem) => cartItem.id === cartItemId)
      const itemName = item?.product?.name || "Item"

      // OPTIMISTIC UPDATE: Remove from UI immediately for smooth experience
      const optimisticCartItems = cartItems.filter(cartItem => cartItem.id !== cartItemId)
      setCartItems(optimisticCartItems)

      // Show immediate feedback
      toast({
        title: "Removed from Cart",
        description: `${itemName} has been removed from your cart`,
        duration: 1500,
      })

      // Background database operation
      try {
        await removeFromCart(cartItemId)
        // Refresh cart from database to ensure consistency
        const updatedCartItems = await getCartItems(sessionId)
        setCartItems(updatedCartItems || [])
      } catch (dbError: any) {
        // Rollback optimistic update on error
        setCartItems(originalCartItems)
        throw dbError
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const shareCartViaWhatsApp = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add some items to your cart before sharing.",
        variant: "destructive",
      })
      return
    }

    const cartSummary = cartItems
      .map((item) => {
        const price = item.product?.selling_price || 0
        const total = price * item.quantity
        return `• ${item.product?.name} (Qty: ${item.quantity}) - PKR ${total.toLocaleString()}`
      })
      .join("\n")

    const message = `🛒 *My Cart from HZ Shop*\n\n${cartSummary}\n\n*Total Items:* ${cartItemCount}\n*Cart Total:* PKR ${cartTotal.toLocaleString()}\n\nI'd like to place this order. Please confirm availability and total amount.\n\nShared from HZ Shop Catalog`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    toast({
      title: "Shared via WhatsApp! 📱",
      description: "Your cart details have been shared successfully.",
      duration: 3000,
    })
  }

  const handlePayNow = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add some items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Opening Checkout",
      description: `Processing ${cartItemCount} items for receipt creation...`,
      duration: 2000,
    })

    setShowReceiptModal(true)
    setShowCart(false)
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * (item.product?.selling_price || 0), 0)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const ProductDetailModal = ({ product, onClose }: { product: any; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{product.name || "Unnamed Product"}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.image_url || "/placeholder.svg?height=300&width=300"}
                alt={product.name || "Product"}
                className="w-full h-64 object-cover rounded-lg"
              />
              {product.youtube_url && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Product Video</h4>
                  <div className="aspect-video">
                    <iframe
                      src={product.youtube_url.replace("watch?v=", "embed/")}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Stock Availability</h3>
                <Badge variant={product.current_stock > 0 ? "default" : "destructive"} className="text-base px-3 py-1">
                  {product.current_stock > 0 ? `${product.current_stock || 0} units available` : "Out of Stock"}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {product.specifications && (
                <div>
                  <h4 className="font-medium mb-2">Specifications</h4>
                  <p className="text-sm text-muted-foreground">{String(product.specifications)}</p>
                </div>
              )}

              {product.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{String(product.description)}</p>
                </div>
              )}

              <Button className="w-full" onClick={() => handleAddToCart(product)} disabled={product.current_stock <= 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.current_stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Public Catalog Preview</h1>
          <p className="text-muted-foreground">Preview how customers see your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpdateCatalog}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Catalog
          </Button>
          <Button variant="outline" onClick={() => setShowCart(true)} className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="stock-high">Stock: High to Low</SelectItem>
                      <SelectItem value="stock-low">Stock: Low to High</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {filteredProducts.length} products</p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {products.length === 0
                    ? "No products available in the catalog yet."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
                        <div className="relative overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                          <img
                            src={product.image_url || "/placeholder.svg?height=200&width=300"}
                            alt={product.name || "Product"}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {product.current_stock <= 0 && (
                            <Badge variant="destructive" className="absolute top-2 right-2">
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-sm line-clamp-2">
                                {product.name || "Unnamed Product"}
                              </h3>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 cursor-pointer" onClick={() => setSelectedProduct(product)}>{product.description}</p>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant={product.current_stock > 0 ? "default" : "destructive"}
                                className="text-xs cursor-pointer"
                                onClick={() => setSelectedProduct(product)}
                              >
                                {product.current_stock > 0 ? `${product.current_stock} in stock` : "Out of Stock"}
                              </Badge>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                className="w-full"
                                disabled={product.current_stock <= 0}
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                {product.current_stock > 0 ? "Add to Cart" : "Out of Stock"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <img
                              src={product.image_url || "/placeholder.svg?height=100&width=100"}
                              alt={product.name || "Product"}
                              className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                              onClick={() => setSelectedProduct(product)}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold">{product.name || "Unnamed Product"}</h3>
                                  <p className="text-sm text-muted-foreground cursor-pointer" onClick={() => setSelectedProduct(product)}>{product.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  {product.current_stock <= 0 && <Badge variant="destructive">Out of Stock</Badge>}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={product.current_stock > 0 ? "default" : "destructive"} className="cursor-pointer" onClick={() => setSelectedProduct(product)}>
                                    {product.current_stock > 0
                                      ? `${product.current_stock} units available`
                                      : "Out of Stock"}
                                  </Badge>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    disabled={product.current_stock <= 0}
                                    onClick={() => handleAddToCart(product)}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {product.current_stock > 0 ? "Add to Cart" : "Out of Stock"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>


        <TabsContent value="bundles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Bundles</CardTitle>
              <CardDescription>
                Special product combinations with discounted pricing (10% off when buying multiple items from the same
                category)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.slice(0, 2).map((category) => {
                  const categoryProducts = products
                    .filter((p) => p.category_id === category.id && p.is_active)
                    .slice(0, 3)
                  if (categoryProducts.length < 2) return null

                  const bundlePrice = categoryProducts.reduce((sum, p) => sum + (Number(p.selling_price) || 0), 0)
                  const discountedPrice = Math.floor(bundlePrice * 0.9)

                  return (
                    <Card key={category.id} className="border-2 border-dashed border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">{category.name || "Unnamed Category"} Bundle</h3>
                          <div className="text-right">
                            <Badge variant="secondary">Save 10%</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {categoryProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-2">
                              <img
                                src={product.image_url || "/placeholder.svg?height=50&width=50"}
                                alt={product.name || "Product"}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{product.name || "Unnamed Product"}</p>
                                <p className="text-xs text-muted-foreground">{product.current_stock || 0} in stock</p>
                              </div>
                              {index < categoryProducts.length - 1 && <span className="text-muted-foreground">+</span>}
                            </div>
                          ))}
                        </div>

                        <Button className="w-full bg-transparent" variant="outline">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add Bundle to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No bundles available - add more products to create bundles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Detail Modal */}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Shopping Cart ({cartItemCount} items)</span>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={item.product?.image_url || "/placeholder.svg?height=60&width=60"}
                          alt={item.product?.name || "Product"}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name || "Unnamed Product"}</h4>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCartItem(item.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Items: {cartItemCount}</span>
                    </div>

                    <Button variant="outline" className="w-full bg-transparent" onClick={shareCartViaWhatsApp}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Share Cart via WhatsApp
                    </Button>

                    <Button className="w-full" onClick={handlePayNow}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Pay Now - PKR {cartTotal.toLocaleString()}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showReceiptModal && (
        <CreateReceiptModal
          onClose={() => setShowReceiptModal(false)}
          onCreateReceipt={(receipt) => {
            console.log("[v0] Receipt created:", receipt)
            setShowReceiptModal(false)
            setCartItems([])
            toast({
              title: "Receipt Created Successfully! 🧾",
              description: `Receipt ${receipt.receiptNumber} for ${receipt.customerName} has been generated. Cart has been cleared.`,
              duration: 5000,
            })
          }}
          cartItems={cartItems}
        />
      )}

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowCart(true)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart ({cartItemCount})
              </Button>
              <Button variant="outline" onClick={shareCartViaWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </Button>
            </div>
            <Button onClick={handlePayNow} className="bg-green-600 hover:bg-green-700">
              <Receipt className="h-4 w-4 mr-2" />
              Pay Now - PKR {cartTotal.toLocaleString()}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
