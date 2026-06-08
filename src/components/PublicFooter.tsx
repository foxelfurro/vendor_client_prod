import { Link } from 'react-router-dom';

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full py-10 px-8 border-t border-white/40 backdrop-blur-md"
      style={{ background: 'rgba(255, 192, 200, 0.35)' }}
      aria-label="Pie de página"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <nav className="flex items-center gap-6" aria-label="Links legales">
          <Link
            to="/privacy"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-[#862fff]/60 hover:text-[#862fff] transition-colors"
          >
            Privacidad
          </Link>
          <Link
            to="/terms"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-[#862fff]/60 hover:text-[#862fff] transition-colors"
          >
            Términos
          </Link>
          <Link
            to="/support"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-[#862fff]/60 hover:text-[#862fff] transition-colors"
          >
            Soporte
          </Link>
        </nav>
        <p className="text-[0.65rem] uppercase font-medium tracking-widest text-[#1a0a2e]/40">
          &copy; {year} Qlatte Lumin
        </p>
      </div>
    </footer>
  );
}
