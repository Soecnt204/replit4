"use client"

import { Search, Menu, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  offlineMode: boolean
  onToggleOffline: () => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Header({ offlineMode, onToggleOffline, sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">ShopManager</h1>
            {offlineMode && (
              <Badge variant="secondary" className="text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>


        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleOffline} className="hidden md:flex">
            {offlineMode ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
