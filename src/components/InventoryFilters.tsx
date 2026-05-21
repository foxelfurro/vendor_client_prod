import { useMemo } from 'react';
import { SlidersHorizontal, Tag, TrendingUp, X, ChevronDown, Layers, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
export interface InventoryFilterState {
  categoria: string;
  precioMin: number;
  precioMax: number;
  ordenPrecio: 'none' | 'asc' | 'desc' | 'stock_asc' | 'stock_desc';
  tipo: 'todos' | 'catalogo' | 'propias';
  soloConStock: boolean;
}

interface InventoryFiltersProps {
  inventario: any[];
  filters: InventoryFilterState;
  onChange: (filters: InventoryFilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DEFAULT_INV_FILTERS: InventoryFilterState = {
  categoria: '',
  precioMin: 0,
  precioMax: 999999,
  ordenPrecio: 'none',
  tipo: 'todos',
  soloConStock: false,
};

// ─── Componente ────────────────────────────────────────────────────────────────
const InventoryFilters = ({ inventario, filters, onChange, isOpen, onClose }: InventoryFiltersProps) => {

  const categorias = useMemo(() => {
    const set = new Set<string>();
    inventario.forEach((p) => {
      if (p.categoria && p.categoria.trim()) set.add(p.categoria.trim());
    });
    return Array.from(set).sort();
  }, [inventario]);

  const precioRange = useMemo(() => {
    if (!inventario.length) return { min: 0, max: 10000 };
    const precios = inventario.map((p) => parseFloat(p.precio_personalizado) || 0);
    return {
      min: Math.floor(Math.min(...precios)),
      max: Math.ceil(Math.max(...precios)),
    };
  }, [inventario]);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.tipo !== 'todos' ||
    filters.soloConStock ||
    filters.precioMin > precioRange.min ||
    filters.precioMax < precioRange.max;

  const resetFilters = () =>
    onChange({
      ...DEFAULT_INV_FILTERS,
      precioMin: precioRange.min,
      precioMax: precioRange.max,
    });

  const setCategoria = (cat: string) =>
    onChange({ ...filters, categoria: filters.categoria === cat ? '' : cat });

  const setOrden = (orden: InventoryFilterState['ordenPrecio']) =>
    onChange({ ...filters, ordenPrecio: filters.ordenPrecio === orden ? 'none' : orden });

  const setTipo = (tipo: InventoryFilterState['tipo']) =>
    onChange({ ...filters, tipo: filters.tipo === tipo ? 'todos' : tipo });

  const setPrecioRange = (vals: number[]) =>
    onChange({ ...filters, precioMin: vals[0], precioMax: vals[1] });

  const toggleSoloConStock = () =>
    onChange({ ...filters, soloConStock: !filters.soloConStock });

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-surface-container-lowest border-r border-outline-variant/10 z-30 flex flex-col
          transition-transform duration-300 ease-in-out shadow-xl
          lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:h-auto lg:rounded-2xl lg:border lg:border-outline-variant/10
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary-stitch" />
            <span className="font-bold text-on-surface text-sm tracking-wide uppercase">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-primary-stitch text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ON</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-2"
              >
                Limpiar
              </button>
            )}
            <button onClick={onClose} className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex-1 overflow-y-auto p-5 space-y-7">

          {/* Solo con stock */}
          <section>
            <button
              onClick={toggleSoloConStock}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all border
                ${filters.soloConStock
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'text-on-surface border-outline-variant/20 hover:bg-surface-container'}
              `}
            >
              <span className="flex items-center gap-2">
                <CheckSquare size={15} />
                Solo con stock
              </span>
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${filters.soloConStock ? 'bg-white border-white' : 'border-outline-variant/40'}`} />
            </button>
          </section>

          {/* Tipo de pieza */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant">Tipo de Pieza</span>
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
                      ? 'bg-zinc-900 text-white'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Categoría */}
          {categorias.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-3.5 h-3.5 text-on-surface-variant" />
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant">Categoría</span>
              </div>
              <div className="space-y-1">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${filters.categoria === cat
                        ? 'bg-zinc-900 text-white'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Ordenar */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant">Ordenar</span>
            </div>
            <div className="space-y-1">
              {[
                { value: 'asc' as const,        label: 'Precio: menor a mayor' },
                { value: 'desc' as const,       label: 'Precio: mayor a menor' },
                { value: 'stock_desc' as const, label: 'Stock: mayor primero' },
                { value: 'stock_asc' as const,  label: 'Stock: menor primero' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOrden(opt.value)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${filters.ordenPrecio === opt.value
                      ? 'bg-zinc-900 text-white'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}
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
          <div className="p-4 border-t border-outline-variant/10 flex-shrink-0">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full rounded-xl border-outline-variant/20 text-on-surface-variant hover:bg-surface-container font-bold text-sm h-10"
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

export default InventoryFilters;
