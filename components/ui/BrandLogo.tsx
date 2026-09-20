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
}

export function BrandLogo({
  className,
  imageClassName,
  href = "/",
  priority = false,
  size = "xl",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { width: 100, height: 24, class: "h-4.5 sm:h-5 lg:h-6 w-auto", textClass: "text-base tracking-[0.25em]" },
    md: { width: 130, height: 32, class: "h-5.5 sm:h-6.5 lg:h-8.5 w-auto", textClass: "text-lg tracking-[0.28em]" },
    lg: { width: 160, height: 38, class: "h-6.5 sm:h-7.5 lg:h-9.5 xl:h-10 w-auto", textClass: "text-xl tracking-[0.3em]" },
    xl: { width: 190, height: 45, class: "h-7.5 sm:h-8.5 lg:h-11 xl:h-12 w-auto", textClass: "text-2xl tracking-[0.32em]" },
    "2xl": { width: 220, height: 52, class: "h-9 sm:h-10 lg:h-12 xl:h-14 w-auto", textClass: "text-2xl sm:text-3xl tracking-[0.35em]" },
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
