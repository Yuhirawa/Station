/* =========================================================
   Filling · Painel Real — lógica
   Tudo fica salvo no localStorage do navegador.
   ========================================================= */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtNum = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');

const STORE_KEY = 'filling-painel-v1';
const sv = (inner) => `<svg viewBox="0 0 24 24">${inner}</svg>`;
// ícones de traço com preenchimento suave (classe .d = camada translúcida)
const I = {
  check: sv('<path d="M20 6L9 17l-5-5"/>'),
  x: sv('<path d="M18 6L6 18M6 6l12 12"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>'),
  alert: sv('<path class="d" d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>'),
  clock: sv('<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>'),
  alarm: sv('<circle class="d" cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.6 1.8M4.5 3.5L2 6M19.5 3.5L22 6M7 20l-1.5 2M17 20l1.5 2"/>'),
  truck: sv('<path class="d" d="M2 5.5h12v10.5H2z"/><path d="M2 5.5h12v10.5H2zM14 9h4.3l3.7 3.8V16h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>'),
  play: sv('<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M10 8.3l5.5 3.7-5.5 3.7z"/>'),
  flag: sv('<path class="d" d="M5 4h13l-2.5 4.5L18 13H5z"/><path d="M5 21V4h13l-2.5 4.5L18 13H5"/>'),
  arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  edit: sv('<path class="d" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4zM14 6l3 3M13 20h8"/>'),
  chev: sv('<path d="M6 9l6 6 6-6"/>'),
  back: sv('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  crown: sv('<path class="d" d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 10H5z"/><path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 10H5zM5 21h14"/>'),
  clipboard: sv('<rect class="d" x="5" y="4" width="14" height="17" rx="2.5"/><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 2.8h6v2.6H9zM9 11l2 2 4-4M9 17h6"/>'),
  calCheck: sv('<rect class="d" x="3" y="5" width="18" height="16" rx="2.5"/><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18M9 15.2l2 2 4-4"/>'),
  printer: sv('<path class="d" d="M3.5 9h17a1.5 1.5 0 0 1 1.5 1.5V17h-4v-3H6v3H2v-6.5A1.5 1.5 0 0 1 3.5 9z"/><path d="M6 9V3h12v6M6 17H2v-6.5A1.5 1.5 0 0 1 3.5 9h17a1.5 1.5 0 0 1 1.5 1.5V17h-4M6 14h12v7H6zM17.5 12h.01"/>'),
  package: sv('<path class="d" d="M12 2.5l8.5 4.7v9.6L12 21.5l-8.5-4.7V7.2z"/><path d="M12 2.5l8.5 4.7v9.6L12 21.5l-8.5-4.7V7.2zM3.5 7.2L12 12l8.5-4.8M12 12v9.5M7.8 4.8l8.5 4.8"/>'),
  barcode: sv('<rect class="d" x="2" y="4" width="20" height="16" rx="2.5"/><path d="M2 8V6.5A2.5 2.5 0 0 1 4.5 4H6M18 4h1.5A2.5 2.5 0 0 1 22 6.5V8M22 16v1.5a2.5 2.5 0 0 1-2.5 2.5H18M6 20H4.5A2.5 2.5 0 0 1 2 17.5V16M7 8v8M10 8v8M13 8v8M15.5 8v8M17.5 8v8"/>'),
  calClock: sv('<path class="d" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5V10H3z"/><path d="M11 21H5.5A2.5 2.5 0 0 1 3 18.5v-11A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5V11M8 3v4M16 3v4M3 10h18"/><circle cx="17" cy="17" r="4.5"/><path d="M17 15v2l1.4 1"/>'),
  phone: sv('<rect class="d" x="6" y="2" width="12" height="20" rx="3"/><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 18.5h3M9 6h6M9 9.5h6M9 13h3"/>'),
  recycle: sv('<circle class="d" cx="12" cy="12" r="9"/><path d="M20 12a8 8 0 0 1-14.2 5M4 12a8 8 0 0 1 14.2-5"/><path d="M18.5 3v4.2h-4.2M5.5 21v-4.2h4.2"/>'),
  file: sv('<path class="d" d="M6 2.5h8l5 5V21a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21z"/><path d="M6.5 21.5h12a.5.5 0 0 0 .5-.5V7.5l-5-5H6.5a.5.5 0 0 0-.5.5v18a.5.5 0 0 0 .5.5zM14 2.5v5h5M9 12.5h7M9 16.5h5"/>'),
  hash: sv('<path d="M5 9h15M4 15h15M10 3.5L8.5 20.5M15.5 3.5L14 20.5"/>'),
  sun: sv('<circle class="d" cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.2M19.8 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/>'),
  sunset: sv('<path class="d" d="M6.5 17a5.5 5.5 0 0 1 11 0z"/><path d="M6.5 17a5.5 5.5 0 0 1 11 0M2 17h20M6 21h12M12 2.5v6M9.2 5.8L12 8.5l2.8-2.7M4.2 10.2l1.5 1.5M19.8 10.2l-1.5 1.5"/>'),
  moon: sv('<path class="d" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/><path d="M17 3.5v3M15.5 5h3"/>'),
  scroll: sv('<path class="d" d="M7 3h11a2 2 0 0 1 2 2v13H9v1a2 2 0 0 1-2 2"/><path d="M7 21a2 2 0 0 1-2-2V5a2 2 0 1 0-4 0v2h4M7 3h11a2 2 0 0 1 2 2v12M7 21h12a2 2 0 0 0 2-2v-2H9v2a2 2 0 0 1-2 2zM10 8h6M10 12h6"/>'),
  chart: sv('<path class="d" d="M7 13h3v7H7zM14 8h3v12h-3z"/><path d="M3 3v18h18M7 13h3v7H7zM14 8h3v12h-3z"/>'),
  repeat: sv('<path d="M17 2l4 4-4 4"/><path d="M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 12v2a4 4 0 0 1-4 4H3"/>'),
  feather: sv('<path class="d" d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5z"/><path d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5zM16 8L2 22M17.5 15H9"/>'),
  ruler: sv('<rect class="d" x="2" y="7" width="20" height="10" rx="2"/><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v4M10 7v3M14 7v4M18 7v3"/>'),
  layers: sv('<path class="d" d="M12 2.5l9.5 5-9.5 5-9.5-5z"/><path d="M12 2.5l9.5 5-9.5 5-9.5-5zM2.5 12l9.5 5 9.5-5M2.5 16.5l9.5 5 9.5-5"/>'),
  gauge: sv('<path class="d" d="M3 15a9 9 0 0 1 18 0z"/><path d="M3 15a9 9 0 0 1 18 0M12 15l4-5M6.5 15h.01M17.5 15h.01M12 8.5v.01"/><path d="M3 19h18"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path class="d" d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  tanker: sv('<path class="d" d="M2.5 7.5h12.5a3.5 3.5 0 0 1 3.5 3.5v3.5h-16z"/><path d="M2.5 7.5h12.5a3.5 3.5 0 0 1 3.5 3.5v3.5h-16zM18.5 10.5h1.6l1.9 2.4v3.6h-3.5M2.5 14.5v2h16M7.5 7.5V5.5h3v2"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="15.5" cy="17.5" r="1.9"/>'),
  ibc: sv('<rect class="d" x="4" y="4.5" width="16" height="13.5" rx="1.5"/><rect x="4" y="4.5" width="16" height="13.5" rx="1.5"/><path d="M4 9h16M4 13.5h16M9.3 4.5V18M14.7 4.5V18M10.5 2.5h3v2M6 18v3M18 18v3M4 21h16"/>'),
  pump: sv('<circle class="d" cx="9" cy="13" r="6.5"/><circle cx="9" cy="13" r="6.5"/><path d="M9 13l3-3M5.5 13h.01M9 9.2v.01M12.5 13h.01M15.5 13h3V8h3M18.5 8V4.5M2.5 21h13"/>'),
  drip: sv('<path class="d" d="M12 2.5c3.3 4.8 6.5 8.2 6.5 11.8a6.5 6.5 0 0 1-13 0c0-3.6 3.2-7 6.5-11.8z"/><path d="M12 2.5c3.3 4.8 6.5 8.2 6.5 11.8a6.5 6.5 0 0 1-13 0c0-3.6 3.2-7 6.5-11.8z"/><path d="M8.8 14.8a3.2 3.2 0 0 0 3.2 3.2"/>'),
  drum: sv('<path class="d" d="M6 4.5v15c0 1 2.7 1.8 6 1.8s6-.8 6-1.8v-15"/><ellipse cx="12" cy="4.5" rx="6" ry="1.8"/><path d="M6 4.5v15c0 1 2.7 1.8 6 1.8s6-.8 6-1.8v-15M6 9.8c0 1 2.7 1.8 6 1.8s6-.8 6-1.8M6 14.8c0 1 2.7 1.8 6 1.8s6-.8 6-1.8"/>'),
  keyboard: sv('<rect class="d" x="2" y="5" width="20" height="14" rx="2.5"/><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12.5h.01M10 12.5h.01M14 12.5h.01M18 12.5h.01M7.5 16h9"/>'),
  palette: sv('<path class="d" d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/><circle cx="17" cy="10.5" r="1"/>'),
  crest: sv('<path class="d" d="M12 7l6.2 2.3v5.2c0 3.7-2.7 6.6-6.2 8-3.5-1.4-6.2-4.3-6.2-8V9.3z"/><path d="M12 7l6.2 2.3v5.2c0 3.7-2.7 6.6-6.2 8-3.5-1.4-6.2-4.3-6.2-8V9.3zM8.4 5.6l1.8 1.1L12 3.8l1.8 2.9 1.8-1.1-.6 2.3H9z"/><path d="M12 11c1.3 1.6 2.1 2.8 2.1 3.8a2.1 2.1 0 0 1-4.2 0c0-1 .8-2.2 2.1-3.8z"/><path d="M4.4 9.2c-1.1 2.6-.6 5.8 1.5 8.1M3.2 12.4l1.5.6M3.6 15.3l1.6.2M19.6 9.2c1.1 2.6.6 5.8-1.5 8.1M20.8 12.4l-1.5.6M20.4 15.3l-1.6.2M9 20.8c1.2.7 2.2 1 3 1.2.8-.2 1.8-.5 3-1.2"/>'),
  route: sv('<circle class="d" cx="6" cy="18.5" r="3"/><circle cx="6" cy="18.5" r="3"/><circle cx="18" cy="5.5" r="3"/><path d="M9 18.5h8.2a3.3 3.3 0 0 0 0-6.6H6.8a3.3 3.3 0 0 1 0-6.6H15"/>'),
  weight: sv('<path class="d" d="M5.5 9h13l2.5 11.5H3z"/><path d="M5.5 9h13l2.5 11.5H3zM9.5 6a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0M10 14.5h4"/>'),
  copy: sv('<rect class="d" x="8" y="8" width="13" height="13" rx="2"/><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  sparkle: sv('<path class="d" d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/>'),
};

/* ================= Configuração do processo ================= */
// cor de cada sistema
const TAGS = { APP: 'lime', Revolog: 'gray', SA05: 'ruby', MSC2N: 'purple', Skelta: 'forest' };

// 7 etapas de preparo de cada caminhão — cada uma com sua cor
const PREP = [
  { k: 'op', l: 'OP', full: 'Abrir ordem de processo', c: 'topaz', ic: 'clipboard' },
  { k: 'msc2n', l: 'MSC2N', full: 'Fixar datas dos lotes na MSC2N', c: 'purple', ic: 'calCheck', tags: ['MSC2N'] },
  { k: 'rot', l: 'Rótulos', full: 'Imprimir rótulos de envase', c: 'navy', ic: 'printer' },
  { k: 'od', l: 'ODs', full: 'Criar ODs de insumos', c: 'sky', ic: 'package' },
  { k: 'skelta', l: 'Skelta', full: 'Criar etiquetas de envase (Skelta)', c: 'forest', ic: 'barcode', tags: ['Skelta'] },
  { k: 'revolog', l: 'Revolog', full: 'Criar agendamento de envase (Revolog)', c: 'gray', ic: 'calClock', tags: ['Revolog'] },
  { k: 'app', l: 'APP', full: 'Inserir a programação no APP', c: 'lime', ic: 'phone', tags: ['APP'] },
];

const SEQ = [
  { id: 'rotulos-resto', title: 'Emitir rótulos de resto dos envases do dia anterior', tags: ['APP'], c: 'topaz' },
  { id: 'veiculos', title: 'Verificar se todos os veículos vieram no dia anterior', tags: ['Revolog', 'APP'], c: 'emerald' },
  { id: 'finalizar-prog', title: 'Finalizar a programação do dia', desc: 'Somente se houver pendências', c: 'sapphire' },
  { id: 'reprocesso', title: 'Criar ordens de reprocesso e solicitar reporte ao operador', tags: ['SA05'], c: 'ruby' },
  { id: 'fechar-ordens', title: 'Fechar ordens de processo do dia anterior', desc: 'Envase principal + reprocesso', c: 'copper' },
  { id: 'prog-seguinte', title: 'Iniciar a programação do dia seguinte (e próximos)', c: 'amethyst',
    sub: PREP.map((p) => ({ id: 'prep-' + p.k, title: p.full, tags: p.tags, prep: p.k, c: p.c, l: p.l, ic: p.ic })) },
];

const ROTINA = [
  { id: 'revolog', title: 'Acompanhar os envases na Revolog', desc: 'Justificar atrasos e ocorrências', freq: 'diaria', tags: ['Revolog'] },
  { id: 'residuo', title: 'Gerenciar resíduos', desc: 'Limpeza de linha, varredura, descarte de filtros', freq: 'demanda' },
  { id: 'gestao-app', title: 'Gestão do APP', desc: 'Eliminar cards antigos e cancelados', freq: 'demanda', tags: ['APP'] },
  { id: 'ncm', title: 'Abertura de NCM', freq: 'demanda' },
  { id: 'od-insumos', title: 'ODs de insumos', desc: 'Frascos, lacres etc.', freq: 'demanda' },
];

const TURNOS = [
  { n: 'Manhã', icon: I.sun },
  { n: 'Tarde', icon: I.sunset },
  { n: 'Noite', icon: I.moon },
];

// janelas sugeridas do dia operacional (00:30 e 03:00 caem na madrugada seguinte)
const SLOTS = [
  { id: 's0730', t: '07:30', h: 7, m: 30, turno: 0 },
  { id: 's1030', t: '10:30', h: 10, m: 30, turno: 0, after: 'Almoço' },
  { id: 's1430', t: '14:30', h: 14, m: 30, turno: 1 },
  { id: 's1730', t: '17:30', h: 17, m: 30, turno: 1, after: 'Janta' },
  { id: 's2100', t: '21:00', h: 21, m: 0, turno: 2 },
  { id: 's0030', t: '00:30', h: 0, m: 30, turno: 2, next: true, after: 'Ceia' },
  { id: 's0300', t: '03:00', h: 3, m: 0, turno: 2, next: true },
];
const CAP = SLOTS.length;

// w = janelas ocupadas · dur = horas de envase previstas
const TYPES = {
  padrao: { n: 'Carreta padrão', mono: 'CP', ic: 'tanker', w: 1, dur: 3, leg: 'Envase normal' },
  ibc: { n: 'IBC de papelão', mono: 'IBC', ic: 'ibc', w: 1.5, dur: 4.5, leg: 'Ocupa 1½ janela', hint: 'IBC de papelão ocupa 1½ janela.' },
  coater: { n: 'Coater Ready', mono: 'CR', ic: 'pump', w: 1.5, dur: 5, leg: 'Bomba em pressão mín. ≈ 5 h', hint: 'Pressão mínima da bomba: ~5 h de envase → 1½ janela.' },
  viscoso: { n: 'Muito viscoso', mono: 'VIS', ic: 'drip', w: 1.5, dur: 4, leg: 'Ex.: Acronal 1569 · +3 h', hint: 'Ex.: Acronal 1569 — pode passar de 3 h. Ajuste a duração se precisar.' },
  tambor: { n: 'Tambor / Bombona', mono: 'TB', ic: 'drum', w: 'turno', dur: 'turno', leg: 'Turno inteiro (2 a 3 janelas)', hint: 'Ocupa o turno inteiro (2 a 3 janelas), a partir da janela escolhida.' },
};

const STATUS = { programado: 'Programado', chegou: 'Chegou', envasando: 'Envasando', concluido: 'Concluído', cancelado: 'Cancelado' };
const FLOW = {
  programado: { act: 'Registrar chegada', short: 'Chegou', icon: I.truck, next: 'chegou', t: 'chegada' },
  chegou: { act: 'Iniciar envase', short: 'Iniciar', icon: I.play, next: 'envasando', t: 'inicio' },
  envasando: { act: 'Finalizar envase', short: 'Finalizar', icon: I.flag, next: 'concluido', t: 'fim' },
};
const MOTIVOS = ['Atraso do veículo', 'Atraso na operação', 'Limpeza de linha', 'Material viscoso', 'Antecipado', 'Outro'];

/* ================= Datas e horários ================= */
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
const isOpDay = (d) => d.getDay() >= 1 && d.getDay() <= 5;
const nextOpDay = (d) => { let x = addDays(d, 1); while (!isOpDay(x)) x = addDays(x, 1); return x; };
const prevOpDay = (d) => { let x = addDays(d, -1); while (!isOpDay(x)) x = addDays(x, -1); return x; };
const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WDL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const fmtShort = (d) => `${WD[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const fmtDM = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const fmtLong = (d) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtTime = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const todayKey = () => keyOf(new Date());

// "minutos operacionais": 0 = 07:15 do dia, 1440 = 07:15 do dia seguinte
const OP0 = 7 * 60 + 15;
const slotOp = (s) => s.h * 60 + s.m + (s.next ? 1440 : 0) - OP0;
const opToHHMM = (op) => { const a = (((Math.round(op) + OP0) % 1440) + 1440) % 1440; return `${pad(Math.floor(a / 60))}:${pad(a % 60)}`; };
const hhmmToOp = (str) => { const [h, m] = str.split(':').map(Number); let op = h * 60 + m - OP0; if (op < 0) op += 1440; return op; };
const opStartMs = (k) => { const d = fromKey(k); d.setHours(7, 15, 0, 0); return d.getTime(); };
const msToOp = (k, ms) => (ms - opStartMs(k)) / 60000;
const nowOp = (k) => msToOp(k, Date.now());
function currentOpDayKey() {
  const n = new Date();
  const d = n.getHours() * 60 + n.getMinutes() < OP0 ? addDays(n, -1) : n;
  return isOpDay(d) ? keyOf(d) : null;
}
function fmtDelta(min) {
  const a = Math.round(Math.abs(min));
  const s = min < 0 ? '−' : '+';
  if (a < 60) return `${s}${a} min`;
  return `${s}${Math.floor(a / 60)}h${a % 60 ? pad(a % 60) : ''}`;
}
function untilText(min) {
  min = Math.max(0, Math.round(min));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  if (h >= 24) { const d = Math.floor(h / 24); return `${d} dia${d > 1 ? 's' : ''}`; }
  return m ? `${h}h${pad(m)}` : `${h}h`;
}

/* ================= Estado ================= */
let S = load();
function blank() { return { days: {}, plan: {}, settings: { theme: 'dark', prepMode: 'truck' }, materials: [] }; }
function migrate(s) {
  Object.values(s.plan || {}).forEach((list) => list.forEach((e) => {
    if (e.status === 'atrasado') e.status = 'programado';
    if (!e.reps && e.repQtd) { e.reps = [{ qtd: e.repQtd, un: e.repUn || 'kg', lote: '' }]; }
    delete e.repQtd; delete e.repUn;
    e.t ||= {};
    e.prep ||= {};
  }));
  return s;
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s === 'object') return migrate({ ...blank(), ...s, settings: { ...blank().settings, ...(s.settings || {}) } });
  } catch (e) { /* ignora */ }
  return blank();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Não foi possível salvar neste navegador.'); }
}
const EMPTY_DAY = () => ({ checks: {}, routine: {}, extras: [], notes: '' });
const getDay = (k) => S.days[k] || EMPTY_DAY();
const ensureDay = (k) => (S.days[k] ||= EMPTY_DAY());
const getPlan = (k) => S.plan[k] || [];
const active = (list) => list.filter((e) => e.status !== 'cancelado');
const findTruck = (k, id) => getPlan(k).find((e) => e.id === id);

/* ================= Caminhões: janelas e horários ================= */
const slotIdx = (id) => SLOTS.findIndex((s) => s.id === id);
function turnoEnd(i) { let j = i; while (j + 1 < SLOTS.length && SLOTS[j + 1].turno === SLOTS[i].turno) j++; return j; }
function weightOf(e) {
  if (e.janelas && e.janelas !== 'auto') return Number(e.janelas);
  if (e.tipo === 'tambor') { const i = effSlotIdx(e); return i < 0 ? 2.5 : turnoEnd(i) - i + 1; }
  return TYPES[e.tipo]?.w || 1;
}
function durMin(e) {
  if (e.dur && e.dur !== 'auto') return Number(e.dur) * 60;
  if (e.tipo === 'tambor') return weightOf(e) * 3 * 60;
  return (TYPES[e.tipo]?.dur || 3) * 60;
}
// horário imprevisto (e.hora) substitui a janela; a janela substitui o imprevisto
const isImp = (e) => slotIdx(e.slot) < 0 && e.hora != null;
// horário imprevisto entra no card da janela mais próxima (ex.: 20:00 -> 21:00)
function slotIndexForOp(op) {
  let idx = 0, best = Infinity;
  SLOTS.forEach((s, i) => { const d = Math.abs(slotOp(s) - op); if (d < best) { best = d; idx = i; } });
  return idx;
}
const effSlotIdx = (e) => { const i = slotIdx(e.slot); if (i >= 0) return i; return e.hora != null ? slotIndexForOp(e.hora) : -1; };
const plannedOp = (e) => { const i = slotIdx(e.slot); if (i >= 0) return slotOp(SLOTS[i]); return e.hora ?? null; };
function slotLabel(e) { const i = slotIdx(e.slot); if (i >= 0) return TURNOS[SLOTS[i].turno].n; return e.hora != null ? 'imprevisto' : 'sem janela'; }
// lê números no formato brasileiro: 456 · 456,000 · 1.500,000 · 22,5 · 22.000
function parseNum(v) {
  let s = String(v ?? '').trim().replace(/\s/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/\.\d{3}(\.|$)/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return isFinite(n) && n > 0 ? n : null;
}
const parseQty = parseNum;
// sempre com 3 casas, como nos sistemas da empresa: 456 -> 456,000 · 22000 -> 22.000,000
const fmt3 = (n) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const fmtQty = (n, un) => `${fmt3(n)} ${un || 'kg'}`;
// peso do carro: digitado em toneladas (22 ou 22,5); se vier já em kg (>= 1000) mantém
function parsePesoKg(v) {
  const n = parseNum(v);
  if (n == null) return null;
  return n >= 1000 ? n : Math.round(n * 1000 * 1000) / 1000;
}
// cada caminhão pode ter vários reprocessos: { qtd, un, lote }
const getReps = (e) => e.reps ?? (e.repQtd ? [{ qtd: e.repQtd, un: e.repUn || 'kg', lote: '' }] : []);
function repTotals(list) {
  const t = {};
  list.forEach((e) => getReps(e).forEach((r) => { if (r.qtd) t[r.un || 'kg'] = (t[r.un || 'kg'] || 0) + Number(r.qtd); }));
  return Object.entries(t).map(([u, n]) => fmtQty(n, u)).join(' + ');
}
// etiquetas do caminhão — tocar copia o valor (para colar nos sistemas)
const copyChip = (cls, icon, label, value, extra = '') =>
  `<span class="ichip copyable ${cls}" role="button" tabindex="0" data-copy="${esc(value)}" title="Toque para copiar ${esc(value)}">${icon}${label} ${esc(value)}${extra}</span>`;
function infoChips(e, k) {
  const out = [];
  if (isImp(e)) out.push(`<span class="ichip imp">${I.alarm}Imprevisto ${opToHHMM(e.hora)}</span>`);
  const tr = transitInfo(e, k);
  if (tr) out.push(`<span class="ichip transit ${tr.late > 0 ? 'late' : ''}" title="Saiu ${fmtDayTime(e.saida)}">${I.route}${esc(e.origemN || 'Percurso')} · ${tr.arrived ? 'previsto' : 'chega'} ${fmtDayTime(tr.arr)}${tr.late > 0 ? ` · ${fmtDelta(tr.late)} após a janela` : ''}</span>`);
  if (e.peso) out.push(copyChip('peso', I.weight, 'Peso', fmt3(e.peso)));
  getReps(e).forEach((r) => {
    if (r.qtd) out.push(copyChip('rep', I.recycle, 'Reprocesso', fmt3(r.qtd), ` ${esc(r.un || 'kg')}`));
    if (r.lote) out.push(copyChip('rep rep-lote', I.hash, 'Lote reproc.', r.lote));
  });
  if (e.os) out.push(copyChip('', I.file, 'Ordem', e.os));
  if (e.op) out.push(copyChip('', I.hash, 'Lote', e.op));
  if (e.ticket) out.push(copyChip('ticket', I.calClock, 'Ticket', e.ticket));
  return out.join('');
}
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e2) { /* sem cópia */ }
    ta.remove();
  }
  toast(`Copiado: ${txt}`);
}
function startOp(e, k) {
  if (e.t?.inicio) return msToOp(k, e.t.inicio);
  if (e.ajuste != null) return e.ajuste;
  return plannedOp(e);
}
function endOp(e, k) {
  if (e.t?.fim) return msToOp(k, e.t.fim);
  const s = startOp(e, k);
  return s == null ? null : s + durMin(e);
}
function lateNoShow(e, k) {
  if (e.status !== 'programado' || k !== currentOpDayKey()) return 0;
  const target = e.ajuste ?? plannedOp(e);
  if (target == null) return 0;
  const late = nowOp(k) - target;
  return late > 10 ? late : 0;
}
function sortPlan(list, k) {
  return [...list].sort((a, b) => {
    const sa = k ? startOp(a, k) : plannedOp(a), sb = k ? startOp(b, k) : plannedOp(b);
    return (sa ?? 9999) - (sb ?? 9999) || (a.created || 0) - (b.created || 0);
  });
}
function layout(list) {
  const occ = SLOTS.map(() => ({ fill: 0, items: [] }));
  const unassigned = [], cancelled = [], overflow = [];
  let used = 0;
  list.forEach((e) => {
    if (e.status === 'cancelado') { cancelled.push(e); return; }
    const w = weightOf(e);
    used += w;
    const i0 = effSlotIdx(e);
    if (i0 < 0) { unassigned.push(e); return; }
    let rem = w, i = i0, first = true;
    while (rem > 1e-9 && i < SLOTS.length) {
      const take = Math.min(rem, 1);
      occ[i].fill += take;
      occ[i].items.push({ e, take, cont: !first });
      rem -= take; first = false; i++;
    }
    if (rem > 1e-9) overflow.push({ e, rem });
  });
  return { occ, unassigned, cancelled, overflow, used };
}
// linha do tempo real (uma linha de envase): detecta sobreposições
function schedule(k) {
  const items = active(getPlan(k))
    .map((e) => ({ e, s: startOp(e, k), en: endOp(e, k), p: plannedOp(e) }))
    .filter((x) => x.s != null)
    .sort((a, b) => a.s - b.s);
  const overlaps = [];
  for (let i = 1; i < items.length; i++) {
    const prevEnd = Math.max(...items.slice(0, i).map((x) => x.en));
    if (items[i].s < prevEnd - 5) { items[i].overlap = prevEnd - items[i].s; overlaps.push(items[i]); }
  }
  const lastEnd = items.length ? Math.max(...items.map((x) => x.en)) : null;
  return { items, overlaps, lastEnd };
}
// empurra os caminhões seguintes que ficarem sobrepostos (opera sobre a lista recebida)
function cascadeList(list, k, fromId) {
  const items = active(list).map((e) => ({ e, s: startOp(e, k) })).filter((x) => x.s != null).sort((a, b) => a.s - b.s);
  const i = items.findIndex((x) => x.e.id === fromId);
  if (i < 0) return [];
  let prevEnd = endOp(items[i].e, k);
  const aff = [];
  for (let j = i + 1; j < items.length; j++) {
    const e = items[j].e;
    if (e.t?.inicio || e.status === 'concluido') { prevEnd = Math.max(prevEnd, endOp(e, k)); continue; }
    if (startOp(e, k) < prevEnd - 0.5) {
      e.ajuste = Math.round(prevEnd);
      if (!e.motivo) e.motivo = 'Empurrado pelo anterior';
      aff.push(e);
    }
    prevEnd = Math.max(prevEnd, endOp(e, k));
  }
  return aff;
}
function simulateCascade(k, id, mutate) {
  const clone = JSON.parse(JSON.stringify(getPlan(k)));
  const e = clone.find((x) => x.id === id);
  if (!e) return [];
  mutate(e);
  return cascadeList(clone, k, id);
}
// Horários realmente disponíveis do dia, considerando imprevistos, atrasos e envases longos.
// Se a janela está tomada por um envase em andamento, o horário vai para o fim dele (ex.: 14:30 -> 15:30)
// e os seguintes se reajustam em cadeia (cada horário sugerido conta como um envase de 3 h).
// opts.chain=false: sem cadeia (usado no Percurso, que agenda 1 caminhão); opts.from: não sugerir antes disso.
function freeSuggestions(k, durStd = 180, opts = {}) {
  const chain = opts.chain !== false;
  const from = opts.from ?? -Infinity;
  const items = schedule(k).items.map((x) => ({ s: x.s, e: x.en, m: x.e.material }));
  const L = layout(getPlan(k));
  const out = [];
  let chainEnd = -Infinity, chainCause = '';
  SLOTS.forEach((sl, i) => {
    if (L.occ[i].fill >= 1 - 1e-9) return; // janela já tem caminhão
    const base = slotOp(sl);
    if (base < from - 0.5 && !chain) return;
    let t = Math.max(base, from), cause = '';
    if (chain && chainEnd > t) { t = chainEnd; cause = chainCause; }
    // pula envases reais que estejam ocupando a linha nesse horário
    for (let moved = true; moved;) {
      moved = false;
      for (const it of items) if (it.s <= t + 0.5 && it.e > t + 0.5) { t = it.e; cause = it.m; moved = true; }
    }
    t = Math.round(t);
    const shifted = t - base >= 5;
    const next = items.filter((it) => it.s > t + 0.5).sort((a, b) => a.s - b.s)[0];
    const room = next ? next.s - t : Infinity;
    out.push({ i, slot: sl, base, t, shifted, cause, room, next: next?.m, tight: room < durStd - 1, fitsDay: t + durStd <= 1440 + 0.5 });
    // a cadeia só continua enquanto os horários estiverem deslocados
    if (shifted) { chainEnd = t + durStd; chainCause = `@seguindo as ${opToHHMM(t)} + ${untilText(durStd)}`; } else { chainEnd = -Infinity; chainCause = ''; }
  });
  return out;
}
const prepDone = (e) => PREP.filter((p) => e.prep?.[p.k]).length;
const nextPrepOf = (e) => PREP.find((p) => !e.prep?.[p.k]);

/* ================= Sequência (checklist) ================= */
const progDayOf = (dayKey) => keyOf(nextOpDay(fromKey(dayKey)));
function subState(dayKey, sub) {
  const trucks = active(getPlan(progDayOf(dayKey)));
  if (trucks.length) {
    const done = trucks.filter((e) => e.prep?.[sub.prep]);
    const at = done.length === trucks.length ? Math.max(...done.map((e) => e.prep[sub.prep])) : null;
    return { derived: true, n: done.length, total: trucks.length, done: done.length === trucks.length, at };
  }
  const at = getDay(dayKey).checks[sub.id];
  return { derived: false, done: !!at, at };
}
function leafList(dayKey) {
  const out = [];
  const day = getDay(dayKey);
  SEQ.forEach((it) => {
    if (it.sub) it.sub.forEach((s) => out.push({ id: s.id, done: subState(dayKey, s).done }));
    else out.push({ id: it.id, done: !!day.checks[it.id] });
  });
  day.extras.forEach((e) => out.push({ id: 'x-' + e.id, done: !!e.done }));
  return out;
}
function dayProgress(dayKey) {
  const l = leafList(dayKey);
  const done = l.filter((x) => x.done).length;
  return { done, total: l.length, pct: l.length ? Math.round((done / l.length) * 100) : 0 };
}
function nextPending(dayKey) {
  const day = getDay(dayKey);
  const pk = progDayOf(dayKey);
  for (let i = 0; i < SEQ.length; i++) {
    const it = SEQ[i];
    if (it.sub) {
      for (let j = 0; j < it.sub.length; j++) {
        const s = it.sub[j];
        const st = subState(dayKey, s);
        if (st.done) continue;
        if (st.derived) {
          const truck = sortPlan(active(getPlan(pk))).find((e) => !e.prep?.[s.prep]);
          return { kind: 'prep', sub: s, num: `${i + 1}.${j + 1}`, truck, st, pk, parent: it };
        }
        return { kind: 'check', id: s.id, title: s.title, c: s.c, num: `${i + 1}.${j + 1}`, sub: it.title };
      }
    } else if (!day.checks[it.id]) return { kind: 'check', id: it.id, title: it.title, c: it.c, num: String(i + 1), sub: it.desc };
  }
  const ex = day.extras.find((e) => !e.done);
  if (ex) return { kind: 'check', id: 'x-' + ex.id, title: ex.title, c: 'gold', num: '✦', sub: 'Tarefa avulsa' };
  return null;
}
function toggleCheck(id, force) {
  const day = ensureDay(todayKey());
  if (id.startsWith('x-')) {
    const ex = day.extras.find((e) => 'x-' + e.id === id);
    if (ex) { ex.done = force ?? !ex.done; ex.at = ex.done ? Date.now() : null; }
  } else {
    const on = force ?? !day.checks[id];
    if (on) day.checks[id] = day.checks[id] || Date.now(); else delete day.checks[id];
  }
  save();
}
// marca/desmarca uma etapa em todos os caminhões de um dia (com desfazer)
function setStepAll(k, stepKey, on) {
  const trucks = active(getPlan(k));
  const snap = trucks.map((e) => [e, e.prep?.[stepKey]]);
  let n = 0;
  trucks.forEach((e) => {
    e.prep ||= {};
    if (on && !e.prep[stepKey]) { e.prep[stepKey] = Date.now(); n++; }
    if (!on && e.prep[stepKey]) { delete e.prep[stepKey]; n++; }
  });
  save(); render();
  const p = PREP.find((x) => x.k === stepKey);
  toast(on ? `${p.l} confirmada em ${n} ${n === 1 ? 'caminhão' : 'caminhões'}` : `${p.l} desmarcada em todos`, 'Desfazer', () => {
    snap.forEach(([e, v]) => { if (v) e.prep[stepKey] = v; else delete e.prep[stepKey]; });
    save(); render();
  });
}
function setPrep(k, id, stepKey, on) {
  const e = findTruck(k, id);
  if (!e) return null;
  e.prep ||= {};
  const val = on ?? !e.prep[stepKey];
  if (val) e.prep[stepKey] = e.prep[stepKey] || Date.now(); else delete e.prep[stepKey];
  save();
  return e;
}

/* ================= UI geral ================= */
const TABS = ['hoje', 'agenda', 'preparo', 'percurso', 'historico'];
let currentTab = 'hoje';
let agDay = currentOpDayKey() || keyOf(nextOpDay(new Date()));
let prDay = keyOf(nextOpDay(new Date()));
let lastToday = todayKey();
const openTrucks = new Set();
let lastRulerDay = null;

function setTab(tab, push = true) {
  if (!TABS.includes(tab)) tab = 'hoje';
  currentTab = tab;
  $$('.view').forEach((v) => (v.hidden = v.id !== 'view-' + tab));
  $$('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  $('#fab').hidden = tab !== 'agenda';
  if (push && location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab);
  lastRulerDay = null;
  render();
  window.scrollTo(0, 0);
}

let toastTimer;
let lastUndo = null; // última ação que pode ser desfeita (atalho Z)
function toast(msg, action, fn) {
  if (action === 'Desfazer') lastUndo = fn;
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button type="button">${esc(action)}</button>` : '');
  if (action) t.querySelector('button').onclick = () => { t.classList.remove('show'); fn(); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 6000 : 2600);
}

// tema (Noite Real, Pergaminho, Carmesim, Cavaleiro), cor de destaque, densidade e tamanho da letra
function applyTheme() {
  const st = S.settings;
  let t = st.theme || 'dark';
  if (t === 'auto') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const root = document.documentElement;
  root.dataset.theme = t;
  root.dataset.mode = t === 'light' ? 'light' : 'dark';
  root.dataset.accent = !st.accent || st.accent === 'auto' ? (t === 'knight' ? 'silver' : 'gold') : st.accent;
  root.dataset.density = st.density || 'comfort';
  root.dataset.font = st.font || 'M';
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  if (bg) $('meta[name=theme-color]').content = bg;
  const mark = (sel, attr, val) => $$(sel).forEach((b) => b.classList.toggle('active', b.dataset[attr] === val));
  mark('[data-theme-set]', 'themeSet', st.theme || 'dark');
  mark('[data-accent-set]', 'accentSet', st.accent || 'auto');
  mark('[data-density-set]', 'densitySet', st.density || 'comfort');
  mark('[data-font-set]', 'fontSet', st.font || 'M');
  const ni = $('#nameInput');
  if (ni && document.activeElement !== ni) ni.value = st.name || '';
}
function greeting() {
  const h = new Date().getHours();
  const g = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return S.settings.name ? `${g}, ${S.settings.name}` : g;
}
const tagsHtml = (tags) => (tags || []).map((t) => `<span class="tag c-${TAGS[t] || 'gold'}">${esc(t)}</span>`).join('');
const statusPill = (e) => `<span class="status-pill st-${e.status}">${STATUS[e.status] || e.status}</span>`;
const mono = (e) => `<span class="tico" title="${esc(TYPES[e.tipo]?.n || '')}">${I[TYPES[e.tipo]?.ic] || ''}</span>`;
function delayHtml(min) {
  if (min == null || Math.abs(min) < 1) return '';
  return `<span class="delay ${min > 0 ? 'late' : 'early'}">${fmtDelta(min)}</span>`;
}

/* ================= Render: HOJE ================= */
function nextTruckInfo() {
  const k = currentOpDayKey();
  if (!k) return null;
  const now = nowOp(k);
  const items = schedule(k).items;
  const running = items.find((x) => x.e.status === 'envasando');
  const nextT = items.find((x) => x.e.status === 'programado' || x.e.status === 'chegou');
  return { k, now, running, nextT };
}
// texto de quando o próximo caminhão entra: "em 2h10", "agora" ou "na fila para envase"
function whenText(x, now) {
  if (x.e.status === 'chegou') return 'na fila para envase';
  const d = x.s - now;
  return d <= 1 ? 'agora' : 'em ' + untilText(d);
}
function nextWindowInfo() {
  const n = new Date();
  const cands = [];
  [addDays(n, -1), n, nextOpDay(n)].forEach((d) => {
    if (!isOpDay(d)) return;
    const k = keyOf(d);
    SLOTS.forEach((s) => cands.push({ k, s, at: opStartMs(k) + slotOp(s) * 60000 }));
  });
  return cands.sort((a, b) => a.at - b.at).find((c) => c.at > Date.now());
}

function renderHero() {
  const now = new Date();
  const k = todayKey();
  const p = dayProgress(k);
  const R = 46, C = 2 * Math.PI * R;
  const off = C * (1 - p.pct / 100);
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI;
    return `<line class="tick" x1="${56 + 53 * Math.cos(a)}" y1="${56 + 53 * Math.sin(a)}" x2="${56 + 55.5 * Math.cos(a)}" y2="${56 + 55.5 * Math.sin(a)}"/>`;
  }).join('');
  let chips = '';
  const nt = nextTruckInfo();
  if (nt?.running) chips += `<span class="chip live"><span class="dot-live"></span>Envasando · ${esc(nt.running.e.material)} · término ~${opToHHMM(nt.running.en)}</span>`;
  if (nt?.nextT) {
    const x = nt.nextT;
    const late = lateNoShow(x.e, nt.k);
    chips += late
      ? `<span class="chip warn">${I.alert}${esc(x.e.material)} (${opToHHMM(x.s)}) sem chegada · ${fmtDelta(late)}</span>`
      : `<span class="chip gold">${I.truck}Próximo caminhão ${opToHHMM(x.s)} · ${esc(x.e.material)} · ${whenText(x, nt.now)}</span>`;
  } else {
    const w = nextWindowInfo();
    if (w) chips += `<span class="chip gold">${I.clock}Próxima janela ${w.s.t}${w.k !== k && !w.s.next ? ' (' + fmtShort(fromKey(w.k)) + ')' : ''} · em ${untilText((w.at - Date.now()) / 60000)}</span>`;
  }
  const trs = transitTrucks().filter((x) => x.arr > Date.now());
  if (trs.length) chips += `<span class="chip transit-chip" data-goto="percurso">${I.route}${trs.length} em trânsito · próximo chega ${fmtDayTime(trs[0].arr)}</span>`;
  chips += `<span class="chip">${I.back}Dia anterior de envase: ${fmtShort(prevOpDay(now))}</span>`;

  $('#hero').innerHTML = `
    <div class="hero-crest">${I.crest}</div>
    <div class="ring" role="img" aria-label="${p.pct}% concluído">
      <svg viewBox="0 0 112 112">
        <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style="stop-color:var(--gold-hi)"/><stop offset="60%" style="stop-color:var(--gold)"/><stop offset="100%" style="stop-color:var(--purple)"/>
        </linearGradient></defs>
        ${ticks}
        <circle class="bg" cx="56" cy="56" r="${R}"/>
        <circle class="fg" cx="56" cy="56" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/>
      </svg>
      <div class="val"><div><b data-count="ring" data-to="${p.pct}" data-suffix="%" class="${p.pct === 100 ? 'full' : ''}">${p.pct}%</b><small>${p.done} de ${p.total}</small></div></div>
    </div>
    <div>
      <span class="eyebrow">${esc(greeting())}</span>
      <h1>${esc(fmtLong(now))}</h1>
      <p class="muted">${p.done === p.total ? 'Sequência do dia concluída. Impecável.' : `Faltam ${p.total - p.done} etapa${p.total - p.done > 1 ? 's' : ''} na sequência de hoje.`}</p>
    </div>
    <div class="hero-meta">${chips}</div>`;
}

