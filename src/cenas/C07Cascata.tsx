import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { EU, MEMBROS, PAUTA_JOVENS, VOTOS_JOVENS } from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Celular, Telao } from "../componentes/Molduras";
import { Placar } from "../componentes/Placar";
import { estiloEntrada, mapa, mola, respirar } from "../componentes/movimento";
import { TelaoVotacao } from "../componentes/app/Telao";
import { CartaoVotacao, TelaApp } from "../componentes/app/Celular";

const DURACAO = duracaoDa("C07-Cascata");
// O voto do Paulo chega primeiro; o ritmo espaça a cascata para dar tempo de ler.
export const CASCATA_C07 = { inicio: 30, ritmo: 1.4 };

export const C07Cascata: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const celular = mola(frame, fps, 10, "smooth");
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Voto aberto: todos veem na hora" />
      <Telao
        x={40}
        y={420}
        largura={1000}
        altura={620}
        style={{
          ...estiloEntrada(mola(frame, fps, 4, "smooth"), 60, 0.96),
          translate: `0px ${respirar(frame, 10, 2)}px`,
        }}
      >
        <TelaoVotacao
          pauta={PAUTA_JOVENS}
          votos={VOTOS_JOVENS}
          inicioCascata={CASCATA_C07.inicio}
          ritmo={CASCATA_C07.ritmo}
        />
      </Telao>
      <Celular
        escala={0.95}
        x={60}
        y={1090}
        style={{
          opacity: Math.min(1, celular),
          translate: `${mapa(celular, -120, 0)}px ${respirar(frame, 30, 2)}px`,
        }}
      >
        <TelaApp saudacao={`Olá, ${MEMBROS[EU]}`}>
          <CartaoVotacao pauta={PAUTA_JOVENS} meuVoto="sim" escolha={1} />
        </TelaApp>
      </Celular>
      <Placar
        pauta={PAUTA_JOVENS}
        votos={VOTOS_JOVENS}
        inicioCascata={CASCATA_C07.inicio}
        ritmo={CASCATA_C07.ritmo}
        aparece={16}
        x={490}
        y={1120}
        largura={530}
      />
    </Cena>
  );
};
