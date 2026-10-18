// O palco de uma cena com capturas: painel (no navegador), telão, celular ou folha impressa,
// cada um mostrando uma captura real, com câmera, cursor, toque, destaque, digitação e
// diálogo. Tudo é comandado pelos planos da cena, cada um preso a uma marca da fala:
//   T = quadro em que o visual do plano está completo (ver tempo.ts); troca de captura,
//       câmera e layout terminam em T;
//   clique ou toque perto do fim da frase, antes da troca do plano seguinte: o resultado de
//   uma ação só aparece na frase seguinte; o diálogo nativo aparece logo depois do clique.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import capturasJson from "./capturas.json";
import { theme } from "../theme";
import {
  BARRA_NAVEGADOR,
  Celular,
  Navegador,
  TELA,
  Telao,
} from "../componentes/Molduras";
import { Cursor, Toque } from "../componentes/Interacao";
import { janela, mapa, respirar, type Ponto } from "../componentes/movimento";
import {
  ConfirmaCelular,
  ConfirmaNavegador,
  JanelaImpressao,
} from "./DialogoNativo";
import { ALCANCE_DO_ANEL, Destaque, Rotulo } from "./Rotulo";
import {
  type Aparelho,
  type Caixa,
  type CenaTutorial,
  type Layout,
  type PlanoT,
  linhaDoTempo,
  TRANSICAO_LAYOUT,
  TROCA,
  momentosDoDialogo,
  proximoT,
  quadrosDaCena,
} from "./tempo";

// ---------------------------------------------------------------------------------------------
// Capturas

type Captura = {
  arquivo: string;
  aparelho: string;
  caminho?: string;
  largura: number;
  altura: number;
  dpr: number;
  alvos: Record<string, Caixa>;
  [campo: string]: unknown;
};
const CAPTURAS = capturasJson as unknown as Record<string, Captura>;
const DOMINIO = "comissao-votacao.vercel.app";

export const captura = (id: string): Captura => {
  const c = CAPTURAS[id];
  if (!c) throw new Error(`Captura inexistente: ${id}`);
  return c;
};

// "captura#alvo" → caixa em px CSS da captura.
export const alvo = (ref: string) => {
  const [id, nome] = ref.split("#");
  const c = captura(id);
  const caixa = c.alvos[nome];
  if (!caixa) throw new Error(`Alvo inexistente: ${ref}`);
  return { id, caixa };
};

// ---------------------------------------------------------------------------------------------
// Geometria dos aparelhos no vídeo (1920 × 1080). A faixa de baixo (y > 970) é do rótulo.

type Ret = { x: number; y: number; w: number; h: number };
const navegador = (x: number, y: number, w: number): Ret => ({
  x,
  y,
  w,
  h: w / 1.6 + BARRA_NAVEGADOR,
});
const telao = (x: number, y: number, w: number): Ret => ({
  x,
  y,
  w,
  h: (w * 9) / 16,
});
const LARGURA_CELULAR = TELA.largura + TELA.aro * 2;
const ALTURA_CELULAR = TELA.altura + TELA.aro * 2;
const celular = (x: number, y: number, escala: number): Ret => ({
  x,
  y,
  w: LARGURA_CELULAR * escala,
  h: ALTURA_CELULAR * escala,
});

const LAYOUTS: Record<Layout, Partial<Record<Aparelho, Ret>>> = {
  painel: { painel: navegador(250, 18, 1420) },
  telao: { telao: telao(160, 30, 1600) },
  celular: { celular: celular(736, 14, 1.08) },
  "painel+telao": {
    painel: navegador(40, 120, 1060),
    telao: telao(1110, 262, 780),
  },
  "celular+telao": {
    telao: telao(60, 140, 1240),
    celular: celular(1400, 50, 0.98),
  },
  "painel+celular": {
    painel: navegador(50, 60, 1280),
    celular: celular(1420, 50, 0.98),
  },
  folha: { folha: { x: 530, y: 24, w: 860, h: 940 } },
  "folha-larga": { folha: { x: 210, y: 24, w: 1500, h: 940 } },
};

