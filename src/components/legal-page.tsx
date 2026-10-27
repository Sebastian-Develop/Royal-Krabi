import type { ReactNode } from "react";
import { Notice, PageHero } from "./site";

export type LegalSection = { title: string; body: ReactNode };
export function LegalPage({ title, notice, sections }: { title: string; notice?: ReactNode; sections: LegalSection[] }) {
  return <><PageHero title={title}/><main className="container legal-content">{notice && <Notice>{notice}</Notice>}{sections.map((s) => <section key={s.title}><h2>{s.title}</h2>{s.body}</section>)}</main></>;
}
