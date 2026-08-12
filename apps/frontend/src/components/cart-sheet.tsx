"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, X, Send, Loader2, Shirt } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { STORE_NAME } from "@/lib/store";
import { WHATSAPP_NUMBER } from "@/lib/config";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}

export function CartSheet() {
    const { items, itemCount, total, removeItem, clearCart } = useCart();
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);

    // ── Checkout form state ────────────────────────────────────────
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    function handleSendOrder(e: React.FormEvent) {
        e.preventDefault();
        if (items.length === 0) return;
        setSending(true);

        // Build item lines
        const itemLines = items
            .map(
                (i) =>
                    `- ${i.quantity}x ${i.description} [${i.size}]${i.color ? ` (${i.color})` : ""} (${formatCurrency(i.sale_price * i.quantity)})`
            )
            .join("\n");

        const message = [
            `Hola, me gustaría hacer un encargo en *${STORE_NAME}*.`,
            `Mi nombre es *${name}*, de *${city}*.`,
            `📞 Teléfono: ${phone}`,
            ``,
            `🛒 *Mi Pedido:*`,
            itemLines,
            ``,
            `💰 *Total: ${formatCurrency(total)}*`,
            notes ? `📝 Notas: ${notes}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const encoded = encodeURIComponent(message);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

        window.open(url, "_blank");

        // Clean up after redirect
        setTimeout(() => {
            clearCart();
            setName("");
            setCity("");
            setPhone("");
            setNotes("");
            setSending(false);
            setOpen(false);
        }, 500);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    className="relative flex items-center gap-1 rounded-full p-2 transition-colors hover:bg-accent"
                    aria-label="Abrir carrito"
                >
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {itemCount > 99 ? "99+" : itemCount}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Mi Carrito
                        {itemCount > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">
                                ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    /* ── Empty ───────────────────────────────────────── */
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
                        <p className="text-muted-foreground">
                            Tu carrito está vacío
                        </p>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="mt-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-accent"
                        >
                            Seguir comprando
                        </button>
                    </div>
                ) : (
                    /* ── Items + Checkout ────────────────────────────── */
                    <div className="flex flex-1 flex-col gap-4 pt-4">
                        {/* Item List */}
                        <ul className="divide-y">
                            {items.map((item) => (
                                <li
                                    key={`${item.id}-${item.size}`}
                                    className="flex items-center gap-3 py-3"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.description}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Shirt className="h-6 w-6 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {item.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground">
                                                {item.size}
                                            </span>
                                            {item.color && <span>{item.color}</span>}
                                        </div>
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            {item.quantity}x{" "}
                                            {formatCurrency(item.sale_price)}
                                        </p>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id, item.size)}
                                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        aria-label={`Eliminar ${item.description}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Total */}
                        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                            <span className="font-medium">Total</span>
                            <span className="text-xl font-bold text-primary">
                                {formatCurrency(total)}
                            </span>
                        </div>

                        {/* ── Checkout Form ──────────────────────── */}
                        <form
                            onSubmit={handleSendOrder}
                            className="space-y-3 rounded-xl border p-4"
                        >
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Datos del Encargo
                            </h3>

                            <input
                                type="text"
                                placeholder="Nombre Completo *"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />

                            <input
                                type="text"
                                placeholder="Ciudad / Dirección de Envío *"
                                required
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />

                            <input
                                type="tel"
                                placeholder="Teléfono de Contacto *"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />

                            <textarea
                                placeholder="Notas adicionales (opcional)"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />

                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando…
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Enviar Encargo por WhatsApp
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Clear Cart */}
                        <button
                            type="button"
                            onClick={clearCart}
                            className="flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
                        >
                            <X className="h-3.5 w-3.5" />
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
