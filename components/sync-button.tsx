"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { syncManager } from "@/lib/sync-manager"
import { useToast } from "@/hooks/use-toast"

interface SyncButtonProps {
  isOnline: boolean
}

export function SyncButton({ isOnline }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline. Please check your internet connection.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      await syncManager.manualSync()
      toast({
        title: "Sync Complete",
        description: "All data has been synchronized with the server.",
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
    <Button
      onClick={handleSync}
      disabled={!isOnline || isSyncing}
      variant={isOnline ? "default" : "secondary"}
      size="sm"
      className="gap-2"
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <RefreshCw className="h-4 w-4" />
        </>
      )}
      {isSyncing ? "Syncing..." : "Sync"}
    </Button>
  )
}
