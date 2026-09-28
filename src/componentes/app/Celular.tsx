import React from "react";
import { interpolateColors } from "remotion";
import { theme } from "../../theme";
import {
  MEMBROS,
  type Opcao,
  type Pauta,
  ehSimNao,
  opcoesDa,
  rotuloDa,
} from "../../dados";
import { IconeLink } from "../Icones";
import { QrFalso } from "../Interacao";
import { mapa } from "../movimento";
import { estilo } from "./estilos";

// Telas do celular do membro (entrar.html e votar.html reais). Coordenadas em px CSS da
// área de conteúdo, que começa logo abaixo da barra de status.
const c = theme.cores;

// Posições usadas pelos toques (coordenadas da área de conteúdo).
export const POS = {
  // topo do cartão: 20 (padding) + 22,4 (h1) + 4 + 31 (p) + 16 (gap)
  cartao: 93.4,
  // centro do botão i da lista de nomes
  nome: (i: number) => 93.4 + 21 + 24.6 + 20 + i * 84 + 36,
  // centro do botão de opção k no cartão de votação
  opcao: (k: number) => 93.4 + 21 + 19 + 37 + 20 + k * 84 + 36,
  centroX: 195,
};

export const TelaApp: React.FC<{
  saudacao: string;
  rolagem?: number;
  children: React.ReactNode;
}> = ({ saudacao, rolagem = 0, children }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      padding: "20px 16px 40px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      fontSize: 16,
      lineHeight: 1.4,
      color: c.texto,
      transform: `translateY(${-rolagem}px)`,
    }}
  >
    <header>
      <h1
        style={{
          fontSize: 16,
          lineHeight: "22.4px",
          margin: 0,
          color: c.textoSuave,
          fontWeight: 600,
        }}
      >
        Comissão de Nomeações
      </h1>
      <p
        style={{
          fontSize: 22.4,
          lineHeight: "31px",
          margin: "4px 0 0",
          fontWeight: 700,
        }}
      >
        {saudacao}
      </p>
    </header>
    {children}
  </div>
);

// ---------- entrar.html: lista de nomes ----------
export const ListaNomes: React.FC<{
  pressionado?: number;
  aperto?: number;
}> = ({ pressionado = -1, aperto = 0 }) => (
  <div style={estilo.cartao}>
    <p style={{ ...estilo.statusVoto, marginTop: 0 }}>Toque no seu nome:</p>
    <div style={estilo.opcoes}>
      {MEMBROS.map((nome, i) => (
        <div
          key={nome}
          style={{
            ...estilo.opcao,
            background:
              i === pressionado
                ? interpolateColors(aperto, [0, 1], [c.superficie, c.neutro])
                : c.superficie,
          }}
        >
          {nome}
        </div>
      ))}
    </div>
    <p style={{ ...estilo.suave, margin: "16px 0 0" }}>
      Seu nome não está na lista? Ele já foi escolhido em outro celular: fale
      com a secretaria.
    </p>
  </div>
);

// Confirmação nativa do navegador ("Você é …?"), como o window.confirm do app.
export const DIALOGO = { largura: 270, topo: 330, altura: 110 };
export const POS_OK = {
  x: (390 - DIALOGO.largura) / 2 + DIALOGO.largura * 0.75,
  y: DIALOGO.topo + DIALOGO.altura - 22,
};

export const Dialogo: React.FC<{
  nome: string;
  p: number;
  aperto?: number;
}> = ({ nome, p, aperto = 0 }) => (
  <div style={{ position: "absolute", inset: -60, zIndex: 20 }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: theme.efeitos.veuDialogo,
        opacity: Math.min(1, p),
      }}
    />
    <div
      style={{
        position: "absolute",
        top: DIALOGO.topo + 60,
        left: (390 - DIALOGO.largura) / 2 + 60,
        width: DIALOGO.largura,
        height: DIALOGO.altura,
        borderRadius: 14,
        background: c.superficie,
        boxShadow: theme.efeitos.sombraDialogo,
        overflow: "hidden",
        opacity: Math.min(1, p),
        transform: `scale(${mapa(p, 1.12, 1)})`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Você é {nome}?
      </div>
      <div
        style={{
          display: "flex",
          height: 44,
          borderTop: `1px solid ${c.borda}`,
          fontSize: 17,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.destaque,
            borderRight: `1px solid ${c.borda}`,
          }}
        >
          Cancelar
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.destaque,
            fontWeight: 700,
            background: interpolateColors(
              aperto,
              [0, 1],
              [c.superficie, c.neutro],
            ),
          }}
        >
          OK
        </div>
      </div>
    </div>
  </div>
);

// ---------- votar.html ----------
export const CartaoAguardando: React.FC = () => (
  <div style={estilo.cartao}>
    <p style={{ ...estilo.statusVoto, marginTop: 0 }}>
      Aguardando a próxima votação…
    </p>
  </div>
);