function renderNextStep() {
  const n = nextPending(todayKey());
  const el = $('#nextStep');
  if (!n) {
    el.className = 'next-step done';
    el.innerHTML = `<div class="ns-icon">${I.check}</div><div class="ns-body"><div class="ns-label">Tudo feito</div><div class="ns-title">Sequência Filling concluída hoje</div></div>`;
    return;
  }
  if (n.kind === 'prep') {
    const p = PREP.find((x) => x.k === n.sub.prep);
    const e = n.truck;
    const tm = startOp(e, n.pk);
    const left = n.st.total - n.st.n;
    el.className = `next-step c-${p.c}`;
    el.innerHTML = `
      <div class="ns-icon">${I[p.ic]}</div>
      <div class="ns-body">
        <div class="ns-label">Próximo passo · ${esc(p.l)} · caminhão ${n.st.n + 1} de ${n.st.total}</div>
        <div class="ns-title">${esc(p.full)}</div>
        <div class="ns-sub">${tm != null ? `<b>${opToHHMM(tm)}</b> · ` : ''}<b>${esc(e.material)}</b>${e.os ? ' · Ordem ' + esc(e.os) : ''} — ${fmtShort(fromKey(n.pk))}</div>
      </div>
      <div class="ns-actions">
        <button class="btn btn-step c-${p.c}" data-prep-one="${p.k}" data-env="${e.id}" data-day="${n.pk}" title="Atalho: C">${I.check} Confirmar neste</button>
        ${left > 1 ? `<button class="btn btn-step outline c-${p.c}" data-step-all="${p.k}" data-day="${n.pk}" title="Atalho: E">Em todos (${left})</button>` : ''}
      </div>`;
    return;
  }
  el.className = `next-step c-${n.c}`;
  el.innerHTML = `
    <div class="ns-icon">${esc(n.num)}</div>
    <div class="ns-body">
      <div class="ns-label">Próximo passo</div>
      <div class="ns-title">${esc(n.title)}</div>
      ${n.sub ? `<div class="ns-sub">${esc(n.sub)}</div>` : ''}
    </div>
    <div class="ns-actions"><button class="btn btn-primary" data-complete="${esc(n.id)}" title="Atalho: C">${I.check} Concluir</button></div>`;
}

