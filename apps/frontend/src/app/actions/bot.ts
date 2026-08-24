"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://saas_backend:3333/api/admin";
const TENANT_ID = 1;

export async function getBotInfo() {
    try {
        const res = await fetch(`${API_URL}/bots?tenantId=${TENANT_ID}`, { cache: 'no-store', headers: { 'x-api-key': process.env.API_SECRET_KEY || 'super_secret_bot_key_123' } });
        if (!res.ok) { console.error("Bot API error:", res.status, await res.text()); return null; }
        const data = await res.json();
        return data[0] || null;
    } catch (error) {
        console.error("Error fetching bot info:", error);
        return null;
    }
}

export async function getBotQR(botId: number) {
    try {
        const res = await fetch(`${API_URL}/bots/${botId}/qr`, { cache: 'no-store', headers: { 'x-api-key': process.env.API_SECRET_KEY || 'super_secret_bot_key_123' } });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching bot QR:", error);
        return null;
    }
}

export async function updateBotPrompt(botId: number, promptTemplate: string) {
    try {
        const res = await fetch(`${API_URL}/bots/${botId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_SECRET_KEY || 'super_secret_bot_key_123' },
            body: JSON.stringify({ promptTemplate })
        });
        if (!res.ok) return { success: false, error: "Failed to update prompt" };
        
        revalidatePath("/admin/bot");
        return { success: true };
    } catch (error) {
        console.error("Error updating bot prompt:", error);
        return { success: false, error: "Network error" };
    }
}
