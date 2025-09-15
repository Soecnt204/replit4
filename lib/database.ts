import { createClient } from "@/lib/supabase/client"

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  cost_price: number
  selling_price: number
  current_stock: number
  min_stock_level: number
  is_active: boolean
  category_id: string
  image_url?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
  product_count?: number
}

export interface Receipt {
  id: string
  receipt_number: string
  shopkeeper_id: string
  subtotal: number
  return_total: number
  final_total: number
  amount_received: number
  pending_amount: number
  created_at: string
  updated_at: string
  shopkeeper?: Shopkeeper
  receipt_items?: ReceiptItem[]
}

export interface Shopkeeper {
  id: string
  name: string
  contact?: string
  address?: string
  credit_limit: number
  current_balance: number
  total_purchases: number
  created_at: string
  updated_at: string
}

export interface ReceiptItem {
  id: string
  receipt_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Cart {
  id: string
  session_id: string
  created_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  product?: Product
  cart?: Cart
}

export interface StockMovement {
  id: string
  product_id: string
  type: "in" | "out"
  quantity: number
  reason: string
  created_at: string
}

export async function getDashboardMetrics() {
  const supabase = createClient()

  try {
    // Get total products count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get total categories count
    const { count: totalCategories } = await supabase.from("categories").select("*", { count: "exact", head: true })

    // Get today's receipts and revenue
    const today = new Date().toISOString().split("T")[0]
    const { data: todayReceipts, count: todayReceiptsCount } = await supabase
      .from("receipts")
      .select("final_total", { count: "exact" })
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`)

    const todayRevenue = todayReceipts?.reduce((sum, receipt) => sum + (receipt.final_total || 0), 0) || 0

    // Get low stock items
    const { data: lowStockItems, count: lowStockCount } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .lte("current_stock", "min_stock_level")
      .eq("is_active", true)

    // Get active shopkeepers count
    const { count: activeShopkeepers } = await supabase.from("shopkeepers").select("*", { count: "exact", head: true })

    // Calculate monthly growth (simplified - comparing this month vs last month)
    const thisMonth = new Date()
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1)
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)

    const { data: thisMonthSales } = await supabase
      .from("receipts")
      .select("final_total")
      .gte("created_at", thisMonthStart.toISOString())

    const { data: lastMonthSales } = await supabase
      .from("receipts")
      .select("final_total")
      .gte("created_at", lastMonth.toISOString())
      .lt("created_at", thisMonthStart.toISOString())

    const thisMonthTotal = thisMonthSales?.reduce((sum, receipt) => sum + (receipt.final_total || 0), 0) || 0
    const lastMonthTotal = lastMonthSales?.reduce((sum, receipt) => sum + (receipt.final_total || 0), 0) || 0
    const monthlyGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

    return {
      totalProducts: totalProducts || 0,
      totalCategories: totalCategories || 0,
      todayReceipts: todayReceiptsCount || 0,
      todayRevenue,
      lowStockItems: lowStockCount || 0,
      activeShopkeepers: activeShopkeepers || 0,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      lowStockProducts: lowStockItems || [],
    }
  } catch (error) {
    console.error("[v0] Error fetching dashboard metrics:", error)
    throw error
  }
}

export async function getRecentActivity(limit = 5) {
  const supabase = createClient()

  try {
    // Get recent receipts
    const { data: recentReceipts } = await supabase
      .from("receipts")
      .select(`
        id,
        receipt_number,
        final_total,
        created_at,
        shopkeeper:shopkeepers(name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    // Get recent returns
    const { data: recentReturns } = await supabase
      .from("returns")
      .select(`
        id,
        return_number,
        total_amount,
        status,
        created_at,
        shopkeeper:shopkeepers(name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    // Get recent low stock alerts
    const { data: lowStockAlerts } = await supabase
      .from("products")
      .select("id, name, current_stock, min_stock_level, updated_at")
      .lte("current_stock", "min_stock_level")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(limit)

    // Combine and format activities
    const activities = [
      ...(recentReceipts?.map((receipt) => ({
        id: `receipt-${receipt.id}`,
        type: "sale" as const,
        description: `Receipt #${receipt.receipt_number} - PKR ${receipt.final_total?.toLocaleString()}`,
        time: formatTimeAgo(receipt.created_at),
        status: "completed" as const,
      })) || []),
      ...(recentReturns?.map((returnItem) => ({
        id: `return-${returnItem.id}`,
        type: "return" as const,
        description: `Return #${returnItem.return_number} - PKR ${returnItem.total_amount?.toLocaleString()}`,
        time: formatTimeAgo(returnItem.created_at),
        status: returnItem.status as "pending" | "completed" | "cancelled",
      })) || []),
      ...(lowStockAlerts?.map((product) => ({
        id: `stock-${product.id}`,
        type: "stock" as const,
        description: `Low stock alert: ${product.name}`,
        time: formatTimeAgo(product.updated_at),
        status: "warning" as const,
      })) || []),
    ]

    // Sort by time and return limited results
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, limit)
  } catch (error) {
    console.error("[v0] Error fetching recent activity:", error)
    throw error
  }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

