// MedConz design tokens — Phase 1.
// Easy-to-read first: larger text, high contrast, big touch targets.
// All components consume these via CSS vars (see uiCss) so a theme
// change happens in exactly one place.

export const tokens = {
  fontSizeBase: 17,
  fontSizeQuestion: 22,
  fontSizeSmall: 14,
  lineHeight: 1.6,
  tapTargetMin: 48,
  radius: 12,
  maxContentWidth: 680,

  colorInk: "#111318",
  colorMuted: "#44474d",
  colorLine: "#c9ccd1",
  colorPrimary: "#0b57d0",
  colorPrimaryInk: "#ffffff",
  colorSurface: "#ffffff",
  colorSurfaceTint: "#eef3fd",
  colorEmergency: "#b3261e",
  colorEmergencyBg: "#fce8e6",
  colorAmber: "#7a4d00",
  colorAmberBg: "#fff4d6",
  colorOk: "#146c2e",
  colorOkBg: "#e6f4ea",
} as const;

export type TokenVars = Record<string, string>;

export const cssVars: TokenVars = {
  "--mc-base": `${tokens.fontSizeBase}px`,
  "--mc-question": `${tokens.fontSizeQuestion}px`,
  "--mc-small": `${tokens.fontSizeSmall}px`,
  "--mc-ink": tokens.colorInk,
  "--mc-muted": tokens.colorMuted,
  "--mc-line": tokens.colorLine,
  "--mc-primary": tokens.colorPrimary,
  "--mc-primary-ink": tokens.colorPrimaryInk,
  "--mc-surface": tokens.colorSurface,
  "--mc-tint": tokens.colorSurfaceTint,
  "--mc-emergency": tokens.colorEmergency,
  "--mc-emergency-bg": tokens.colorEmergencyBg,
  "--mc-amber": tokens.colorAmber,
  "--mc-amber-bg": tokens.colorAmberBg,
  "--mc-ok": tokens.colorOk,
  "--mc-ok-bg": tokens.colorOkBg,
  "--mc-tap": `${tokens.tapTargetMin}px`,
  "--mc-radius": `${tokens.radius}px`,
};

// One <style> block shipped with the library so pseudo-classes,
// focus rings, reduced-motion and high-contrast rules live with
// the components instead of leaking into every app.
export const uiCss = `
:root { ${Object.entries(cssVars).map(([k, v]) => `${k}:${v}`).join(";")} }
.mc-card{background:var(--mc-surface);border:1px solid var(--mc-line);border-radius:var(--mc-radius);padding:20px;margin:16px 0;max-width:${tokens.maxContentWidth}px}
.mc-card h2{font-size:var(--mc-question);line-height:1.4;margin:0 0 12px}
.mc-step{color:var(--mc-muted);font-size:var(--mc-small);margin:0 0 8px}
.mc-btn{min-height:var(--mc-tap);font-size:var(--mc-base);border-radius:999px;padding:12px 24px;margin:6px 8px 6px 0;cursor:pointer;border:2px solid var(--mc-primary);background:var(--mc-surface);color:var(--mc-primary);font-weight:600}
.mc-btn-primary{background:var(--mc-primary);color:var(--mc-primary-ink)}
.mc-btn-quiet{border-color:var(--mc-line);color:var(--mc-ink)}
.mc-btn:disabled{opacity:.5;cursor:not-allowed}
.mc-btn:focus-visible,.mc-chip:focus-visible,.mc-link:focus-visible,input[type=range]:focus-visible{outline:3px solid var(--mc-primary);outline-offset:2px}
.mc-chip{min-height:var(--mc-tap);font-size:var(--mc-base);border-radius:999px;border:2px solid var(--mc-line);background:var(--mc-surface);padding:12px 20px;margin:6px 8px 6px 0;cursor:pointer}
.mc-chip[aria-pressed=true]{border-color:var(--mc-primary);background:var(--mc-tint);color:var(--mc-primary);font-weight:700}
.mc-banner{border-radius:var(--mc-radius);padding:16px;margin:16px 0;max-width:${tokens.maxContentWidth}px;font-size:var(--mc-base);line-height:${tokens.lineHeight}}
.mc-banner-emergency{background:var(--mc-emergency-bg);border:2px solid var(--mc-emergency)}
.mc-banner-info{background:var(--mc-tint);border:2px solid var(--mc-primary)}
.mc-progress{height:12px;border-radius:999px;background:#e1e3e6;overflow:hidden;margin:8px 0}
.mc-progress>div{height:100%;background:var(--mc-primary);border-radius:999px}
.mc-slider{width:100%;min-height:var(--mc-tap);accent-color:var(--mc-primary)}
.mc-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.mc-muted{color:var(--mc-muted);font-size:var(--mc-small)}
.mc-summary{list-style:none;padding:0;margin:0}
.mc-summary li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--mc-line)}
.mc-timeline{border-left:4px solid var(--mc-line);margin:8px 0 8px 8px;padding-left:16px}
.mc-node{position:relative;padding:12px 0}
.mc-node::before{content:"";position:absolute;left:-24px;top:18px;width:12px;height:12px;border-radius:50%;background:var(--mc-primary)}
.mc-node-check::before{background:var(--mc-primary)}
.mc-node-consultation::before{background:var(--mc-ok)}
.mc-node-note::before{background:var(--mc-amber)}
.mc-dialog{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50}
.mc-dialog-box{background:var(--mc-surface);border-radius:var(--mc-radius);padding:24px;max-width:520px;width:100%}
.mc-select,.mc-input{min-height:var(--mc-tap);font-size:var(--mc-base);border-radius:8px;border:2px solid var(--mc-line);padding:10px 12px;background:var(--mc-surface);color:var(--mc-ink)}
.mc-check{display:flex;gap:12px;align-items:flex-start;font-size:var(--mc-base);line-height:${tokens.lineHeight}}
.mc-check input{width:28px;height:28px;min-width:28px;accent-color:var(--mc-primary);margin-top:2px}
.mc-tabs{position:fixed;bottom:0;left:0;right:0;display:flex;background:var(--mc-surface);border-top:2px solid var(--mc-line);z-index:40;padding-bottom:env(safe-area-inset-bottom)}
.mc-tab{flex:1;min-height:60px;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--mc-muted);text-decoration:none;background:none;border:none;cursor:pointer;padding:8px 2px}
.mc-tab[aria-current=page]{color:var(--mc-primary);font-weight:700}
body{padding-bottom:78px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@media (prefers-contrast:more){.mc-card,.mc-chip,.mc-btn{border-width:3px}}
`;
