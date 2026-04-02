import { Link } from 'react-router-dom';
import { Store, UserCircle2, Gem, ArrowRight } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Efecto de fondo sutil */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-stitch/5 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-stitch/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full space-y-12 text-center z-10">
        
        {/* Logo y Título */}
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary-stitch shadow-[0_8px_32px_rgba(45,52,53,0.06)]">
            <Gem size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Vendor Hub</h1>
            <p className="text-xs tracking-[0.25em] uppercase font-bold text-on-surface-variant mt-3">
              Atelier Digital
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-body-md text-on-surface-variant mb-6 font-medium">
            Por favor, selecciona una opción para continuar
          </p>

          {/* Opción 1: Soy Vendedor -> Va al Login */}
          <Link
            to="/login"
            className="group flex items-center justify-between w-full p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary-stitch/40 shadow-sm hover:shadow-[0_12px_40px_rgba(45,52,53,0.06)] transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div className="p-3.5 rounded-xl bg-surface-container text-on-surface group-hover:text-primary-stitch group-hover:bg-primary-stitch/10 transition-colors">
                <UserCircle2 size={24} strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-on-surface text-lg">Soy Vendedor</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Acceder a mi panel de control</p>
              </div>
            </div>
            <div className="text-outline-variant group-hover:text-primary-stitch transition-colors group-hover:translate-x-1 duration-300">
              <ArrowRight size={20} />
            </div>
          </Link>

          {/* Opción 2: Adquirir Plataforma -> Va al Checkout de Conekta */}
          <Link
            to="/checkout"
            className="group flex items-center justify-between w-full p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary-stitch/40 shadow-sm hover:shadow-[0_12px_40px_rgba(45,52,53,0.06)] transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div className="p-3.5 rounded-xl bg-surface-container text-on-surface group-hover:text-primary-stitch group-hover:bg-primary-stitch/10 transition-colors">
                <Store size={24} strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-on-surface text-lg">Adquirir Vendor Hub</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Pagar suscripción y crear cuenta</p>
              </div>
            </div>
            <div className="text-outline-variant group-hover:text-primary-stitch transition-colors group-hover:translate-x-1 duration-300">
              <ArrowRight size={20} />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Welcome;