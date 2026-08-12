/**
 * Configuración White-Label de la tienda.
 * Se lee desde variables de entorno para permitir personalización por cliente.
 */
export const STORE_NAME =
    process.env.NEXT_PUBLIC_STORE_NAME || "Mi Tienda";
