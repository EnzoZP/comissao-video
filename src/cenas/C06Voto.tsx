import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { EU, MEMBROS, PAUTA_JOVENS } from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Celular, larguraCelular } from "../componentes/Molduras";
import { Toque } from "../componentes/Interacao";
import {
  estiloEntrada,
  janela,
  mapa,
  mola,
  respirar,
} from "../componentes/movimento";
import {
  CartaoAguardando,
  CartaoVotacao,
  POS,
  TelaApp,
} from "../componentes/app/Celular";

const DURACAO = duracaoDa("C06-Voto");
const ESCALA = 1.5;
const T = { pauta: 24, toque: 68 };

export const C06Voto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = mola(frame, fps, 0, "smooth");
  const pauta = janela(frame, T.pauta, T.pauta + 8);
  const escolha = janela(frame, T.toque + 1, T.toque + 9);
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Voto no celular" />
      <Celular
        escala={ESCALA}
        x={(1080 - larguraCelular(ESCALA)) / 2}
        y={400}
        style={{
          opacity: Math.min(1, entra),
          translate: `0px ${mapa(entra, 160, 0) + respirar(frame, 0, 2)}px`,
        }}
      >
        <TelaApp saudacao={`Olá, ${MEMBROS[EU]}`}>
          <div style={{ position: "relative" }}>
            {pauta < 1 && (
              <div style={{ opacity: 1 - pauta }}>
                <CartaoAguardando />
              </div>
            )}
            {frame >= T.pauta && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <CartaoVotacao
                  pauta={PAUTA_JOVENS}
                  meuVoto={frame >= T.toque ? "sim" : undefined}
                  escolha={escolha}
                  entrada={(i) =>
                    estiloEntrada(
                      mola(frame, fps, T.pauta + 2 + i * 4, "snappy"),
                      16,
                      0.97,
                    )
                  }
                />
              </div>
            )}
          </div>
        </TelaApp>
        <Toque x={POS.centroX} y={POS.opcao(0)} quadro={T.toque} />
      </Celular>
    </Cena>
  );
};
