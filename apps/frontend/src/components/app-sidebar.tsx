"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, Sparkles, LogOut, BotMessageSquare, LayoutDashboard } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { STORE_NAME } from "@/lib/store";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Inventario",
        href: "/admin/inventory",
        icon: Package,
    },
    {
        title: "Catálogo Público",
        href: "/catalog",
        icon: ShoppingBag,
    },
    {
        title: "Configuración Bot",
        href: "/admin/bot",
        icon: BotMessageSquare,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar className="glass-card border-r-0 border-white/10">
            <SidebarHeader className="border-b px-6 py-5">
                <Link href="/admin/inventory" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold tracking-tight">
                        {STORE_NAME}
                    </span>
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        Admin
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                        Navegación
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t px-4 py-3">
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </form>
                <p className="mt-1 px-2 text-[11px] text-muted-foreground">
                    © {new Date().getFullYear()} {STORE_NAME}
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}
