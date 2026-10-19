import "./index.css";
import React from "react";
import { Composition, Folder } from "remotion";
import { ALTURA, CENAS, DURACAO_TOTAL, FPS, LARGURA, quadros } from "./roteiro";
import { COMPONENTES, ComCamadas, Video, VideoComMusica } from "./Video";
import { ComFundo as ComFundoTutorial, CenaDoTutorial, TutorialVideo } from "./tutorial/Tutorial";
import {
  ALTURA as ALTURA_TUTORIAL,
  FPS as FPS_TUTORIAL,
  LARGURA as LARGURA_TUTORIAL,
  type VideoTutorial,
  type VozDaCena,
  quadrosDaCena,
  quadrosDoVideo,
  textoFalado,
} from "./tutorial/tempo";
import { V1 } from "./tutorial/v1-preparacao";
import { V2 } from "./tutorial/v2-reuniao";
import { V3 } from "./tutorial/v3-modos";
import { V4 } from "./tutorial/v4-depois";
import VOZ from "./tutorial/voz.json";

// Narração gravada de cada cena (scripts/tutorial/medir-voz.mjs): com ela, a cena dura o áudio e
// as marcas caem no ritmo da voz (tempo.ts).
// Fala mudada depois da gravação: erro alto, em vez de marcas fora do ritmo da voz.
const comVoz = (video: VideoTutorial): VideoTutorial => ({
  ...video,
  cenas: video.cenas.map((cena) => {
    // o JSON tipa os pares [palavra, quadro] como number[]; quem grava é o medir-voz.mjs
    const voz = (VOZ as unknown as Record<string, VozDaCena | undefined>)[cena.id];
    if (voz && voz.texto !== textoFalado(cena.fala)) {
      throw new Error(
        `${cena.id}: a fala mudou depois da gravação da voz. Grave de novo e rode scripts/tutorial/medir-voz.mjs`,
      );
    }
    return { ...cena, voz };
  }),
});

// Cada cena também vira uma composição própria, com fundo e acabamento, para abrir e
// ajustar sozinha no Studio. Montado uma vez, fora do render.
const CENAS_AVULSAS = CENAS.map((cena) => {
  const Componente = COMPONENTES[cena.id];
  const ComFundo: React.FC = () => (
    <ComCamadas>
      <Componente />
    </ComCamadas>
  );
  return { cena, ComFundo };
});

// Tutorial da secretária: quatro vídeos 1920 × 1080, cada um com as cenas avulsas numa
// subpasta (a duração de cada cena sai da narração, em tempo.ts).
const TUTORIAL = [V1, V2, V3, V4].map(comVoz).map((video) => ({
  video,
  Completo: (() => <TutorialVideo video={video} trilha />) as React.FC,
  cenas: video.cenas.map((cena) => ({
    cena,
    Avulsa: (() => (
      <ComFundoTutorial>
        <CenaDoTutorial cena={cena} />
      </ComFundoTutorial>
    )) as React.FC,
  })),
}));

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Tutorial">
      {TUTORIAL.map(({ video, Completo, cenas }) => (
        <React.Fragment key={video.id}>
          <Composition
            id={video.id}
            component={Completo}
            durationInFrames={quadrosDoVideo(video)}
            fps={FPS_TUTORIAL}
            width={LARGURA_TUTORIAL}
            height={ALTURA_TUTORIAL}
          />
          <Folder name={`${video.id}-cenas`}>
            {cenas.map(({ cena, Avulsa }) => (
              <Composition
                key={cena.id}
                id={cena.id}
                component={Avulsa}
                durationInFrames={quadrosDaCena(cena)}
                fps={FPS_TUTORIAL}
                width={LARGURA_TUTORIAL}
                height={ALTURA_TUTORIAL}
              />
            ))}
          </Folder>
        </React.Fragment>
      ))}
    </Folder>
    <Composition
      id="Comissao"
      component={Video}
      durationInFrames={DURACAO_TOTAL}
      fps={FPS}
      width={LARGURA}
      height={ALTURA}
    />
    <Composition
      id="ComissaoMusica"
      component={VideoComMusica}
      durationInFrames={DURACAO_TOTAL}
      fps={FPS}
      width={LARGURA}
      height={ALTURA}
    />
    <Folder name="Cenas">
      {CENAS_AVULSAS.map(({ cena, ComFundo }) => (
        <Composition
          key={cena.id}
          id={cena.id}
          component={ComFundo}
          durationInFrames={quadros(cena.segundos)}
          fps={FPS}
          width={LARGURA}
          height={ALTURA}
        />
      ))}
    </Folder>
  </>
);
