import { z } from "zod";

export const withdrawalHandlingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "processed"]),
  notes: z.string().max(10000),
});

export function requireOperatorRole(isAdmin: boolean) {
  if (!isAdmin) throw new Error("Kein Zugriff auf die Widerrufsverwaltung.");
}