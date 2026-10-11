"use client";

export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="MedConz logo">
      <defs>
        <linearGradient id="mcg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14A88F" />
          <stop offset="1" stopColor="#0A5F53" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="52" height="52" rx="15" fill="url(#mcg)" />
      <rect x="25" y="11" width="6" height="22" rx="3" fill="#fff" />
      <rect x="17" y="19" width="22" height="6" rx="3" fill="#fff" />
      <polyline
        points="11,42 19,42 22.5,36 26.5,46 30,40 32.5,42 45,42"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}

export function BrandLockup() {
  return (
    <div className="mc-brand">
      <BrandMark />
      <div>
        <div className="mc-brand-name">MedConz</div>
        <div className="mc-brand-sub">doctors & dentists</div>
      </div>
    </div>
  );
}
