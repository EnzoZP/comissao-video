import React from "react";
import { theme } from "../../theme";
import {
  ATA,
  MEMBROS,
  PAUTA_JOVENS,
  PAUTA_TESOURARIA,
  VOTOS_JOVENS,
  VOTOS_TESOURARIA,
  type Pauta,
  type Voto,
  contar,
  ehSimNao,
  resultadoDa,
  rotuloDa,
} from "../../dados";

// Ata como o app monta para imprimir ou colar no Word: preto sobre branco, uma tabela
// Membro/Voto por pauta e as assinaturas. Tamanhos em px de vídeo (folha de 820 px).
const c = theme.cores;
const celula: React.CSSProperties = {
  border: `1px solid ${c.tabelaBorda}`,
  padding: "5px 10px",
  textAlign: "left",
  verticalAlign: "top",
};

const Bloco: React.FC<{
  n: number;
  pauta: Pauta;
  votos: Voto[];
  encerrada: string;
  realce: number;
}> = ({ n, pauta, votos, encerrada, realce }) => {
  const placar = contar(pauta, votos)
    .map((o) => `${o.rotulo}: ${o.votos}`)
    .join(" · ");
  // ordem dos membros: escolha do vídeo para a tabela ficar fácil de ler
  const ordenados = [...votos].sort((a, b) => a.membro - b.membro);
  return (
    <div style={{ margin: "0 0 30px" }}>
      <h2 style={{ fontSize: 25, margin: "0 0 8px", fontWeight: 700 }}>
        {n}. {pauta.cargo}
      </h2>
      <p style={{ margin: "0 0 5px" }}>
        <b>{ehSimNao(pauta) ? "Nome: " : "Nomes: "}</b>
        {pauta.candidatos.join(", ")}
      </p>
      <p style={{ margin: "0 0 5px" }}>
        <b>Resultado: </b>
        {/* marca-texto do vídeo (não existe na ata real) */}
        <span
          style={{
            backgroundImage: `linear-gradient(${theme.efeitos.brilhoDestaqueFraco}, ${theme.efeitos.brilhoDestaqueFraco})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${Math.min(1, realce) * 100}% 100%`,
            padding: "0 4px",
          }}
        >
          {resultadoDa(pauta, votos)} ({placar})
        </span>
      </p>
      <p style={{ margin: "0 0 12px", color: c.tintaSuave }}>
        Votaram: {votos.length} · Encerrada em {encerrada}
      </p>
      <table
        style={{ borderCollapse: "collapse", width: "100%", fontSize: 18 }}
      >
        <thead>
          <tr>
            <th
              style={{ ...celula, background: c.tabelaCabecalho, width: "45%" }}
            >
              Membro
            </th>
            <th style={{ ...celula, background: c.tabelaCabecalho }}>Voto</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((v) => (
            <tr key={v.membro}>
              <td style={celula}>{MEMBROS[v.membro]}</td>
              <td style={celula}>{rotuloDa(pauta, v.opcao)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Ata: React.FC<{ realce1: number; realce2: number }> = ({
  realce1,
  realce2,
}) => (
  <div
    style={{
      width: 820,
      boxSizing: "border-box",
      padding: "56px 60px 60px",
      background: c.papel,
      color: c.tinta,
      fontSize: 20,
      lineHeight: 1.35,
      borderRadius: 6,
      boxShadow: theme.efeitos.sombraPapel,
    }}
  >
    <h1 style={{ fontSize: 30, margin: "0 0 4px", fontWeight: 800 }}>
      Comissão de Nomeações — Resultado das votações
    </h1>
    <p style={{ margin: "0 0 28px", color: c.tintaSuave }}>
      {ATA.dia} · 2 votações · voto aberto
    </p>
    <Bloco
      n={1}
      pauta={PAUTA_JOVENS}
      votos={VOTOS_JOVENS}
      encerrada={ATA.encerradaJovens}
      realce={realce1}
    />
    <Bloco
      n={2}
      pauta={PAUTA_TESOURARIA}
      votos={VOTOS_TESOURARIA}
      encerrada={ATA.encerradaTesouraria}
      realce={realce2}
    />
    <div style={{ display: "flex", gap: "8%", marginTop: 70 }}>
      {["Secretário(a)", "Presidente"].map((papel) => (
        <div
          key={papel}
          style={{
            flex: 1,
            borderTop: `1px solid ${c.tinta}`,
            paddingTop: 6,
            textAlign: "center",
          }}
        >
          {papel}
        </div>
      ))}
    </div>
    <p style={{ margin: "34px 0 0", fontSize: 14, color: c.tintaFraca }}>
      Gerado pelo sistema de votação em {ATA.gerada}.
    </p>
  </div>
);
