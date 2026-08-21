import { InventoryTable } from "@/components/inventory-table";

export const dynamic = "force-dynamic";

const API_URL = process.env.INTERNAL_API_URL || "http://saas_backend:3333/api/admin";

export default async function InventoryPage() {
    const res = await fetch(`${API_URL}/inventories?tenantId=1`, { cache: 'no-store' });
    const rawProducts = res.ok ? await res.json() : [];

    // Map Adonis models to the format expected by the frontend
    const products = rawProducts.map((p: any) => ({
        ...p,
        cost_price: Number(p.costPrice ?? 0),
        sale_price: Number(p.salePrice ?? 0),
        is_available: p.isAvailable,
        image_url: p.imageUrl,
        category: p.category?.name || 'General',
    }));

    return (
        <div className="space-y-6">
            <InventoryTable products={products} />
        </div>
    );
}
