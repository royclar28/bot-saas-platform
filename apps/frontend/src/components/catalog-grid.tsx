"use client";

import { useState } from "react";
import { ShoppingBag, ShoppingCart, Shirt, Search } from "lucide-react";
import { useCart } from "@/components/cart-provider";

// ── Helpers ────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}

const pastelColors = [
    "bg-rose-100",
    "bg-pink-100",
    "bg-amber-100",
    "bg-violet-100",
    "bg-sky-100",
    "bg-teal-100",
    "bg-orange-100",
    "bg-fuchsia-100",
];

function getPastelColor(id: number): string {
    return pastelColors[id % pastelColors.length];
}

function getCategoryIcon(category: string | null) {
    return category?.charAt(0)?.toUpperCase() ?? "?";
}

// ── Types ──────────────────────────────────────────────────────────
export type CatalogProduct = {
    id: number;
    description: string;
    category: string | null;
    size: string | null;
    color: string | null;
    style: string | null;
    sale_price: number;
    image_url: string | null;
};

// ── Component ──────────────────────────────────────────────────────
export function CatalogGrid({ products }: { products: CatalogProduct[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("todos");

    // Extract unique categories
    const categories = [
        "todos",
        ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    ] as string[];

    // Filter logic
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "todos" || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Hero */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Nuestra Colección
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Encuentra tu estilo perfecto ✨
                </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="mb-8 flex flex-col gap-4 sm:items-center">
                {/* Search Input */}
                <div className="relative mx-auto w-full max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-full border bg-background py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex w-full overflow-x-auto pb-2 sm:justify-center sm:pb-0">
                    <div className="flex gap-2 px-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === cat
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {cat === "todos" ? "Todo" : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/40" />
                    <h2 className="text-lg font-semibold">
                        No se encontraron productos
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Intenta con otra búsqueda o categoría.
                    </p>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: CatalogProduct }) {
    const { addItem } = useCart();
    const [selectedSize, setSelectedSize] = useState<string>("Única");

    // Standard sizes for clothing
    const sizes = ["S", "M", "L", "XL"];

    // Use DB size if available and not generic "Única", otherwise show options
    const showSizeOptions = !product.size || product.size === "Única";

    // If product has specific size in DB, use it. Otherwise default to "Única" or user selection
    const availableSizes = showSizeOptions ? sizes : [product.size!];

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
            {/* Image or Placeholder */}
            {product.image_url ? (
                <div className="relative">
                    <img
                        src={product.image_url}
                        alt={product.description}
                        className="aspect-square w-full object-cover"
                    />
                    {product.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-foreground/70 backdrop-blur-sm">
                            {product.category}
                        </span>
                    )}
                </div>
            ) : (
                <div
                    className={`relative flex aspect-square items-center justify-center ${getPastelColor(product.id)}`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <Shirt className="h-12 w-12 text-foreground/20" />
                        <span className="text-2xl font-bold text-foreground/15">
                            {getCategoryIcon(product.category)}
                        </span>
                    </div>
                    {product.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-foreground/70 backdrop-blur-sm">
                            {product.category}
                        </span>
                    )}
                </div>
            )}

            {/* Info */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold leading-snug">{product.description}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                    {[product.style, product.color].filter(Boolean).join(" · ") || "—"}
                </p>

                <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                        {formatCurrency(product.sale_price)}
                    </span>
                </div>

                {/* Size Selector */}
                <div className="mt-4">
                    <label className="text-xs font-medium text-muted-foreground">
                        Talla:
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {showSizeOptions ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSize("Única")}
                                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${selectedSize === "Única"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "hover:bg-accent"
                                        }`}
                                >
                                    Única
                                </button>
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[2rem] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${selectedSize === size
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "hover:bg-accent"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                {product.size}
                            </span>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    type="button"
                    onClick={() =>
                        addItem({
                            id: product.id,
                            description: product.description,
                            color: product.color,
                            style: product.style,
                            size: showSizeOptions ? selectedSize : product.size!,
                            sale_price: product.sale_price,
                            image_url: product.image_url,
                        })
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar
                </button>
            </div>
        </article>
    );
}
