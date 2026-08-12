"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export type InventoryFormData = {
    description: string;
    category: string;
    color: string;
    gender: string;
    style: string;
    cost_price: number;
    sale_price: number;
    is_available: boolean;
    status: string;
    image_url?: string | null;
};

async function saveImageFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and prepend timestamp to avoid collisions
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Security check: validate file extension
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
        let image_url: string | null = null;
        if (imageFile && imageFile.size > 0) {
            image_url = await saveImageFile(imageFile);
        }

        const data: InventoryFormData = {
            description: formData.get("description") as string,
            category: formData.get("category") as string,
            color: formData.get("color") as string,
            gender: formData.get("gender") as string,
            style: formData.get("style") as string,
            cost_price: parseFloat(formData.get("cost_price") as string) || 0,
            sale_price: parseFloat(formData.get("sale_price") as string) || 0,
            is_available: formData.get("is_available") === "on",
            status: formData.get("status") as string,
            image_url,
        };

        await prisma.inventory.create({ data });
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

        const updateData: Partial<InventoryFormData> = {
            description: formData.get("description") as string,
            category: formData.get("category") as string,
            color: formData.get("color") as string,
            gender: formData.get("gender") as string,
            style: formData.get("style") as string,
            cost_price: parseFloat(formData.get("cost_price") as string) || 0,
            sale_price: parseFloat(formData.get("sale_price") as string) || 0,
            is_available: formData.get("is_available") === "on",
            status: formData.get("status") as string,
        };

        // Only update image if a new file was uploaded
        if (imageFile && imageFile.size > 0) {
            updateData.image_url = await saveImageFile(imageFile);
        }

        await prisma.inventory.update({ where: { id }, data: updateData });
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
        await prisma.inventory.delete({ where: { id } });
        revalidatePath("/admin/inventory");
        revalidatePath("/catalog");
        return { success: true };
    } catch (error) {
        console.error("Error deleting inventory item:", error);
        return { success: false, error: "No se pudo eliminar el producto." };
    }
}
