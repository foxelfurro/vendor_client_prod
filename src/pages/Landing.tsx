/**
 * @file Landing.tsx
 * @description Página principal pública de Lumin (lumin.qlatte.com).
 *
 * Es la primera impresión para visitantes nuevos y la puerta de entrada para
 * vendedoras ya registradas. Funciona como funnel de conversión:
 *   - CTAs primarios "Hazte socia" → /registro
 *   - CTAs secundarios "Iniciar sesión" → /login
 *
 * Las imágenes son capturas reales de la app en celular y se reemplazan
 * después editando los src marcados con `REEMPLAZAR:`.
 */

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Boxes,
  QrCode,
  Store,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Tag,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

/* -------------------------------------------------------------------------- */
/*  Datos de contenido                                                         */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Boxes,
    title: 'Catálogo Maestro compartido',
    body:
      'Accede a un universo de joyería ya agregado. selecciona y agrega piezas a tu inventario en segundos, sin teclear ni una sola descripción.',
  },
  {
    icon: Store,
    title: 'Tu tienda online en un link',
    body:
      'Cada socia recibe una tienda pública, lista para compartir por WhatsApp o Instagram. Sin código, sin diseñador.',
  },
  {
    icon: ShoppingBag,
    title: 'Caja inteligente',
    body:
      'Cobra en segundos, registra cada venta y obtén el ticket al instante. Diseñada para el celular, lista para el mostrador.',
  },
  {
    icon: QrCode,
    title: 'Escáner QR integrado',
    body:
      'Busca, cobra o consulta cualquier pieza apuntando con la cámara. Tu inventario, en la palma de la mano.',
  },
  {
    icon: BarChart3,
    title: 'Métricas que entiendes',
    body:
      'Ventas, márgenes y piezas con mejor desempeño. Un dashboard limpio que te dice exactamente dónde está tu dinero.',
  },
  {
    icon: RotateCcw,
    title: 'Devoluciones sin dolor',
    body:
      'Registra cambios y devoluciones en dos toques. Tu inventario se ajusta solo.',
  },
];

const SHOWCASE = [
  {
    eyebrow: 'Inventario',
    title: 'Toda tu joyería, ordenada como nunca.',
    body:
      'Filtros por categoría, búsqueda por SKU (incluso por SKUs anteriores) y fotos profesionales. Lo que antes vivía en una hoja de Excel ahora vive en tu bolsillo.',
    bullets: [
      'Sincronización en tiempo real',
      'Historial automático de SKU',
      'Cero duplicados, cero capturas manuales',
    ],
    // REEMPLAZAR: captura de pantalla de la pantalla de Inventario (celular).
    image: 'https://cdn.qlatte.com/uploads/capturas/IMG_2169.png',
    align: 'right' as const,
  },
  {
    eyebrow: 'Tienda Pública',
    title: 'Vende sin abrir la tienda.',
    body:
      'Comparte el link de tu tienda y deja que tus clientas exploren tu colección 24/7. Diseño limpio, mobile-first, sin distracciones.',
    bullets: [
      'URL personalizada lumin.qlatte.com/store/tu-marca',
      'Galería con filtros automáticos',
      'Optimizada para compartir en redes',
    ],
    // REEMPLAZAR: captura de pantalla de la Tienda Pública (celular).
    image: 'https://cdn.qlatte.com/uploads/capturas/IMG_2171.png',
    align: 'left' as const,
  },
  {
    eyebrow: 'Caja',
    title: 'Cobra con la misma elegancia con la que vendes.',
    body:
      'Diseñada para ferias, bazares y tu propio mostrador. Sin terminales caras, sin pantallas saturadas. Solo tú, tu cliente y la venta.',
    bullets: [
      'Búsqueda instantánea por nombre o QR',
      'Tickets digitales',
      'Funciona offline cuando lo necesites',
    ],
    // REEMPLAZAR: captura de pantalla de la pantalla Caja (celular).
    image: 'https://cdn.qlatte.com/uploads/capturas/IMG_2172.png',
    align: 'right' as const,
  },
];

/* -------------------------------------------------------------------------- */
/*  Subcomponentes                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Placeholder estético para una captura de celular.
 * Cuando el equipo agregue las imágenes, basta con sustituir el src en
 * `SHOWCASE` o pasar `src` como prop.
 */


