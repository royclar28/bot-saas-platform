"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InventoryFormDialog } from "@/components/inventory-form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

// Serialized type (after JSON round-trip: Decimal→number, Date→string)
export type SerializedInventory = {
    id: number;
    description: string;
    category: string | null;
    size: string | null;
    color: string | null;
    gender: string | null;
    style: string | null;
    cost_price: number | null;
    sale_price: number | null;
    is_available: boolean | null;
    status: string | null;
    image_base64: string | null;
    image_url: string | null;
    created_at: string;
};

function formatCurrency(amount: unknown): string {
    return `$${Number(amount ?? 0).toFixed(2)}`;
}

export function InventoryTable({ products }: { products: SerializedInventory[] }) {
    const [formOpen, setFormOpen] = useState(false);
    const [editItem, setEditItem] = useState<SerializedInventory | null>(null);
    const [deleteItem, setDeleteItem] = useState<SerializedInventory | null>(null);

    function handleEdit(item: SerializedInventory) {
        setEditItem(item);
        setFormOpen(true);
    }

    function handleNew() {
        setEditItem(null);
        setFormOpen(true);
    }

    function handleFormClose(open: boolean) {
        setFormOpen(open);
        if (!open) setEditItem(null);
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
                    <p className="text-muted-foreground">
                        Gestiona el inventario de productos de tu tienda.
                    </p>
                </div>
                <Button onClick={handleNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableCaption>
                        {products.length === 0
                            ? "No hay productos en el inventario."
                            : `${products.length} producto(s) en inventario.`}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Foto</TableHead>
                            <TableHead className="w-[70px]">ID</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Género</TableHead>
                            <TableHead>Estilo</TableHead>
                            <TableHead className="text-right">Costo</TableHead>
                            <TableHead className="text-right">Precio Venta</TableHead>
                            <TableHead className="text-center">Disponible</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[70px] text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.description}
                                            className="h-10 w-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{product.id}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>{product.category ?? "—"}</TableCell>
                                <TableCell>{product.color ?? "—"}</TableCell>
                                <TableCell>{product.gender ?? "—"}</TableCell>
                                <TableCell>{product.style ?? "—"}</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(product.cost_price)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(product.sale_price)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {product.is_available ? "✅" : "❌"}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "draft"
                                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                            }`}
                                    >
                                        {product.status === "draft" ? "Borrador" : "Publicado"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Acciones</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setDeleteItem(product)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <InventoryFormDialog
                open={formOpen}
                onOpenChange={handleFormClose}
                editItem={editItem}
            />

            {deleteItem && (
                <DeleteConfirmDialog
                    open={!!deleteItem}
                    onOpenChange={(open) => {
                        if (!open) setDeleteItem(null);
                    }}
                    itemId={deleteItem.id}
                    itemDescription={deleteItem.description}
                />
            )}
        </>
    );
}