function renderSeq() {
  const k = todayKey();
  const day = getDay(k);
  const nx = nextPending(k);
  const nxId = nx ? (nx.kind === 'prep' ? nx.sub.id : nx.id) : null;
  const pk = progDayOf(k);
  const pkLabel = fmtShort(fromKey(pk));
  let html = '';

  SEQ.forEach((it, i) => {
    const num = i + 1;
    if (!it.sub) {
      const done = !!day.checks[it.id];
      html += `
        <li class="task c-${it.c} ${done ? 'done' : ''} ${nxId === it.id ? 'is-next' : ''}">
          <button class="medal" data-toggle="${it.id}" aria-label="Marcar etapa ${num}" aria-pressed="${done}"><span>${num}</span>${I.check}</button>
          <div class="task-body">
            <div class="task-title" data-toggle="${it.id}">${esc(it.title)}</div>
            ${it.desc ? `<div class="task-desc">${esc(it.desc)}</div>` : ''}
            ${(it.tags || done || seqExtra(it)) ? `<div class="task-meta">${tagsHtml(it.tags)}${seqExtra(it)}${done ? `<span class="time">✓ ${fmtTime(day.checks[it.id])}</span>` : ''}</div>` : ''}
          </div>
        </li>`;
      return;
    }
    const states = it.sub.map((s) => subState(k, s));
    const d = states.filter((s) => s.done).length;
    const all = d === it.sub.length;
    const trucks = active(getPlan(pk)).length;
    html += `
      <li class="task c-${it.c} ${all ? 'done' : ''}">
        <button class="medal" data-toggle-parent="${it.id}" aria-label="Marcar todas"><span>${num}</span>${I.check}</button>
        <div class="task-body">
          <div class="task-title" data-toggle-parent="${it.id}">${esc(it.title)}</div>
          <div class="task-meta">
            <span class="progress-mini ${all ? 'ok' : ''}">${d}/${it.sub.length} etapas</span>
            <button class="link-btn" data-goto="preparo" data-day="${pk}">Preparo de ${pkLabel}: ${trucks} ${trucks === 1 ? 'caminhão' : 'caminhões'} →</button>
          </div>
          <ol class="subtasks">
            ${it.sub.map((s, j) => {
              const st = states[j];
              return `
              <li class="task c-${s.c} ${st.done ? 'done' : ''} ${nxId === s.id ? 'is-next' : ''}">
                <button class="medal" data-sub="${s.id}" aria-label="Marcar ${esc(s.title)}"><span>${j + 1}</span>${I.check}</button>
                <div class="task-body">
                  <div class="task-title" data-sub="${s.id}">${esc(s.title)}</div>
                  <div class="task-meta">
                    ${tagsHtml(s.tags)}
                    ${st.derived ? `<span class="progress-mini ${st.done ? 'ok' : ''}">${st.n}/${st.total} caminhões</span><span class="sub-bar"><i style="width:${(st.n / st.total) * 100}%"></i></span>` : ''}
                    ${st.done && st.at ? `<span class="time">✓ ${fmtTime(st.at)}</span>` : ''}
                  </div>
                </div>
              </li>`;
            }).join('')}
          </ol>
        </div>
      </li>`;
  });

  day.extras.forEach((ex) => {
    const id = 'x-' + ex.id;
    html += `
      <li class="task c-gold ${ex.done ? 'done' : ''} ${nxId === id ? 'is-next' : ''}">
        <button class="medal" data-toggle="${id}" aria-label="Marcar ${esc(ex.title)}"><span>✦</span>${I.check}</button>
        <div class="task-body">
          <div class="task-title" data-toggle="${id}">${esc(ex.title)}</div>
          <div class="task-meta"><span class="tag c-gold">Avulsa</span>${ex.done && ex.at ? `<span class="time">✓ ${fmtTime(ex.at)}</span>` : ''}</div>
        </div>
        <button class="del-x" data-del-extra="${ex.id}" aria-label="Remover tarefa">${I.x}</button>
      </li>`;
  });

  $('#seqList').innerHTML = html;
  const p = dayProgress(k);
  $('#seqCount').textContent = `${p.done}/${p.total}`;
  $('#seqCount').className = 'pill' + (p.done === p.total ? ' ok' : '');
  $('#seqSub').textContent = `Referente a ${fmtShort(prevOpDay(new Date()))} → programando ${pkLabel}`;
}

// reprocessos do dia anterior aparecem na etapa de reprocesso
function seqExtra(it) {
  if (it.id !== 'reprocesso') return '';
  const pk = keyOf(prevOpDay(new Date()));
  const list = active(getPlan(pk)).filter((e) => getReps(e).length);
  const n = list.reduce((a, e) => a + getReps(e).length, 0);
  if (!n) return '';
  const tot = repTotals(list);
  return `<button class="link-btn rep-link" data-goto="agenda" data-day="${pk}">${I.recycle}${n} reprocesso${n > 1 ? 's' : ''} de ${fmtShort(fromKey(pk))}${tot ? ' · ' + tot : ''} →</button>`;
}

function renderRotina() {
  const day = getDay(todayKey());
  const week = {};
  for (let i = 0; i < 7; i++) {
    const r = S.days[keyOf(addDays(new Date(), -i))]?.routine || {};
    Object.keys(r).forEach((id) => { if (r[id]?.at) week[id] = (week[id] || 0) + 1; });
  }
  $('#rotList').innerHTML = ROTINA.map((r) => {
    const st = day.routine[r.id] || {};
    const done = !!st.at;
    return `
      <li class="task c-gold ${done ? 'done' : ''} ${st.note ? 'open' : ''}">
        <button class="check" data-rot-toggle="${r.id}" aria-label="Marcar ${esc(r.title)}" aria-pressed="${done}">${I.check}</button>
        <div class="task-body">
          <div class="task-title" style="padding-top:2px" data-rot-toggle="${r.id}">${esc(r.title)}</div>
          ${r.desc ? `<div class="task-desc">${esc(r.desc)}</div>` : ''}
          <div class="task-meta">
            <span class="badge-freq ${r.freq}">${r.freq === 'diaria' ? 'Diária' : 'Demanda'}</span>
            ${tagsHtml(r.tags)}
            ${done ? `<span class="time">✓ ${fmtTime(st.at)}</span>` : ''}
            ${week[r.id] ? `<span class="week-count">${week[r.id]}× em 7 dias</span>` : ''}
            <button class="link-btn" data-rot-note-open="${r.id}">${st.note ? 'Editar nota' : '+ nota'}</button>
          </div>
          <div class="rot-note"><input type="text" data-rot-note="${r.id}" value="${esc(st.note || '')}" placeholder="Ex.: NCM aberta / 2 tambores de resíduo" maxlength="160"></div>
        </div>
      </li>`;
  }).join('');
  const daily = ROTINA.filter((r) => r.freq === 'diaria');
  const total = ROTINA.filter((r) => day.routine[r.id]?.at).length;
  $('#rotCount').textContent = `${total} feita${total === 1 ? '' : 's'}`;
  $('#rotCount').className = 'pill' + (daily.every((r) => day.routine[r.id]?.at) ? ' ok' : '');
}

function actionBtn(e, k, small) {
  const f = FLOW[e.status];
  if (!f) return '';
  return `<button class="btn btn-primary ${small ? 'btn-sm' : ''}" data-advance="${e.id}" data-day="${k}">${f.icon}${small ? f.short : f.act}</button>`;
}
function adjustBtn(e, k, small) {
  if (e.status === 'concluido' || e.status === 'cancelado') return '';
  const lbl = e.t?.inicio ? 'Ajustar término' : 'Ajustar horário';
  return `<button class="btn btn-ghost ${small ? 'btn-sm' : ''}" data-adjust="${e.id}" data-day="${k}">${I.clock}${small ? 'Ajustar' : lbl}</button>`;
}

