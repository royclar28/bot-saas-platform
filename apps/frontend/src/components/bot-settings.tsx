"use client";

import { useState, useEffect } from "react";
import { Loader2, QrCode, Bot as BotIcon, RefreshCw, Save } from "lucide-react";
import { getBotQR, updateBotPrompt } from "@/app/actions/bot";
import { toast } from "sonner";

export function BotSettings({ bot }: { bot: any }) {
    const [activeTab, setActiveTab] = useState<"whatsapp" | "agent">("whatsapp");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<string>(bot.status || 'disconnected');
    const [isLoadingQR, setIsLoadingQR] = useState(false);
    
    const [promptTemplate, setPromptTemplate] = useState<string>(
        bot.roles?.[0]?.promptTemplate || ""
    );
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status !== 'connected') {
            loadQR();
        }
    }, []);

    const loadQR = async (silent = false) => {
        if (!silent) setIsLoadingQR(true);
        const data = await getBotQR(bot.id);
        if (data?.status === 'connected') {
            setStatus('connected');
            setQrCode(null);
            setIsLoadingQR(false);
        } else if (data?.qrCode) {
            setQrCode(data.qrCode);
            setStatus('pending');
            setIsLoadingQR(false);
            // Auto-polling silencioso para detectar cuando escaneas el QR
            setTimeout(() => loadQR(true), 3000);
        } else if (data?.status === 'pending') {
            // El motor está arrancando pero el QR aún no está listo.
            setTimeout(() => loadQR(true), 2000);
        } else {
            setIsLoadingQR(false);
        }
    };

    const handleSavePrompt = async () => {
        setIsSaving(true);
        const result = await updateBotPrompt(bot.id, promptTemplate);
        if (result.success) {
            toast.success("Instrucciones guardadas correctamente.");
        } else {
            toast.error("Error al guardar las instrucciones.");
        }
        setIsSaving(false);
    };

    return (
        <div className="w-full max-w-4xl rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Configuración del Bot</h2>
                <p className="text-muted-foreground">Conecta WhatsApp y personaliza tu agente de IA.</p>
            </div>

            <div className="mb-6 flex space-x-1 rounded-xl bg-secondary/50 p-1">
                <button
                    onClick={() => setActiveTab("whatsapp")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                        activeTab === "whatsapp" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    }`}
                >
                    <QrCode className="h-4 w-4" /> Conexión WhatsApp
                </button>
                <button
                    onClick={() => setActiveTab("agent")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                        activeTab === "agent" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    }`}
                >
                    <BotIcon className="h-4 w-4" /> Personalidad IA
                </button>
            </div>

            {activeTab === "whatsapp" && (
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        {status === 'connected' ? (
                            <div className="flex flex-col items-center text-emerald-600">
                                <div className="mb-4 rounded-full bg-emerald-100 p-3">
                                    <BotIcon className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold">¡Bot Conectado!</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                    Tu número de WhatsApp está sincronizado. El bot ya puede responder automáticamente.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                {isLoadingQR ? (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                                        <p>Generando código QR...</p>
                                    </div>
                                ) : qrCode ? (
                                    <>
                                        <h3 className="text-lg font-semibold mb-2">Escanea para conectar</h3>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                            Abre WhatsApp en tu teléfono, ve a "Dispositivos vinculados" y escanea este código.
                                        </p>
                                        <div className="rounded-xl border p-4 bg-white shadow-sm mb-6">
                                            <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" className="h-64 w-64 object-contain" />
                                        </div>
                                        <button 
                                            onClick={() => loadQR(false)}
                                            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
                                        >
                                            <RefreshCw className="h-4 w-4" /> Generar nuevo QR
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm text-muted-foreground mb-4">No se pudo obtener el QR.</p>
                                        <button 
                                            onClick={() => loadQR(false)}
                                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                        >
                                            Reintentar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "agent" && (
                <div className="space-y-4">
                    <div className="space-y-4 rounded-lg border p-6">
                        <div>
                            <h3 className="text-lg font-semibold">Instrucciones del Agente (System Prompt)</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Define cómo debe comportarse la IA, su tono de voz y sus reglas principales al interactuar con los clientes.
                            </p>
                        </div>
                        <textarea
                            value={promptTemplate}
                            onChange={(e) => setPromptTemplate(e.target.value)}
                            className="min-h-[250px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Eres un asistente virtual de ventas experto..."
                        />
                        <div className="flex items-center justify-end">
                            <button
                                onClick={handleSavePrompt}
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Instrucciones
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
