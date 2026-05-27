import api from '@/lib/api';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Sube un archivo de imagen a Cloudflare R2 en dos pasos:
 * 1. Obtiene una URL prefirmada del servidor.
 * 2. Sube el archivo directamente a R2.
 *
 * @returns La URL pública permanente del archivo subido.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Solo se permiten imágenes JPEG, PNG o WebP.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }

  // Paso 1: obtener URL prefirmada
  const { data } = await api.post<{ uploadUrl: string; publicUrl: string }>(
    '/uploads/presigned-url',
    { contentType: file.type, size: file.size }
  );

  // Paso 2: subir el archivo directamente a R2 (fuera del api instance para no añadir headers de auth)
  const upload = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!upload.ok) {
    throw new Error('Error al subir el archivo a almacenamiento.');
  }

  return data.publicUrl;
}
