import "./index.css";
import React from "react";
import { Composition, Folder } from "remotion";
import { ALTURA, CENAS, DURACAO_TOTAL, FPS, LARGURA, quadros } from "./roteiro";
import { COMPONENTES, ComCamadas, Video } from "./Video";

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

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Comissao"
      component={Video}
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
