import { useId, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { "aria-hidden": true, focusable: false } as const;

/** The T3 italic monogram, traced from the brand artwork. */
export function T3Mark(props: IconProps) {
  const fillId = `t3-fill-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg viewBox="0 0 71 51" {...base} {...props}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#1a68ff" />
          <stop offset="1" stopColor="#0752f6" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${fillId})`}
        d="M9.4 0H48l-5.8 12.7-10.6.2-9.1 37.4h-1.7l-9.4-8.8L18 12.9H.2Z"
      />
      <path
        fill={`url(#${fillId})`}
        d="M50.9 0h13.7l5.6 9.8-.3 2.9-2.8 8.3-5.5 4.3v.7l3.8 5.3v.5l-1.5 7.9-10.8 10.6H24.6l7-11.8h18.9l.3-7.5H37.1l3.5-10.8h14l2.3-7.5H43.6Z"
      />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 38" {...base} {...props}>
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
        d="M18.6 1.2 2.2 20.6l.6 1.8h10.8l.8 14.4 11-14 1-7.2-8.2-.4Z"
      />
    </svg>
  );
}

export function CubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 36 40" fill="none" {...base} {...props}>
      <path fill="#fff" fillOpacity="0.95" d="M17.75 4.5 32 12.6l-14.25 6.9L3.5 12.6Z" />
      <path fill="#fff" fillOpacity="0.55" d="M3.5 12.6l14.25 6.9V36L3.5 28Z" />
      <path fill="#fff" fillOpacity="0.32" d="M32 12.6l-14.25 6.9V36L32 28Z" />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="5"
        d="M17.75 4.5 32 12.6V28l-14.25 8L3.5 28V12.6Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.4"
        d="M4.6 13.2l13.15 6.3 13.15-6.3M17.75 19.5v15.2"
      />
    </svg>
  );
}

export function GraphIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 38 36" fill="none" stroke="currentColor" {...base} {...props}>
      <g strokeLinecap="round" strokeWidth="3.6">
        <path d="M16.37 12.75 11.23 21.08M21.57 12.79l5.96 9.95M13.68 25.91l11.34.88" />
      </g>
      <circle cx="19" cy="8.5" r="4.3" strokeWidth="3.8" />
      <circle cx="31.5" cy="7.5" r="3.1" strokeWidth="3.4" />
      <circle cx="8.5" cy="25.5" r="4.5" strokeWidth="4" />
      <circle cx="30.2" cy="27.2" r="4.5" strokeWidth="4" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 22 23" fill="currentColor" {...base} {...props}>
      <circle cx="11" cy="6.2" r="5.9" />
      <path d="M.6 21q0 1.1 1.1 1.1h18.5q1.1 0 1.1-1.1v-2c0-3.2-2.7-5.6-5.9-5.6H6.5C3.3 13.4.6 15.8.6 19Z" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 22 24" {...base} {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        d="M5.55 9.4V7.05a5.15 5.15 0 0 1 10.3 0V9.4"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4 8.65h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Zm7 4.1a2.1 2.1 0 0 0-1.05 3.92v2.53a1.05 1.05 0 0 0 2.1 0v-2.53A2.1 2.1 0 0 0 11 12.75Z"
      />
    </svg>
  );
}

export function EyeIcon({ off = false, ...props }: IconProps & { off?: boolean }) {
  return (
    <svg viewBox="0 0 26 18" fill="none" stroke="currentColor" {...base} {...props}>
      <path
        strokeWidth="2.7"
        strokeLinejoin="round"
        d="M1.3 8.5C4 3.6 8.2 1.2 13 1.2s9 2.4 11.7 7.3C22 13.4 17.8 15.8 13 15.8S4 13.4 1.3 8.5Z"
      />
      <circle cx="13" cy="8.5" r="4.1" strokeWidth="2.6" />
      <circle cx="13" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
      {off && <path strokeWidth="2.6" strokeLinecap="round" d="M3.5 16.4 22.5.9" />}
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...base} {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" {...base} {...props}>
      <path
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.2 8.4 3.1 3 6.5-6.7"
      />
    </svg>
  );
}

export function Spinner(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      {...base}
      {...props}
      className={`animate-spin ${props.className ?? ""}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.28" strokeWidth="3" />
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
