import { MessageCircle } from 'lucide-react';

interface WhatsAppCTAProps {
  phone: string;
  productName: string;
}

export function WhatsAppCTA({ phone, productName }: WhatsAppCTAProps) {
  // Limpiamos el teléfono (por si el usuario puso espacios o guiones en su perfil)
  const cleanPhone = phone;
  
  // Mensaje predeterminado codificado para URL
  const message = `Hola! Me interesa el producto *${productName}* que vi en tu catálogo de Lumin.`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-medium text-white transition-all bg-zinc-900 rounded-xl hover:bg-zinc-800 active:scale-[0.98] shadow-sm hover:shadow"
    >
      <MessageCircle className="w-4 h-4" />
      Preguntar por WhatsApp
    </a>
  );
}
