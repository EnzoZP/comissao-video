// PDF de divulgação: para pastores e secretárias de outras igrejas conhecerem o app.
// Uma ideia por página, frase grande e a tela real. Nada de número ou promessa que o app não cumpra.
import { celular, folha, navegador, pagina, rodape, telao, marca } from './montar.mjs';

const pe = () => rodape({ esquerda: 'Comissão de Nomeações · votação pelo celular' });

// Página de uma ideia: texto à esquerda, telas à direita.
const ideia = ({ sobre, titulo, texto, telas }) => () => pagina('', `
  <div style="position:absolute;left:72px;top:96px;width:440px">
    <p class="sobretitulo">${sobre}</p>
    <h2 class="titulo" style="margin-top:14px">${titulo}</h2>
    <p class="corpo" style="margin-top:22px;color:var(--suave)">${texto}</p>
  </div>
  ${telas}
  ${pe()}
`);

const cartao = (titulo, texto) => `
  <div style="background:var(--fundo);border-radius:22px;padding:36px 40px;min-height:200px;border-top:6px solid var(--denim)">
    <p style="font-size:28px;font-weight:800;color:var(--denim);letter-spacing:-.01em">${titulo}</p>
    <p class="corpo" style="margin-top:14px;font-size:20px;color:var(--suave)">${texto}</p>
  </div>`;

