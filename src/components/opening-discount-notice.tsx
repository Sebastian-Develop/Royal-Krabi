import { Link } from "@tanstack/react-router";
import { openingEvent } from "@/lib/opening-event";

/** Compact opening-discount announcement; full conditions stay in AGB and checkout. */
export function OpeningDiscountNotice({ className = "opening-offer" }: { className?: string }) {
  const o = openingEvent.offer;
  return <section className={className} aria-labelledby="offer-title">
    <h2 id="offer-title">{o.heading}</h2>
    <p className="opening-offer-text">Feiern Sie mit uns die Neueröffnung!</p>
    <p className="opening-offer-text">Vom 07.11. bis 21.11.2026 erhalten Sie mit dem Code <strong className="opening-code">{o.code}</strong> 20 % Rabatt auf Massagen und Massagegutscheine ab 60 Minuten sowie auf 5er- und 10er-Royalpässe ab 60 Minuten je Massage.</p>
    <p className="opening-small">Ausgenommen sind Wertgutscheine mit Wunschbetrag. Es gelten unsere <Link to="/agb">AGB</Link>.</p>
  </section>;
}
