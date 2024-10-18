import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface ImagePreviewProps {
    image: File | string | null;
    onDelete: () => void;
  }
  
  export function ImagePreview({ image, onDelete }: ImagePreviewProps) {
    if (!image) return null;
  
    const imageUrl = typeof image === 'string' ? image : URL.createObjectURL(image);
  
    return (
      <div className="relative inline-block">
        <Image src={imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />
        <Button 
          variant="destructive" 
          size="sm" 
          className="absolute top-0 right-0 rounded-full p-1" 
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }