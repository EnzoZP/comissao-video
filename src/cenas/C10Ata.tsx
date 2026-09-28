import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Navegador } from "../componentes/Molduras";
import { Cursor } from "../componentes/Interacao";
import {
  CLAMP,
  estiloEntrada,
  janela,
  mapa,
  mola,
} from "../componentes/movimento";
import { MEDIDA } from "../componentes/app/estilos";
import { Aviso, Pagina, SecaoDepois } from "../componentes/app/Painel";
import { Ata } from "../componentes/app/Ata";

const DURACAO = duracaoDa("C10-Ata");
const ESCALA = 1000 / MEDIDA.larguraPainel;
const Y_BOTOES =
  MEDIDA.paginaTopo +
  1 +
  MEDIDA.secaoPad +
  MEDIDA.h2 +
  MEDIDA.h2Margem +
  MEDIDA.botao / 2;
const X_PDF = 150;
const X_WORD = 370;

// Onde a folha para: no topo, no bloco da segunda pauta e no fim (assinaturas).
const ROLAGEM = { bloco2: 1150, fim: 1440 };
const T = {
  cursor: 18,
  pdf: 40,
  folha: 44,
  rola1: 88,
  rola1Fim: 138,
  rola2: 164,
  rola2Fim: 192,
  word: 196,
};
const TOPO_FOLHA = 870;

export const C10Ata: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const folha = mola(frame, fps, T.folha, "smooth");
  const rolagem = interpolate(
    frame,
    [T.rola1, T.rola1Fim, T.rola2, T.rola2Fim],
    [0, ROLAGEM.bloco2, ROLAGEM.bloco2, ROLAGEM.fim],
    { ...CLAMP, easing: theme.ease.suave },
  );
  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="Ata pronta no fim" />
      <Navegador
        x={40}
        y={400}
        largura={1000}
        altura={410}
        escala={ESCALA}
        style={estiloEntrada(mola(frame, fps, 4, "smooth"), 60, 0.96)}
      >
        <Pagina>
          <SecaoDepois />
        </Pagina>
        {frame >= T.word + 2 && (
          <Aviso
            texto="Ata copiada. Abra o documento no Word e cole (Ctrl+V)."
            p={mola(frame, fps, T.word + 2, "snappy")}
          />
        )}
        <Cursor
          aparece={T.cursor}
          cliques={[T.pdf, T.word]}
          pontos={[
            { f: T.cursor, x: 420, y: 200 },
            { f: T.pdf - 2, x: X_PDF, y: Y_BOTOES },
            { f: T.pdf + 18, x: 560, y: 130 },
            { f: T.word - 22, x: 560, y: 130 },
            { f: T.word - 2, x: X_WORD, y: Y_BOTOES },
          ]}
        />
      </Navegador>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: TOPO_FOLHA - 30,
          bottom: 0,
          overflow: "hidden",
          // a folha some suave na borda de cima, como numa janela de visualização
          maskImage: "linear-gradient(180deg, transparent 0px, black 30px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 130,
            top: 30 + mapa(folha, 1100, 0) - rolagem,
            opacity: Math.min(1, folha * 1.5),
          }}
        >
          <Ata
            realce1={janela(frame, T.folha + 26, T.folha + 42)}
            realce2={janela(frame, T.rola1Fim + 2, T.rola1Fim + 18)}
          />
        </div>
      </div>
    </Cena>
  );
};
