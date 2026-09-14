import type { QRCodeErrorCorrectionLevel, QRCodeToDataURLOptions } from "qrcode";

export type QrOptions = {
  size: number;
  margin: number;
  errorCorrectionLevel: QRCodeErrorCorrectionLevel;
  darkColor: string;
  lightColor: string;
};

export async function generateQrDataUrl(
  text: string,
  options: QrOptions,
): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  const renderOptions: QRCodeToDataURLOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.darkColor,
      light: options.lightColor,
    },
  };

  return QRCode.toDataURL(text, renderOptions);
}

export function looksLikeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return /^www\./i.test(trimmed);
  }
}
