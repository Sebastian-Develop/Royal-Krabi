import { createServerFn } from "@tanstack/react-start";
import { WEBSITE_LEGAL_VERSION } from "./legal-texts";

/** Public, read-only: returns the current withdrawal notice + sample form as PDF (base64). */
export const getWithdrawalPdf = createServerFn({ method: "GET" }).handler(async () => {
  const { buildWithdrawalPdf } = await import("./order-pdf.server");
  const pdf = await buildWithdrawalPdf(WEBSITE_LEGAL_VERSION);
  let bin = ""; pdf.bytes.forEach(b => { bin += String.fromCharCode(b); });
  return { filename: pdf.filename, base64: btoa(bin) };
});
