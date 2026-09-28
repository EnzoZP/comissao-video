import React from "react";
import { theme } from "../../theme";
import { type Pauta, ehSimNao } from "../../dados";
import { Caret, QrFalso } from "../Interacao";
import { mapa } from "../movimento";
import { MEDIDA, estilo } from "./estilos";

// Painel da secretaria (tema claro), redesenhado do painel.html real. Tudo em px CSS.
const c = theme.cores;

export const Pagina: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      padding: `${MEDIDA.paginaTopo}px ${MEDIDA.paginaPad}px 40px`,
      display: "flex",
      flexDirection: "column",
      gap: MEDIDA.gapSecao,
      fontSize: 16,
      lineHeight: 1.4,
      color: c.texto,
    }}
  >
    {children}
  </div>
);

export const PainelTopo: React.FC = () => (
  <h1
    style={{
      margin: 0,
      height: 30,
      fontSize: 24,
      lineHeight: "30px",
      fontWeight: 700,
    }}
  >
    Painel da secretaria
  </h1>
);

// ---------- Entrada pelo QR ----------
export const ALTURA_ENTRADA_FECHADA = 16 + 22 + 12 + 44.8 + 12 + 40 + 16 + 2;
export const ALTURA_ENTRADA_ABERTA = 16 + 22 + 12 + 140 + 16 + 2;

export const SecaoEntrada: React.FC<{
  abertura: number;
  entraram: number;
  total: number;
}> = ({ abertura, entraram, total }) => {
  const fechado = 1 - Math.min(1, abertura * 2.5);
  const aberto = (atraso: number) =>
    Math.min(1, Math.max(0, (abertura - atraso) * 2.2));
  return (
    <section
      style={{
        ...estilo.secao,
        height: mapa(abertura, ALTURA_ENTRADA_FECHADA, ALTURA_ENTRADA_ABERTA),
        position: "relative",
      }}
    >
      <h2 style={estilo.h2}>Entrada pelo QR</h2>
      {fechado > 0 && (
        <div style={{ opacity: fechado }}>
          <p style={{ ...estilo.suave, height: 44.8 }}>
            Fechada. Abra no início da reunião: o telão mostra um QR, e cada
            pessoa escaneia e toca no próprio nome.
          </p>
          <div style={{ marginTop: 12 }}>
            <span style={estilo.botaoPrimario}>Abrir entrada pelo QR</span>
          </div>
        </div>
      )}
      {abertura > 0 && (
        <div
          style={{
            position: "absolute",
            top: 16 + 22 + 12 + 1,
            left: 17,
            right: 17,
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 8,
              overflow: "hidden",
              border: `1px solid ${c.borda}`,
              opacity: aberto(0.1),
              transform: `scale(${mapa(aberto(0.1), 0.85, 1)})`,
            }}
          >
            <QrFalso tamanho={140} />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                lineHeight: `${MEDIDA.linha}px`,
                opacity: aberto(0.2),
                transform: `translateY(${mapa(aberto(0.2), 12, 0)}px)`,
              }}
            >
              Aberta: {entraram} de {total} entraram.
            </p>
            <p
              style={{
                ...estilo.suave,
                margin: "6px 0 8px",
                opacity: aberto(0.3),
                transform: `translateY(${mapa(aberto(0.3), 12, 0)}px)`,
              }}
            >
              O mesmo QR aparece no telão até você abrir a primeira votação.
              Quem entrou aparece na lista de membros.
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                opacity: aberto(0.4),
                transform: `translateY(${mapa(aberto(0.4), 12, 0)}px)`,
              }}
            >
              <span style={estilo.botao}>Mostrar o QR no telão de novo</span>
              <span style={estilo.botao}>Fechar entrada</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ---------- Votação agora ----------
export type Agora =
  | { tipo: "vazia" }
  | {
      tipo: "votacao";
      pauta: Pauta;
      votaram: number;
      total: number;
      placar: string;
      encerrar: number; // 0 = aberta, 1 = encerrada (transição)
      resultado: string;
      linhas: { nome: string; voto: string; cor: string }[];
    };

export const ALTURA_CABECALHO_AGORA = 19 + 4 + 26 + 4 + MEDIDA.linha;

