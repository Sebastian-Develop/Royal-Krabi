import { createFileRoute, redirect } from "@tanstack/react-router";
// Online-Buchung ist deaktiviert – Termine nur telefonisch oder per E-Mail.
export const Route=createFileRoute("/buchung-bestaetigt")({beforeLoad:()=>{throw redirect({to:"/termine"})}});
