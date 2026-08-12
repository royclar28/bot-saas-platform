import { prisma } from "@/lib/prisma";
import { CatalogGrid } from "@/components/catalog-grid";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
    const rawProducts = await prisma.inventory.findMany({
        where: {
            status: { not: "draft" },
            is_available: true,
        },
        orderBy: { created_at: "desc" },
    });

    // Serialize Decimal→number for Client Component
    const products = rawProducts.map((p) => ({
        id: p.id,
        description: p.description,
        category: p.category,
        size: p.size,
        color: p.color,
        style: p.style,
        sale_price: Number(p.sale_price ?? 0),
        image_url: p.image_url,
    }));

    return <CatalogGrid products={products} />;
}
