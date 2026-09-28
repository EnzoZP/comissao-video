import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { ENTRADAS, EU, MEMBROS } from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Celular, Telao, larguraCelular } from "../componentes/Molduras";
import { Arraste, Toque } from "../componentes/Interacao";
import {
  estiloEntrada,
  janela,
  mapa,
  mola,
  pulso,
  respirar,
} from "../componentes/movimento";
import { TelaoEntrada } from "../componentes/app/Telao";
import {
  CartaoAguardando,
  Dialogo,
  ListaNomes,
  POS,
  POS_OK,
  TelaApp,
} from "../componentes/app/Celular";

const DURACAO = duracaoDa("C04-Nome");
const GRANDE = 1.5;
const PEQUENO = 0.95;
const ROLAGEM = POS.nome(EU) - 520;

const T = {
  arrasta: 18,
  rolaFim: 70,
  toqueNome: 80,
  dialogo: 86,
  toqueOk: 106,
  pagina: 112,
  encolhe: 140,
  telao: 146,
  cascata: 156,
};

// Placar grande de quem já entrou (ao lado do celular, embaixo do telão).
const Entraram: React.FC<{ frame: number; fps: number; aparece: number }> = ({
  frame,
  fps,
  aparece,
}) => {
  const chegadas = ENTRADAS.map((e) => T.cascata + e.atraso).filter(
    (q) => frame >= q,
  );
  const ultima = chegadas.length ? Math.max(...chegadas) : -1;
  return (
    <div
      style={{
        position: "absolute",
        left: 480,
        top: 1140,
        width: 540,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...estiloEntrada(mola(frame, fps, aparece, "smooth"), 50, 0.92),
      }}
    >
      <span
        style={{
          fontSize: 200,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: theme.cores.sim,
          fontVariantNumeric: "tabular-nums",
          transform: `scale(${ultima >= 0 ? pulso(frame, ultima, 1.08, 10) : 1})`,
        }}
      >
        {chegadas.length}
      </span>
      <span
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: theme.cores.textoSuave,
          marginTop: 10,
        }}
      >
        de {MEMBROS.length} entraram
      </span>
    </div>
  );
};

export const C04Nome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = mola(frame, fps, 0, "smooth");
  const encolhe = janela(frame, T.encolhe, T.encolhe + 26, theme.ease.inOut);
  const escala = mapa(encolhe, GRANDE, PEQUENO);
  const x = mapa(encolhe, (1080 - larguraCelular(GRANDE)) / 2, 60);
  const y = mapa(encolhe, 400, 1075);
  const rolagem = mapa(
    janela(frame, T.arrasta + 4, T.rolaFim, theme.ease.suave),
    0,
    ROLAGEM,
  );
  const dialogo =
    mola(frame, fps, T.dialogo, "snappy") *
    (1 - janela(frame, T.toqueOk + 4, T.toqueOk + 12));
  const pagina = janela(frame, T.pagina, T.pagina + 12);
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Cada um toca no próprio nome" />
      {frame >= T.telao - 2 && (
        <>
          <Telao
            x={40}
            y={380}
            largura={1000}
            altura={620}
            style={{
              ...estiloEntrada(mola(frame, fps, T.telao, "smooth"), 60, 0.96),
              translate: `0px ${respirar(frame, 10, 2)}px`,
            }}
          >
            <TelaoEntrada entradas={ENTRADAS} inicioCascata={T.cascata} />
          </Telao>
          <Entraram frame={frame} fps={fps} aparece={T.telao + 8} />
        </>
      )}
      <Celular
        escala={escala}
        x={x}
        y={y}
        style={{
          opacity: Math.min(1, entra),
          translate: `0px ${mapa(entra, 160, 0)}px`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 1 - pagina }}>
          <TelaApp saudacao="Quem é você?" rolagem={rolagem}>
            <ListaNomes
              pressionado={EU}
              aperto={janela(frame, T.toqueNome - 2, T.toqueNome + 2)}
            />
          </TelaApp>
        </div>
        {pagina > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: pagina }}>
            <TelaApp saudacao={`Olá, ${MEMBROS[EU]}`}>
              <CartaoAguardando />
            </TelaApp>
          </div>
        )}
        <Arraste
          pontos={[
            { f: T.arrasta, x: 200, y: 650 },
            { f: T.arrasta + 20, x: 205, y: 250 },
          ]}
        />
        <Toque
          x={POS.centroX}
          y={POS.nome(EU) - ROLAGEM}
          quadro={T.toqueNome}
        />
        {dialogo > 0.001 && (
          <Dialogo
            nome={MEMBROS[EU]}
            p={dialogo}
            aperto={janela(frame, T.toqueOk - 2, T.toqueOk + 2)}
          />
        )}
        <Toque x={POS_OK.x} y={POS_OK.y} quadro={T.toqueOk} />
      </Celular>
    </Cena>
  );
};
