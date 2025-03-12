import { createContext, ReactNode, useContext, useState } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CartItem {
  productId: number;
  quantity: number;
  name: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  checkout: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);

  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    onSuccess: (data) => {
      if (data?.items) {
        setItems(data.items);
      }
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const res = await apiRequest("POST", "/api/cart", {
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        items,
        address: "User's Address", // We'll get this from user profile
      });
      return res.json();
    },
    onSuccess: () => {
      setItems([]);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and will be delivered soon.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.productId === product.id);
      if (existingItem) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { 
        productId: product.id, 
        quantity: 1, 
        name: product.name,
        price: Number(product.price)
      }];
    });
    updateCartMutation.mutate(items);
  };

  const removeFromCart = (productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
    updateCartMutation.mutate(items);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    updateCartMutation.mutate(items);
  };

  const clearCart = () => {
    setItems([]);
    updateCartMutation.mutate([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        checkout: () => checkoutMutation.mutate(),
        isLoading: checkoutMutation.isPending,
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
