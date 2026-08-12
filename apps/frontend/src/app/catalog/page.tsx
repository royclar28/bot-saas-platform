import { CatalogGrid } from "@/components/catalog-grid";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/admin";

export default async function CatalogPage() {
    const res = await fetch(`${API_URL}/inventories?tenantId=1`, { cache: 'no-store' });
    const allProducts = res.ok ? await res.json() : [];

    // Filter active products
    const rawProducts = allProducts.filter((p: any) => p.status !== 'draft' && p.isAvailable);

    // Map Adonis models to the format expected by the frontend
    const products = rawProducts.map((p: any) => ({
        id: p.id,
        description: p.description,
        category: p.category?.name || 'General',
        size: p.size,
        color: p.color,
        style: p.style,
        sale_price: Number(p.salePrice ?? 0),
        image_url: p.imageUrl,
    }));

    return <CatalogGrid products={products} />;
}
