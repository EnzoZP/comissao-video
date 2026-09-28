import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Celular, Telao, larguraCelular } from "../componentes/Molduras";
import { Toque } from "../componentes/Interacao";
import {
  estiloEntrada,
  janela,
  mapa,
  mola,
  respirar,
} from "../componentes/movimento";
import { TelaoEntrada } from "../componentes/app/Telao";
import {
  Camera,
  ListaNomes,
  POS_PILULA,
  TelaApp,
} from "../componentes/app/Celular";

const DURACAO = duracaoDa("C03-QR");
const ESCALA = 1.25;

export const T3 = {
  telao: 6,
  celular: 52,
  trava: 90,
  pilula: 112,
  toque: 134,
};

export const C03QR: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sobe = mola(frame, fps, T3.celular, "smooth");
  const trava = janela(frame, T3.trava, T3.trava + 18);
  const pilula = mola(frame, fps, T3.pilula, "bouncy");
  const troca = janela(frame, T3.toque + 4, T3.toque + 14);
  const tremor = {
    x: Math.sin(frame / 9) * 3 * (1 - trava * 0.7),
    y: Math.cos(frame / 11) * 2.5 * (1 - trava * 0.7),
  };
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Entrada pelo QR" />
      <Telao
        x={40}
        y={400}
        largura={1000}
        altura={620}
        style={{
          ...estiloEntrada(mola(frame, fps, T3.telao, "smooth"), 60, 0.96),
          translate: `0px ${respirar(frame, 10, 2)}px`,
        }}
      >
        <TelaoEntrada aparece={T3.telao + 4} />
      </Telao>
      <Celular
        escala={ESCALA}
        x={(1080 - larguraCelular(ESCALA)) / 2}
        y={mapa(sobe, 1960, 1045)}
        escuro={1 - troca}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 1 - troca }}>
          <Camera
            trava={trava}
            pilula={frame >= T3.pilula ? pilula : 0}
            tremor={tremor}
          />
        </div>
        {troca > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: troca }}>
            <TelaApp saudacao="Quem é você?">
              <ListaNomes />
            </TelaApp>
          </div>
        )}
        <Toque x={POS_PILULA.x} y={POS_PILULA.y} quadro={T3.toque} />
      </Celular>
    </Cena>
  );
};