// Janela visível do aparelho em px CSS da captura, e px de vídeo por px CSS (sem câmera).
const visorDe = (ap: Aparelho, c: Captura, r: Ret) =>
  ap === "folha"
    ? { vw: c.largura, vh: (r.h * c.largura) / r.w }
    : { vw: c.largura, vh: c.altura };
const escalaDe = (ap: Aparelho, c: Captura, r: Ret) =>
  ap === "celular" ? r.w / LARGURA_CELULAR : r.w / c.largura;

const ZOOM_MAXIMO: Record<Aparelho, number> = {
  painel: 1.9,
  telao: 1.5,
  celular: 1.7,
  folha: 2,
};

// ---------------------------------------------------------------------------------------------
// Linha do tempo da cena

const TRANSICAO = 14;

// Captura que o aparelho mostra quando o plano de índice i vale.
const idNoPlano = (planos: PlanoT[], i: number, ap: Aparelho) => {
  let id: string | undefined;
  for (let j = 0; j <= i; j++) {
    const v = planos[j][ap];
    if (v !== undefined) id = v;
  }
  return id;
};

type Camera = { z: number; tx: number; ty: number };

// Anel que passaria da borda do que a câmera mostra é recolhido para dentro dela, senão as laterais
// somem e sobram duas linhas soltas (alvo na largura toda da folha, por exemplo).
const dentroDoVisor = (
  caixa: Caixa,
  cam: Camera,
  visor: { vw: number; vh: number },
  margem: number,
): Caixa => {
  const x0 = Math.max(caixa.x, -cam.tx / cam.z + margem);
  const y0 = Math.max(caixa.y, -cam.ty / cam.z + margem);
  const x1 = Math.min(caixa.x + caixa.w, (visor.vw - cam.tx) / cam.z - margem);
  const y1 = Math.min(caixa.y + caixa.h, (visor.vh - cam.ty) / cam.z - margem);
  const cabe = x0 === caixa.x && y0 === caixa.y && x1 === caixa.x + caixa.w && y1 === caixa.y + caixa.h;
  // devolve a mesma caixa quando nada foi recolhido: quem chama sabe se o anel foi recolhido
  return cabe || x1 - x0 <= 8 || y1 - y0 <= 8 ? caixa : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

// Valor que vale no quadro f numa sequência de mudanças, cada uma com janela [inicio, fim].
const cameraNoQuadro = (
  f: number,
  passos: { inicio: number; fim: number; cam: Camera }[],
): Camera => {
  let cam = passos[0].cam;
  for (let k = 1; k < passos.length; k++) {
    const p = passos[k];
    if (p.inicio > f) break;
    const t = janela(f, p.inicio, p.fim, theme.ease.inOut);
    cam = {
      z: mapa(t, cam.z, p.cam.z),
      tx: mapa(t, cam.tx, p.cam.tx),
      ty: mapa(t, cam.ty, p.cam.ty),
    };
  }
  return cam;
};

// Zoom e deslocamento (px CSS) que põem a caixa no centro do visor, sem mostrar além da borda.
const cameraPara = (
  caixa: Caixa | null,
  zoom: number | undefined,
  visor: { vw: number; vh: number },
  c: Captura,
  maximo: number,
): Camera => {
  if (!caixa) return { z: 1, tx: 0, ty: 0 };
  const { vw, vh } = visor;
  const folga = 48;
  const cabe = Math.min(vw / (caixa.w + folga * 2), vh / (caixa.h + folga * 2));
  // o teto vale para o zoom calculado; o escrito no plano é decisão de enquadramento e passa
  const z = Math.max(1, zoom ?? Math.min(cabe, maximo));
  // alvo que não cabe no zoom pedido: alinha pelo começo (onde estão os rótulos e os nomes),
  // em vez de cortar as duas pontas
  const tx =
    (caixa.w + folga * 2) * z > vw
      ? -(caixa.x - folga) * z
      : vw / 2 - (caixa.x + caixa.w / 2) * z;
  const ty =
    (caixa.h + folga * 2) * z > vh
      ? -(caixa.y - folga) * z
      : vh / 2 - (caixa.y + caixa.h / 2) * z;
  return {
    z,
    tx: Math.min(0, Math.max(vw - c.largura * z, tx)),
    ty: Math.min(0, Math.max(vh - c.altura * z, ty)),
  };
};

// ---------------------------------------------------------------------------------------------
// Um aparelho

const ImagemDaCaptura: React.FC<{ id: string }> = ({ id }) => {
  const c = captura(id);
  return (
    <Img
      src={staticFile(c.arquivo)}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: c.largura,
        height: c.altura,
        maxWidth: "none", // o preflight do Tailwind poria max-width: 100%
      }}
    />
  );
};

