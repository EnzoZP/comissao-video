// Capturas reais do app para o tutorial (secretária e membro).
//
// O app de verdade (../app, ao lado desta pasta) roda DENTRO deste processo: as páginas abrem no endereço de
// produção, para o QR e os textos mostrarem o endereço certo, mas todo pedido é atendido aqui
// (route.fulfill). Os handlers de api/ são chamados direto, contra o branch de teste do Neon
// cujo endereço vem de DATABASE_URL e TUTORIAL_ENDPOINT: no ambiente do comando ou num
// .env.tutorial (fora do git), se ele existir. Nada sai para a produção:
//   - outra origem é abortada, e o Chrome não resolve nome nenhum (MAP * ~NOTFOUND);
//   - os pedidos feitos pelo próprio script usam um host .invalid;
//   - o banco só é escrito depois da guarda: endpoint do branch, marcador que só existe nele e
//     nenhuma igreja além da de exemplo.
//
// Uso:
//   node scripts/tutorial/capturar.mjs --so-rotas   confere o roteamento, sem banco
//   DATABASE_URL='…' TUTORIAL_ENDPOINT=ep-… node scripts/tutorial/capturar.mjs
//                                                   zera o branch, monta a história e captura
//
// Saída (trocada de uma vez no fim): public/tutorial/capturas/<id>.png e
// src/tutorial/capturas.json, com a caixa de cada alvo em px CSS da captura.
import { chromium } from 'playwright';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const APP = path.resolve(RAIZ, '../app');
const PUBLICO = path.join(APP, 'public');
const ORIGEM = 'https://comissao-votacao.vercel.app';
const HOST_INTERNO = 'http://tutorial.invalid';
const ROTAS_API = new Set(['admin', 'dono', 'entrar', 'estado', 'votar']);
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};
const DESTINO_PNG = path.join(RAIZ, 'public/tutorial/capturas');
const DESTINO_JSON = path.join(RAIZ, 'src/tutorial/capturas.json');
const TEMPORARIO = path.join(RAIZ, 'public/tutorial/capturas.novas');

// Erros coletados de todas as páginas: qualquer um para a execução na próxima captura.
const erros = [];
let toleraQueda = false; // janela em que o painel fica "sem conexão" de propósito
function anotarErro(origem, texto) {
  // só a consulta do painel cai; erro de outra página continua sendo erro
  if (toleraQueda && /^painel (requestfailed|console)$/.test(origem)) return;
  erros.push(`${origem}: ${texto}`);
}
function conferirErros(onde) {
  if (erros.length) throw new Error(`Erro antes de "${onde}":\n  ${erros.join('\n  ')}`);
}

// ---------------------------------------------------------------------------------------------
// O app local

const modulos = new Map();
async function handler(nome, metodo) {
  if (!ROTAS_API.has(nome)) return null;
  if (!modulos.has(nome)) {
    modulos.set(nome, await import(pathToFileURL(path.join(APP, 'api', `${nome}.js`)).href));
  }
  return modulos.get(nome)[metodo] ?? null;
}

// Chama um handler como a Vercel chamaria. Usado pelas páginas (via rota) e pelo script.
async function chamarApi(nome, { metodo = 'POST', token, corpo, userAgent } = {}) {
  const h = await handler(nome, metodo);
  if (!h) return new Response(JSON.stringify({ erro: 'rota inexistente' }), { status: 404 });
  const headers = {};
  if (token) headers['x-token'] = token;
  if (corpo !== undefined) headers['content-type'] = 'application/json';
  if (userAgent) headers['user-agent'] = userAgent;
  const resposta = await h(
    new Request(`${HOST_INTERNO}/api/${nome}`, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
    }),
  );
  if (resposta.status >= 500) anotarErro(`api/${nome}`, `status ${resposta.status}`);
  return resposta;
}

// Atalho do script: POST com JSON, falha alto se não for 2xx.
async function api(nome, corpo, token) {
  const resposta = await chamarApi(nome, { token, corpo });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(`api/${nome} ${corpo?.acao ?? ''} → ${resposta.status} ${dados.erro ?? ''}`);
  }
  return dados;
}

async function estadoDe(token) {
  const resposta = await chamarApi('estado', { metodo: 'GET', token });
  if (!resposta.ok) throw new Error(`api/estado → ${resposta.status}`);
  return resposta.json();
}

async function arquivoPublico(caminho) {
  let relativo = decodeURIComponent(caminho);
  if (!path.extname(relativo)) relativo += '.html';
  const absoluto = path.resolve(PUBLICO, `.${relativo}`);
  if (!absoluto.startsWith(PUBLICO + path.sep)) return null;
  try {
    return { corpo: await readFile(absoluto), tipo: TIPOS[path.extname(absoluto)] ?? 'application/octet-stream' };
  } catch {
    return null;
  }
}

let quedaNoPainel = false; // simula o painel sem internet (cena "Sem conexão")

async function atender(route) {
  const pedido = route.request();
  const url = new URL(pedido.url());
  if (url.origin !== ORIGEM) {
    anotarErro('rota', `pedido para fora bloqueado: ${url.origin}${url.pathname}`);
    return route.abort('blockedbyclient');
  }
  if (url.pathname.startsWith('/api/')) {
    const cabecalhos = pedido.headers();
    if (quedaNoPainel && url.pathname === '/api/estado' && pedido.frame().page().url().includes('/painel')) {
      return route.abort('internetdisconnected');
    }
    const resposta = await chamarApi(url.pathname.slice(5), {
      metodo: pedido.method(),
      token: cabecalhos['x-token'],
      corpo: pedido.method() === 'GET' ? undefined : (pedido.postData() ?? undefined),
      userAgent: cabecalhos['user-agent'],
    });
    return route.fulfill({
      status: resposta.status,
      headers: { ...Object.fromEntries(resposta.headers), 'x-tutorial': 'local' },
      body: Buffer.from(await resposta.arrayBuffer()),
    });
  }
  if (url.pathname === '/') {
    return route.fulfill({ status: 307, headers: { location: '/painel', 'x-tutorial': 'local' } });
  }
  const arquivo = await arquivoPublico(url.pathname);
  if (!arquivo) {
    anotarErro('rota', `arquivo inexistente: ${url.pathname}`);
    return route.fulfill({ status: 404, body: 'não encontrado' });
  }
  return route.fulfill({
    status: 200,
    headers: { 'content-type': arquivo.tipo, 'cache-control': 'no-store', 'x-tutorial': 'local' },
    body: arquivo.corpo,
  });
}

// ---------------------------------------------------------------------------------------------
// Navegador e aparelhos

