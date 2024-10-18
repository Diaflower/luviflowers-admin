'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from 'lucide-react';
import { addItem, addCoupon } from '@/data/categoriesOrTags';
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { ColorPicker } from './ColorPicker';
import { FileUpload } from './FileUpload';
import { ItemType } from '@/types/types';
import { ImagePreview } from './ImagePreview';
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface AddItemButtonProps {
  itemType: ItemType
}

export default function AddItemButton({ itemType }: AddItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [altTextEn, setAltTextEn] = useState('');
  const [altTextAr, setAltTextAr] = useState('');
  const [color, setColor] = useState('#000000');
  const [image, setImage] = useState<File | null>(null);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialCustomer, setSpecialCustomer] = useState('');
  const [specialEmail, setSpecialEmail] = useState('');
  const [specialPhone, setSpecialPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { getToken } = useAuth();
  const queryClient = useQueryClient();
 
  const handleAddItem = async () => {
    if (itemType === 'coupons') {
      if (!nameEn || !code || !discount) {
        toast({
          title: "Error",
          description: "Name, code, and discount are required for coupons.",
          variant: "destructive",
        });
        return;
      }
    } else if (!nameEn || !nameAr) {
      toast({
        title: "Error",
        description: "Both English and Arabic names are required.",
        variant: "destructive",
      });
      return;
    }

    if (itemType === 'infinityColors' || itemType === 'boxColors' || itemType === 'wrappingColors') {
      if (!color || !image) {
        toast({
          title: "Error",
          description: "Both color and image are required.",
          variant: "destructive",
        });
        return;
      }
    }
  
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token available');
      
      let data: any;
      if (itemType === 'coupons') {
        data = {
          name: nameEn,
          code,
          discount: parseFloat(discount),
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
          maxUses: maxUses ? parseInt(maxUses) : undefined,
          isSpecial,
          specialCustomer: isSpecial ? specialCustomer : undefined,
          specialEmail: isSpecial ? specialEmail : undefined,
          specialPhone: isSpecial ? specialPhone : undefined,
        };
        await addCoupon(data, token);
      } else if (itemType === 'infinityColors' || itemType === 'boxColors' || itemType === 'wrappingColors') {
        const formData = new FormData();
        formData.append('name_en', nameEn);
        formData.append('name_ar', nameAr);
        formData.append('color', color);
        formData.append('image', image as File);
        formData.append('altText_en', altTextEn);
        formData.append('altText_ar', altTextAr);
        data = formData;
        await addItem(itemType, data, token);
      } else {
        data = { name_en: nameEn, name_ar: nameAr };
        await addItem(itemType, data, token);
      }
      
      setIsOpen(false);
      resetForm();
      toast({
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Added`,
        description: `The new ${itemType} has been successfully added.`,
      });
      queryClient.invalidateQueries({ queryKey: [itemType] });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: `Failed to add new ${itemType}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = () => {
    setImage(null);
  };

  const resetForm = () => {
    setNameEn('');
    setNameAr('');
    setColor('#000000');
    setImage(null);
    setAltTextEn('');
    setAltTextAr('');
    setCode('');
    setDiscount('');
    setExpiryDate('');
    setMaxUses('');
    setIsSpecial(false);
    setSpecialCustomer('');
    setSpecialEmail('');
    setSpecialPhone('');
  };

  const renderFormFields = () => {
    switch (itemType) {
      case 'infinityColors':
      case 'boxColors':
      case 'wrappingColors':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_en" className="text-right">
                Name (English)
              </Label>
              <Input
                id="name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_ar" className="text-right">
                Name (Arabic)
              </Label>
              <Input
                id="name_ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <ColorPicker
                id="color"
                color={color}
                onChange={setColor}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <FileUpload
                  id="image"
                  onChange={setImage}
                />
                <ImagePreview image={image} onDelete={handleImageDelete} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="altText_en" className="text-right">
                Alt Text (English)
              </Label>
              <Input
                id="altText_en"
                value={altTextEn}
                onChange={(e) => setAltTextEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="altText_ar" className="text-right">
                Alt Text (Arabic)
              </Label>
              <Input
                id="altText_ar"
                value={altTextAr}
                onChange={(e) => setAltTextAr(e.target.value)}
                className="col-span-3"
              />
            </div>
          </>
        );
      case 'coupons':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">
                Discount (%)
              </Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxUses" className="text-right">
                Max Uses
              </Label>
              <Input
                id="maxUses"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isSpecial" className="text-right">
                Special Coupon
              </Label>
              <Switch
                id="isSpecial"
                checked={isSpecial}
                onCheckedChange={setIsSpecial}
              />
            </div>
            {isSpecial && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="specialCustomer" className="text-right">
                    Customer ID
                  </Label>
                  <Input
                    id="specialCustomer"
                    value={specialCustomer}
                    onChange={(e) => setSpecialCustomer(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="specialEmail" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="specialEmail"
                    type="email"
                    value={specialEmail}
                    onChange={(e) => setSpecialEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="specialPhone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="specialPhone"
                    value={specialPhone}
                    onChange={(e) => setSpecialPhone(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </>
        );
      default:
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_en" className="text-right">
                Name (English)
              </Label>
              <Input
                id="name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_ar" className="text-right">
                Name (Arabic)
              </Label>
              <Input
                id="name_ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="col-span-3"
              />
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Add {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {renderFormFields()}
        </div>
        <Button onClick={handleAddItem} disabled={isLoading}>
          {isLoading ? 'Adding...' : `Add ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}