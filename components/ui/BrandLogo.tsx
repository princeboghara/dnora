import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  href?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BrandLogo({
  className,
  imageClassName,
  href = "/",
  priority = false,
  size = "md",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { width: 120, height: 28, class: "h-6 w-auto" },
    md: { width: 150, height: 35, class: "h-7 sm:h-8 w-auto" },
    lg: { width: 180, height: 42, class: "h-9 sm:h-10 w-auto" },
    xl: { width: 220, height: 52, class: "h-11 sm:h-12 w-auto" },
  };

  const selectedSize = sizeMap[size];

  const content = (
    <div className={cn("flex items-center inline-flex select-none", className)}>
      <Image
        src="/images/logo.png"
        alt="DNORA Luxury Handbags"
        width={selectedSize.width}
        height={selectedSize.height}
        priority={priority}
        className={cn(
          "object-contain filter transition-all duration-300 hover:brightness-110",
          selectedSize.class,
          imageClassName
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group focus:outline-none" aria-label="DNORA Home">
        {content}
      </Link>
    );
  }

  return content;
}