const APARELHOS = {
  painel: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  telao: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 },
  celular: { viewport: { width: 390, height: 790 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

// A reunião acontece à noite: o navegador mostra as horas num fuso em que agora são cerca de
// 19h30, para "entrou às…", a ata e o feedback não marcarem a madrugada da gravação. Só a
// exibição muda; o banco e as validades seguem o relógio real.
function fusoDaReuniao(agora = new Date()) {
  const horaUtc = agora.getUTCHours() + agora.getUTCMinutes() / 60;
  let deslocamento = Math.round(19.5 - horaUtc);
  if (deslocamento > 14) deslocamento -= 24;
  if (deslocamento < -12) deslocamento += 24;
  if (deslocamento === 0) return 'Etc/GMT';
  return `Etc/GMT${deslocamento > 0 ? '-' : '+'}${Math.abs(deslocamento)}`;
}
const FUSO = fusoDaReuniao();

async function abrirNavegador() {
  return chromium.launch({
    channel: 'chrome',
    args: ['--host-resolver-rules=MAP * ~NOTFOUND', '--disable-features=DnsOverHttps'],
  });
}

async function novoAparelho(navegador, tipo) {
  const contexto = await navegador.newContext({
    ...APARELHOS[tipo],
    locale: 'pt-BR',
    timezoneId: FUSO,
    colorScheme: 'light',
    serviceWorkers: 'block',
    acceptDownloads: false,
  });
  await contexto.route('**/*', atender);
  await contexto.addInitScript(() => {
    window.print = () => {};
  });
  return contexto;
}

// Cada página tem um único tratador de diálogo; o passo que espera um diálogo o anuncia antes
// do clique. Diálogo inesperado é erro (e é recusado, então a ação não acontece).
function vigiar(pagina, nome) {
  pagina.on('pageerror', (e) => anotarErro(`${nome} pageerror`, e.message));
  pagina.on('console', (m) => {
    if (m.type() === 'error') anotarErro(`${nome} console`, m.text());
  });
  pagina.on('requestfailed', (p) => anotarErro(`${nome} requestfailed`, `${p.url()} ${p.failure()?.errorText}`));
  pagina.on('response', (r) => {
    if (r.status() >= 500) anotarErro(`${nome} resposta`, `${r.status()} ${r.url()}`);
  });
  pagina.on('dialog', async (d) => {
    const esperado = pagina.dialogoEsperado;
    pagina.dialogoEsperado = null;
    if (!esperado) {
      anotarErro(`${nome} diálogo inesperado`, d.message());
      return d.dismiss();
    }
    if (!d.message().includes(esperado.trecho)) {
      anotarErro(`${nome} diálogo`, `esperava "${esperado.trecho}", veio "${d.message()}"`);
    }
    esperado.resolver(d.message());
    return esperado.aceitar ? d.accept(esperado.valor) : d.dismiss();
  });
}

// rotulo: a origem dos erros anotados (o celular de cada pessoa tem o seu)
async function novaPagina(contexto, nome, rotulo = nome) {
  const pagina = await contexto.newPage();
  vigiar(pagina, rotulo);
  pagina.aparelho = nome;
  return pagina;
}

// Anuncia o diálogo do próximo clique; devolve a promessa com o texto exato.
// O prazo corre desde o anúncio, que vem antes da captura e do clique: por isso é longo, e a
// promessa já nasce com um tratador (sem ele, uma rejeição antes do await derrubaria o processo).
function esperarDialogo(pagina, trecho, { aceitar = true, valor } = {}) {
  const promessa = new Promise((resolver, rejeitar) => {
    const relogio = setTimeout(() => {
      if (pagina.dialogoEsperado?.trecho === trecho) pagina.dialogoEsperado = null;
      rejeitar(new Error(`diálogo "${trecho}" não apareceu`));
    }, 60_000);
    pagina.dialogoEsperado = {
      trecho, aceitar, valor,
      resolver: (texto) => { clearTimeout(relogio); resolver(texto); },
    };
  });
  promessa.catch(() => {});
  return promessa;
}

// ---------------------------------------------------------------------------------------------
// Espera e captura

// Força a consulta do estado (o acompanhar() escuta visibilitychange) e espera a resposta.
async function atualizar(pagina) {
  const resposta = pagina.waitForResponse((r) => r.url().endsWith('/api/estado'), { timeout: 10_000 }).catch(() => null);
  await pagina.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await resposta;
}

// Espera o DOM ficar parado (o app redesenha a cada estado novo) por um instante.
async function quieto(pagina, ms = 350, max = 5000) {
  await pagina.evaluate(({ ms, max }) => new Promise((resolve) => {
    let espera;
    const pronto = () => { observador.disconnect(); clearTimeout(limite); resolve(); };
    const limite = setTimeout(pronto, max);
    const observador = new MutationObserver(() => { clearTimeout(espera); espera = setTimeout(pronto, ms); });
    observador.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    espera = setTimeout(pronto, ms);
  }), { ms, max });
}

async function doisQuadros(pagina) {
  await pagina.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

// Espera o seletor aparecer, atualizando a página enquanto isso (o estado pode chegar no
// próximo ciclo de polling).
async function ver(pagina, seletor, { timeout = 15_000 } = {}) {
  const fim = Date.now() + timeout;
  for (;;) {
    if (await pagina.locator(seletor).first().isVisible().catch(() => false)) return;
    if (Date.now() > fim) throw new Error(`${pagina.aparelho}: não apareceu ${seletor}`);
    await atualizar(pagina);
    await pagina.waitForTimeout(150);
  }
}

// Rola a janela para o topo do elemento ficar logo abaixo da barra fixa do painel.
async function rolar(pagina, seletor, topo = 72) {
  await pagina.locator(seletor).first().evaluate((el, t) => {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - t, behavior: 'instant' });
  }, topo);
}
// A coluna Pautas fica presa abaixo da barra e rola por dentro: rola a janela até a coluna
// prender e traz a linha para o meio dela.
async function mostrarNaColuna(pagina, seletor) {
  await rolar(pagina, '#pautas-sec');
  const janela = await pagina.evaluate(() => window.scrollY);
  await pagina.locator(seletor).first().evaluate((el, y) => {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    window.scrollTo({ top: y, behavior: 'instant' });
  }, janela);
}
async function rolarTopo(pagina) {
  await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

// Caixa de cada alvo, conferida: um só elemento, inteiro na tela e não coberto por outro.
// Alvo { sel, parcial: true } pode passar da tela (bloco grande): a caixa é recortada.
// Alvo { sel, uniao: true }: a caixa que junta todos os elementos (cada um conferido; com parcial, recortado).
async function medir(pagina, alvos) {
  const caixas = {};
  for (const [nome, spec] of Object.entries(alvos)) {
    const { sel, parcial = false, primeiro = false, uniao = false } = typeof spec === 'string' ? { sel: spec } : spec;
    if (uniao) {
      const n = await pagina.locator(sel).filter({ visible: true }).count();
      if (n < 2) throw new Error(`${pagina.aparelho}: alvo de união "${nome}" casou ${n} elementos`);
      const partes = [];
      for (let i = 0; i < n; i++) partes.push((await medir(pagina, { parte: { sel: `${sel} >> nth=${i}`, parcial } })).parte);
      const x = Math.min(...partes.map((p) => p.x)); const y = Math.min(...partes.map((p) => p.y));
      const x2 = Math.max(...partes.map((p) => p.x + p.w)); const y2 = Math.max(...partes.map((p) => p.y + p.h));
      caixas[nome] = { x, y, w: Math.round((x2 - x) * 10) / 10, h: Math.round((y2 - y) * 10) / 10 };
      continue;
    }
    const locator = pagina.locator(sel).filter({ visible: true });
    const quantos = await locator.count();
    if (quantos === 0 || (quantos > 1 && !primeiro)) {
      throw new Error(`${pagina.aparelho}: alvo "${nome}" (${sel}) casou ${quantos} elementos`);
    }
    const r = await locator.first().evaluate((el, parcialmente) => {
      const c = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let x = c.x; let y = c.y; let w = c.width; let h = c.height;
      const dentro = x >= -0.5 && y >= -0.5 && x + w <= vw + 0.5 && y + h <= vh + 0.5;
      if (parcialmente) {
        const x2 = Math.min(vw, x + w); const y2 = Math.min(vh, y + h);
        x = Math.max(0, x); y = Math.max(0, y); w = x2 - x; h = y2 - y;
      }
      // pointer-events: none (o QR do canto do telão) esconderia o elemento do elementFromPoint
      const todos = document.createElement('style');
      todos.textContent = '* { pointer-events: auto !important; }';
      document.head.append(todos);
      const alvo = document.elementFromPoint(x + w / 2, y + h / 2);
      todos.remove();
      const acerta = Boolean(alvo) && (alvo === el || el.contains(alvo) || (alvo.tagName === 'LABEL' && alvo.contains(el)));
      return { x, y, w, h, dentro, acerta };
    }, parcial);
    if (r.w < 1 || r.h < 1) throw new Error(`${pagina.aparelho}: alvo "${nome}" sem tamanho`);
    if (!parcial && !r.dentro) throw new Error(`${pagina.aparelho}: alvo "${nome}" passa da tela (${JSON.stringify(r)})`);
    if (!r.acerta) throw new Error(`${pagina.aparelho}: alvo "${nome}" coberto por outro elemento`);
    const arred = (n) => Math.round(n * 10) / 10;
    caixas[nome] = { x: arred(r.x), y: arred(r.y), w: arred(r.w), h: arred(r.h) };
  }
  return caixas;
}

const registro = {};
let pedidas = 0;

async function capturar(pagina, id, alvos = {}, extra = {}) {
  pedidas += 1;
  if (registro[id]) throw new Error(`captura repetida: ${id}`);
  conferirErros(id);
  const { viewport, deviceScaleFactor } = APARELHOS[pagina.aparelho];
  if (pagina.aparelho !== 'celular') await pagina.mouse.move(viewport.width - 3, viewport.height - 3);
  const arquivo = path.join(TEMPORARIO, `${id}.png`);
  let caixas;
  for (let tentativa = 1; ; tentativa += 1) {
    await quieto(pagina);
    await doisQuadros(pagina);
    try {
      const antes = await medir(pagina, alvos);
      await pagina.screenshot({ path: arquivo, animations: 'disabled' });
      caixas = await medir(pagina, alvos);
      if (JSON.stringify(antes) === JSON.stringify(caixas)) break;
      if (tentativa === 3) throw new Error(`${id}: a tela mudou durante a captura`);
    } catch (e) {
      // um redesenho no meio da medição solta o elemento; tenta de novo, depois desiste
      if (tentativa === 3) throw e;
    }
  }
  registro[id] = {
    arquivo: `tutorial/capturas/${id}.png`,
    aparelho: pagina.aparelho,
    caminho: new URL(pagina.url()).pathname, // para a barra de endereço do vídeo
    largura: viewport.width,
    altura: viewport.height,
    dpr: deviceScaleFactor,
    alvos: caixas,
    fundo: await pagina.evaluate(() => getComputedStyle(document.body).backgroundColor),
    ...extra,
  };
  console.log(`  ${String(pedidas).padStart(3)} ${id}`);
}

// ---------------------------------------------------------------------------------------------
// Banco: guarda e limpeza

async function prepararBanco() {
  // a conexão vem de .env.tutorial ou, sem o arquivo, das variáveis de ambiente do comando
  try {
    process.loadEnvFile(path.join(RAIZ, '.env.tutorial'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const { DATABASE_URL, TUTORIAL_ENDPOINT } = process.env;
  if (!DATABASE_URL || !TUTORIAL_ENDPOINT) throw new Error('faltam DATABASE_URL e TUTORIAL_ENDPOINT (.env.tutorial ou ambiente)');
  if (!new URL(DATABASE_URL).hostname.startsWith(`${TUTORIAL_ENDPOINT}.`)) {
    throw new Error('DATABASE_URL não aponta para o endpoint do branch do tutorial');
  }
  const { neon } = await import(pathToFileURL(path.join(APP, 'node_modules/@neondatabase/serverless/index.mjs')).href);
  const sql = neon(DATABASE_URL);
  const [guarda] = await sql.query(`
    select to_regclass('tutorial_marcador') is not null as marcador,
           (select count(*)::int from igrejas where nome <> 'Igreja Exemplo') as outras`);
  if (!guarda.marcador) throw new Error('banco sem o marcador do tutorial: não é o branch de teste');
  if (guarda.outras !== 0) throw new Error('banco com outras igrejas: não é o branch de teste');
  const tabelas = await sql.query(`
    select format('%I', c.relname) as nome from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and c.relname <> 'tutorial_marcador'`);
  await sql.query(`truncate ${tabelas.map((t) => t.nome).join(', ')} restart identity cascade`);
  const [{ igrejas }] = await sql.query('select count(*)::int as igrejas from igrejas');
  if (igrejas !== 0) throw new Error('a limpeza não zerou o banco');
  console.log(`banco zerado (${tabelas.length} tabelas), fuso das capturas ${FUSO}`);
  return sql;
}

// ---------------------------------------------------------------------------------------------
// Conferência do roteamento (sem banco)

async function conferirRotas() {
  const navegador = await abrirNavegador();
  try {
    const contexto = await novoAparelho(navegador, 'painel');
    const pagina = await contexto.newPage();
    const resposta = await pagina.goto(`${ORIGEM}/painel`);
    const marca = resposta?.headers()['x-tutorial'];
    const host = await pagina.evaluate(() => location.host);
    const login = await pagina.locator('#login').isVisible();
    const errosAntes = [...erros];
    erros.length = 0;
    const fora = await pagina.evaluate(() =>
      fetch('https://example.com/').then(() => 'passou', () => 'bloqueado'),
    );
    const anotadosFora = erros.filter((e) => e.includes('pedido para fora bloqueado')).length;
    erros.length = 0;

    const cru = await navegador.newContext();
    const paginaCrua = await cru.newPage();
    const semRota = {};
    for (const alvo of [ORIGEM, 'https://example.com']) {
      semRota[alvo] = await paginaCrua.goto(alvo).then(() => 'abriu', (e) => (e.message.includes('ERR_NAME_NOT_RESOLVED') ? 'nao-resolveu' : e.message.split('\n')[0]));
    }
    await cru.close();

    const resultado = { marca, host, login, errosAntes, fora, anotadosFora, semRota, fuso: FUSO };
    console.log(JSON.stringify(resultado, null, 2));
    const ok =
      marca === 'local' &&
      host === 'comissao-votacao.vercel.app' &&
      login &&
      errosAntes.length === 0 &&
      fora === 'bloqueado' &&
      anotadosFora === 1 &&
      Object.values(semRota).every((v) => v === 'nao-resolveu');
    console.log(ok ? 'ROTAS OK' : 'ROTAS FALHARAM');
    if (!ok) process.exitCode = 1;
  } finally {
    await navegador.close();
  }
}

// ---------------------------------------------------------------------------------------------
// A história

const MEMBROS = ['Ana', 'Bruno', 'Carla', 'Davi', 'Elisa', 'Fábio', 'Gabriela', 'Henrique', 'Isabel', 'João', 'Lívia', 'Marcos'];
const PAUTAS = ['Diretor de Música', 'Tesoureiro', 'Ministério Jovem', 'Escola Sabatina', 'Clube de Desbravadores', 'Ministério Pessoal', 'Diáconos', 'Comunicação'];

// Seletores do painel usados mais de uma vez.
const P = {
  barra: '#barra',
  agora: '#agora-sec',
  campoIndicado: '#agora input[aria-label="Nome indicado"]',
  colocar: '#agora button:has-text("Colocar em votação")',
  encerrar: '#agora button:has-text("Encerrar votação")',
  linhaDe: (nome) => `#agora ul.lista > li:has(strong:text-is("${nome}"))`,
  // a pauta começa pelo "Começar" da linha dela, na lista de Pautas
  comecarNa: (cargo) => `#pautas li:has-text("${cargo}") button:text-is("Começar")`,
  liberarCelular: '#agora .indicacao-celular button',
  filaMaos: '#agora .fila-mao-painel',
};

// Gaveta (<details>) aberta ou fechada; o painel só abre sozinho a da vez.
async function gaveta(pagina, id, aberta = true) {
  await pagina.evaluate(([i, a]) => { document.getElementById(i).open = a; }, [id, aberta]);
}

async function historia() {
  await prepararBanco();
  await rm(TEMPORARIO, { recursive: true, force: true });
  await mkdir(TEMPORARIO, { recursive: true });

  const adminToken = randomBytes(24).toString('base64url');
  process.env.ADMIN_TOKEN = adminToken;
  const senha = randomBytes(15).toString('base64url');
  const email = 'secretaria@exemplo.test';

  const { id: igrejaId } = await api('dono', { acao: 'igreja_criar', nome: 'Igreja Exemplo' }, adminToken);
  const { token: convite } = await api('dono', { acao: 'convite_gerar', igrejaId }, adminToken);

  const navegador = await abrirNavegador();
  try {
    const ctxPainel = await novoAparelho(navegador, 'painel');
    await ctxPainel.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ORIGEM });
    const painel = await novaPagina(ctxPainel, 'painel');
    const ctxTelao = await novoAparelho(navegador, 'telao');
    const telaoLink = await novaPagina(ctxTelao, 'telao');
    const ctxTelaoOutro = await novoAparelho(navegador, 'telao');
    const telao = await novaPagina(ctxTelaoOutro, 'telao');
    const celulares = {};
    const celular = async (nome) => {
      if (!celulares[nome]) celulares[nome] = await novaPagina(await novoAparelho(navegador, 'celular'), 'celular', `celular ${nome}`);
      return celulares[nome];
    };

    let tokenPainel = '';
    const lerTokenPainel = async () => {
      tokenPainel = await painel.evaluate(() => sessionStorage.getItem('token:painel') ?? localStorage.getItem('token:painel'));
      if (!tokenPainel) throw new Error('painel sem token');
    };
    const admin = (acao, corpo = {}) => api('admin', { acao, ...corpo }, tokenPainel);
    const estado = () => estadoDe(tokenPainel);
    const membroId = async (nome) => (await estado()).membrosAdmin.find((m) => m.nome === nome).id;
    // a pauta do cargo ainda sem resultado registrado; senão, a primeira com esse cargo
    const pautaId = async (cargo) => {
      const { pautas } = await estado();
      const doCargo = pautas.filter((p) => p.cargo === cargo);
      return (doCargo.find((p) => !p.decidida_em) ?? doCargo[0]).id;
    };
    let tokensMembros = {};
    const lerTokensMembros = async () => {
      const { membros } = await admin('membros_links');
      tokensMembros = Object.fromEntries(membros.map((m) => [m.nome, m.token]));
    };
    const entrarPeloQr = async (nome) => {
      const { entrada } = await estado();
      await api('entrar', { acao: 'membro_entrar', codigo: entrada.codigo, membroId: await membroId(nome) });
      await lerTokensMembros(); // entrar troca o token do membro
    };
    const votar = async (nome, corpo) => {
      const id = await pautaId(corpo.cargo);
      const { cargo, ...voto } = corpo;
      void cargo;
      await api('votar', { pautaId: id, ...voto }, tokensMembros[nome]);
    };
    const votos = async (cargo, mapa) => {
      for (const [nome, voto] of Object.entries(mapa)) {
        await votar(nome, { cargo, ...(typeof voto === 'string' ? { opcao: voto } : voto) });
      }
    };

    // A história segue a ordem da reunião; cada vídeo usa as capturas dela que lhe servem.
    // ======================================= PREPARAÇÃO ===================================
    console.log('Preparação');

    // Convite e conta
    await painel.goto(`${ORIGEM}/convite#${convite}`);
    await ver(painel, '#form-convite');
    const alvosConvite = {
      form: '#form-convite', nome: '#form-convite input[name=nome]', email: '#form-convite input[name=email]',
      senha: '#form-convite input[name=senha]', confirmacao: '#form-convite input[name=confirmacao]', criar: '#salvar',
    };
    await capturar(painel, 'convite-vazio', alvosConvite);
    await painel.fill('#form-convite input[name=nome]', 'Raquel');
    await painel.fill('#form-convite input[name=email]', email);
    await painel.fill('#form-convite input[name=senha]', senha);
    await painel.fill('#form-convite input[name=confirmacao]', senha);
    await painel.locator('#form-convite input[name=confirmacao]').blur();
    await capturar(painel, 'convite-preenchido', alvosConvite);
    await Promise.all([painel.waitForURL('**/painel'), painel.click('#salvar')]);
    await ver(painel, '#app');
    await ver(painel, '#link-lideres');
    await lerTokenPainel();
    await rolarTopo(painel);
    await capturar(painel, 'painel-inicio', {
      barra: P.barra, selo: '#selo-estado', sair: '#sair', tema: '#tema', agora: P.agora,
      pautas: '#pautas-sec', lideres: '#link-lideres', feedback: '#link-feedback',
      membros: '#barra button[data-ir="passo-membros"]', ajuda: '#barra button[data-ir="secao-ajuda"]',
    });

    // Sair e entrar de novo, lembrando
    await painel.click('#sair');
    await ver(painel, '#form-login');
    // uma consulta em curso no instante do Sair volta 401, e isso é o esperado
    erros.splice(0, erros.length, ...erros.filter((e) => !(e.startsWith('painel console') && e.includes('status of 401'))));
    const alvosLogin = {
      form: '#form-login', email: '#form-login input[name=email]', senha: '#form-login input[name=senha]',
      lembrar: '#form-login label:has(input[name=lembrar])', entrar: '#form-login button[type=submit]',
    };
    await capturar(painel, 'login-vazio', alvosLogin);
    await painel.fill('#form-login input[name=email]', email);
    await painel.fill('#form-login input[name=senha]', senha);
    await painel.locator('#form-login input[name=senha]').blur();
    await capturar(painel, 'login-digitado', alvosLogin);
    await painel.check('#form-login input[name=lembrar]');
    await capturar(painel, 'login-preenchido', alvosLogin);
    await painel.click('#form-login button[type=submit]');
    await ver(painel, '#app');
    await ver(painel, '#link-lideres');
    await lerTokenPainel();

    // Membros
    await rolar(painel, '#passo-membros');
    const alvosMembros = {
      secao: { sel: '#passo-membros', parcial: true }, aqui: '#passo-membros .selo-aqui',
      campo: '#form-membros textarea[name=nomes]', adicionar: '#form-membros button[type=submit]',
    };
    await capturar(painel, 'painel-membros-vazio', alvosMembros);
    await painel.fill('#form-membros textarea[name=nomes]', MEMBROS.join('\n'));
    // a caixa rola até o fim ao preencher: volta ao começo, para os primeiros nomes aparecerem
    await painel.locator('#form-membros textarea[name=nomes]').evaluate((el) => { el.scrollTop = 0; el.blur(); });
    await capturar(painel, 'painel-membros-digitados', alvosMembros);
    await painel.click('#form-membros button[type=submit]');
    await ver(painel, `#membros li:has-text("${MEMBROS.at(-1)}")`);
    await rolar(painel, '#passo-membros');
    await capturar(painel, 'painel-membros-lista', {
      lista: { sel: '#membros', parcial: true },
      ana: '#membros li:has-text("Ana")',
      copiar: '#membros li:has-text("Ana") button:has-text("Copiar link")',
      novo: '#membros li:has-text("Ana") button:has-text("Novo link")',
    });
    await lerTokensMembros();

    // Telão
    await gaveta(painel, 'preparacao');
    await rolar(painel, '#passo-telao');
    await capturar(painel, 'painel-telao-passo', { secao: '#passo-telao', gerar: '#novo-telao' });
    await painel.click('#novo-telao');
    await ver(painel, '#link-telao');
    await rolar(painel, '#passo-telao');
    await capturar(painel, 'painel-telao-link', {
      secao: '#passo-telao', abrir: '#link-telao', codigo: '#codigo-telao button:has-text("Gerar código")',
    });
    const { telaoToken } = await estado();
    await telaoLink.goto(`${ORIGEM}/telao#${telaoToken}`);
    await ver(telaoLink, '#telao:has-text("Aguardando a primeira pauta")');
    await capturar(telaoLink, 'telao-aguardando', { telao: '#telao' });
    await telaoLink.close();

    await painel.click('#codigo-telao button:has-text("Gerar código")');
    await ver(painel, '#codigo-telao .codigo-telao');
    await rolar(painel, '#passo-telao');
    await capturar(painel, 'painel-telao-codigo', { codigo: '#codigo-telao .codigo-telao', bloco: '#codigo-telao' });
    const codigoTelao = (await estado()).telaoCodigo;
    await telao.goto(`${ORIGEM}/telao`);
    await ver(telao, '.telao-codigo input');
    const alvosCodigoTelao = { campo: '.telao-codigo input', entrar: '.telao-codigo button' };
    await capturar(telao, 'telao-codigo-vazio', alvosCodigoTelao);
    await telao.fill('.telao-codigo input', codigoTelao);
    await capturar(telao, 'telao-codigo-digitado', alvosCodigoTelao);
    await telao.click('.telao-codigo button');
    await ver(telao, '#telao:has-text("Aguardando a primeira pauta")');

    // Quórum (gaveta Mais), para a tela do QR mostrar quantos faltam
    await gaveta(painel, 'mais');
    await rolar(painel, '#form-quorum', 300);
    await painel.fill('#quorum', '9');
    await painel.locator('#quorum').blur();
    await capturar(painel, 'painel-quorum', {
      form: '#form-quorum', campo: '#quorum', salvar: '#form-quorum button[type=submit]',
    });
    await painel.click('#form-quorum button[type=submit]');
    await ver(painel, '#status-quorum:has-text("Quórum 9")');
    await gaveta(painel, 'mais', false);

    // Entrada pelo QR
    await gaveta(painel, 'preparacao');
    await rolar(painel, '#passo-entrada');
    const dialogoEntrada = esperarDialogo(painel, 'Abrir a entrada pelo QR?');
    await capturar(painel, 'painel-entrada-fechada', {
      secao: '#passo-entrada', abrir: '#entrada button:has-text("Abrir entrada pelo QR")',
    });
    await painel.click('#entrada button:has-text("Abrir entrada pelo QR")');
    registro['painel-entrada-fechada'].dialogo = await dialogoEntrada;
    await ver(painel, '#entrada .qr-painel');
    await rolar(painel, '#passo-entrada');
    await capturar(painel, 'painel-entrada-aberta', {
      secao: { sel: '#passo-entrada', parcial: true }, qr: '#entrada .qr-painel', curto: '#entrada .codigo-curto',
    });
    await ver(telao, '.entrada-qr');
    const alvosQrTelao = {
      qr: '.entrada-qr', passos: '.entrada-passos', curto: '.entrada-curto', grade: '.entrada-grade', selo: '.topo .selo',
      quorum: '.entrada-quorum',
    };
    await capturar(telao, 'telao-qr-0', alvosQrTelao);

    const { entrada } = await estado();
    const ana = await celular('Ana');
    await ana.goto(`${ORIGEM}/entrar#${entrada.codigo}`);
    await ver(ana, 'button.candidato:text-is("Ana")');
    const dialogoAna = esperarDialogo(ana, 'Você é Ana?');
    await capturar(ana, 'celular-entrar-lista', { ana: 'button.candidato:text-is("Ana")', lista: { sel: '.opcoes', parcial: true } });
    await Promise.all([ana.waitForURL('**/votar'), ana.click('button.candidato:text-is("Ana")')]);
    registro['celular-entrar-lista'].dialogo = await dialogoAna;
    await ver(ana, '#conteudo:has-text("Aguardando a próxima votação")');
    await capturar(ana, 'celular-aguardando', { saudacao: '#saudacao', status: '#conteudo' });

    // alguém toca no nome da Carla por engano, num celular de verdade (o "sem acesso", adiante)
    const intruso = await celular('intruso');
    await intruso.goto(`${ORIGEM}/entrar#${entrada.codigo}`);
    await ver(intruso, 'button.candidato:text-is("Carla")');
    const dialogoIntruso = esperarDialogo(intruso, 'Você é Carla?');
    await Promise.all([intruso.waitForURL('**/votar'), intruso.click('button.candidato:text-is("Carla")')]);
    await dialogoIntruso;
    await ver(intruso, '#conteudo:has-text("Aguardando a próxima votação")');
    for (const nome of ['Davi', 'Elisa', 'Fábio', 'Gabriela', 'Henrique']) await entrarPeloQr(nome);
    await ver(telao, '.topo .selo:has-text("7 de 12")');
    await capturar(telao, 'telao-qr-7', alvosQrTelao);

    // Longe do telão: código curto no celular do Bruno
    const bruno = await celular('Bruno');
    await bruno.goto(`${ORIGEM}/entrar`);
    await ver(bruno, 'input[name=curto]');
    const alvosCurto = { campo: 'input[name=curto]', entrar: 'button:has-text("ENTRAR")' };
    await capturar(bruno, 'celular-codigo-vazio', alvosCurto);
    await bruno.fill('input[name=curto]', entrada.curto);
    await capturar(bruno, 'celular-codigo-digitado', alvosCurto);
    await bruno.click('button:has-text("ENTRAR")');
    await ver(bruno, 'button.candidato:text-is("Bruno")');
    await capturar(bruno, 'celular-curto-lista', { bruno: 'button.candidato:text-is("Bruno")', lista: { sel: '.opcoes', parcial: true } });
    const dialogoBruno = esperarDialogo(bruno, 'Você é Bruno?');
    await Promise.all([bruno.waitForURL('**/votar'), bruno.click('button.candidato:text-is("Bruno")')]);
    registro['celular-curto-lista'].dialogo = await dialogoBruno;
    await ver(bruno, '#conteudo:has-text("Aguardando a próxima votação")');
    await capturar(bruno, 'celular-curto-aguardando', { saudacao: '#saudacao', status: '#conteudo' });
    await lerTokensMembros();
    await ver(telao, '.topo .selo:has-text("8 de 12")');
    await capturar(telao, 'telao-qr-8', alvosQrTelao);

    // Nome errado: alguém entrou como Carla; a secretaria libera
    await painel.evaluate(() => { document.getElementById('caixa-membros').open = true; });
    await ver(painel, '#membros li:has-text("Bruno"):has-text("entrou")');
    await ver(painel, '#membros li:has-text("Carla") button:has-text("Liberar")');
    await rolar(painel, '#membros');
    const dialogoLiberar = esperarDialogo(painel, 'Liberar Carla?');
    await capturar(painel, 'painel-membros-liberar', {
      linha: '#membros li:has-text("Carla")', liberar: '#membros li:has-text("Carla") button:has-text("Liberar")',
    });
    await painel.click('#membros li:has-text("Carla") button:has-text("Liberar")');
    registro['painel-membros-liberar'].dialogo = await dialogoLiberar;
    // o celular de quem tocou no nome errado perde o acesso na próxima consulta
    await ver(intruso, '#aviso:has-text("não tem acesso")');
    // o 401 da consulta é justamente o que tira o acesso
    erros.splice(0, erros.length, ...erros.filter((e) => !(e.startsWith('celular intruso console') && e.includes('status of 401'))));
    await capturar(intruso, 'celular-sem-acesso', { aviso: '#aviso' });
    await intruso.close();
    const novato = await celular('Carla');
    await novato.goto(`${ORIGEM}/entrar#${entrada.codigo}`);
    await ver(novato, 'button.candidato:text-is("Carla")');
    await capturar(novato, 'celular-entrar-lista-depois', { carla: 'button.candidato:text-is("Carla")', lista: { sel: '.opcoes', parcial: true } });
    await entrarPeloQr('Carla');

    // Tema escuro, e de volta ao claro
    await rolarTopo(painel);
    await painel.click('#tema'); // claro → escuro
    await painel.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await capturar(painel, 'painel-tema-escuro', { tema: '#tema', barra: P.barra });
    await atualizar(telao);
    await telao.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await capturar(telao, 'telao-qr-escuro', alvosQrTelao);
    await painel.click('#tema'); // escuro → claro
    await painel.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await atualizar(telao);
    await telao.waitForFunction(() => document.documentElement.dataset.theme === 'light');

    // ======================================= A REUNIÃO ====================================
    console.log('A reunião');

    await rolarTopo(painel);
    await painel.evaluate(() => { document.getElementById('caixa-pauta-nova').open = true; });
    const alvosPautaNova = {
      coluna: { sel: '#pautas-sec', parcial: true }, campo: '#caixa-pauta-nova textarea[name=cargos]',
      adicionar: '#caixa-pauta-nova button[type=submit]',
    };
    await capturar(painel, 'painel-pautas-vazio', alvosPautaNova);
    await painel.fill('#caixa-pauta-nova textarea[name=cargos]', PAUTAS.join('\n'));
    await painel.locator('#caixa-pauta-nova textarea[name=cargos]').evaluate((el) => { el.scrollTop = 0; el.blur(); });
    await capturar(painel, 'painel-pautas-digitadas', alvosPautaNova);
    await painel.click('#caixa-pauta-nova button[type=submit]');
    await ver(painel, `#pautas li:has-text("${PAUTAS.at(-1)}")`);
    await ver(painel, P.comecarNa('Diretor de Música'));
    await rolarTopo(painel);
    await capturar(painel, 'painel-pautas-lista', {
      lista: { sel: '#pautas', parcial: true }, comecar: P.comecarNa('Diretor de Música'),
    });

    // As gavetas recolhidas, abaixo da mesa, e o "?" de um bloco
    for (const id of ['preparacao', 'depois', 'mais']) await gaveta(painel, id, false);
    await rolar(painel, '#preparacao', 300);
    await capturar(painel, 'painel-gavetas', {
      // só a primeira: a página não rola o bastante para as três caberem inteiras
      gavetas: '#preparacao > summary',
    });
    await rolarTopo(painel);
    await painel.click('#agora-sec button.ajuda');
    await ver(painel, '#ajuda-agora');
    await capturar(painel, 'painel-ajuda-bloco', { botao: '#agora-sec button.ajuda', texto: { sel: '#ajuda-agora', parcial: true } });
    await painel.click('#agora-sec button.ajuda');
    // Ajuda, na barra: desce até o WhatsApp, no fim de Mais
    await painel.click('#barra button[data-ir="secao-ajuda"]');
    await ver(painel, '#secao-ajuda');
    await rolar(painel, '#secao-ajuda', 300);
    await capturar(painel, 'painel-ajuda', { contato: '#secao-ajuda' });
    await gaveta(painel, 'mais', false);
    await rolarTopo(painel);

    for (const nome of ['Isabel', 'Lívia', 'Marcos']) await entrarPeloQr(nome);

    // Diretor de Música: indicações
    await painel.click(P.comecarNa('Diretor de Música'));
    await ver(painel, P.campoIndicado);
    await rolarTopo(painel);
    await capturar(painel, 'painel-indicacao-vazia', {
      agora: { sel: P.agora, parcial: true }, campo: P.campoIndicado,
      adicionar: '#agora form.form-indicado button[type=submit]',
    });
    await ver(telao, '#telao:has-text("Aguardando indicações")');
    await capturar(telao, 'telao-indicacao-vazia', { topo: '.topo', canto: '#qr-canto' });
    await painel.fill(P.campoIndicado, 'Paulo');
    await capturar(painel, 'painel-indicacao-digitando', { campo: P.campoIndicado });
    await painel.press(P.campoIndicado, 'Enter');
    await ver(painel, '#agora ul.lista-nomes li:has-text("Paulo")');
    await painel.locator(P.campoIndicado).blur();

    // Rute e Sérgio vêm do celular: a Ana indica pela tela, o Bruno pela API
    await rolarTopo(painel);
    await capturar(painel, 'painel-indicacao-liberar', { agora: { sel: P.agora, parcial: true }, liberar: P.liberarCelular });
    await painel.click(P.liberarCelular);
    await ver(painel, `${P.liberarCelular}:has-text("Fechar indicação pelo celular")`);
    await ver(ana, 'input[name=indicado]');
    const alvosIndicar = { campo: 'input[name=indicado]', indicar: 'form.form-indicado button[type=submit]' };
    await capturar(ana, 'celular-indicar', alvosIndicar);
    await ana.fill('input[name=indicado]', 'Rute');
    await ana.locator('input[name=indicado]').blur();
    await capturar(ana, 'celular-indicar-digitado', alvosIndicar);
    await ana.click('form.form-indicado button[type=submit]');
    await ver(ana, 'button:has-text("Tirar minha indicação")');
    await capturar(ana, 'celular-indicou', { tirar: 'button:has-text("Tirar minha indicação")', minha: '.minha-indicacao' });
    await api('votar', { acao: 'indicar', pautaId: await pautaId('Diretor de Música'), nome: 'Sérgio' }, tokensMembros.Bruno);
    await ver(painel, '#agora ul.lista-nomes li:has-text("Sérgio")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-indicacao-3', {
      lista: '#agora ul.lista-nomes', tirar: '#agora ul.lista-nomes li:has-text("Rute") button.tirar',
      legenda: '#agora ul.lista-nomes li:has-text("Rute") .legenda', fechar: P.liberarCelular,
      form: { sel: '#agora form.votar-indicacao', parcial: true },
    });
    await ver(telao, '.indicados:has-text("Sérgio")');
    await capturar(telao, 'telao-indicacao-3', {
      indicados: '.indicados', topo: '.topo', legenda: '.indicados li:has-text("Rute") .legenda',
    });

    // Pedir a palavra: a Ana levanta pela tela; Carla e Davi, pela API
    await ver(ana, '#mao button');
    await capturar(ana, 'celular-mao', { mao: '#mao button' });
    await ana.click('#mao button');
    await ver(ana, '#mao button:has-text("Baixar a mão")');
    await capturar(ana, 'celular-mao-levantada', { mao: '#mao button', posicao: '#mao p' });
    for (const nome of ['Carla', 'Davi']) await api('votar', { acao: 'mao_levantar' }, tokensMembros[nome]);
    await ver(telao, '#fila-mao:has-text("Davi")');
    await capturar(telao, 'telao-maos', { fila: '#fila-mao' });
    await ver(painel, `${P.filaMaos}:has-text("Davi")`);
    await rolarTopo(painel);
    await capturar(painel, 'painel-maos', {
      fila: P.filaMaos, falou: `${P.filaMaos} button[aria-label^="Ana já falou"]`,
      limpar: `${P.filaMaos} button:has-text("Limpar a fila")`,
    });
    await painel.click(`${P.filaMaos} button[aria-label^="Ana já falou"]`);
    await ver(painel, `${P.filaMaos}:not(:has-text("Ana"))`);
    await rolarTopo(painel);
    await capturar(painel, 'painel-maos-falou', { fila: P.filaMaos, limpar: `${P.filaMaos} button:has-text("Limpar a fila")` });
    await ver(ana, '#conteudo:has-text("Sérgio")');
    await capturar(ana, 'celular-indicacao', { cartao: '.cartao' });

    // Como votar
    await rolar(painel, '#agora form.votar-indicacao', 120);
    const alvosComoVotar = {
      form: '#agora form.votar-indicacao', modo: '#agora select[name=modo]',
      secreto: '#agora label:has(input[name=secreto])', colocar: P.colocar,
    };
    await capturar(painel, 'painel-como-votar', alvosComoVotar);
    await painel.uncheck('#agora input[name=secreto]');
    await capturar(painel, 'painel-como-votar-aberto', alvosComoVotar);
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);

    // Votação aberta
    await ver(ana, 'button.candidato:text-is("Sérgio")');
    await capturar(ana, 'celular-votacao-nomes', { sergio: 'button.candidato:text-is("Sérgio")', abster: 'button.abster', opcoes: '.opcoes' });
    await ana.click('button.candidato:text-is("Sérgio")');
    await ver(ana, '.status-voto:has-text("Seu voto")');
    await capturar(ana, 'celular-votou', { status: '.status-voto', sergio: 'button.candidato:text-is("Sérgio")' });
    await votos('Diretor de Música', {
      Bruno: 'Sérgio', Davi: 'Sérgio', Elisa: 'Sérgio', Gabriela: 'Sérgio', Isabel: 'Sérgio',
      Carla: 'Paulo', Fábio: 'Paulo', Henrique: 'Paulo', Marcos: 'Rute',
    });
    await ver(telao, '.grade .membro:has-text("Marcos") .voto:has-text("RUTE")');
    await capturar(telao, 'telao-votacao-aberta', { grade: '.grade', barras: '.barras' });
    await ver(painel, '#agora .faltam:has-text("Faltam 2")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-votacao-faltam', {
      faltam: '#agora .faltam', agora: { sel: P.agora, parcial: true },
    });
    await rolar(painel, P.linhaDe('João'), 300);
    await capturar(painel, 'painel-registrar-joao', {
      linha: P.linhaDe('João'), sergio: `${P.linhaDe('João')} .acoes button:text-is("Sérgio")`,
    });
    await painel.click(`${P.linhaDe('João')} .acoes button:text-is("Sérgio")`);
    await ver(telao, '.grade .membro:has-text("João") .secretaria');
    await ver(telao, '.contagem:has-text("11 de 12")');
    await capturar(telao, 'telao-registrado', { joao: '.grade .membro:has-text("João")', grade: '.grade' });
    await votar('Lívia', { cargo: 'Diretor de Música', opcao: 'Rute' });
    await ver(painel, '#agora .faltam-zero');
    await rolarTopo(painel);
    await capturar(painel, 'painel-votacao-todos', { todos: '#agora .faltam-zero', encerrar: P.encerrar });

    // Encerrar e registrar
    await painel.click(P.encerrar);
    await ver(telao, '.resultado-telao');
    await capturar(telao, 'telao-resultado-musica', { resultado: '.resultado-telao', barras: '.barras' });
    await ver(painel, '#agora .registro');
    await rolar(painel, '#agora .registro', 120);
    await capturar(painel, 'painel-registre', {
      caixa: '#agora .registro', cargo: '#agora select[aria-label="Cargo em Cargos e líderes"]',
      confirmar: '#agora .registro button:has-text("Confirmar eleito")',
    });
    await painel.click('#agora .registro button:has-text("Confirmar eleito")');
    await ver(painel, '#agora .registro.registrado');
    await rolar(painel, '#agora .registro', 120);
    await capturar(painel, 'painel-registrado', {
      registrado: '#agora .registro.registrado', desfazer: '#agora button:has-text("Desfazer registro")',
    });
    await rolarTopo(painel);
    await capturar(painel, 'painel-proxima-lista', {
      lista: { sel: '#pautas', parcial: true }, comecar: P.comecarNa('Tesoureiro'),
    });

    // Tesoureiro: Sim ou Não, com o QR para quem chegou atrasado e a abstenção da Ana
    await painel.click(P.comecarNa('Tesoureiro'));
    await ver(painel, P.campoIndicado);
    await painel.fill(P.campoIndicado, 'Rute');
    await painel.press(P.campoIndicado, 'Enter');
    await ver(painel, '#agora ul.lista-nomes li:has-text("Rute")');
    await painel.uncheck('#agora input[name=secreto]');
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await ver(ana, '.opcoes button:text-is("Sim")');
    await capturar(ana, 'celular-simnao', { sim: '.opcoes button:text-is("Sim")', nao: '.opcoes button:text-is("Não")', abster: 'button.abster' });
    await votos('Tesoureiro', { Bruno: 'sim', Carla: 'sim', Davi: 'nao', Elisa: 'sim', Fábio: 'sim' });
    await ver(telao, '.grade .membro:has-text("Fábio") .voto:has-text("SIM")');
    await capturar(telao, 'telao-simnao-aberta', { grade: '.grade', barras: '.barras', canto: '#qr-canto' });

    await rolar(painel, '#agora .qr-telao button:has-text("Mostrar o QR no telão")', 500);
    await capturar(painel, 'painel-qr-atrasado', { mostrar: '#agora .qr-telao button:has-text("Mostrar o QR no telão")' });
    await painel.click('#agora .qr-telao button:has-text("Mostrar o QR no telão")');
    await ver(painel, '#agora .qr-telao-ligado');
    await rolarTopo(painel);
    await capturar(painel, 'painel-qr-ligado', {
      faixa: '#agora .qr-telao-ligado', voltar: '#agora button:has-text("Voltar à votação no telão")',
    });
    await ver(telao, '.entrada-qr');
    await capturar(telao, 'telao-qr-atrasado', alvosQrTelao);
    await entrarPeloQr('João');
    await painel.click('#agora button:has-text("Voltar à votação no telão")');
    await ver(telao, '.grade .membro:has-text("Fábio") .voto:has-text("SIM")');

    await ana.click('button.abster');
    await ver(ana, 'button.abster:has-text("VOCÊ SE ABSTEVE")');
    await capturar(ana, 'celular-abstencao', { abster: 'button.abster', status: '.status-voto' });
    await ver(telao, '.grade .membro:has-text("Ana") .voto:has-text("ABSTEVE-SE")');
    await ver(telao, '.contagem:has-text("6 de 12")');
    await capturar(telao, 'telao-abstencao', { ana: '.grade .membro:has-text("Ana")', contagem: '.contagem' });
    await ver(painel, '#agora:has-text("6 de 12 votaram")');
    await rolar(painel, P.linhaDe('Marcos'), 300);
    await capturar(painel, 'painel-registrar-abstencao', {
      linha: P.linhaDe('Marcos'), abstencao: `${P.linhaDe('Marcos')} .acoes button:text-is("Abstenção")`,
    });
    await votos('Tesoureiro', { Gabriela: 'sim', Henrique: 'sim', Isabel: 'nao', João: 'sim', Lívia: 'sim', Marcos: 'sim' });
    await ver(painel, '#agora .faltam-zero');
    await painel.click(P.encerrar);
    await ver(telao, '.resultado-telao:has-text("APROVADO")');
    await capturar(telao, 'telao-aprovado', { resultado: '.resultado-telao', barras: '.barras' });
    await ver(painel, '#agora .registro button:has-text("Confirmar eleito")');
    await painel.click('#agora .registro button:has-text("Confirmar eleito")');
    await ver(painel, '#agora .registro.registrado');

    // Deixar para depois: a Comunicação, da lista
    await mostrarNaColuna(painel, '#pautas li:has-text("Comunicação")');
    await painel.click(P.comecarNa('Comunicação'));
    await ver(painel, P.campoIndicado);
    await ver(painel, '#agora:has-text("Comunicação")');
    for (const nome of ['Vítor', 'Yara']) {
      await painel.fill(P.campoIndicado, nome);
      await painel.press(P.campoIndicado, 'Enter');
      await ver(painel, `#agora ul.lista-nomes li:has-text("${nome}")`);
    }
    await painel.locator(P.campoIndicado).blur();
    await rolar(painel, '#agora form.votar-indicacao', 300);
    const dialogoAdiar = esperarDialogo(painel, 'Deixar esta pauta para depois?');
    await capturar(painel, 'painel-indicacao-adiar', { adiar: '#agora form.votar-indicacao button:has-text("Deixar para depois")' });
    await painel.click('#agora form.votar-indicacao button:has-text("Deixar para depois")');
    registro['painel-indicacao-adiar'].dialogo = await dialogoAdiar;
    await ver(painel, '#pautas li:has-text("Comunicação"):has-text("Yara"):has(button:has-text("Começar"))');
    await ver(painel, P.comecarNa('Ministério Jovem'));
    await mostrarNaColuna(painel, '#pautas li:has-text("Comunicação")');
    await capturar(painel, 'painel-pautas-adiada', {
      comunicacao: '#pautas li:has-text("Comunicação")', lista: { sel: '#pautas', parcial: true },
    });

    // Ministério Jovem: corrigir indicados na 1ª votação, voto secreto com os três nomes, reabrir.
    // Painel e telão de um mesmo instante são capturados depois de os dois mostrarem a mesma
    // contagem (o polling de cada um anda no seu tempo).
    await mostrarNaColuna(painel, '#pautas li:has-text("Ministério Jovem")');
    await painel.click(P.comecarNa('Ministério Jovem'));
    await ver(painel, P.campoIndicado);
    for (const nome of ['Caio', 'Lara']) {
      await painel.fill(P.campoIndicado, nome);
      await painel.press(P.campoIndicado, 'Enter');
      await ver(painel, `#agora ul.lista-nomes li:has-text("${nome}")`);
    }
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await votos('Ministério Jovem', { Bruno: 'Lara', Carla: 'Caio' });
    await ver(painel, '#agora:has-text("2 de 12 votaram")');
    await rolarTopo(painel);
    const dialogoCorrigir = esperarDialogo(painel, 'Voltar às indicações');
    await capturar(painel, 'painel-votacao-corrigir', { corrigir: '#agora button:has-text("Corrigir indicados")' });
    await painel.click('#agora button:has-text("Corrigir indicados")');
    registro['painel-votacao-corrigir'].dialogo = await dialogoCorrigir;
    await ver(painel, P.campoIndicado);
    await painel.fill(P.campoIndicado, 'Nara');
    await painel.press(P.campoIndicado, 'Enter');
    await ver(painel, '#agora ul.lista-nomes li:has-text("Nara")');
    await painel.locator(P.campoIndicado).blur();
    await rolar(painel, '#agora form.votar-indicacao', 120);
    await capturar(painel, 'painel-secreto-marcado', { secreto: '#agora label:has(input[name=secreto])', form: '#agora form.votar-indicacao' });
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await ver(ana, 'button.candidato:text-is("Caio")');
    await ana.click('button.candidato:text-is("Caio")');
    await ver(ana, '.status-voto:has-text("Seu voto")');
    await capturar(ana, 'celular-secreto', { aviso: '.cartao p.suave:has-text("Voto secreto")', status: '.status-voto' });
    await votos('Ministério Jovem', { Bruno: 'Lara', Carla: 'Caio', Davi: 'Nara', Elisa: 'Lara' });
    await ver(telao, '.topo .selo:has-text("SECRETA")');
    await ver(telao, '.grade .membro:has-text("Elisa") .voto:has-text("VOTOU")');
    await ver(painel, '#agora:has-text("5 de 12 votaram")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-secreta-aberta', { agora: { sel: P.agora, parcial: true }, faltam: '#agora .faltam' });
    await capturar(telao, 'telao-secreta-aberta', { grade: '.grade', selo: '.topo .selo' });
    await ver(painel, P.encerrar);
    const votosJovem = {
      Ana: 'Caio', Bruno: 'Lara', Carla: 'Caio', Davi: 'Nara', Elisa: 'Lara', Fábio: 'Caio',
      Gabriela: 'Caio', Henrique: 'Nara', Isabel: 'Caio', João: 'Lara', Lívia: 'Caio', Marcos: 'Caio',
    };
    await votos('Ministério Jovem', votosJovem);
    await ver(painel, '#agora .faltam-zero');
    await painel.click(P.encerrar);
    await ver(telao, '.resultado-telao');
    await capturar(telao, 'telao-secreta-resultado', { resultado: '.resultado-telao', grade: '.grade' });
    await ver(painel, '#agora button:has-text("Reabrir")');
    await rolarTopo(painel);
    const dialogoReabrir = esperarDialogo(painel, 'Reabrir');
    await capturar(painel, 'painel-reabrir', { reabrir: '#agora button:has-text("Reabrir")' });
    await painel.click('#agora button:has-text("Reabrir")');
    registro['painel-reabrir'].dialogo = await dialogoReabrir;
    await ver(painel, P.encerrar);
    await ver(painel, '#agora:has-text("0 de 12 votaram")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-reaberto', { agora: { sel: P.agora, parcial: true }, encerrar: P.encerrar });
    await votos('Ministério Jovem', votosJovem);
    await ver(painel, '#agora .faltam-zero');
    await painel.click(P.encerrar);
    await ver(painel, '#agora .registro button:has-text("Confirmar eleito")');
    await painel.click('#agora .registro button:has-text("Confirmar eleito")');
    await ver(painel, '#agora .registro.registrado');

    // Sem conexão
    // a tolerância cobre a captura: o painel continua consultando (e falhando) enquanto isso
    toleraQueda = true;
    quedaNoPainel = true;
    await atualizar(painel);
    await ver(painel, '#aviso:has-text("Sem conexão")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-sem-conexao', { aviso: '#aviso' });
    quedaNoPainel = false;
    await atualizar(painel);
    await painel.waitForFunction(() => !document.getElementById('aviso').textContent.includes('Sem conexão'));
    toleraQueda = false;

    // Pauta fora da lista (Ministério da Mulher), depois das mudanças de plano e do Sem conexão, para
    // não aparecer em telas anteriores do vídeo: criada e começada, e deixada para depois sem captura
    await ver(painel, '#agora input[aria-label="Pauta que não estava na lista"]');
    await painel.fill('#agora input[aria-label="Pauta que não estava na lista"]', 'Ministério da Mulher');
    await painel.locator('#agora input[aria-label="Pauta que não estava na lista"]').blur();
    await rolar(painel, '#agora input[aria-label="Pauta que não estava na lista"]', 500);
    await capturar(painel, 'painel-fora-da-lista', {
      campo: '#agora input[aria-label="Pauta que não estava na lista"]', criar: '#agora button:has-text("Criar e começar")',
    });
    await painel.click('#agora button:has-text("Criar e começar")');
    await ver(painel, P.campoIndicado);
    await ver(painel, '#agora:has-text("Ministério da Mulher")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-pauta-criada', { agora: { sel: P.agora, parcial: true }, campo: P.campoIndicado });
    const dialogoAdiarMulher = esperarDialogo(painel, 'Deixar esta pauta para depois?');
    await painel.click('#agora form.votar-indicacao button:has-text("Deixar para depois")');
    await dialogoAdiarMulher;
    await ver(painel, '#pautas li:has-text("Ministério da Mulher"):has(button:has-text("Começar"))');

    // ======================================= OUTROS MODOS =================================
    console.log('Outros modos');

    const comecarCom = async (cargo, nomes, { modo, secreto = false, max } = {}) => {
      await ver(painel, P.comecarNa(cargo));
      await mostrarNaColuna(painel, `#pautas li:has-text("${cargo}")`);
      await painel.click(P.comecarNa(cargo));
      await ver(painel, P.campoIndicado);
      for (const nome of nomes) {
        await painel.fill(P.campoIndicado, nome);
        await painel.press(P.campoIndicado, 'Enter');
        await ver(painel, `#agora ul.lista-nomes li:has-text("${nome}")`);
      }
      await painel.locator(P.campoIndicado).blur();
      if (modo) await painel.selectOption('#agora select[name=modo]', modo);
      if (max) await painel.fill('#agora input[name=maxEscolhas]', String(max));
      if (!secreto) await painel.uncheck('#agora input[name=secreto]');
    };
    const encerrarERegistrar = async () => {
      await ver(painel, '#agora .faltam-zero');
      await painel.click(P.encerrar);
      await ver(painel, '#agora .registro button:has-text("Confirmar")');
    };

    // Escola Sabatina: ordenar os nomes
    await comecarCom('Escola Sabatina', ['Débora', 'Gustavo', 'Heloísa'], { modo: 'media' });
    await rolar(painel, '#agora form.votar-indicacao', 120);
    await capturar(painel, 'painel-modo-ordem', { modo: '#agora select[name=modo]', form: '#agora form.votar-indicacao' });
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await ver(ana, 'button[aria-label="Subir Heloísa"]');
    await capturar(ana, 'celular-ordem', { subir: 'button[aria-label="Subir Heloísa"]', lista: 'ol.ordenavel', enviar: 'button.enviar-ordem' });
    await ana.click('button[aria-label="Subir Heloísa"]');
    await ver(ana, 'ol.ordenavel li:nth-child(2) .nome:text-is("Heloísa")');
    await capturar(ana, 'celular-ordem-mexida', { lista: 'ol.ordenavel', enviar: 'button.enviar-ordem', status: '.status-voto' });
    await ana.click('button.enviar-ordem');
    await ver(ana, '.status-voto:has-text("Sua ordem foi registrada")');
    const ordens = {
      Bruno: ['Heloísa', 'Débora', 'Gustavo'], Carla: ['Débora', 'Heloísa', 'Gustavo'], Davi: ['Heloísa', 'Gustavo', 'Débora'],
      Elisa: ['Gustavo', 'Heloísa', 'Débora'], Fábio: ['Heloísa', 'Débora', 'Gustavo'], Gabriela: ['Débora', 'Gustavo', 'Heloísa'],
      Henrique: ['Heloísa', 'Débora', 'Gustavo'], Isabel: ['Heloísa', 'Gustavo', 'Débora'], João: ['Débora', 'Heloísa', 'Gustavo'],
      Lívia: ['Heloísa', 'Débora', 'Gustavo'], Marcos: ['Gustavo', 'Débora', 'Heloísa'],
    };
    await votos('Escola Sabatina', Object.fromEntries(Object.entries(ordens).map(([n, o]) => [n, { ordem: o }])));
    await ver(telao, '.grade .membro:has-text("Marcos") .voto:has-text("VOTOU")');
    await capturar(telao, 'telao-ordem-aberta', { grade: '.grade' });
    await encerrarERegistrar();
    await ver(telao, '.resultado-telao');
    await capturar(telao, 'telao-ordem-resultado', { resultado: '.resultado-telao', rodape: '.rodape' });
    await painel.click('#agora .registro button:has-text("Confirmar")');
    await ver(painel, '#agora .registro.registrado');

    // Clube de Desbravadores: eliminação em duas rodadas
    await comecarCom('Clube de Desbravadores', ['Jonas', 'Karina', 'Leandro', 'Mirela'], { modo: 'eliminacao' });
    await rolar(painel, '#agora form.votar-indicacao', 120);
    await capturar(painel, 'painel-modo-eliminacao', { modo: '#agora select[name=modo]', form: '#agora form.votar-indicacao' });
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await ver(ana, 'button.candidato:text-is("Jonas")');
    await capturar(ana, 'celular-eliminacao', { opcoes: '.opcoes', titulo: '.cartao p.nomes' });
    await ana.click('button.candidato:text-is("Jonas")');
    await votos('Clube de Desbravadores', {
      Bruno: 'Jonas', Carla: 'Karina', Davi: 'Jonas', Elisa: 'Karina', Fábio: 'Leandro', Gabriela: 'Karina',
      Henrique: 'Mirela', Isabel: 'Jonas', João: 'Leandro', Lívia: 'Karina', Marcos: 'Mirela',
    });
    await ver(painel, '#agora .faltam-zero');
    await painel.click(P.encerrar);
    await ver(telao, '.resultado-telao:has-text("SEM MAIORIA")');
    await capturar(telao, 'telao-eliminacao-r1', { resultado: '.resultado-telao', barras: '.barras' });
    await ver(painel, '#agora div.proxima:has(h4)');
    await rolar(painel, '#agora div.proxima:has(h4)', 120);
    await capturar(painel, 'painel-eliminacao-proxima', {
      proxima: { sel: '#agora div.proxima:has(h4)', parcial: true }, abrir: '#agora div.proxima:has(h4) button:has-text("Abrir a 2ª rodada")',
      sugeridos: { sel: '#agora div.proxima:has(h4) label:has(input:checked)', uniao: true },
    });
    await painel.click('#agora div.proxima:has(h4) button:has-text("Abrir a 2ª rodada")');
    await ver(painel, P.encerrar);
    await ver(telao, '.topo:has-text("2ª RODADA")');
    await capturar(telao, 'telao-eliminacao-r2', { grade: '.grade', topo: '.topo' });
    await votos('Clube de Desbravadores', {
      Ana: 'Jonas', Bruno: 'Jonas', Carla: 'Karina', Davi: 'Jonas', Elisa: 'Karina', Fábio: 'Jonas', Gabriela: 'Karina',
      Henrique: 'Jonas', Isabel: 'Jonas', João: 'Jonas', Lívia: 'Karina', Marcos: 'Jonas',
    });
    await encerrarERegistrar();
    await ver(telao, '.resultado-telao:has-text("ELEITO")');
    await capturar(telao, 'telao-eliminacao-eleito', { resultado: '.resultado-telao', barras: '.barras' });
    await painel.click('#agora .registro button:has-text("Confirmar")');
    await ver(painel, '#agora .registro.registrado');

    // Ministério Pessoal: sem maioria, a comissão escolhe
    await comecarCom('Ministério Pessoal', ['Otávio', 'Priscila', 'Renan'], { modo: 'eliminacao' });
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await votos('Ministério Pessoal', {
      Ana: 'Otávio', Bruno: 'Priscila', Carla: 'Otávio', Davi: 'Renan', Elisa: 'Otávio', Fábio: 'Priscila',
      Gabriela: 'Otávio', Henrique: 'Renan', Isabel: 'Priscila', João: 'Otávio', Lívia: 'Priscila', Marcos: 'Renan',
    });
    await ver(painel, '#agora .faltam-zero');
    await painel.click(P.encerrar);
    await ver(painel, '#agora button:has-text("Comissão escolheu Otávio")');
    await rolar(painel, '#agora button:has-text("Comissão escolheu Otávio")', 420);
    const dialogoComissao = esperarDialogo(painel, 'Registrar que a comissão escolheu Otávio');
    await capturar(painel, 'painel-comissao', {
      otavio: '#agora button:has-text("Comissão escolheu Otávio")',
      grupo: { sel: '#agora div.proxima:has(h4)', parcial: true },
      // a apuração vem logo depois do bloco do próximo passo, numa lista própria
      rodada: { sel: '#agora ul.apuracao li:has-text("1ª rodada")', parcial: true },
    });
    await painel.click('#agora button:has-text("Comissão escolheu Otávio")');
    registro['painel-comissao'].dialogo = await dialogoComissao;
    await ver(telao, '.resultado-telao:has-text("ELEITO PELA COMISSÃO")');
    await capturar(telao, 'telao-comissao', { resultado: '.resultado-telao' });
    await ver(painel, '#agora .registro button:has-text("Confirmar")');
    await painel.click('#agora .registro button:has-text("Confirmar")');
    await ver(painel, '#agora .registro.registrado');

    // Diáconos: escolher até 3 nomes
    await comecarCom('Diáconos', ['Pedro', 'Olga', 'Nilton', 'Rosa', 'Saulo', 'Teresa'], { modo: 'multipla', max: 3 });
    await rolar(painel, '#agora form.votar-indicacao', 120);
    await capturar(painel, 'painel-modo-multipla', { modo: '#agora select[name=modo]', max: '#agora input[name=maxEscolhas]' });
    await painel.click(P.colocar);
    await ver(painel, P.encerrar);
    await ver(ana, 'label:has-text("Pedro")');
    await ana.click('label:has-text("Pedro")');
    await ana.click('label:has-text("Rosa")');
    await ver(ana, 'button.enviar-ordem:has-text("CONFIRMAR 2 NOMES")');
    await ana.evaluate(() => window.scrollBy({ top: 140, behavior: 'instant' }));
    await capturar(ana, 'celular-multipla', { confirmar: 'button.enviar-ordem', abster: 'button.abster', cartao: { sel: '.cartao', parcial: true } });
    await ana.click('button.enviar-ordem');
    await ver(ana, '.status-voto:has-text("Seu voto foi registrado")');
    const escolhas = {
      Bruno: ['Pedro', 'Saulo', 'Rosa'], Carla: ['Olga', 'Rosa'], Davi: ['Pedro', 'Nilton', 'Saulo'], Elisa: ['Rosa', 'Teresa', 'Pedro'],
      Fábio: ['Saulo', 'Pedro'], Gabriela: ['Rosa', 'Olga', 'Saulo'], Henrique: ['Pedro', 'Rosa'], Isabel: ['Teresa', 'Saulo', 'Nilton'],
      João: ['Pedro', 'Saulo', 'Olga'], Lívia: ['Rosa', 'Pedro'], Marcos: [],
    };
    await votos('Diáconos', Object.fromEntries(Object.entries(escolhas).map(([n, e]) => [n, { escolhas: e }])));
    await ver(telao, '.grade .membro:has-text("Marcos") .voto:has-text("VOTOU")');
    await capturar(telao, 'telao-multipla-aberta', { grade: '.grade', topo: '.topo' });
    await encerrarERegistrar();
    await ver(telao, '.resultado-telao');
    await capturar(telao, 'telao-multipla-resultado', { resultado: '.resultado-telao', rodape: '.rodape' });
    await rolar(painel, '#agora .registro', 120);
    await capturar(painel, 'painel-multipla-registro', { caixa: { sel: '#agora .registro', parcial: true } });
    await painel.click('#agora .registro button:has-text("Confirmar")');
    await ver(painel, '#agora .registro.registrado');

    // ======================================= DEPOIS DA REUNIÃO ============================
    console.log('Depois da reunião');

    await rolarTopo(painel);
    await capturar(painel, 'painel-barra-lideres', { lideres: '#link-lideres', feedback: '#link-feedback', barra: P.barra });
    await Promise.all([painel.waitForURL('**/lideres'), painel.click('#link-lideres')]);
    await ver(painel, '#cargos');
    await ver(painel, '#cargos :text("Sérgio")');
    await rolarTopo(painel);
    await capturar(painel, 'lideres-topo', { lista: '#lista-igreja', cargos: { sel: '#cargos', parcial: true } });
    const linhaSergio = '#cargos ul.lista > li:has(strong:text-is("Sérgio"))';
    await rolar(painel, linhaSergio, 260);
    await capturar(painel, 'lideres-musica', {
      linha: linhaSergio, aceitou: `${linhaSergio} button:text-is("Aceitou")`, recusou: `${linhaSergio} button:text-is("Recusou")`,
    });
    await painel.click(`${linhaSergio} button:text-is("Aceitou")`);
    await ver(painel, `${linhaSergio}:has-text("aceitou")`);
    await rolar(painel, linhaSergio, 260);
    await capturar(painel, 'lideres-aceitou', { linha: linhaSergio });

    const linhaRute = '#cargos ul.lista > li:has(strong:text-is("Rute"))';
    await rolar(painel, linhaRute, 260);
    const dialogoRecusou = esperarDialogo(painel, 'Marcar que Rute recusou?');
    await capturar(painel, 'lideres-rute', {
      linha: linhaRute, recusou: `${linhaRute} button:text-is("Recusou")`,
    });
    await painel.click(`${linhaRute} button:text-is("Recusou")`);
    registro['lideres-rute'].dialogo = await dialogoRecusou;
    await ver(painel, `${linhaRute}:has-text("recusou")`);
    await rolar(painel, linhaRute, 260);
    await capturar(painel, 'lideres-recusou', { linha: linhaRute });

    // A definir, vagas do Ancião e a lista de cargos
    const campoSaude = '#cargos input[aria-label="Nome para Ministério da Saúde"]';
    const salvarSaude = '#cargos section.cargo-lideres:has(h3:text-is("Ministério da Saúde")) button:text-is("Salvar")';
    await rolar(painel, campoSaude, 300);
    await capturar(painel, 'lideres-a-definir-vazio', { campo: campoSaude, salvar: salvarSaude });
    await painel.fill(campoSaude, 'Celso');
    await capturar(painel, 'lideres-a-definir', {
      campo: campoSaude, salvar: salvarSaude,
    });
    await painel.click(salvarSaude);
    await ver(painel, '#cargos ul.lista > li:has(strong:text-is("Celso"))');
    await rolar(painel, '#cargos section.cargo-lideres:has(h3:text-is("Ministério da Saúde"))', 300);
    await capturar(painel, 'lideres-definido', { linha: '#cargos ul.lista > li:has(strong:text-is("Celso"))' });
    await rolarTopo(painel);
    const campoVagas = '#cargos input[aria-label="Vagas de Ancião"]';
    const salvarVagas = '#cargos form.vagas-cargo button';
    await capturar(painel, 'lideres-anciao-vagas-vazio', { vagas: campoVagas, salvar: salvarVagas });
    await painel.fill(campoVagas, '3');
    await capturar(painel, 'lideres-anciao-vagas', { vagas: campoVagas, salvar: salvarVagas });
    await painel.click(salvarVagas);
    await painel.locator('#cargos section.cargo-lideres:has(h3:text-is("Ancião")) li.a-definir').nth(2).waitFor();
    await rolarTopo(painel);
    await capturar(painel, 'lideres-anciao', { cargos: { sel: '#cargos', parcial: true } });
    await painel.evaluate(() => { document.getElementById('editar-cargos').closest('details').open = true; });
    await rolar(painel, 'details:has(#editar-cargos)', 200);
    const dialogoTirar = esperarDialogo(painel, 'Tirar "Ministério Adventista das Possibilidades"');
    await capturar(painel, 'lideres-editar', {
      editar: { sel: 'details:has(#editar-cargos)', parcial: true },
      tirar: { sel: '#editar-cargos button:text-is("Tirar")', primeiro: true },
      tirarPossibilidades: '#editar-cargos li:has-text("Possibilidades") button:text-is("Tirar")',
    });
    // tira de verdade: a lista para ler à igreja, mais adiante, já não traz o cargo
    await painel.click('#editar-cargos li:has-text("Possibilidades") button:text-is("Tirar")');
    registro['lideres-editar'].dialogo = await dialogoTirar;
    await ver(painel, '#editar-cargos:not(:has(li:has-text("Possibilidades") button:text-is("Tirar")))');
    await rolar(painel, '#form-cargo', 500);
    await capturar(painel, 'lideres-acrescentar', { acrescentar: '#form-cargo', campo: '#form-cargo input', botao: '#form-cargo button' });
    await painel.fill('#form-cargo input', 'Ministério de Boas-vindas');
    await painel.locator('#form-cargo input').blur();
    await capturar(painel, 'lideres-acrescentar-digitado', { acrescentar: '#form-cargo', campo: '#form-cargo input', botao: '#form-cargo button' });
    await painel.fill('#form-cargo input', '');
    await painel.evaluate(() => { document.getElementById('editar-cargos').closest('details').open = false; });

    // Lista para ler à igreja (o print() vira nada; a folha é capturada em modo impressão)
    await rolarTopo(painel);
    await capturar(painel, 'lideres-botao-lista', { lista: '#lista-igreja' });
    await abrirFolha(painel, '#lista-igreja', 'Nomeações');
    await capturarFolha(painel, 'folha-lista-igreja', {
      titulo: { sel: 'h1' }, tabela: { sel: 'table' },
      trecho: { sel: 'tr', texto: 'Diácono', ate: { sel: 'tr', texto: 'Música' } },
      saude: { sel: 'tr', texto: 'Ministério da Saúde' },
    });

    // Volta ao painel: a vaga de quem recusou
    await Promise.all([painel.waitForURL('**/painel'), painel.goto(`${ORIGEM}/painel`)]);
    await ver(painel, '#pautas li:has-text("vaga deixada por Rute")');
    await mostrarNaColuna(painel, '#pautas li:has-text("vaga deixada por Rute")');
    await capturar(painel, 'painel-pauta-vaga', { vaga: '#pautas li:has-text("vaga deixada por Rute")' });

    // Ata, votos nominais e apagar
    await painel.evaluate(() => { document.getElementById('depois').open = true; });
    await rolar(painel, '#depois', 80);
    const alvosDepois = {
      gerar: '#ata-pdf', nominais: '#votos-nominais', planilha: '#baixar-csv', apagar: '#apagar-pautas',
      nominaisPlanilha: { sel: '#votos-nominais, #baixar-csv', uniao: true },
    };
    await capturar(painel, 'painel-depois', alvosDepois);
    await abrirFolha(painel, '#ata-pdf', 'Ata — Comissão de Nomeações');
    await capturarFolha(painel, 'folha-ata', {
      titulo: { sel: 'h1' }, resumo: { sel: '.ata-resumo' },
      aberta: { sel: '.ata-pauta', texto: 'Diretor de Música' }, secreta: { sel: '.ata-pauta', texto: 'Ministério Jovem' },
      secretaTabela: { sel: '.ata-pauta table', texto: 'Nara' },
      contraste: { sel: '.ata-pauta', texto: 'Tesoureiro', ate: { sel: '.ata-pauta table', texto: 'Nara' } },
    });
    await abrirFolha(painel, '#votos-nominais', 'ATENÇÃO');
    await capturarFolha(painel, 'folha-votos-nominais', { capa: { sel: '.ata-capa' }, restrito: { sel: '.ata-restrito' } });

    // Assuntos encerrados (a ata já foi gerada): a ata vai para Atas antigas, a lista fica vazia
    // e os líderes ficam
    await gaveta(painel, 'depois', false);
    await ver(painel, '#linha-encerrar:not([hidden])');
    await mostrarNaColuna(painel, '#linha-encerrar');
    const dialogoEncerrar = esperarDialogo(painel, 'Guardar a ata destas pautas');
    await capturar(painel, 'painel-encerrar', {
      coluna: { sel: '#pautas-sec', parcial: true }, linha: '#linha-encerrar', encerrar: '#encerrar-assuntos',
    });
    await painel.click('#encerrar-assuntos');
    registro['painel-encerrar'].dialogo = await dialogoEncerrar;
    await ver(painel, '#pautas:has-text("Nenhuma pauta")');
    await rolarTopo(painel);
    await capturar(painel, 'painel-encerrado', { barra: P.barra, feedback: '#link-feedback', lideres: '#link-lideres', pautas: '#pautas-sec' });

    await gaveta(painel, 'depois');
    await gaveta(painel, 'caixa-atas-antigas');
    await ver(painel, '#atas-antigas li button:has-text("Ata (PDF)")');
    await rolar(painel, '#depois', 80);
    await capturar(painel, 'painel-atas-antigas', {
      caixa: { sel: '#caixa-atas-antigas', parcial: true }, linha: '#atas-antigas li', ata: '#atas-antigas li .linha',
      apagar: '#apagar-pautas',
    });
    await gaveta(painel, 'caixa-atas-antigas', false);
    await gaveta(painel, 'depois', false);

    // Membros em lote: quem aceitou cargo entra na comissão; o Remover todos é recusado no diálogo
    await gaveta(painel, 'preparacao');
    await gaveta(painel, 'caixa-membros');
    await rolar(painel, '#membros-lideres', 420);
    const alvosLote = {
      botoes: { sel: '#membros-lideres, #membros-remover-todos', uniao: true },
      lideres: '#membros-lideres', remover: '#membros-remover-todos',
    };
    await capturar(painel, 'painel-membros-lote', alvosLote);
    await painel.click('#membros-lideres');
    await ver(painel, '#aviso:has-text("adicionad")');
    await rolar(painel, '#membros-lideres', 420);
    await capturar(painel, 'painel-membros-lote-feito', alvosLote);
    const dialogoRemover = esperarDialogo(painel, 'Remover TODOS os membros', { aceitar: false });
    await painel.click('#membros-remover-todos');
    registro['painel-membros-lote-feito'].dialogo = await dialogoRemover;
    await gaveta(painel, 'caixa-membros', false);
    await gaveta(painel, 'preparacao', false);

    await Promise.all([painel.waitForURL('**/lideres'), painel.click('#link-lideres')]);
    await ver(painel, '#cargos :text("Celso")');
    await rolar(painel, '#cargos section.cargo-lideres:has(h3:text-is("Ministério da Saúde"))', 260);
    await capturar(painel, 'lideres-final', {
      saude: '#cargos section.cargo-lideres:has(h3:text-is("Ministério da Saúde"))',
      musica: '#cargos section.cargo-lideres:has(h3:text-is("Música"))',
    });
    await Promise.all([painel.waitForURL('**/painel'), painel.goto(`${ORIGEM}/painel`)]);
    await ver(painel, '#link-feedback');

    // Feedback
    await rolarTopo(painel);
    await Promise.all([painel.waitForURL('**/feedback-painel'), painel.click('#link-feedback')]);
    await ver(painel, '#qr svg');
    await rolar(painel, '#qr', 260);
    await capturar(painel, 'feedback-qr', { qr: '#qr', baixar: '#baixar' });
    const { codigo: codigoFeedback, cargos: cargosFeedback } = await admin('feedbacks');
    const cargoMusica = cargosFeedback.find((c) => c.nome === 'Música');
    const visitante = await celular('visitante');
    await visitante.goto(`${ORIGEM}/feedback#${codigoFeedback}`);
    await ver(visitante, 'select');
    await visitante.selectOption('select', String(cargoMusica.id));
    await visitante.fill('textarea', 'O louvor de sábado foi muito bonito. Sugiro ensaiar com o grupo jovem uma vez por mês.');
    await visitante.locator('textarea').blur();
    await capturar(visitante, 'celular-feedback', { cargo: 'select', texto: 'textarea', enviar: 'button:has-text("Enviar")' });
    await visitante.click('button:has-text("Enviar")');
    await ver(visitante, '#conteudo:has-text("Obrigado")');
    const cargoJovem = cargosFeedback.find((c) => c.nome === 'Ministério Jovem');
    for (const [cargo, texto] of [
      [cargoJovem, 'Seria bom ter mais atividades ao ar livre para os adolescentes.'],
      [cargosFeedback.find((c) => c.nome === 'Escola Sabatina'), 'As classes poderiam começar no horário certo.'],
    ]) {
      await api('entrar', { acao: 'feedback_enviar', codigo: codigoFeedback, cargoId: cargo.id, texto });
    }
    await painel.click('#atualizar');
    await ver(painel, '#lista li:has-text("O louvor de sábado")');
    await rolarTopo(painel);
    await capturar(painel, 'feedback-lista', {
      abas: '#abas', lido: { sel: '#lista button:has-text("Marcar como lido")', primeiro: true },
      lista: { sel: '#lista', parcial: true },
    });
    await painel.locator('#lista button:has-text("Marcar como lido")').first().click();
    await ver(painel, '#abas:has-text("Lidos (1)")');
    await rolarTopo(painel);
    await capturar(painel, 'feedback-lido', { abas: '#abas', lidos: '#abas button:has-text("Lidos")', lista: { sel: '#lista', parcial: true } });
  } finally {
    await navegador.close();
  }

  // Troca de uma vez: confere erros, cardinalidade e PNG não vazio antes de substituir o que havia.
  conferirErros('troca final');
  const ids = Object.keys(registro);
  if (ids.length !== pedidas) throw new Error(`pedidas=${pedidas} registradas=${ids.length}`);
  for (const id of ids) {
    const { size } = await stat(path.join(TEMPORARIO, `${id}.png`));
    if (size < 1000) throw new Error(`${id}.png vazio (${size} bytes)`);
  }
  await writeFile(`${DESTINO_JSON}.novo`, `${JSON.stringify(registro, null, 1)}\n`);
  await rm(DESTINO_PNG, { recursive: true, force: true });
  await rename(TEMPORARIO, DESTINO_PNG);
  await rename(`${DESTINO_JSON}.novo`, DESTINO_JSON);
  console.log(`pedidas=${pedidas} gravadas=${ids.length}`);
}

// O botão monta o documento em #ata e chama print(), que aqui não faz nada. Esvazia antes, para
// não confundir com o documento anterior.
async function abrirFolha(pagina, botao, texto) {
  await pagina.evaluate(() => document.getElementById('ata').replaceChildren());
  await pagina.click(botao);
  await pagina.locator('#ata .ata-documento', { hasText: texto }).waitFor({ state: 'attached' });
}

// Folha impressa (ata, lista da igreja): a página em modo impressão, na largura do papel.
// Alvos { sel, texto? }: o primeiro elemento do seletor (que contém o texto), medido a partir
// do canto do documento.
async function capturarFolha(pagina, id, alvos = {}) {
  if (registro[id]) throw new Error(`captura repetida: ${id}`);
  conferirErros(id);
  const viewport = pagina.viewportSize();
  await pagina.setViewportSize({ width: 794, height: 1123 });
  await pagina.emulateMedia({ media: 'print' });
  await rolarTopo(pagina);
  pedidas += 1;
  // a margem do papel (no PDF vem do @page): sem ela, o texto encosta na borda da folha
  await pagina.evaluate(() => { document.getElementById('ata').style.padding = '20px 28px'; });
  await doisQuadros(pagina);
  const arquivo = path.join(TEMPORARIO, `${id}.png`);
  await pagina.locator('#ata').screenshot({ path: arquivo, animations: 'disabled' });
  const caixa = await pagina.locator('#ata').evaluate((el) => ({ w: el.offsetWidth, h: el.offsetHeight }));
  const caixas = await pagina.evaluate((specs) => {
    const base = document.getElementById('ata').getBoundingClientRect();
    const saida = {};
    const achar = ({ sel, texto }) => [...document.querySelectorAll(`#ata ${sel}`)].find((e) => !texto || e.textContent.includes(texto));
    for (const [nome, spec] of Object.entries(specs)) {
      const el = achar(spec);
      const fim = spec.ate ? achar(spec.ate) : el;
      if (!el || !fim) return { erro: nome };
      const r = el.getBoundingClientRect();
      const r2 = fim.getBoundingClientRect();
      const x = Math.min(r.x, r2.x); const y = Math.min(r.y, r2.y);
      const w = Math.max(r.right, r2.right) - x; const h = Math.max(r.bottom, r2.bottom) - y;
      saida[nome] = { x: Math.round(x - base.x), y: Math.round(y - base.y), w: Math.round(w), h: Math.round(h) };
    }
    return saida;
  }, alvos);
  if (caixas.erro) throw new Error(`${id}: alvo "${caixas.erro}" não achado`);
  registro[id] = {
    arquivo: `tutorial/capturas/${id}.png`, aparelho: 'folha', largura: caixa.w, altura: caixa.h, dpr: 2, alvos: caixas,
  };
  console.log(`  ${String(pedidas).padStart(3)} ${id}`);
  await pagina.evaluate(() => { document.getElementById('ata').style.padding = ''; });
  await pagina.emulateMedia({ media: 'screen' });
  await pagina.setViewportSize(viewport);
}

// ---------------------------------------------------------------------------------------------

const argumentos = new Set(process.argv.slice(2));
if (argumentos.has('--so-rotas')) await conferirRotas();
else await historia();
