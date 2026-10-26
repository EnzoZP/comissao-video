// Gera os dois PDFs do app em out/pdf/: divulgação (outras igrejas) e tutorial (secretária e membro).
//   node scripts/pdf/gerar-pdf.mjs           os dois PDFs
//   node scripts/pdf/gerar-pdf.mjs --png     também uma imagem por página, para conferir
// Cada página é conferida antes de imprimir: nada pode passar da borda dela, nenhum anel ou número
// pode cair fora da tela, e a fonte tem de ter carregado. Com problema, aquele PDF não é gravado.
import { chromium } from 'playwright';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIVULGACAO } from '../../pdf/divulgacao.mjs';
import { TUTORIAL } from '../../pdf/tutorial.mjs';
import { ALTURA, FORA_DO_RECORTE, LARGURA } from '../../pdf/montar.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const SAIDA = path.join(RAIZ, 'out/pdf');
const COM_PNG = process.argv.includes('--png');
const DOCUMENTOS = [
  { nome: 'divulgacao', titulo: 'Comissão de Nomeações — votação pelo celular', paginas: DIVULGACAO },
  { nome: 'tutorial', titulo: 'Comissão de Nomeações — guia da secretária e do membro', paginas: TUTORIAL },
];

const html = ({ titulo, paginas }) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=block">
<link rel="stylesheet" href="${pathToFileURL(path.join(RAIZ, 'pdf/estilo.css')).href}">
</head><body>${paginas.map((p) => p()).join('\n')}</body></html>`;

await mkdir(SAIDA, { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });
const problemas = [];
try {
  for (const doc of DOCUMENTOS) {
    const arquivo = path.join(SAIDA, `${doc.nome}.html`);
    const antes = FORA_DO_RECORTE.length;
    const problemasAntes = problemas.length;
    await writeFile(arquivo, html(doc));
    problemas.push(...FORA_DO_RECORTE.slice(antes).map((f) => `${doc.nome}: ${f}`));
    const pagina = await navegador.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: 2 });
    const falhas = [];
    pagina.on('requestfailed', (r) => falhas.push(`${r.url()} ${r.failure()?.errorText}`));
    pagina.on('pageerror', (e) => falhas.push(e.message));
    await pagina.goto(pathToFileURL(arquivo).href, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    // o número do rodapé é a posição da página no documento (a capa é a 1)
    await pagina.evaluate(() => document.querySelectorAll('.pagina').forEach((p, i) => {
      const num = p.querySelector('.rodape .num');
      if (num) num.textContent = String(i + 1);
    }));
    const inter = await pagina.evaluate(() => document.fonts.check('700 20px Inter'));
    if (!inter) problemas.push(`${doc.nome}: a fonte Inter não carregou`);
    // nada (fora das telas, que recortam de propósito) passa da borda da página
    const vazados = await pagina.evaluate(() => {
      const saida = [];
      document.querySelectorAll('.pagina').forEach((sec, i) => {
        const p = sec.getBoundingClientRect();
        sec.querySelectorAll('*').forEach((el) => {
          if (el.closest('.tela')) return;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          if (r.left < p.left - 1 || r.top < p.top - 1 || r.right > p.right + 1 || r.bottom > p.bottom + 1) {
            saida.push(`página ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> passa da borda`);
          }
        });
        if (sec.scrollHeight > sec.clientHeight + 1) saida.push(`página ${i + 1}: conteúdo mais alto que a página`);
      });
      return saida;
    });
    problemas.push(...vazados.map((v) => `${doc.nome} ${v}`), ...falhas.map((f) => `${doc.nome}: ${f}`));
    const n = await pagina.locator('.pagina').count();
    if (n !== doc.paginas.length) problemas.push(`${doc.nome}: ${n} páginas no HTML, ${doc.paginas.length} na lista`);
    if (COM_PNG) {
      const pasta = path.join(SAIDA, `${doc.nome}-png`);
      await rm(pasta, { recursive: true, force: true });
      await mkdir(pasta, { recursive: true });
      for (let i = 0; i < n; i++) {
        await pagina.locator('.pagina').nth(i).screenshot({ path: path.join(pasta, `${String(i + 1).padStart(2, '0')}.png`) });
      }
    }
    // com problema, o PDF anterior fica como estava: nada imperfeito por cima do aprovado
    if (problemas.length === problemasAntes) {
      await pagina.pdf({ path: path.join(SAIDA, `${doc.nome}.pdf`), width: `${LARGURA}px`, height: `${ALTURA}px`, printBackground: true });
      console.log(`${doc.nome}.pdf: ${n} páginas`);
    } else {
      console.log(`${doc.nome}.pdf: NÃO gerado (${problemas.length - problemasAntes} problemas)`);
    }
    await pagina.close();
  }
} finally {
  await navegador.close();
}
if (problemas.length) {
  console.error(`PROBLEMAS (${problemas.length}):\n  ${problemas.join('\n  ')}`);
  process.exitCode = 1;
}
