"use client";

import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createInventoryItem,
    updateInventoryItem,
} from "@/app/actions/inventory";
import { SerializedInventory } from "@/components/inventory-table";


interface InventoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editItem?: SerializedInventory | null;
}

export function InventoryFormDialog({
    open,
    onOpenChange,
    editItem,
}: InventoryFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(editItem?.status ?? "draft");
    // Preview URL: use existing image_url or a local object URL for new selection
    const [imagePreview, setImagePreview] = useState<string | null>(
        editItem?.image_url ?? null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!editItem;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        // Only for visual preview — the actual File object travels via FormData
        setImagePreview(URL.createObjectURL(file));
    }

    function handleRemoveImage() {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // Inject the status value from controlled state (Select component)
        formData.set("status", status);

        const result = isEditing
            ? await updateInventoryItem(editItem.id, formData)
            : await createInventoryItem(formData);

        setLoading(false);

        if (result.success) {
            onOpenChange(false);
        } else {
            alert(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Producto" : "Nuevo Producto"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos del producto."
                            : "Completa los campos para agregar un nuevo producto al inventario."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Foto del Producto</Label>
                        {imagePreview ? (
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-32 w-32 rounded-xl object-cover border"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="image_upload"
                                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                                <ImagePlus className="h-6 w-6" />
                                <span className="text-xs">Subir foto</span>
                            </label>
                        )}
                        <input
                            ref={fileInputRef}
                            id="image_upload"
                            name="image_file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción *</Label>
                        <Input
                            id="description"
                            name="description"
                            required
                            defaultValue={editItem?.description ?? ""}
                            placeholder="Ej: Blusa de algodón manga corta"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input
                                id="category"
                                name="category"
                                defaultValue={editItem?.category ?? ""}
                                placeholder="Ej: Blusas"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input
                                id="color"
                                name="color"
                                defaultValue={editItem?.color ?? ""}
                                placeholder="Ej: Blanco"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Género</Label>
                            <Input
                                id="gender"
                                name="gender"
                                defaultValue={editItem?.gender ?? ""}
                                placeholder="Ej: Mujer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="style">Estilo</Label>
                            <Input
                                id="style"
                                name="style"
                                defaultValue={editItem?.style ?? ""}
                                placeholder="Ej: Casual"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cost_price">Precio Costo ($)</Label>
                            <Input
                                id="cost_price"
                                name="cost_price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={Number(editItem?.cost_price ?? 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sale_price">Precio Venta ($)</Label>
                            <Input
                                id="sale_price"
                                name="sale_price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={Number(editItem?.sale_price ?? 0)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado del Producto</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Borrador</SelectItem>
                                    <SelectItem value="published">Publicado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3 pt-7">
                            <Switch
                                id="is_available"
                                name="is_available"
                                defaultChecked={editItem?.is_available ?? true}
                            />
                            <Label htmlFor="is_available">Disponible</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Guardando..."
                                : isEditing
                                    ? "Guardar Cambios"
                                    : "Crear Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