export async function getCategories() {
  const supabase = createClient()

  try {
    const { data: categories, error } = await supabase.from("categories").select("*").order("name")

    if (error) throw error

    // Calculate product count for each category separately
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)
          .eq("is_active", true)

        return {
          ...category,
          product_count: count || 0,
        }
      }),
    )

    return categoriesWithCount
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    throw error
  }
}

export async function addCategory(categoryData: {
  name: string
  description?: string
  image_url?: string
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("categories").insert([categoryData]).select().single()

    if (error) throw error
    
    // Also save to local storage for immediate availability
    const { offlineStorage } = await import('./offline-storage')
    await offlineStorage.save("categories", data)
    
    return data
  } catch (error) {
    console.error("[v0] Error adding category:", error)
    throw error
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient()

  try {
    // Check if category has products
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("is_active", true)

    if (count && count > 0) {
      throw new Error("Cannot delete category with existing products")
    }

    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) throw error
    
    // Also remove from local storage
    const { offlineStorage } = await import('./offline-storage')
    await offlineStorage.delete("categories", categoryId)
    
    return true
  } catch (error) {
    console.error("[v0] Error deleting category:", error)
    throw error
  }
}

export async function getProducts(categoryId?: string) {
  const supabase = createClient()

  try {
    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("is_active", true)
      .order("name")

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    throw error
  }
}

export async function addProduct(productData: {
  name: string
  sku: string
  description?: string
  cost_price: number
  selling_price: number
  current_stock: number
  min_stock_level: number
  category_id: string
  image_url?: string
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          ...productData,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("[v0] Error adding product:", error)
    throw error
  }
}

export async function updateProduct(productId: string, productData: Partial<Product>) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("products").update(productData).eq("id", productId).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(productId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("products").update({ is_active: false }).eq("id", productId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    throw error
  }
}

export async function getCartItems(sessionId: string) {
  const supabase = createClient()

  try {
    // First get the cart for this session
    const { data: cart } = await supabase.from("cart").select("id").eq("session_id", sessionId).single()

    if (!cart) {
      return []
    }

    // Then get cart items with product details
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products(*)
      `)
      .eq("cart_id", cart.id)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching cart items:", error)
    return []
  }
}

export async function addToCart(sessionId: string, productId: string, quantity = 1) {
  const supabase = createClient()
  console.log("[v0] DEBUG: addToCart called", { sessionId: sessionId.substring(0, 20) + "...", productId, quantity })

  try {
    console.log("[v0] DEBUG: Fetching product details for", productId)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("current_stock, name, is_active")
      .eq("id", productId)
      .single()
    
    if (productError) {
      console.log("[v0] DEBUG: Product fetch error", productError)
      throw new Error(`Product fetch failed: ${productError.message || JSON.stringify(productError)}`)
    }

    if (!product) {
      throw new Error("Product not found")
    }

    if (!product.is_active) {
      throw new Error("Product is not available")
    }

    if (product.current_stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.current_stock}`)
    }

    // Get or create cart
    let { data: cart } = await supabase.from("cart").select("*").eq("session_id", sessionId).single()

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from("cart")
        .insert([{ session_id: sessionId }])
        .select()
        .single()

      if (cartError) throw cartError
      cart = newCart
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (product.current_stock < newQuantity) {
        throw new Error(`Insufficient stock. Available: ${product.current_stock}, Requested: ${newQuantity}`)
      }

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from("cart_items")
        .insert([{ cart_id: cart.id, product_id: productId, quantity }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error("[v0] Error adding to cart:", error)
    // Ensure we always throw a proper Error object with a message
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`Add to cart failed: ${typeof error === 'object' ? JSON.stringify(error) : error}`)
    }
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const supabase = createClient()

  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId)
    }

    // Check stock before updating
    const { data: cartItem } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products(current_stock, name)
      `)
      .eq("id", cartItemId)
      .single()

    if (!cartItem || !cartItem.product) {
      throw new Error("Cart item not found")
    }

    if (cartItem.product.current_stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${cartItem.product.current_stock}`)
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("[v0] Error updating cart item:", error)
    throw error
  }
}

export async function removeFromCart(cartItemId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error removing from cart:", error)
    throw error
  }
}

export async function clearCart(sessionId: string) {
  const supabase = createClient()

  try {
    const { data: cart } = await supabase.from("cart").select("id").eq("session_id", sessionId).single()

    if (cart) {
      const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id)

      if (error) throw error
    }
    return true
  } catch (error) {
    console.error("[v0] Error clearing cart:", error)
    throw error
  }
}