function renderTodayTrucks() {
  const k = currentOpDayKey() || todayKey();
  const sch = schedule(k);
  const list = sortPlan(getPlan(k), k);
  const box = $('#todayTrucks');
  $('#todaySub').textContent = `${fmtShort(fromKey(k))} · chegada, envase e ajustes de horário`;
  if (!list.length) {
    box.innerHTML = `<div class="empty">Nenhum caminhão programado para ${fmtShort(fromKey(k))}.<br>
      <button class="btn btn-ghost btn-sm" data-goto="agenda" data-day="${k}">${I.plus} Programar</button></div>`;
    return;
  }
  const nt = nextTruckInfo();
  let head = '';
  if (nt && nt.k === k && nt.nextT) {
    const late = lateNoShow(nt.nextT.e, k);
    head = `<div class="today-next">${I.truck}<span>Próximo: <b>${opToHHMM(nt.nextT.s)}</b></span><span>${esc(nt.nextT.e.material)} · ${late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : whenText(nt.nextT, nt.now)}</span></div>`;
  }
  box.innerHTML = head + `<div class="truck-list">${list.map((e) => {
    const p = plannedOp(e), s = startOp(e, k);
    const adjusted = p != null && s != null && Math.round(s) !== Math.round(p);
    const late = lateNoShow(e, k);
    const ov = sch.overlaps.find((x) => x.e.id === e.id);
    const sub = '';
    const chips = infoChips(e, k);
    const times = [e.t?.chegada && `chegou ${fmtTime(e.t.chegada)}`, e.t?.inicio && `início ${fmtTime(e.t.inicio)}`, e.t?.fim && `fim ${fmtTime(e.t.fim)}`].filter(Boolean).join(' · ');
    return `<div class="truck-row st-${e.status}">
      <div class="tr-time ${adjusted ? 'adjusted' : ''}">
        <b>${s != null ? opToHHMM(s) : '—'}</b>${adjusted ? `<s>${opToHHMM(p)}</s>` : `<small>${slotLabel(e)}</small>`}
      </div>
      <div class="tr-main">
        <div class="tr-top">${mono(e)}<span class="tr-mat" data-edit="${e.id}" data-day="${k}">${esc(e.material)}</span>${statusPill(e)}${adjusted ? delayHtml(s - p) : ''}${late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : ''}${ov ? `<span class="delay alarm">sobrepõe ${Math.round(ov.overlap)} min</span>` : ''}</div>
        ${chips ? `<div class="tc-info">${chips}</div>` : ''}
        <div class="tr-sub">${esc(sub)}${sub && times ? ' · ' : ''}${times}${e.motivo && adjusted ? ` · <span style="color:var(--warn)">${esc(e.motivo)}</span>` : ''}</div>
        ${e.status !== 'concluido' && e.status !== 'cancelado' ? `<div class="tr-actions">${actionBtn(e, k, true)}${adjustBtn(e, k, true)}</div>` : ''}
      </div>
    </div>`;
  }).join('')}</div>`;
}

let notesTimer;
function renderNotes() {
  const ta = $('#notes');
  if (document.activeElement !== ta) ta.value = getDay(todayKey()).notes || '';
}

/* ================= Seletor de dias ================= */
function dayPicker(sel, attr) {
  const today = new Date();
  const cur = currentOpDayKey();
  const days = [];
  let d = cur ? fromKey(cur) : nextOpDay(today);
  for (let i = 0; i < 6; i++) { days.push(d); d = nextOpDay(d); }
  if (!days.some((x) => keyOf(x) === sel)) days.unshift(fromKey(sel));
  const nk = keyOf(nextOpDay(today));
  return days.map((x) => {
    const k = keyOf(x);
    const tr = active(getPlan(k));
    const used = layout(getPlan(k)).used;
    const lbl = k === todayKey() || k === cur ? 'Hoje' : k === nk ? 'Próx.' : WD[x.getDay()];
    return `<button class="day-chip ${k === sel ? 'active' : ''}" data-${attr}="${k}">
      <small>${lbl}</small><b>${fmtDM(x)}</b><em>${tr.length} cam.</em>
      <span class="dc-cap"><i style="width:${Math.min(100, (used / CAP) * 100)}%"></i></span>
    </button>`;
  }).join('') + `<label class="day-chip date-pick" title="Escolher outra data"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><input type="date" data-${attr}-input value="${sel}"></label>`;
}

/* ================= Render: AGENDA ================= */
function renderRuler(k) {
  const mobile = matchMedia('(max-width: 720px)').matches;
  const sc = mobile ? 0.8 : 1.05;
  const W = 1440 * sc;
  const sch = schedule(k);
  const LBL = 92;
  // faixas: previsto (y=44) e real em pistas (y=96+)
  const lanes = [];
  const placed = sch.items.map((x) => {
    let li = lanes.findIndex((end) => end <= x.s + 1);
    if (li < 0) { lanes.push(0); li = lanes.length - 1; }
    lanes[li] = x.en;
    return { ...x, lane: li };
  });
  const H = 104 + Math.max(1, lanes.length) * 42;
  let html = '';
  // faixas dos turnos (cor de cada hora do dia)
  [{ a: 0, b: 420, c: 'manha', n: 'Manhã' }, { a: 420, b: 810, c: 'tarde', n: 'Tarde' }, { a: 810, b: 1440, c: 'noite', n: 'Noite' }]
    .forEach((x) => { html += `<div class="r-band b-${x.c}" style="left:${LBL + x.a * sc}px;width:${(x.b - x.a) * sc}px"><span>${x.n}</span></div>`; });
  for (let a = 8 * 60; a < 8 * 60 + 1440; a += 60) {
    const op = a - OP0;
    html += `<div class="r-hour" style="left:${LBL + op * sc}px"><span>${pad((a / 60) % 24)}h</span></div>`;
  }
  SLOTS.forEach((s) => { html += `<div class="r-slot" style="left:${LBL + slotOp(s) * sc}px"><span>${s.t}</span></div>`; });
  html += `<div class="r-lane-label" style="top:52px">Previsto</div><div class="r-lane-label" style="top:${104}px">Real</div>`;
  html += `<div class="r-sep" style="top:90px"></div>`;
  sch.items.forEach((x) => {
    if (x.p == null) return;
    const w = Math.max(durMin(x.e) * sc, 34);
    html += `<div class="r-ghost" style="left:${LBL + x.p * sc}px;width:${w}px;top:44px"><b>${opToHHMM(x.p)}</b><span>${esc(x.e.material)}</span></div>`;
  });
  placed.forEach((x) => {
    const w = Math.max((x.en - x.s) * sc, 34);
    const late = (x.p != null && x.s - x.p > 1) || lateNoShow(x.e, k);
    html += `<button class="r-block st-${x.e.status} ${late ? 'late' : ''} ${x.overlap ? 'overlap' : ''}" style="left:${LBL + x.s * sc}px;width:${w}px;top:${98 + x.lane * 42}px" data-edit="${x.e.id}" data-day="${k}" title="${esc(x.e.material)} · ${opToHHMM(x.s)}–${opToHHMM(x.en)}"><b>${opToHHMM(x.s)}–${opToHHMM(x.en)}</b><span>${esc(x.e.material)}</span></button>`;
  });
  let nowX = null;
  if (k === currentOpDayKey()) {
    const n = nowOp(k);
    if (n >= 0 && n <= 1440) { nowX = LBL + n * sc; html += `<div class="r-now" style="left:${nowX}px"></div>`; }
  }
  $('#ruler').innerHTML = `<div class="ruler" style="width:${W + LBL + 20}px;height:${H}px">${html}</div>`;
  if (lastRulerDay !== k) {
    lastRulerDay = k;
    const target = nowX ?? (placed.length ? LBL + placed[0].s * sc : 0);
    const el = $('#rulerScroll');
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = Math.max(0, target - 120);
    el.style.scrollBehavior = '';
  }
}

function tcard(e, k, sch) {
  const p = plannedOp(e), s = startOp(e, k), en = endOp(e, k);
  const adjusted = p != null && s != null && Math.round(s) !== Math.round(p);
  const late = lateNoShow(e, k);
  const ov = sch?.overlaps.find((x) => x.e.id === e.id);
  const sub = infoChips(e, k);
  const pd = prepDone(e);
  const t = TYPES[e.tipo] || TYPES.padrao;
  const order = ['programado', 'chegou', 'envasando', 'concluido'];
  const idx = order.indexOf(e.status);
  const stamps = [null, e.t?.chegada, e.t?.inicio, e.t?.fim];
  const labels = ['Programado', 'Chegada', 'Envase', 'Fim'];
  let times = '';
  if (p != null) times += `<div class="tt"><small>${isImp(e) ? 'Imprevisto' : 'Previsto'}</small><b>${adjusted ? `<s>${opToHHMM(p)}</s>` : opToHHMM(p)}</b></div>`;
  if (s != null && (adjusted || p == null)) times += `<div class="tt gold"><small>${e.t?.inicio ? 'Início real' : 'Ajustado'}</small><b>${opToHHMM(s)}</b>${p != null ? delayHtml(s - p) : ''}</div>`;
  if (en != null) times += `<div class="tt"><small>${e.t?.fim ? 'Fim real' : 'Término prev.'}</small><b>${opToHHMM(en)}</b></div>`;
  times += `<div class="tt"><small>Duração</small><b>${fmtNum(durMin(e) / 60)}h</b></div>`;

  return `<article class="tcard st-${e.status}">
    <div class="tc-top">${mono(e)}<span class="muted small">${esc(t.n)} · ${fmtNum(weightOf(e))} jan.</span><span class="spacer"></span>
      ${late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : ''}${ov ? `<span class="delay alarm">sobrepõe ${Math.round(ov.overlap)} min</span>` : ''}${statusPill(e)}</div>
    <div class="tc-mat" data-edit="${e.id}" data-day="${k}">${esc(e.material)}</div>
    ${sub ? `<div class="tc-info">${sub}</div>` : ''}
    <div class="tc-times">${times}</div>
    ${e.motivo && (adjusted || e.ajuste != null) ? `<div class="tc-motivo">Motivo: ${esc(e.motivo)}</div>` : ''}
    ${e.status !== 'cancelado' ? `<div class="stepper">${order.map((st, i) => `<div class="st-dot ${i <= idx ? 'on' : ''} ${i === idx ? 'cur' : ''}"><i></i><span>${labels[i]}</span><small>${stamps[i] ? fmtTime(stamps[i]) : ''}</small></div>`).join('')}</div>` : ''}
    ${e.obs ? `<div class="tc-obs">${esc(e.obs)}</div>` : ''}
    <div class="prep-dots">
      ${PREP.map((pp) => `<button type="button" class="pdot c-${pp.c} ${e.prep?.[pp.k] ? 'on' : ''}" data-prep-one="${pp.k}" data-env="${e.id}" data-day="${k}" title="${esc(pp.full)}">${e.prep?.[pp.k] ? I.check : I[pp.ic]}${esc(pp.l)}</button>`).join('')}
      <span class="prep-count ${pd === PREP.length ? 'ok' : ''}">${pd}/${PREP.length}</span>
    </div>
    <div class="tc-actions">${actionBtn(e, k, false)}${adjustBtn(e, k, false)}<span class="spacer"></span><button class="btn btn-ghost btn-sm" data-edit="${e.id}" data-day="${k}" data-focus="hora">${I.alarm}Imprevisto</button><button class="btn btn-ghost btn-sm" data-edit="${e.id}" data-day="${k}">${I.edit}Editar</button></div>
  </article>`;
}

function renderAgenda() {
  const k = agDay;
  const d = fromKey(k);
  $('#agDays').innerHTML = dayPicker(k, 'ag');
  const banner = $('#agBanner');
  if (d.getDay() === 6) { banner.hidden = false; banner.className = 'banner'; banner.textContent = 'Sábado: a operação encerra às 07:15 — normalmente não há janelas neste dia.'; }
  else if (d.getDay() === 0) { banner.hidden = false; banner.className = 'banner'; banner.textContent = 'Domingo: sem operação. A semana começa segunda às 07:15.'; }
  else if (d.getDay() === 5) { banner.hidden = false; banner.className = 'banner info'; banner.textContent = 'Sexta: as janelas de 00:30 e 03:00 caem no sábado, antes do encerramento às 07:15.'; }
  else banner.hidden = true;

  renderRuler(k);
  const list = sortPlan(getPlan(k));
  const L = layout(list);
  const sch = schedule(k);
  const cur = currentOpDayKey() === k ? nowOp(k) : null;
  const sugs = freeSuggestions(k);

  let html = '';
  TURNOS.forEach((tu, ti) => {
    const idxs = SLOTS.map((_, i) => i).filter((i) => SLOTS[i].turno === ti);
    const tFill = idxs.reduce((a, i) => a + L.occ[i].fill, 0);
    html += `<section class="turno turno-${ti}"><div class="turno-head"><h3>${tu.icon}${tu.n}</h3><span>${fmtNum(tFill)}/${idxs.length} janelas</span></div>`;
    idxs.forEach((i, j) => {
      const s = SLOTS[i];
      const o = L.occ[i];
      const conflict = o.fill > 1 + 1e-9;
      const so = slotOp(s);
      const nextSo = i + 1 < SLOTS.length ? slotOp(SLOTS[i + 1]) : 1440;
      const isNow = cur != null && cur >= so && cur < nextSo;
      let body = '';
      o.items.filter((x) => x.cont).forEach((c) => {
        body += `<div class="env-cont" data-edit="${c.e.id}" data-day="${k}">↳ continuação de <b>${esc(c.e.material)}</b> · ${fmtNum(c.take)} janela</div>`;
      });
      o.items.filter((x) => !x.cont).forEach((x) => { body += tcard(x.e, k, sch); });
      if (conflict) body += `<div class="conflict-msg">${I.alert}Janela sobrecarregada (${fmtNum(o.fill)} de 1) — considere mover um caminhão.</div>`;
      const sg = sugs.find((x) => x.i === i);
      if (sg) body += sugButton(sg);
      html += `<div class="slot ${conflict ? 'conflict' : ''} ${isNow ? 'is-now' : ''}">
        <div class="slot-time"><b>${s.t}</b>${s.next ? `<small>${fmtShort(addDays(d, 1))}</small>` : ''}${isNow ? '<span class="now-tag">Agora</span>' : ''}</div>
        <div class="slot-bar"><i style="height:${Math.min(100, o.fill * 100)}%"></i></div>
        <div class="slot-body">${body}</div>
      </div>`;
      if (s.after && j < idxs.length - 1) html += `<div class="break">${s.after}</div>`;
    });
    html += `</section>`;
    const last = SLOTS[idxs[idxs.length - 1]];
    if (last.after) html += `<div class="break">${last.after}</div>`;
  });
  $('#timeline').innerHTML = html;

  let un = '';
  if (L.unassigned.length) un += `<div class="unassigned-wrap"><h3>✦ Sem janela definida (${L.unassigned.length})</h3>${L.unassigned.map((e) => tcard(e, k, sch)).join('')}</div>`;
  if (L.cancelled.length) un += `<div class="unassigned-wrap"><h3>✦ Cancelados (${L.cancelled.length})</h3>${L.cancelled.map((e) => tcard(e, k, sch)).join('')}</div>`;
  $('#unassigned').innerHTML = un;

  renderCapacity(k, list, L, sch);
}

// botão de horário disponível dentro do card da janela
function sugButton(sg) {
  const warn = !sg.fitsDay ? ' · termina depois das 07:15' : sg.tight ? ` · só ${untilText(sg.room)} até ${esc(sg.next)}` : '';
  if (!sg.shifted) return `<button class="slot-add" data-add-slot="${sg.slot.id}">${I.plus}Horário livre — agendar caminhão às ${sg.slot.t}${warn ? `<small class="sug-warn">${warn.slice(3)}</small>` : ''}</button>`;
  return `<button class="slot-add shifted" data-add-at="${sg.t}">
    ${I.plus}<span><b>Disponível às ${opToHHMM(sg.t)}</b><small>${sg.cause.startsWith('@') ? `janela ${sg.slot.t} reajustada, ${esc(sg.cause.slice(1))}` : `janela ${sg.slot.t} ocupada até ${opToHHMM(sg.t)}${sg.cause ? ` (${esc(sg.cause)})` : ''}`}${warn}</small></span></button>`;
}

