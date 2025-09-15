"use client"

import { Plus, Package, FolderPlus, Receipt, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export function FloatingActions() {
  const { toast } = useToast()

  const handleAction = (action: string) => {
    toast({
      title: `${action} Demo`,
      description: `This would open the ${action.toLowerCase()} form.`,
    })
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleAction("Add Product")}>
            <Package className="h-4 w-4 mr-2" />
            Add Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Add Category")}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Add Category
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("New Receipt")}>
            <Receipt className="h-4 w-4 mr-2" />
            New Receipt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Add Return")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Add Return
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
