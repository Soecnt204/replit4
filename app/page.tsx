"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { FloatingActions } from "@/components/layout/floating-actions"
import { Dashboard } from "@/components/pages/dashboard"
import { Products } from "@/components/pages/products"
import { Categories } from "@/components/pages/categories"
import { Receipts } from "@/components/pages/receipts"
import { Returns } from "@/components/pages/returns"
import { Shopkeepers } from "@/components/pages/shopkeepers"
import { Reports } from "@/components/pages/reports"
import { Settings } from "@/components/pages/settings"
import { PublicCatalog } from "@/components/pages/public-catalog"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ConnectionStatus } from "@/components/connection-status"
import { syncManager } from "@/lib/sync-manager"
import { offlineStorage } from "@/lib/offline-storage"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

export default function ShopManagement() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await offlineStorage.init()
        console.log("[v0] Offline storage initialized")

        // Try to sync from server if online
        if (navigator.onLine) {
          await syncManager.syncFromServer()
          console.log("[v0] Initial sync from server completed")
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("[v0] Failed to initialize app:", error)
        setIsInitialized(true) // Still allow app to work
      }
    }

    initializeApp()
  }, [])

  const handleNavigateToProducts = (category?: string) => {
    setSelectedCategory(category || null)
    setCurrentPage("products")
  }

  const renderPage = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing HZ Shop...</p>
          </div>
        </div>
      )
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "products":
        return <Products selectedCategory={selectedCategory} onClearCategory={() => setSelectedCategory(null)} />
      case "categories":
        return <Categories onNavigateToProducts={handleNavigateToProducts} />
      case "receipts":
        return <Receipts />
      case "returns":
        return <Returns />
      case "shopkeepers":
        return <Shopkeepers />
      case "reports":
        return <Reports />
      case "settings":
        return <Settings />
      case "catalog":
        return <PublicCatalog />
      default:
        return <Dashboard />
    }
  }

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, string[]> = {
      dashboard: ["Dashboard"],
      products: ["Dashboard", "Products"],
      categories: ["Dashboard", "Categories"],
      receipts: ["Dashboard", "Receipts"],
      returns: ["Dashboard", "Returns"],
      shopkeepers: ["Dashboard", "Shopkeepers"],
      reports: ["Dashboard", "Reports"],
      settings: ["Dashboard", "Settings"],
      catalog: ["Public Catalog"],
    }
    return breadcrumbMap[currentPage] || ["Dashboard"]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        offlineMode={offlineMode}
        onToggleOffline={() => setOfflineMode(!offlineMode)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} collapsed={sidebarCollapsed} />

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-64",
            "pt-16 pb-20 md:pb-4",
          )}
        >
          {/* Breadcrumbs */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              {getBreadcrumbs().map((crumb, index) => (
                <div key={crumb} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <span className={index === getBreadcrumbs().length - 1 ? "text-foreground font-medium" : ""}>
                    {crumb}
                  </span>
                </div>
              ))}
            </nav>
            <ConnectionStatus />
          </div>

          {/* Page Content */}
          <div className="p-6">{renderPage()}</div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />


      <PWAInstallPrompt />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
