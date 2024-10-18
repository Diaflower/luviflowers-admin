'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from 'lucide-react';
import { updateItem, updateCoupon } from '@/data/categoriesOrTags';
import { toast } from "@/components/ui/use-toast";
import { Item, ItemType, Coupon } from '@/types/types';
import { ColorPicker } from './ColorPicker';
import { FileUpload } from './FileUpload';
import { ImagePreview } from './ImagePreview';
import { Switch } from "@/components/ui/switch";

interface EditItemButtonProps {
  item: Item | Coupon;
  itemType: ItemType;
  onUpdate: () => void;
}

export default function EditItemButton({ item, itemType, onUpdate }: EditItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nameEn, setNameEn] = useState((item as Item).name_en || (item as Coupon).name || '');
  const [nameAr, setNameAr] = useState((item as Item).name_ar || '');
  const [altTextEn, setAltTextEn] = useState((item as Item).image?.altText_en || '');
  const [altTextAr, setAltTextAr] = useState((item as Item).image?.altText_ar || '');
  const [color, setColor] = useState((item as Item).color || '');
  const [image, setImage] = useState<File | null>(null);
  const [code, setCode] = useState((item as Coupon).code || '');
  const [discount, setDiscount] = useState(((item as Coupon).discount || 0).toString());
  const [expiryDate, setExpiryDate] = useState((item as Coupon).expiryDate ? new Date((item as Coupon).expiryDate).toISOString().split('T')[0] : '');
  const [maxUses, setMaxUses] = useState(((item as Coupon).maxUses || '').toString());
  const [isSpecial, setIsSpecial] = useState((item as Coupon).isSpecial || false);
  const [specialCustomer, setSpecialCustomer] = useState((item as Coupon).specialCustomer || '');
  const [specialEmail, setSpecialEmail] = useState((item as Coupon).specialEmail || '');
  const [specialPhone, setSpecialPhone] = useState((item as Coupon).specialPhone || '');
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    console.log('Item:', item);
    console.log('Alt Text EN:', (item as Item).image?.altText_en);
    console.log('Alt Text AR:', (item as Item).image?.altText_ar);
  }, [item]);

  const handleUpdateItem = async () => {
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

    if ((itemType === 'infinityColors' || itemType === 'boxColors' || itemType === 'wrappingColors') && !color) {
      toast({
        title: "Error",
        description: "Color is required for this item type.",
        variant: "destructive",
      });
      return;
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
        await updateCoupon(item.id, data, token);
      } else if (itemType === 'infinityColors' || itemType === 'boxColors' || itemType === 'wrappingColors') {
        const formData = new FormData();
        formData.append('name_en', nameEn);
        formData.append('name_ar', nameAr);
        formData.append('color', color);
        formData.append('altText_en', altTextEn);
        formData.append('altText_ar', altTextAr);
        
        if (image instanceof File) {
          formData.append('image', image);
        }
  
        data = formData;
        await updateItem(itemType, item.id as number, data, token);
      } else {
        data = { name_en: nameEn, name_ar: nameAr };
        await updateItem(itemType, item.id as number, data, token);
      }
  
      setIsOpen(false);
      toast({
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Updated`,
        description: `The ${itemType} has been successfully updated.`,
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: `Failed to update ${itemType}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = () => {
    setImage(null);
  };

  const renderFormFields = () => {
    switch (itemType) {
      case 'infinityColors':
      case 'boxColors':
      case 'wrappingColors':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_name_en" className="text-right">
                Name (English)
              </Label>
              <Input
                id="edit_name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_name_ar" className="text-right">
                Name (Arabic)
              </Label>
              <Input
                id="edit_name_ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_color" className="text-right">
                Color
              </Label>
              <ColorPicker
                id="edit_color"
                color={color}
                onChange={setColor}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <FileUpload
                  id="edit_image"
                  onChange={setImage}
                />
                <ImagePreview image={image} onDelete={handleImageDelete} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_altText_en" className="text-right">
                Alt Text (English)
              </Label>
              <Input
                id="edit_altText_en"
                value={altTextEn}
                onChange={(e) => setAltTextEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_altText_ar" className="text-right">
                Alt Text (Arabic)
              </Label>
              <Input
                id="edit_altText_ar"
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
              <Label htmlFor="edit_name" className="text-right">
                Name
              </Label>
              <Input
                id="edit_name"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_code" className="text-right">
                Code
              </Label>
              <Input
                id="edit_code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_discount" className="text-right">
                Discount (%)
              </Label>
              <Input
                id="edit_discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="edit_expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_maxUses" className="text-right">
                Max Uses
              </Label>
              <Input
                id="edit_maxUses"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_isSpecial" className="text-right">
                Special Coupon
              </Label>
              <Switch
                id="edit_isSpecial"
                checked={isSpecial}
                onCheckedChange={setIsSpecial}
              />
            </div>
            {isSpecial && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_specialCustomer" className="text-right">
                    Customer ID
                  </Label>
                  <Input
                    id="edit_specialCustomer"
                    value={specialCustomer}
                    onChange={(e) => setSpecialCustomer(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_specialEmail" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit_specialEmail"
                    type="email"
                    value={specialEmail}
                    onChange={(e) => setSpecialEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_specialPhone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="edit_specialPhone"
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
              <Label htmlFor="edit_name_en" className="text-right">
                Name (English)
              </Label>
              <Input
                id="edit_name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_name_ar" className="text-right">
                Name (Arabic)
              </Label>
              <Input
                id="edit_name_ar"
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
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {renderFormFields()}
        </div>
        <Button onClick={handleUpdateItem} disabled={isLoading}>
          {isLoading ? 'Updating...' : `Update ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}