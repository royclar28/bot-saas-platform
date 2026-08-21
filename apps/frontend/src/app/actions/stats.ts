"use server";

const API_URL = process.env.INTERNAL_API_URL || "http://saas_backend:3333/api";

export async function getDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/stats`, { cache: 'no-store' });
        if (!res.ok) return null;
        const result = await res.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching stats:", error);
        return null;
    }
}
