import { useEffect, useRef } from "react";
import { cursorKind, cursorMode, makeGoldCursors, PARTICLE_LIMIT } from "@/lib/gold-cursor";

type Particle = { x: number; y: number; vx: number; vy: number; size: number; age: number; duration: number; color: string; flake: boolean; rotation: number; phase: number };

/** One root-mounted decoration; the cursor itself remains a native image cursor. */
export function GoldCursor() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const tokens = getComputedStyle(root);
    const colors = ["--gold-soft", "--gold", "--accent", "--foreground"].map(key => tokens.getPropertyValue(key).trim());
    const [light = "gold", gold = "gold", bronze = "gold"] = colors;
    const cursors = makeGoldCursors(light, gold, bronze, tokens.getPropertyValue("--deep-brown").trim());
    let ready = false, disposed = false, raf = 0, previousTime = 0, idleTime = 0;
    let width = 0, height = 0;
    let point: { x: number; y: number } | null = null;
    const particles: Particle[] = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const clear = () => {
      cancelAnimationFrame(raf); raf = 0; previousTime = 0; idleTime = 0;
      particles.length = 0; ctx?.clearRect(0, 0, width, height);
    };
    const setShape = (target: Element | null) => {
      if (!ready || !fine.matches || !target) return;
      // Read the original semantic cursor synchronously, without painting a standard cursor.
      root.classList.remove("gold-cursor");
      const native = getComputedStyle(target).cursor;
      root.classList.add("gold-cursor");
      const interactive = Boolean(target.closest('a[href],button,summary,select,label,[role="button"],[role="link"],input:is([type="checkbox"],[type="radio"],[type="submit"],[type="button"] )'));
      const text = Boolean(target.closest('p,h1,h2,h3,h4,li,dt,dd,small,input,textarea,[contenteditable="true"],.eyebrow'));
      const disabled = Boolean(target.closest(':disabled,[aria-disabled="true"]'));
      const kind = cursorKind(native, interactive, text, disabled);
      root.style.setProperty("--active-gold-cursor", (cursors[kind] ?? cursors["default"])?.css ?? native);
    };
    const spawn = (x: number, y: number, stationary = false) => {
      if (particles.length >= PARTICLE_LIMIT) return;
      particles.push({ x: x + (Math.random() - .5) * 7, y: y + (Math.random() - .5) * 7,
        vx: (Math.random() - .5) * 9, vy: stationary ? 3 : 8 + Math.random() * 10,
        size: .6 + Math.random() * 1.6, age: 0, duration: stationary ? .75 : 1.2 + Math.random() * .8,
        color: colors[Math.floor(Math.random() * colors.length)] ?? gold, flake: Math.random() < .32,
        rotation: Math.random() * Math.PI, phase: Math.random() * Math.PI * 2 });
    };
    const star = (x: number, y: number, radius: number) => {
      if (!ctx) return;
      ctx.beginPath(); ctx.moveTo(x, y - radius); ctx.lineTo(x + radius * .25, y - radius * .25);
      ctx.lineTo(x + radius, y); ctx.lineTo(x + radius * .25, y + radius * .25);
      ctx.lineTo(x, y + radius); ctx.lineTo(x - radius * .25, y + radius * .25);
      ctx.lineTo(x - radius, y); ctx.lineTo(x - radius * .25, y - radius * .25); ctx.closePath(); ctx.fill();
    };
    const tick = (time: number) => {
      if (!ctx || !point || !cursorMode(fine.matches, reduced.matches).dust) { clear(); return; }
      const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
      previousTime = time; idleTime += dt;
      ctx.clearRect(0, 0, width, height);
      if (idleTime > .26) { idleTime = 0; spawn(point.x, point.y, true); }
      ctx.save();
      const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 10);
      glow.addColorStop(0, light); glow.addColorStop(1, "transparent");
      ctx.globalAlpha = .17; ctx.fillStyle = glow; ctx.fillRect(point.x - 10, point.y - 10, 20, 20);
      ctx.globalAlpha = .35 + Math.sin(time / 650) * .1; ctx.fillStyle = light;
      star(point.x + 5, point.y - 4, 2.1); star(point.x - 4, point.y + 5, 1.4);
      ctx.restore();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; if (!p) continue;
        p.age += dt; if (p.age >= p.duration) { particles.splice(i, 1); continue; }
        p.vy += dt * 5; p.x += (p.vx + Math.sin(p.age * 3 + p.phase) * 4) * dt; p.y += p.vy * dt; p.rotation += dt * .6;
        const fraction = p.age / p.duration;
        ctx.save(); ctx.globalAlpha = Math.min(p.age / .12, 1) * (1 - fraction) * (.65 + .15 * Math.sin(p.age * 7 + p.phase));
        ctx.fillStyle = p.color; ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        if (p.flake) { ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * .7, 0); ctx.lineTo(0, p.size * .8); ctx.lineTo(-p.size * .5, .3); ctx.closePath(); ctx.fill(); }
        else { star(0, 0, p.size); }
        ctx.restore();
      }
      canvas.dataset["particles"] = String(particles.length);
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && point && ready && ctx && cursorMode(fine.matches, reduced.matches).dust) raf = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches) return;
      setShape(event.target instanceof Element ? event.target : null);
      const next = { x: event.clientX, y: event.clientY };
      if (ready && ctx && !reduced.matches && point) {
        const distance = Math.hypot(next.x - point.x, next.y - point.y);
        const count = Math.min(18, Math.floor(distance / 3));
        for (let i = 0; i < count; i++) { const t = (i + 1) / count; spawn(point.x + (next.x - point.x) * t, point.y + (next.y - point.y) * t); }
      }
      point = next; start();
    };
    const over = (event: PointerEvent) => { if (event.pointerType === "mouse") setShape(event.target instanceof Element ? event.target : null); };
    const leave = () => { point = null; clear(); canvas.dataset["particles"] = "0"; };
    const refresh = () => {
      if (ready && fine.matches) { root.classList.add("gold-cursor"); if (point) setShape(document.elementFromPoint(point.x, point.y)); }
      else root.classList.remove("gold-cursor");
      if (!cursorMode(fine.matches, reduced.matches).dust) clear(); else start();
    };
    const scroll = () => { if (point) setShape(document.elementFromPoint(point.x, point.y)); };
    const visibility = () => { if (document.hidden) leave(); };
    resize();
    root.style.setProperty("--active-gold-cursor", cursors["default"]?.css ?? "auto");
    // Decode every shape before activating; errors leave the standard system cursor intact.
    Promise.all(Object.values(cursors).map(cursor => new Promise<void>((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(); image.onerror = () => reject(); image.src = cursor.url;
    }))).then(() => { if (!disposed) { ready = true; refresh(); } }).catch(() => { ready = false; root.classList.remove("gold-cursor"); clear(); });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", scroll, { passive: true, capture: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("visibilitychange", visibility);
    fine.addEventListener("change", refresh); reduced.addEventListener("change", refresh);
    return () => {
      disposed = true; clear(); root.classList.remove("gold-cursor", "gold-cursor-out"); root.style.removeProperty("--active-gold-cursor");
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over);
      window.removeEventListener("resize", resize); window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", scroll, true); document.removeEventListener("mouseleave", leave);
      document.removeEventListener("visibilitychange", visibility); fine.removeEventListener("change", refresh); reduced.removeEventListener("change", refresh);
    };
  }, []);
  return <canvas ref={ref} className="gold-dust" aria-hidden="true" />;
}
