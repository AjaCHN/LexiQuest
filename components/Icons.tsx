import React from "react";

type P = { size?: number; className?: string };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": "true" as const,
});

export const IconLogo = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M3 9l9-5 9 5-9 5-9-5z" />
    <path d="M7 11v5c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-5" />
    <path d="M21 9v5" />
  </svg>
);

export const IconBook = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const IconPuzzle = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M14 4a2 2 0 1 0-4 0H8a2 2 0 0 0-2 2v1a2 2 0 1 0 0 4H6v3a2 2 0 0 0 2 2h1a2 2 0 1 0 4 0h3a2 2 0 0 0 2-2v-1a2 2 0 1 0 0-4v-3a2 2 0 0 0-2-2h-1a2 2 0 1 0 0-4z" />
  </svg>
);

export const IconTrophy = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
  </svg>
);

export const IconStar = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9L12 3z" />
  </svg>
);

export const IconSettings = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.4H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
);

export const IconDownload = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

export const IconUpload = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M12 21V9M7 14l5-5 5 5M5 3h14" />
  </svg>
);

export const IconTrash = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);

export const IconCheck = ({ size = 14 }: P) => (
  <svg {...base(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const IconSun = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const IconFlame = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .3-2 1-3 .2 1 1 1.5 1.5 1.5C9 7 8 4 12 2z" />
    <path d="M12 22a6 6 0 0 0 6-6c0-3-2-5-3-7-1 2-3 2-3 5 0-2-1-3-2-4-1 3-3 4-3 7a6 6 0 0 0 5 5z" />
  </svg>
);

export const IconSync = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8-5M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8 5" />
    <path d="M21 3v5h-5M3 21v-5h5" />
  </svg>
);

export const IconClose = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconPlay = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M7 4v16l13-8z" />
  </svg>
);

export const IconSparkle = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
  </svg>
);

export const IconRefresh = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </svg>
);