const Tela: React.FC<{ ap: Aparelho; planos: PlanoT[]; ret: Ret; fim: number }> = ({
  ap,
  planos,
  ret,
  fim,
}) => {
  const f = useCurrentFrame();
  const trocas = planos
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p[ap] !== undefined);
  if (trocas.length === 0) return null;

  // captura atual: a da última troca que já começou; a anterior fica por baixo durante a troca
  let k = 0;
  for (let j = 1; j < trocas.length; j++) if (trocas[j].p.T - TROCA <= f) k = j;
  const atual = trocas[k].p;
  const idAtual = atual[ap] as string;
  const idAnterior = k > 0 ? (trocas[k - 1].p[ap] as string) : undefined;
  const mistura = k > 0 ? janela(f, atual.T - TROCA, atual.T) : 1;
  const c = captura(idAtual);
  const visor = visorDe(ap, c, ret);
  const escala = escalaDe(ap, c, ret);

  // câmera: troca de captura volta ao quadro inteiro, a não ser que o plano dê foco nela
  const passos: { inicio: number; fim: number; cam: Camera }[] = [];
  planos.forEach((p, i) => {
    const id = idNoPlano(planos, i, ap);
    if (id === undefined) return;
    const focoAqui = p.foco !== undefined && alvo(p.foco).id === id;
    if (p[ap] === undefined && !focoAqui) return;
    const cap = captura(id);
    const cam = cameraPara(
      focoAqui ? alvo(p.foco as string).caixa : null,
      p.zoom,
      visorDe(ap, cap, ret),
      cap,
      ZOOM_MAXIMO[ap],
    );
    passos.push({ inicio: passos.length ? p.T - TRANSICAO : 0, fim: p.T, cam });
  });
  const cam = cameraNoQuadro(f, passos);

  // cursor, toques, destaques, digitação e diálogos desta tela
  const trechos: { pontos: Ponto[]; cliques: number[]; some: number }[] = [];
  let pontos: Ponto[] = [];
  let cliques: number[] = [];
  const fecharTrecho = (some: number) => {
    if (pontos.length) trechos.push({ pontos, cliques, some });
    pontos = [];
    cliques = [];
  };
  const toques: React.ReactNode[] = [];
  const destaques: React.ReactNode[] = [];
  const dialogos: React.ReactNode[] = [];
  let digitacao: React.ReactNode = null;
  planos.forEach((p, i) => {
    const id = idNoPlano(planos, i, ap);
    if (!p.cursor && p[ap] !== undefined) fecharTrecho(p.T - TROCA - 10);
    if (p.cursor && alvo(p.cursor).id === id) {
      const { caixa } = alvo(p.cursor);
      const x = caixa.x + caixa.w * 0.62;
      const y = caixa.y + caixa.h * 0.72;
      // depois de uma confirmação no mesmo aparelho, o cursor só entra quando ela já fechou
      const anterior = planos[i - 1];
      const depoisDeDialogo = Boolean(anterior?.dialogo) && captura(anterior.dialogo!.captura).aparelho === ap;
      const entra = depoisDeDialogo
        ? Math.min(p.T - 3, Math.max(p.T - 8, momentosDoDialogo(planos, i - 1, ap, fim).sai + 6))
        : p.T - 24;
      if (pontos.length === 0) pontos.push({ f: entra, x: x + 160, y: y + 140 });
      else pontos.push({ f: p.T - 18, ...ultimoPonto(pontos) });
      pontos.push({ f: p.T - 2, x, y });
      if (p.acao !== undefined) cliques.push(p.acao);
    }
    if (p.toque && alvo(p.toque).id === id) {
      const { caixa } = alvo(p.toque);
      toques.push(
        <Toque
          key={`t${i}`}
          contraste
          x={caixa.x + caixa.w / 2}
          y={caixa.y + caixa.h / 2}
          quadro={p.acao ?? p.T + 8}
        />,
      );
    }
    if (p.destaque && alvo(p.destaque).id === id) {
      // pela câmera do próprio plano, já parada em T: com a do quadro, no meio da transição o anel
      // ora cabia, ora era recolhido, e a escala de entrada saltava
      const inteira = alvo(p.destaque).caixa;
      const camDoPlano = cameraNoQuadro(p.T, passos);
      const caixa = dentroDoVisor(inteira, camDoPlano, visor, ALCANCE_DO_ANEL / (escala * camDoPlano.z));
      destaques.push(
        <Destaque
          key={`d${i}`}
          caixa={caixa}
          cresce={caixa === inteira ? undefined : 1}
          completo={p[ap] !== undefined && i > 0 ? p.T + TROCA : p.T}
          sai={proximoT(planos, i, (q) => q[ap] !== undefined || q.destaque !== undefined) - TROCA - 10}
          escala={escala * cam.z}
        />,
      );
    }
    if (p.digitar && p === atual && alvo(p.digitar.alvo).id === id) {
      const fimDaDigitacao = Math.min(p.T + 34, proximoT(planos, i, () => true) - 4);
      digitacao = (
        <Digitacao
          de={p.digitar.de}
          caixa={alvo(p.digitar.alvo).caixa}
          inicio={p.T}
          fim={Math.max(p.T + 10, fimDaDigitacao)}
        />
      );
    }
    if (p.dialogo && captura(p.dialogo.captura).aparelho === ap) {
      const texto = String(captura(p.dialogo.captura)[p.dialogo.campo ?? "dialogo"] ?? "");
      if (!texto) throw new Error(`Diálogo vazio em ${p.dialogo.captura}`);
      const { aparece, confirma, sai } = momentosDoDialogo(planos, i, ap, fim);
      // com a confirmação aberta, o cursor sai de cena (o deste plano ou um que vinha de antes): o OK
      // se aperta como num toque
      if (pontos.length) fecharTrecho(aparece + 2);
      dialogos.push(
        ap === "celular" ? (
          <ConfirmaCelular
            key={`g${i}`}
            texto={texto}
            largura={visor.vw}
            altura={visor.vh}
            aparece={aparece}
            sai={sai}
            confirma={confirma}
          />
        ) : (
          <ConfirmaNavegador
            key={`g${i}`}
            texto={texto}
            largura={visor.vw}
            aparece={aparece}
            sai={sai}
            confirma={confirma}
          />
        ),
      );
    }
  });

  fecharTrecho(1e6);

  const conteudo = (
    <div
      style={{
        position: "relative",
        width: visor.vw,
        height: visor.vh,
        overflow: "hidden",
        // a cor de fundo da própria página: o esmaecimento das bordas vai para ela (no tema escuro, escuro)
        background: ap === "folha" ? theme.cores.papel : String(c.fundo ?? theme.cores.fundo),
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...bordasEsmaecidas(ap, cam, visor, c) }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: c.largura,
          height: c.altura,
          transformOrigin: "0 0",
          transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.z})`,
        }}
      >
        {idAnterior && mistura < 1 ? <ImagemDaCaptura id={idAnterior} /> : null}
        <div style={{ position: "absolute", inset: 0, opacity: mistura }}>
          <ImagemDaCaptura id={idAtual} />
        </div>
        {digitacao}
        {destaques}
        {trechos.map((t, i) => (
          <Cursor
            key={i}
            pontos={t.pontos}
            cliques={t.cliques}
            aparece={t.pontos[0].f}
            some={t.some}
            // dentro da câmera: cresce com o zoom de propósito, para o clique se ver de longe
            tamanho={28 / escala}
            contraste
          />
        ))}
        {toques}
      </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 0",
          // o alerta do celular já tem tamanho de leitura e ocupa a tela toda
          transform: ap === "celular" ? undefined : `scale(${Math.min(1.6, Math.max(1.25, cam.z))})`,
        }}
      >
        {dialogos}
      </div>
    </div>
  );

  if (ap === "painel") {
    return (
      <Navegador
        x={ret.x}
        y={ret.y}
        largura={ret.w}
        altura={ret.h}
        escala={escala}
        endereco={`${DOMINIO}${c.caminho ?? "/painel"}`}
      >
        {conteudo}
      </Navegador>
    );
  }
  if (ap === "celular") {
    return (
      <Celular escala={escala} x={ret.x} y={ret.y} escuro={atual.camera ? 1 : 0}>
        {atual.camera ? (
          <VisorDaCamera alvoRef={atual.camera} largura={visor.vw} altura={visor.vh} />
        ) : (
          conteudo
        )}
      </Celular>
    );
  }
  const escalado = (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transformOrigin: "0 0",
        transform: `scale(${escala})`,
      }}
    >
      {conteudo}
    </div>
  );
  if (ap === "telao") {
    const iMac = planos.findIndex((p) => p.janelaMac);
    const saiMac = iMac < 0 ? 0 : proximoT(planos, iMac, (q) => q.layout !== undefined || q.telao !== undefined) - TROCA;
    return (
      <Telao x={ret.x} y={ret.y} largura={ret.w} altura={ret.h}>
        {escalado}
        {iMac >= 0 ? <BarraMac aparece={planos[iMac].T - TRANSICAO} sai={saiMac} /> : null}
      </Telao>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: ret.x,
        top: ret.y,
        width: ret.w,
        height: ret.h,
        overflow: "hidden",
        borderRadius: 6,
        background: theme.cores.papel,
        boxShadow: theme.efeitos.sombraPapel,
      }}
    >
      {escalado}
    </div>
  );
};

// Com zoom, a borda do que a câmera mostra corta a página no meio das palavras: esmaecer uma
// faixa estreita em volta faz o corte parecer enquadramento, e não página quebrada.
// Só esmaece a borda em que a câmera corta a página; na borda natural da página não há corte.
const bordasEsmaecidas = (
  ap: Aparelho,
  cam: Camera,
  visor: { vw: number; vh: number },
  c: { largura: number; altura: number },
): React.CSSProperties => {
  // 32 px: bem abaixo da folga de 48 px que a câmera deixa em volta do alvo, que não esmaece
  const faixa = ap === "celular" ? 0 : 32 * Math.min(1, Math.max(0, (cam.z - 1) / 0.2));
  if (faixa < 0.5) return {};
  const esq = cam.tx < -1 ? faixa : 0;
  const dir = cam.tx > visor.vw - c.largura * cam.z + 1 ? faixa : 0;
  // no painel, o topo é a página rolada logo abaixo da barra do navegador, como no navegador de
  // verdade: esmaecer ali lavava o selo e os títulos encostados nela
  const cima = ap !== "painel" && cam.ty < -1 ? faixa : 0;
  const baixo = cam.ty > visor.vh - c.altura * cam.z + 1 ? faixa : 0;
  if (!esq && !dir && !cima && !baixo) return {};
  const g = (lado: string, a: number, b: number) =>
    `linear-gradient(${lado}, transparent 0, #000 ${a}px, #000 calc(100% - ${b}px), transparent 100%)`;
  const mascara = `${g("to right", esq, dir)}, ${g("to bottom", cima, baixo)}`;
  return {
    maskImage: mascara,
    WebkitMaskImage: mascara,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
};

// Barra de título de janela do Mac sobre o telão, com o anel no botão verde (tela cheia).
const BarraMac: React.FC<{ aparece: number; sai: number }> = ({ aparece, sai }) => {
  const f = useCurrentFrame();
  const entra = janela(f, aparece, aparece + TRANSICAO, theme.ease.out) * (1 - janela(f, sai, sai + TROCA));
  if (entra <= 0) return null;
  const bolinha = (cor: string, anel = false): React.ReactNode => (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: cor,
        boxShadow: anel ? `0 0 0 8px ${theme.cores.superficie}, 0 0 0 14px ${theme.cores.anel}, 0 0 26px 14px ${theme.efeitos.brilhoAnel}` : undefined,
      }}
    />
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 88,
        display: "flex",
        alignItems: "center",
        gap: 24,
        paddingLeft: 40,
        background: theme.cores.neutro,
        borderBottom: `1px solid ${theme.cores.borda}`,
        opacity: entra,
        transform: `translateY(${mapa(entra, -88, 0)}px)`,
      }}
    >
      {bolinha("#ff5f57")}
      {bolinha("#febc2e")}
      {bolinha("#28c840", janela(f, aparece + TRANSICAO, aparece + TRANSICAO + 6) > 0)}
    </div>
  );
};

