import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Acabamento, Fundo } from "../componentes/Camadas";
import {
  IconeCelular,
  IconeComputador,
  IconeTelao,
} from "../componentes/Icones";
import {
  estiloEntrada,
  janela,
  mapa,
  mola,
  respirar,
} from "../componentes/movimento";
import { Palco } from "./Palco";
import {
  type CenaTutorial,
  type VideoTutorial,
  SAIDA_DA_CENA,
  quadroDaMarca,
  quadrosDaCena,
} from "./tempo";

// Volume da trilha por baixo da narração: com 0,11 ela mede cerca de −30 LUFS (loudnorm sobre
// trilha-N.wav), uns 14 dB abaixo de uma voz em −16 LUFS.
export const VOLUME_TRILHA = 0.11;
// Volume da narração (public/tutorial/voz/<id da cena>.wav).
export const VOLUME_VOZ = 1;

const ICONES = {
  computador: IconeComputador,
  telao: IconeTelao,
  celular: IconeCelular,
};

// Abertura e fim de cada vídeo: título, subtítulo e, se houver, itens que entram na marca.
// O título já está inteiro no quadro 0: num app de mensagem esse quadro é a capa do vídeo.
const CartaoCena: React.FC<{ cena: CenaTutorial }> = ({ cena }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cartao = cena.cartao!;
  const assenta = mapa(janela(frame, 0, 30, theme.ease.out), 1.03, 1);
  // traço e subtítulo também já no quadro 0: a miniatura diz qual parte da série é
  const traco = mola(frame, fps, -40, "smooth");
  const sub = mola(frame, fps, -40, "smooth");
  return (
    <AbsoluteFill
      style={{
        fontFamily: theme.fonte,
        color: theme.cores.texto,
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${respirar(frame, 0, 3, 46)}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          marginTop: cartao.itens ? -120 : 0,
        }}
      >
        <div
          style={{
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            textAlign: "center",
            transform: `scale(${assenta})`,
          }}
        >
          {cartao.titulo}
        </div>
        <div
          style={{
            width: mapa(Math.min(1, traco), 0, 150),
            height: 10,
            borderRadius: 5,
            background: theme.cores.destaque,
          }}
        />
        <div
          style={{
            fontSize: 44,
            fontWeight: 500,
            color: theme.cores.textoSuave,
            ...estiloEntrada(sub, 24, 0.97),
          }}
        >
          {cartao.subtitulo}
        </div>
      </div>
      {cartao.itens ? (
        <div
          style={{
            position: "absolute",
            top: 640,
            display: "flex",
            gap: 48,
          }}
        >
          {cartao.itens.map((item, i) => {
            const quando = quadroDaMarca(cena, item.em);
            const p = mola(frame, fps, quando - 14 + i * 5, "smooth");
            const Icone = ICONES[item.icone];
            return (
              <div
                key={i}
                style={{
                  width: 420,
                  padding: "34px 26px",
                  borderRadius: 28,
                  background: theme.cores.superficie,
                  border: `1px solid ${theme.cores.borda}`,
                  boxShadow: theme.efeitos.sombraJanela,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                  fontSize: 36,
                  fontWeight: 700,
                  textAlign: "center",
                  ...estiloEntrada(p),
                }}
              >
                <Icone tamanho={120} />
                {item.texto}
              </div>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Uma cena: cartão ou palco, com uma saída curta nos últimos quadros (o respiro de 0,5 s). A
// última cena não sai: o último quadro fica parado na tela quando o vídeo acaba.
export const CenaDoTutorial: React.FC<{ cena: CenaTutorial; ultima?: boolean }> = ({
  cena,
  ultima = false,
}) => {
  const frame = useCurrentFrame();
  const duracao = quadrosDaCena(cena);
  const sai = ultima ? 0 : janela(frame, duracao - SAIDA_DA_CENA, duracao - 1, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai * 0.9 }}>
      {cena.cartao ? <CartaoCena cena={cena} /> : <Palco cena={cena} />}
      {/* a narração fica na cena, para tocar também na composição avulsa do Studio */}
      {cena.voz ? (
        <Html5Audio src={staticFile(`tutorial/voz/${cena.id}.wav`)} volume={VOLUME_VOZ} />
      ) : null}
    </AbsoluteFill>
  );
};

export const ComFundo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <Fundo />
    {children}
    <Acabamento />
  </AbsoluteFill>
);

export const TutorialVideo: React.FC<{ video: VideoTutorial; trilha: boolean }> = ({
  video,
  trilha,
}) => (
  <ComFundo>
    <Series>
      {video.cenas.map((cena, i) => (
        <Series.Sequence
          key={cena.id}
          name={cena.nome}
          durationInFrames={quadrosDaCena(cena)}
          premountFor={30}
        >
          <CenaDoTutorial cena={cena} ultima={i === video.cenas.length - 1} />
        </Series.Sequence>
      ))}
    </Series>
    {trilha ? (
      <Html5Audio
        src={staticFile(`tutorial/trilha-${video.numero}.wav`)}
        volume={VOLUME_TRILHA}
      />
    ) : null}
  </ComFundo>
);
