import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  href?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showSubtitle?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  href = "/",
  priority = false,
  size = "xl",
  showSubtitle = false,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { width: 120, height: 28, class: "h-6 w-auto", textClass: "text-lg tracking-[0.25em]" },
    md: { width: 150, height: 35, class: "h-7 sm:h-8 w-auto", textClass: "text-xl tracking-[0.28em]" },
    lg: { width: 180, height: 42, class: "h-9 sm:h-10 w-auto", textClass: "text-2xl tracking-[0.3em]" },
    xl: { width: 240, height: 56, class: "h-10 sm:h-12 md:h-13 w-auto", textClass: "text-2xl sm:text-3xl tracking-[0.32em]" },
    "2xl": { width: 280, height: 66, class: "h-12 sm:h-14 md:h-16 w-auto", textClass: "text-3xl sm:text-4xl tracking-[0.35em]" },
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
