"use client"

import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Receipt,
  RotateCcw,
  Users,
  BarChart3,
  CatIcon as Catalog,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  collapsed: boolean
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "shopkeepers", label: "Shopkeepers", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "catalog", label: "Catalog", icon: Catalog },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ currentPage, onPageChange, collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    collapsed && "justify-center px-2",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
