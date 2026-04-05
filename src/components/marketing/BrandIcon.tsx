"use client";

import Image from "next/image";
import { useState } from "react";

interface BrandIconProps {
  name: string;
  domain: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { container: "h-7 w-7", icon: 16, text: "text-[10px]", rounded: "rounded-md" },
  md: { container: "h-9 w-9", icon: 20, text: "text-xs", rounded: "rounded-lg" },
  lg: { container: "h-12 w-12", icon: 28, text: "text-base", rounded: "rounded-xl" },
};

export function BrandIcon({ name, domain, size = "md", className = "" }: BrandIconProps) {
  const [imgError, setImgError] = useState(false);
  const s = sizes[size];

  if (imgError) {
    return (
      <div className={`flex ${s.container} items-center justify-center ${s.rounded} border border-border bg-muted/40 ${s.text} font-bold text-primary ${className}`}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`flex ${s.container} items-center justify-center ${s.rounded} border border-border bg-white overflow-hidden ${className}`}>
      <Image
        src={`https://icon.horse/icon/${domain}`}
        alt={name}
        width={s.icon}
        height={s.icon}
        className="object-contain"
        onError={() => setImgError(true)}
        unoptimized
      />
    </div>
  );
}
