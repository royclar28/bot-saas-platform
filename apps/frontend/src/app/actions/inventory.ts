"use server";

import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/admin";
const TENANT_ID = 1; // Default for now until we add multi-tenant auth context

export type InventoryFormData = {
    description: string;
    categoryId: number;
    color: string;
    gender: string;
    style: string;
    costPrice: number;
    salePrice: number;
    isAvailable: boolean;
    status: string;
    imageUrl?: string | null;
};

async function saveImageFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    if (!/\.(jpg|jpeg|png|webp)$/i.test(safeName)) {
        throw new Error("Formato de imagen no permitido.");
    }

    const filename = `${Date.now()}_${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    return `/uploads/${filename}`;
}

export async function createInventoryItem(formData: FormData) {
    try {
        const imageFile = formData.get("image_file") as File | null;
        let imageUrl: string | null = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveImageFile(imageFile);
        }

        const payload = {
            tenantId: TENANT_ID,
            categoryId: parseInt(formData.get("category") as string) || 1, // Fallback if no category logic yet
            description: formData.get("description") as string,
            color: formData.get("color") as string,
            gender: formData.get("gender") as string,
            style: formData.get("style") as string,
            costPrice: parseFloat(formData.get("cost_price") as string) || 0,
            salePrice: parseFloat(formData.get("sale_price") as string) || 0,
            isAvailable: formData.get("is_available") === "on",
            status: formData.get("status") as string,
            imageUrl,
        };

        const res = await fetch(`${API_URL}/inventories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("API responded with an error");

        revalidatePath("/admin/inventory");
        revalidatePath("/catalog");
        return { success: true };
    } catch (error) {
        console.error("Error creating inventory item:", error);
        return { success: false, error: "No se pudo crear el producto." };
    }
}

export async function updateInventoryItem(id: number, formData: FormData) {
    try {
        const imageFile = formData.get("image_file") as File | null;

        const updateData: Partial<any> = {
            categoryId: parseInt(formData.get("category") as string) || 1,
            description: formData.get("description") as string,
            color: formData.get("color") as string,
            gender: formData.get("gender") as string,
            style: formData.get("style") as string,
            costPrice: parseFloat(formData.get("cost_price") as string) || 0,
            salePrice: parseFloat(formData.get("sale_price") as string) || 0,
            isAvailable: formData.get("is_available") === "on",
            status: formData.get("status") as string,
        };

        if (imageFile && imageFile.size > 0) {
            updateData.imageUrl = await saveImageFile(imageFile);
        }

        const res = await fetch(`${API_URL}/inventories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!res.ok) throw new Error("API responded with an error");

        revalidatePath("/admin/inventory");
        revalidatePath("/catalog");
        return { success: true };
    } catch (error) {
        console.error("Error updating inventory item:", error);
        return { success: false, error: "No se pudo actualizar el producto." };
    }
}

export async function deleteInventoryItem(id: number) {
    try {
        const res = await fetch(`${API_URL}/inventories/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("API responded with an error");
        
        revalidatePath("/admin/inventory");
        revalidatePath("/catalog");
        return { success: true };
    } catch (error) {
        console.error("Error deleting inventory item:", error);
        return { success: false, error: "No se pudo eliminar el producto." };
    }
}