export const SecaoAgora: React.FC<{ agora: Agora }> = ({ agora }) => {
  if (agora.tipo === "vazia") {
    return (
      <section style={estilo.secao}>
        <h2 style={estilo.h2}>Votação agora</h2>
        <p style={estilo.suave}>
          Nenhuma votação ainda. Abra uma pauta na lista abaixo.
        </p>
      </section>
    );
  }
  const { pauta, encerrar } = agora;
  return (
    <section style={estilo.secao}>
      <h2 style={estilo.h2}>Votação agora</h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: ALTURA_CABECALHO_AGORA,
        }}
      >
        <div>
          <p style={estilo.cargo}>{pauta.cargo}</p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 20.8,
              lineHeight: "26px",
              fontWeight: 800,
            }}
          >
            {ehSimNao(pauta)
              ? pauta.candidatos[0]
              : pauta.candidatos.join(" • ")}
          </p>
          <p style={{ ...estilo.suave, marginTop: 4 }}>
            {agora.votaram} de {agora.total} votaram · {agora.placar}
          </p>
        </div>
        <div style={{ position: "relative", width: 190, height: MEDIDA.botao }}>
          <span
            style={{
              ...estilo.botaoPrimario,
              position: "absolute",
              right: 0,
              top: 0,
              opacity: 1 - encerrar,
            }}
          >
            Encerrar votação
          </span>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: encerrar,
              transform: `translateY(${mapa(encerrar, 10, 0)}px)`,
            }}
          >
            <strong style={{ fontSize: 16 }}>{agora.resultado}</strong>
            <span style={estilo.botao}>Reabrir</span>
          </div>
        </div>
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: `${12 * (1 - encerrar)}px 0 0`,
          padding: 0,
          display: "grid",
          gap: 8,
          opacity: 1 - encerrar,
          maxHeight: mapa(1 - encerrar, 0, 400),
          overflow: "hidden",
        }}
      >
        {agora.linhas.map((l) => (
          <li
            key={l.nome}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 52,
              padding: "0 12px",
              border: `1px solid ${c.borda}`,
              borderRadius: 8,
            }}
          >
            <span>
              <strong>{l.nome}</strong> —{" "}
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 13.6,
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: l.cor,
                  color: c.branco,
                }}
              >
                {l.voto}
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: c.textoSuave }}>Registrar:</span>
              <span style={{ ...estilo.botao, height: 34 }}>Sim</span>
              <span style={{ ...estilo.botao, height: 34 }}>Não</span>
              <span style={{ ...estilo.botaoPerigo, height: 34 }}>Limpar</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

// ---------- Pautas ----------
export type StatusPauta = "pendente" | "aberta" | "encerrada";

export type ItemPauta = {
  pauta: Pauta;
  status: StatusPauta;
  entrada?: number; // 0→1: o item surgindo na lista
  troca?: number; // 0→1: mudança de status (etiqueta e botões)
  anterior?: StatusPauta;
};

export type FormPauta = {
  cargo: string;
  nomes: string;
  foco: "cargo" | "nomes" | null;
};

const ROTULO_STATUS: Record<StatusPauta, string> = {
  pendente: "a votar",
  aberta: "aberta",
  encerrada: "encerrada",
};

const Etiqueta: React.FC<{ status: StatusPauta }> = ({ status }) => (
  <span
    style={{
      ...estilo.etiqueta,
      ...(status === "aberta" ? { background: c.sim, color: c.branco } : {}),
    }}
  >
    {ROTULO_STATUS[status]}
  </span>
);

const Acoes: React.FC<{ status: StatusPauta }> = ({ status }) => (
  <span style={{ display: "flex", gap: 6 }}>
    {status === "pendente" && <span style={estilo.botaoPrimario}>Abrir</span>}
    {status === "aberta" && <span style={estilo.botaoPrimario}>Encerrar</span>}
    {status === "encerrada" && <span style={estilo.botao}>Reabrir</span>}
    {status !== "aberta" && <span style={estilo.botaoPerigo}>Remover</span>}
  </span>
);