const ultimoPonto = (pontos: Ponto[]) => ({
  x: pontos[pontos.length - 1].x,
  y: pontos[pontos.length - 1].y,
});

// A captura "vazia" por cima do campo, recolhida (de cima para baixo, ou da esquerda para a
// direita num campo de uma linha): o texto da captura preenchida aparece como digitado.
const Digitacao: React.FC<{ de: string; caixa: Caixa; inicio: number; fim: number }> = ({
  de,
  caixa,
  inicio,
  fim,
}) => {
  const f = useCurrentFrame();
  const t = janela(f, inicio, fim, theme.ease.inOut);
  if (t >= 1) return null;
  const c = captura(de);
  const linhaUnica = caixa.h < 60;
  const topo = linhaUnica ? caixa.y : caixa.y + caixa.h * t;
  const esquerda = linhaUnica ? caixa.x + caixa.w * t : caixa.x;
  const direita = c.largura - caixa.x - caixa.w;
  const baixo = c.altura - caixa.y - caixa.h;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: c.largura,
        height: c.altura,
        clipPath: `inset(${topo}px ${direita}px ${baixo}px ${esquerda}px)`,
      }}
    >
      <ImagemDaCaptura id={de} />
    </div>
  );
};

// Celular apontado para o QR do telão: a câmera mostra o QR e o aviso do endereço.
const VisorDaCamera: React.FC<{ alvoRef: string; largura: number; altura: number }> = ({
  alvoRef,
  largura,
  altura,
}) => {
  const f = useCurrentFrame();
  const { id, caixa } = alvo(alvoRef);
  const c = captura(id);
  const lado = largura * 0.72;
  const escala = lado / caixa.w;
  const topo = altura * 0.2;
  const esquerda = (largura - lado) / 2 + respirar(f, 0, 3, 18);
  const quina = (i: number): React.CSSProperties => ({
    position: "absolute",
    width: 46,
    height: 46,
    left: i % 2 === 0 ? esquerda - 22 : esquerda + lado - 24,
    top: i < 2 ? topo - 22 : topo + lado * (caixa.h / caixa.w) - 24,
    borderColor: theme.cores.avisoFundo,
    borderStyle: "solid",
    borderTopWidth: i < 2 ? 5 : 0,
    borderBottomWidth: i >= 2 ? 5 : 0,
    borderLeftWidth: i % 2 === 0 ? 5 : 0,
    borderRightWidth: i % 2 === 1 ? 5 : 0,
    borderRadius: 6,
  });
  return (
    <AbsoluteFill style={{ background: theme.cores.camera, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: esquerda,
          top: topo,
          width: lado,
          height: lado * (caixa.h / caixa.w),
          overflow: "hidden",
          borderRadius: 8,
        }}
      >
        <Img
          src={staticFile(c.arquivo)}
          style={{
            position: "absolute",
            left: -caixa.x * escala,
            top: -caixa.y * escala,
            width: c.largura * escala,
            height: c.altura * escala,
            maxWidth: "none",
          }}
        />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={quina(i)} />
      ))}
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: topo + lado * (caixa.h / caixa.w) + 48,
          padding: "12px 16px",
          borderRadius: 14,
          background: theme.cores.avisoFundo,
          color: theme.cores.avisoTexto,
          fontFamily: theme.fonte,
          fontSize: 17,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Abrir {DOMINIO}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Palco: aparelhos no layout do momento (andam na troca de layout), rótulo e impressão.

