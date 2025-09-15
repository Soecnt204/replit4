"use client"

import { LayoutDashboard, Package, Receipt, CatIcon as Catalog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const bottomNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "catalog", label: "Catalog", icon: Catalog },
]

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn("flex flex-col items-center gap-1 h-auto py-2 px-3", isActive && "text-primary")}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
