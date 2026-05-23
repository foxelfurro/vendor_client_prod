// src/lib/image.ts
// -----------------------------------------------------------------------------
// Utilidad para redimensionar y comprimir imágenes en el navegador antes de
// guardarlas. Las imágenes de personalización se almacenan como data URL, así
// que conviene reducir su peso para no inflar la base de datos ni las
// respuestas de la API.
// -----------------------------------------------------------------------------

export interface ResizeOptions {
  /** Ancho máximo en píxeles. */
  maxWidth: number;
  /** Alto máximo en píxeles. */
  maxHeight: number;
  /** Formato de salida. PNG conserva transparencia (ideal para logos). */
  format?: 'image/jpeg' | 'image/png';
  /** Calidad de compresión (solo JPEG), de 0 a 1. */
  quality?: number;
}

/**
 * Lee un archivo de imagen, lo redimensiona manteniendo su proporción dentro de
 * los límites indicados y lo devuelve como data URL comprimida.
 */
export function resizeImageToDataUrl(file: File, options: ResizeOptions): Promise<string> {
  const { maxWidth, maxHeight, format = 'image/jpeg', quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
      img.onload = () => {
        let { width, height } = img;

        // Escalar proporcionalmente para encajar en la caja máxima.
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Tu navegador no permite procesar imágenes.'));
          return;
        }

        // Para JPEG (sin canal alfa) pintamos fondo blanco para evitar negros.
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);

        try {
          resolve(canvas.toDataURL(format, quality));
        } catch {
          reject(new Error('No se pudo convertir la imagen.'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Tamaño aproximado en KB de una data URL. */
export function dataUrlSizeKb(dataUrl: string): number {
  if (!dataUrl) return 0;
  const commaIndex = dataUrl.indexOf(',');
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return Math.round((base64.length * 3) / 4 / 1024);
}
