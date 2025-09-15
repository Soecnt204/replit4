"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Trash2 } from "lucide-react"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { useToast } from "@/hooks/use-toast"
import { getCategories, deleteCategory, getProducts, type Category } from "@/lib/database"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CategoriesProps {
  onNavigateToProducts?: (category: string) => void
}

export function Categories({ onNavigateToProducts }: CategoriesProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const { toast } = useToast()

  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await getCategories()

      const categoriesWithCorrectCount = await Promise.all(
        categoriesData.map(async (category) => {
          const products = await getProducts(category.id)
          return {
            ...category,
            product_count: products.length,
          }
        }),
      )

      setCategories(categoriesWithCorrectCount)
    } catch (error) {
      console.error("[v0] Failed to load categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleViewProducts = async (categoryId: string, categoryName: string) => {
    try {
      const categoryProducts = await getProducts(categoryId)

      if (onNavigateToProducts) {
        onNavigateToProducts(categoryName)
        toast({
          title: "Navigating to Products",
          description: `Showing ${categoryProducts.length} products in ${categoryName} category`,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to load category products:", error)
      toast({
        title: "Error",
        description: "Failed to load category products.",
        variant: "destructive",
      })
    }
  }

  const handleCategoryAdded = () => {
    setShowAddModal(false)
    loadCategories() // Reload categories after adding
    toast({
      title: "Category Added",
      description: "Category has been added successfully.",
    })
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      await deleteCategory(categoryToDelete.id)
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      })
      
      // Notify other components that categories have been updated
      window.dispatchEvent(new CustomEvent('categoriesUpdated'))
      
      loadCategories() // Reload categories after deletion
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Organize your products by categories</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardHeader>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize your products by categories</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <div className="relative">
                <img
                  src={category.image_url || "/placeholder.svg?height=200&width=300&query=category"}
                  alt={category.name}
                  className="w-full h-48 object-cover rounded-t-lg bg-muted"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(category)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader>
                <CardTitle>
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleViewProducts(category.id, category.name)}
                >
                  View Products
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first product category.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {showAddModal && (
        <AddCategoryModal onClose={() => setShowAddModal(false)} onCategoryAdded={handleCategoryAdded} />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              {categoryToDelete?.product_count && categoryToDelete.product_count > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  This category has {categoryToDelete.product_count} products and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={categoryToDelete?.product_count && categoryToDelete.product_count > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
