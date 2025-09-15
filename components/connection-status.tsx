"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, RefreshCw, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { syncManager } from "@/lib/sync-manager"
import { useToast } from "@/hooks/use-toast"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (online) {
        toast({
          title: "Back Online",
          description: "Connection restored. Data will sync automatically.",
        })
      } else {
        toast({
          title: "Gone Offline",
          description: "Working in offline mode. Changes will sync when reconnected.",
          variant: "destructive",
        })
      }
    }

    // Set initial status
    setIsOnline(navigator.onLine)

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [toast])

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Cannot Sync",
        description: "No internet connection. Please check your network.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      await syncManager.manualSync()
      toast({
        title: "Sync Complete",
        description: "All data synchronized successfully.",
      })
    } catch (error) {
      console.error("[v0] Manual sync failed:", error)
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? "Online" : "Offline"}
      </Badge>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSync}
        disabled={!isOnline || isSyncing}
        className="h-6 px-2"
        title={isOnline ? "Sync data with server" : "Cannot sync while offline"}
      >
        {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      </Button>
    </div>
  )
}
