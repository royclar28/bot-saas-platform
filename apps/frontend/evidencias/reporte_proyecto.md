# Documentación del Proyecto: Admin Panel + Catálogo (v2.2)

## Resumen Ejecutivo

Sistema integral de comercio electrónico **White-Label**. Incluye panel administrativo protegido con **NextAuth** y un catálogo público con **Carrito de Compras** y checkout vía **WhatsApp**.

## Stack Tecnológico Actualizado

- **Core:** Next.js 15+ (App Router), Tailwind CSS.
- **Auth:** NextAuth.js v5 Beta (Credentials Provider).
- **State:** Context API + `useReducer` + LocalStorage Persistence.
- **UI Components:** shadcn/ui (Sheet, Sidebar, Input, Button).
- **Database:** PostgreSQL + Prisma ORM.

## Features Implementados

### 1. Autenticación (Admin)
- Login seguro con validación de entorno (`ADMIN_PASSWORD`).
- Middleware de protección para rutas `/admin`.
- Sesión persistente.

### 2. Catálogo Público (Cliente)
- Grid de productos responsivo.
- **Búsqueda Inteligente:** Filtrado instantáneo por texto (nombre/descripción).
- **Filtros por Categoría:** Botones tipo "píldora" generados dinámicamente.
- **Selector de Tallas:** Soporte para tallas múltiples en un mismo producto.

### 3. Carrito de Compras & Checkout
- **Lógica de Variantes:** Permite agregar el mismo producto en diferentes tallas como ítems separados.
- **Panel Deslizante (Sheet):** Vista rápida de productos seleccionados.
- **Persistencia LocalStorage.**
- **Integración WhatsApp:** Genera pedido con detalle de tallas.

## Búsqueda y Filtrado (Demo)

````carousel
![Búsqueda por Texto ("Body")](/home/royclar/.gemini/antigravity/brain/82349621-82ee-484c-b459-bbf3746f2cfc/search_result_body_1771558314516.png)
<!-- slide -->
![Filtrado por Categoría](/home/royclar/.gemini/antigravity/brain/82349621-82ee-484c-b459-bbf3746f2cfc/filter_result_category_1771558340670.png)
<!-- slide -->
![Estado "Sin Resultados"](/home/royclar/.gemini/antigravity/brain/82349621-82ee-484c-b459-bbf3746f2cfc/search_no_results_1771558436713.png)
````

## Flujo de Compra y Selección de Tallas

````carousel
![Catálogo - Selección de Tallas](/home/royclar/.gemini/antigravity/brain/82349621-82ee-484c-b459-bbf3746f2cfc/catalog_badge_3_1771556584365.png)
<!-- slide -->
![Carrito - Diferentes Tallas del mismo producto](/home/royclar/.gemini/antigravity/brain/82349621-82ee-484c-b459-bbf3746f2cfc/cart_size_separation_1771557613632.png)
<!-- slide -->
![WhatsApp - Mensaje con Tallas](/home/royclar/.gemini/antigravity/brain/82349621-82ee-484c-b459-bbf3746f2cfc/whatsapp_message_verification_1771557733170.png)
````

## Estructura de Mensaje WhatsApp

```text
Hola, me gustaría hacer un encargo en *GabyStore*.
Mi nombre es *Tester Name*, de *Test City*.
📞 Teléfono: 1234567890

🛒 *Mi Pedido:*
- 1x Body strapless [S] (Azul marino) ($5.00)
- 1x Body strapless [M] (Azul marino) ($5.00) *<-- Diferenciación por talla*

💰 *Total: $10.00*
```

## Próximos Pasos Recomendados
- Dashboard de ventas/encargos (si se decidiera guardar pedidos en DB).
