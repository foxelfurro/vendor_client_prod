import { MessageCircle } from 'lucide-react';
import { readableTextOn } from '@/lib/personalization';

interface WhatsAppCTAProps {
  phone: string;
  productName: string;
  /** Color de acento opcional para personalizar el botón. */
  accentColor?: string;
}

export function WhatsAppCTA({ phone, productName, accentColor }: WhatsAppCTAProps) {
  // Limpiamos el teléfono (por si el usuario puso espacios o guiones en su perfil)
  const cleanPhone = phone;

  // Mensaje predeterminado codificado para URL
  const message = `Hola! Me interesa el producto *${productName}* que vi en tu catálogo de Lumin.`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  // Si hay color de acento, se usa como fondo; si no, se mantiene el look original.
  const accentStyle = accentColor
    ? { backgroundColor: accentColor, color: readableTextOn(accentColor) }
    : undefined;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={accentStyle}
      className={`flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-medium transition-all rounded-xl active:scale-[0.98] shadow-sm hover:shadow ${
        accentColor ? 'text-white hover:opacity-90' : 'text-white bg-zinc-900 hover:bg-zinc-800'
      }`}
    >
      <MessageCircle className="w-4 h-4" />
      Preguntar por WhatsApp
    </a>
  );
}