function renderCapacity(k, list, L, sch) {
  const act = active(list);
  const free = CAP - L.used;
  const segs = SLOTS.map((_, i) => `<i style="--f:${Math.max(0, Math.min(1, L.used - i)) * 100}%"></i>`).join('');
  let freeTxt, freeCls;
  if (free < -1e-9) { freeTxt = `Excedeu em ${fmtNum(-free)} janela${-free > 1 ? 's' : ''}`; freeCls = 'bad'; }
  else if (free < 1 - 1e-9) { freeTxt = free > 1e-9 ? `${fmtNum(free)} janela livre — dia praticamente cheio` : 'Capacidade completa'; freeCls = 'full'; }
  else { const n = Math.floor(free + 1e-9); freeTxt = `${fmtNum(free)} ${free > 1 + 1e-9 ? 'janelas livres' : 'janela livre'} · cabe${n > 1 ? 'm' : ''} +${n} carreta${n > 1 ? 's' : ''} padrão`; freeCls = 'ok'; }
  const freeSlots = freeSuggestions(k);

  const concl = act.filter((e) => e.status === 'concluido').length;
  const delays = act.map((e) => { const p = plannedOp(e), s = startOp(e, k); return p != null && s != null ? s - p : 0; });
  const totalDelay = delays.reduce((a, x) => a + Math.max(0, x), 0);
  const ready = act.filter((e) => prepDone(e) === PREP.length).length;

  const alerts = [];
  L.occ.forEach((o, i) => { if (o.fill > 1 + 1e-9) alerts.push(`<div class="alert">Janela ${SLOTS[i].t} sobrecarregada</div>`); });
  sch.overlaps.forEach((x) => alerts.push(`<div class="alert">${esc(x.e.material)} (${opToHHMM(x.s)}) sobrepõe o anterior em ${Math.round(x.overlap)} min</div>`));
  L.overflow.forEach((x) => alerts.push(`<div class="alert">${esc(x.e.material)} passa do fim do dia operacional</div>`));
  if (sch.lastEnd != null && sch.lastEnd > 1440) alerts.push(`<div class="alert">Último envase termina ${opToHHMM(sch.lastEnd)}, depois das 07:15</div>`);
  act.forEach((e) => { const l = lateNoShow(e, k); if (l) alerts.push(`<div class="alert warn">${esc(e.material)} sem chegada · ${fmtDelta(l)} — justificar na Revolog</div>`); });

  $('#capCard').innerHTML = `
    <h3 class="mini-title">${I.gauge}${esc(fmtLong(fromKey(k)))}</h3>
    <div class="cap-big"><b data-count="cap-${k}" data-to="${L.used}" data-dec="1">${fmtNum(L.used)}</b><span>/ ${CAP} janelas</span></div>
    <div class="cap-seg ${free < -1e-9 ? 'over' : ''}">${segs}</div>
    <div class="cap-free ${freeCls}">${freeTxt}</div>
    <div class="free-slots">${freeSlots.map((x) => x.shifted
      ? `<button class="free-slot shifted" data-add-at="${x.t}" title="Janela ${x.slot.t} reajustada">${opToHHMM(x.t)}<small>${x.slot.t}</small></button>`
      : `<button class="free-slot" data-add-slot="${x.slot.id}" title="Agendar neste horário">${x.slot.t}</button>`).join('')}<button class="free-slot imp" data-new-imp>${I.alarm}Imprevisto</button></div>
    <div class="divider">✦</div>
    <div class="cap-stats">
      <div class="stat"><small>1º envase</small><b>${sch.items.length ? opToHHMM(sch.items[0].s) : '—'}</b></div>
      <div class="stat"><small>Término previsto</small><b>${sch.lastEnd != null ? opToHHMM(sch.lastEnd) : '—'}</b></div>
      <div class="stat"><small>Concluídos</small><b>${concl}/${act.length}</b></div>
      <div class="stat"><small>Atraso somado</small><b>${totalDelay ? fmtDelta(totalDelay) : '0'}</b></div>
      <div class="stat"><small>Preparo pronto</small><b>${ready}/${act.length}</b></div>
      <div class="stat stat-rep"><small>${I.recycle}Reprocesso</small><b class="${repTotals(act) ? 'stat-sm' : ''}">${repTotals(act) || '—'}</b></div>
    </div>
    ${alerts.length ? `<div class="alerts">${alerts.join('')}</div>` : ''}
    <button class="btn btn-ghost hide-mobile" style="width:100%;margin-top:14px" data-add-slot="">${I.plus} Novo caminhão</button>`;
}

function renderLegend() {
  $('#legend').innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <li><span class="tico">${I[t.ic]}</span><div>${esc(t.n)}<small>${esc(t.leg)}</small></div><b>${t.w === 'turno' ? 'turno' : fmtNum(t.w) + ' jan.'}</b></li>`).join('') +
    `<li style="grid-template-columns:1fr"><small class="muted">Atrasos reais de chegada e de envase são tratados em <b>Ajustar horário</b> — os seguintes podem ser empurrados automaticamente.</small></li>`;
}

/* ================= Render: PREPARO ================= */
function renderPreparo() {
  const k = prDay;
  $('#prDays').innerHTML = dayPicker(k, 'pr');
  const list = sortPlan(active(getPlan(k)), k);
  const total = list.length * PREP.length;
  const done = list.reduce((a, e) => a + prepDone(e), 0);
  const ready = list.filter((e) => prepDone(e) === PREP.length).length;
  const mode = S.settings.prepMode || 'truck';

  $('#prepSummary').innerHTML = `
    <div class="ps-top">
      <div class="ps-big"><b data-count="prep-${k}" data-to="${done}">${done}</b><span>/ ${total} etapas</span><small>${ready} de ${list.length} ${list.length === 1 ? 'caminhão' : 'caminhões'} pronto${ready === 1 ? '' : 's'} · ${esc(fmtLong(fromKey(k)))}</small></div>
      <div class="seg" role="tablist">
        <button data-prep-mode="truck" class="${mode === 'truck' ? 'active' : ''}">Por caminhão (1 a 1)</button>
        <button data-prep-mode="step" class="${mode === 'step' ? 'active' : ''}">Por etapa (todos)</button>
      </div>
    </div>
    <div class="step-legend">${PREP.map((p, i) => {
      const n = list.filter((e) => e.prep?.[p.k]).length;
      return `<div class="sl-item c-${p.c}"><b><i>${i + 1}</i>${I[p.ic]}${esc(p.l)}</b><small>${n}/${list.length}</small><div class="sub-bar"><i style="width:${list.length ? (n / list.length) * 100 : 0}%"></i></div></div>`;
    }).join('')}</div>`;

  const body = $('#prepBody');
  if (!list.length) {
    body.innerHTML = `<div class="card"><div class="empty">Nenhum caminhão programado para ${fmtShort(fromKey(k))}.<br>
      <button class="btn btn-primary btn-sm" data-goto="agenda" data-day="${k}" data-then-new="1">${I.plus} Agendar caminhão</button></div></div>`;
    return;
  }

  if (mode === 'step') {
    body.innerHTML = `<div class="stepcards">${PREP.map((p, i) => {
      const n = list.filter((e) => e.prep?.[p.k]).length;
      const all = n === list.length;
      return `<section class="stepcard c-${p.c} ${all ? 'done' : ''}">
        <div class="sc-head"><span class="sc-num">${I[p.ic]}</span><div><b><em>${i + 1}</em>${esc(p.full)}</b><small>${n}/${list.length} caminhões</small></div></div>
        <div class="sc-bar"><i style="width:${(n / list.length) * 100}%"></i></div>
        <div class="sc-body">${list.map((e) => {
          const s = startOp(e, k);
          return `<button class="sc-chip ${e.prep?.[p.k] ? 'on' : ''}" data-prep-one="${p.k}" data-env="${e.id}" data-day="${k}">${I.check}<b>${s != null ? opToHHMM(s) : '—'}</b>${esc(e.material)}</button>`;
        }).join('')}</div>
        <div class="sc-foot"><button class="btn btn-step ${all ? 'outline' : ''} btn-sm c-${p.c}" data-step-all="${p.k}" data-day="${k}" data-off="${all ? 1 : ''}">${all ? 'Desmarcar todos' : `${I.check} Confirmar em todos`}</button></div>
      </section>`;
    }).join('')}</div>`;
    return;
  }

  // por caminhão: o primeiro incompleto fica aberto
  const focus = list.find((e) => prepDone(e) < PREP.length);
  if (!openTrucks.size && focus) openTrucks.add(focus.id);
  body.innerHTML = `<div class="pcards">${list.map((e) => {
    const pd = prepDone(e);
    const ready = pd === PREP.length;
    const nxt = nextPrepOf(e);
    const open = openTrucks.has(e.id);
    const s = startOp(e, k);
        return `<article class="pcard ${open ? 'open' : ''} ${ready ? 'ready' : ''}">
      <button class="pc-head" data-pc-toggle="${e.id}" aria-expanded="${open}">
        <div class="pc-time"><b>${s != null ? opToHHMM(s) : '—'}</b><small>${slotLabel(e)}</small></div>
        <div>
          <div class="pc-mat">${mono(e)}${esc(e.material)}${ready ? '<span class="pc-ready">Pronto</span>' : ''}</div>
          <div class="pc-sub">${infoChips(e, k) ? `<span class="tc-info">${infoChips(e, k)}</span>` : esc(TYPES[e.tipo]?.n || '')}</div>
          <div class="pc-dots">${PREP.map((p) => `<i class="c-${p.c} ${e.prep?.[p.k] ? 'on' : ''}"></i>`).join('')}</div>
        </div>
        <div class="pc-right"><span class="pc-count">${pd}/7</span><span class="pc-chev">${I.chev}</span></div>
      </button>
      <div class="pc-body">
        <ol class="psteps">${PREP.map((p, i) => {
          const on = e.prep?.[p.k];
          return `<li><button class="pstep c-${p.c} ${on ? 'done' : ''} ${nxt?.k === p.k ? 'next' : ''}" data-prep-one="${p.k}" data-env="${e.id}" data-day="${k}">
            <span class="ps-num"><span>${i + 1}</span>${I.check}</span>
            <span class="ps-title"><small>${I[p.ic]}${esc(p.l)}</small>${esc(p.full)}</span>
            <span class="ps-time">${on ? fmtTime(on) : ''}</span>
          </button></li>`;
        }).join('')}</ol>
        <div class="pc-foot">
          ${nxt ? `<button class="btn btn-step c-${nxt.c}" data-prep-next="${e.id}" data-day="${k}">${I.check} Confirmar ${esc(nxt.l)}</button>` : `<span class="time">✓ Caminhão pronto</span>`}
          <button class="btn btn-ghost btn-sm" data-truck-all="${e.id}" data-day="${k}">${ready ? 'Desmarcar todas' : 'Marcar todas'}</button>
          <span class="spacer"></span>
          <button class="btn btn-ghost btn-sm" data-edit="${e.id}" data-day="${k}">${I.edit}Editar</button>
        </div>
      </div>
    </article>`;
  }).join('')}</div>`;
}

/* ================= Render: HISTÓRICO ================= */
function renderHistory() {
  const days = [];
  let d = new Date();
  if (!isOpDay(d)) d = prevOpDay(d);
  for (let i = 0; i < 14; i++) { days.push(d); d = prevOpDay(d); }
  const rows = days.map((x) => {
    const k = keyOf(x);
    const has = !!S.days[k];
    const p = dayProgress(k);
    const day = getDay(k);
    const rot = Object.values(day.routine || {}).filter((r) => r?.at).length;
    const plan = active(getPlan(k));
    const conc = plan.filter((e) => e.status === 'concluido').length;
    const delays = plan.map((e) => (e.t?.chegada && plannedOp(e) != null ? msToOp(k, e.t.chegada) - plannedOp(e) : null)).filter((v) => v != null);
    const avgDelay = delays.length ? delays.reduce((a, v) => a + Math.max(0, v), 0) / delays.length : null;
    return { x, k, has, p, rot, plan, conc, avgDelay, notes: day.notes };
  });
  const withData = rows.filter((r) => r.has);
  const avg = withData.length ? Math.round(withData.reduce((a, r) => a + r.p.pct, 0) / withData.length) : 0;
  const envTotal = rows.reduce((a, r) => a + r.plan.length, 0);
  const dl = rows.filter((r) => r.avgDelay != null);
  const avgDelay = dl.length ? dl.reduce((a, r) => a + r.avgDelay, 0) / dl.length : null;

  $('#history').innerHTML = `
    <div class="hist-cards">
      <div class="stat"><small>Média de conclusão</small><b data-count="hist-avg" data-to="${avg}" data-suffix="%">${avg}%</b></div>
      <div class="stat"><small>Dias 100%</small><b>${withData.filter((r) => r.p.pct === 100).length}</b></div>
      <div class="stat"><small>Caminhões</small><b>${envTotal}</b></div>
      <div class="stat"><small>Atraso médio na chegada</small><b>${avgDelay != null ? fmtDelta(avgDelay) : '—'}</b></div>
    </div>
    <section class="card" style="margin-bottom:18px">
      <div class="card-head"><div><h2>Conclusão da sequência</h2><p class="muted">% de etapas concluídas por dia</p></div></div>
      <div class="hist-chart">${[...rows].reverse().map((r) => `
        <div class="bar ${r.p.pct ? '' : 'zero'}" title="${fmtShort(r.x)}: ${r.p.pct}%">
          ${r.has ? `<em>${r.p.pct}</em>` : ''}<i style="height:${Math.max(2, r.p.pct)}%"></i><small>${fmtDM(r.x)}</small>
        </div>`).join('')}</div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Dia a dia</h2><p class="muted">Toque em um dia para abrir a agenda dele</p></div></div>
      <div class="hist-list">${rows.map((r) => `
        <div class="hist-row ${r.k === todayKey() ? 'today' : ''}" data-goto="agenda" data-day="${r.k}">
          <div class="hr-date"><b>${fmtDM(r.x)}</b><small>${WDL[r.x.getDay()]}</small></div>
          <div class="hr-bar"><i style="width:${r.p.pct}%"></i></div>
          <div class="hr-info"><span><b>${r.p.pct}%</b> sequência</span><span><b>${r.conc}/${r.plan.length}</b> caminhões</span>${r.avgDelay != null ? `<span>atraso <b>${fmtDelta(r.avgDelay)}</b></span>` : ''}<span><b>${r.rot}</b> rotinas</span></div>
          ${r.notes ? `<div class="hist-notes">${esc(r.notes)}</div>` : ''}
        </div>`).join('')}</div>
    </section>`;
}

/* ================= Microanimações ================= */
function pop(el) {
  if (!el) return;
  el.classList.add('pop');
  el.closest('.task')?.classList.add('shine');
}
// números sobem contando até o valor novo
const countCache = {};
function animateCounts() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('[data-count]').forEach((el) => {
    const key = el.dataset.count, to = Number(el.dataset.to), dec = Number(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    const from = countCache[key] ?? 0;
    countCache[key] = to;
    if (reduce || from === to) return;
    const fmt = (v) => (dec ? (Math.round(v * 10) / 10).toLocaleString('pt-BR') : Math.round(v).toLocaleString('pt-BR')) + suf;
    const t0 = performance.now(), dur = 650;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
// celebração quando a sequência do dia chega a 100%
let lastPct = null, lastPctKey = null;
function checkCelebrate() {
  const k = todayKey();
  if (k !== lastPctKey) { lastPctKey = k; lastPct = null; }
  const p = dayProgress(k).pct;
  if (lastPct !== null && lastPct < 100 && p === 100) celebrate();
  lastPct = p;
}
function celebrate() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('.celebrate')?.remove();
  const wrap = document.createElement('div');
  wrap.className = 'celebrate';
  if (!reduce) {
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('i');
      const size = 5 + Math.random() * 8;
      p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-delay:${Math.random() * 0.9}s;animation-duration:${2.3 + Math.random() * 1.7}s;--x:${Math.random() * 140 - 70}px;--r:${Math.random() * 900 - 450}deg`;
      wrap.appendChild(p);
    }
  }
  wrap.insertAdjacentHTML('beforeend', `<div class="seal">${I.crown}<b>Dia concluído</b><small>Sequência Filling 100%</small></div>`);
  document.body.appendChild(wrap);
  wrap.querySelector('.seal').addEventListener('click', () => wrap.remove());
  setTimeout(() => wrap.remove(), 4300);
}

