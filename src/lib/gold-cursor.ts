export const PARTICLE_LIMIT = 168;
/** Shapes are authored in a 32x32 canvas; this keeps the drawn size at the familiar system-cursor scale. */
export const CURSOR_SCALE = .75;

export function cursorMode(fineHover: boolean, reducedMotion: boolean) {
  return { cursor: fineHover, dust: fineHover && !reducedMotion };
}

export function cursorKind(native: string, interactive: boolean, text: boolean, disabled: boolean) {
  if (disabled) return "not-allowed";
  if (native !== "auto" && native !== "default" && native !== "none" && !native.includes("url(")) return native;
  if (interactive) return "pointer";
  return text ? "text" : "default";
}

/** Native image cursors keep operating-system positioning and standard fallbacks. */
export function makeGoldCursors(light: string, gold: string, bronze: string, outline: string) {
  const defs = `<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${light}"/><stop offset=".5" stop-color="${gold}"/><stop offset="1" stop-color="${bronze}"/></linearGradient></defs>`;
  const arrow = '<path d="M2 2V23L8 17L12 27L16 25L12 16H21Z"/>';
  const hand = '<path d="M12 15V4C12 1 16 1 16 4V12C16 9 20 9 20 12V13C20 10 24 10 24 13V15C24 12 28 12 28 15V21C28 26 24 29 19 29H15C12 29 10 26 8 23L4 17C2 14 6 12 8 15L12 19Z"/>';
  const caret = '<path d="M11 3H21M16 3V29M11 29H21" fill="none" stroke-width="2.4"/>';
  const cross = '<path d="M16 3V29M3 16H29M16 3L12 7M16 3L20 7M16 29L12 25M16 29L20 25M3 16L7 12M3 16L7 20M29 16L25 12M29 16L25 20" fill="none" stroke-width="2"/>';
  const shapes: Record<string, [string, number, number]> = {
    default: [arrow, 2, 2], pointer: [hand, 14, 3], text: [caret, 16, 16],
    "vertical-text": [`<g transform="rotate(90 16 16)">${caret}</g>`, 16, 16],
    move: [cross, 16, 16], "all-scroll": [cross, 16, 16], crosshair: ['<path d="M16 2V30M2 16H30" fill="none" stroke-width="2"/>', 16, 16],
    cell: ['<path d="M13 5H19V13H27V19H19V27H13V19H5V13H13Z"/>', 16, 16],
    "not-allowed": ['<circle cx="16" cy="16" r="11" fill="none" stroke-width="3"/><path d="M8 8L24 24" fill="none" stroke-width="3"/>', 16, 16],
    wait: ['<path d="M8 3H24V8L18 16L24 24V29H8V24L14 16L8 8Z"/>', 16, 16],
    progress: [`${arrow}<circle cx="24" cy="23" r="6"/><path d="M24 19V23L27 25" fill="none"/>`, 2, 2],
    help: [`${arrow}<path d="M23 12C18 12 18 5 23 5S29 12 24 14V17M24 20V22" fill="none" stroke-width="2"/>`, 2, 2],
    grab: ['<path d="M7 18V11C7 8 11 8 11 11V8C11 5 15 5 15 8V7C15 4 19 4 19 7V9C19 6 23 6 23 9V12C23 9 27 9 27 12V21C27 27 22 29 17 29C11 29 8 25 5 20C3 16 6 15 9 19Z"/>', 16, 16],
    grabbing: ['<path d="M7 13C7 8 12 8 13 10C15 7 18 8 19 10C22 8 25 10 25 13L27 16V22C27 27 22 29 17 29C11 29 8 25 5 20C3 16 6 15 9 19Z"/>', 16, 16],
  };
  shapes["alias"] = [`${arrow}<path d="M19 19H29V29M29 19L19 29" fill="none" stroke-width="2"/>`, 2, 2];
  shapes["copy"] = [`${arrow}<path d="M23 17V29M17 23H29" fill="none" stroke-width="2"/>`, 2, 2];
  shapes["no-drop"] = shapes["not-allowed"] ?? [arrow, 2, 2];
  for (const kind of ["e-resize", "w-resize", "ew-resize", "col-resize", "n-resize", "s-resize", "ns-resize", "row-resize", "ne-resize", "sw-resize", "nesw-resize", "nw-resize", "se-resize", "nwse-resize"]) {
    const angle = /^(n-resize|s-resize|ns-resize|row-resize)$/.test(kind) ? 90 : /^(ne|sw|nesw)/.test(kind) ? -45 : /^(nw|se|nwse)/.test(kind) ? 45 : 0;
    shapes[kind] = [`<g transform="rotate(${angle} 16 16)"><path d="M3 16H29M3 16L9 10M3 16L9 22M29 16L23 10M29 16L23 22" fill="none" stroke-width="2.4"/></g>`, 16, 16];
  }
  for (const kind of ["zoom-in", "zoom-out"]) shapes[kind] = [`<circle cx="13" cy="13" r="9" fill="none" stroke-width="2"/><path d="M20 20L29 29M8 13H18${kind === "zoom-in" ? "M13 8V18" : ""}" fill="none" stroke-width="2"/>`, 13, 13];
  return Object.fromEntries(Object.entries(shapes).map(([kind, [body, x, y]]) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${defs}<g transform="translate(${x} ${y}) scale(${CURSOR_SCALE}) translate(${-x} ${-y})" fill="url(#g)" stroke="${outline}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${body.replaceAll('fill="none"', 'fill="none" stroke="url(#g)"')}</g></svg>`;
    const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    return [kind, { url, css: `url("${url}") ${x} ${y}, ${kind}` }];
  }));
}