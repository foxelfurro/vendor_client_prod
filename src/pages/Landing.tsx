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
      className="absolute left-0 -translate-x-full"
      style={{
        top: '11%', height: '5%', width: '4px',
        borderRadius: '2px 0 0 2px',
        background: 'linear-gradient(to right, #2a2a2c, #4a4a4c)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
      }}
    />
    {/* Subir volumen */}
    <div
      className="absolute left-0 -translate-x-full"
      style={{
        top: '20%', height: '9%', width: '4px',
        borderRadius: '2px 0 0 2px',
        background: 'linear-gradient(to right, #2a2a2c, #4a4a4c)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
      }}
    />
    {/* Bajar volumen */}
    <div
      className="absolute left-0 -translate-x-full"
      style={{
        top: '31%', height: '9%', width: '4px',
        borderRadius: '2px 0 0 2px',
        background: 'linear-gradient(to right, #2a2a2c, #4a4a4c)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
      }}
    />
    {/* Botón encendido */}
    <div
      className="absolute right-0 translate-x-full"
      style={{
        top: '22%', height: '13%', width: '4px',
        borderRadius: '0 2px 2px 0',
        background: 'linear-gradient(to left, #2a2a2c, #4a4a4c)',
        boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
      }}
    />

    {/* Marco exterior — titanio */}
    <div
      className="relative"
      style={{
        aspectRatio: '9 / 19.5',
        borderRadius: '44px',
        padding: '2.5px',
        background: 'linear-gradient(160deg, #8e8e90 0%, #3a3a3c 25%, #6e6e70 50%, #2c2c2e 80%, #4a4a4c 100%)',
        boxShadow:
          '0 0 0 0.5px rgba(255,255,255,0.12),' +
          'inset 0 1px 0 rgba(255,255,255,0.2),' +
          'inset 0 -1px 0 rgba(0,0,0,0.5),' +
          '0 40px 80px -10px rgba(0,0,0,0.7),' +
          '0 10px 30px -5px rgba(0,0,0,0.4)',
      }}
    >
      {/* Pantalla */}
      <div
        className="relative h-full w-full overflow-hidden bg-black"
        style={{ borderRadius: '41.5px' }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute z-30"
          style={{
            top: '9px', left: '50%', transform: 'translateX(-50%)',
            width: '88px', height: '26px',
            background: '#000', borderRadius: '50px',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03)',
          }}
        />

        {/* Contenido de pantalla */}
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
        ) : (
          // Placeholder vacío con fondo negro
          <div className="h-full w-full bg-black" />
        )}

        {/* Indicador home */}
        <div
          className="absolute z-20"
          style={{
            bottom: '7px', left: '50%', transform: 'translateX(-50%)',
            width: '90px', height: '3.5px',
            background: 'rgba(255,255,255,0.25)', borderRadius: '2px',
          }}
        />

        {/* Reflejo del cristal */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 40%, transparent 60%)',
            borderRadius: '41.5px',
          }}
        />
      </div>

      {/* Borde interior del marco */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '44px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}
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
  <div className="group rounded-2xl border border-white/50 bg-white/40 backdrop-blur-sm p-6 sm:p-7 transition-all duration-300 hover:border-white/80 hover:bg-white/60 hover:shadow-[0_20px_40px_-15px_rgba(134,47,255,0.2)]">
    <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[#862fff]/10 p-3 text-[#862fff] transition-transform duration-300 group-hover:-translate-y-0.5">
      <Icon size={20} strokeWidth={2} />
    </div>
    <h3 className="mb-2 text-lg font-headline font-bold tracking-tight text-[#1a0a2e]">
      {title}
    </h3>
    <p className="text-sm leading-relaxed text-[#7c4cbf]">{body}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Página                                                                     */
/* -------------------------------------------------------------------------- */

const Landing = () => {
  return (
    <div
      className="font-body text-[#1a0a2e] antialiased min-h-dvh flex flex-col"
      style={{ background: 'linear-gradient(160deg, #c59bff 0%, #d4aaff 25%, #e8c4ff 50%, #ffb8c8 75%, #ff9fab 100%)' }}
    >
      <PublicNav />

      <main className="flex-grow">
        {/* ================================================================= */}
        {/*  HERO                                                              */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden mb-0">

          <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 pt-14 sm:pt-22 pb-18 sm:pb-26">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Copy — anima al montar */}
              <div
                className="text-center lg:text-left animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ff9fab]/60 bg-[#ff9fab]/30 px-3 py-1.5 mb-6">
                  <Sparkles size={12} className="text-[#862fff]" />
                  <span className="text-[0.65rem] uppercase font-bold tracking-[0.2em] text-[#1a0a2e]">
                    Plataforma para vendedoras de joyería
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold tracking-tighter leading-[1.05] text-[#1a0a2e] mb-6">
                  Tu joyería,
                  <br />
                  <span className="text-[#862fff]">organizada y vendiendo.</span>
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-[#3b1870] max-w-xl mx-auto lg:mx-0 mb-10">
                  Lumin reúne tu inventario, catálogo, tienda online y caja en un
                  solo lugar. Diseñada para que vendas más sin pelearte con
                  hojas de cálculo ni capturas manuales.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    to="/registro"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#862fff] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#862fff]/30 transition-all hover:bg-[#7B2EE8] active:scale-[0.98]"
                  >
                    Hazte socia
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#ff9fab] bg-[#ffc0c8]/30 px-7 py-4 text-sm font-bold text-[#1a0a2e] transition-all hover:bg-[#ffc0c8]/50"
                  >
                    Ya soy socia · Iniciar sesión
                  </Link>
                </div>

                <p className="mt-6 text-xs text-[#862fff]/80 text-center lg:text-left">
                  Sin permanencia. Cancela cuando quieras.
                </p>
              </div>

              {/* Captura hero — anima desde la derecha */}
              <div
                className="relative animate-in fade-in-0 slide-in-from-right-8 duration-1000 delay-200"
              >
                <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-[#862fff]/30 to-[#ff9fab]/20 blur-3xl opacity-60" />
                <PhoneFrame src="https://cdn.qlatte.com/uploads/capturas/IMG_2173.png" alt="Vista principal de Lumin en celular" />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/*  TIRA DE BENEFICIOS RÁPIDOS                                        */}
        {/* ================================================================= */}
        <FadeIn>
          <section className="border-y border-white/50 bg-white/40 backdrop-blur-sm">
            <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 py-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[
                  { icon: ShieldCheck, label: 'Pagos seguros con Stripe' },
                  { icon: Smartphone, label: 'Diseñada mobile-first' },
                  { icon: Tag, label: 'Sin costo de configuración' },
                  { icon: CheckCircle2, label: 'Soporte humano en español' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 justify-center lg:justify-start">
                    <Icon size={18} className="text-[#862fff] shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-[#7c4cbf]">{label}</span>
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
                <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#862fff]">
                  Todo en uno
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-[#1a0a2e]">
                  Construida para cómo vendes hoy.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-[#7c4cbf] leading-relaxed">
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
        <section className="py-20 sm:py-28 bg-white/40 backdrop-blur-sm border-y border-white/50">
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
                    <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#862fff]">
                      {item.eyebrow}
                    </span>
                    <h3 className="mt-3 text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-[#1a0a2e]">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-base text-[#7c4cbf] leading-relaxed">
                      {item.body}
                    </p>
                    <ul className="mt-8 space-y-3">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-[#862fff] shrink-0 mt-0.5" />
                          <span className="text-sm text-[#1a0a2e]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>

                {/* Captura */}
                <FadeIn from={item.align === 'left' ? 'left' : 'right'} delay={140}>
                  <div className="relative py-6">
                    <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#862fff]/12 to-transparent blur-2xl opacity-60" />
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
              <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#862fff]">
                Precio honesto
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-[#1a0a2e]">
                Una sola suscripción. Todo incluido.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-[#7c4cbf]">
                Sin niveles confusos. Sin upsells. Sin sorpresas en tu recibo.
              </p>
            </FadeIn>

            <FadeIn delay={120}>
              <div className="mt-12 rounded-3xl border border-white/60 bg-white/50 backdrop-blur-md p-8 sm:p-12 shadow-lg shadow-[#862fff]/10 text-left">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 border-b border-white/50">
                  <div>
                    <h3 className="text-2xl font-headline font-extrabold tracking-tight text-[#1a0a2e]">
                      Lumin · Acceso completo
                    </h3>
                    <p className="mt-2 text-sm text-[#7c4cbf]">
                      Cuenta de socia con todas las funciones, actualizaciones incluidas.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-baseline gap-2 sm:justify-end">
                      <span className="text-5xl font-headline font-extrabold tracking-tighter text-[#862fff]">
                        $299.99
                      </span>
                      <span className="text-sm font-bold text-[#7c4cbf]">MXN / mes</span>
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
                      <CheckCircle2 size={18} className="text-[#862fff] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1a0a2e]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Link
                    to="/registro"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#862fff] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#862fff]/25 transition-all hover:bg-[#7B2EE8] active:scale-[0.98]"
                  >
                    Comenzar ahora
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-4 text-center text-xs text-[#7c4cbf]/70">
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
                <div className="rounded-3xl bg-[#862fff] p-10 sm:p-12 text-white shadow-xl shadow-[#862fff]/20 h-full">
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
                    className="mt-8 group inline-flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/30"
                  >
                    Hazte socia
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={100}>
                <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-md p-10 sm:p-12 h-full">
                  <span className="text-[0.65rem] uppercase font-bold tracking-[0.25em] text-[#862fff]">
                    Ya eres socia
                  </span>
                  <h3 className="mt-3 text-3xl font-headline font-extrabold tracking-tight text-[#1a0a2e]">
                    Tu negocio te está esperando.
                  </h3>
                  <p className="mt-4 text-sm text-[#7c4cbf] leading-relaxed">
                    Entra a tu panel para revisar inventario, ventas y novedades
                    del catálogo maestro.
                  </p>
                  <Link
                    to="/login"
                    className="mt-8 group inline-flex items-center gap-2 rounded-xl border border-white/50 px-6 py-3.5 text-sm font-bold text-[#1a0a2e] transition-all hover:border-[#862fff]/60"
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
