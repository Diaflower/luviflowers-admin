// components/ui/color-picker.tsx
'use client';

import React from 'react';
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  id: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ id, color, onChange, className }: ColorPickerProps) {
  return (
    <div className={className}>
      <HexColorPicker color={color} onChange={onChange} />
      <input
        type="text"
        id={id}
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-3 py-2 border rounded-md"
      />
    </div>
  );
}