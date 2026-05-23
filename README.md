# vendor-hub-client

Frontend SaaS de **Qlatte Lumin** — plataforma de gestión de joyería para vendedoras.

Incluye panel de control, catálogo maestro, inventario personal, punto de venta, tienda pública y personalización de marca.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite |
| Lenguaje | TypeScript |
| Enrutamiento | React Router DOM v7 |
| Estilos | Tailwind CSS v3.4 |
| Componentes UI | Shadcn UI (Radix UI) |
| Iconos | Lucide React + Hugeicons |
| HTTP | Axios |
| Gráficas | Recharts |
| Escáner QR | Html5QrcodeScanner |
| QR render | qrcode.react |
| Tipografía | Figtree Variable |
| Captcha | Cloudflare Turnstile |

---

## Estructura del proyecto

```
src/
├── assets/                 # Imágenes y recursos estáticos
├── components/
│   ├── ui/                 # Componentes Shadcn + utilidades (PageLoader, etc.)
│   ├── AppFooter.tsx       # Footer para páginas protegidas
│   ├── PublicFooter.tsx    # Footer para páginas públicas
│   ├── PublicNav.tsx       # Barra de navegación de la zona pública
│   ├── Layout.tsx          # Shell con sidebar para páginas protegidas
│   ├── ProductCard.tsx     # Tarjeta de producto reutilizable
│   ├── ProductFilters.tsx  # Filtros unificados (Catálogo, Inventario, Tienda)
│   ├── StorePreview.tsx    # Preview de tienda pública en tiempo real
│   └── WhatsAppCTA.tsx     # Botón flotante de WhatsApp
├── context/
│   └── AuthContext.tsx     # Contexto de autenticación global
├── lib/
│   ├── api.ts              # Instancia de Axios configurada
│   ├── image.ts            # Utilidades de redimensionado de imágenes
│   ├── personalization.ts  # Helpers para personalización de tienda
│   ├── sku.ts              # Helpers matchSku / skuIncluye
│   ├── turnstile.ts        # Constante de la site key de Turnstile
│   └── utils.ts            # cn() y otras utilidades
└── pages/
    ├── Login.tsx
    ├── Register.tsx
    ├── ForgotPassword.tsx
    ├── ResetPassword.tsx
    ├── Subscribe.tsx
    ├── PaymentReturn.tsx
    ├── Dashboard.tsx
    ├── Caja.tsx
    ├── Catalog.tsx
    ├── Inventory.tsx
    ├── Profile.tsx
    ├── PublicStore.tsx
    ├── AdminDashboard.tsx
    ├── JewelryApproval.tsx
    ├── Support.tsx
    ├── Devoluciones.tsx
    ├── policy.tsx
    └── terms.tsx
```

---

## Instalación y configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz con las siguientes variables:

```env
# URL base de la API (sin barra final)
VITE_API_URL=http://localhost:3000

# Site key pública de Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=tu_site_key_aqui
```

> La site key pública de Turnstile es segura para exponer en el frontend.
> La secret key NUNCA debe incluirse aquí; pertenece al backend.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

### 4. Compilar para producción

```bash
npm run build
npm run preview   # previsualizar el build localmente
```

---

## Arquitectura de rutas

| Tipo | Rutas | Descripción |
|---|---|---|
| Públicas | `/login`, `/registro`, `/suscripcion`, `/store/:slug`, `/support`, `/forgot-password`, `/reset-password`, `/privacy`, `/terms`, `/devoluciones` | Accesibles sin sesión |
| Protegidas | `/dashboard`, `/catalogo`, `/inventario`, `/caja`, `/perfil` | Requieren JWT válido |
| Admin | `/admin`, `/admin/aprobaciones` | Requieren `rol === 1` |

---

## Convenciones clave

- **Alias**: Usa siempre `@/` para importaciones desde `src/` (configurado en `vite.config.ts`).
- **Estilos**: Solo Tailwind CSS. Usa `cn()` de `src/lib/utils.ts` para clases condicionales.
- **Loaders**: Usa `<PageLoader />` de `src/components/ui/PageLoader.tsx` en todos los estados de carga.
- **Footers**: Usa `<AppFooter />` en páginas protegidas y `<PublicFooter />` en páginas públicas.
- **Nav pública**: Usa `<PublicNav />` en todas las páginas de la zona pública.
- **Filtros**: El componente unificado es `src/components/ProductFilters.tsx`; no crear filtros por página.
- **SKU**: Para búsqueda por SKU usa los helpers `matchSku` y `skuIncluye` de `src/lib/sku.ts`.