export async function validateStockForReceipt(items: Array<{ productId: string; quantity: number }>) {
  const supabase = createClient()

  try {
    const stockChecks = await Promise.all(
      items.map(async (item) => {
        const { data: product } = await supabase
          .from("products")
          .select("id, name, current_stock")
          .eq("id", item.productId)
          .single()

        return {
          productId: item.productId,
          productName: product?.name || "Unknown",
          requestedQuantity: item.quantity,
          availableStock: product?.current_stock || 0,
          isValid: (product?.current_stock || 0) >= item.quantity,
        }
      }),
    )

    const invalidItems = stockChecks.filter((check) => !check.isValid)

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
      stockChecks,
    }
  } catch (error) {
    console.error("[v0] Error validating stock:", error)
    throw error
  }
}

export async function updateProductStock(productId: string, quantitySold: number) {
  const supabase = createClient()

  try {
    // Get current stock
    const { data: product } = await supabase.from("products").select("current_stock, name").eq("id", productId).single()

    if (!product) {
      throw new Error("Product not found")
    }

    const newStock = Math.max(0, product.current_stock - quantitySold)

    // Update product stock
    const { error: updateError } = await supabase
      .from("products")
      .update({ current_stock: newStock })
      .eq("id", productId)

    if (updateError) throw updateError

    // Record stock movement
    const { error: movementError } = await supabase.from("stock_movements").insert([
      {
        product_id: productId,
        type: "out",
        quantity: quantitySold,
        reason: "Sale",
      },
    ])

    if (movementError) throw movementError

    return { newStock, productName: product.name }
  } catch (error) {
    console.error("[v0] Error updating product stock:", error)
    throw error
  }
}

export async function getShopkeeperDetails(shopkeeperId: string) {
  const supabase = createClient()

  try {
    // Get shopkeeper basic info
    const { data: shopkeeper } = await supabase.from("shopkeepers").select("*").eq("id", shopkeeperId).single()

    if (!shopkeeper) throw new Error("Shopkeeper not found")

    // Get receipts for this shopkeeper
    const { data: receipts } = await supabase
      .from("receipts")
      .select("*")
      .eq("shopkeeper_id", shopkeeperId)
      .order("created_at", { ascending: false })

    // Calculate totals
    const totalOrders = receipts?.length || 0
    const totalReceived = receipts?.reduce((sum, receipt) => sum + (receipt.amount_received || 0), 0) || 0
    const totalPending = receipts?.reduce((sum, receipt) => sum + (receipt.pending_amount || 0), 0) || 0
    const totalPurchases = receipts?.reduce((sum, receipt) => sum + (receipt.final_total || 0), 0) || 0

    return {
      ...shopkeeper,
      totalOrders,
      totalReceived,
      totalPending,
      totalPurchases,
      receipts: receipts || [],
    }
  } catch (error) {
    console.error("[v0] Error fetching shopkeeper details:", error)
    throw error
  }
}

export async function getShopkeepers() {
  const supabase = createClient()

  try {
    const { data: shopkeepers, error } = await supabase.from("shopkeepers").select("*").order("name")

    if (error) throw error

    // Calculate balances for each shopkeeper
    const shopkeepersWithBalances = await Promise.all(
      (shopkeepers || []).map(async (shopkeeper) => {
        const { data: receipts } = await supabase
          .from("receipts")
          .select("final_total, amount_received, pending_amount")
          .eq("shopkeeper_id", shopkeeper.id)

        const totalOrders = receipts?.length || 0
        const totalReceived = receipts?.reduce((sum, receipt) => sum + (receipt.amount_received || 0), 0) || 0
        const totalPending = receipts?.reduce((sum, receipt) => sum + (receipt.pending_amount || 0), 0) || 0
        const totalPurchases = receipts?.reduce((sum, receipt) => sum + (receipt.final_total || 0), 0) || 0

        return {
          ...shopkeeper,
          totalOrders,
          totalReceived,
          totalPending,
          totalPurchases,
        }
      }),
    )

    return shopkeepersWithBalances
  } catch (error) {
    console.error("[v0] Error fetching shopkeepers:", error)
    throw error
  }
}

export async function createOrGetShopkeeper(name: string, contact?: string, address?: string) {
  const supabase = createClient()

  try {
    // First try to find existing shopkeeper by name
    const { data: existingShopkeeper } = await supabase.from("shopkeepers").select("*").eq("name", name).single()

    if (existingShopkeeper) {
      return existingShopkeeper
    }

    // Create new shopkeeper if not found
    const { data: newShopkeeper, error } = await supabase
      .from("shopkeepers")
      .insert([
        {
          name,
          contact: contact || "",
          address: address || "",
          credit_limit: 0,
          current_balance: 0,
          total_purchases: 0,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return newShopkeeper
  } catch (error) {
    console.error("[v0] Error creating/getting shopkeeper:", error)
    throw error
  }
}