/* ================= Percurso (viagem até a fábrica) ================= */
const origins = () => (S.settings.origens ||= [{ id: 'gua', n: 'Guaratinguetá', h: 12 }]);
const fmtDayTime = (ms) => { const d = new Date(ms); const t = keyOf(d) === todayKey() ? 'hoje' : fmtShort(d); return `${t} ${fmtTime(ms)}`; };
const toLocalInput = (ms) => { const d = new Date(ms); return `${keyOf(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromLocalInput = (v) => { if (!v) return null; const [dt, tm] = v.split('T'); const [y, m, d] = dt.split('-').map(Number); const [h, mi] = (tm || '0:0').split(':').map(Number); return new Date(y, m - 1, d, h, mi).getTime(); };
// dia operacional de um instante (antes das 07:15 pertence ao dia anterior)
function opDayOfMs(ms) {
  const d = new Date(ms);
  const day = d.getHours() * 60 + d.getMinutes() < OP0 ? addDays(d, -1) : d;
  return isOpDay(day) ? keyOf(day) : null;
}
function transitInfo(e, k) {
  if (!e.saida || !e.viagemH || e.status === 'cancelado') return null;
  if (e.status !== 'programado') return null; // já chegou
  const arr = e.saida + e.viagemH * 3600e3;
  let late = 0;
  if (k) { const p = e.ajuste ?? plannedOp(e); if (p != null) late = (arr - (opStartMs(k) + p * 60000)) / 60000; }
  return { arr, late: late > 1 ? late : 0, arrived: Date.now() > arr };
}
function transitTrucks() {
  const out = [];
  Object.entries(S.plan).forEach(([k, list]) => list.forEach((e) => {
    const tr = transitInfo(e, k);
    if (tr && tr.arr > Date.now() - 24 * 3600e3) out.push({ k, e, ...tr });
  }));
  return out.sort((a, b) => a.arr - b.arr);
}
// cabe um envase de peso w a partir da janela idx?
function fitsAt(L, idx, w) {
  let rem = w, i = idx;
  while (rem > 1e-9 && i < SLOTS.length) {
    if (1 - L.occ[i].fill < Math.min(rem, 1) - 1e-9) return false;
    rem -= 1; i++;
  }
  return rem <= 1e-9;
}
// todas as janelas depois da chegada (com folga), nos próximos dias de operação
function windowsAfter(arrMs, folgaMin, tipo, count = 12) {
  const out = [];
  const base = new Date(arrMs);
  const minAt = arrMs + folgaMin * 60000;
  for (let i = -1; i < 12 && out.length < count; i++) {
    const day = addDays(base, i);
    if (!isOpDay(day)) continue;
    const k = keyOf(day);
    const dur = tipo === 'tambor' ? 360 : durMin({ tipo, dur: 'auto', janelas: 'auto' });
    freeSuggestions(k, dur, { chain: false, from: msToOp(k, minAt) }).forEach((sg) => {
      if (out.length >= count) return;
      const at = opStartMs(k) + sg.t * 60000;
      if (at < minAt - 30000 || out.some((o) => o.k === k && o.t === sg.t)) return;
      out.push({ k, s: sg.slot, idx: sg.i, at, t: sg.t, shifted: sg.shifted, cause: sg.cause, room: sg.room, next: sg.next,
        fits: !sg.tight && sg.fitsDay, tight: sg.tight, fitsDay: sg.fitsDay, wait: (at - arrMs) / 60000 });
    });
  }
  return out;
}
let calc = null;
function initCalc() {
  if (calc) return;
  const n = new Date();
  const org = origins().find((o) => o.id === S.settings.calcOrg) || origins()[0];
  calc = { org: org?.id || '', h: org?.h ?? 12, date: keyOf(n), time: `${pad(n.getHours())}:${pad(n.getMinutes())}`, tipo: 'padrao', folga: 0 };
}
function calcTimes() {
  const [y, m, d] = calc.date.split('-').map(Number);
  const [hh, mm] = (calc.time || '00:00').split(':').map(Number);
  const dep = new Date(y, m - 1, d, hh || 0, mm || 0).getTime();
  return { dep, arr: dep + Number(calc.h || 0) * 3600e3 };
}
function renderPercurso() {
  initCalc();
  const os = origins();
  $('#pcCalc').innerHTML = `
    <div class="card-head"><div><h2><span class="h-ico">${I.route}</span>Saída do caminhão</h2><p class="muted">Tempo de viagem já vem da origem</p></div></div>
    <div class="form-grid calc-grid">
      <label>Origem
        <select id="cOrg">${os.map((o) => `<option value="${o.id}" ${o.id === calc.org ? 'selected' : ''}>${esc(o.n)} (${fmtNum(o.h)} h)</option>`).join('')}</select>
      </label>
      <label>Tempo de viagem (h)
        <input id="cH" type="text" inputmode="decimal" value="${String(calc.h).replace('.', ',')}" maxlength="5">
      </label>
      <label class="span-2">Dia da saída
        <input id="cDate" type="date" value="${calc.date}">
      </label>
      <label class="span-2">Hora da saída
        <span class="adj-exact"><input id="cTime" type="time" value="${calc.time}"><button type="button" class="btn btn-ghost" data-calc-now>Agora</button></span>
      </label>
      <label>Tipo de envase
        <select id="cTipo">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${k === calc.tipo ? 'selected' : ''}>${t.n}</option>`).join('')}</select>
      </label>
      <label>Folga após a chegada
        <select id="cFolga">${[0, 30, 60, 90, 120].map((m) => `<option value="${m}" ${m === calc.folga ? 'selected' : ''}>${m ? untilText(m) : 'Nenhuma'}</option>`).join('')}</select>
      </label>
    </div>
    <details class="org-manage">
      <summary>${I.gear}Gerenciar origens</summary>
      <div class="org-list">${os.map((o) => `<span class="org-chip">${I.route}${esc(o.n)} · ${fmtNum(o.h)} h${os.length > 1 ? `<button type="button" data-org-del="${o.id}" aria-label="Remover ${esc(o.n)}">${I.x}</button>` : ''}</span>`).join('')}</div>
      <div class="org-add">
        <input id="orgName" type="text" maxlength="40" placeholder="Nova origem (ex.: Paulínia)">
        <input id="orgH" type="text" inputmode="decimal" maxlength="5" placeholder="Horas">
        <button type="button" class="btn btn-ghost" data-org-add>${I.plus}Adicionar</button>
      </div>
    </details>`;
  renderCalcOut();
  renderTransit();
}
function renderCalcOut() {
  const { dep, arr } = calcTimes();
  const org = origins().find((o) => o.id === calc.org);
  const valid = isFinite(dep) && calc.h > 0;
  if (!valid) { $('#pcOut').innerHTML = '<div class="empty">Informe a saída e o tempo de viagem.</div>'; return; }
  const wins = windowsAfter(arr, calc.folga, calc.tipo);
  const best = wins.find((w) => w.fits);
  const arrOpK = opDayOfMs(arr);
  const nowP = Math.max(0, Math.min(1, (Date.now() - dep) / (arr - dep)));
  let lastK = null;
  const rows = wins.map((w) => {
    const date = new Date(w.at);
    let head = '';
    if (w.k !== lastK) { lastK = w.k; head = `<div class="win-day">${I.calCheck}Dia de operação · ${esc(fmtLong(fromKey(w.k)))}</div>`; }
    const st = w.fits ? (w.shifted ? 'Livre (reajustado)' : 'Livre') : !w.fitsDay ? 'Termina depois das 07:15' : `Só ${untilText(w.room)} até ${w.next}`;
    return `${head}<div class="win ${w.fits ? 'ok' : 'no'} ${best === w ? 'best' : ''} turno-c${w.s.turno}">
      <div class="win-time"><b>${opToHHMM(w.t)}</b><small>${fmtShort(date)}</small></div>
      <div class="win-info">
        <div><span class="win-st">${st}</span>${best === w ? '<span class="best-badge">' + I.crown + 'Melhor opção</span>' : ''}</div>
        <small>${TURNOS[w.s.turno].n}${w.shifted ? ` · janela ${w.s.t} ocupada até ${opToHHMM(w.t)}${w.cause ? ' (' + esc(w.cause) + ')' : ''}` : ''} · ${w.wait < 1 ? 'chega na hora' : 'espera ' + untilText(w.wait)} após a chegada</small>
      </div>
      <button class="btn btn-sm ${w.fits ? 'btn-primary' : 'btn-ghost'}" data-calc-sched="${w.k}|${w.s.id}|${w.shifted ? w.t : ''}">${I.plus}Agendar</button>
    </div>`;
  }).join('');
  $('#pcOut').innerHTML = `
    <div class="route-card">
      <div class="route-pt"><small>Saída · ${esc(org?.n || 'Origem')}</small><b>${fmtTime(dep)}</b><em>${fmtShort(new Date(dep))}</em></div>
      <div class="route-line"><i style="--p:${nowP * 100}%"></i><span class="route-truck" style="left:${nowP * 100}%">${I.truck}</span><small>${fmtNum(calc.h)} h de viagem</small></div>
      <div class="route-pt end"><small>Chegada prevista</small><b>${fmtTime(arr)}</b><em>${fmtShort(new Date(arr))}</em></div>
    </div>
    ${!arrOpK ? '<div class="banner" style="margin-top:12px">Chega fora do horário de operação (fim de semana). As janelas abaixo são da próxima operação.</div>' : ''}
    <div class="card-head" style="margin:18px 0 10px"><div><h2><span class="h-ico">${I.clock}</span>Janelas possíveis</h2><p class="muted">${calc.folga ? `Com ${untilText(calc.folga)} de folga · ` : ''}${esc(TYPES[calc.tipo].n)} · ${best ? `melhor: <b>${best.s.t}</b> de ${fmtShort(new Date(best.at))}` : 'nenhuma janela livre nos próximos dias'}</p></div></div>
    <div class="win-list">${rows || '<div class="empty">Nenhuma janela encontrada.</div>'}</div>
    ${arrOpK ? `<button class="btn btn-ghost calc-imp" data-calc-imp>${I.alarm}Agendar como horário imprevisto na chegada (${fmtTime(arr)})</button>` : ''}`;
}
function renderTransit() {
  const list = transitTrucks();
  $('#pcTransit').innerHTML = `
    <div class="card-head"><div><h2><span class="h-ico">${I.truck}</span>Caminhões em trânsito</h2><p class="muted">Caminhões agendados com saída informada que ainda não chegaram</p></div><span class="pill">${list.length}</span></div>
    ${list.length ? `<div class="transit-list">${list.map((x) => {
      const p = Math.max(0, Math.min(1, (Date.now() - x.e.saida) / (x.arr - x.e.saida)));
      const left = (x.arr - Date.now()) / 60000;
      const s = startOp(x.e, x.k);
      return `<div class="transit-card ${x.late > 0 ? 'late' : ''}">
        <div class="tr-head">${mono(x.e)}<b class="tr-mat" data-edit="${x.e.id}" data-day="${x.k}">${esc(x.e.material)}</b><span class="muted small">${esc(x.e.origemN || '')}</span><span class="spacer"></span>
          ${left > 0 ? `<span class="delay early">faltam ${untilText(left)}</span>` : `<span class="delay alarm">deveria ter chegado · ${fmtDelta(-left)}</span>`}</div>
        <div class="transit-bar"><i style="width:${p * 100}%"></i><span style="left:${p * 100}%">${I.truck}</span></div>
        <div class="transit-times"><span>Saiu <b>${fmtDayTime(x.e.saida)}</b></span><span>Chega <b>${fmtDayTime(x.arr)}</b></span><span>Janela <b>${s != null ? `${fmtShort(fromKey(x.k))} ${opToHHMM(s)}` : 'sem janela'}</b></span></div>
        ${x.late > 0 ? `<div class="alert">Chega ${fmtDelta(x.late)} depois da janela — ajuste o horário.</div>` : ''}
        <div class="tr-actions">${actionBtn(x.e, x.k, true)}${adjustBtn(x.e, x.k, true)}<button class="btn btn-ghost btn-sm" data-edit="${x.e.id}" data-day="${x.k}">${I.edit}Editar</button></div>
      </div>`;
    }).join('')}</div>` : '<div class="empty">Nenhum caminhão em trânsito. Ao agendar pela calculadora, a saída já fica registrada.</div>'}`;
}
// leitura dos campos da calculadora sem redesenhar os próprios campos
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (!calc || !t.closest?.('#pcCalc')) return;
  if (t.id === 'cH') { const n = parseNum(t.value); if (n != null && n < 200) calc.h = n; }
  if (t.id === 'cDate' && t.value) calc.date = t.value;
  if (t.id === 'cTime' && t.value) calc.time = t.value;
  renderCalcOut();
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (!calc || !t.closest?.('#pcCalc')) return;
  if (t.id === 'cOrg') { calc.org = t.value; calc.h = origins().find((o) => o.id === t.value)?.h ?? calc.h; S.settings.calcOrg = t.value; save(); $('#cH').value = String(calc.h).replace('.', ','); }
  if (t.id === 'cTipo') calc.tipo = t.value;
  if (t.id === 'cFolga') calc.folga = Number(t.value);
  if (t.id === 'cDate' && t.value) calc.date = t.value;
  if (t.id === 'cTime' && t.value) calc.time = t.value;
  renderCalcOut();
});

/* ================= Render principal ================= */
function renderClock() { const n = new Date(); $('#clock').textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`; }
function render() {
  renderClock();
  if (currentTab === 'hoje') { renderHero(); renderNextStep(); renderSeq(); renderTodayTrucks(); renderRotina(); renderNotes(); }
  if (currentTab === 'agenda') renderAgenda();
  if (currentTab === 'preparo') renderPreparo();
  if (currentTab === 'percurso') renderPercurso();
  if (currentTab === 'historico') renderHistory();
  animateCounts();
  checkCelebrate();
}

/* ================= Ciclo do caminhão ================= */
function advance(k, id) {
  const e = findTruck(k, id);
  const f = e && FLOW[e.status];
  if (!f) return;
  const prev = { status: e.status, t: { ...e.t } };
  e.t ||= {};
  e.t[f.t] = Date.now();
  e.status = f.next;
  save(); render();
  const undo = () => { e.status = prev.status; e.t = prev.t; save(); render(); };
  lastUndo = undo;
  const p = plannedOp(e);
  if (f.t === 'chegada' && p != null) {
    const target = e.ajuste ?? p;
    const late = msToOp(k, e.t.chegada) - target;
    if (late > 10) {
      toast(`Chegou com ${fmtDelta(late)} de atraso. Justificar e ajustar?`, 'Ajustar', () => openAdjust(k, id, { motivo: 'Atraso do veículo', value: Math.round(msToOp(k, e.t.chegada)) }));
      return;
    }
  }
  if (f.t === 'inicio' || f.t === 'fim') {
    const aff = simulateCascade(k, id, () => {});
    if (aff.length) {
      toast(`${aff.length} ${aff.length > 1 ? 'caminhões seguintes vão' : 'caminhão seguinte vai'} atrasar. Empurrar?`, 'Empurrar', () => {
        const real = cascadeList(getPlan(k), k, id);
        save(); render();
        toast(`${real.length} horário${real.length > 1 ? 's' : ''} empurrado${real.length > 1 ? 's' : ''}`);
      });
      return;
    }
  }
  const msg = { chegada: 'Chegada registrada', inicio: 'Envase iniciado', fim: 'Envase finalizado' }[f.t];
  toast(`${msg} às ${fmtTime(e.t[f.t])}`, 'Desfazer', undo);
}

/* ================= Diálogo: ajustar horário ================= */
const adjDlg = $('#adjDlg');
let adj = null;
function openAdjust(k, id, preset = {}) {
  const e = findTruck(k, id);
  if (!e) return;
  const mode = e.t?.inicio && !e.t?.fim ? 'fim' : 'inicio';
  const planned = plannedOp(e);
  const base = mode === 'fim' ? endOp(e, k) : (startOp(e, k) ?? planned ?? Math.max(0, Math.round(nowOp(k))));
  const motivo = preset.motivo ?? (MOTIVOS.includes(e.motivo) ? e.motivo : e.motivo ? 'Outro' : '');
  adj = {
    k, id, mode, planned, base,
    value: preset.value ?? Math.round(base),
    motivo,
    detail: preset.detail ?? (e.motivo && !MOTIVOS.includes(e.motivo) && e.motivo !== 'Empurrado pelo anterior' ? e.motivo : ''),
    push: true,
  };
  $('#adjEyebrow').textContent = mode === 'fim' ? 'Ajustar término do envase' : 'Ajustar horário';
  $('#adjTitle').textContent = e.material;
  renderAdjust();
  if (!adjDlg.open) adjDlg.showModal();
}
function adjSummary() {
  const ref = adj.mode === 'fim' ? adj.base : (adj.planned ?? adj.base);
  const delta = adj.value - ref;
  const aff = adj.mode === 'fim'
    ? simulateCascade(adj.k, adj.id, (c) => { c.dur = Math.max(0.25, (adj.value - startOp(c, adj.k)) / 60); })
    : simulateCascade(adj.k, adj.id, (c) => { c.ajuste = adj.value; });
  return {
    ref, delta,
    deltaTxt: Math.abs(delta) >= 1 ? fmtDelta(delta) : 'sem alteração',
    affHtml: aff.length ? `<small class="aff">Vai afetar: ${aff.map((x) => `${esc(x.material)} → ${opToHHMM(x.ajuste)}`).join(' · ')}</small>` : '<small>Nenhum caminhão seguinte será afetado.</small>',
  };
}
// atualiza só o resumo (usado enquanto digita o horário, sem recriar o campo)
function updateAdjSummary() {
  const sm = adjSummary();
  $('#adjNew').textContent = opToHHMM(adj.value);
  $('#adjDelta').textContent = sm.deltaTxt;
  $('#adjAff').innerHTML = sm.affHtml;
}
function renderAdjust() {
  const e = findTruck(adj.k, adj.id);
  const { ref, deltaTxt, affHtml } = adjSummary();
  const chips = [-30, -15, 15, 30, 45, 60, 90, 120];
  $('#adjBody').innerHTML = `
    <div class="adj-times">
      <div><small>${adj.mode === 'fim' ? 'Término previsto' : adj.planned != null ? 'Previsto' : 'Atual'}</small><b>${opToHHMM(ref)}</b><em>${adj.mode === 'fim' ? 'início ' + fmtTime(e.t.inicio) : adj.planned != null ? 'janela sugerida' : ''}</em></div>
      <div class="arrow">${I.arrow}</div>
      <div class="new"><small>Novo horário</small><b id="adjNew">${opToHHMM(adj.value)}</b><em id="adjDelta">${deltaTxt}</em></div>
    </div>
    <span class="adj-label">Ajuste rápido</span>
    <div class="adj-chips">${chips.map((c) => `<button type="button" class="adj-chip ${c < 0 ? 'minus' : 'plus'}" data-adj-add="${c}">${c < 0 ? '−' : '+'}${Math.abs(c) >= 60 ? (Math.abs(c) / 60 + 'h').replace('.5h', 'h30') : Math.abs(c) + ' min'}</button>`).join('')}</div>
    <span class="adj-label">Horário exato</span>
    <div class="adj-exact">
      <input type="time" id="adjTime" value="${opToHHMM(adj.value)}">
      <button type="button" class="btn btn-ghost" data-adj-now>Agora</button>
    </div>
    <span class="adj-label">Motivo (vai para a justificativa da Revolog)</span>
    <div class="motivo-chips">${MOTIVOS.map((m) => `<button type="button" class="motivo-chip ${adj.motivo === m ? 'on' : ''}" data-adj-motivo="${esc(m)}">${esc(m)}</button>`).join('')}</div>
    <input type="text" class="adj-detail" id="adjDetail" placeholder="Detalhe (opcional) — ex.: veículo preso na balança" value="${esc(adj.detail)}" maxlength="140">
    <label class="switch">
      <input type="checkbox" id="adjPush" ${adj.push ? 'checked' : ''}><span class="knob"></span>
      <div><b>Empurrar os caminhões seguintes</b>
        <span id="adjAff">${affHtml}</span>
      </div>
    </label>
    <div class="sheet-foot">
      ${adj.mode === 'inicio' && e.ajuste != null ? `<button type="button" class="btn btn-danger-ghost" data-adj-reset>${I.back}Voltar ao previsto</button>` : ''}
      <span class="spacer"></span>
      <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
      <button type="button" class="btn btn-primary" data-adj-save>${I.check} Salvar horário</button>
    </div>`;
}
function saveAdjust() {
  const e = findTruck(adj.k, adj.id);
  if (!e) return;
  const before = JSON.parse(JSON.stringify(getPlan(adj.k)));
  if (adj.mode === 'fim') {
    e.dur = String(Math.max(0.25, Math.round(((adj.value - startOp(e, adj.k)) / 60) * 100) / 100));
  } else {
    e.ajuste = adj.planned != null && Math.round(adj.value) === adj.planned ? null : Math.round(adj.value);
  }
  const motivoTxt = [adj.motivo !== 'Outro' ? adj.motivo : '', adj.detail.trim()].filter(Boolean).join(' — ');
  e.motivo = motivoTxt || (e.ajuste == null && adj.mode === 'inicio' ? '' : e.motivo || '');
  let aff = [];
  if (adj.push) aff = cascadeList(getPlan(adj.k), adj.k, adj.id);
  save(); adjDlg.close(); render();
  const k = adj.k;
  toast(`Horário salvo${aff.length ? ` · ${aff.length} seguinte${aff.length > 1 ? 's' : ''} empurrado${aff.length > 1 ? 's' : ''}` : ''}`, 'Desfazer', () => { S.plan[k] = before; save(); render(); });
}

/* ================= Diálogo: caminhão ================= */
const dlg = $('#envDlg');
const form = $('#envForm');
let editing = null;
function fillSelects() {
  form.tipo.innerHTML = Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.n} (${t.w === 'turno' ? 'turno' : fmtNum(t.w)})</option>`).join('');
  form.status.innerHTML = Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
}
function fillSlotOptions(dayKey, selected, ignoreId) {
  const L = layout(getPlan(dayKey).filter((e) => e.id !== ignoreId));
  form.slot.innerHTML = `<option value="">Sem janela</option>` + SLOTS.map((s, i) => {
    const f = L.occ[i].fill;
    const st = f <= 1e-9 ? 'livre' : f >= 1 - 1e-9 ? 'ocupada' : `${fmtNum(1 - f)} livre`;
    return `<option value="${s.id}" ${s.id === selected ? 'selected' : ''}>${s.t} · ${TURNOS[s.turno].n} (${st})</option>`;
  }).join('');
}
let formReps = [];
const UNITS = ['kg', 'L', 't', 'IBC', 'tambor'];
function readRepRows() {
  return $$('#repList .rep-row').map((row) => ({
    qtd: parseQty(row.querySelector('.rq').value),
    un: row.querySelector('.ru').value,
    lote: row.querySelector('.rl').value.trim(),
  }));
}
function renderRepRows(focusLast) {
  $('#repList').innerHTML = formReps.map((r, i) => `
    <div class="rep-row">
      <span class="rep-n">${i + 1}</span>
      <input class="rq" type="text" inputmode="decimal" maxlength="12" placeholder="Quantidade" aria-label="Quantidade do reprocesso ${i + 1}" value="${r.qtd != null ? fmt3(r.qtd) : ''}">
      <select class="ru" aria-label="Unidade">${UNITS.map((u) => `<option ${u === (r.un || 'kg') ? 'selected' : ''}>${u}</option>`).join('')}</select>
      <input class="rl" type="text" maxlength="30" placeholder="Lote" aria-label="Lote do reprocesso ${i + 1}" value="${esc(r.lote || '')}">
      <button type="button" class="rep-del" data-rep-del="${i}" aria-label="Remover reprocesso ${i + 1}">${I.x}</button>
    </div>`).join('');
  updateRepTotal();
  if (focusLast) $$('#repList .rq').pop()?.focus();
}
function updateRepTotal() {
  const rows = readRepRows().filter((r) => r.qtd || r.lote);
  const tot = repTotals([{ reps: rows }]);
  $('#repTotal').textContent = rows.length ? `${rows.length} reprocesso${rows.length > 1 ? 's' : ''}${tot ? ' · ' + tot : ''}` : '';
}

