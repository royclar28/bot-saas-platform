import { BotSettings } from "@/components/bot-settings";
import { getBotInfo } from "@/app/actions/bot";

export const dynamic = "force-dynamic";

export default async function BotPage() {
    const bot = await getBotInfo();

    if (!bot) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Error de conexión</h2>
                    <p className="text-muted-foreground">No se pudo cargar la información del bot.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BotSettings bot={bot} />
        </div>
    );
}
