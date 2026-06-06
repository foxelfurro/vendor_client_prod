import { Link } from 'react-router-dom';

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full py-10 px-8 border-t border-gray-200 dark:border-[--lumin-border] bg-gray-50 dark:bg-[--lumin-surface]"
      aria-label="Pie de página"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <nav className="flex items-center gap-6" aria-label="Links legales">
          <Link
            to="/privacy"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-gray-400 dark:text-[--lumin-muted]/60 hover:text-gray-700 dark:hover:text-[--lumin-text] transition-colors"
          >
            Privacidad
          </Link>
          <Link
            to="/terms"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-gray-400 dark:text-[--lumin-muted]/60 hover:text-gray-700 dark:hover:text-[--lumin-text] transition-colors"
          >
            Términos
          </Link>
          <Link
            to="/support"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-gray-400 dark:text-[--lumin-muted]/60 hover:text-gray-700 dark:hover:text-[--lumin-text] transition-colors"
          >
            Soporte
          </Link>
        </nav>
        <p className="text-[0.65rem] uppercase font-medium tracking-widest text-gray-300 dark:text-[--lumin-muted]/40">
          &copy; {year} Qlatte Lumin
        </p>
      </div>
    </footer>
  );
}
