// MedConz design tokens — professional medical theme.
// Trustworthy deep teal, warm neutrals, soft surfaces. Easy-to-read first:
// 17px base, 22px questions, 48px touch targets, high contrast.

export const tokens = {
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSizeBase: 17,
  fontSizeQuestion: 22,
  fontSizeSmall: 14,
  lineHeight: 1.6,
  tapTargetMin: 48,
  radius: 16,
  maxContentWidth: 680,

  colorBg: "#F2F6F5",
  colorInk: "#14201D",
  colorMuted: "#5B6B66",
  colorLine: "#DCE5E2",
  colorPrimary: "#0E7C6B",
  colorPrimaryDark: "#0A5F53",
  colorPrimaryInk: "#ffffff",
  colorSurface: "#ffffff",
  colorSurfaceTint: "#E6F4F0",
  colorEmergency: "#B3261E",
  colorEmergencyBg: "#FCE8E6",
  colorAmber: "#7A4D00",
  colorAmberBg: "#FFF4D6",
  colorOk: "#147A3E",
  colorOkBg: "#E6F4EA",
  shadowCard: "0 1px 2px rgba(16,32,29,.06), 0 10px 28px rgba(16,32,29,.08)",
  shadowBar: "0 -6px 24px rgba(16,32,29,.10)",
} as const;

export type TokenVars = Record<string, string>;

