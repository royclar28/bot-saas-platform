"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://saas_backend:3333/api/admin";

export async function getActiveChats() {
    try {
        const res = await fetch(`${API_URL}/chat?tenantId=1`, { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Error fetching active chats:", error);
        return [];
    }
}

export async function getChatMessages(sessionId: string) {
    try {
        const res = await fetch(`${API_URL}/chat/${sessionId}`, { cache: 'no-store' });
        if (!res.ok) return { messages: [], botEnabled: true };
        return await res.json();
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return { messages: [], botEnabled: true };
    }
}

export async function toggleBotState(sessionId: string, enabled: boolean) {
    try {
        const res = await fetch(`${API_URL}/chat/${sessionId}/pause-bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
        if (!res.ok) return { success: false, error: "Failed to toggle bot" };
        
        revalidatePath("/admin/chat");
        return { success: true, botEnabled: enabled };
    } catch (error) {
        console.error("Error toggling bot:", error);
        return { success: false, error: "Network error" };
    }
}

export async function sendManualMessage(sessionId: string, text: string) {
    try {
        const res = await fetch(`${API_URL}/chat/${sessionId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok) return { success: false, error: "Failed to send message" };
        
        revalidatePath("/admin/chat");
        return { success: true };
    } catch (error) {
        console.error("Error sending manual message:", error);
        return { success: false, error: "Network error" };
    }
}
