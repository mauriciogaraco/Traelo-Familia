import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { SITE_URL } from "../../lib/config";
import logoUrl from "../../assets/logo.webp";
//import dlmLogo from '../../assets/images/business/DLM.jpg'
//import macusLogo from '../../assets/images/business/macus.jpg'

const SITE_LABEL = SITE_URL.replace(/^https?:\/\//, "");
const SHARE_URL = `https://wa.me/?text=${encodeURIComponent(
  `¡Pide en Tráelo y recíbelo en casa! 🛵\n${SITE_URL}`,
)}`;

/** Sección compacta "Compartir" que abre un modal con el QR de la web. */
export function ShareSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-gradient-warm border border-border rounded-3xl p-4 active:scale-[0.99] transition-transform"
      >
        <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path strokeLinecap="round" d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
          </svg>
        </span>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-bold text-text-primary">Comparte Tráelo</p>
          <p className="text-xs text-text-secondary">
            Muestra el QR o envíalo a tus amigos
          </p>
        </div>
        <svg
          className="text-text-secondary flex-shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {open && <ShareModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ShareModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-fade-in"
      />

      <div className="relative w-full max-w-[360px] bg-surface rounded-4xl shadow-2xl p-5 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-text-secondary"
          aria-label="Cerrar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-text-primary text-center">
          Comparte Tráelo
        </h2>
        <p className="text-sm text-text-secondary text-center mt-0.5">
          Tráelo a tu casa 🛵
        </p>

        {/* Tarjeta del QR con logos de negocios en las esquinas */}
        <div className="relative mx-auto mt-4 w-fit">
          <div className="bg-white rounded-3xl p-4 shadow-card border border-border">
            <QRCodeCanvas
              value={SITE_URL}
              size={208}
              level="H"
              marginSize={1}
              imageSettings={{
                src: logoUrl,
                height: 46,
                width: 46,
                excavate: true,
              }}
            />
          </div>
          {/* logos de negocios — en las esquinas, fuera de los módulos del QR */}
          {/*  <img src={dlmLogo} alt="DLM" className="absolute -top-3 -left-3 w-11 h-11 rounded-full 
          object-cover ring-2 ring-white shadow-card" /> */}
          {/*<img src={macusLogo} alt="Los Macus" className="absolute -top-3 -right-3 w-11 h-11 rounded-full
           object-cover ring-2 ring-white shadow-card" /> */}
        </div>

        <p className="text-center text-sm font-bold text-primary mt-4">
          {SITE_LABEL}
        </p>
        <p className="text-center text-xs text-text-secondary">
          Escanea el código para abrir la web
        </p>

        <a
          href={SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white font-bold active:scale-[0.98] transition-transform"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Zm0 18.3a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3Z" />
          </svg>
          Compartir por WhatsApp
        </a>
      </div>
    </div>
  );
}
