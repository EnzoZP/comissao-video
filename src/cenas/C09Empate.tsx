import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import {
  EU,
  MEMBROS,
  PAUTA_TESOURARIA,
  VOTOS_TESOURARIA,
  resultadoDa,
} from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Celular, Telao, larguraCelular } from "../componentes/Molduras";
import { Placar } from "../componentes/Placar";
import { Toque } from "../componentes/Interacao";
import {
  estiloEntrada,
  janela,
  mapa,
  mola,
  respirar,
} from "../componentes/movimento";
import { TelaoVotacao } from "../componentes/app/Telao";
import { CartaoVotacao, POS, TelaApp } from "../componentes/app/Celular";

const DURACAO = duracaoDa("C09-Empate");
const GRANDE = 1.5;
const PEQUENO = 0.85;
const ESCOLHA = 1; // o Paulo vota na Fernanda Braga

const T = { toque: 44, encolhe: 70, telao: 76, cascata: 100, encerra: 176 };

export const C09Empate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = mola(frame, fps, 0, "smooth");
  const encolhe = janela(frame, T.encolhe, T.encolhe + 26, theme.ease.inOut);
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Empate na pauta de nomes" />
      {frame >= T.telao - 2 && (
        <>
          <Telao
            x={40}
            y={400}
            largura={1000}
            altura={620}
            style={{
              ...estiloEntrada(mola(frame, fps, T.telao, "smooth"), 60, 0.96),
              translate: `0px ${respirar(frame, 10, 2)}px`,
            }}
          >
            <TelaoVotacao
              pauta={PAUTA_TESOURARIA}
              votos={VOTOS_TESOURARIA}
              inicioCascata={T.cascata}
              aparece={T.telao + 4}
              encerrarEm={T.encerra}
            />
          </Telao>
          <Placar
            pauta={PAUTA_TESOURARIA}
            votos={VOTOS_TESOURARIA}
            inicioCascata={T.cascata}
            aparece={T.telao + 10}
            destaque={{
              texto: resultadoDa(PAUTA_TESOURARIA, VOTOS_TESOURARIA),
              em: T.encerra + 10,
            }}
            x={460}
            y={1100}
            largura={570}
          />
        </>
      )}
      <Celular
        escala={mapa(encolhe, GRANDE, PEQUENO)}
        x={mapa(encolhe, (1080 - larguraCelular(GRANDE)) / 2, 50)}
        y={mapa(encolhe, 400, 1090)}
        style={{
          opacity: Math.min(1, entra),
          translate: `0px ${mapa(entra, 160, 0)}px`,
        }}
      >
        <TelaApp saudacao={`Olá, ${MEMBROS[EU]}`}>
          <CartaoVotacao
            pauta={PAUTA_TESOURARIA}
            meuVoto={frame >= T.toque ? ESCOLHA : undefined}
            escolha={janela(frame, T.toque + 1, T.toque + 9)}
            entrada={(i) =>
              estiloEntrada(mola(frame, fps, 4 + i * 4, "snappy"), 16, 0.97)
            }
          />
        </TelaApp>
        <Toque x={POS.centroX} y={POS.opcao(ESCOLHA)} quadro={T.toque} />
      </Celular>
    </Cena>
  );
};