const PhoneFrame = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="relative mx-auto w-[260px] sm:w-[300px]">
    <div className="relative aspect-[9/19] rounded-[2.75rem] bg-[#2E3050] p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
      <div className="absolute left-1/2 top-2 -translate-x-1/2 w-24 h-5 bg-[#2E3050] rounded-b-2xl z-10" />
      <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] bg-[#1A1C2C]">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1A1C2C] to-[#252840] text-[#A0A3B1]">
            <Smartphone size={32} className="opacity-40" />
            <span className="text-[0.6rem] uppercase tracking-[0.25em] font-bold opacity-50 text-center px-6">
              Espacio para captura
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Boxes;
  title: string;
  body: string;
}) => (
  <div className="group rounded-2xl border border-[#2E3050] bg-[#20223A] p-6 sm:p-7 transition-all hover:border-[#7B4CFF]/30 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)]">
    <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[#7B4CFF]/15 p-3 text-[#7B4CFF] transition-transform group-hover:-translate-y-0.5">
      <Icon size={20} strokeWidth={2} />
    </div>
    <h3 className="mb-2 text-lg font-headline font-bold tracking-tight text-white">
      {title}
    </h3>
    <p className="text-sm leading-relaxed text-[#A0A3B1]">{body}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Página                                                                     */
/* -------------------------------------------------------------------------- */

const Landing = () => {
  return (
    <div className="bg-[#1A1C2C] font-body text-white antialiased min-h-dvh flex flex-col">
      <PublicNav />

      <main className="flex-grow">
        {/* ================================================================= */}
        {/*  HERO                                                              */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #7B4CFF 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
            aria-hidden
          />

          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 pt-14 sm:pt-22 pb-18 sm:pb-26">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Copy */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7B4CFF]/30 bg-[#7B4CFF]/10 px-3 py-1.5 mb-6">
                  <Sparkles size={12} className="text-[#7B4CFF]" />
                  <span className="text-[0.65rem] uppercase font-bold tracking-[0.2em] text-[#A0A3B1]">
                    Plataforma para vendedoras de joyería
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold tracking-tighter leading-[1.05] text-white mb-6">
                  Tu joyería,
                  <br />
                  <span className="text-[#7B4CFF]">organizada y vendiendo.</span>
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-[#A0A3B1] max-w-xl mx-auto lg:mx-0 mb-10">
                  Lumin reúne tu inventario, catálogo, tienda online y caja en un
                  solo lugar. Diseñada para que vendas más sin pelearte con
                  hojas de cálculo ni capturas manuales.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    to="/registro"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B4CFF] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#7B4CFF]/25 transition-all hover:bg-[#6B3CEF] active:scale-[0.98]"
                  >
                    Hazte socia
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#2E3050] bg-[#20223A] px-7 py-4 text-sm font-bold text-white transition-all hover:border-[#7B4CFF]/40"
                  >
                    Ya soy socia · Iniciar sesión
                  </Link>
                </div>

                <p className="mt-6 text-xs text-[#A0A3B1]/70 text-center lg:text-left">
                  Sin permanencia. Cancela cuando quieras.
                </p>
              </div>

              {/* Captura de pantalla hero */}
              <div className="relative">
                <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-[#7B4CFF]/20 to-[#20223A] blur-2xl opacity-60" />
                <PhoneFrame src="https://cdn.qlatte.com/uploads/capturas/IMG_2173.png" alt="Vista principal de Lumin en celular" />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  TIRA DE BENEFICIOS RÁPIDOS                                        */}
        {/* ================================================================= */}
        <section className="border-y border-[#2E3050] bg-[#20223A]">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { icon: ShieldCheck, label: 'Pagos seguros con Stripe' },
                { icon: Smartphone, label: 'Diseñada mobile-first' },
                { icon: Tag, label: 'Sin costo de configuración' },
                { icon: CheckCircle2, label: 'Soporte humano en español' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 justify-center lg:justify-start">
                  <Icon size={18} className="text-[#7B4CFF] shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-[#A0A3B1]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  FEATURES PRINCIPALES                                              */}
        {/* ================================================================= */}
        <section id="funcionalidades" className="py-20 sm:py-28">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
            <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
              <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                Todo en uno
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-white">
                Construida para cómo vendes hoy.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-[#A0A3B1] leading-relaxed">
                Cada función fue diseñada con vendedoras reales. Sin curva de
                aprendizaje, sin manuales de 80 páginas.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {FEATURES.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  SHOWCASE ALTERNADO                                                */}
        {/* ================================================================= */}
        <section className="py-20 sm:py-28 bg-[#20223A] border-y border-[#2E3050]">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 space-y-24 sm:space-y-32">
            {SHOWCASE.map((item) => (
              <div
                key={item.title}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  item.align === 'left' ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* Texto */}
                <div>
                  <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                    {item.eyebrow}
                  </span>
                  <h3 className="mt-3 text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-5 text-base text-[#A0A3B1] leading-relaxed">
                    {item.body}
                  </p>
                  <ul className="mt-8 space-y-3">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#7B4CFF] shrink-0 mt-0.5" />
                        <span className="text-sm text-white">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Captura */}
                <div className="relative">
                  <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#7B4CFF]/10 to-[#20223A] blur-2xl opacity-60" />
                  <PhoneFrame src={item.image} alt={item.title} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/*  PRICING                                                           */}
        {/* ================================================================= */}
        <section id="precio" className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
              Precio honesto
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-white">
              Una sola suscripción. Todo incluido.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#A0A3B1]">
              Sin niveles confusos. Sin upsells. Sin sorpresas en tu recibo.
            </p>

            <div className="mt-12 rounded-3xl border border-[#2E3050] bg-[#20223A] p-8 sm:p-12 shadow-lg shadow-black/20 text-left">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 border-b border-[#2E3050]">
                <div>
                  <h3 className="text-2xl font-headline font-extrabold tracking-tight text-white">
                    Lumin · Acceso completo
                  </h3>
                  <p className="mt-2 text-sm text-[#A0A3B1]">
                    Cuenta de socia con todas las funciones, actualizaciones incluidas.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-baseline gap-2 sm:justify-end">
                    <span className="text-5xl font-headline font-extrabold tracking-tighter text-[#FFD600]">
                      $299.99
                    </span>
                    <span className="text-sm font-bold text-[#A0A3B1]">MXN / mes</span>
                  </div>
                </div>
              </div>

              <ul className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  'Catálogo maestro ilimitado',
                  'Tienda pública con link propio',
                  'Caja, QR y devoluciones',
                  'Dashboard con métricas',
                  'Soporte por correo y WhatsApp',
                  'Actualizaciones para siempre',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#7B4CFF] shrink-0 mt-0.5" />
                    <span className="text-sm text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  to="/registro"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B4CFF] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#7B4CFF]/25 transition-all hover:bg-[#6B3CEF] active:scale-[0.98]"
                >
                  Comenzar ahora
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="mt-4 text-center text-xs text-[#A0A3B1]/70">
                  Cancela cuando quieras desde tu perfil.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  CTA FINAL DUAL (NUEVAS vs EXISTENTES)                             */}
        {/* ================================================================= */}
        <section className="pb-24">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
              {/* Para nuevas */}
              <div className="rounded-3xl bg-[#7B4CFF] p-10 sm:p-12 text-white shadow-xl shadow-[#7B4CFF]/20">
                <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] opacity-60">
                  Nueva en Lumin
                </span>
                <h3 className="mt-3 text-3xl font-headline font-extrabold tracking-tight">
                  Empieza a vender mejor hoy.
                </h3>
                <p className="mt-4 text-sm opacity-80 leading-relaxed">
                  Crea tu cuenta en menos de un minuto. Activa tu suscripción y
                  empieza a usar Lumin de inmediato.
                </p>
                <Link
                  to="/registro"
                  className="mt-8 group inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20"
                >
                  Hazte socia
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Para existentes */}
              <div className="rounded-3xl border border-[#2E3050] bg-[#20223A] p-10 sm:p-12">
                <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                  Ya eres socia
                </span>
                <h3 className="mt-3 text-3xl font-headline font-extrabold tracking-tight text-white">
                  Tu negocio te está esperando.
                </h3>
                <p className="mt-4 text-sm text-[#A0A3B1] leading-relaxed">
                  Entra a tu panel para revisar inventario, ventas y novedades
                  del catálogo maestro.
                </p>
                <Link
                  to="/login"
                  className="mt-8 group inline-flex items-center gap-2 rounded-xl border border-[#2E3050] px-6 py-3.5 text-sm font-bold text-white transition-all hover:border-[#7B4CFF]/60"
                >
                  Iniciar sesión
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Landing;