let horaMode = 'janela';
function setHoraMode(m) {
  horaMode = m;
  $$('#horaSeg button').forEach((b) => b.classList.toggle('active', b.dataset.horaMode === m));
  $('#slotWrap').hidden = m !== 'janela';
  $('#horaWrap').hidden = m !== 'imprevisto';
  updateHint();
}
function updateHint() {
  const e = { tipo: form.tipo.value, slot: horaMode === 'janela' ? form.slot.value : '', hora: horaMode === 'imprevisto' && form.hora.value ? hhmmToOp(form.hora.value) : null, janelas: form.janelas.value, dur: 'auto' };
  form.janelas.options[0].textContent = `Automático (${fmtNum(weightOf(e))})`;
  form.dur.options[0].textContent = `Automático (${fmtNum(durMin({ ...e, janelas: form.janelas.value }) / 60)} h)`;
  $('#tipoHint').textContent = horaMode === 'imprevisto'
    ? 'Horário fora da lista: a janela sugerida é ignorada. Escolher uma janela de novo apaga este horário.'
    : (TYPES[form.tipo.value]?.hint || '');
}
function firstFreeSlot(dayKey) {
  const L = layout(getPlan(dayKey));
  const i = L.occ.findIndex((o) => o.fill < 1e-9);
  return i < 0 ? '' : SLOTS[i].id;
}
function openEnv(dayKey, id, slot, pre) {
  const e = id ? findTruck(dayKey, id) : null;
  editing = { id: e?.id || null, day: dayKey };
  $('#envDlgTitle').textContent = e ? 'Editar caminhão' : 'Novo caminhão';
  $('#envDelete').hidden = !e;
  $('#envDuplicate').hidden = !e;
  $('#matList').innerHTML = S.materials.slice(0, 60).map((m) => `<option value="${esc(m)}">`).join('');
  form.material.value = e?.material || '';
  form.tipo.value = e?.tipo || 'padrao';
  form.janelas.value = e?.janelas || 'auto';
  form.dur.querySelectorAll('[data-custom]').forEach((o) => o.remove());
  if (e?.dur && e.dur !== 'auto' && ![...form.dur.options].some((o) => o.value === String(e.dur))) {
    form.dur.insertAdjacentHTML('beforeend', `<option value="${esc(e.dur)}" data-custom>${fmtNum(Number(e.dur))} h (ajustado)</option>`);
  }
  form.dur.value = e?.dur ? String(e.dur) : 'auto';
  form.dia.value = dayKey;
  fillSlotOptions(dayKey, e ? e.slot : (slot && slot !== '__imp' ? slot : firstFreeSlot(dayKey)), e?.id);
  formReps = e ? getReps(e).map((r) => ({ ...r })) : [];
  if (!formReps.length) formReps.push({ qtd: null, un: 'kg', lote: '' });
  renderRepRows();
  form.os.value = e?.os || '';
  const impMode = (e && isImp(e)) || slot === '__imp';
  let hv = e?.hora != null ? opToHHMM(e.hora) : '';
  if (!e && impMode && dayKey === currentOpDayKey()) { const n = new Date(); hv = `${pad(n.getHours())}:${pad(Math.floor(n.getMinutes() / 5) * 5)}`; }
  form.hora.value = hv;
  setHoraMode(impMode ? 'imprevisto' : 'janela');
  form.op.value = e?.op || '';
  form.ticket.value = e?.ticket || '';
  form.pesoT.value = e?.peso ? (e.peso / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 3 }) : '';
  updatePesoPreview();
  // percurso
  const os = origins();
  form.origem.innerHTML = `<option value="">Sem percurso</option>` + os.map((o) => `<option value="${o.id}">${esc(o.n)} (${fmtNum(o.h)} h)</option>`).join('');
  const orgId = pre?.origem ?? (e?.origemId || (e?.origemN ? os.find((o) => o.n === e.origemN)?.id : '') || '');
  form.origem.value = os.some((o) => o.id === orgId) ? orgId : '';
  form.saida.value = pre?.saida ? toLocalInput(pre.saida) : e?.saida ? toLocalInput(e.saida) : '';
  form.dataset.viagemH = pre?.viagemH ?? e?.viagemH ?? (os.find((o) => o.id === form.origem.value)?.h || '');
  if (pre?.tipo) form.tipo.value = pre.tipo;
  if (pre?.hora != null) form.hora.value = opToHHMM(pre.hora);
  updatePercPreview();
  form.status.value = e?.status || 'programado';
  form.obs.value = e?.obs || '';
  updateHint();
  dlg.showModal();
  if (!e && matchMedia('(min-width: 721px)').matches) form.material.focus();
}
function saveEnv() {
  const dia = form.dia.value || editing.day;
  let savedId = editing.id;
  const data = {
    material: form.material.value.trim(), tipo: form.tipo.value, janelas: form.janelas.value, dur: form.dur.value,
    slot: horaMode === 'janela' ? form.slot.value : '',
    hora: horaMode === 'imprevisto' && form.hora.value ? hhmmToOp(form.hora.value) : null,
    reps: readRepRows().filter((r) => r.qtd || r.lote), repQtd: undefined, repUn: undefined, os: form.os.value.trim(),
    op: form.op.value.trim(), ticket: form.ticket.value.trim(), peso: parsePesoKg(form.pesoT.value), ...readPerc(), status: form.status.value, obs: form.obs.value.trim(),
  };
  if (!data.material) { form.material.focus(); return false; }
  if (horaMode === 'imprevisto' && data.hora == null) { form.hora.focus(); toast('Informe o horário imprevisto'); return false; }
  if (editing.id) {
    const src = S.plan[editing.day] || [];
    const i = src.findIndex((x) => x.id === editing.id);
    const old = src[i];
    const e = { ...old, ...data };
    if (old.slot !== data.slot || (old.hora ?? null) !== data.hora) { e.ajuste = null; }
    // status voltou no ciclo: limpa carimbos posteriores
    const order = ['programado', 'chegou', 'envasando', 'concluido'];
    const ni = order.indexOf(data.status);
    if (ni >= 0) { e.t = { ...(e.t || {}) }; if (ni < 1) delete e.t.chegada; if (ni < 2) delete e.t.inicio; if (ni < 3) delete e.t.fim; }
    if (dia !== editing.day) {
      src.splice(i, 1);
      if (!src.length) delete S.plan[editing.day];
      (S.plan[dia] ||= []).push(e);
    } else src[i] = e;
  } else {
    savedId = uid();
    (S.plan[dia] ||= []).push({ id: savedId, created: Date.now(), prep: {}, t: {}, ajuste: null, motivo: '', ...data });
  }
  S.materials = [data.material, ...S.materials.filter((m) => m.toLowerCase() !== data.material.toLowerCase())].slice(0, 80);
  save();
  if (currentTab === 'agenda') agDay = dia;
  if (currentTab === 'preparo') prDay = dia;
  const aff = data.status !== 'cancelado' ? simulateCascade(dia, savedId, () => {}) : [];
  if (aff.length) {
    toast(`${editing.id ? 'Atualizado' : 'Agendado'} · ${aff.length > 1 ? `${aff.length} caminhões seguintes ficam` : '1 caminhão seguinte fica'} sobreposto${aff.length > 1 ? 's' : ''}. Reajustar?`, 'Reajustar', () => {
      const before = JSON.parse(JSON.stringify(getPlan(dia)));
      const real = cascadeList(getPlan(dia), dia, savedId);
      save(); render();
      toast(`${real.length} horário${real.length > 1 ? 's' : ''} reajustado${real.length > 1 ? 's' : ''}`, 'Desfazer', () => { S.plan[dia] = before; save(); render(); });
    });
  } else toast(editing.id ? 'Caminhão atualizado' : 'Caminhão agendado');
  return true;
}

/* ================= Eventos ================= */
document.addEventListener('click', (ev) => {
  const t = ev.target;
  const c = (sel) => t.closest(sel);
  let el;

  if ((el = c('.tab-btn'))) return setTab(el.dataset.tab);
  if ((el = c('[data-copy]'))) { ev.preventDefault(); ev.stopPropagation(); copyText(el.dataset.copy); return; }
  if ((el = c('[data-hora-mode]'))) {
    setHoraMode(el.dataset.horaMode);
    if (horaMode === 'imprevisto') { if (!form.hora.value && form.slot.value) form.hora.value = SLOTS[slotIdx(form.slot.value)].t; form.hora.focus(); }
    return;
  }
  if (c('[data-rep-add]')) { formReps = readRepRows(); formReps.push({ qtd: null, un: formReps.at(-1)?.un || 'kg', lote: '' }); renderRepRows(true); return; }
  if ((el = c('[data-rep-del]'))) {
    formReps = readRepRows();
    formReps.splice(Number(el.dataset.repDel), 1);
    if (!formReps.length) formReps.push({ qtd: null, un: 'kg', lote: '' });
    renderRepRows();
    return;
  }
  if (c('[data-calc-now]')) { const n = new Date(); calc.date = keyOf(n); calc.time = `${pad(n.getHours())}:${pad(n.getMinutes())}`; $('#cDate').value = calc.date; $('#cTime').value = calc.time; renderCalcOut(); return; }
  if ((el = c('[data-calc-sched]'))) {
    const [k, slotId, at] = el.dataset.calcSched.split('|');
    const { dep } = calcTimes();
    if (at) return openEnv(k, null, '__imp', { tipo: calc.tipo, origem: calc.org, saida: dep, viagemH: calc.h, hora: Number(at) });
    return openEnv(k, null, slotId, { tipo: calc.tipo, origem: calc.org, saida: dep, viagemH: calc.h });
  }
  if (c('[data-calc-imp]')) {
    const { dep, arr } = calcTimes();
    const k = opDayOfMs(arr);
    return openEnv(k, null, '__imp', { tipo: calc.tipo, origem: calc.org, saida: dep, viagemH: calc.h, hora: Math.round(msToOp(k, arr)) });
  }
  if (c('[data-org-add]')) {
    const n = $('#orgName').value.trim(), h = parseNum($('#orgH').value);
    if (!n || !h) { toast('Informe o nome e as horas de viagem'); return; }
    origins().push({ id: uid(), n, h });
    save(); renderPercurso(); $('.org-manage').open = true; toast(`Origem ${n} adicionada`);
    return;
  }
  if ((el = c('[data-org-del]'))) {
    S.settings.origens = origins().filter((o) => o.id !== el.dataset.orgDel);
    if (calc.org === el.dataset.orgDel) { calc.org = origins()[0].id; calc.h = origins()[0].h; }
    save(); renderPercurso(); $('.org-manage').open = true;
    return;
  }
  if (c('[data-new-imp]')) return openEnv(currentTab === 'preparo' ? prDay : agDay, null, '__imp');

  // diálogo de ajuste
  if ((el = c('[data-adj-add]'))) { adj.value = Math.max(-60, adj.value + Number(el.dataset.adjAdd)); $('#adjTime').value = opToHHMM(adj.value); return updateAdjSummary(); }
  if (c('[data-adj-now]')) { adj.value = Math.round(nowOp(adj.k)); $('#adjTime').value = opToHHMM(adj.value); return updateAdjSummary(); }
  if ((el = c('[data-adj-motivo]'))) {
    adj.motivo = adj.motivo === el.dataset.adjMotivo ? '' : el.dataset.adjMotivo;
    $$('.motivo-chip').forEach((b) => b.classList.toggle('on', b.dataset.adjMotivo === adj.motivo));
    return;
  }
  if (c('[data-adj-save]')) { adj.detail = $('#adjDetail').value; return saveAdjust(); }
  if (c('[data-adj-reset]')) {
    const e = findTruck(adj.k, adj.id);
    const prev = { ajuste: e.ajuste, motivo: e.motivo };
    e.ajuste = null; e.motivo = '';
    save(); adjDlg.close(); render();
    toast('Voltou ao horário previsto', 'Desfazer', () => { Object.assign(e, prev); save(); render(); });
    return;
  }

  if ((el = c('[data-complete]'))) {
    toggleCheck(el.dataset.complete, true); render();
    pop($(`.medal[data-toggle="${el.dataset.complete}"]`));
    return;
  }
  if ((el = c('[data-toggle]'))) {
    toggleCheck(el.dataset.toggle); render();
    pop($(`.medal[data-toggle="${el.dataset.toggle}"]`));
    return;
  }
  if ((el = c('[data-sub]'))) {
    const sub = SEQ.flatMap((s) => s.sub || []).find((s) => s.id === el.dataset.sub);
    const st = subState(todayKey(), sub);
    if (st.derived) setStepAll(progDayOf(todayKey()), sub.prep, !st.done);
    else { toggleCheck(sub.id); render(); }
    pop($(`.medal[data-sub="${sub.id}"]`));
    return;
  }
  if ((el = c('[data-toggle-parent]'))) {
    const it = SEQ.find((s) => s.id === el.dataset.toggleParent);
    const k = todayKey();
    const all = it.sub.every((s) => subState(k, s).done);
    const trucks = active(getPlan(progDayOf(k)));
    if (trucks.length) {
      const snap = trucks.map((e) => [e, { ...e.prep }]);
      trucks.forEach((e) => { e.prep ||= {}; PREP.forEach((p) => { if (all) delete e.prep[p.k]; else e.prep[p.k] ||= Date.now(); }); });
      save(); render();
      toast(all ? 'Preparo desmarcado' : 'Preparo completo em todos os caminhões', 'Desfazer', () => { snap.forEach(([e, p]) => (e.prep = p)); save(); render(); });
    } else { it.sub.forEach((s) => toggleCheck(s.id, !all)); render(); }
    return;
  }
  if ((el = c('[data-del-extra]'))) {
    const day = ensureDay(todayKey());
    const idx = day.extras.findIndex((e) => e.id === el.dataset.delExtra);
    const [removed] = day.extras.splice(idx, 1);
    save(); render();
    toast('Tarefa removida', 'Desfazer', () => { day.extras.splice(idx, 0, removed); save(); render(); });
    return;
  }
  if ((el = c('[data-rot-toggle]'))) {
    const day = ensureDay(todayKey());
    const st = (day.routine[el.dataset.rotToggle] ||= {});
    st.at = st.at ? null : Date.now();
    save(); render();
    pop($(`.check[data-rot-toggle="${el.dataset.rotToggle}"]`));
    return;
  }
  if ((el = c('[data-rot-note-open]'))) {
    const li = el.closest('.task'); li.classList.add('open'); li.querySelector('input')?.focus();
    return;
  }
  if ((el = c('[data-goto]'))) {
    const tab = el.dataset.goto;
    let k = el.dataset.day;
    if (k === 'today') k = currentOpDayKey() || keyOf(nextOpDay(new Date()));
    if (tab === 'agenda' && k) agDay = k;
    if (tab === 'preparo' && k) { prDay = k; openTrucks.clear(); }
    setTab(tab);
    if (el.dataset.thenNew) openEnv(agDay);
    return;
  }
  if ((el = c('[data-ag]'))) { agDay = el.dataset.ag; return render(); }
  if ((el = c('[data-pr]'))) { prDay = el.dataset.pr; openTrucks.clear(); return render(); }
  if ((el = c('[data-prep-mode]'))) { S.settings.prepMode = el.dataset.prepMode; save(); return render(); }
  if ((el = c('[data-pc-toggle]'))) {
    const id = el.dataset.pcToggle;
    if (openTrucks.has(id)) openTrucks.delete(id); else openTrucks.add(id);
    return render();
  }
  if ((el = c('[data-prep-one]'))) {
    const k = el.dataset.day;
    const e = setPrep(k, el.dataset.env, el.dataset.prepOne);
    afterPrep(e, k);
    return;
  }
  if ((el = c('[data-prep-next]'))) {
    const k = el.dataset.day;
    const e = findTruck(k, el.dataset.prepNext);
    const n = e && nextPrepOf(e);
    if (n) { setPrep(k, e.id, n.k, true); afterPrep(e, k); }
    return;
  }
  if ((el = c('[data-step-all]'))) { setStepAll(el.dataset.day, el.dataset.stepAll, !el.dataset.off); return; }
  if ((el = c('[data-truck-all]'))) {
    const k = el.dataset.day;
    const e = findTruck(k, el.dataset.truckAll);
    const all = prepDone(e) === PREP.length;
    const snap = { ...e.prep };
    e.prep ||= {};
    PREP.forEach((p) => { if (all) delete e.prep[p.k]; else e.prep[p.k] ||= Date.now(); });
    save(); afterPrep(e, k, true);
    toast(all ? 'Etapas desmarcadas' : `${e.material}: preparo completo`, 'Desfazer', () => { e.prep = snap; save(); render(); });
    return;
  }
  if ((el = c('[data-advance]'))) return advance(el.dataset.day, el.dataset.advance);
  if ((el = c('[data-adjust]'))) return openAdjust(el.dataset.day, el.dataset.adjust);
  if ((el = c('[data-add-at]'))) return openEnv(agDay, null, '__imp', { hora: Number(el.dataset.addAt) });
  if ((el = c('[data-add-slot]'))) return openEnv(agDay, null, el.dataset.addSlot || undefined);
  if (c('[data-new-truck]')) return openEnv(currentTab === 'preparo' ? prDay : agDay);
  if (c('[data-close]')) { c('dialog')?.close(); return; }
  if ((el = c('[data-theme-set]'))) { S.settings.theme = el.dataset.themeSet; save(); applyTheme(); lastRulerDay = null; return; }
  if ((el = c('[data-accent-set]'))) { S.settings.accent = el.dataset.accentSet; save(); applyTheme(); return; }
  if ((el = c('[data-density-set]'))) { S.settings.density = el.dataset.densitySet; save(); applyTheme(); return; }
  if ((el = c('[data-font-set]'))) { S.settings.font = el.dataset.fontSet; save(); applyTheme(); lastRulerDay = null; if (currentTab === 'agenda') render(); return; }
  if (c('[data-open-keys]')) { $$('dialog[open]').forEach((d) => d.close()); $('#keysDlg').showModal(); return; }
  if (c('select, input, textarea, label')) return;
  if ((el = c('[data-edit]'))) {
    openEnv(el.dataset.day, el.dataset.edit);
    if (el.dataset.focus === 'hora') { setHoraMode('imprevisto'); if (!form.hora.value && form.slot.value) form.hora.value = SLOTS[slotIdx(form.slot.value)].t; form.hora.focus(); }
    return;
  }
});

