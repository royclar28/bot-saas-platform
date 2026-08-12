"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────
export type CartItem = {
    id: number;
    description: string;
    color: string | null;
    style: string | null;
    size: string; // Changed from null to string (required for cart)
    sale_price: number;
    image_url: string | null;
    quantity: number;
};

type CartState = {
    items: CartItem[];
};

type CartAction =
    | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
    | { type: "REMOVE_ITEM"; payload: { id: number; size: string } } // Need size to remove specific item
    | { type: "CLEAR" }
    | { type: "HYDRATE"; payload: CartItem[] };

type CartContextValue = CartState & {
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: number, size: string) => void;
    clearCart: () => void;
    itemCount: number;
    total: number;
};

// ── Reducer ────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD_ITEM": {
            const existing = state.items.find(
                (i) => i.id === action.payload.id && i.size === action.payload.size
            );
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.id === action.payload.id && i.size === action.payload.size
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    ),
                };
            }
            return { items: [...state.items, { ...action.payload, quantity: 1 }] };
        }
        case "REMOVE_ITEM":
            return {
                items: state.items.filter(
                    (i) => !(i.id === action.payload.id && i.size === action.payload.size)
                ),
            };
        case "CLEAR":
            return { items: [] };
        case "HYDRATE":
            return { items: action.payload };
        default:
            return state;
    }
}

// ── Context ────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                dispatch({ type: "HYDRATE", payload: JSON.parse(saved) });
            }
        } catch {
            // ignore
        }
    }, []);

    // Persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }, [state.items]);

    const addItem = useCallback(
        (item: Omit<CartItem, "quantity">) => dispatch({ type: "ADD_ITEM", payload: item }),
        []
    );

    const removeItem = useCallback(
        (id: number, size: string) => dispatch({ type: "REMOVE_ITEM", payload: { id, size } }),
        []
    );

    const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const total = state.items.reduce((sum, i) => sum + i.sale_price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ ...state, addItem, removeItem, clearCart, itemCount, total }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within a CartProvider");
    return ctx;
}
