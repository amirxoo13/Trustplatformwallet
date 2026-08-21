import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function AddressQr({ value, size = 220 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#07080a", light: "#f4f6f8" },
    }).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return <div className="rounded-lg bg-foreground" style={{ width: size, height: size }} />;
  }

  return <img src={src} alt="Receive QR" width={size} height={size} className="rounded-lg" />;
}
