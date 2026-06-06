import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

/* -------------------------------------------------------------------------- */
/*  Datos de contenido                                                         */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Boxes,
    title: 'Catálogo Maestro compartido',
    body: 'Accede a un universo de joyería ya agregado. selecciona y agrega piezas a tu inventario en segundos, sin teclear ni una sola descripción.',
  },
  {
    icon: Store,
    title: 'Tu tienda online en un link',
    body: 'Cada socia recibe una tienda pública, lista para compartir por WhatsApp o Instagram. Sin código, sin diseñador.',
  },
  {
    icon: ShoppingBag,
    title: 'Caja inteligente',
    body: 'Cobra en segundos, registra cada venta y obtén el ticket al instante. Diseñada para el celular, lista para el mostrador.',
  },
  {
    icon: QrCode,
    title: 'Escáner QR integrado',
    body: 'Busca, cobra o consulta cualquier pieza apuntando con la cámara. Tu inventario, en la palma de la mano.',
  },
  {
    icon: BarChart3,
    title: 'Métricas que entiendes',
    body: 'Ventas, márgenes y piezas con mejor desempeño. Un dashboard limpio que te dice exactamente dónde está tu dinero.',
  },
  {
    icon: RotateCcw,
    title: 'Devoluciones sin dolor',
    body: 'Registra cambios y devoluciones en dos toques. Tu inventario se ajusta solo.',
  },
];

const SHOWCASE = [
  {
    eyebrow: 'Inventario',
    title: 'Toda tu joyería, ordenada como nunca.',
    body: 'Filtros por categoría, búsqueda por SKU (incluso por SKUs anteriores) y fotos profesionales. Lo que antes vivía en una hoja de Excel ahora vive en tu bolsillo.',
    bullets: [
      'Sincronización en tiempo real',
      'Historial automático de SKU',
      'Cero duplicados, cero capturas manuales',
    ],
    image: 'https://cdn.qlatte.com/uploads/capturas/IMG_2169.png',
    align: 'right' as const,
  },
  {
    eyebrow: 'Tienda Pública',
    title: 'Vende sin abrir la tienda.',
    body: 'Comparte el link de tu tienda y deja que tus clientas exploren tu colección 24/7. Diseño limpio, mobile-first, sin distracciones.',
    bullets: [
      'URL personalizada lumin.qlatte.com/store/tu-marca',
      'Galería con filtros automáticos',
      'Optimizada para compartir en redes',
    ],
    image: 'https://cdn.qlatte.com/uploads/capturas/IMG_2171.png',
    align: 'left' as const,
  },
  {
    eyebrow: 'Caja',
    title: 'Cobra con la misma elegancia con la que vendes.',
    body: 'Diseñada para ferias, bazares y tu propio mostrador. Sin terminales caras, sin pantallas saturadas. Solo tú, tu cliente y la venta.',
    bullets: [
      'Búsqueda instantánea por nombre o QR',
      'Tickets digitales',
      'Funciona offline cuando lo necesites',
    ],
    image: 'https://cdn.qlatte.com/uploads/capturas/IMG_2172.png',
    align: 'right' as const,
  },
];