export const DIVULGACAO = [
  // Capa
  () => pagina('escura', `
    <div style="position:absolute;left:72px;top:96px;width:520px">
      <p class="sobretitulo">Comissão de Nomeações</p>
      <h1 class="titulo-grande" style="margin-top:22px">A votação da comissão, no celular de cada membro.</h1>
      <p class="subtitulo" style="margin-top:26px">O telão mostra, o celular vota e a secretária conduz pelo painel. Sem instalar nada.</p>
    </div>
    ${telao('telao-votacao-aberta', { x: 540, y: 120, w: 680 })}
    ${celular('celular-votacao-nomes', { x: 1050, y: 330, w: 180 })}
    <img src="${marca('branco')}" alt="Igreja Adventista do Sétimo Dia" style="position:absolute;left:72px;bottom:56px;height:52px">
  `),

  // Como funciona
  () => pagina('', `
    <div style="position:absolute;left:72px;top:64px;width:1136px">
      <p class="sobretitulo">Como funciona</p>
      <h2 class="titulo" style="margin-top:14px">Três telas, uma reunião.</h2>
    </div>
    ${navegador('painel-votacao-faltam', { x: 72, y: 214, w: 470, h: 290, foco: 'faltam', zoom: 1.15 })}
    ${telao('telao-votacao-aberta', { x: 576, y: 248, w: 430 })}
    ${celular('celular-votou', { x: 1046, y: 186, w: 156 })}
    <div style="position:absolute;left:72px;top:540px;width:450px">
      <p class="corpo"><strong class="realce">Painel da secretária.</strong> Ela lista as pautas, abre e encerra a votação e vê quem ainda falta.</p>
    </div>
    <div style="position:absolute;left:576px;top:540px;width:430px">
      <p class="corpo"><strong class="realce">Telão no projetor.</strong> A sala acompanha o cargo, os indicados e o resultado.</p>
    </div>
    <div style="position:absolute;left:1040px;top:540px;width:180px">
      <p class="corpo"><strong class="realce">Celular.</strong> Cada membro vota pelo navegador.</p>
    </div>
    ${pe()}
  `),

  ideia({
    sobre: 'Entrada',
    titulo: 'Cada membro entra apontando a câmera para o QR.',
    texto: 'Toca no próprio nome e pronto: o celular espera a votação abrir. Quem está longe digita um código de seis números. O telão mostra quem já entrou e quantos faltam para o quórum.',
    telas: `${telao('telao-qr-7', { x: 560, y: 150, w: 650, aneis: ['qr'] })}
      ${celular('celular-entrar-lista', { x: 380, y: 420, w: 124, aneis: ['ana'] })}`,
  }),

  // Indicação pelo celular
  () => pagina('', `
    <div style="position:absolute;left:72px;top:72px;width:440px">
      <p class="sobretitulo">Indicações</p>
      <h2 class="titulo" style="margin-top:14px">Os nomes chegam pelo celular, com quem indicou.</h2>
      <p class="corpo" style="margin-top:22px;color:var(--suave)">Quando a secretária libera, cada membro indica um nome. O telão mostra o nome e, pequeno, quem o indicou. A ata registra tudo.</p>
    </div>
    ${telao('telao-indicacao-3', { x: 560, y: 150, w: 650, aneis: ['legenda'] })}
    ${celular('celular-indicou', { x: 330, y: 382, w: 150 })}
    ${pe()}
  `),

  ideia({
    sobre: 'A palavra',
    titulo: 'Quem quer falar levanta a mão pelo celular.',
    texto: 'O telão mostra a fila na ordem em que as mãos subiram. A secretária dá a palavra e tira cada um com um toque. Ninguém fica esquecido.',
    telas: `${telao('telao-maos', { x: 560, y: 150, w: 650, aneis: ['fila'] })}
      ${celular('celular-mao-levantada', { x: 330, y: 382, w: 150 })}`,
  }),

  ideia({
    sobre: 'Modos de votação',
    titulo: 'Do Sim ou Não à eliminação por rodadas.',
    texto: 'Sim ou Não para um nome, escolher um entre vários, ordenar todos os nomes, eliminação por rodadas até a maioria e marcar vários nomes. A secretária escolhe na hora de abrir a votação.',
    telas: `${telao('telao-eliminacao-eleito', { x: 560, y: 120, w: 650, aneis: ['resultado'] })}
      ${celular('celular-ordem-mexida', { x: 340, y: 400, w: 140 })}`,
  }),

  ideia({
    sobre: 'Voto secreto',
    titulo: 'Secreto de verdade, até na ata.',
    texto: 'O voto secreto já vem marcado. Telão e painel mostram só quem votou; a ata, só o resultado. O voto de cada um fica num documento à parte, de uso restrito da secretaria.',
    telas: `${telao('telao-secreta-aberta', { x: 560, y: 110, w: 560, aneis: ['grade'] })}
      ${folha('folha-votos-nominais', { x: 920, y: 380, w: 290, h: 250, foco: 'capa', zoom: 1 })}`,
  }),

  ideia({
    sobre: 'Resultado',
    titulo: 'O resultado aparece na hora, e o eleito já vai para a lista.',
    texto: 'Encerrada a votação, o telão mostra o resultado. A secretária confirma o eleito, que entra em Cargos e líderes aguardando a resposta. Se alguém recusar, a vaga volta para a votação.',
    telas: `${telao('telao-resultado-musica', { x: 560, y: 96, w: 520, aneis: ['resultado'] })}
      ${navegador('lideres-aceitou', { x: 780, y: 400, w: 430, h: 230, foco: 'linha', zoom: 1.3, aneis: ['linha'] })}`,
  }),

  ideia({
    sobre: 'Depois da reunião',
    titulo: 'A ata e a lista para a igreja saem prontas.',
    texto: 'A ata traz o resultado de cada pauta e as assinaturas. A lista para ler à igreja mostra cada cargo, o nome e se a pessoa aceitou. As duas viram PDF em um clique.',
    telas: `${folha('folha-ata', { x: 560, y: 80, w: 330, h: 520, foco: 'aberta', zoom: 1 })}
      ${folha('folha-lista-igreja', { x: 920, y: 150, w: 300, h: 450, zoom: 1 })}`,
  }),

  ideia({
    sobre: 'Feedback',
    titulo: 'A igreja fala com cada líder, por um QR.',
    texto: 'Um QR fixo na apresentação do culto. Quem escaneia escolhe o cargo e escreve. A secretária lê e repassa, sem ver quem enviou.',
    telas: `${navegador('feedback-lista', { x: 560, y: 110, w: 560, h: 440, foco: 'lista', zoom: 1.1 })}
      ${celular('celular-feedback', { x: 1040, y: 300, w: 170, aneis: ['cargo'] })}`,
  }),

  () => pagina('', `
    <div style="position:absolute;left:72px;top:64px;width:1136px">
      <p class="sobretitulo">Cuidado com os dados</p>
      <h2 class="titulo" style="margin-top:14px">Cada igreja no seu espaço.</h2>
    </div>
    <div style="position:absolute;left:72px;top:196px;width:1136px;display:grid;grid-template-columns:1fr 1fr;gap:28px">
      ${cartao('Uma igreja não vê a outra', 'Membros, pautas, telão, QR e votos são de cada igreja. O banco recusa um voto que misture igrejas.')}
      ${cartao('Login da secretária', 'Cada secretária entra com o próprio e-mail e senha. Trocar a senha desconecta todos os computadores em que ela entrou.')}
      ${cartao('Um voto por pessoa', 'Cada membro entra pelo próprio nome; dois celulares não votam pelo mesmo nome.')}
      ${cartao('O feedback não mostra o autor', 'A secretária lê o recado sem ver nome, telefone ou de onde veio.')}
    </div>
    ${pe()}
  `),

  () => pagina('escura', `
    <div style="position:absolute;left:72px;top:90px;width:640px">
      <p class="sobretitulo">Para começar</p>
      <h2 class="titulo-grande" style="margin-top:18px">Um computador, um projetor e o celular de cada membro.</h2>
      <p class="subtitulo" style="margin-top:24px">Nada para instalar. O responsável pelo app cria a igreja e manda o convite para a secretária; o guia e os vídeos ensinam o resto.</p>
    </div>
    <div style="position:absolute;left:760px;top:150px;width:440px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:40px">
      <p class="sobretitulo">Fale com o Enzo</p>
      <p style="margin-top:16px;font-size:40px;font-weight:800;color:#fff">(11) 95815-0018</p>
      <p class="subtitulo" style="margin-top:12px">pelo WhatsApp</p>
    </div>
    <img src="${marca('branco')}" alt="Igreja Adventista do Sétimo Dia" style="position:absolute;left:72px;bottom:56px;height:52px">
  `),
];
