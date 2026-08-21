import { CatalogGrid } from "@/components/catalog-grid";

export const dynamic = "force-dynamic";

const API_URL = process.env.INTERNAL_API_URL || "http://saas_backend:3333/api";

export default async function CatalogPage() {
    const res = await fetch(`${API_URL}/catalog?tenantId=1`, { cache: 'no-store' });
    const allProducts = res.ok ? await res.json() : [];

    // Filter active products
    const rawProducts = allProducts;

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
