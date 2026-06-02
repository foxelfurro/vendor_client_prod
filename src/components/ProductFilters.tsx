import { useMemo } from 'react';
import { SlidersHorizontal, Tag, X, ChevronDown, Layers, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readableTextOn, type StoreTheme } from '@/lib/personalization';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
// Estado de filtro unificado para Catálogo Maestro, Mi Inventario y Tienda Pública.
export interface ProductFilterState {
  categoria: string;
  precioMin: number;
  precioMax: number;
  ordenPrecio: 'none' | 'asc' | 'desc' | 'stock_asc' | 'stock_desc';
  tipo: 'todos' | 'catalogo' | 'propias';
  soloConStock: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  categoria: '',
  precioMin: 0,
  precioMax: 999999,
  ordenPrecio: 'none',
  tipo: 'todos',
  soloConStock: false,
};

interface ProductFiltersProps {
  productos: { categoria?: string }[];
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  /** Muestra el filtro "Tipo de pieza" (catálogo / propias). Solo Mi Inventario. */
  showTipo?: boolean;
  /** Muestra "Solo con stock" y el ordenamiento por stock. Solo Mi Inventario. */
  showStock?: boolean;
  /** Tema claro/oscuro (personalización de la tienda pública). */
  theme?: StoreTheme;
  /** Color de acento para los estados activos (personalización de la tienda). */
  accentColor?: string;
}

