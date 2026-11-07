import { useEffect, useState } from "react";
import { X, Download, Share2 } from "lucide-react";
import flyerImage from "@/assets/royal-krabi-flyer.jpg";
import { whatsappShareHref } from "@/lib/opening-event";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export function FlyerModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="flyer-backdrop" role="dialog" aria-modal="true" aria-label="Flyer zur Neueröffnung" onClick={onClose}>
    <div className="flyer-modal" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="flyer-close" onClick={onClose} aria-label="Flyer schließen" autoFocus><X size={18}/></button>
      <img src={flyerImage} alt="Flyer: Neueröffnung und Tag der offenen Tür von Royal Krabi Serenity Thaimassage am 07.11.2026 mit 20 % Eröffnungsrabatt"/>
      <div className="opening-actions">
        <a href={whatsappShareHref} {...ext} className="btn btn-gold"><Share2 size={17}/> Per WhatsApp einladen</a>
        <a href="/api/public/flyer-image" download="Royal-Krabi-Flyer-Neueroeffnung.jpg" className="btn btn-outline"><Download size={17}/> Flyer herunterladen</a>
      </div>
    </div>
  </div>;
}

/** Opens the opening flyer automatically once per browser session. */
export function FlyerAutoPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("rk-flyer-seen")) return;
    sessionStorage.setItem("rk-flyer-seen", "1");
    setOpen(true);
  }, []);
  return open ? <FlyerModal onClose={() => setOpen(false)}/> : null;
}