/* -------------------------------------------------------------------------- */
/*  Animación: hook + componente                                               */
/* -------------------------------------------------------------------------- */

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({
  children,
  delay = 0,
  from = 'bottom',
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: 'bottom' | 'left' | 'right' | 'none';
  className?: string;
}) {
  const { ref, visible } = useInView();
  const initial =
    from === 'bottom' ? 'translateY(2.5rem)'
    : from === 'left' ? 'translateX(-2.5rem)'
    : from === 'right' ? 'translateX(2.5rem)'
    : 'none';

  return (
    <div
      ref={ref}
      className={cn('will-change-[opacity,transform]', className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : initial,
        transition: `opacity 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  iPhone 15 Pro — frame realista                                             */
/* -------------------------------------------------------------------------- */

const PhoneFrame = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="relative mx-auto w-[240px] sm:w-[272px] select-none">

    {/* Botón silencio */}
    <div
      className="absolute left-0 -translate-x-full rounded-l-[3px]"
      style={{
        top: '11%', height: '5%', width: '5px',
        background: 'linear-gradient(to right, #2a2a2c, #525254)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.1)',
      }}
    />
    {/* Subir volumen */}
    <div
      className="absolute left-0 -translate-x-full rounded-l-[3px]"
      style={{
        top: '20%', height: '9.5%', width: '5px',
        background: 'linear-gradient(to right, #2a2a2c, #525254)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.1)',
      }}
    />
    {/* Bajar volumen */}
    <div
      className="absolute left-0 -translate-x-full rounded-l-[3px]"
      style={{
        top: '31.5%', height: '9.5%', width: '5px',
        background: 'linear-gradient(to right, #2a2a2c, #525254)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.1)',
      }}
    />
    {/* Botón encendido */}
    <div
      className="absolute right-0 translate-x-full rounded-r-[3px]"
      style={{
        top: '23%', height: '14%', width: '5px',
        background: 'linear-gradient(to left, #2a2a2c, #525254)',
        boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.1)',
      }}
    />

    {/* Marco exterior — titanio */}
    <div
      className="relative"
      style={{
        aspectRatio: '9 / 19.5',
        borderRadius: '46px',
        padding: '3px',
        background: 'linear-gradient(145deg, #7c7c7e 0%, #3c3c3e 30%, #5c5c5e 55%, #2c2c2e 100%)',
        boxShadow:
          '0 55px 110px -15px rgba(0,0,0,0.65),' +
          '0 0 0 0.5px rgba(255,255,255,0.07),' +
          'inset 0 1px 0 rgba(255,255,255,0.16),' +
          'inset 0 -1px 0 rgba(0,0,0,0.4)',
      }}
    >
      {/* Pantalla */}
      <div
        className="relative h-full w-full overflow-hidden bg-black"
        style={{ borderRadius: '43px' }}
      >
        {/* Barra de estado */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between"
          style={{ padding: '10px 24px 0' }}
        >
          <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
            9:41
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Barras de señal */}
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '11px' }}>
              {[3, 5, 7, 10].map((h, i) => (
                <div
                  key={i}
                  style={{ width: '3px', height: `${h}px`, background: '#fff', borderRadius: '1px' }}
                />
              ))}
            </div>
            {/* WiFi */}
            <svg width="13" height="10" viewBox="0 0 16 12" fill="white">
              <path d="M8 9a1.5 1.5 0 110 3A1.5 1.5 0 018 9zm0-3c1.38 0 2.62.56 3.53 1.46L13 6A7 7 0 001 6l1.47 1.46A4.96 4.96 0 018 6zm0-4c2.2 0 4.2.9 5.65 2.34L15.08.93A9.97 9.97 0 008-.01 9.97 9.97 0 00.92.93L2.35 2.34A7.96 7.96 0 018 2z" />
            </svg>
            {/* Batería */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
              <div style={{
                width: '22px', height: '11px', borderRadius: '3px',
                border: '1px solid rgba(255,255,255,0.55)', padding: '2px',
                display: 'flex', alignItems: 'center',
              }}>
                <div style={{ width: '72%', height: '100%', background: '#fff', borderRadius: '1px' }} />
              </div>
              <div style={{ width: '2px', height: '5px', background: 'rgba(255,255,255,0.45)', borderRadius: '0 1px 1px 0' }} />
            </div>
          </div>
        </div>

        {/* Dynamic Island */}
        <div
          className="absolute z-30"
          style={{
            top: '9px', left: '50%', transform: 'translateX(-50%)',
            width: '92px', height: '28px',
            background: '#000', borderRadius: '50px',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
          }}
        />

        {/* Contenido de pantalla */}
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
        ) : (
          // Mini UI de Lumin como placeholder
          <div className="h-full w-full bg-[#0d0f1e] flex flex-col" style={{ paddingTop: '52px' }}>
            <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid rgba(46,48,80,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#7B4CFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '10px', height: '6px', background: 'rgba(255,255,255,0.85)', borderRadius: '1px' }} />
                </div>
                <div style={{ width: '36px', height: '6px', background: '#252840', borderRadius: '3px' }} />
              </div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#252840' }} />
            </div>
            <div style={{ flex: 1, padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', overflow: 'hidden' }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ background: '#1a1c30', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{
                    aspectRatio: '1', background: 'linear-gradient(135deg, #252840 0%, #1a1c2c 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShoppingBag size={13} style={{ color: 'rgba(123,76,255,0.55)' }} />
                  </div>
                  <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ height: '5px', background: '#2E3050', borderRadius: '3px', width: i % 2 === 0 ? '72%' : '55%' }} />
                    <div style={{ height: '5px', background: 'rgba(123,76,255,0.22)', borderRadius: '3px', width: '42%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '6px 8px 10px' }}>
              <div style={{
                height: '28px', borderRadius: '10px',
                background: 'rgba(123,76,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(123,76,255,0.45)' }} />
                <div style={{ width: '48px', height: '5px', background: 'rgba(123,76,255,0.25)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        )}

        {/* Indicador home */}
        <div
          className="absolute z-20"
          style={{
            bottom: '6px', left: '50%', transform: 'translateX(-50%)',
            width: '100px', height: '4px',
            background: 'rgba(255,255,255,0.22)', borderRadius: '3px',
          }}
        />

        {/* Reflejo del cristal */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.065) 0%, transparent 50%)',
            borderRadius: '43px',
          }}
        />
      </div>

      {/* Borde interior del marco */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '46px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
      />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  FeatureCard                                                                */
/* -------------------------------------------------------------------------- */

const FeatureCard = ({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Boxes;
  title: string;
  body: string;
}) => (
  <div className="group rounded-2xl border border-[--lumin-border] bg-[--lumin-surface] p-6 sm:p-7 transition-all duration-300 hover:border-[#7B4CFF]/35 hover:shadow-[0_20px_40px_-15px_rgba(123,76,255,0.15)]">
    <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[#7B4CFF]/12 p-3 text-[#7B4CFF] transition-transform duration-300 group-hover:-translate-y-0.5">
      <Icon size={20} strokeWidth={2} />
    </div>
    <h3 className="mb-2 text-lg font-headline font-bold tracking-tight text-[--lumin-text]">
      {title}
    </h3>
    <p className="text-sm leading-relaxed text-[--lumin-muted]">{body}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Página                                                                     */
/* -------------------------------------------------------------------------- */

const Landing = () => {
  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-dvh flex flex-col">
      <PublicNav />

      <main className="flex-grow">
        {/* ================================================================= */}
        {/*  HERO                                                              */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #7B4CFF 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
            aria-hidden
          />

          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 pt-14 sm:pt-22 pb-18 sm:pb-26">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Copy — anima al montar */}
              <div
                className="text-center lg:text-left animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7B4CFF]/30 bg-[#7B4CFF]/10 px-3 py-1.5 mb-6">
                  <Sparkles size={12} className="text-[#7B4CFF]" />
                  <span className="text-[0.65rem] uppercase font-bold tracking-[0.2em] text-[--lumin-muted]">
                    Plataforma para vendedoras de joyería
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold tracking-tighter leading-[1.05] text-[--lumin-text] mb-6">
                  Tu joyería,
                  <br />
                  <span className="text-[#7B4CFF]">organizada y vendiendo.</span>
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-[--lumin-muted] max-w-xl mx-auto lg:mx-0 mb-10">
                  Lumin reúne tu inventario, catálogo, tienda online y caja en un
                  solo lugar. Diseñada para que vendas más sin pelearte con
                  hojas de cálculo ni capturas manuales.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    to="/registro"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7B4CFF] px-7 py-4 text-sm font-bold text-[--lumin-text] shadow-lg shadow-[#7B4CFF]/25 transition-all hover:bg-[#6B3CEF] active:scale-[0.98]"
                  >
                    Hazte socia
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[--lumin-border] bg-[--lumin-surface] px-7 py-4 text-sm font-bold text-[--lumin-text] transition-all hover:border-[#7B4CFF]/40"
                  >
                    Ya soy socia · Iniciar sesión
                  </Link>
                </div>

                <p className="mt-6 text-xs text-[--lumin-muted]/70 text-center lg:text-left">
                  Sin permanencia. Cancela cuando quieras.
                </p>
              </div>

              {/* Captura hero — anima desde la derecha */}
              <div
                className="relative animate-in fade-in-0 slide-in-from-right-8 duration-1000 delay-200"
              >
                <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-[#7B4CFF]/20 to-transparent blur-3xl opacity-70" />
                <PhoneFrame src="https://cdn.qlatte.com/uploads/capturas/IMG_2173.png" alt="Vista principal de Lumin en celular" />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  TIRA DE BENEFICIOS RÁPIDOS                                        */}
        {/* ================================================================= */}
        <FadeIn>
          <section className="border-y border-[--lumin-border] bg-[--lumin-surface]">
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
                    <span className="text-xs sm:text-sm font-medium text-[--lumin-muted]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ================================================================= */}
        {/*  FEATURES PRINCIPALES                                              */}
        {/* ================================================================= */}
        <section id="funcionalidades" className="py-20 sm:py-28">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
            <FadeIn>
              <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
                <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                  Todo en uno
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
                  Construida para cómo vendes hoy.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-[--lumin-muted] leading-relaxed">
                  Cada función fue diseñada con vendedoras reales. Sin curva de
                  aprendizaje, sin manuales de 80 páginas.
                </p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {FEATURES.map((f, i) => (
                <FadeIn key={f.title} delay={i * 80} from="bottom">
                  <FeatureCard {...f} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  SHOWCASE ALTERNADO                                                */}
        {/* ================================================================= */}
        <section className="py-20 sm:py-28 bg-[--lumin-surface] border-y border-[--lumin-border]">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 space-y-32 sm:space-y-44">
            {SHOWCASE.map((item) => (
              <div
                key={item.title}
                className={`grid lg:grid-cols-2 gap-14 lg:gap-24 items-center ${
                  item.align === 'left' ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* Texto */}
                <FadeIn from={item.align === 'left' ? 'right' : 'left'}>
                  <div>
                    <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                      {item.eyebrow}
                    </span>
                    <h3 className="mt-3 text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-base text-[--lumin-muted] leading-relaxed">
                      {item.body}
                    </p>
                    <ul className="mt-8 space-y-3">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-[#7B4CFF] shrink-0 mt-0.5" />
                          <span className="text-sm text-[--lumin-text]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>

                {/* Captura */}
                <FadeIn from={item.align === 'left' ? 'left' : 'right'} delay={140}>
                  <div className="relative py-6">
                    <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#7B4CFF]/12 to-transparent blur-2xl opacity-60" />
                    <PhoneFrame src={item.image} alt={item.title} />
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/*  PRICING                                                           */}
        {/* ================================================================= */}
        <section id="precio" className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <FadeIn>
              <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                Precio honesto
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
                Una sola suscripción. Todo incluido.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-[--lumin-muted]">
                Sin niveles confusos. Sin upsells. Sin sorpresas en tu recibo.
              </p>
            </FadeIn>

            <FadeIn delay={120}>
              <div className="mt-12 rounded-3xl border border-[--lumin-border] bg-[--lumin-surface] p-8 sm:p-12 shadow-lg shadow-black/10 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 border-b border-[--lumin-border]">
                  <div>
                    <h3 className="text-2xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
                      Lumin · Acceso completo
                    </h3>
                    <p className="mt-2 text-sm text-[--lumin-muted]">
                      Cuenta de socia con todas las funciones, actualizaciones incluidas.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-baseline gap-2 sm:justify-end">
                      <span className="text-5xl font-headline font-extrabold tracking-tighter text-[--lumin-warn]">
                        $299.99
                      </span>
                      <span className="text-sm font-bold text-[--lumin-muted]">MXN / mes</span>
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
                      <span className="text-sm text-[--lumin-text]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Link
                    to="/registro"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B4CFF] px-7 py-4 text-sm font-bold text-[--lumin-text] shadow-lg shadow-[#7B4CFF]/25 transition-all hover:bg-[#6B3CEF] active:scale-[0.98]"
                  >
                    Comenzar ahora
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-4 text-center text-xs text-[--lumin-muted]/70">
                    Cancela cuando quieras desde tu perfil.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  CTA FINAL DUAL                                                    */}
        {/* ================================================================= */}
        <section className="pb-24">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
              <FadeIn delay={0}>
                <div className="rounded-3xl bg-[#7B4CFF] p-10 sm:p-12 text-[--lumin-text] shadow-xl shadow-[#7B4CFF]/20 h-full">
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
                    className="mt-8 group inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-[--lumin-text] transition-all hover:bg-white/20"
                  >
                    Hazte socia
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={100}>
                <div className="rounded-3xl border border-[--lumin-border] bg-[--lumin-surface] p-10 sm:p-12 h-full">
                  <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#7B4CFF]">
                    Ya eres socia
                  </span>
                  <h3 className="mt-3 text-3xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
                    Tu negocio te está esperando.
                  </h3>
                  <p className="mt-4 text-sm text-[--lumin-muted] leading-relaxed">
                    Entra a tu panel para revisar inventario, ventas y novedades
                    del catálogo maestro.
                  </p>
                  <Link
                    to="/login"
                    className="mt-8 group inline-flex items-center gap-2 rounded-xl border border-[--lumin-border] px-6 py-3.5 text-sm font-bold text-[--lumin-text] transition-all hover:border-[#7B4CFF]/60"
                  >
                    Iniciar sesión
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Landing;
