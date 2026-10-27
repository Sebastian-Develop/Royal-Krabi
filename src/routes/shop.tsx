import { createFileRoute, redirect } from "@tanstack/react-router";
// Online-Shop und Online-Zahlung sind deaktiviert – Gutscheine nur nach Absprache.
export const Route=createFileRoute("/shop")({beforeLoad:()=>{throw redirect({to:"/gutscheine"})}});
