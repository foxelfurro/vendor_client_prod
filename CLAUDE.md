# Instrucciones y Contexto del Proyecto para Asistentes de IA (vendor-hub-client)

## Descripción General
Este proyecto (`vendor-hub-client`) es el frontend de una plataforma SaaS orientada a la gestión de vendedores, inventario, catálogos y punto de venta (Caja). Cuenta con interfaces de administración, gestión de productos y una vista de tienda pública (`/store/:slug`).

## Stack Tecnológico Principal
- **Framework:** React 19 + Vite
- **Lenguaje:** TypeScript
- **Enrutamiento:** React Router DOM v7
- **Estilos:** Tailwind CSS (v3.4) + utilidades como Tailwind Merge y Animate.
- **Componentes UI:** Shadcn UI (basado en Radix UI)
- **Iconos:** Lucide React y Hugeicons (@hugeicons/react)
- **Peticiones HTTP:** Axios
- **Características adicionales:** Recharts (para visualización de datos), HTML5-QRCode y qrcode.react (para manejo y escaneo de códigos).
- **Tipografía:** Figtree (`@fontsource-variable/figtree`).

## Arquitectura y Estructura de Rutas (`App.tsx`)
El enrutamiento está dividido en tres niveles de acceso, gestionados a través de `AuthContext`:
1. **Rutas Públicas:** Accesibles sin sesión (`/login`, `/checkout`, `/renovar`, `/store/:slug`, `/support`, `/forgot-password`, `/reset-password`). El checkout y renovación son públicos para facilitar el onboarding y pagos de nuevos usuarios.
2. **Rutas Protegidas (`<ProtectedRoute>`):** Requieren sesión activa. Incluyen vistas clave de operación como `/dashboard`, `/catalogo`, `/inventario`, `/caja` y `/perfil`.
3. **Rutas de Administrador (`<AdminRoute>`):** Restringidas a usuarios con `rol === 1` (ej. `/admin`, `/admin/aprobaciones`).

## Modelo de Datos y Reglas de Negocio
Estas reglas son obligatorias. No reintroduzcas patrones antiguos que ya fueron migrados.

1. **Categorías relacionales:** La categoría de una joya se modela con `catalogo_maestro.categoria_id` (entero) que referencia `categorias(id)`. NUNCA uses un campo de texto libre para la categoría (la antigua columna `catalogo_maestro.categoria` de texto fue eliminada). El backend expone el nombre de la categoría como `categoria` (string) haciendo `JOIN` con la tabla `categorias`; el frontend filtra/agrupa por ese nombre.
2. **Joyas propias y aprobación:** TODA joya vive en `catalogo_maestro`. La columna `estado` (boolean) controla su visibilidad: `false` = pendiente (visible solo en el inventario y la tienda pública de la vendedora que la creó), `true` = aprobada (visible para todas en el catálogo maestro). La columna `creado_por` (uuid) indica qué vendedora la originó (`NULL` = creada por un administrador, nace aprobada). Una vendedora NO agrega joyas propias directamente a `inventario_vendedor`: se crean en `catalogo_maestro` con `estado = false` y se vinculan a su inventario. El administrador las revisa, asigna categoría y aprueba/rechaza en `/admin/aprobaciones`.
3. **Inventario:** `inventario_vendedor.producto_maestro_id` es obligatorio (NOT NULL) y siempre referencia una joya de `catalogo_maestro`. Ya NO existen las columnas `nombre_custom`, `sku_custom` ni `imagen_custom`.
4. **Filtros:** Existe un único componente de filtro, `src/components/ProductFilters.tsx` (con `ProductFilterState` y `DEFAULT_PRODUCT_FILTERS`), usado en `Catalog.tsx`, `Inventory.tsx` y `PublicStore.tsx`. No crees componentes de filtro por página.
5. **Historial de SKU:** `catalogo_maestro.skus_anteriores` (arreglo de texto) guarda los SKUs que tuvo una joya antes de renombrarse. El backend lo archiva automáticamente al cambiar el SKU en `updateCatalogItem`. La búsqueda y el escáner QR deben reconocer tanto el SKU vigente como los anteriores (usa los helpers `matchSku` y `skuIncluye` de `src/lib/sku.ts`), pero en la interfaz se muestra SIEMPRE el SKU vigente (`sku`).

## Convenciones de Código y Diseño
1. **Importaciones y Alias:** Las importaciones absolutas apuntando a `src/` deben utilizar el alias `@/` (ya configurado en `vite.config.ts`).
2. **Estilo de Diseño (UI/UX):** El diseño debe ser invariablemente profesional, limpio y minimalista. Mantén una estética refinada inspirada en los estándares de diseño de Apple: amplio uso del espacio en blanco, interfaces limpias sin sobrecarga de elementos, esquemas de color sobrios y tipografía clara.
3. **Manejo de Clases (CSS):** Emplea exclusivamente Tailwind CSS para los estilos. Para clases condicionales, utiliza la función utilitaria `cn` (que combina `clsx` y `tailwind-merge` típicamente ubicada en `src/lib/utils.ts`).
4. **Estructura de Componentes:** - Utiliza componentes funcionales con TypeScript.
   - Separa la lógica de negocio en custom hooks cuando los componentes se vuelvan demasiado complejos.
   - Todo componente reutilizable de UI debe colocarse en `src/components/ui/` (preferiblemente generado vía Shadcn).
5. **Autenticación y Estado:** Utiliza el hook `useAuth` para cualquier validación de permisos de usuario o estado de sesión dentro de los componentes.

## Reglas Directas para la IA
- **Tipado estricto:** Genera siempre código TypeScript fuertemente tipado. Evita el uso de `any`; define interfaces o tipos específicos para props, respuestas de API y estados.
- **Responsividad:** Todas las nuevas vistas o componentes deben desarrollarse bajo un enfoque *mobile-first*.
- **Buenas Prácticas:** Escribe un código modular y mantenible. No modifiques la configuración base (`vite.config.ts`, `package.json`, etc.) sin una razón arquitectónica de peso.