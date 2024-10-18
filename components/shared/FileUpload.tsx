// components/ui/file-upload.tsx
'use client';

import React, { ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  id: string;
  onChange: (file: File | null) => void;
  className?: string;
}

export function FileUpload({ id, onChange, className }: FileUploadProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    onChange(file);
  };

  return (
    <div className={className}>
      <Label htmlFor={id} className="block mb-2">
        Upload File
      </Label>
      <Input
        type="file"
        id={id}
        onChange={handleFileChange}
        className="cursor-pointer"
      />
    </div>
  );
}