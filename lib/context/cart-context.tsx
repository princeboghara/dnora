"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariant, CartItem, Cart } from "@/types";
import { validateCoupon } from "@/lib/services/coupon-service";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
}

const LOCAL_CART_KEY = "dnora_atelier_cart";

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  discount: 0,
  shipping_fee: 0,
  tax: 0,
  total: 0,
  free_shipping_threshold: DEFAULT_STORE_SETTINGS.free_shipping_threshold,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const recalculateCart = (items: CartItem[], couponCode?: string): Cart => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let discount = 0;
    if (couponCode && subtotal > 0) {
      const couponResult = validateCoupon(couponCode, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discountAmount;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shippingFee =
      discountedSubtotal >= DEFAULT_STORE_SETTINGS.free_shipping_threshold || discountedSubtotal === 0
        ? 0
        : DEFAULT_STORE_SETTINGS.standard_shipping_fee;

    const tax = Math.round(
      (discountedSubtotal * DEFAULT_STORE_SETTINGS.tax_percentage) / 100
    );

    const total = discountedSubtotal + shippingFee + tax;

    const updatedCart: Cart = {
      items,
      subtotal,
      discount,
      shipping_fee: shippingFee,
      tax,
      total,
      coupon_code: discount > 0 ? couponCode : undefined,
      free_shipping_threshold: DEFAULT_STORE_SETTINGS.free_shipping_threshold,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(updatedCart));
    }

    return updatedCart;
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const basePrice = product.sale_price ?? product.base_price;
    const finalPrice = basePrice + (variant?.price_adjustment ?? 0);
    const variantId = variant?.id;

    setCart((prev) => {
      const existingIndex = prev.items.findIndex(
        (i) => i.product_id === product.id && i.variant_id === variantId
      );

      let newItems = [...prev.items];
      if (existingIndex > -1) {
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
      } else {
        const newItem: CartItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          product_id: product.id,
          product,
          variant_id: variantId,
          variant,
          quantity,
          price: finalPrice,
        };
        newItems = [newItem, ...newItems];
      }

      return recalculateCart(newItems, prev.coupon_code);
    });

    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId);
      return recalculateCart(newItems, prev.coupon_code);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) => {
      const newItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      return recalculateCart(newItems, prev.coupon_code);
    });
  };

  const applyCoupon = (code: string) => {
    const result = validateCoupon(code, cart.subtotal);
    if (result.valid) {
      setCart((prev) => recalculateCart(prev.items, code));
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removeCoupon = () => {
    setCart((prev) => recalculateCart(prev.items, undefined));
  };

  const clearCart = () => {
    const empty = recalculateCart([], undefined);
    setCart(empty);
  };

  const cartCount = isMounted
    ? cart.items.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
