/**
 * @file QrScanner.tsx
 * @description Escáner de códigos QR a pantalla completa, construido con jsQR.
 *
 * Abre la cámara trasera del dispositivo, captura fotogramas en un canvas
 * oculto y los decodifica con jsQR dentro de un bucle de requestAnimationFrame.
 * Al detectar un código llama a `onScan` una sola vez y libera la cámara.
 *
 * Uso (el padre lo monta/desmonta de forma condicional):
 *
 *   {abierto && (
 *     <QrScanner
 *       onScan={(texto) => { ... }}
 *       onClose={() => setAbierto(false)}
 *     />
 *   )}
 *
 * El componente se encarga de iniciar y detener la cámara según su ciclo de
 * vida; el padre solo decide cuándo mostrarlo.
 */

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface QrScannerProps {
  /** Se invoca una sola vez con el texto decodificado del QR. */
  onScan: (texto: string) => void;
  /** Se invoca cuando la persona cierra el escáner sin escanear. */
  onClose: () => void;
  /** Título mostrado en la cabecera. */
  title?: string;
  /** Texto de ayuda mostrado bajo el título. */
  subtitle?: string;
}

type Estado = 'iniciando' | 'escaneando' | 'error';

const QrScanner = ({
  onScan,
  onClose,
  title = 'Escanear código QR',
  subtitle = 'Apunta la cámara a la etiqueta de la joya.',
}: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const escaneadoRef = useRef(false);

  // Los callbacks se guardan en refs para que el efecto de arranque/limpieza
  // de la cámara corra UNA sola vez, sin reiniciarse aunque el padre pase
  // funciones nuevas en cada render.
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  });

  const [estado, setEstado] = useState<Estado>('iniciando');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Ciclo de vida de la cámara ─────────────────────────────────────────────
  useEffect(() => {
    let activo = true;
    let ultimoIntento = 0;

    const detener = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    const tick = () => {
      if (!activo || escaneadoRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      // readyState >= 2 (HAVE_CURRENT_DATA): ya hay un fotograma utilizable.
      const ahora = performance.now();

      if (
        video &&
        canvas &&
        video.readyState >= 2 &&
        ahora - ultimoIntento >= 120 // ~8 lecturas por segundo: suficiente y ligero
      ) {
        ultimoIntento = ahora;
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w > 0 && h > 0) {
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const imagen = ctx.getImageData(0, 0, w, h);
            const codigo = jsQR(imagen.data, w, h, { inversionAttempts: 'dontInvert' });
            if (codigo && codigo.data) {
              escaneadoRef.current = true;
              detener();
              onScanRef.current(codigo.data.trim());
              return;
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const iniciar = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (activo) {
          setEstado('error');
          setErrorMsg('Este navegador no permite el acceso a la cámara. Usa un navegador actualizado y una conexión segura (https).');
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        // Si el componente se desmontó mientras se pedía el permiso, se libera.
        if (!activo) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          detener();
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (!activo) {
          detener();
          return;
        }
        setEstado('escaneando');
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (!activo) return;
        setEstado('error');
        const nombre = (err as { name?: string })?.name;
        if (nombre === 'NotAllowedError' || nombre === 'SecurityError') {
          setErrorMsg('Permiso de cámara denegado. Habilítalo en los ajustes de tu navegador e inténtalo de nuevo.');
        } else if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError') {
          setErrorMsg('No se encontró una cámara disponible en este dispositivo.');
        } else if (nombre === 'NotReadableError') {
          setErrorMsg('La cámara está ocupada por otra aplicación. Ciérrala e inténtalo de nuevo.');
        } else {
          setErrorMsg('No pudimos abrir la cámara. Inténtalo de nuevo.');
        }
      }
    };

    iniciar();

    return () => {
      activo = false;
      detener();
    };
  }, []);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <style>{`
        @keyframes qr-scan-line {
          0%   { top: 6%; }
          50%  { top: 90%; }
          100% { top: 6%; }
        }
      `}</style>

      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-white">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight truncate">{title}</h2>
          <p className="text-xs text-white/60 truncate">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar escáner"
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Área de cámara */}
      <div className="flex-1 flex items-center justify-center px-5 pb-6 min-h-0">
        {estado === 'error' ? (
          <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No se pudo abrir la cámara</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{errorMsg}</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-black ring-1 ring-white/10">
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Capa de carga */}
            {estado === 'iniciando' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Iniciando cámara…</p>
              </div>
            )}

            {/* Retícula de escaneo */}
            {estado === 'escaneando' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-[72%] aspect-square rounded-2xl [box-shadow:0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <span className="absolute -top-1 -left-1 w-9 h-9 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                  <span className="absolute -top-1 -right-1 w-9 h-9 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                  <span className="absolute -bottom-1 -left-1 w-9 h-9 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                  <span className="absolute -bottom-1 -right-1 w-9 h-9 border-b-4 border-r-4 border-white rounded-br-2xl" />
                  <span
                    className="absolute left-3 right-3 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]"
                    style={{ animation: 'qr-scan-line 2.4s ease-in-out infinite' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ayuda inferior */}
      {estado === 'escaneando' && (
        <div className="pb-8 px-5 text-center">
          <p className="text-xs text-white/60">Centra el código QR dentro del recuadro.</p>
        </div>
      )}

      {/* Canvas oculto para capturar fotogramas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default QrScanner;
