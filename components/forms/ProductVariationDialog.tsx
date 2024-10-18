// components/products/ProductVariationsDialog.tsx

'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';

interface Variation {
  id: string;
  name: string;
  price: string;
  sku: string;
}

interface ProductVariationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variations: Variation[]) => void;
}

export function ProductVariationsDialog({ isOpen, onClose, onSave }: ProductVariationsDialogProps) {
  const [variations, setVariations] = useState<Variation[]>([]);

  const addVariation = () => {
    setVariations([...variations, { id: Date.now().toString(), name: '', price: '', sku: '' }]);
  };

  const updateVariation = (id: string, field: keyof Variation, value: string) => {
    setVariations(variations.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Variations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {variations.map((variation) => (
            <div key={variation.id} className="flex items-center space-x-2">
              <Input
                placeholder="Name"
                value={variation.name}
                onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
              />
              <Input
                placeholder="Price"
                type="number"
                value={variation.price}
                onChange={(e) => updateVariation(variation.id, 'price', e.target.value)}
              />
              <Input
                placeholder="SKU"
                value={variation.sku}
                onChange={(e) => updateVariation(variation.id, 'sku', e.target.value)}
              />
              <Button size="icon" variant="ghost" onClick={() => removeVariation(variation.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addVariation} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Variation
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(variations)}>Save Variations</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}