import React from "react";
import { theme } from "../theme";

// Ícones desenhados em SVG na paleta do vídeo (sem emoji).
const traco = {
  fill: "none",
  stroke: theme.cores.texto,
  strokeWidth: 5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const IconeComputador: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
    <rect x="14" y="20" width="72" height="46" rx="6" {...traco} />
    <path d="M40 80h20M50 66v14" {...traco} />
    <path d="M26 34h30M26 45h20" {...traco} strokeWidth={4} opacity={0.5} />
  </svg>
);

export const IconeTelao: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
    <path d="M10 18h80" {...traco} />
    <rect x="16" y="18" width="68" height="46" rx="3" {...traco} />
    <path d="M50 64v12M38 86l12-10 12 10" {...traco} />
    <rect
      x="26"
      y="30"
      width="14"
      height="10"
      rx="2"
      {...traco}
      strokeWidth={4}
      opacity={0.5}
    />
    <rect
      x="44"
      y="30"
      width="14"
      height="10"
      rx="2"
      {...traco}
      strokeWidth={4}
      opacity={0.5}
    />
    <rect
      x="62"
      y="30"
      width="12"
      height="10"
      rx="2"
      {...traco}
      strokeWidth={4}
      opacity={0.5}
    />
  </svg>
);

export const IconeCelular: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
    <rect x="30" y="10" width="40" height="80" rx="8" {...traco} />
    <path d="M45 18h10" {...traco} />
    <rect
      x="38"
      y="36"
      width="24"
      height="10"
      rx="3"
      {...traco}
      strokeWidth={4}
      opacity={0.5}
    />
    <rect
      x="38"
      y="52"
      width="24"
      height="10"
      rx="3"
      {...traco}
      strokeWidth={4}
      opacity={0.5}
    />
  </svg>
);

// Barra de status do celular: sinal, wi-fi e bateria.
export const IconesStatus: React.FC<{ cor: string }> = ({ cor }) => (
  <svg width="74" height="14" viewBox="0 0 74 14">
    <rect x="0" y="9" width="3.2" height="5" rx="1" fill={cor} />
    <rect x="5" y="6.5" width="3.2" height="7.5" rx="1" fill={cor} />
    <rect x="10" y="4" width="3.2" height="10" rx="1" fill={cor} />
    <rect x="15" y="1.5" width="3.2" height="12.5" rx="1" fill={cor} />
    <path
      d="M26 5.2a10 10 0 0 1 14 0M28.6 8a6.2 6.2 0 0 1 8.8 0M31.2 10.7a2.4 2.4 0 0 1 3.6 0"
      fill="none"
      stroke={cor}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect
      x="47"
      y="1"
      width="23"
      height="12"
      rx="3.5"
      fill="none"
      stroke={cor}
      strokeWidth="1.3"
      opacity={0.6}
    />
    <rect x="49" y="3" width="17" height="8" rx="2" fill={cor} />
    <rect
      x="71.2"
      y="4.6"
      width="1.8"
      height="4.8"
      rx="0.9"
      fill={cor}
      opacity={0.6}
    />
  </svg>
);

export const IconeCadeado: React.FC<{ cor: string; tamanho?: number }> = ({
  cor,
  tamanho = 16,
}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 16 16">
    <rect x="3" y="7" width="10" height="8" rx="2" fill={cor} />
    <path
      d="M5 7V5a3 3 0 0 1 6 0v2"
      fill="none"
      stroke={cor}
      strokeWidth="1.6"
    />
  </svg>
);

export const IconeLink: React.FC<{ cor: string; tamanho?: number }> = ({
  cor,
  tamanho = 18,
}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 18 18">
    <path
      d="M7.5 10.5l3-3M6 8.5L4.5 10a2.8 2.8 0 0 0 4 4L10 12.5M12 9.5l1.5-1.5a2.8 2.8 0 0 0-4-4L8 5.5"
      fill="none"
      stroke={cor}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
