import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const rawProducts = await prisma.inventory.findMany({
        orderBy: { id: "desc" },
    });

    // Serialize Decimal objects to plain numbers for Client Component compatibility
    const products = JSON.parse(JSON.stringify(rawProducts));

    return (
        <div className="space-y-6">
            <InventoryTable products={products} />
        </div>
    );
}
