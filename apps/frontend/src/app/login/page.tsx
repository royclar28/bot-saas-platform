"use client";

import { useActionState } from "react";
import { Sparkles, Lock, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";
import { STORE_NAME } from "@/lib/store";

export default function LoginPage() {
    // initialize state as undefined to match server action signature
    const [errorMessage, formAction, isPending] = useActionState(login, undefined);

    return (
        <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20 px-4">
            <div className="w-full max-w-sm">
                {/* Card */}
                <div className="rounded-2xl border bg-card/80 shadow-lg backdrop-blur-sm">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 border-b px-8 pb-6 pt-10">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            <Sparkles className="h-7 w-7 text-primary" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {STORE_NAME}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Panel Administrativo
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="space-y-4 px-8 pb-8 pt-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium leading-none"
                            >
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="Ingresa tu contraseña"
                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 pl-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verificando…
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} {STORE_NAME}
                </p>
            </div>
        </div>
    );
}
