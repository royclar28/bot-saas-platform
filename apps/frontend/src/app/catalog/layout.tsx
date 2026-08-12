import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { STORE_NAME } from "@/lib/store";
import { CartProvider } from "@/components/cart-provider";
import { CartSheet } from "@/components/cart-sheet";

export const metadata: Metadata = {
    title: `${STORE_NAME} — Catálogo`,
    description: `Explora la colección de ${STORE_NAME}. Compra fácil por WhatsApp.`,
};

export default function CatalogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-xl font-bold tracking-tight">
                                {STORE_NAME}
                            </span>
                        </div>
                        <CartSheet />
                    </div>
                </header>

                {/* Content */}
                <main>{children}</main>

                {/* Footer */}
                <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {STORE_NAME} — Todos los
                    derechos reservados.
                </footer>
            </div>
        </CartProvider>
    );
}