const ItemDaLista: React.FC<{ item: ItemPauta }> = ({ item }) => {
  const entrada = item.entrada ?? 1;
  const troca = item.troca ?? 1;
  const antes = item.anterior ?? item.status;
  const camada = (status: StatusPauta, opacidade: number) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        opacity: opacidade,
      }}
    >
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <Etiqueta status={status} /> <strong>{item.pauta.cargo}</strong> —{" "}
        {item.pauta.candidatos.join(" • ")}
      </span>
      <Acoes status={status} />
    </div>
  );
  return (
    <li
      style={{
        position: "relative",
        height: MEDIDA.itemLista,
        boxSizing: "border-box",
        border: `1px solid ${c.borda}`,
        borderRadius: 8,
        opacity: Math.min(1, entrada),
        transform: `translateY(${mapa(entrada, -10, 0)}px) scale(${mapa(entrada, 0.97, 1)})`,
      }}
    >
      {troca < 1 && camada(antes, 1 - troca)}
      {camada(item.status, troca)}
    </li>
  );
};

const Campo: React.FC<{
  valor: string;
  placeholder: string;
  focado: boolean;
  altura: number;
  multilinha?: boolean;
}> = ({ valor, placeholder, focado, altura, multilinha }) => (
  <div
    style={{
      ...estilo.input,
      height: altura,
      alignItems: multilinha ? "flex-start" : "center",
      padding: multilinha ? "10px 12px" : "0 12px",
      whiteSpace: "pre-wrap",
      outline: focado ? `3px solid ${c.destaque}` : "none",
      outlineOffset: 2,
    }}
  >
    {valor ? (
      <span>
        {valor}
        <Caret visivel={focado} />
      </span>
    ) : (
      <span style={{ color: c.textoSuave, opacity: 0.75 }}>
        {focado && <Caret visivel />}
        {placeholder}
      </span>
    )}
  </div>
);

export const SecaoPautas: React.FC<{
  itens: ItemPauta[];
  form?: FormPauta;
}> = ({ itens, form }) => (
  <section style={estilo.secao}>
    <h2 style={estilo.h2}>Pautas</h2>
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gap: 8,
      }}
    >
      {itens.length === 0 ? (
        <li
          style={{
            height: MEDIDA.itemListaVazio,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            border: `1px solid ${c.borda}`,
            borderRadius: 8,
            color: c.textoSuave,
          }}
        >
          Nenhuma pauta cadastrada.
        </li>
      ) : (
        itens.map((item) => <ItemDaLista key={item.pauta.cargo} item={item} />)
      )}
    </ul>
    {form && (
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={estilo.rotulo}>Cargo</span>
          <Campo
            valor={form.cargo}
            placeholder="Ex.: Diretor de Jovens"
            focado={form.foco === "cargo"}
            altura={MEDIDA.input}
          />
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={estilo.rotulo}>Nome(s) — um por linha</span>
          <Campo
            valor={form.nomes}
            placeholder={
              "Um nome = votação Sim/Não\nDois ou mais = escolher um"
            }
            focado={form.foco === "nomes"}
            altura={MEDIDA.textarea}
            multilinha
          />
        </div>
        <div>
          <span style={estilo.botaoPrimario}>Adicionar pauta</span>
        </div>
      </div>
    )}
  </section>
);

// ---------- Depois da reunião ----------
export const SecaoDepois: React.FC = () => (
  <section style={estilo.secao}>
    <h2 style={estilo.h2}>Depois da reunião</h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <span style={estilo.botaoPrimario}>Gerar ata (PDF)</span>
      <span style={estilo.botao}>Copiar ata para o Word</span>
      <span style={estilo.botao}>Planilha (CSV)</span>
      <span style={estilo.botaoPerigo}>Apagar todas as pautas</span>
    </div>
    <p style={{ ...estilo.suave, marginTop: 12 }}>
      <em>Gerar ata</em> abre a janela de impressão: escolha “Salvar como PDF”.{" "}
      <em>Copiar para o Word</em> copia a ata com as tabelas; é só colar
      (Ctrl+V) no documento.
    </p>
  </section>
);

// Aviso amarelo do painel (mesma classe .aviso do app).
export const Aviso: React.FC<{ texto: string; p: number }> = ({ texto, p }) => (
  <div
    style={{
      position: "absolute",
      top: 12,
      left: MEDIDA.paginaPad,
      right: MEDIDA.paginaPad,
      background: c.avisoFundo,
      color: c.avisoTexto,
      padding: "12px 16px",
      borderRadius: theme.raio,
      fontWeight: 600,
      opacity: Math.min(1, p),
      transform: `translateY(${mapa(p, -16, 0)}px)`,
      zIndex: 10,
    }}
  >
    {texto}
  </div>
);
