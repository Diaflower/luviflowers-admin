'use client'
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';
import { Item, ItemType, Coupon } from "@/types/types";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteItemButtonProps {
  item: Item | Coupon;
  itemType: ItemType;
  onDelete: (id: number | string, forceDelete: boolean) => Promise<void>;
}

export default function DeleteItemButton({ item, itemType, onDelete }: DeleteItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const { getToken } = useAuth();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token available');

      await onDelete(item.id, forceDelete);
      setIsOpen(false);
      toast({
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Deleted`,
        description: `The ${itemType} has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      let errorMessage = `Failed to delete ${itemType}. Please try again.`;
      if (error instanceof Error && error.message.includes('associated order items')) {
        errorMessage = `This ${itemType} has associated orders. Use force delete to remove it and its order items.`;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the {itemType}
            {itemType === 'coupons' 
              ? ` with code "${(item as Coupon).code}".`
              : ` "${(item as Item).name_en || (item as Coupon).name}".`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="force-delete"
            checked={forceDelete}
            onCheckedChange={(checked) => setForceDelete(checked as boolean)}
          />
          <label
            htmlFor="force-delete"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Force delete (removes associated order items)
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}