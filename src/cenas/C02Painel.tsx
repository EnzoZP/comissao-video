import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { MEMBROS, PAUTA_JOVENS } from "../dados";
import { Cena, TituloCena, duracaoDa } from "../componentes/Cena";
import { Navegador } from "../componentes/Molduras";
import { Cursor, digitado } from "../componentes/Interacao";
import { estiloEntrada, janela, mapa, mola } from "../componentes/movimento";
import { MEDIDA } from "../componentes/app/estilos";
import {
  ALTURA_ENTRADA_FECHADA,
  Pagina,
  PainelTopo,
  SecaoAgora,
  SecaoEntrada,
  SecaoPautas,
  type FormPauta,
} from "../componentes/app/Painel";

const DURACAO = duracaoDa("C02-Painel");
const ESCALA = 1000 / MEDIDA.larguraPainel;

// Posições (px CSS do painel) derivadas das alturas fixas das seções.
const X_CONTEUDO = MEDIDA.paginaPad + 1 + MEDIDA.secaoPad;
const TOPO_ENTRADA = MEDIDA.paginaTopo + 30 + MEDIDA.gapSecao;
const Y_BOTAO_QR =
  TOPO_ENTRADA +
  1 +
  MEDIDA.secaoPad +
  MEDIDA.h2 +
  MEDIDA.h2Margem +
  44.8 +
  12 +
  MEDIDA.botao / 2;
const TOPO_PAUTAS =
  TOPO_ENTRADA +
  ALTURA_ENTRADA_FECHADA +
  MEDIDA.gapSecao +
  90.4 +
  MEDIDA.gapSecao;
const TOPO_FORM =
  TOPO_PAUTAS +
  1 +
  MEDIDA.secaoPad +
  MEDIDA.h2 +
  MEDIDA.h2Margem +
  MEDIDA.itemListaVazio +
  12;
const Y_CARGO = TOPO_FORM + MEDIDA.rotulo + 4 + MEDIDA.input / 2;
const Y_NOMES =
  TOPO_FORM + MEDIDA.rotulo + 4 + MEDIDA.input + 10 + MEDIDA.rotulo + 4 + 32;
const Y_ADICIONAR =
  TOPO_FORM +
  (MEDIDA.rotulo + 4 + MEDIDA.input) +
  10 +
  (MEDIDA.rotulo + 4 + MEDIDA.textarea) +
  10 +
  MEDIDA.botao / 2;

const T = {
  cursor: 28,
  cliqueCargo: 50,
  digitaCargo: 54,
  cliqueNomes: 112,
  digitaNomes: 116,
  cliqueAdicionar: 168,
  cliqueQr: 212,
};

export const C02Painel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adicionada = frame >= T.cliqueAdicionar + 2;
  const form: FormPauta = adicionada
    ? { cargo: "", nomes: "", foco: null }
    : {
        cargo: digitado(frame, PAUTA_JOVENS.cargo, T.digitaCargo),
        nomes: digitado(frame, PAUTA_JOVENS.candidatos[0], T.digitaNomes),
        foco:
          frame >= T.cliqueNomes
            ? "nomes"
            : frame >= T.cliqueCargo
              ? "cargo"
              : null,
      };
  const abertura = janela(frame, T.cliqueQr + 2, T.cliqueQr + 26);
  const camera = janela(frame, 0, DURACAO, theme.ease.inOut);

  return (
    <Cena duracao={DURACAO}>
      <TituloCena texto="A secretaria cadastra a pauta" />
      <Navegador
        x={40}
        y={400}
        largura={1000}
        altura={1250}
        escala={ESCALA}
        style={{
          ...estiloEntrada(mola(frame, fps, 4, "smooth"), 80, 0.96),
          scale: String(mapa(camera, 1, 1.03)),
        }}
      >
        <Pagina>
          <PainelTopo />
          <SecaoEntrada
            abertura={abertura}
            entraram={0}
            total={MEMBROS.length}
          />
          <SecaoAgora agora={{ tipo: "vazia" }} />
          <SecaoPautas
            itens={
              adicionada
                ? [
                    {
                      pauta: PAUTA_JOVENS,
                      status: "pendente",
                      entrada: mola(
                        frame,
                        fps,
                        T.cliqueAdicionar + 2,
                        "snappy",
                      ),
                    },
                  ]
                : []
            }
            form={form}
          />
        </Pagina>
        <Cursor
          aparece={T.cursor}
          some={T.cliqueQr + 10}
          cliques={[
            T.cliqueCargo,
            T.cliqueNomes,
            T.cliqueAdicionar,
            T.cliqueQr,
          ]}
          pontos={[
            { f: T.cursor, x: 520, y: 330 },
            { f: T.cliqueCargo - 2, x: X_CONTEUDO + 420, y: Y_CARGO },
            { f: T.cliqueNomes - 16, x: X_CONTEUDO + 420, y: Y_CARGO },
            { f: T.cliqueNomes - 2, x: X_CONTEUDO + 420, y: Y_NOMES },
            { f: T.cliqueAdicionar - 18, x: X_CONTEUDO + 420, y: Y_NOMES },
            { f: T.cliqueAdicionar - 2, x: X_CONTEUDO + 132, y: Y_ADICIONAR },
            { f: T.cliqueQr - 26, x: X_CONTEUDO + 132, y: Y_ADICIONAR },
            { f: T.cliqueQr - 2, x: X_CONTEUDO + 176, y: Y_BOTAO_QR },
          ]}
        />
      </Navegador>
    </Cena>
  );
};
