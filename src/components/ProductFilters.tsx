import { useMemo } from 'react';
import { SlidersHorizontal, Tag, X, ChevronDown, Layers, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  categoria: '',
  precioMin: 0,
  precioMax: 999999,
  ordenPrecio: 'none',
  tipo: 'todos',
  soloConStock: false,
};

interface ProductFiltersProps {
  productos: any[];
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  /** Muestra el filtro "Tipo de pieza" (catálogo / propias). Solo Mi Inventario. */
  showTipo?: boolean;
  /** Muestra "Solo con stock" y el ordenamiento por stock. Solo Mi Inventario. */
  showStock?: boolean;
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

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col
          transition-transform duration-300 ease-in-out shadow-xl
          lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:h-auto lg:rounded-2xl lg:border
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-900 text-sm tracking-wide uppercase">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                ON
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors underline underline-offset-2"
              >
                Limpiar
              </button>
            )}
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors">
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
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all border
                  ${filters.soloConStock
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'text-slate-700 border-slate-200 hover:bg-slate-50'}
                `}
              >
                <span className="flex items-center gap-2">
                  <CheckSquare size={15} />
                  Solo con stock
                </span>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${filters.soloConStock ? 'bg-white border-white' : 'border-slate-300'}`} />
              </button>
            </section>
          )}

          {/* Tipo de pieza */}
          {showTipo && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Tipo de Pieza</span>
              </div>
              <div className="space-y-1">
                {[
                  { value: 'todos' as const, label: 'Todas las piezas' },
                  { value: 'catalogo' as const, label: 'Del catálogo' },
                  { value: 'propias' as const, label: 'Piezas propias' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTipo(opt.value)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${filters.tipo === opt.value
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categoría */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Categoría</span>
            </div>
            <div className="space-y-1">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${filters.categoria === cat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  {cat}
                </button>
              ))}
              {categorias.length === 0 && (
                <p className="text-xs text-slate-400 italic px-3">Sin categorías disponibles</p>
              )}
            </div>
          </section>

          {/* Ordenar */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Ordenar</span>
            </div>
            <div className="space-y-1">
              {ordenOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOrden(opt.value)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${filters.ordenPrecio === opt.value
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer — limpiar */}
        {hasActiveFilters && (
          <div className="p-4 border-t border-slate-100 flex-shrink-0">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm h-10"
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
