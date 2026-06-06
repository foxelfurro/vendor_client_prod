export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full mt-16 py-8 px-6 border-t border-gray-200 dark:border-[--lumin-border] bg-gray-50 dark:bg-[--lumin-surface]"
      aria-label="Pie de página"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
        <p className="text-xs tracking-widest uppercase font-medium text-gray-400 dark:text-[--lumin-muted]/50">
          Lumin by Qlatte &copy; {year}
        </p>
        <p className="text-xs text-gray-300 dark:text-[--lumin-muted]/30 tracking-wide">
          Plataforma de gestión de catálogos
        </p>
      </div>
    </footer>
  );
}
