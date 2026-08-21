"use client";

import { useActionState } from "react";
import { Sparkles, Lock, Loader2, ArrowRight } from "lucide-react";
import { login } from "@/app/actions/auth";
import { STORE_NAME } from "@/lib/store";
import { toast } from "sonner";
import { useEffect } from "react";

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(login, undefined);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary/30 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
            
            <div className="z-10 w-full max-w-md">
                {/* Glass Card */}
                <div className="glass overflow-hidden rounded-3xl border bg-card/60 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 border-b border-border/50 bg-muted/20 px-8 pb-6 pt-10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h1 className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-extrabold text-transparent tracking-tight">
                                {STORE_NAME}
                            </h1>
                            <p className="mt-1 text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                Panel Administrativo
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="space-y-5 px-8 pb-10 pt-8">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                Contraseña de Acceso
                            </label>
                            <div className="relative group">
                                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="flex h-12 w-full rounded-xl border border-input/50 bg-background/50 px-4 py-2 pl-11 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background hover:bg-background/80"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Verificando credenciales…
                                </>
                            ) : (
                                <>
                                    <span>Ingresar al Sistema</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-muted-foreground/60 font-medium tracking-wide">
                    © {new Date().getFullYear()} {STORE_NAME} OS v2.0
                </p>
            </div>
        </div>
    );
}
