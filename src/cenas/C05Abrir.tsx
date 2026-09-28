import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { ENTRADAS, PAUTA_JOVENS, VOTOS_JOVENS } from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Navegador, Telao } from "../componentes/Molduras";
import { Cursor } from "../componentes/Interacao";
import {
  CLAMP,
  estiloEntrada,
  janela,
  mapa,
  mola,
  respirar,
} from "../componentes/movimento";
import { MEDIDA } from "../componentes/app/estilos";
import { Pagina, SecaoPautas } from "../componentes/app/Painel";
import { TelaoEntrada, TelaoVotacao } from "../componentes/app/Telao";

const DURACAO = duracaoDa("C05-Abrir");
const ESCALA = 1000 / MEDIDA.larguraPainel;

// Botão "Abrir" no item da lista (px CSS): topo da seção + borda + padding + h2 + meio do item.
const Y_ABRIR =
  MEDIDA.paginaTopo +
  1 +
  MEDIDA.secaoPad +
  MEDIDA.h2 +
  MEDIDA.h2Margem +
  MEDIDA.itemLista / 2;
const X_ABRIR = 500;

const T = { cursor: 22, clique: 48 };

export const C05Abrir: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const troca = janela(frame, T.clique + 2, T.clique + 10);
  const sai = janela(frame, T.clique + 2, T.clique + 10, theme.ease.in);
  const brilho = interpolate(
    frame,
    [T.clique + 4, T.clique + 16, T.clique + 50],
    [0, 1, 0.2],
    {
      ...CLAMP,
      easing: theme.ease.out,
    },
  );
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="A secretaria abre a votação" />
      <Navegador
        x={40}
        y={400}
        largura={1000}
        altura={300}
        escala={ESCALA}
        style={estiloEntrada(mola(frame, fps, 4, "smooth"), 60, 0.96)}
      >
        <Pagina>
          <SecaoPautas
            itens={[
              {
                pauta: PAUTA_JOVENS,
                status: frame >= T.clique + 2 ? "aberta" : "pendente",
                anterior: "pendente",
                troca: frame >= T.clique + 2 ? troca : 1,
              },
            ]}
          />
        </Pagina>
        <Cursor
          aparece={T.cursor}
          some={T.clique + 40}
          cliques={[T.clique]}
          pontos={[
            { f: T.cursor, x: 300, y: 200 },
            { f: T.clique - 2, x: X_ABRIR, y: Y_ABRIR },
          ]}
        />
      </Navegador>
      <Telao
        x={40}
        y={770}
        largura={1000}
        altura={620}
        brilho={brilho}
        style={{
          ...estiloEntrada(mola(frame, fps, 10, "smooth"), 60, 0.96),
          translate: `0px ${respirar(frame, 10, 2)}px`,
        }}
      >
        {sai < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - sai,
              transform: `scale(${mapa(sai, 1, 0.97)})`,
            }}
          >
            <TelaoEntrada entradas={ENTRADAS} inicioCascata={-1000} />
          </div>
        )}
        {frame >= T.clique + 4 && (
          <TelaoVotacao
            pauta={PAUTA_JOVENS}
            votos={VOTOS_JOVENS}
            inicioCascata={Infinity}
            aparece={T.clique + 8}
          />
        )}
      </Telao>
    </Cena>
  );
};