export const CartaoVotacao: React.FC<{
  pauta: Pauta;
  meuVoto?: Opcao;
  escolha?: number; // 0→1: o botão escolhido enchendo
  entrada?: (i: number) => React.CSSProperties;
}> = ({ pauta, meuVoto, escolha = 0, entrada = () => ({}) }) => {
  const simNao = ehSimNao(pauta);
  const antes = simNao
    ? "Toque em SIM ou NÃO para votar."
    : "Toque no nome em que você vota.";
  const depois =
    meuVoto === undefined
      ? antes
      : `Seu voto: ${rotuloDa(pauta, meuVoto).toUpperCase()}. Você pode trocar enquanto a votação estiver aberta.`;
  return (
    <div style={estilo.cartao}>
      <p style={{ ...estilo.cargo, ...entrada(0) }}>{pauta.cargo}</p>
      <p style={{ ...estilo.nomes, ...entrada(1) }}>
        {simNao ? pauta.candidatos[0] : "Escolha um nome"}
      </p>
      <div style={estilo.opcoes}>
        {opcoesDa(pauta).map((op, k) => {
          const escolhida = op === meuVoto;
          const corBorda =
            op === "sim" ? c.sim : op === "nao" ? c.nao : c.borda;
          const corCheia =
            op === "sim" ? c.sim : op === "nao" ? c.nao : c.destaque;
          const p = escolhida ? escolha : 0;
          return (
            <div
              key={String(op)}
              style={{
                ...estilo.opcao,
                borderColor: interpolateColors(p, [0, 1], [corBorda, corCheia]),
                background: interpolateColors(
                  p,
                  [0, 1],
                  [c.superficie, corCheia],
                ),
                color: interpolateColors(p, [0, 1], [c.texto, c.branco]),
                ...entrada(2 + k),
              }}
            >
              {rotuloDa(pauta, op)}
            </div>
          );
        })}
      </div>
      {/* os dois textos na mesma célula da grade: o cartão cresce até o mais alto */}
      <div style={{ display: "grid", ...entrada(5) }}>
        <p
          style={{
            ...estilo.statusVoto,
            gridArea: "1 / 1",
            opacity: 1 - escolha,
          }}
        >
          {antes}
        </p>
        <p
          style={{ ...estilo.statusVoto, gridArea: "1 / 1", opacity: escolha }}
        >
          {depois}
        </p>
      </div>
    </div>
  );
};

// ---------- Câmera do celular lendo o QR ----------
export const CAMERA = { qrX: 195, qrY: 250, qr: 170 };

export const Camera: React.FC<{
  trava: number;
  pilula: number;
  tremor: { x: number; y: number };
}> = ({ trava, pilula, tremor }) => {
  const folga = mapa(trava, 60, 14);
  const lado = CAMERA.qr + folga * 2;
  const canto = (rot: number, x: number, y: number) => (
    <div
      key={rot}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 34,
        height: 34,
        borderTop: `4px solid ${c.branco}`,
        borderLeft: `4px solid ${c.branco}`,
        borderTopLeftRadius: 10,
        transform: `rotate(${rot}deg)`,
        opacity: mapa(Math.min(1, trava * 1.5), 0.4, 1),
      }}
    />
  );
  const x0 = CAMERA.qrX - lado / 2;
  const y0 = CAMERA.qrY - lado / 2;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 35%, ${c.cameraBrilho}, ${c.camera} 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          transform: `translate(${tremor.x}px, ${tremor.y}px)`,
        }}
      >
        {/* o telão visto pela câmera: tela escura com o QR */}
        <div
          style={{
            position: "absolute",
            left: CAMERA.qrX - 170,
            top: CAMERA.qrY - 135,
            width: 380,
            height: 250,
            borderRadius: 10,
            background: c.telao.fundo,
            opacity: 0.9,
            transform: "rotate(-3deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: CAMERA.qrX - CAMERA.qr / 2,
            top: CAMERA.qrY - CAMERA.qr / 2,
            width: CAMERA.qr,
            height: CAMERA.qr,
            padding: 8,
            boxSizing: "border-box",
            background: c.branco,
            borderRadius: 8,
            transform: "rotate(-3deg)",
          }}
        >
          <QrFalso tamanho={CAMERA.qr - 16} />
        </div>
      </div>
      {canto(0, x0, y0)}
      {canto(90, x0 + lado - 34, y0)}
      {canto(270, x0, y0 + lado - 34)}
      {canto(180, x0 + lado - 34, y0 + lado - 34)}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CAMERA.qrY + CAMERA.qr / 2 + 48,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 999,
            background: c.superficie,
            color: c.texto,
            fontSize: 16,
            fontWeight: 600,
            opacity: Math.min(1, pilula),
            transform: `translateY(${mapa(pilula, 14, 0)}px) scale(${mapa(pilula, 0.85, 1)})`,
          }}
        >
          <IconeLink cor={c.texto} />
          Abrir entrada da votação
        </div>
      </div>
    </div>
  );
};

export const POS_PILULA = { x: 195, y: CAMERA.qrY + CAMERA.qr / 2 + 48 + 22 };
