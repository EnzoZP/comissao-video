// PDF de tutorial: o passo a passo da secretária, na ordem dos vídeos, e a parte do membro no fim.
// Página de passo: a tela real à esquerda, com o número sobre cada botão; os passos à direita, com os
// mesmos números. Quando ajuda, uma segunda tela pequena mostra o que a sala vê (telão ou celular).
import { celular, folha, navegador, pagina, rodape, marca, telao } from './montar.mjs';

const b = (texto) => `<span class="botao-app">${texto}</span>`;

// Tela principal (à esquerda). tipo: navegador | celular | telao.
function principal(tipo, id, opcoes) {
  if (tipo === 'celular') return celular(id, { x: 190, y: 40, w: 300, ...opcoes });
  if (tipo === 'telao') return telao(id, { x: 56, y: 150, w: 690, ...opcoes });
  return navegador(id, { x: 56, y: 56, w: 690, h: 570, ...opcoes });
}

// Segunda tela (embaixo, à direita): o que a sala ou o membro vê.
function secundaria(tipo, id, opcoes, rotulo) {
  const legenda = (x, y) => `<p class="sobretitulo" style="position:absolute;left:${x}px;top:${y}px;font-size:12px;color:var(--suave)">${rotulo}</p>`;
  if (tipo === 'celular') return legenda(1052, 92) + celular(id, { x: 1052, y: 116, w: 172, ...opcoes });
  if (tipo === 'folha') return legenda(800, 418) + folha(id, { x: 800, y: 440, w: 400, h: 200, ...opcoes });
  return legenda(800, 410) + telao(id, { x: 800, y: 432, w: 380, ...opcoes });
}

function passo({ tema, titulo, tela, extra, passos, dica }) {
  // com telão ou folha embaixo à direita não há lugar para a dica
  if (dica && extra && extra.tipo !== 'celular') throw new Error(`${titulo}: dica não cabe com ${extra.tipo} embaixo`);
  const largura = extra?.tipo === 'celular' ? 230 : 420;
  return () => pagina('', `
    ${principal(tela.tipo ?? 'navegador', tela.id, tela.opcoes ?? {})}
    ${extra ? secundaria(extra.tipo, extra.id, extra.opcoes ?? {}, extra.rotulo) : ''}
    <div style="position:absolute;left:800px;top:72px;width:${largura}px">
      <p class="sobretitulo">${tema}</p>
      <h2 class="titulo" style="margin-top:12px;font-size:${largura < 300 ? 30 : 36}px">${titulo}</h2>
      <ol class="passos" style="margin-top:26px;gap:${extra ? 12 : 18}px">
        ${passos.map((p) => `<li><span>${p}</span></li>`).join('')}
      </ol>
      ${dica ? `<p class="dica" style="margin-top:24px">${dica}</p>` : ''}
    </div>
    ${rodape({ esquerda: `Guia da secretária · ${tema}` })}
  `);
}

const TEMAS = [
  ['Primeiro acesso', 'Criar a conta, entrar e conhecer o painel'],
  ['Membros da comissão', 'Cadastrar, mandar o link e mudar a lista'],
  ['O telão', 'Abrir no projetor, neste computador ou em outro'],
  ['Entrada pelo QR', 'Quórum, QR, código curto e nome errado'],
  ['Conduzir uma pauta', 'Da lista de cargos ao resultado registrado'],
  ['Indicação pelo celular', 'Os membros mandam nomes pelo celular'],
  ['Pedir a palavra', 'A fila de quem levantou a mão'],
  ['Imprevistos', 'Adiar, corrigir, reabrir e pauta nova'],
  ['Modos de votação', 'Voto secreto, abstenção, ordem, rodadas e vários nomes'],
  ['Cargos e líderes', 'Resposta dos eleitos e lista para ler à igreja'],
  ['A ata e o fim do trabalho', 'Ata, votos nominais e atas antigas'],
  ['Feedback', 'O QR fixo da igreja e os recados por cargo'],
  ['Guia do membro', 'Para mandar à comissão antes da reunião'],
];

function divisoria(numero, itens) {
  const [titulo] = TEMAS[numero - 1];
  const video = numero === 13 ? 'do membro' : String(numero);
  return () => pagina('escura', `
    <div style="position:absolute;left:96px;top:120px">
      <p style="font-size:180px;font-weight:800;line-height:.9;color:#8fb2da;letter-spacing:-.04em">${String(numero).padStart(2, '0')}</p>
    </div>
    <div style="position:absolute;left:520px;top:150px;width:660px">
      <p class="sobretitulo">${numero === 13 ? 'Membro' : `Tema ${numero}`}</p>
      <h2 class="titulo-grande" style="margin-top:16px">${titulo}</h2>
      <ul style="margin-top:34px;list-style:none;display:grid;gap:14px">
        ${itens.map((i) => `<li class="subtitulo" style="display:flex;gap:14px"><span style="color:#ea580c">●</span>${i}</li>`).join('')}
      </ul>
      <p class="selo" style="margin-top:40px;background:rgba(143,178,218,.14);color:#cfe0f3">▶ No vídeo ${video}</p>
    </div>
  `);
}

