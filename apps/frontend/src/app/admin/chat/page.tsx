"use client";

import { useEffect, useState, useRef } from "react";
import { getActiveChats, getChatMessages, toggleBotState, sendManualMessage } from "@/app/actions/chat";
import { Bot, User, Send, Search, Loader2, MessageSquare, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export default function ChatInboxPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isBotEnabled, setIsBotEnabled] = useState(true);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Polling para la lista de sesiones
    useEffect(() => {
        const fetchSessions = async () => {
            const data = await getActiveChats();
            setSessions(data);
        };
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, []);

    // 2. Polling para los mensajes de la sesión activa
    useEffect(() => {
        if (!activeSessionId) return;
        
        const fetchMessages = async (showLoading = false) => {
            if (showLoading) setLoading(true);
            const data = await getChatMessages(activeSessionId);
            setMessages(data.messages || []);
            setIsBotEnabled(data.botEnabled);
            if (showLoading) setLoading(false);
            scrollToBottom();
        };
        
        fetchMessages(true);
        const interval = setInterval(() => fetchMessages(false), 3000);
        return () => clearInterval(interval);
    }, [activeSessionId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleToggleBot = async () => {
        if (!activeSessionId) return;
        const newState = !isBotEnabled;
        const res = await toggleBotState(activeSessionId, newState);
        if (res.success) {
            setIsBotEnabled(newState);
            toast.success(newState ? "Bot encendido y a cargo." : "Bot pausado. El humano toma el control.");
            // Actualizar mensajes para ver el mensaje automático de inmediato
            const data = await getChatMessages(activeSessionId);
            setMessages(data.messages || []);
            scrollToBottom();
        } else {
            toast.error("Error al cambiar el estado del bot");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeSessionId) return;
        
        const textToSend = inputText.trim();
        setInputText("");
        setSending(true);
        
        // Optimistic UI update
        const optimisticMsg = {
            id: Date.now(),
            message: { type: 'human-agent', text: textToSend },
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        const res = await sendManualMessage(activeSessionId, textToSend);
        if (!res.success) {
            toast.error("Fallo al enviar mensaje");
        }
        setSending(false);
    };

    const activeCustomer = sessions.find(s => s.session_id === activeSessionId);

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden rounded-xl border bg-card/60 backdrop-blur-xl shadow-lg">
            
            {/* LEFT PANEL: Session List */}
            <div className="w-1/3 flex flex-col border-r bg-muted/10">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> Bandeja de Entrada
                    </h2>
                    <div className="mt-3 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="w-full rounded-lg bg-background border px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                            No hay conversaciones activas.
                        </div>
                    ) : (
                        <ul className="divide-y divide-border/50">
                            {sessions.map((s) => (
                                <li key={s.session_id}>
                                    <button
                                        onClick={() => setActiveSessionId(s.session_id)}
                                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${activeSessionId === s.session_id ? 'bg-accent/80' : ''}`}
                                    >
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-semibold truncate pr-2">
                                                {s.customer_name || s.session_id}
                                            </span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(s.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className={`w-2 h-2 rounded-full ${s.bot_enabled ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                                            {s.bot_enabled ? 'Bot activo' : 'Pausado (Humano)'}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Chat Window */}
            <div className="flex-1 flex flex-col bg-background/50 relative">
                {activeSessionId ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm z-10">
                            <div>
                                <h3 className="font-semibold text-lg">{activeCustomer?.customer_name || activeSessionId}</h3>
                                <p className="text-xs text-muted-foreground">{activeSessionId}</p>
                            </div>
                            
                            {/* Handoff Toggle */}
                            <button
                                onClick={handleToggleBot}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    isBotEnabled 
                                    ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30' 
                                    : 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border border-orange-500/30'
                                }`}
                            >
                                {isBotEnabled ? (
                                    <><Bot className="w-4 h-4" /> IA Respondiendo</>
                                ) : (
                                    <><User className="w-4 h-4" /> Modo Humano</>
                                )}
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, idx) => {
                                        const type = msg.message?.type;
                                        const text = msg.message?.text;
                                        const isCustomer = type === 'human';
                                        
                                        return (
                                            <div key={msg.id || idx} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                    isCustomer 
                                                    ? 'bg-muted/50 rounded-tl-sm' 
                                                    : type === 'human-agent'
                                                        ? 'bg-orange-500 text-white rounded-tr-sm' // Mensaje enviado manualmente
                                                        : 'bg-primary text-primary-foreground rounded-tr-sm' // Mensaje de IA
                                                }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                                                    <div className={`text-[10px] text-right mt-1 opacity-70`}>
                                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-card border-t">
                            {!isBotEnabled ? (
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Escribe un mensaje para el cliente..."
                                        className="flex-1 rounded-full bg-background border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || sending}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-2">
                                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Bot className="w-4 h-4 opacity-50" />
                                        La Inteligencia Artificial está a cargo de este chat. Haz clic en "IA Respondiendo" arriba para tomar el control.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                        <p>Selecciona una conversación para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
