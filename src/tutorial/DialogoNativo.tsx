import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { janela, mapa, mola } from "../componentes/movimento";

// Diálogos do navegador e do celular não saem em captura de tela; estes os redesenham com o
// texto exato que o app mostrou (gravado em capturas.json pelo script de captura).

const useEntrada = (aparece: number, sai: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = mola(frame, fps, aparece, "snappy");
  const saida = janela(frame, sai, sai + 6, theme.ease.in);
  return { p: Math.min(1, entra) * (1 - saida), entra };
};

// O OK "apertado" no quadro `aperta`: escurece, encolhe e solta o pulso laranja do clique.
const Apertado: React.FC<{ aperta?: number; children: React.ReactNode }> = ({ aperta, children }) => {
  const frame = useCurrentFrame();
  if (aperta === undefined || frame < aperta - 3) return <>{children}</>;
  // fica escuro durante o pulso (uns 0,4 s), para o aperto se ver também no meio do pulso
  const aperto = janela(frame, aperta - 3, aperta) * (1 - janela(frame, aperta + 10, aperta + 16));
  const onda = janela(frame, aperta, aperta + 16);
  return (
    <div style={{ position: "relative", transform: `scale(${1 - 0.06 * aperto})`, filter: `brightness(${1 - 0.3 * aperto})` }}>
      {children}
      {frame >= aperta ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: mapa(onda, 24, 88),
            height: mapa(onda, 24, 88),
            marginLeft: -mapa(onda, 12, 44),
            marginTop: -mapa(onda, 12, 44),
            borderRadius: "50%",
            border: `5px solid ${theme.cores.anel}`,
            // sem miolo: o botão escurecido aparece por dentro do pulso
            opacity: 1 - onda * onda,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};

const Botao: React.FC<{ primario?: boolean; children: React.ReactNode }> = ({
  primario,
  children,
}) => (
  <div
    style={{
      padding: "7px 18px",
      borderRadius: 18,
      fontSize: 14,
      fontWeight: 600,
      color: primario ? theme.cores.destaqueTexto : theme.cores.destaque,
      background: primario ? theme.cores.destaque : theme.cores.superficie,
      border: `1px solid ${primario ? theme.cores.destaque : theme.cores.borda}`,
    }}
  >
    {children}
  </div>
);

// confirm() do Chrome: caixa no alto da página, no sistema de px CSS do painel (1440 de
// largura).
export const ConfirmaNavegador: React.FC<{
  texto: string;
  largura: number;
  aparece: number;
  sai?: number;
  confirma?: number; // quadro em que o OK é apertado
}> = ({ texto, largura, aparece, sai = 1e6, confirma }) => {
  const { p, entra } = useEntrada(aparece, sai);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: (largura - 460) / 2,
        width: 460,
        padding: "20px 22px 16px",
        borderRadius: 10,
        background: theme.cores.superficie,
        boxShadow: theme.efeitos.sombraDialogo,
        fontFamily: theme.fonte,
        color: theme.cores.texto,
        opacity: p,
        transform: `translateY(${mapa(entra, -16, 0)}px) scale(${mapa(entra, 0.97, 1)})`,
        zIndex: 60,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
        comissao-votacao.vercel.app diz
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.45 }}>{texto}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 18,
        }}
      >
        <Botao>Cancelar</Botao>
        <Apertado aperta={confirma}>
          <Botao primario>OK</Botao>
        </Apertado>
      </div>
    </div>
  );
};

// confirm() no iPhone: alerta no meio da tela, com véu, em px CSS do celular (390 de largura).
export const ConfirmaCelular: React.FC<{
  texto: string;
  largura: number;
  altura: number;
  aparece: number;
  sai?: number;
  confirma?: number; // quadro em que o OK é tocado
}> = ({ texto, largura, altura, aparece, sai = 1e6, confirma }) => {
  const { p, entra } = useEntrada(aparece, sai);
  if (p <= 0) return null;
  const linha = `1px solid ${theme.cores.borda}`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: largura,
        height: altura,
        background: theme.efeitos.veuDialogo,
        opacity: p,
        zIndex: 60,
        fontFamily: theme.fonte,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: altura * 0.36,
          left: (largura - 270) / 2,
          width: 270,
          borderRadius: 14,
          background: theme.cores.superficie,
          color: theme.cores.texto,
          textAlign: "center",
          // sem overflow hidden: o pulso do OK passa da borda do alerta
          transform: `scale(${mapa(entra, 1.12, 1)})`,
        }}
      >
        <div style={{ padding: "20px 16px", fontSize: 17, fontWeight: 600 }}>
          {texto}
        </div>
        <div style={{ display: "flex", borderTop: linha, fontSize: 17 }}>
          <div
            style={{
              flex: 1,
              padding: "11px 0",
              borderRight: linha,
              color: theme.cores.destaque,
            }}
          >
            Cancelar
          </div>
          <div style={{ flex: 1 }}>
            <Apertado aperta={confirma}>
              <div
                style={{
                  padding: "11px 0",
                  fontWeight: 600,
                  color: theme.cores.destaque,
                }}
              >
                OK
              </div>
            </Apertado>
          </div>
        </div>
      </div>
    </div>
  );
};

// Janela de impressão do Chrome, ao lado da folha: o destino "Salvar como PDF" é o que a
// secretária escolhe. Em px de vídeo.
export const JanelaImpressao: React.FC<{
  x: number;
  y: number;
  aparece: number;
  sai?: number;
}> = ({ x, y, aparece, sai = 1e6 }) => {
  const { p, entra } = useEntrada(aparece, sai);
  if (p <= 0) return null;
  const campo: React.CSSProperties = {
    marginTop: 10,
    padding: "14px 18px",
    borderRadius: 10,
    border: `2px solid ${theme.cores.borda}`,
    fontSize: 26,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 560,
        padding: "34px 36px",
        borderRadius: 20,
        background: theme.cores.superficie,
        boxShadow: theme.efeitos.sombraJanela,
        fontFamily: theme.fonte,
        color: theme.cores.texto,
        opacity: p,
        transform: `translateX(${mapa(entra, 40, 0)}px)`,
      }}
    >
      <div style={{ fontSize: 38, fontWeight: 700, marginBottom: 26 }}>
        Imprimir
      </div>
      <div style={{ fontSize: 24, color: theme.cores.textoSuave }}>Destino</div>
      <div
        style={{
          ...campo,
          border: `3px solid ${theme.cores.destaque}`,
          fontWeight: 700,
        }}
      >
        Salvar como PDF
      </div>
      <div
        style={{ fontSize: 24, color: theme.cores.textoSuave, marginTop: 22 }}
      >
        Páginas
      </div>
      <div style={campo}>Todas</div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 14,
          marginTop: 34,
          fontSize: 26,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            padding: "12px 26px",
            borderRadius: 30,
            border: `2px solid ${theme.cores.borda}`,
            color: theme.cores.destaque,
          }}
        >
          Cancelar
        </div>
        <div
          style={{
            padding: "12px 30px",
            borderRadius: 30,
            // a cor de destaque fica no destino, que é o que a fala manda escolher
            background: theme.cores.texto,
            color: theme.cores.branco,
          }}
        >
          Salvar
        </div>
      </div>
    </div>
  );
};