// ---------------------------------------------------------------------------------------------

const capa = () => pagina('denim', `
  <div style="position:absolute;left:80px;top:110px;width:600px">
    <p class="sobretitulo">Comissão de Nomeações</p>
    <h1 class="titulo-grande" style="margin-top:22px">Guia da secretária</h1>
    <p class="subtitulo" style="margin-top:22px">Do primeiro acesso à ata, com as telas reais do app. No fim, o guia do membro, para mandar à comissão.</p>
  </div>
  ${navegador('painel-indicacao-3', { x: 690, y: 120, w: 560, h: 380, foco: 'lista', zoom: 1.05 })}
  ${celular('celular-votacao-nomes', { x: 1010, y: 330, w: 190 })}
  <img src="${marca('branco')}" alt="Igreja Adventista do Sétimo Dia" style="position:absolute;left:80px;bottom:60px;height:52px">
`);

function sumario() {
  const item = ([titulo, resumo], i) => `
    <li style="display:grid;grid-template-columns:56px 1fr;gap:16px;align-items:baseline">
      <span style="font-size:28px;font-weight:800;color:${i === 12 ? 'var(--laranja)' : 'var(--denim)'}">${String(i + 1).padStart(2, '0')}</span>
      <span><strong style="font-size:19px">${titulo}</strong><br><span style="font-size:15px;color:var(--suave)">${resumo}</span></span>
    </li>`;
  return () => pagina('', `
    <div style="position:absolute;left:72px;top:64px">
      <p class="sobretitulo">Sumário</p>
      <h2 class="titulo" style="margin-top:12px">Doze temas e o guia do membro</h2>
    </div>
    <ol style="position:absolute;left:72px;top:190px;width:1136px;list-style:none;display:grid;grid-template-columns:1fr 1fr;grid-auto-flow:column;grid-template-rows:repeat(7,auto);gap:20px 64px">
      ${TEMAS.map(item).join('')}
    </ol>
    ${rodape({ esquerda: 'Guia da secretária' })}
  `);
}

function antes() {
  const coluna = (titulo, texto, peca) => `
    <div style="display:grid;gap:12px">
      <div style="height:250px;position:relative">${peca}</div>
      <p class="corpo"><strong class="realce">${titulo}</strong> ${texto}</p>
    </div>`;
  return () => pagina('', `
    <div style="position:absolute;left:72px;top:64px">
      <p class="sobretitulo">Antes de começar</p>
      <h2 class="titulo" style="margin-top:12px">Um computador, um projetor e o celular de cada membro</h2>
    </div>
    <div style="position:absolute;left:72px;top:210px;width:1136px;display:grid;grid-template-columns:1.25fr 1fr .55fr;gap:44px">
      ${coluna('O painel', 'é o seu: abre no computador, com seu e-mail e senha.', navegador('painel-inicio', { x: 0, y: 0, w: 420, h: 250 }))}
      ${coluna('O telão', 'vai no projetor. A sala vê o cargo, os nomes e o resultado.', telao('telao-indicacao-3', { x: 0, y: 30, w: 340 }))}
      ${coluna('O celular', 'de cada membro vota pelo navegador, sem instalar nada.', celular('celular-votacao-nomes', { x: 30, y: 0, w: 124 }))}
    </div>
    ${rodape({ esquerda: 'Guia da secretária' })}
  `);
}

const T = (i) => TEMAS[i - 1][0];

