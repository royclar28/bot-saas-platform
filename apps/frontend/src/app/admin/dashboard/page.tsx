import { getDashboardStats } from "@/app/actions/stats";
import { Users, DollarSign, MessageCircle, ShoppingCart, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    if (!stats) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Error</h2>
                    <p className="text-muted-foreground">No se pudieron cargar las analíticas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Resumen de la actividad de tu plataforma.</p>
            </div>

            {/* Tarjetas Superiores */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Clientes</h3>
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold">{stats.total_customers}</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Deuda en la Calle</h3>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold text-emerald-600">
                            ${stats.total_debt_usd?.toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Mensajes Bot</h3>
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold">{stats.total_bot_messages}</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Txn de Hoy</h3>
                        <ShoppingCart className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold">{stats.transactions_today}</p>
                    </div>
                </div>
            </div>

            {/* Secciones inferiores */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="glass-card rounded-xl p-6 col-span-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
                    </div>
                    <div className="space-y-4 mt-6">
                        {stats.recent_transactions?.length > 0 ? (
                            stats.recent_transactions.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                                    <div>
                                        <p className="text-sm font-medium">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'payment' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {tx.type === 'payment' ? '+' : '-'}${tx.amount_usd}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No hay transacciones recientes.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