export const cssVars: TokenVars = {
  "--mc-font": tokens.font,
  "--mc-base": `${tokens.fontSizeBase}px`,
  "--mc-question": `${tokens.fontSizeQuestion}px`,
  "--mc-small": `${tokens.fontSizeSmall}px`,
  "--mc-ink": tokens.colorInk,
  "--mc-muted": tokens.colorMuted,
  "--mc-line": tokens.colorLine,
  "--mc-bg": tokens.colorBg,
  "--mc-primary": tokens.colorPrimary,
  "--mc-primary-dark": tokens.colorPrimaryDark,
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

// One <style> block shipped with the library so the whole look lives with
// the components instead of leaking into every app.
export const uiCss = `
:root { ${Object.entries(cssVars).map(([k, v]) => `${k}:${v}`).join(";")} }
body{background:var(--mc-bg);color:var(--mc-ink);font-family:var(--mc-font);-webkit-font-smoothing:antialiased}
.mc-card{background:var(--mc-surface);border:1px solid var(--mc-line);border-radius:var(--mc-radius);padding:22px;margin:16px 0;max-width:${tokens.maxContentWidth}px;box-shadow:${tokens.shadowCard}}
.mc-card h2{font-size:var(--mc-question);line-height:1.35;margin:0 0 12px;letter-spacing:-.01em}
.mc-step{color:var(--mc-muted);font-size:var(--mc-small);margin:0 0 8px}
.mc-btn{min-height:var(--mc-tap);font-size:var(--mc-base);font-weight:600;border-radius:999px;padding:12px 24px;margin:6px 8px 6px 0;cursor:pointer;border:2px solid var(--mc-primary);background:var(--mc-surface);color:var(--mc-primary);transition:transform .12s ease,box-shadow .12s ease,background .12s ease;text-decoration:none;display:inline-block;line-height:1.4}
.mc-btn-primary{background:linear-gradient(180deg,var(--mc-primary),var(--mc-primary-dark));border-color:var(--mc-primary-dark);color:var(--mc-primary-ink);box-shadow:0 4px 14px rgba(14,124,107,.35)}
.mc-btn-quiet{border-color:var(--mc-line);color:var(--mc-ink)}
.mc-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
@media(hover:hover){.mc-btn-primary:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(14,124,107,.4)}.mc-btn-quiet:hover{border-color:var(--mc-primary);color:var(--mc-primary)}}
.mc-btn:focus-visible,.mc-chip:focus-visible,.mc-link:focus-visible,.mc-tab:focus-visible,input[type=range]:focus-visible,.mc-input:focus-visible,.mc-select:focus-visible{outline:3px solid var(--mc-primary);outline-offset:2px}
.mc-link{color:var(--mc-primary);font-weight:600}
.mc-chip{min-height:var(--mc-tap);font-size:var(--mc-base);border-radius:999px;border:2px solid var(--mc-line);background:var(--mc-surface);color:var(--mc-ink);padding:12px 20px;margin:6px 8px 6px 0;cursor:pointer;transition:border-color .12s ease,background .12s ease}
.mc-chip[aria-pressed=true]{border-color:var(--mc-primary);background:var(--mc-tint);color:var(--mc-primary-dark);font-weight:700;box-shadow:inset 0 0 0 1px var(--mc-primary)}
.mc-banner{border-radius:var(--mc-radius);padding:16px 16px 16px 20px;margin:16px 0;max-width:${tokens.maxContentWidth}px;font-size:var(--mc-base);line-height:${tokens.lineHeight};box-shadow:${tokens.shadowCard}}
.mc-banner-emergency{background:var(--mc-emergency-bg);border:2px solid var(--mc-emergency);border-left-width:8px}
.mc-banner-info{background:var(--mc-tint);border:2px solid var(--mc-primary);border-left-width:8px}
.mc-progress{height:12px;border-radius:999px;background:#E0E8E6;overflow:hidden;margin:8px 0}
.mc-progress>div{height:100%;background:linear-gradient(90deg,var(--mc-primary),var(--mc-ok));border-radius:999px;transition:width .25s ease}
.mc-slider{width:100%;min-height:var(--mc-tap);accent-color:var(--mc-primary)}
.mc-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.mc-muted{color:var(--mc-muted);font-size:var(--mc-small)}
.mc-summary{list-style:none;padding:0;margin:0}
.mc-summary li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--mc-line)}
.mc-summary li:last-child{border-bottom:none}
.mc-timeline{border-left:4px solid var(--mc-line);margin:8px 0 8px 8px;padding-left:16px}
.mc-node{position:relative;padding:12px 0}
.mc-node::before{content:"";position:absolute;left:-25px;top:18px;width:14px;height:14px;border-radius:50%;background:var(--mc-primary);border:3px solid var(--mc-surface);box-shadow:0 0 0 2px var(--mc-line)}
.mc-node-check::before{background:var(--mc-primary)}
.mc-node-consultation::before{background:var(--mc-ok)}
.mc-node-note::before{background:var(--mc-amber)}
.mc-dialog{position:fixed;inset:0;background:rgba(16,32,29,.5);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50}
.mc-dialog-box{background:var(--mc-surface);border-radius:20px;padding:26px;max-width:520px;width:100%;box-shadow:${tokens.shadowCard}}
.mc-select,.mc-input{min-height:var(--mc-tap);font-size:var(--mc-base);font-family:var(--mc-font);border-radius:12px;border:2px solid var(--mc-line);padding:10px 14px;background:var(--mc-surface);color:var(--mc-ink)}
.mc-select:focus,.mc-input:focus{border-color:var(--mc-primary)}
.mc-check{display:flex;gap:12px;align-items:flex-start;font-size:var(--mc-base);line-height:${tokens.lineHeight}}
.mc-check input{width:28px;height:28px;min-width:28px;accent-color:var(--mc-primary);margin-top:2px}
.mc-hero{background:linear-gradient(135deg,#0E7C6B 0%,#0A5F53 55%,#083F38 100%);color:#fff;border-radius:24px;padding:36px 28px;margin:8px 0 20px;max-width:${tokens.maxContentWidth}px;box-shadow:${tokens.shadowCard}}
.mc-hero h1{margin:0 0 10px;font-size:32px;line-height:1.2;letter-spacing:-.02em}
.mc-hero p{margin:0 0 20px;font-size:var(--mc-base);opacity:.92;max-width:46ch}
.mc-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.16);padding:6px 12px;border-radius:999px;margin-bottom:14px}
.mc-hero .mc-btn-primary{background:#fff;border-color:#fff;color:var(--mc-primary-dark);box-shadow:0 4px 14px rgba(0,0,0,.25)}
.mc-hero .mc-btn-quiet{background:transparent;border-color:rgba(255,255,255,.6);color:#fff}
.mc-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:${tokens.maxContentWidth}px;margin:0 0 8px}
@media(max-width:420px){.mc-actions{grid-template-columns:1fr}}
.mc-action{background:var(--mc-surface);border:1px solid var(--mc-line);border-radius:var(--mc-radius);padding:18px;text-decoration:none;color:var(--mc-ink);box-shadow:${tokens.shadowCard};display:block}
.mc-action strong{display:block;font-size:var(--mc-base);margin-bottom:4px}
.mc-action span{color:var(--mc-muted);font-size:var(--mc-small)}
@media(hover:hover){.mc-action:hover{border-color:var(--mc-primary);transform:translateY(-1px)}}
.mc-tabs{position:fixed;bottom:0;left:0;right:0;display:flex;background:rgba(255,255,255,.97);backdrop-filter:blur(6px);border-top:1px solid var(--mc-line);box-shadow:${tokens.shadowBar};z-index:40;padding-bottom:env(safe-area-inset-bottom)}
.mc-tab{flex:1;min-height:62px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--mc-muted);text-decoration:none;background:none;border:none;cursor:pointer;padding:8px 2px;position:relative}
.mc-tab[aria-current=page]{color:var(--mc-primary-dark)}
.mc-tab[aria-current=page]::before{content:"";position:absolute;top:0;left:24%;right:24%;height:3px;border-radius:0 0 4px 4px;background:var(--mc-primary)}
body{padding-bottom:80px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@media (prefers-contrast:more){.mc-card,.mc-chip,.mc-btn{border-width:3px}}
`;
