import { useMemo } from 'react';
import { SlidersHorizontal, Tag, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';


export interface CatalogFilterState {
  categoria: string;
  precioMin: number;
  precioMax: number;
  ordenPrecio: 'none' | 'asc' | 'desc';
}

interface CatalogFiltersProps {
  productos: any[];
  filters: CatalogFilterState;
  onChange: (filters: CatalogFilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DEFAULT_FILTERS: CatalogFilterState = {
  categoria: '',
  precioMin: 0,
  precioMax: 999999,
  ordenPrecio: 'none',
};

const CatalogFilters = ({ productos, filters, onChange, isOpen, onClose }: CatalogFiltersProps) => {
  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach(p => {
      if (p.categoria && p.categoria.trim()) set.add(p.categoria.trim());
    });
    return Array.from(set).sort();
  }, [productos]);

  const precioRange = useMemo(() => {
    if (!productos.length) return { min: 0, max: 10000 };
    const precios = productos.map(p => parseFloat(p.precio_sugerido) || 0);
    return { min: Math.floor(Math.min(...precios)), max: Math.ceil(Math.max(...precios)) };
  }, [productos]);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.precioMin > precioRange.min ||
    filters.precioMax < precioRange.max;

  const resetFilters = () =>
    onChange({ ...DEFAULT_FILTERS, precioMin: precioRange.min, precioMax: precioRange.max });

  const setCategoria = (cat: string) =>
    onChange({ ...filters, categoria: filters.categoria === cat ? '' : cat });

  const setOrden = (orden: CatalogFilterState['ordenPrecio']) =>
    onChange({ ...filters, ordenPrecio: filters.ordenPrecio === orden ? 'none' : orden });


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
          fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-30 flex flex-col
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
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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

          {/* Categoría */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Categoría</span>
            </div>
            <div className="space-y-1">
              {categorias.map(cat => (
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

          {/* Ordenar por precio */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Ordenar por Precio</span>
            </div>
            <div className="space-y-1">
              {[
                { value: 'asc' as const,  label: 'Menor a mayor' },
                { value: 'desc' as const, label: 'Mayor a menor' },
              ].map(opt => (
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

        {/* Footer con limpiar — solo visible si hay filtros activos */}
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

export default CatalogFilters;