const PAGINAS = [
  capa,
  sumario(),
  antes(),

  // 1. Primeiro acesso
  divisoria(1, ['Criar a conta pelo link de convite', 'Entrar e sair do painel', 'Conhecer o painel, o tema e a ajuda']),
  passo({
    tema: T(1), titulo: 'Criar a conta',
    tela: { id: 'convite-preenchido', opcoes: { foco: 'form', zoom: 1.25, pontos: [{ alvo: 'nome', n: 1 }, { alvo: 'criar', n: 2 }] } },
    passos: [
      'O responsável pelo app manda um <strong>link de convite</strong>. Abra e escreva nome, e-mail e uma senha de pelo menos 12 caracteres, duas vezes.',
      `Clique em ${b('Criar minha conta')}. Você já cai no painel.`,
    ],
    dica: 'O link de convite vale 7 dias e serve uma vez só.',
  }),
  passo({
    tema: T(1), titulo: 'Entrar e sair',
    tela: { id: 'login-preenchido', opcoes: { foco: 'form', zoom: 1.2, pontos: [{ alvo: 'email', n: 1 }, { alvo: 'lembrar', n: 2 }, { alvo: 'entrar', n: 3 }] } },
    passos: [
      'Nas outras vezes, abra o endereço do painel e escreva seu e-mail e sua senha. Guarde nos favoritos.',
      `No <strong>seu</strong> computador, marque ${b('Lembrar neste computador')}.`,
      `Clique em ${b('Entrar')}. Em computador emprestado, não marque e use ${b('Sair')} no fim.`,
    ],
  }),
  passo({
    tema: T(1), titulo: 'Conhecendo o painel',
    tela: { id: 'painel-inicio', opcoes: { pontos: [{ alvo: 'agora', n: 1 }, { alvo: 'pautas', n: 2 }, { alvo: 'barra', n: 3 }] } },
    passos: [
      '<strong>Agora</strong>: a pauta em andamento. É onde você trabalha na reunião.',
      '<strong>Pautas</strong>: a lista de cargos. Cada pauta começa por ali.',
      '<strong>Barra de cima</strong>: o que está acontecendo e atalhos para cada parte.',
    ],
    dica: 'Mais abaixo ficam as gavetas da Preparação, de Depois da reunião e de Mais. A da vez abre sozinha, e o botão ? de cada bloco explica o que fazer.',
  }),
  passo({
    tema: T(1), titulo: 'Tema e ajuda',
    tela: { id: 'painel-inicio', opcoes: { foco: 'tema', zoom: 1.8, pontos: [{ alvo: 'ajuda', n: 1, lado: 'baixo' }, { alvo: 'tema', n: 2, lado: 'baixo' }, { alvo: 'sair', n: 3, lado: 'baixo' }] } },
    passos: [
      `${b('Ajuda')} leva ao WhatsApp do responsável pelo app.`,
      'O botão do sol e da lua troca o tema claro e escuro, no painel, no telão e nos celulares.',
      `${b('Sair')} fecha o painel neste computador.`,
    ],
  }),

  // 2. Membros
  divisoria(2, ['Cadastrar os membros uma vez só', 'Mandar o link pessoal pelo WhatsApp', 'Mudar a lista inteira de uma vez']),
  passo({
    tema: T(2), titulo: 'Cadastrar os membros',
    tela: { id: 'painel-membros-digitados', opcoes: { foco: 'campo', zoom: 1.4, pontos: [{ alvo: 'campo', n: 1 }, { alvo: 'adicionar', n: 2 }] } },
    passos: [
      'Na gaveta da Preparação, escreva <strong>um nome por linha</strong>.',
      `Clique em ${b('Adicionar membros')}.`,
    ],
    dica: 'Isso se faz uma vez só. Nas próximas reuniões, só confira se a lista está certa.',
  }),
  passo({
    tema: T(2), titulo: 'O link de cada membro',
    tela: { id: 'painel-membros-lista', opcoes: { foco: 'ana', zoom: 1.5, pontos: [{ alvo: 'copiar', n: 1, lado: 'baixo' }, { alvo: 'novo', n: 2, lado: 'baixo' }] } },
    passos: [
      `${b('Copiar link')} copia o link pessoal para mandar pelo WhatsApp, a quem preferir entrar assim.`,
      `${b('Novo link')} troca o link de alguém. O antigo para de funcionar.`,
    ],
    dica: 'A lista fica recolhida depois de pronta. Para abrir, clique em Membros, na barra de cima.',
  }),
  passo({
    tema: T(2), titulo: 'Membros em lote',
    tela: { id: 'painel-membros-lote', opcoes: { foco: 'botoes', zoom: 1.4, pontos: [{ alvo: 'lideres', n: 1 }, { alvo: 'remover', n: 2, lado: 'direita' }] } },
    passos: [
      `${b('Adicionar quem aceitou cargo')} põe na comissão todos que aceitaram em Cargos e líderes, sem repetir ninguém.`,
      `${b('Remover todos')} tira todos os membros e os links param de funcionar. Os votos antigos continuam na ata.`,
    ],
    dica: 'Com a votação aberta, a lista não pode ser esvaziada.',
  }),

  // 3. Telão
  divisoria(3, ['Abrir o telão no projetor', 'Telão em outro computador, por código', 'Link novo a cada reunião']),
  passo({
    tema: T(3), titulo: 'Abrir o telão',
    tela: { id: 'painel-telao-link', opcoes: { foco: 'secao', zoom: 1.5, pontos: [{ alvo: 'abrir', n: 2, lado: 'baixo' }] } },
    extra: { tipo: 'telao', id: 'telao-aguardando', rotulo: 'No projetor' },
    passos: [
      `Na barra, clique em ${b('Telão e QR')} e depois em ${b('Gerar link do telão')}.`,
      `Clique em ${b('Abrir o telão')}. Leve a janela para o projetor e aperte F11 (no Mac, o botão verde).`,
    ],
  }),
  passo({
    tema: T(3), titulo: 'Telão em outro computador',
    tela: { id: 'painel-telao-codigo', opcoes: { foco: 'bloco', zoom: 1.6, pontos: [{ alvo: 'codigo', n: 1 }] } },
    extra: { tipo: 'telao', id: 'telao-codigo-digitado', opcoes: { aneis: ['entrar'] }, rotulo: 'No computador do telão' },
    passos: [
      `Clique em ${b('Gerar código')}. O painel mostra o endereço e seis números.`,
      `No computador do telão, abra o endereço, digite os números e clique em ${b('Entrar')}. Vale 10 minutos, uma vez.`,
    ],
  }),

  // 4. Entrada
  divisoria(4, ['Quórum, se houver', 'Abrir a entrada e o celular entrando', 'Código curto, nome errado e quem chega atrasado']),
  passo({
    tema: T(4), titulo: 'Quórum',
    tela: { id: 'painel-quorum', opcoes: { foco: 'form', zoom: 1.8, pontos: [{ alvo: 'campo', n: 1 }, { alvo: 'salvar', n: 2, lado: 'direita' }] } },
    passos: [
      'Na gaveta Mais, escreva o número do quórum.',
      `Clique em ${b('Salvar')}.`,
    ],
    dica: 'O quórum é opcional. Ele aparece no telão e na ata, mas não impede ninguém de votar.',
  }),
  passo({
    tema: T(4), titulo: 'Abrir a entrada pelo QR',
    tela: { id: 'painel-entrada-fechada', opcoes: { foco: 'secao', zoom: 1.5, pontos: [{ alvo: 'abrir', n: 1 }] } },
    extra: { tipo: 'telao', id: 'telao-qr-0', opcoes: { aneis: ['curto'] }, rotulo: 'O telão' },
    passos: [
      `Com todos na sala, clique em ${b('Abrir entrada pelo QR')} e confirme.`,
      'O telão mostra o QR, um código de seis números e quantos faltam para o quórum.',
    ],
  }),
  passo({
    tema: T(4), titulo: 'O celular entrando',
    tela: { tipo: 'telao', id: 'telao-qr-7', opcoes: { aneis: ['grade'] } },
    extra: { tipo: 'celular', id: 'celular-entrar-lista', opcoes: { aneis: ['ana'] }, rotulo: 'No celular' },
    passos: [
      'Cada membro aponta a câmera para o QR e toca no link.',
      'Toca no próprio nome e confirma. O telão mostra quem já entrou.',
      'Longe do telão? Abre o endereço que aparece embaixo do QR e digita os seis números.',
    ],
  }),
  passo({
    tema: T(4), titulo: 'Nome errado',
    tela: { id: 'painel-membros-liberar', opcoes: { foco: 'linha', zoom: 1.2, pontos: [{ alvo: 'liberar', n: 1, lado: 'baixo' }] } },
    extra: { tipo: 'celular', id: 'celular-sem-acesso', opcoes: { aneis: ['aviso'] }, rotulo: 'Quem errou' },
    passos: [
      `Alguém tocou no nome errado? Na lista de membros, clique em ${b('Liberar')} ao lado do nome e confirme.`,
      'O celular de quem errou fica sem acesso. Cada um escaneia de novo e toca no próprio nome.',
    ],
    dica: 'Com a votação aberta, o Liberar aparece também em Faltam.',
  }),
  passo({
    tema: T(4), titulo: 'Quem chega atrasado',
    tela: { id: 'painel-qr-ligado', opcoes: { foco: 'faixa', zoom: 1.5, pontos: [{ alvo: 'voltar', n: 2, lado: 'direita' }] } },
    extra: { tipo: 'telao', id: 'telao-qr-atrasado', rotulo: 'O telão' },
    passos: [
      `O QR pequeno no canto do telão já serve. Se precisar dele grande, clique em ${b('Mostrar o QR no telão')}, em Agora.`,
      `Depois, clique em ${b('Voltar à votação no telão')}.`,
    ],
  }),

  // 5. Pauta
  divisoria(5, ['Listar as pautas e começar uma', 'Digitar os indicados e abrir a votação', 'Encerrar e registrar o resultado']),
  passo({
    tema: T(5), titulo: 'Listar as pautas',
    tela: { id: 'painel-pautas-digitadas', opcoes: { foco: 'coluna', zoom: 1.5, pontos: [{ alvo: 'campo', n: 1 }, { alvo: 'adicionar', n: 2 }] } },
    passos: [
      'Antes da reunião, escreva <strong>um cargo por linha</strong>, só o título.',
      `Clique em ${b('Adicionar pautas')}.`,
    ],
    dica: 'Os nomes você digita na hora, quando a pauta começar. As pautas ficam guardadas de uma noite para outra.',
  }),
  passo({
    tema: T(5), titulo: 'Começar a pauta',
    tela: { id: 'painel-pautas-lista', opcoes: { foco: 'lista', zoom: 1.5, pontos: [{ alvo: 'comecar', n: 1 }] } },
    extra: { tipo: 'telao', id: 'telao-indicacao-vazia', rotulo: 'O telão' },
    passos: [
      `Clique em ${b('Começar')}, na linha da pauta.`,
      'A pauta vai para Agora, e o telão mostra o cargo.',
    ],
  }),
  passo({
    tema: T(5), titulo: 'Digitar os indicados',
    tela: { id: 'painel-indicacao-3', opcoes: { foco: 'lista', zoom: 1.4, pontos: [{ alvo: 'lista', n: 1 }, { alvo: 'tirar', n: 2, lado: 'baixo' }] } },
    extra: { tipo: 'telao', id: 'telao-indicacao-3', rotulo: 'O telão' },
    passos: [
      'Digite cada nome e aperte Enter. Os nomes aparecem no telão.',
      'O × tira um nome da lista.',
    ],
  }),
  passo({
    tema: T(5), titulo: 'Colocar em votação',
    tela: { id: 'painel-como-votar-aberto', opcoes: { foco: 'form', zoom: 1.35, pontos: [{ alvo: 'modo', n: 1 }, { alvo: 'secreto', n: 2 }, { alvo: 'colocar', n: 3 }] } },
    passos: [
      'Escolha <strong>como votar</strong>. Com um nome é Sim ou Não; com dois ou mais, cada um escolhe um nome.',
      'O <strong>voto secreto</strong> já vem marcado. Desmarque só se a comissão quiser o voto de cada um à vista.',
      `Clique em ${b('Colocar em votação')}.`,
    ],
    dica: 'Ordenar, eliminar por rodadas e escolher vários nomes estão no tema 9.',
  }),
  passo({
    tema: T(5), titulo: 'Quem falta votar',
    tela: { id: 'painel-registrar-joao', opcoes: { foco: 'linha', zoom: 1.5, pontos: [{ alvo: 'sergio', n: 2, lado: 'baixo' }] } },
    extra: { tipo: 'telao', id: 'telao-registrado', opcoes: { aneis: ['joao'] }, rotulo: 'O telão' },
    passos: [
      'Em Agora, a faixa <strong>Faltam</strong> mostra quem ainda não votou.',
      'Alguém sem celular? Clique no voto que a pessoa disser, na linha dela.',
    ],
  }),
  passo({
    tema: T(5), titulo: 'Encerrar a votação',
    tela: { id: 'painel-votacao-todos', opcoes: { foco: 'todos', zoom: 1.6, pontos: [{ alvo: 'encerrar', n: 1 }] } },
    extra: { tipo: 'telao', id: 'telao-resultado-musica', opcoes: { aneis: ['resultado'] }, rotulo: 'O telão' },
    passos: [
      `Quando aparecer <strong>Todos votaram</strong>, clique em ${b('Encerrar votação')}.`,
      'O resultado aparece no telão.',
    ],
  }),
  passo({
    tema: T(5), titulo: 'Registrar o resultado',
    tela: { id: 'painel-registre', opcoes: { foco: 'caixa', zoom: 1.5, pontos: [{ alvo: 'cargo', n: 1 }, { alvo: 'confirmar', n: 2 }] } },
    passos: [
      'O painel já marca quem venceu e o cargo dele em Cargos e líderes. Confira.',
      `Clique em ${b('Confirmar eleito')}. O nome vai para Cargos e líderes, aguardando a resposta.`,
    ],
    dica: 'Errou? Desfazer registro volta atrás, enquanto a pessoa não respondeu. Depois, comece a próxima pauta na lista.',
  }),

  // 6. Indicação pelo celular
  divisoria(6, ['Liberar a indicação pelo celular', 'Os nomes chegando, com quem indicou', 'Fechar quando terminar']),
  passo({
    tema: T(6), titulo: 'Liberar a indicação',
    tela: { id: 'painel-indicacao-liberar', opcoes: { foco: 'liberar', zoom: 1.6, pontos: [{ alvo: 'liberar', n: 1 }] } },
    extra: { tipo: 'celular', id: 'celular-indicar-digitado', opcoes: { aneis: ['indicar'] }, rotulo: 'No celular' },
    passos: [
      `Com a pauta em indicação, clique em ${b('Liberar indicação pelo celular')}.`,
      'Cada membro escreve um nome e toca em Indicar. Um nome por pessoa.',
    ],
  }),
  passo({
    tema: T(6), titulo: 'Os nomes chegando',
    tela: { id: 'painel-indicacao-3', opcoes: { foco: 'lista', zoom: 1.5, pontos: [{ alvo: 'legenda', n: 1, lado: 'baixo' }, { alvo: 'tirar', n: 2, lado: 'baixo' }, { alvo: 'fechar', n: 3 }] } },
    extra: { tipo: 'telao', id: 'telao-indicacao-3', opcoes: { aneis: ['legenda'] }, rotulo: 'O telão' },
    passos: [
      'Cada nome mostra quem indicou, no painel e no telão.',
      'O × tira qualquer nome.',
      `${b('Fechar indicação pelo celular')} para de receber. Colocar em votação fecha sozinho.`,
    ],
  }),

  // 7. Palavra
  divisoria(7, ['A fila de quem levantou a mão', 'Já falou e Limpar a fila']),
  passo({
    tema: T(7), titulo: 'A fila da palavra',
    tela: { id: 'painel-maos', opcoes: { foco: 'fila', zoom: 1.6, aneis: ['falou'], pontos: [{ alvo: 'limpar', n: 3, lado: 'direita' }] } },
    extra: { tipo: 'telao', id: 'telao-maos', opcoes: { aneis: ['fila'] }, rotulo: 'O telão' },
    passos: [
      'Fora da votação, cada membro pode levantar a mão pelo celular. A fila aparece no telão e no topo de Agora.',
      `Dê a palavra ao primeiro. Quando terminar, clique em ${b('Já falou')}.`,
      `${b('Limpar a fila')} tira todos. Colocar em votação limpa sozinho.`,
    ],
  }),

  // 8. Imprevistos
  divisoria(8, ['Deixar uma pauta para depois', 'Corrigir indicados e reabrir', 'Sem conexão e pauta fora da lista']),
  passo({
    tema: T(8), titulo: 'Deixar para depois',
    tela: { id: 'painel-indicacao-adiar', opcoes: { foco: 'adiar', zoom: 1.6, pontos: [{ alvo: 'adiar', n: 1, lado: 'baixo' }] } },
    passos: [
      `A pauta precisa esperar? Antes de colocar em votação, clique em ${b('Deixar para depois')} e confirme.`,
      'Ela volta para a lista, com os nomes.',
    ],
  }),
  passo({
    tema: T(8), titulo: 'Corrigir indicados',
    tela: { id: 'painel-votacao-corrigir', opcoes: { foco: 'corrigir', zoom: 1.4, pontos: [{ alvo: 'corrigir', n: 1, lado: 'direita' }] } },
    passos: [
      `Faltou um nome depois de abrir a votação? Clique em ${b('Corrigir indicados')} e confirme. Só na primeira rodada.`,
      'Os votos dessa pauta são apagados e ela volta às indicações. Acrescente o nome e coloque em votação de novo.',
    ],
  }),
  passo({
    tema: T(8), titulo: 'Reabrir a votação',
    tela: { id: 'painel-reabrir', opcoes: { foco: 'reabrir', zoom: 1.6, pontos: [{ alvo: 'reabrir', n: 1, lado: 'direita' }] } },
    passos: [
      `Encerrou cedo demais? Clique em ${b('Reabrir')} e confirme.`,
      'A votação abre de novo e todos votam outra vez. Se o resultado já foi registrado, desfaça o registro antes.',
    ],
  }),
  passo({
    tema: T(8), titulo: 'Pauta fora da lista',
    tela: { id: 'painel-fora-da-lista', opcoes: { foco: 'campo', zoom: 1.6, pontos: [{ alvo: 'campo', n: 1 }, { alvo: 'criar', n: 2, lado: 'direita' }] } },
    passos: [
      'Com o resultado da anterior registrado, escreva o cargo em <strong>Pauta que não estava na lista</strong>.',
      `Clique em ${b('Criar e começar')}. A pauta já começa nas indicações.`,
    ],
    dica: 'Apareceu Sem conexão? Espere. O painel tenta de novo sozinho e os votos registrados não se perdem.',
  }),

  // 9. Modos
  divisoria(9, ['Voto secreto e abstenção', 'Ordenar os nomes e eliminação por rodadas', 'Escolha da comissão e vários nomes']),
  passo({
    tema: T(9), titulo: 'Voto secreto',
    tela: { id: 'painel-secreto-marcado', opcoes: { foco: 'form', zoom: 1.4, pontos: [{ alvo: 'secreto', n: 1 }] } },
    extra: { tipo: 'telao', id: 'telao-secreta-aberta', opcoes: { aneis: ['grade'] }, rotulo: 'O telão' },
    passos: [
      'Já vem marcado. Telão e painel mostram só quem votou; no fim, o placar e o resultado.',
      'O voto de cada um não entra na ata: fica nos Votos nominais, só da secretaria.',
    ],
  }),
  passo({
    tema: T(9), titulo: 'Abstenção',
    tela: { id: 'painel-registrar-abstencao', opcoes: { foco: 'linha', zoom: 1.6, pontos: [{ alvo: 'abstencao', n: 2, lado: 'direita' }] } },
    extra: { tipo: 'celular', id: 'celular-abstencao', opcoes: { aneis: ['abster'] }, rotulo: 'No celular' },
    passos: [
      'Em qualquer modo, quem não quer votar toca em Me abstenho. Conta como quem votou, à parte na contagem.',
      `Sem celular? Clique em ${b('Abstenção')} na linha da pessoa.`,
    ],
  }),
  passo({
    tema: T(9), titulo: 'Ordenar os nomes',
    tela: { id: 'painel-modo-ordem', opcoes: { foco: 'form', zoom: 1.4, pontos: [{ alvo: 'modo', n: 1 }] } },
    extra: { tipo: 'celular', id: 'celular-ordem-mexida', opcoes: { aneis: ['enviar'] }, rotulo: 'No celular' },
    passos: [
      'Escolha <strong>Ordenar os nomes</strong> em Como votar.',
      'Cada membro põe todos em ordem com as setas e toca em Enviar minha ordem. Vence a menor média de posição.',
    ],
  }),
  passo({
    tema: T(9), titulo: 'Eliminação por rodadas',
    tela: { id: 'painel-eliminacao-proxima', opcoes: { foco: 'abrir', zoom: 1.4, pontos: [{ alvo: 'sugeridos', n: 1 }, { alvo: 'abrir', n: 2 }] } },
    extra: { tipo: 'telao', id: 'telao-eliminacao-r2', opcoes: { aneis: ['topo'] }, rotulo: 'O telão' },
    passos: [
      'Cada um escolhe um nome por rodada. Sem ninguém acima da metade, o painel marca os mais votados.',
      `Confira e clique em ${b('Abrir a 2ª rodada')}. Repita até alguém ter a maioria.`,
    ],
  }),
  passo({
    tema: T(9), titulo: 'Escolha da comissão',
    tela: { id: 'painel-comissao', opcoes: { foco: 'otavio', zoom: 1.4, pontos: [{ alvo: 'otavio', n: 1 }] } },
    extra: { tipo: 'telao', id: 'telao-comissao', opcoes: { aneis: ['resultado'] }, rotulo: 'O telão' },
    passos: [
      `Sem maioria, mas a comissão decidiu por um nome? Clique em ${b('Comissão escolheu…')} no nome e confirme.`,
      'O telão mostra Eleito pela comissão, e a ata registra. Depois, registre o resultado.',
    ],
  }),
  passo({
    tema: T(9), titulo: 'Escolher vários nomes',
    tela: { id: 'painel-modo-multipla', opcoes: { foco: 'modo', zoom: 1.5, pontos: [{ alvo: 'modo', n: 1 }, { alvo: 'max', n: 2 }] } },
    extra: { tipo: 'celular', id: 'celular-multipla', opcoes: { aneis: ['confirmar'] }, rotulo: 'No celular' },
    passos: [
      'Escolha <strong>Escolher vários nomes</strong>.',
      'Defina quantos cada um pode marcar. Sem marcar ninguém, o voto fica em branco.',
    ],
  }),

  // 10. Líderes
  divisoria(10, ['A resposta de cada eleito', 'Nomes já decididos e a lista de cargos', 'A lista para ler à igreja']),
  passo({
    tema: T(10), titulo: 'Aceitou ou recusou',
    tela: { id: 'lideres-musica', opcoes: { foco: 'linha', zoom: 1.5, pontos: [{ alvo: 'aceitou', n: 1 }, { alvo: 'recusou', n: 2, lado: 'direita' }] } },
    passos: [
      `Em ${b('Cargos e líderes')}, na barra, estão os cargos com os eleitos. Quando a pessoa responder, clique em ${b('Aceitou')}…`,
      `… ou em ${b('Recusou')} e confirme. A vaga volta para a lista de pautas e a comissão vota de novo.`,
    ],
  }),
  passo({
    tema: T(10), titulo: 'Nomes já decididos',
    tela: { id: 'lideres-a-definir', opcoes: { foco: 'campo', zoom: 1.5, pontos: [{ alvo: 'campo', n: 1 }, { alvo: 'salvar', n: 2, lado: 'direita' }] } },
    passos: [
      'Algum cargo já foi decidido antes? Escreva o nome no campo <strong>A definir</strong>.',
      `Clique em ${b('Salvar')}. O nome entra como aceito.`,
    ],
    dica: 'No Ancião, informe quantas vagas existem. Em Editar a lista de cargos você tira ou acrescenta cargos.',
  }),
  passo({
    tema: T(10), titulo: 'Lista para ler à igreja',
    tela: { id: 'lideres-botao-lista', opcoes: { foco: 'lista', zoom: 1.3, pontos: [{ alvo: 'lista', n: 1 }] } },
    extra: { tipo: 'folha', id: 'folha-lista-igreja', opcoes: { foco: 'trecho', zoom: 1.1 }, rotulo: 'A folha' },
    passos: [
      `Clique em ${b('Lista para ler à igreja')}.`,
      'Cargo, nome e se a pessoa já aceitou. Imprima ou salve como PDF.',
    ],
  }),

  // 11. Ata
  divisoria(11, ['A ata de cada noite', 'Assuntos encerrados', 'Atas antigas']),
  passo({
    tema: T(11), titulo: 'Gerar a ata',
    tela: { id: 'painel-depois', opcoes: { foco: 'gerar', zoom: 1.5, pontos: [{ alvo: 'gerar', n: 1 }, { alvo: 'nominaisPlanilha', n: 2, lado: 'direita' }] } },
    extra: { tipo: 'folha', id: 'folha-ata', opcoes: { foco: 'aberta', zoom: 1 }, rotulo: 'A ata' },
    passos: [
      `Na gaveta Depois da reunião, clique em ${b('Gerar ata')} e salve como PDF.`,
      'Votos nominais e a planilha trazem o voto secreto de cada um. São só da secretaria.',
    ],
  }),
  passo({
    tema: T(11), titulo: 'Assuntos encerrados',
    tela: { id: 'painel-encerrar', opcoes: { foco: 'linha', zoom: 1.6, pontos: [{ alvo: 'encerrar', n: 1 }] } },
    passos: [
      `Terminado todo o trabalho, clique em ${b('Assuntos encerrados')}, no fim da lista de Pautas, e confirme.`,
      'A ata vai para Atas antigas e a lista de pautas fica limpa. Cargos e líderes continua.',
    ],
    dica: 'Não pode haver pauta em andamento. Apagar todas as pautas limpa sem guardar a ata: use só se não precisar dela.',
  }),
  passo({
    tema: T(11), titulo: 'Atas antigas',
    tela: { id: 'painel-atas-antigas', opcoes: { foco: 'linha', zoom: 1.3, pontos: [{ alvo: 'ata', n: 1 }] } },
    passos: [
      'Para imprimir de novo, abra Depois da reunião e Atas antigas.',
      'Cada uma tem a ata, os votos nominais e a planilha. Apagar tira de vez.',
    ],
  }),

  // 12. Feedback
  divisoria(12, ['O QR fixo da igreja', 'Ler e repassar os recados']),
  passo({
    tema: T(12), titulo: 'O QR do feedback',
    tela: { id: 'feedback-qr', opcoes: { foco: 'qr', zoom: 1.3, pontos: [{ alvo: 'baixar', n: 1, lado: 'direita' }] } },
    extra: { tipo: 'celular', id: 'celular-feedback', opcoes: { aneis: ['cargo'] }, rotulo: 'Quem escaneia' },
    passos: [
      `No alto do painel, clique em ${b('Feedback')} e em ${b('Baixar imagem do QR')}. Ponha na apresentação do culto.`,
      'Quem escaneia escolhe o cargo e escreve. Nome e telefone são opcionais.',
    ],
  }),
  passo({
    tema: T(12), titulo: 'Ler os recados',
    tela: { id: 'feedback-lista', opcoes: { foco: 'lista', zoom: 1.2, pontos: [{ alvo: 'lido', n: 1 }, { alvo: 'abas', n: 2 }] } },
    passos: [
      'Você lê tudo nessa tela, sem ver quem enviou. Repasse ao líder e clique em <strong>Marcar como lido</strong>.',
      'O recado passa para a aba Lidos.',
    ],
  }),

  // 13. Membro
  divisoria(13, ['Entrar pelo QR do telão', 'Indicar um nome e pedir a palavra', 'Votar em cada modo']),
  passo({
    tema: T(13), titulo: 'Entrar',
    tela: { tipo: 'telao', id: 'telao-qr-0', opcoes: { aneis: ['qr'] } },
    extra: { tipo: 'celular', id: 'celular-entrar-lista', opcoes: { aneis: ['ana'] }, rotulo: 'No celular' },
    passos: [
      'Aponte a câmera para o QR do telão e toque no link.',
      'Toque no seu nome e confirme. Errou o nome? Avise a secretaria.',
    ],
  }),
  passo({
    tema: T(13), titulo: 'Indicar e pedir a palavra',
    tela: { tipo: 'celular', id: 'celular-indicou', opcoes: { pontos: [{ alvo: 'tirar', n: 1, lado: 'dentro' }] } },
    extra: { tipo: 'celular', id: 'celular-mao-levantada', opcoes: { aneis: ['mao'] }, rotulo: 'A mão' },
    passos: [
      'Se a secretaria liberar, escreva um nome e toque em Indicar. Dá para tirar até a votação começar.',
      'Quer falar? Levantar a mão põe seu nome na fila do telão.',
    ],
  }),
  passo({
    tema: T(13), titulo: 'Votar',
    tela: { tipo: 'celular', id: 'celular-votacao-nomes', opcoes: { pontos: [{ alvo: 'sergio', n: 1, lado: 'dentro' }, { alvo: 'abster', n: 2, lado: 'dentro' }] } },
    extra: { tipo: 'celular', id: 'celular-simnao', rotulo: 'Sim ou Não' },
    passos: [
      'Toque no nome. Dá para trocar até a votação encerrar.',
      'Não quer votar? Me abstenho. Com um nome só, é Sim ou Não.',
    ],
  }),
  passo({
    tema: T(13), titulo: 'Outros jeitos de votar',
    tela: { tipo: 'celular', id: 'celular-ordem-mexida', opcoes: { pontos: [{ alvo: 'enviar', n: 1, lado: 'dentro' }] } },
    extra: { tipo: 'celular', id: 'celular-multipla', opcoes: { aneis: ['confirmar'] }, rotulo: 'Vários nomes' },
    passos: [
      'Ordem: setas para subir ou descer e Enviar minha ordem.',
      'Vários nomes: marque e toque em Confirmar. No secreto, o telão mostra só que você votou.',
    ],
  }),
];

function ajuda() {
  return () => pagina('denim', `
    <div style="position:absolute;left:80px;top:150px;width:720px">
      <p class="sobretitulo">Ficou com dúvida?</p>
      <h2 class="titulo-grande" style="margin-top:18px">Fale com o Enzo pelo WhatsApp</h2>
      <p class="subtitulo" style="margin-top:24px;font-size:34px;color:#fff;font-weight:700">(11) 95815-0018</p>
      <p class="subtitulo" style="margin-top:18px">No painel, o botão Ajuda leva ao mesmo contato. Os vídeos do tutorial seguem a mesma ordem deste guia.</p>
    </div>
    <img src="${marca('branco')}" alt="Igreja Adventista do Sétimo Dia" style="position:absolute;left:80px;bottom:60px;height:52px">
  `);
}

export const TUTORIAL = [...PAGINAS, ajuda()];