// ─── Componente ────────────────────────────────────────────────────────────────
const ProductFilters = ({
  productos,
  filters,
  onChange,
  isOpen,
  onClose,
  showTipo = false,
  showStock = false,
  theme = 'light',
  accentColor,
}: ProductFiltersProps) => {

  // Las categorías se derivan de los productos cargados (campo relacional `categoria`).
  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.categoria && String(p.categoria).trim()) set.add(String(p.categoria).trim());
    });
    return Array.from(set).sort();
  }, [productos]);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.tipo !== 'todos' ||
    filters.soloConStock;

  const resetFilters = () => onChange({ ...DEFAULT_PRODUCT_FILTERS });

  const setCategoria = (cat: string) =>
    onChange({ ...filters, categoria: filters.categoria === cat ? '' : cat });

  const setOrden = (orden: ProductFilterState['ordenPrecio']) =>
    onChange({ ...filters, ordenPrecio: filters.ordenPrecio === orden ? 'none' : orden });

  const setTipo = (tipo: ProductFilterState['tipo']) =>
    onChange({ ...filters, tipo: filters.tipo === tipo ? 'todos' : tipo });

  const toggleSoloConStock = () =>
    onChange({ ...filters, soloConStock: !filters.soloConStock });

  // Opciones de ordenamiento (las de stock solo cuando showStock está activo).
  const ordenOptions: { value: ProductFilterState['ordenPrecio']; label: string }[] = [
    { value: 'asc', label: 'Precio: menor a mayor' },
    { value: 'desc', label: 'Precio: mayor a menor' },
    ...(showStock
      ? ([
          { value: 'stock_desc', label: 'Stock: mayor primero' },
          { value: 'stock_asc', label: 'Stock: menor primero' },
        ] as { value: ProductFilterState['ordenPrecio']; label: string }[])
      : []),
  ];

  // ─── Tema visual ─────────────────────────────────────────────────────────────
  const isDark = theme === 'dark';
  const ui = isDark
    ? {
        panel: 'bg-[#1c1c1f] border-white/10',
        headerBorder: 'border-white/[0.08]',
        heading: 'text-zinc-100',
        label: 'text-zinc-400',
        icon: 'text-zinc-500',
        item: 'text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100',
        itemBorder: 'border-white/10 hover:bg-white/[0.06] text-zinc-300',
        clear: 'text-zinc-500 hover:text-zinc-200',
        empty: 'text-zinc-500',
        dotIdle: 'border-zinc-600',
      }
    : {
        panel: 'bg-white border-slate-200',
        headerBorder: 'border-slate-100',
        heading: 'text-slate-900',
        label: 'text-slate-500',
        icon: 'text-slate-400',
        item: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        itemBorder: 'border-slate-200 hover:bg-slate-50 text-slate-700',
        clear: 'text-slate-400 hover:text-slate-700',
        empty: 'text-slate-400',
        dotIdle: 'border-slate-300',
      };

  // Estado activo de los elementos de lista (categoría, orden, tipo).
  const activeItemBg = accentColor || '#0f172a'; // slate-900 por defecto
  const activeItemText = accentColor ? readableTextOn(accentColor) : '#ffffff';
  // Acentos menores (ícono de cabecera y badge "ON"): indigo por defecto.
  const accentMark = accentColor || '#6366f1';
  const accentMarkText = accentColor ? readableTextOn(accentColor) : '#ffffff';

  const activeStyle = { background: activeItemBg, color: activeItemText };

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 border-r z-50 flex flex-col
          transition-transform duration-300 ease-in-out shadow-xl
          lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:h-auto lg:rounded-2xl lg:border
          ${ui.panel}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${ui.headerBorder}`}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" style={{ color: accentMark }} />
            <span className={`font-bold text-sm tracking-wide uppercase ${ui.heading}`}>Filtros</span>
            {hasActiveFilters && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                style={{ background: accentMark, color: accentMarkText }}
              >
                ON
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className={`text-xs transition-colors underline underline-offset-2 ${ui.clear}`}
              >
                Limpiar
              </button>
            )}
            <button onClick={onClose} className={`lg:hidden transition-colors ${ui.clear}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-7">

          {/* Solo con stock */}
          {showStock && (
            <section>
              <button
                onClick={toggleSoloConStock}
                style={filters.soloConStock ? activeStyle : undefined}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all border
                  ${filters.soloConStock ? 'border-transparent' : ui.itemBorder}
                `}
              >
                <span className="flex items-center gap-2">
                  <CheckSquare size={15} />
                  Solo con stock
                </span>
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    filters.soloConStock ? 'bg-white border-white' : ui.dotIdle
                  }`}
                />
              </button>
            </section>
          )}

          {/* Tipo de pieza */}
          {showTipo && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers className={`w-3.5 h-3.5 ${ui.icon}`} />
                <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${ui.label}`}>Tipo de Pieza</span>
              </div>
              <div className="space-y-1">
                {[
                  { value: 'todos' as const, label: 'Todas las piezas' },
                  { value: 'catalogo' as const, label: 'Del catálogo' },
                  { value: 'propias' as const, label: 'Piezas propias' },
                ].map((opt) => {
                  const active = filters.tipo === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTipo(opt.value)}
                      style={active ? activeStyle : undefined}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active ? '' : ui.item
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Categoría */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag className={`w-3.5 h-3.5 ${ui.icon}`} />
              <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${ui.label}`}>Categoría</span>
            </div>
            <div className="space-y-1">
              {categorias.map((cat) => {
                const active = filters.categoria === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    style={active ? activeStyle : undefined}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? '' : ui.item
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              {categorias.length === 0 && (
                <p className={`text-xs italic px-3 ${ui.empty}`}>Sin categorías disponibles</p>
              )}
            </div>
          </section>

          {/* Ordenar */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronDown className={`w-3.5 h-3.5 ${ui.icon}`} />
              <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${ui.label}`}>Ordenar</span>
            </div>
            <div className="space-y-1">
              {ordenOptions.map((opt) => {
                const active = filters.ordenPrecio === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setOrden(opt.value)}
                    style={active ? activeStyle : undefined}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? '' : ui.item
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer — limpiar */}
        {hasActiveFilters && (
          <div className={`p-4 border-t flex-shrink-0 ${ui.headerBorder}`}>
            <Button
              onClick={resetFilters}
              variant="outline"
              className={`w-full rounded-xl font-bold text-sm h-10 ${
                isDark
                  ? 'border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};

export default ProductFilters;
