import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import {
  MEMBROS,
  PAUTA_JOVENS,
  VOTOS_JOVENS,
  contar,
  resultadoDa,
  rotuloDa,
} from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Navegador, Telao } from "../componentes/Molduras";
import { Cursor } from "../componentes/Interacao";
import {
  estiloEntrada,
  janela,
  mapa,
  mola,
  respirar,
} from "../componentes/movimento";
import { MEDIDA } from "../componentes/app/estilos";
import {
  ALTURA_CABECALHO_AGORA,
  Pagina,
  SecaoAgora,
} from "../componentes/app/Painel";
import { TelaoVotacao, corDaOpcao } from "../componentes/app/Telao";

const DURACAO = duracaoDa("C08-Resultado");
const ESCALA = 1000 / MEDIDA.larguraPainel;
const Y_ENCERRAR =
  MEDIDA.paginaTopo +
  1 +
  MEDIDA.secaoPad +
  MEDIDA.h2 +
  MEDIDA.h2Margem +
  ALTURA_CABECALHO_AGORA / 2;
const X_ENCERRAR = 610;
const T = { cursor: 22, clique: 48 };

const PLACAR = contar(PAUTA_JOVENS, VOTOS_JOVENS)
  .map((o) => `${o.rotulo}: ${o.votos}`)
  .join(" · ");
const LINHAS = [0, 1, 2, 3].map((membro) => {
  const voto = VOTOS_JOVENS.find((v) => v.membro === membro)!;
  return {
    nome: MEMBROS[membro],
    voto: rotuloDa(PAUTA_JOVENS, voto.opcao).toUpperCase(),
    cor: corDaOpcao(voto.opcao),
  };
});

export const C08Resultado: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const encerrar = janela(frame, T.clique + 2, T.clique + 12);
  const aproxima = janela(
    frame,
    T.clique + 24,
    T.clique + 90,
    theme.ease.inOut,
  );
  // encerrada, a lista de votos some do painel: a janela encolhe e o telão sobe junto
  const recolhe = janela(frame, T.clique + 2, T.clique + 16, theme.ease.inOut);
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Resultado na hora" />
      <Navegador
        x={40}
        y={400}
        largura={1000}
        altura={mapa(recolhe, 450, 330)}
        escala={ESCALA}
        style={estiloEntrada(mola(frame, fps, 4, "smooth"), 60, 0.96)}
      >
        <Pagina>
          <SecaoAgora
            agora={{
              tipo: "votacao",
              pauta: PAUTA_JOVENS,
              votaram: VOTOS_JOVENS.length,
              total: MEMBROS.length,
              placar: PLACAR,
              encerrar,
              resultado: resultadoDa(PAUTA_JOVENS, VOTOS_JOVENS),
              linhas: LINHAS,
            }}
          />
        </Pagina>
        <Cursor
          aparece={T.cursor}
          some={T.clique + 36}
          cliques={[T.clique]}
          pontos={[
            { f: T.cursor, x: 380, y: 230 },
            { f: T.clique - 2, x: X_ENCERRAR, y: Y_ENCERRAR },
          ]}
        />
      </Navegador>
      <Telao
        x={40}
        y={mapa(recolhe, 910, 790)}
        largura={1000}
        altura={620}
        brilho={janela(frame, T.clique + 8, T.clique + 24) * 0.6}
        style={{
          ...estiloEntrada(mola(frame, fps, 10, "smooth"), 60, 0.96),
          translate: `0px ${respirar(frame, 10, 2)}px`,
          scale: String(mapa(aproxima, 1, 1.05)),
        }}
      >
        <TelaoVotacao
          pauta={PAUTA_JOVENS}
          votos={VOTOS_JOVENS}
          inicioCascata={-1000}
          encerrarEm={T.clique + 4}
        />
      </Telao>
    </Cena>
  );
};
