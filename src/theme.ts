// Fonte única de cor, curva, mola e fonte do vídeo. Nenhum componente escreve hex,
// easing ou configuração de spring direto: tudo sai daqui.
// A paleta parte do app real (public/estilo.css do projeto comissao).
import { Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const theme = {
  cores: {
    // tema claro do app (painel e celular)
    fundo: "#f4f5f7",
    superficie: "#ffffff",
    borda: "#d5d9e0",
    texto: "#16181d",
    textoSuave: "#5a6170",
    destaque: "#1d4ed8", // A cor de destaque do vídeo: no máximo um elemento por quadro
    destaqueTexto: "#ffffff",
    neutro: "#e4e7ec",
    sim: "#15803d",
    nao: "#b91c1c",
    avisoFundo: "#fef3c7",
    avisoTexto: "#7c4a03",
    // telão (sempre escuro)
    telao: {
      fundo: "#0b0d11",
      superficie: "#161a22",
      borda: "#2a303b",
      texto: "#f4f6fa",
      textoSuave: "#a9b1c0",
      destaque: "#3b82f6",
      neutro: "#252a34",
    },
    // cores dos candidatos (--c1, --c2, --c3 do app)
    candidatos: ["#1d4ed8", "#b45309", "#7c3aed"],
    // peças que não existem no app: aparelho, papel da ata, cursor
    aparelho: "#101216",
    aparelhoAro: "#2b2f36",
    ilha: "#000000",
    papel: "#ffffff",
    tinta: "#000000",
    tintaSuave: "#333333",
    tintaFraca: "#555555",
    tabelaBorda: "#888888",
    tabelaCabecalho: "#eeeeee",
    branco: "#ffffff",
    camera: "#1a1c20",
    cameraBrilho: "#3a3f47",
  },
  // sombras e brilhos (rgba derivados da paleta acima)
  efeitos: {
    brilhoDestaque: "rgba(29, 78, 216, 0.45)",
    brilhoDestaqueFraco: "rgba(29, 78, 216, 0.18)",
    brilhoTelao: "rgba(59, 130, 246, 0.55)",
    manchaA: "rgba(29, 78, 216, 0.16)",
    manchaB: "rgba(59, 130, 246, 0.12)",
    sombraAparelho:
      "0 60px 120px -30px rgba(16, 24, 40, 0.45), 0 20px 40px -20px rgba(16, 24, 40, 0.35)",
    sombraJanela:
      "0 50px 100px -30px rgba(16, 24, 40, 0.35), 0 12px 30px -12px rgba(16, 24, 40, 0.25)",
    sombraTelao: "0 60px 120px -30px rgba(11, 13, 17, 0.6)",
    sombraPapel: "0 40px 80px -24px rgba(16, 24, 40, 0.4)",
    sombraDialogo: "0 20px 50px rgba(0, 0, 0, 0.35)",
    veuDialogo: "rgba(0, 0, 0, 0.35)",
    vinheta: "rgba(16, 24, 40, 0.16)",
    gradeTopo: "rgba(16, 24, 40, 0.05)",
    gradeBase: "rgba(16, 24, 40, 0.08)",
    reflexoTela: "rgba(255, 255, 255, 0.04)",
    sombraCursor: "0 3px 4px rgba(0, 0, 0, 0.3)",
    cursorContorno: "#ffffff",
    cursorCorpo: "#16181d",
    toque: "rgba(29, 78, 216, 0.28)",
    toqueAnel: "rgba(29, 78, 216, 0.55)",
  },
  fonte: fontFamily,
  raio: 12,
  // As curvas do vídeo. Linear é proibido.
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1), // entradas
    inOut: Easing.bezier(0.83, 0, 0.17, 1), // deslocamentos e câmera
    in: Easing.bezier(0.7, 0, 0.84, 0), // saídas
    suave: Easing.bezier(0.45, 0, 0.55, 1), // rolagem de tela
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 }, // botões, palavras
    smooth: { damping: 20, stiffness: 90, mass: 1 }, // blocos grandes
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 }, // selos e resultados
  },
} as const;