// depois de confirmar uma etapa de preparo: se o caminhão ficou pronto, abre o próximo
function afterPrep(e, k, silent) {
  if (!e) return;
  if (currentTab === 'preparo' && prepDone(e) === PREP.length) {
    const list = sortPlan(active(getPlan(k)), k);
    const nxt = list.find((x) => prepDone(x) < PREP.length);
    openTrucks.delete(e.id);
    if (nxt) openTrucks.add(nxt.id);
    if (!silent) toast(nxt ? `${e.material} pronto ✓ — próximo: ${nxt.material}` : 'Todos os caminhões prontos ✓');
  }
  render();
}

document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.matches('[data-ag-input]') && t.value) { agDay = t.value; return render(); }
  if (t.matches('[data-pr-input]') && t.value) { prDay = t.value; openTrucks.clear(); return render(); }
  if (t.id === 'adjTime') return;
  if (t.id === 'adjPush') { adj.push = t.checked; return; }
  if (t.matches('[data-rot-note]')) {
    const st = (ensureDay(todayKey()).routine[t.dataset.rotNote] ||= {});
    st.note = t.value.trim(); save();
    return;
  }
  if (t === form.tipo || t === form.slot || t === form.janelas || t === form.hora) updateHint();
  if (t === form.dia && t.value) { fillSlotOptions(t.value, form.slot.value, editing?.id); updateHint(); }
});

$('#repList').addEventListener('input', updateRepTotal);
// ao sair do campo, a quantidade vira 456,000
$('#repList').addEventListener('focusout', (ev) => {
  if (!ev.target.matches('.rq')) return;
  const n = parseNum(ev.target.value);
  if (n != null) ev.target.value = fmt3(n);
});
function updatePesoPreview() {
  const kg = parsePesoKg(form.pesoT.value);
  const b = $('#pesoPreview');
  b.hidden = kg == null;
  if (kg != null) { b.dataset.copy = fmt3(kg); $('#pesoVal').textContent = fmt3(kg); }
}
form.pesoT.addEventListener('input', updatePesoPreview);
function readPerc() {
  const o = origins().find((x) => x.id === form.origem.value);
  const saida = fromLocalInput(form.saida.value);
  if (!o || !saida) return { origemId: null, origemN: '', saida: null, viagemH: null };
  return { origemId: o.id, origemN: o.n, saida, viagemH: Number(form.dataset.viagemH) || o.h };
}
function updatePercPreview() {
  const p = readPerc();
  const el = $('#percPrev');
  if (!p.saida) { el.textContent = form.origem.value ? 'Informe a data e a hora de saída.' : ''; el.className = 'perc-prev'; return; }
  const arr = p.saida + p.viagemH * 3600e3;
  const k = form.dia.value;
  let txt = `Chega ${fmtDayTime(arr)} (${fmtNum(p.viagemH)} h de viagem)`, cls = 'perc-prev ok';
  const planned = horaMode === 'janela' ? (slotIdx(form.slot.value) >= 0 ? slotOp(SLOTS[slotIdx(form.slot.value)]) : null) : (form.hora.value ? hhmmToOp(form.hora.value) : null);
  if (k && planned != null) {
    const diff = (arr - (opStartMs(k) + planned * 60000)) / 60000;
    if (diff > 1) { txt += ` · ${fmtDelta(diff)} depois do horário agendado!`; cls = 'perc-prev bad'; }
    else txt += ` · ${untilText(-diff)} antes do horário ✓`;
  }
  el.textContent = txt; el.className = cls;
}
form.origem.addEventListener('change', () => { form.dataset.viagemH = origins().find((o) => o.id === form.origem.value)?.h || ''; if (form.origem.value && !form.saida.value) form.saida.focus(); updatePercPreview(); });
['saida', 'slot', 'hora', 'dia'].forEach((n) => { form[n].addEventListener('input', updatePercPreview); form[n].addEventListener('change', updatePercPreview); });
$$('#horaSeg button').forEach((b) => b.addEventListener('click', () => setTimeout(updatePercPreview)));
// horário exato do ajuste: lê enquanto digita, sem redesenhar
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'adjTime' && adj) { if (t.value) { adj.value = hhmmToOp(t.value); updateAdjSummary(); } return; }
  if (form.contains(t) && t.name === 'hora') updateHint();
});
// abre o calendário ao tocar no botão de data dos dias (no PC só abria pelo ícone)
document.addEventListener('click', (ev) => {
  const inp = ev.target.closest('.date-pick input[type=date]');
  if (!inp || typeof inp.showPicker !== 'function') return;
  try { inp.showPicker(); } catch (e) { /* alguns navegadores bloqueiam; segue normal */ }
}, true);
$('#repList').addEventListener('change', updateRepTotal);
$('#notes').addEventListener('input', (ev) => {
  clearTimeout(notesTimer);
  $('#notesSaved').textContent = 'salvando…';
  notesTimer = setTimeout(() => { ensureDay(todayKey()).notes = ev.target.value; save(); $('#notesSaved').textContent = 'salvo ✓'; }, 400);
});
$('#extraForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const v = $('#extraInput').value.trim();
  if (!v) return;
  ensureDay(todayKey()).extras.push({ id: uid(), title: v, done: false });
  $('#extraInput').value = '';
  save(); render();
});
form.addEventListener('submit', (ev) => { ev.preventDefault(); if (saveEnv()) { dlg.close(); render(); } });
$('#envDelete').addEventListener('click', () => {
  if (!editing?.id) return;
  const k = editing.day;
  const list = S.plan[k] || [];
  const idx = list.findIndex((x) => x.id === editing.id);
  const [removed] = list.splice(idx, 1);
  save(); dlg.close(); render();
  toast('Caminhão excluído', 'Desfazer', () => { (S.plan[k] ||= []).splice(idx, 0, removed); save(); render(); });
});
$('#envDuplicate').addEventListener('click', () => {
  if (!editing?.id) return;
  const src = findTruck(editing.day, editing.id);
  (S.plan[editing.day] ||= []).push({ ...src, id: uid(), created: Date.now(), prep: {}, t: {}, ajuste: null, motivo: '', status: 'programado', slot: firstFreeSlot(editing.day), hora: null });
  save(); dlg.close(); render();
  toast('Caminhão duplicado na próxima janela livre');
});
$$('dialog').forEach((d) => d.addEventListener('click', (ev) => { if (ev.target === d) d.close(); }));

$('#settingsBtn').addEventListener('click', () => { applyTheme(); $('#setDlg').showModal(); });
$('#themeBtn').addEventListener('click', toggleTheme);
function toggleTheme() {
  const st = S.settings;
  if (document.documentElement.dataset.mode === 'dark') { st.lastDark = !st.theme || st.theme === 'auto' || st.theme === 'light' ? 'dark' : st.theme; st.theme = 'light'; }
  else st.theme = st.lastDark || 'dark';
  save(); applyTheme(); toast(`Tema: ${THEME_NAMES[st.theme]}`);
}
const THEME_NAMES = { auto: 'Automático', dark: 'Noite Real', light: 'Pergaminho', crimson: 'Carmesim Imperial', knight: 'Cavaleiro Negro' };
$('#nameInput').addEventListener('change', (ev) => { S.settings.name = ev.target.value.trim().slice(0, 30); save(); render(); });
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `filling-backup-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Backup exportado');
});
$('#importInput').addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || typeof d !== 'object' || !('days' in d || 'plan' in d)) throw new Error('formato');
      if (!confirm('Substituir os dados deste navegador pelo backup?')) return;
      S = migrate({ ...blank(), ...d, settings: { ...blank().settings, ...(d.settings || {}) } });
      save(); applyTheme(); render(); $('#setDlg').close();
      toast('Backup importado');
    } catch (e) { toast('Arquivo inválido'); }
  };
  r.readAsText(f);
  ev.target.value = '';
});
$('#resetDayBtn').addEventListener('click', () => {
  if (!confirm('Desmarcar toda a sequência e a rotina de hoje?')) return;
  const day = ensureDay(todayKey());
  day.checks = {}; day.routine = {}; day.extras.forEach((e) => (e.done = false));
  save(); $('#setDlg').close(); render();
  toast('Dia reiniciado');
});
$('#wipeBtn').addEventListener('click', () => {
  if (!confirm('Apagar TODO o histórico e programações deste navegador? Esta ação não pode ser desfeita.')) return;
  const theme = S.settings.theme;
  S = blank(); S.settings.theme = theme;
  save(); $('#setDlg').close(); render();
  toast('Dados apagados');
});

window.addEventListener('hashchange', () => setTab(location.hash.slice(1), false));
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', applyTheme);
let resizeT;
window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (currentTab === 'agenda') { lastRulerDay = null; renderRuler(agDay); } }, 200); });

// relógio, atrasos ao vivo e virada de dia
setInterval(() => {
  if (todayKey() !== lastToday) { lastToday = todayKey(); render(); return; }
  renderClock();
  const busy = document.querySelector('dialog[open]') || document.activeElement?.matches('input, textarea, select');
  if (busy) return;
  if (currentTab === 'hoje') { renderHero(); renderTodayTrucks(); }
  if (currentTab === 'agenda' && agDay === currentOpDayKey()) render();
  if (currentTab === 'percurso') { renderTransit(); renderCalcOut(); }
}, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

/* ================= Atalhos de teclado ================= */
function shiftOpDay(k, dir) { let d = fromKey(k); do { d = addDays(d, dir); } while (!isOpDay(d)); return keyOf(d); }
function focusTruck() {
  const nt = nextTruckInfo();
  const x = nt && (nt.running || nt.nextT);
  return x ? { k: nt.k, e: x.e } : null;
}
document.addEventListener('keydown', (ev) => {
  const t = ev.target;
  const typing = t.matches?.('input, textarea, select') || t.isContentEditable;
  const openDlg = document.querySelector('dialog[open]');
  // Ctrl+Enter salva o diálogo aberto
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter' && openDlg) {
    ev.preventDefault();
    if (openDlg.id === 'envDlg') form.requestSubmit();
    if (openDlg.id === 'adjDlg') { adj.detail = $('#adjDetail').value; saveAdjust(); }
    return;
  }
  if (typing || ev.ctrlKey || ev.metaKey || ev.altKey || openDlg) return;
  const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
  const go = { 1: 'hoje', 2: 'agenda', 3: 'preparo', 4: 'percurso', 5: 'historico' }[key];
  if (go) { ev.preventDefault(); setTab(go); return; }
  const act = {
    n: () => { if (!['agenda', 'preparo'].includes(currentTab)) setTab('agenda'); openEnv(currentTab === 'preparo' ? prDay : agDay); },
    i: () => { if (!['agenda', 'preparo'].includes(currentTab)) setTab('agenda'); openEnv(currentTab === 'preparo' ? prDay : agDay, null, '__imp'); },
    c: () => { if (currentTab !== 'hoje') setTab('hoje'); const b = $('#nextStep [data-complete], #nextStep [data-prep-one]'); b ? b.click() : toast('Sequência já concluída'); },
    e: () => { if (currentTab !== 'hoje') setTab('hoje'); const b = $('#nextStep [data-step-all]'); b ? b.click() : toast('Nada para confirmar em todos agora'); },
    r: () => { const f = focusTruck(); f ? advance(f.k, f.e.id) : toast('Nenhum caminhão pendente hoje'); },
    a: () => { const f = focusTruck(); f ? openAdjust(f.k, f.e.id) : toast('Nenhum caminhão para ajustar hoje'); },
    ArrowLeft: () => { if (currentTab === 'agenda') { agDay = shiftOpDay(agDay, -1); render(); } else if (currentTab === 'preparo') { prDay = shiftOpDay(prDay, -1); openTrucks.clear(); render(); } },
    ArrowRight: () => { if (currentTab === 'agenda') { agDay = shiftOpDay(agDay, 1); render(); } else if (currentTab === 'preparo') { prDay = shiftOpDay(prDay, 1); openTrucks.clear(); render(); } },
    h: () => { const k = currentOpDayKey() || keyOf(nextOpDay(new Date())); if (currentTab === 'preparo') { prDay = keyOf(nextOpDay(new Date())); openTrucks.clear(); } else { agDay = k; if (currentTab !== 'agenda') setTab('agenda'); } render(); },
    t: () => toggleTheme(),
    ',': () => { applyTheme(); $('#setDlg').showModal(); },
    z: () => {
      if (!lastUndo) return toast('Nada para desfazer');
      const fn = lastUndo; lastUndo = null; $('#toast').classList.remove('show'); fn(); toast('Desfeito');
    },
    '?': () => $('#keysDlg').showModal(),
  }[key];
  if (act) { ev.preventDefault(); act(); }
});

/* ================= Proteção contra erros ================= */
let lastErr = 0;
function showError(err) {
  console.error(err);
  if (Date.now() - lastErr < 4000) return;
  lastErr = Date.now();
  toast('Algo deu errado. Recarregue a página.', 'Recarregar', () => location.reload());
}
window.addEventListener('error', (ev) => showError(ev.error || ev.message));
window.addEventListener('unhandledrejection', (ev) => showError(ev.reason));

/* ================= Início ================= */
if (document.documentElement.classList.contains('is-splash')) setTimeout(() => document.documentElement.classList.remove('is-splash'), 1700);
$$('[data-ic]').forEach((el) => { el.innerHTML = I[el.dataset.ic] || ''; });
fillSelects();
renderLegend();
applyTheme();
setTab(location.hash.slice(1) || 'hoje', false);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