const ORDEM: Aparelho[] = ["folha", "telao", "painel", "celular"];

export const Palco: React.FC<{ cena: CenaTutorial }> = ({ cena }) => {
  const f = useCurrentFrame();
  const planos = React.useMemo(() => linhaDoTempo(cena), [cena]);
  const layouts = planos.filter((p) => p.layout !== undefined);
  if (layouts[0] !== planos[0]) {
    throw new Error(`${cena.id}: o primeiro plano tem de dizer o layout`);
  }
  let k = 0;
  for (let j = 1; j < layouts.length; j++) if (layouts[j].T - TRANSICAO_LAYOUT <= f) k = j;
  const para = LAYOUTS[layouts[k].layout as Layout];
  const de = k > 0 ? LAYOUTS[layouts[k - 1].layout as Layout] : para;
  const inicio = layouts[k].T - TRANSICAO_LAYOUT;
  const meio = inicio + TRANSICAO_LAYOUT / 2;
  const t = k > 0 ? janela(f, inicio, layouts[k].T, theme.ease.inOut) : 1;
  const saindo = k > 0 ? 1 - janela(f, inicio, meio, theme.ease.in) : 1;
  const entrando = k > 0 ? janela(f, meio, layouts[k].T, theme.ease.out) : 1;
  // algo se move nos primeiros quadros da cena, sem tirar nada do lugar
  const acomoda = mapa(janela(f, 0, 24, theme.ease.out), 1.012, 1);
  // janela de impressão aberta (0 a 1): a folha desliza para a esquerda e abre espaço para ela
  const janelasDeImpressao = planos.map((p, i) => {
    if (!p.impressao) return null;
    const aparece = p.T === 0 ? 0 : p.T - TRANSICAO;
    const sai = proximoT(planos, i, (q) => q.folha !== undefined || q.layout !== undefined) - TROCA;
    return { aparece, sai };
  });
  let impressao = 0;
  for (const j of janelasDeImpressao) {
    if (j) impressao = Math.max(impressao, janela(f, j.aparece - 6, j.aparece + 8, theme.ease.inOut) * (1 - janela(f, j.sai, j.sai + 10, theme.ease.inOut)));
  }

  return (
    <AbsoluteFill style={{ fontFamily: theme.fonte }}>
      <AbsoluteFill style={{ transform: `scale(${acomoda})` }}>
        {ORDEM.map((ap) => {
          const r0 = de[ap];
          const r1 = para[ap];
          if (!r0 && !r1) return null;
          const ret: Ret =
            r0 && r1
              ? {
                  x: mapa(t, r0.x, r1.x),
                  y: mapa(t, r0.y, r1.y),
                  w: mapa(t, r0.w, r1.w),
                  h: mapa(t, r0.h, r1.h),
                }
              : { ...((r1 ?? r0) as Ret) }; // cópia: o LAYOUTS é compartilhado entre quadros
          if (ap === "folha") ret.x -= 230 * impressao;
          const visivel = r0 && r1 ? 1 : r1 ? entrando : saindo;
          if (visivel <= 0) return null;
          return (
            <div
              key={ap}
              style={{
                position: "absolute",
                inset: 0,
                opacity: visivel,
                // sem respiração: em captura de tela, o micro-movimento faz o texto tremular e
                // custa bitrate em todos os quadros; o que se move é a câmera, nas trocas
                transform: `translateY(${(1 - visivel) * 40}px)`,
              }}
            >
              <Tela ap={ap} planos={planos} ret={ret} fim={quadrosDaCena(cena)} />
            </div>
          );
        })}
      </AbsoluteFill>
      {janelasDeImpressao.map((j, i) =>
        j ? <JanelaImpressao key={`i${i}`} x={1220} y={200} aparece={j.aparece} sai={j.sai} /> : null,
      )}
      {planos.map((p, i) => {
        if (!p.rotulo) return null;
        const anterior = planos.slice(0, i).some((q) => q.rotulo);
        return (
          <Rotulo
            key={`r${i}`}
            texto={p.rotulo}
            entra={anterior ? p.T - 10 : p.T - 14}
            sai={proximoT(planos, i, (q) => q.rotulo !== undefined) - 20}
          />
        );
      })}
    </AbsoluteFill>
  );
};
