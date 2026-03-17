import { useEffect, useState } from "react";

/**
 * Toast de notificación flotante.
 * @param {{ message: string, type: "ok"|"error", onClose: () => void }} props
 */
export default function Toast({ message, type = "ok", onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // esperar fade-out antes de limpiar
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type} ${visible ? "toast-in" : "toast-out"}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>✕</button>
    </div>
  );
}
