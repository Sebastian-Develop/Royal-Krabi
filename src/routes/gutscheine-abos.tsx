import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/gutscheine-abos")({ beforeLoad: () => { throw redirect({ to: "/gutscheine", statusCode: 301 }); } });
