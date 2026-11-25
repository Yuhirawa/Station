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
  search: sv('<circle class="d" cx="11" cy="11" r="7"/><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.6-4.6"/>'),
  grip: sv('<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" stroke-width="3"/>'),
  copyDay: sv('<rect class="d" x="8" y="8" width="13" height="13" rx="2"/><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3M12 12.5h5M14.5 10v5"/>'),
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
  tambor: { n: 'Tambor / Bombona', mono: 'TB', ic: 'drum', w: 2, dur: 6, leg: '2 janelas (≈ 6 h) · pode ajustar para 3', hint: 'Tambor/bombona ocupa 2 janelas (≈ 6 h) em qualquer horário. Se precisar de 3, mude em "Janelas ocupadas" — a duração acompanha.' },
};

const STATUS = { programado: 'Aguardando', veio: 'Veio', naoveio: 'Não veio', cancelado: 'Cancelado' };
const OLD_VEIO = ['chegou', 'envasando', 'concluido'];
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


/* ================= Segurança: cofre criptografado =================
   Com a proteção ativa, os dados do painel ficam cifrados (AES-GCM 256)
   no navegador. A chave do cofre é embrulhada pela senha de cada usuário
   (PBKDF2-SHA256), pelo PIN opcional e pelo código de recuperação.
   Sem um desses segredos, o conteúdo guardado é ilegível. */
const VAULT_KEY = 'filling-cofre-v1';
const KDF_ITER = 250000;
const PIN_MAX_FAILS = 5;
const SEC = { vault: null, key: null, dek: null, user: null, locked: false, lastAct: Date.now(), busy: false, dirty: false };
const secOk = () => !!(window.crypto && crypto.subtle && window.isSecureContext !== false);
const te = new TextEncoder(), td = new TextDecoder();
const rnd = (n) => crypto.getRandomValues(new Uint8Array(n));
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
const ub64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function kdf(secret, salt, iter) {
  const base = await crypto.subtle.importKey('raw', te.encode(secret), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function seal(key, bytes) {
  const iv = rnd(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  return { iv: b64(iv), ct: b64(ct) };
}
async function unseal(key, box) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(box.iv) }, key, ub64(box.ct)));
}
async function wrapDek(secret, dek) {
  const salt = rnd(16);
  return { salt: b64(salt), iter: KDF_ITER, ...(await seal(await kdf(secret, salt, KDF_ITER), dek)) };
}
async function unwrapDek(secret, w) { return unseal(await kdf(secret, ub64(w.salt), w.iter), w); } // lança erro se o segredo estiver errado
const dataKey = (dek) => crypto.subtle.importKey('raw', dek, 'AES-GCM', false, ['encrypt', 'decrypt']);
const normUser = (u) => String(u || '').trim().toLowerCase();
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function genCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = rnd(20);
  return [...r].map((x) => A[x % 32]).join('').replace(/(.{4})(?=.)/g, '$1-');
}
const secMeta = () => { const st = S.settings || {}; return { theme: st.theme, accent: st.accent, density: st.density, font: st.font, autoLock: SEC.vault?.meta?.autoLock ?? 15 }; };
function secWriteVault() { localStorage.setItem(VAULT_KEY, JSON.stringify(SEC.vault)); }
function secUser(id = SEC.user) { return SEC.vault?.users.find((u) => u.id === id) || null; }
const secIsAdmin = () => secUser()?.role === 'admin';
// grava o estado cifrado (em fila, sem perder alterações seguidas)
async function secPersist() {
  if (!SEC.vault || !SEC.key || SEC.locked) return;
  SEC.dirty = true;
  if (SEC.busy) return SEC.busyP;
  SEC.busy = true;
  SEC.busyP = (async () => {
    try {
      while (SEC.dirty) {
        SEC.dirty = false;
        const box = await seal(SEC.key, te.encode(JSON.stringify(S)));
        SEC.vault.data = box;
        SEC.vault.meta = secMeta();
        secWriteVault();
      }
    } catch (e) { toast('Não foi possível salvar neste navegador.'); }
    finally { SEC.busy = false; }
  })();
  return SEC.busyP;
}
async function secFlush() { if (SEC.busyP) await SEC.busyP; }

/* ================= Estado ================= */
let S = load();
function blank() { return { days: {}, plan: {}, settings: { theme: 'dark', prepMode: 'truck' }, materials: [] }; }
function migrate(s) {
  Object.values(s.plan || {}).forEach((list) => list.forEach((e) => {
    if (e.status === 'atrasado') e.status = 'programado';
    if (OLD_VEIO.includes(e.status)) { e.status = 'veio'; e.t ||= {}; e.t.veio ||= e.t.chegada || e.t.inicio || e.t.fim || e.created || Date.now(); }
    if (!e.reps && e.repQtd) { e.reps = [{ qtd: e.repQtd, un: e.repUn || 'kg', lote: '' }]; }
    delete e.repQtd; delete e.repUn;
    e.t ||= {};
    e.prep ||= {};
  }));
  return s;
}
function load() {
  try {
    const v = JSON.parse(localStorage.getItem(VAULT_KEY));
    if (v && v.users?.length && v.data) {
      SEC.vault = v; SEC.locked = true;
      document.documentElement.classList.add('is-locked');
      const b = blank(); Object.assign(b.settings, Object.fromEntries(Object.entries(v.meta || {}).filter(([k, x]) => x != null && k !== 'autoLock')));
      return b;
    }
  } catch (e) { /* ignora */ }
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s === 'object') return migrate({ ...blank(), ...s, settings: { ...blank().settings, ...(s.settings || {}) } });
  } catch (e) { /* ignora */ }
  return blank();
}
function save() {
  if (SEC.vault) { if (!SEC.locked) secPersist(); return; } // bloqueado: nunca grava por cima do cofre
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Não foi possível salvar neste navegador.'); }
}
const EMPTY_DAY = () => ({ checks: {}, routine: {}, extras: [], notes: '' });
const getDay = (k) => S.days[k] || EMPTY_DAY();
const ensureDay = (k) => (S.days[k] ||= EMPTY_DAY());
const getPlan = (k) => S.plan[k] || [];
const active = (list) => list.filter((e) => e.status !== 'cancelado' && e.status !== 'naoveio');
const isNoShow = (e) => e.status === 'naoveio';
const findTruck = (k, id) => getPlan(k).find((e) => e.id === id);

/* ================= Caminhões: janelas e horários ================= */
const slotIdx = (id) => SLOTS.findIndex((s) => s.id === id);
function turnoEnd(i) { let j = i; while (j + 1 < SLOTS.length && SLOTS[j + 1].turno === SLOTS[i].turno) j++; return j; }
function weightOf(e) {
  if (e.janelas && e.janelas !== 'auto') return Number(e.janelas);

  return TYPES[e.tipo]?.w || 1;
}
function durMin(e) {
  if (e.dur && e.dur !== 'auto') return Number(e.dur) * 60;
  // tambor: 3 h por janela ocupada (padrão 2 janelas = 6 h)
  if (e.tipo === 'tambor') return weightOf(e) * 3 * 60;
  // se as janelas foram aumentadas à mão, a duração acompanha (nunca menos que o padrão do tipo)
  if (e.janelas && e.janelas !== 'auto') return Math.max((TYPES[e.tipo]?.dur || 3) * 60, Number(e.janelas) * 3 * 60);
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
// separa o código numérico do início do material: "18384737 Acronal 4750" -> { code, name }
function splitMat(m) {
  const txt = String(m || '').trim();
  const r = /^(\d{4,})[\s\-–—:]+(.+)$/.exec(txt);
  if (r) return { code: r[1], name: r[2].trim() };
  if (/^\d{4,}$/.test(txt)) return { code: txt, name: txt };
  return { code: null, name: txt };
}
const matName = (e) => splitMat(e.material).name;

// etiquetas do caminhão — tocar copia o valor (para colar nos sistemas)
const copyChip = (cls, icon, label, value, extra = '') =>
  `<span class="ichip copyable ${cls}" role="button" tabindex="0" data-copy="${esc(value)}" title="Toque para copiar ${esc(value)}">${icon}${label} ${esc(value)}${extra}</span>`;
function infoChips(e, k) {
  const out = [];
  const mc = splitMat(e.material).code;
  if (mc) out.push(copyChip('code', I.barcode, 'Material', mc));
  const cl = catLookup(e.material);
  if (cl.state === 'ok') {
    const it = cl.it, q = embQty(it, e.peso);
    const nm = embNice(it[3]) || 'Embalagem';
    if (it[2] && it[2] !== 'NA') out.push(copyChip('emb', embIcon(it[3]), esc(nm), it[2], q ? ` · ${q} un` : ''));
    else out.push(`<span class="ichip emb">${embIcon(it[3])}${esc(nm)}${q ? ` · ${q} un` : ''}</span>`);
  } else if (cl.state === 'missing') out.push(`<span class="ichip warn-chip" title="Confira o número do material">${I.alert}Fora da planilha</span>`);
  if (isImp(e)) out.push(`<span class="ichip imp">${I.alarm}Imprevisto ${opToHHMM(e.hora)}</span>`);
  const tr = transitInfo(e, k);
  if (tr) out.push(`<span class="ichip transit ${tr.late > 0 ? 'late' : ''}" title="Saiu ${fmtDayTime(e.saida)}">${I.route}${esc(e.origemN || 'Percurso')} · ${tr.arrived ? 'previsto' : 'chega'} ${fmtDayTime(tr.arr)}${tr.late > 0 ? ` · ${fmtDelta(tr.late)} após a janela` : ''}</span>`);
  if (e.peso) out.push(copyChip('peso', I.weight, 'Peso', fmt3(e.peso)));
  if (e.semRep && !getReps(e).length) out.push(`<span class="ichip norep">${I.check}Sem reprocesso</span>`);
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
    if (e.status === 'naoveio') {
      const j = effSlotIdx(e);
      if (j >= 0) occ[j].items.push({ e, take: 0, cont: false, ns: true }); else unassigned.push(e);
      return;
    }
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
    if (e.t?.fim) { prevEnd = Math.max(prevEnd, endOp(e, k)); continue; }
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
// envases da linha vistos a partir do dia k (em minutos operacionais de k), incluindo a virada
// da noite anterior (ex.: começou 05:00 e vai até 08:40) e o começo do dia seguinte
function lineItemsFor(k) {
  const base = opStartMs(k);
  const out = [];
  for (let i = -3; i <= 3; i++) {
    const d = addDays(fromKey(k), i);
    if (!isOpDay(d)) continue;
    const kk = keyOf(d);
    schedule(kk).items.forEach((x) => {
      const s = (opStartMs(kk) + x.s * 60000 - base) / 60000, e = (opStartMs(kk) + x.en * 60000 - base) / 60000;
      if (e > -60 && s < 2880) out.push({ s, e, m: x.e.material });
    });
  }
  return out;
}
// Horários realmente disponíveis do dia, considerando imprevistos, atrasos e envases longos.
// Se a janela está tomada por um envase em andamento, o horário vai para o fim dele (ex.: 14:30 -> 15:30)
// e os seguintes se reajustam em cadeia (cada horário sugerido conta como um envase de 3 h).
// opts.chain=false: sem cadeia (usado no Percurso, que agenda 1 caminhão); opts.from: não sugerir antes disso.
function freeSuggestions(k, durStd = 180, opts = {}) {
  const chain = opts.chain !== false;
  const from = opts.from ?? -Infinity;
  const items = lineItemsFor(k);
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
    const shifted = t - base >= 1;
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
const TABS = ['hoje', 'agenda', 'preparo', 'percurso', 'historico', 'materiais'];
let currentTab = 'hoje';
let agDay = currentOpDayKey() || keyOf(nextOpDay(new Date()));
let prDay = keyOf(nextOpDay(new Date()));
let lastToday = todayKey();
const openTrucks = new Set();
let lastRulerDay = null;

function setTab(tab, push = true) {
  if (!TABS.includes(tab)) tab = 'hoje';
  currentTab = tab;
  document.body.dataset.tab = tab;
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
const LIGHT_THEMES = ['light', 'sage', 'sakura', 'winter'];
const THEME_ACCENT = { knight: 'silver', midnight: 'silver', winter: 'silver', sakura: 'ruby' };
function applyTheme() {
  const st = S.settings;
  let t = st.theme || 'dark';
  if (t === 'auto') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const root = document.documentElement;
  root.dataset.theme = t;
  root.dataset.mode = LIGHT_THEMES.includes(t) ? 'light' : 'dark';
  root.dataset.accent = !st.accent || st.accent === 'auto' ? (THEME_ACCENT[t] || 'gold') : st.accent;
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
  const nm = S.settings.name || (SEC.user ? secUser()?.u : '');
  return nm ? `${g}, ${nm}` : g;
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
  const running = items.find((x) => x.e.status === 'veio' && x.s <= now && now < x.en);
  const nextT = items.find((x) => x.e.status === 'programado' && x.en > now - 180);
  return { k, now, running, nextT };
}
// texto de quando o próximo caminhão entra: "em 2h10", "agora" ou "na fila para envase"
function whenText(x, now) {
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
  if (nt?.running) chips += `<span class="chip live"><span class="dot-live"></span>Na linha · ${esc(matName(nt.running.e))} · até ~${opToHHMM(nt.running.en)}</span>`;
  if (nt?.nextT) {
    const x = nt.nextT;
    const late = lateNoShow(x.e, nt.k);
    chips += late
      ? `<span class="chip warn">${I.alert}${esc(matName(x.e))} (${opToHHMM(x.s)}) sem chegada · ${fmtDelta(late)}</span>`
      : `<span class="chip gold">${I.truck}Próximo caminhão ${opToHHMM(x.s)} · ${esc(matName(x.e))} · ${whenText(x, nt.now)}</span>`;
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
    <div class="hero-meta">${chips}</div>
    ${heroStats()}`;
}

function heroStats() {
  const k = currentOpDayKey() || todayKey();
  const act = active(getPlan(k));
  const concl = act.filter((e) => e.status === 'veio').length;
  const nsN = getPlan(k).filter(isNoShow).length;
  const nti = nextTruckInfo();
  const now = nti && nti.k === k && nti.running ? nti.running.e : null;
  const trs = transitTrucks().filter((x) => x.arr > Date.now()).length;
  const pk = keyOf(nextOpDay(new Date()));
  const tom = active(getPlan(pk));
  const prepD = tom.reduce((a, e) => a + prepDone(e), 0), prepT = tom.length * PREP.length;
  const tile = (goto, day, icon, label, value, sub, cls = '') =>
    `<button class="hs-tile ${cls}" data-goto="${goto}" data-day="${day}"><span class="hs-ico">${icon}</span><small>${label}</small><b>${value}</b><em>${sub}</em></button>`;
  return `<div class="hero-stats">
    ${tile('agenda', k, I.truck, 'Caminhões hoje', act.length, act.length || nsN ? `${concl} ${concl === 1 ? 'veio' : 'vieram'}${nsN ? ` · ${nsN} não ${nsN === 1 ? 'veio' : 'vieram'}` : ''}` : 'nenhum agendado')}
    ${tile('agenda', k, I.play, 'Na linha agora', now ? esc(matName(now)) : '—', now ? `até ~${opToHHMM(nti.running.en)}` : 'linha livre', now ? 'live' : '')}
    ${tile('percurso', '', I.route, 'Em trânsito', trs, trs ? 'a caminho' : 'nenhum')}
    ${tile('preparo', pk, I.clipboard, `Preparo ${fmtShort(fromKey(pk))}`, prepT ? `${Math.round((prepD / prepT) * 100)}%` : '—', prepT ? `${prepD}/${prepT} etapas` : 'sem caminhões')}
  </div>`;
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

// Veio / Não veio (um único controle)
function actionBtn(e, k, small) {
  const sm = small ? 'btn-sm' : '';
  if (e.status === 'programado') return `<span class="arrive">
    <button type="button" class="btn btn-veio ${sm}" data-veio="${e.id}" data-day="${k}" title="O caminhão veio (atalho R)">${I.check}Veio</button>
    <button type="button" class="btn btn-naoveio ${sm}" data-naoveio="${e.id}" data-day="${k}" title="O caminhão não veio — fica guardado para reagendar">${I.x}Não veio</button></span>`;
  if (e.status === 'naoveio') return `<span class="arrive">
    <button type="button" class="btn btn-veio ${sm}" data-veio="${e.id}" data-day="${k}">${I.check}${small ? 'Veio' : 'Veio afinal'}</button>
    <button type="button" class="btn btn-reag ${sm}" data-reag="${e.id}" data-day="${k}">${I.calClock}Reagendar</button></span>`;
  if (e.status === 'veio') return `<button type="button" class="veio-badge" data-veio-time="${e.id}" data-day="${k}" title="Chegou${e.t?.veio ? ' às ' + fmtTime(e.t.veio) : ''} — toque para mudar a hora">${I.check}<b>Veio</b>${e.t?.veio ? `<small>${fmtTime(e.t.veio)}</small>` : ''}<span class="vb-edit">${I.edit}</span></button>`;
  return '';
}
function adjustBtn(e, k, small) {
  if (e.status === 'naoveio' || e.status === 'cancelado') return '';
  const lbl = e.t?.inicio ? 'Ajustar término' : 'Ajustar horário';
  return `<button class="btn btn-ghost ${small ? 'btn-sm' : ''}" data-adjust="${e.id}" data-day="${k}">${I.clock}${small ? 'Ajustar' : lbl}</button>`;
}

function renderTodayTrucks() {
  const k = currentOpDayKey() || todayKey();
  const sch = schedule(k);
  const list = sortPlan(getPlan(k), k);
  const box = $('#todayTrucks');
  $('#todaySub').textContent = `${fmtShort(fromKey(k))} · confirme quem veio e ajuste horários`;
  if (!list.length) {
    box.innerHTML = `<div class="empty">Nenhum caminhão programado para ${fmtShort(fromKey(k))}.<br>
      <button class="btn btn-ghost btn-sm" data-goto="agenda" data-day="${k}">${I.plus} Programar</button></div>`;
    return;
  }
  const nt = nextTruckInfo();
  let head = '';
  if (nt && nt.k === k && nt.nextT) {
    const late = lateNoShow(nt.nextT.e, k);
    head = `<div class="today-next">${I.truck}<span>Próximo: <b>${opToHHMM(nt.nextT.s)}</b></span><span>${esc(matName(nt.nextT.e))} · ${late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : whenText(nt.nextT, nt.now)}</span></div>`;
  }
  box.innerHTML = head + `<div class="truck-list">${list.map((e) => {
    const p = plannedOp(e), s = startOp(e, k);
    const adjusted = p != null && s != null && Math.round(s) !== Math.round(p);
    const late = lateNoShow(e, k);
    const ov = sch.overlaps.find((x) => x.e.id === e.id);
    const sub = '';
    const chips = infoChips(e, k);
    const times = [e.t?.veio && e.status === 'veio' && `confirmado ${fmtTime(e.t.veio)}`, e.status === 'naoveio' && 'não veio · aguardando reagendar'].filter(Boolean).join(' · ');
    return `<div class="truck-row st-${e.status}">
      <div class="tr-time ${adjusted ? 'adjusted' : ''}">
        <b>${s != null ? opToHHMM(s) : '—'}</b>${adjusted ? `<s>${opToHHMM(p)}</s>` : `<small>${slotLabel(e)}</small>`}
      </div>
      <div class="tr-main">
        <div class="tr-top">${mono(e)}<span class="tr-mat" data-edit="${e.id}" data-day="${k}">${esc(matName(e))}</span>${statusPill(e)}${adjusted ? delayHtml(s - p) : ''}${late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : ''}${ov ? `<span class="delay alarm">sobrepõe ${Math.round(ov.overlap)} min</span>` : ''}</div>
        ${chips ? `<div class="tc-info">${chips}</div>` : ''}
        <div class="tr-sub">${esc(sub)}${sub && times ? ' · ' : ''}${times}${e.motivo && adjusted ? ` · <span style="color:var(--warn)">${esc(e.motivo)}</span>` : ''}</div>
        ${e.status !== 'cancelado' ? `<div class="tr-actions">${actionBtn(e, k, true)}${e.status === 'programado' ? adjustBtn(e, k, true) : ''}</div>` : ''}
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
    html += `<div class="r-ghost" style="left:${LBL + x.p * sc}px;width:${w}px;top:44px"><b>${opToHHMM(x.p)}</b><span>${esc(matName(x.e))}</span></div>`;
  });
  placed.forEach((x) => {
    const w = Math.max((x.en - x.s) * sc, 34);
    const late = (x.p != null && x.s - x.p > 1) || lateNoShow(x.e, k);
    html += `<button class="r-block st-${x.e.status} ${late ? 'late' : ''} ${x.overlap ? 'overlap' : ''}" style="left:${LBL + x.s * sc}px;width:${w}px;top:${98 + x.lane * 42}px" data-edit="${x.e.id}" data-day="${k}" title="${esc(matName(x.e))} · ${opToHHMM(x.s)}–${opToHHMM(x.en)}"><b>${opToHHMM(x.s)}–${opToHHMM(x.en)}</b><span>${esc(matName(x.e))}</span></button>`;
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

// "ocupa 07:30 + 10:30" para envases de mais de uma janela
function occupiesTxt(e) {
  const i0 = effSlotIdx(e), w = weightOf(e);
  if (i0 < 0 || w <= 1) return '';
  const n = Math.ceil(w - 1e-9);
  const list = [];
  for (let j = 0; j < n; j++) {
    const idx = i0 + j, half = j === n - 1 && w % 1 ? '½ ' : '';
    list.push(idx < SLOTS.length ? half + SLOTS[idx].t : `${half}${SLOTS[idx - SLOTS.length].t} do dia seguinte`);
  }
  return ` · ocupa ${list.join(' + ')}`;
}
// visão resumida: uma linha por caminhão (horário grande, nome, status, preparo e próxima ação)
const expanded = new Set();
const agView = () => S.settings.agView || 'compact';
function truckView(e, k, sch) {
  return agView() === 'compact' && !expanded.has(e.id) ? trow(e, k, sch) : tcard(e, k, sch);
}
function trow(e, k, sch) {
  const p = plannedOp(e), s = startOp(e, k), en = endOp(e, k);
  const adjusted = p != null && s != null && Math.round(s) !== Math.round(p);
  const late = lateNoShow(e, k);
  const ov = sch?.overlaps.find((x) => x.e.id === e.id);
  const mc = splitMat(e.material).code;
  const pd = prepDone(e);
  const t = TYPES[e.tipo] || TYPES.padrao;
  const alarm = late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : ov ? `<span class="delay alarm">sobrepõe ${Math.round(ov.overlap)} min</span>` : '';
  const tr = transitInfo(e, k);
  return `<article class="trow st-${e.status} ${late || ov ? 'warn' : ''}" data-id="${e.id}">
    ${e.status === 'naoveio' ? `<span class="ns-ribbon">${I.x}Não veio</span>` : ''}
    <button type="button" class="grip" data-drag="${e.id}" data-day="${k}" title="Arraste para outra janela ou outro dia" aria-label="Arrastar caminhão">${I.grip}</button>
    <div class="trow-time ${adjusted ? 'adj' : ''}" data-expand="${e.id}">
      <b>${s != null ? opToHHMM(s) : '—'}</b>
      <small>${adjusted ? `<s>${opToHHMM(p)}</s> ` : ''}${en != null ? 'até ' + opToHHMM(en) : ''}</small>
    </div>
    <div class="trow-main" data-expand="${e.id}">
      <div class="trow-title">${mono(e)}<span>${esc(matName(e))}</span></div>
      <div class="trow-sub">
        ${e.status === 'programado' || e.status === 'cancelado' ? statusPill(e) : ''}${adjusted ? delayHtml(s - p) : ''}${alarm}
        ${isImp(e) ? `<span class="trow-tag imp">${I.alarm}Imprevisto</span>` : ''}
        ${tr ? `<span class="trow-tag transit">${I.route}chega ${fmtTime(tr.arr)}</span>` : ''}
        ${mc ? copyChip('code mini', I.barcode, '', mc) : ''}
        ${embMini(e)}
        ${e.semRep && !getReps(e).length ? `<span class="ichip norep mini">${I.check}Sem reproc.</span>` : getReps(e).filter((r) => r.qtd).map((r) => copyChip('rep mini', I.recycle, '', fmt3(r.qtd), ` ${esc(r.un || 'kg')}`)).join('')}
        ${e.os ? copyChip('os mini', I.file, 'Ordem', e.os) : ''}
        ${e.ticket ? copyChip('ticket mini', I.calClock, 'Ticket', e.ticket) : ''}
        <span class="trow-type">${esc(t.n)} · ${fmtNum(weightOf(e))} jan.</span>
      </div>
    </div>
    <div class="trow-prep">
      <span class="segs">${PREP.map((pp) => `<button type="button" class="seg c-${pp.c} ${e.prep?.[pp.k] ? 'on' : ''}" data-prep-one="${pp.k}" data-env="${e.id}" data-day="${k}" title="${esc(pp.full)} — ${e.prep?.[pp.k] ? 'feito (toque para desmarcar)' : 'toque para confirmar'}" aria-pressed="${e.prep?.[pp.k] ? 'true' : 'false'}">${esc(pp.l)}</button>`).join('')}</span>
      <small class="${pd === PREP.length ? 'ok' : ''}">${pd === PREP.length ? `${I.check}Pronto` : `${pd}/7`}</small>
    </div>
    <div class="trow-act">${actionBtn(e, k, true)}<button type="button" class="icon-btn trow-more" data-expand="${e.id}" aria-label="Abrir detalhes">${I.chev}</button></div>
  </article>`;
}

function arrivalBand(e, k) {
  if (e.status === 'veio') return `<div class="arr-band ok">${I.check}<div><b>Veio — tudo certo</b><small>Chegou ${e.t?.veio ? `às ${fmtTime(e.t.veio)}` : ''}</small></div><button type="button" class="btn btn-ghost btn-sm" data-veio-time="${e.id}" data-day="${k}">${I.clock}Mudar hora</button></div>`;
  if (e.status === 'naoveio') return `<div class="arr-band no">${I.x}<div><b>Não veio</b><small>Marcado ${e.t?.naoveio ? `às ${fmtTime(e.t.naoveio)}` : ''} · fica guardado para reagendar em outro dia</small></div></div>`;
  return '';
}
function tcard(e, k, sch) {
  const p = plannedOp(e), s = startOp(e, k), en = endOp(e, k);
  const adjusted = p != null && s != null && Math.round(s) !== Math.round(p);
  const late = lateNoShow(e, k);
  const ov = sch?.overlaps.find((x) => x.e.id === e.id);
  const sub = infoChips(e, k);
  const pd = prepDone(e);
  const t = TYPES[e.tipo] || TYPES.padrao;
  let times = '';
  if (p != null) times += `<div class="tt"><small>${isImp(e) ? 'Imprevisto' : 'Previsto'}</small><b>${adjusted ? `<s>${opToHHMM(p)}</s>` : opToHHMM(p)}</b></div>`;
  if (s != null && (adjusted || p == null)) times += `<div class="tt gold"><small>${e.t?.inicio ? 'Início real' : 'Ajustado'}</small><b>${opToHHMM(s)}</b>${p != null ? delayHtml(s - p) : ''}</div>`;
  if (en != null) times += `<div class="tt"><small>${e.t?.fim ? 'Fim real' : 'Término prev.'}</small><b>${opToHHMM(en)}</b></div>`;
  times += `<div class="tt"><small>Duração</small><b>${fmtNum(durMin(e) / 60)}h</b></div>`;

  return `<article class="tcard st-${e.status}" data-id="${e.id}">
    <div class="tc-top"><button type="button" class="grip" data-drag="${e.id}" data-day="${k}" title="Arraste para outra janela ou outro dia" aria-label="Arrastar caminhão">${I.grip}</button>${mono(e)}<span class="tc-clock">${s != null ? opToHHMM(s) : '—'}</span><span class="muted small">${esc(t.n)} · ${fmtNum(weightOf(e))} jan.${occupiesTxt(e)}</span><span class="spacer"></span>
      ${late ? `<span class="delay alarm">sem chegada ${fmtDelta(late)}</span>` : ''}${ov ? `<span class="delay alarm">sobrepõe ${Math.round(ov.overlap)} min</span>` : ''}${statusPill(e)}${agView() === 'compact' ? `<button type="button" class="icon-btn tc-collapse" data-expand="${e.id}" aria-label="Recolher" title="Recolher">${I.chev}</button>` : ''}</div>
    <div class="tc-mat" data-edit="${e.id}" data-day="${k}">${esc(matName(e))}</div>
    ${sub ? `<div class="tc-info">${sub}</div>` : ''}
    <div class="tc-times">${times}</div>
    ${e.motivo && (adjusted || e.ajuste != null) ? `<div class="tc-motivo">Motivo: ${esc(e.motivo)}</div>` : ''}
    ${arrivalBand(e, k)}
    ${e.obs ? `<div class="tc-obs">${esc(e.obs)}</div>` : ''}
    <div class="prep-dots">
      ${PREP.map((pp) => `<button type="button" class="pdot c-${pp.c} ${e.prep?.[pp.k] ? 'on' : ''}" data-prep-one="${pp.k}" data-env="${e.id}" data-day="${k}" title="${esc(pp.full)}">${e.prep?.[pp.k] ? I.check : I[pp.ic]}${esc(pp.l)}</button>`).join('')}
      <span class="prep-count ${pd === PREP.length ? 'ok' : ''}">${pd}/${PREP.length}</span>
    </div>
    <div class="tc-actions">${e.status === 'veio' ? '' : actionBtn(e, k, false)}${adjustBtn(e, k, false)}<span class="spacer"></span>${e.status === 'veio' ? `<button class="btn btn-ghost btn-sm" data-unveio="${e.id}" data-day="${k}" title="Voltar para aguardando">${I.back}Desmarcar</button>` : ''}<button class="btn btn-ghost btn-sm" data-edit="${e.id}" data-day="${k}" data-focus="hora">${I.alarm}Imprevisto</button><button class="btn btn-ghost btn-sm" data-edit="${e.id}" data-day="${k}">${I.edit}Editar</button></div>
  </article>`;
}

function renderAgenda() {
  const k = agDay;
  $$('[data-ag-view]').forEach((b) => b.classList.toggle('active', b.dataset.agView === agView()));
  $('#view-agenda').dataset.view = agView();
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
        body += `<div class="env-cont" data-edit="${c.e.id}" data-day="${k}">↳ continuação de <b>${esc(matName(c.e))}</b> · ${fmtNum(c.take)} janela</div>`;
      });
      o.items.filter((x) => !x.cont).forEach((x) => { body += truckView(x.e, k, sch); });
      if (conflict) body += `<div class="conflict-msg">${I.alert}Janela sobrecarregada (${fmtNum(o.fill)} de 1) — considere mover um caminhão.</div>`;
      const sg = sugs.find((x) => x.i === i);
      if (sg) body += sugButton(sg);
      html += `<div class="slot ${i % 2 ? 'alt' : ''} ${o.items.length ? 'has' : 'free'} ${conflict ? 'conflict' : ''} ${isNow ? 'is-now' : ''}" data-slot="${s.id}">
        <div class="slot-time"><span class="st-turno t${s.turno}">${TURNOS[s.turno].icon}</span><b>${s.t}</b>${s.next ? `<small>${fmtShort(addDays(d, 1))}</small>` : ''}${isNow ? '<span class="now-tag">Agora</span>' : ''}</div>
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
  if (L.unassigned.length) un += `<div class="unassigned-wrap"><h3>✦ Sem janela definida (${L.unassigned.length})</h3>${L.unassigned.map((e) => truckView(e, k, sch)).join('')}</div>`;
  if (L.cancelled.length) un += `<div class="unassigned-wrap"><h3>✦ Cancelados (${L.cancelled.length})</h3>${L.cancelled.map((e) => truckView(e, k, sch)).join('')}</div>`;
  $('#unassigned').innerHTML = un;
  $('#nsTray').innerHTML = noShowTray(k);

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

  const concl = act.filter((e) => e.status === 'veio').length;
  const nsN = list.filter(isNoShow).length;
  const delays = act.map((e) => { const p = plannedOp(e), s = startOp(e, k); return p != null && s != null ? s - p : 0; });
  const totalDelay = delays.reduce((a, x) => a + Math.max(0, x), 0);
  const ready = act.filter((e) => prepDone(e) === PREP.length).length;

  const alerts = [];
  L.occ.forEach((o, i) => { if (o.fill > 1 + 1e-9) alerts.push(`<div class="alert">Janela ${SLOTS[i].t} sobrecarregada</div>`); });
  sch.overlaps.forEach((x) => alerts.push(`<div class="alert">${esc(matName(x.e))} (${opToHHMM(x.s)}) sobrepõe o anterior em ${Math.round(x.overlap)} min</div>`));
  L.overflow.forEach((x) => alerts.push(`<div class="alert">${esc(matName(x.e))} passa do fim do dia operacional</div>`));
  if (sch.lastEnd != null && sch.lastEnd > 1440) alerts.push(`<div class="alert">Último envase termina ${opToHHMM(sch.lastEnd)}, depois das 07:15</div>`);
  act.forEach((e) => { const l = lateNoShow(e, k); if (l) alerts.push(`<div class="alert warn">${esc(e.material)} sem chegada · ${fmtDelta(l)} — justificar na Revolog</div>`); });

  $('#capCard').innerHTML = `<div class="cap-a">
    <h3 class="mini-title">${I.gauge}${esc(fmtLong(fromKey(k)))}</h3>
    <div class="cap-big"><b data-count="cap-${k}" data-to="${L.used}" data-dec="1">${fmtNum(L.used)}</b><span>/ ${CAP} janelas</span></div>
    <div class="cap-seg ${free < -1e-9 ? 'over' : ''}">${segs}</div>
    <div class="cap-free ${freeCls}">${freeTxt}</div>
    <div class="free-slots">${freeSlots.map((x) => x.shifted
      ? `<button class="free-slot shifted" data-add-at="${x.t}" title="Janela ${x.slot.t} reajustada">${opToHHMM(x.t)}<small>${x.slot.t}</small></button>`
      : `<button class="free-slot" data-add-slot="${x.slot.id}" title="Agendar neste horário">${x.slot.t}</button>`).join('')}<button class="free-slot imp" data-new-imp>${I.alarm}Imprevisto</button></div>
    </div><div class="cap-b">
    <div class="divider">✦</div>
    <div class="cap-stats">
      <div class="stat"><small>1º envase</small><b>${sch.items.length ? opToHHMM(sch.items[0].s) : '—'}</b></div>
      <div class="stat"><small>Término previsto</small><b>${sch.lastEnd != null ? opToHHMM(sch.lastEnd) : '—'}</b></div>
      <div class="stat"><small>Vieram</small><b>${concl}/${act.length}${nsN ? ` <em class="ns-n">${nsN} não</em>` : ''}</b></div>
      <div class="stat"><small>Atraso somado</small><b>${totalDelay ? fmtDelta(totalDelay) : '0'}</b></div>
      <div class="stat"><small>Preparo pronto</small><b>${ready}/${act.length}</b></div>
      <div class="stat stat-rep"><small>${I.recycle}Reprocesso</small><b class="${repTotals(act) ? 'stat-sm' : ''}">${repTotals(act) || '—'}</b></div>
    </div>
    </div><div class="cap-c">
    ${alerts.length ? `<div class="alerts">${alerts.join('')}</div>` : `<div class="cap-ok">${I.check}Nenhum conflito no dia</div>`}
    <div class="cap-actions">
      <button class="btn btn-ghost hide-mobile" data-add-slot="">${I.plus} Novo caminhão</button>
      <button class="btn btn-ghost" data-copy-day ${act.length ? '' : 'disabled'}>${I.copyDay} Copiar programação</button>
    </div></div>`;
}

function renderLegend() {
  $('#legend').innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <li><span class="tico">${I[t.ic]}</span><div>${esc(t.n)}<small>${esc(t.leg)}</small></div><b>${fmtNum(t.w)} jan.</b></li>`).join('') +
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
          <div class="pc-mat">${mono(e)}${esc(matName(e))}${ready ? '<span class="pc-ready">Pronto</span>' : ''}</div>
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
    const conc = plan.filter((e) => e.status === 'veio').length;
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
    const dur = durMin({ tipo, dur: 'auto', janelas: 'auto' });
    freeSuggestions(k, dur, { chain: false, from: msToOp(k, minAt) }).forEach((sg) => {
      if (out.length >= count) return;
      const at = opStartMs(k) + sg.t * 60000;
      if (at < minAt - 30000 || out.some((o) => o.k === k && o.t === sg.t)) return;
      const endOk = opOpen(at + (dur - 1) * 60000);
      out.push({ k, s: sg.slot, idx: sg.i, at, t: sg.t, shifted: sg.shifted, cause: sg.cause, room: sg.room, next: sg.next,
        fits: !sg.tight && endOk, tight: sg.tight, fitsDay: endOk, wait: (at - arrMs) / 60000 });
    });
  }
  return out;
}
// envases reais (em ms absolutos) ao redor de um instante — atravessa a virada dos dias de operação
function realIntervalsAround(ms) {
  const out = [];
  for (let i = -2; i <= 4; i++) {
    const d = addDays(new Date(ms), i);
    if (!isOpDay(d)) continue;
    const k = keyOf(d);
    schedule(k).items.forEach((x) => out.push({ s: opStartMs(k) + x.s * 60000, e: opStartMs(k) + x.en * 60000, m: x.e.material }));
  }
  return out;
}
const ceil5 = (ms) => Math.ceil(ms / 300000) * 300000;
const opOpen = (ms) => !!opDayOfMs(ms);
// horários fora da lista: na chegada (com folga) e cada momento em que a linha libera depois dela
function lineCandidates(arrMs, folgaMin, durMinutes) {
  const minAt = arrMs + folgaMin * 60000;
  const items = realIntervalsAround(minAt);
  const starts = [ceil5(minAt), ...items.filter((it) => it.e > minAt).map((it) => ceil5(it.e))];
  const out = [];
  starts.forEach((p, idx) => {
    let t = p, cause = idx === 0 ? '' : '';
    for (let moved = true; moved;) {
      moved = false;
      for (const it of items) if (it.s <= t + 30000 && it.e > t + 30000) { t = ceil5(it.e); cause = it.m; moved = true; }
    }
    if (!opOpen(t) || out.some((o) => o.at === t)) return;
    const next = items.filter((it) => it.s > t + 30000).sort((a, b) => a.s - b.s)[0];
    const room = next ? (next.s - t) / 60000 : Infinity;
    const endOk = opOpen(t + (durMinutes - 1) * 60000);
    const k = opDayOfMs(t);
    out.push({ imp: true, first: idx === 0, k, at: t, t: Math.round(msToOp(k, t)), cause, room, next: next?.m,
      tight: room < durMinutes - 1, fitsDay: endOk, fits: room >= durMinutes - 1 && endOk, wait: (t - arrMs) / 60000 });
  });
  return out.sort((a, b) => a.at - b.at);
}
let calc = null;
function initCalc() {
  if (calc) return;
  const n = new Date();
  const org = origins().find((o) => o.id === S.settings.calcOrg) || origins()[0];
  calc = { org: org?.id || '', h: org?.h ?? 12, date: keyOf(n), time: `${pad(n.getHours())}:${pad(n.getMinutes())}`, tipo: 'padrao', folga: 0, imp: S.settings.calcImp !== false };
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
      <label class="switch span-2 calc-switch">
        <input type="checkbox" id="cImp" ${calc.imp ? 'checked' : ''}><span class="knob"></span>
        <div><b>Incluir horários fora da lista</b><small>Sugere começar na chegada ou assim que a linha liberar (horário imprevisto)</small></div>
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
  const dur = durMin({ tipo: calc.tipo, dur: 'auto', janelas: 'auto' });
  // janelas da lista (sem as reajustadas quando "só lista")
  let wins = windowsAfter(arr, calc.folga, calc.tipo, 14).filter((w) => calc.imp || !w.shifted);
  const bestWin = wins.find((w) => w.fits && !w.shifted);
  if (calc.imp) {
    const lc = lineCandidates(arr, calc.folga, dur);
    const firstFitWin = wins.find((w) => w.fits);
    // mostra o horário da chegada sempre; os outros só se forem mais cedo que a primeira janela que serve
    lc.forEach((c) => {
      if (wins.some((w) => Math.abs(w.at - c.at) < 5 * 60000)) return;
      if (c.first || (c.fits && (!firstFitWin || c.at < firstFitWin.at))) wins.push(c);
    });
    wins.sort((x, y) => x.at - y.at);
  }
  const best = wins.find((w) => w.fits);
  const arrOpK = opDayOfMs(arr);
  const nowP = Math.max(0, Math.min(1, (Date.now() - dep) / (arr - dep)));
  let lastK = null;
  const rows = wins.map((w) => {
    const date = new Date(w.at);
    const turnoIdx = w.s ? w.s.turno : SLOTS[slotIndexForOp(w.t)].turno;
    let head = '';
    if (w.k !== lastK) { lastK = w.k; head = `<div class="win-day">${I.calCheck}Dia de operação · ${esc(fmtLong(fromKey(w.k)))}</div>`; }
    let st, note;
    if (w.imp) {
      st = w.fits ? (w.first && !w.cause ? 'Na chegada' : 'Linha libera') : !w.fitsDay ? 'Passa do fim da operação' : `Só ${untilText(w.room)} até ${esc(w.next)}`;
      note = `Fora da lista (imprevisto)${w.cause ? ` · depois de ${esc(w.cause)}` : ''}`;
    } else {
      st = w.fits ? (w.shifted ? 'Livre (reajustado)' : 'Livre') : !w.fitsDay ? 'Termina depois das 07:15' : `Só ${untilText(w.room)} até ${esc(w.next)}`;
      note = `${TURNOS[w.s.turno].n}${w.shifted ? ` · janela ${w.s.t} ocupada até ${opToHHMM(w.t)}${w.cause ? ' (' + esc(w.cause) + ')' : ''}` : ' · janela da lista'}`;
    }
    const badges = (best === w ? `<span class="best-badge">${I.crown}Melhor opção</span>` : '') + (bestWin === w && best !== w ? `<span class="best-badge list">${I.clock}Melhor da lista</span>` : '');
    const atAttr = w.imp || w.shifted ? w.t : '';
    return `${head}<div class="win ${w.fits ? 'ok' : 'no'} ${best === w ? 'best' : ''} ${bestWin === w && best !== w ? 'best-list' : ''} ${w.imp ? 'imp' : ''} turno-c${turnoIdx}">
      <div class="win-time"><b>${opToHHMM(w.t)}</b><small>${fmtShort(date)}</small></div>
      <div class="win-info">
        <div><span class="win-st">${st}</span>${badges}</div>
        <small>${note} · ${w.wait < 1 ? 'sem espera' : 'espera ' + untilText(w.wait)}</small>
      </div>
      <button class="btn btn-sm ${w.fits ? 'btn-primary' : 'btn-ghost'}" data-calc-sched="${w.k}|${w.s ? w.s.id : ''}|${atAttr}">${I.plus}Agendar</button>
    </div>`;
  }).join('');
  const bestTxt = best ? `melhor: <b>${opToHHMM(best.t)}</b> de ${fmtShort(new Date(best.at))}${best.wait >= 1 ? ` (espera ${untilText(best.wait)})` : ' (sem espera)'}` : 'nenhum horário livre nos próximos dias';
  $('#pcOut').innerHTML = `
    <div class="route-card">
      <div class="route-pt"><small>Saída · ${esc(org?.n || 'Origem')}</small><b>${fmtTime(dep)}</b><em>${fmtShort(new Date(dep))}</em></div>
      <div class="route-line"><i style="--p:${nowP * 100}%"></i><span class="route-truck" style="left:${nowP * 100}%">${I.truck}</span><small>${fmtNum(calc.h)} h de viagem</small></div>
      <div class="route-pt end"><small>Chegada prevista</small><b>${fmtTime(arr)}</b><em>${fmtShort(new Date(arr))}</em></div>
    </div>
    ${!arrOpK ? '<div class="banner" style="margin-top:12px">Chega fora do horário de operação (fim de semana). Os horários abaixo são da próxima operação.</div>' : ''}
    <div class="card-head" style="margin:18px 0 10px"><div><h2><span class="h-ico">${I.clock}</span>Horários possíveis</h2><p class="muted" id="calcSummary">${calc.folga ? `Com ${untilText(calc.folga)} de folga · ` : ''}${esc(TYPES[calc.tipo].n)} (${untilText(dur)}) · ${bestTxt}</p></div></div>
    <div class="win-list">${rows || '<div class="empty">Nenhum horário encontrado.</div>'}</div>`;
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
        <div class="tr-head">${mono(x.e)}<b class="tr-mat" data-edit="${x.e.id}" data-day="${x.k}">${esc(matName(x.e))}</b><span class="muted small">${esc(x.e.origemN || '')}</span>${splitMat(x.e.material).code ? copyChip('code', I.barcode, 'Material', splitMat(x.e.material).code) : ''}<span class="spacer"></span>
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
  if (t.id === 'cImp') { calc.imp = t.checked; S.settings.calcImp = t.checked; save(); }
  if (t.id === 'cDate' && t.value) calc.date = t.value;
  if (t.id === 'cTime' && t.value) calc.time = t.value;
  renderCalcOut();
});

/* ================= Busca ================= */
const norm = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function searchTrucks(q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const out = [];
  Object.entries(S.plan).forEach(([k, list]) => list.forEach((e) => {
    const mc = splitMat(e.material);
    const fields = [
      ['Material', mc.code], ['Nome', mc.name], ['Ordem', e.os], ['Lote', e.op], ['Ticket', e.ticket],
      ...getReps(e).map((r) => ['Lote reproc.', r.lote]), ['Obs.', e.obs],
    ].filter((f) => f[1]);
    const hay = norm(fields.map((f) => f[1]).join(' '));
    if (!terms.every((t) => hay.includes(t))) return;
    const hits = fields.filter((f) => terms.some((t) => norm(f[1]).includes(t)));
    out.push({ k, e, hits });
  }));
  // mais perto de hoje primeiro (futuros e depois passados)
  const today = todayKey();
  return out.sort((a, b) => {
    const fa = a.k >= today, fb = b.k >= today;
    if (fa !== fb) return fa ? -1 : 1;
    return fa ? a.k.localeCompare(b.k) : b.k.localeCompare(a.k);
  }).slice(0, 60);
}
function catSearchAll(q) { const t = norm(q).split(/\s+/).filter(Boolean); return t.length ? S.cat.items.filter((it) => { const h = norm(it.join(' ')); return t.every((x) => h.includes(x)); }).length : 0; }
function markHit(txt, q) {
  let h = esc(txt);
  norm(q).split(/\s+/).filter(Boolean).forEach((t) => {
    const i = norm(txt).indexOf(t);
    if (i >= 0) h = esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + t.length)) + '</mark>' + esc(txt.slice(i + t.length));
  });
  return h;
}
function renderSearch() {
  const q = $('#searchInput').value;
  const box = $('#searchResults');
  if (!q.trim()) { box.innerHTML = `<div class="search-hint">${I.search}<b>Busque em todos os dias</b><span>Código do material, nome, ordem de processo, lote, ticket ou lote de reprocesso</span></div>`; return; }
  const res = searchTrucks(q);
  const cq = catIndex() ? catSearchAll(q) : 0;
  const catLink = cq ? `<button class="search-cat" data-cat-goto="${esc(q.trim())}">${I.package}<span><b>${cq} ${cq === 1 ? 'material' : 'materiais'} na planilha</b><small>Ver embalagem e código</small></span>${I.chevR || ''}</button>` : '';
  if (!res.length && catLink) { box.innerHTML = catLink; return; }
  if (!res.length) { box.innerHTML = `<div class="search-hint">${I.search}<b>Nada encontrado</b><span>Confira o número ou tente só uma parte dele</span></div>`; return; }
  box.innerHTML = catLink + `<div class="search-count">${res.length} caminhão${res.length > 1 ? 'ões' : ''}</div>` + res.map(({ k, e, hits }) => {
    const s = startOp(e, k);
    return `<button class="search-row" data-goto-truck="${e.id}" data-day="${k}">
      <span class="sr-date"><b>${fmtDM(fromKey(k))}</b><small>${WD[fromKey(k).getDay()]}${s != null ? ' · ' + opToHHMM(s) : ''}</small></span>
      <span class="sr-main"><span class="sr-mat">${mono(e)}<span>${markHit(matName(e), q)}</span></span>
        <span class="sr-hits">${hits.filter((h) => h[0] !== 'Nome').map((h) => `<span class="sr-hit">${h[0]} ${markHit(h[1], q)}</span>`).join('')}</span></span>
      ${statusPill(e)}
    </button>`;
  }).join('');
}
function openSearch() {
  $$('dialog[open]').forEach((d) => d.close());
  $('#searchDlg').showModal();
  const i = $('#searchInput'); i.select(); i.focus();
  renderSearch();
}
// abre a agenda do dia e destaca o caminhão
function focusTruckCard(k, id) {
  agDay = k; lastRulerDay = null;
  if (currentTab !== 'agenda') setTab('agenda'); else render();
  requestAnimationFrame(() => {
    const el = $(`.tcard[data-id="${id}"], .trow[data-id="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  });
}

/* ================= Arrastar caminhão (mouse e toque) ================= */
let drag = null;
document.addEventListener('pointerdown', (ev) => {
  const h = ev.target.closest('[data-drag]');
  if (!h || ev.button > 0) return;
  ev.preventDefault();
  const card = h.closest('.tcard, .trow');
  const r = card.getBoundingClientRect();
  drag = { id: h.dataset.drag, k: h.dataset.day, card, dx: ev.clientX - r.left, dy: ev.clientY - r.top, x: ev.clientX, y: ev.clientY, moved: false, target: null };
  try { h.setPointerCapture(ev.pointerId); } catch (e) { /* ok */ }
});
document.addEventListener('pointermove', (ev) => {
  if (!drag) return;
  ev.preventDefault();
  drag.x = ev.clientX; drag.y = ev.clientY;
  if (!drag.moved) {
    if (Math.hypot(ev.clientX - (drag.card.getBoundingClientRect().left + drag.dx), ev.clientY - (drag.card.getBoundingClientRect().top + drag.dy)) < 6) return;
    drag.moved = true;
    const g = drag.card.cloneNode(true);
    g.className += ' drag-ghost';
    g.style.width = drag.card.offsetWidth + 'px';
    document.body.appendChild(g);
    drag.ghost = g;
    drag.card.classList.add('drag-src');
    document.body.classList.add('dragging');
    const loop = () => { if (!drag) return; const m = 80; if (drag.y < m) window.scrollBy(0, -14); else if (drag.y > innerHeight - m) window.scrollBy(0, 14); drag.raf = requestAnimationFrame(loop); };
    drag.raf = requestAnimationFrame(loop);
  }
  drag.ghost.style.transform = `translate(${ev.clientX - drag.dx}px, ${ev.clientY - drag.dy}px) rotate(1.5deg)`;
  const el = document.elementFromPoint(ev.clientX, ev.clientY);
  let slot = el?.closest('.slot[data-slot]');
  if (!slot && el?.closest('.turno-head')) slot = el.closest('.turno').querySelector('.slot[data-slot]');
  const day = el?.closest('.day-chip[data-ag]');
  const un = el?.closest('#unassigned');
  $$('.drop-hover').forEach((x) => x.classList.remove('drop-hover'));
  drag.target = slot ? { slot: slot.dataset.slot } : day ? { day: day.dataset.ag } : un ? { slot: '' } : null;
  (slot || day || un)?.classList.add('drop-hover');
}, { passive: false });
function endDrag() {
  if (!drag) return;
  cancelAnimationFrame(drag.raf);
  drag.ghost?.remove();
  drag.card?.classList.remove('drag-src');
  document.body.classList.remove('dragging');
  $$('.drop-hover').forEach((x) => x.classList.remove('drop-hover'));
  const d = drag; drag = null;
  if (d.moved && d.target) moveTruck(d.k, d.id, d.target);
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', () => { if (drag) { drag.target = null; endDrag(); } });

function moveTruck(k, id, target) {
  const list = S.plan[k] || [];
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  const e = list[i];
  const before = JSON.parse(JSON.stringify(S.plan));
  let dest = k, label;
  if (target.day) {
    if (target.day === k) return;
    list.splice(i, 1);
    if (!list.length) delete S.plan[k];
    (S.plan[target.day] ||= []).push(e);
    e.ajuste = null; dest = target.day;
    label = `${matName(e)} movido para ${fmtShort(fromKey(dest))}`;
    agDay = dest;
  } else {
    if (e.slot === target.slot && e.hora == null) return;
    e.slot = target.slot; e.hora = null; e.ajuste = null;
    label = target.slot ? `${matName(e)} → janela ${SLOTS[slotIdx(target.slot)].t}` : `${matName(e)} ficou sem janela`;
  }
  save(); render();
  const undo = () => { S.plan = before; save(); render(); };
  lastUndo = undo;
  const aff = simulateCascade(dest, id, () => {});
  if (aff.length) {
    toast(`${label} · ${aff.length > 1 ? aff.length + ' seguintes ficam sobrepostos' : '1 seguinte fica sobreposto'}. Reajustar?`, 'Reajustar', () => {
      cascadeList(getPlan(dest), dest, id); save(); render(); toast('Horários reajustados', 'Desfazer', undo);
    });
  } else toast(label, 'Desfazer', undo);
}

/* ================= Copiar programação de um dia ================= */
function openCopyDay() {
  const k = agDay;
  const list = active(getPlan(k));
  if (!list.length) return toast('Não há caminhões neste dia');
  const to = keyOf(nextOpDay(fromKey(k)));
  $('#copyBody').innerHTML = `
    <p class="muted" style="margin:0 0 14px">Copia os <b>${list.length} caminhões</b> de <b>${esc(fmtLong(fromKey(k)))}</b> com material, tipo, janela/horário, peso e duração. Status, preparo, chegada e ajustes começam do zero.</p>
    <div class="form-grid">
      <label class="span-2">Copiar para o dia
        <input type="date" id="copyTo" value="${to}">
      </label>
      <label class="switch span-2"><input type="checkbox" id="copyKeepIds"><span class="knob"></span><div><b>Manter ordem, lote e ticket</b><small>Normalmente mudam a cada carregamento</small></div></label>
      <label class="switch span-2"><input type="checkbox" id="copyKeepReps"><span class="knob"></span><div><b>Manter reprocessos</b><small>Quantidades e lotes de reprocesso</small></div></label>
    </div>
    <div class="copy-list">${list.map((e) => { const s = startOp(e, k); return `<span>${mono(e)}<b>${s != null ? opToHHMM(s) : '—'}</b>${esc(matName(e))}</span>`; }).join('')}</div>
    <div class="sheet-foot"><span class="spacer"></span><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="button" class="btn btn-primary" data-copy-go>${I.copyDay} Copiar ${list.length} caminhões</button></div>`;
  $('#copyDlg').showModal();
}
function doCopyDay() {
  const from = agDay, to = $('#copyTo').value;
  if (!to) return toast('Escolha o dia de destino');
  if (to === from) return toast('Escolha um dia diferente');
  const keepIds = $('#copyKeepIds').checked, keepReps = $('#copyKeepReps').checked;
  const before = JSON.parse(JSON.stringify(S.plan));
  const copies = active(getPlan(from)).map((e) => ({
    id: uid(), created: Date.now(), material: e.material, tipo: e.tipo, slot: e.slot, hora: e.hora ?? null,
    janelas: e.janelas || 'auto', dur: e.dur || 'auto', peso: e.peso || null, status: 'programado', prep: {}, t: {}, ajuste: null, motivo: '',
    os: keepIds ? e.os || '' : '', op: keepIds ? e.op || '' : '', ticket: keepIds ? e.ticket || '' : '',
    reps: keepReps ? getReps(e).map((r) => ({ ...r })) : [], semRep: keepReps ? !!e.semRep : false, obs: '',
  }));
  (S.plan[to] ||= []).push(...copies);
  save();
  $('#copyDlg').close();
  agDay = to; render();
  toast(`${copies.length} caminhões copiados para ${fmtShort(fromKey(to))}`, 'Desfazer', () => { S.plan = before; agDay = from; save(); render(); });
}

/* ================= Render principal ================= */
function renderClock() { const n = new Date(); $('#clock').textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`; }
function render() {
  renderClock();
  if (currentTab === 'hoje') { renderHero(); renderNextStep(); renderSeq(); renderTodayTrucks(); renderRotina(); renderNotes(); }
  if (currentTab === 'agenda') renderAgenda();
  if (currentTab === 'preparo') renderPreparo();
  if (currentTab === 'percurso') renderPercurso();
  if (currentTab === 'historico') renderHistory();
  if (currentTab === 'materiais') renderMateriais();
  renderCatRemind();
  animateCounts();
  checkCelebrate();
}

/* ================= Ciclo do caminhão ================= */
function advance(k, id) { markVeio(k, id); }
function markVeio(k, id) {
  const e = findTruck(k, id);
  if (!e || e.status === 'veio') return;
  const prev = { status: e.status, t: { ...e.t }, noshows: e.noshows ? [...e.noshows] : undefined };
  e.t ||= {};
  e.t.veio = Date.now();
  delete e.t.naoveio;
  if (prev.status === 'naoveio' && e.noshows?.length && e.noshows[e.noshows.length - 1] === k) e.noshows.pop();
  e.status = 'veio';
  save(); render();
  celebrateTruck(id);
  fxVeio(id);
  const undo = () => { e.status = prev.status; e.t = prev.t; e.noshows = prev.noshows; save(); render(); };
  lastUndo = undo;
  const p = plannedOp(e);
  if (p != null && k === currentOpDayKey()) {
    const late = msToOp(k, e.t.veio) - (e.ajuste ?? p);
    if (late > 10) {
      toast(`${matName(e)} veio com ${fmtDelta(late)} de atraso. Ajustar o horário?`, 'Ajustar', () => openAdjust(k, id, { motivo: 'Atraso do veículo', value: Math.round(msToOp(k, e.t.veio)) }));
      return;
    }
  }
  toast(`${matName(e)} veio ✓`, 'Desfazer', undo);
}
function markNaoVeio(k, id) {
  const e = findTruck(k, id);
  if (!e || e.status === 'naoveio') return;
  const prev = { status: e.status, t: { ...e.t }, noshows: e.noshows ? [...e.noshows] : undefined };
  e.t ||= {};
  e.t.naoveio = Date.now();
  delete e.t.veio;
  e.status = 'naoveio';
  e.noshows = [...(e.noshows || []), k];
  save(); render();
  const el = $(`[data-id="${id}"]`);
  if (el && !matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('just-no'); setTimeout(() => el.classList.remove('just-no'), 900); }
  fxNaoVeio(id);
  const undo = () => { e.status = prev.status; e.t = prev.t; e.noshows = prev.noshows; save(); render(); };
  lastUndo = undo;
  toast(`${matName(e)} não veio — fica guardado para reagendar`, 'Desfazer', undo);
}
function unmarkVeio(k, id) {
  const e = findTruck(k, id);
  if (!e) return;
  const prev = { status: e.status, t: { ...e.t } };
  e.status = 'programado'; delete e.t.veio;
  save(); render();
  const undo = () => { e.status = prev.status; e.t = prev.t; save(); render(); };
  lastUndo = undo;
  toast('Voltou para aguardando', 'Desfazer', undo);
}
// efeito ao confirmar que o caminhão veio
celebrateTruck.quiet = true; // o efeito completo agora é o fxVeio
function celebrateTruck(id) {
  const el = $(`.view:not([hidden]) [data-id="${id}"]`) || $(`[data-id="${id}"]`);
  if (!el) return;
  el.classList.add('just-veio');
  setTimeout(() => el.classList.remove('just-veio'), 1600);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || celebrateTruck.quiet) return;
  const r = (el.querySelector('.veio-badge, .arr-band') || el).getBoundingClientRect();
  const b = document.createElement('div');
  b.className = 'burst';
  b.style.left = `${r.left + Math.min(r.width, 120) / 2}px`;
  b.style.top = `${r.top + r.height / 2}px`;
  const cols = ['var(--ok)', 'var(--gold)', 'var(--gold-hi)', 'var(--j-emerald)', 'var(--j-sky)', 'var(--j-lime)'];
  let html = '<span class="burst-ring"></span><span class="burst-check">' + I.check + '</span>';
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3, d = 46 + Math.random() * 44;
    html += `<i style="--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px;--c:${cols[i % cols.length]};--s:${(4 + Math.random() * 5).toFixed(1)}px;--rot:${Math.round(Math.random() * 360)}deg;animation-delay:${(Math.random() * 0.08).toFixed(2)}s"></i>`;
  }
  b.innerHTML = html;
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 1300);
}
/* ----- reagendar quem não veio ----- */
let reag = null;
function openReag(k, id) {
  const e = findTruck(k, id);
  if (!e) return;
  const today = new Date();
  const base = keyOf(today) > k ? today : fromKey(k);
  const days = [];
  if (isOpDay(today) && keyOf(today) > k) days.push(today);
  let d = nextOpDay(base);
  while (days.length < 6) { if (!days.some((x) => keyOf(x) === keyOf(d))) days.push(d); d = nextOpDay(d); }
  reag = { k, id, to: keyOf(days[0]) };
  $('#reagBody').innerHTML = `
    <div class="reag-truck">${mono(e)}<div><b>${esc(matName(e))}</b><small>Não veio em ${esc(fmtShort(fromKey(k)))}${(e.noshows || []).length > 1 ? ` · já faltou ${e.noshows.length} vezes` : ''}</small></div></div>
    <span class="fl">Para qual dia?</span>
    <div class="reag-days">${days.map((x) => {
      const kk = keyOf(x), free = CAP - layout(getPlan(kk)).used;
      return `<button type="button" class="reag-day ${kk === reag.to ? 'active' : ''}" data-reag-day="${kk}"><b>${esc(fmtShort(x))}</b><small class="${free < weightOf(e) - 1e-9 ? 'bad' : ''}">${fmtNum(Math.max(0, free))} ${free > 1 + 1e-9 ? 'livres' : 'livre'}</small></button>`;
    }).join('')}</div>
    <div class="form-grid" style="margin-top:12px">
      <label>Outro dia<input type="date" id="reagDate"></label>
      <label>Janela<select id="reagSlot">${SLOTS.map((x) => `<option value="${x.id}" ${x.id === e.slot ? 'selected' : ''}>${x.t}${x.id === e.slot ? ' · a mesma de antes' : ''}</option>`).join('')}</select></label>
    </div>
    <p class="muted small" style="margin:12px 0 0">Ele volta como <b>Aguardando</b> no novo dia, com o preparo e os dados que já tinha.</p>
    <div class="sheet-foot"><span class="spacer"></span><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="button" class="btn btn-primary" data-reag-go>${I.calClock}Reagendar</button></div>`;
  $('#reagDlg').showModal();
}
function doReag() {
  if (!reag) return;
  const { k, id } = reag;
  const to = $('#reagDate').value || reag.to;
  const slot = $('#reagSlot').value;
  const list = S.plan[k] || [];
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  const before = JSON.parse(JSON.stringify(S.plan));
  const e = list[i];
  e.status = 'programado'; e.slot = slot; e.hora = null; e.ajuste = null;
  e.t ||= {}; delete e.t.naoveio; delete e.t.veio;
  e.reag = { from: k, at: Date.now() };
  if (to !== k) {
    list.splice(i, 1);
    if (!list.length) delete S.plan[k];
    (S.plan[to] ||= []).push(e);
  }
  save();
  $('#reagDlg').close();
  agDay = to;
  if (currentTab !== 'agenda') setTab('agenda'); else render();
  focusTruckCard(to, id);
  const undo = () => { S.plan = before; agDay = k; save(); render(); };
  lastUndo = undo;
  toast(`${matName(e)} reagendado para ${fmtShort(fromKey(to))} · ${SLOTS[slotIdx(slot)].t}`, 'Desfazer', undo);
}
// caminhões que não vieram em outros dias (para reaproveitar)
function pendingNoShows(exceptDay) {
  const out = [];
  const lim = keyOf(addDays(new Date(), -21));
  Object.entries(S.plan).forEach(([k, list]) => {
    if (k === exceptDay || k < lim) return;
    list.forEach((e) => { if (e.status === 'naoveio') out.push({ k, e }); });
  });
  return out.sort((a, b) => (a.k < b.k ? 1 : -1));
}
function noShowTray(k) {
  const list = pendingNoShows(k);
  if (!list.length) return '';
  return `<div class="ns-tray">
    <div class="ns-tray-head"><span class="ns-ico">${I.calClock}</span><div><b>Não vieram — guardados para reagendar</b><small>Traga para ${esc(fmtShort(fromKey(k)))} ou escolha outro dia</small></div><span class="pill">${list.length}</span></div>
    <div class="ns-tray-list">${list.map(({ k: kk, e }) => `
      <div class="ns-item">${mono(e)}<div class="ns-info"><b>${esc(matName(e))}</b><small>Não veio ${esc(fmtShort(fromKey(kk)))} · ${esc(slotLabel(e))}</small></div>
        <div class="ns-act"><button type="button" class="btn btn-ghost btn-sm" data-reag="${e.id}" data-day="${kk}">${I.calClock}Outro dia</button>
        <button type="button" class="btn btn-primary btn-sm" data-bring="${e.id}" data-from="${kk}" data-to="${k}">${I.plus}Trazer</button></div>
      </div>`).join('')}</div>
  </div>`;
}
function bringNoShow(from, id, to) {
  const list = S.plan[from] || [];
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  const before = JSON.parse(JSON.stringify(S.plan));
  const e = list[i];
  list.splice(i, 1);
  if (!list.length) delete S.plan[from];
  e.status = 'programado'; e.ajuste = null; e.hora = null;
  e.t ||= {}; delete e.t.naoveio; delete e.t.veio;
  e.reag = { from, at: Date.now() };
  const occ = layout(getPlan(to)).occ;
  const si = slotIdx(e.slot);
  if (si < 0 || occ[si].fill > 1e-9) e.slot = firstFreeSlot(to) || e.slot;
  (S.plan[to] ||= []).push(e);
  save(); render();
  focusTruckCard(to, id);
  const undo = () => { S.plan = before; save(); render(); };
  lastUndo = undo;
  toast(`${matName(e)} trazido para ${fmtShort(fromKey(to))} · ${SLOTS[slotIdx(e.slot)]?.t || 'sem janela'}`, 'Desfazer', undo);
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
  form.tipo.innerHTML = Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.n} (${fmtNum(t.w)} jan.)</option>`).join('');
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
let formSemRep = false;
function applySemRep() {
  const on = formSemRep;
  $('#noRepBtn').classList.toggle('active', on);
  $('#noRepBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
  $('#noRepMsg').hidden = !on;
  $('#repList').hidden = on;
  $('[data-rep-add]').hidden = on;
  $('.rep-field').classList.toggle('is-none', on);
  if (on) $('#repTotal').textContent = '';
}
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
  $('#matList').innerHTML = catDatalist();
  tipoTouched = !!e;
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
  formSemRep = !!e?.semRep && !formReps.length;
  if (!formReps.length) formReps.push({ qtd: null, un: 'kg', lote: '' });
  renderRepRows();
  applySemRep();
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
  form.veioHora.value = e?.t?.veio ? opToHHMM(Math.round(msToOp(dayKey, e.t.veio))) : '';
  $('#veioWrap').hidden = form.status.value !== 'veio';
  form.obs.value = e?.obs || '';
  updateHint();
  updateCatHint(true); // sem produto, sem dica de embalagem
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
    reps: formSemRep ? [] : readRepRows().filter((r) => r.qtd || r.lote), semRep: formSemRep, repQtd: undefined, repUn: undefined, os: form.os.value.trim(),
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
    // status mudou: ajusta os carimbos
    e.t = { ...(e.t || {}) };
    if (data.status !== 'veio') { delete e.t.veio; delete e.t.chegada; delete e.t.inicio; delete e.t.fim; }
    if (data.status === 'veio') {
      const vh = form.veioHora.value;
      e.t.veio = vh ? opStartMs(editing.day) + hhmmToOp(vh) * 60000 : (e.t.veio || Date.now());
    }
    if (data.status === 'naoveio') { e.t.naoveio ||= Date.now(); if (old.status !== 'naoveio') e.noshows = [...(e.noshows || []), editing.day]; } else delete e.t.naoveio;
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
  if (c('[data-open-search]')) { openSearch(); return; }
  if ((el = c('[data-goto-truck]'))) { ev.preventDefault(); $('#searchDlg').close(); document.activeElement?.blur?.(); focusTruckCard(el.dataset.day, el.dataset.gotoTruck); return; }
  if (c('[data-copy-day]')) { openCopyDay(); return; }
  if (c('[data-copy-go]')) { doCopyDay(); return; }
  if (c('[data-drag]')) return;
  if ((el = c('[data-ag-view]'))) { S.settings.agView = el.dataset.agView; expanded.clear(); save(); render(); return; }
  if ((el = c('[data-expand]')) && !c('[data-copy], [data-veio], [data-naoveio], [data-adjust], [data-prep-one], [data-veio-time]')) {
    const id = el.dataset.expand;
    if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
    render();
    requestAnimationFrame(() => $(`[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    return;
  }
  if ((el = c('[data-copy]'))) { ev.preventDefault(); ev.stopPropagation(); copyText(el.dataset.copy); return; }
  if ((el = c('[data-hora-mode]'))) {
    setHoraMode(el.dataset.horaMode);
    if (horaMode === 'imprevisto') { if (!form.hora.value && form.slot.value) form.hora.value = SLOTS[slotIdx(form.slot.value)].t; form.hora.focus(); }
    return;
  }
  if (c('[data-no-rep]')) {
    formSemRep = !formSemRep;
    formReps = formSemRep ? [] : [{ qtd: null, un: 'kg', lote: '' }];
    renderRepRows(!formSemRep);
    applySemRep();
    return;
  }
  if (c('[data-rep-add]')) { formSemRep = false; applySemRep(); formReps = readRepRows(); formReps.push({ qtd: null, un: formReps.at(-1)?.un || 'kg', lote: '' }); renderRepRows(true); return; }
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
    if (at !== '' && at != null) return openEnv(k, null, '__imp', { tipo: calc.tipo, origem: calc.org, saida: dep, viagemH: calc.h, hora: Number(at) });
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
    const k = el.dataset.day, pk = el.dataset.prepOne, env = el.dataset.env;
    const e = setPrep(k, env, pk);
    afterPrep(e, k);
    if (e?.prep?.[pk]) {
      if (prepDone(e) === PREP.length) { fxStep(env, pk); setTimeout(() => fxReady(env), 380); }
      else fxStep(env, pk);
    }
    return;
  }
  if ((el = c('[data-prep-next]'))) {
    const k = el.dataset.day;
    const e = findTruck(k, el.dataset.prepNext);
    const n = e && nextPrepOf(e);
    if (n) {
      setPrep(k, e.id, n.k, true); afterPrep(e, k);
      fxStep(e.id, n.k);
      if (prepDone(e) === PREP.length) setTimeout(() => fxReady(e.id), 380);
    }
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
  if ((el = c('[data-veio]'))) return markVeio(el.dataset.day, el.dataset.veio);
  if ((el = c('[data-naoveio]'))) return markNaoVeio(el.dataset.day, el.dataset.naoveio);
  if ((el = c('[data-unveio]'))) return unmarkVeio(el.dataset.day, el.dataset.unveio);
  if ((el = c('[data-reag]'))) return openReag(el.dataset.day, el.dataset.reag);
  if ((el = c('[data-reag-day]'))) { reag.to = el.dataset.reagDay; $('#reagDate').value = ''; $$('[data-reag-day]').forEach((b) => b.classList.toggle('active', b === el)); return; }
  if (c('[data-reag-go]')) return doReag();
  if ((el = c('[data-bring]'))) return bringNoShow(el.dataset.from, el.dataset.bring, el.dataset.to);
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
$('#searchInput').addEventListener('input', renderSearch);
// Enter abre o 1º resultado (preventDefault evita que o mesmo Enter reabra a busca pelo botão que recebe o foco)
$('#searchInput').addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  ev.preventDefault();
  const r = $('#searchResults .search-row');
  if (r) r.click();
});
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
    else txt += -diff < 1 ? ' · chega bem na hora ✓' : ` · ${untilText(-diff)} antes do horário ✓`;
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

$('#settingsBtn').addEventListener('click', () => { applyTheme(); renderSecUi(); $('#setDlg').showModal(); });
$('#themeBtn').addEventListener('click', toggleTheme);
function toggleTheme() {
  const st = S.settings;
  const cur = document.documentElement.dataset.theme;
  if (document.documentElement.dataset.mode === 'dark') { st.lastDark = cur || 'dark'; st.theme = st.lastLight || 'light'; }
  else { st.lastLight = cur || 'light'; st.theme = st.lastDark || 'dark'; }
  save(); applyTheme(); toast(`Tema: ${THEME_NAMES[st.theme]}`);
}
const THEME_NAMES = { auto: 'Automático', dark: 'Noite Real', light: 'Pergaminho', crimson: 'Carmesim Imperial', knight: 'Cavaleiro Negro', emerald: 'Esmeralda Imperial', ocean: 'Safira Profunda', midnight: 'Céu Lunar', sage: 'Sálvia & Marfim', sakura: 'Sakura', winter: 'Névoa de Inverno' };
$('#nameInput').addEventListener('change', (ev) => { S.settings.name = ev.target.value.trim().slice(0, 30); save(); render(); });
$('#exportBtn').addEventListener('click', async () => {
  const prot = !!SEC.vault;
  if (prot) { await secPersist(); await secFlush(); }
  const blob = new Blob([prot ? JSON.stringify(SEC.vault) : JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `filling-backup${prot ? '-protegido' : ''}-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(prot ? 'Backup protegido exportado — abre só com uma senha deste painel' : 'Backup exportado');
});
$('#importInput').addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const d = JSON.parse(r.result);
      if (d && d.v && Array.isArray(d.users) && d.users.length && d.data && d.rec) {
        if (!secOk()) return toast('Abra pelo link https para importar um backup protegido');
        if (!confirm('Este backup é protegido. Depois de importar, o painel vai pedir um usuário e senha que valiam quando ele foi feito. Substituir os dados deste navegador?')) return;
        await secFlush();
        localStorage.setItem(VAULT_KEY, JSON.stringify(d));
        localStorage.removeItem(STORE_KEY);
        SEC.vault = d; SEC.key = null; SEC.dek = null; SEC.user = null; SEC.locked = true;
        S = load(); applyTheme(); render();
        showLock('Backup importado. Entre com a senha dele.');
        return;
      }
      if (!d || typeof d !== 'object' || !('days' in d || 'plan' in d)) throw new Error('formato');
      if (!confirm('Substituir os dados deste navegador pelo backup?')) return;
      S = migrate({ ...blank(), ...d, settings: { ...blank().settings, ...(d.settings || {}) } });
      save(); applyTheme(); render(); $('#setDlg').close();
      toast(SEC.vault ? 'Backup importado e protegido com a sua senha' : 'Backup importado');
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

/* ================= Animações de cada ação no caminhão =================
   Cada etapa tem a sua: OP carimba, MSC2N vira o calendário, Rótulos sai
   da impressora, ODs abre a caixa, Skelta passa o leitor, Revolog gira o
   relógio e APP vibra o celular. Preparo completo ganha a coroa; Veio, o
   caminhão chegando; Não veio, o carimbo vermelho. */
const FX_MS = 1500;
const fxOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function fxTarget(sel, fallbackId) {
  const all = [...document.querySelectorAll(`.view:not([hidden]) ${sel}`)].filter((x) => x.offsetParent && x.getBoundingClientRect().height > 0);
  return all[0] || (fallbackId ? [...document.querySelectorAll(`.view:not([hidden]) [data-id="${fallbackId}"]`)].find((x) => x.offsetParent) : null) || null;
}
function fxSpawn(el, cls, inner) {
  if (!el || fxOff()) return null;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return null;
  const fx = document.createElement('div');
  fx.className = `fx ${cls}`;
  fx.style.left = `${r.left + r.width / 2}px`;
  fx.style.top = `${r.top + r.height / 2}px`;
  fx.innerHTML = inner;
  document.body.appendChild(fx);
  setTimeout(() => fx.remove(), FX_MS + 200);
  return fx;
}
const fxSparks = (n, cls = '') => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = 30 + Math.random() * 34;
  return `<i class="sp ${cls}" style="--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px;--rot:${Math.round(Math.random() * 300)}deg;animation-delay:${(0.12 + Math.random() * 0.1).toFixed(2)}s"></i>`;
}).join('');
const STEP_FX = {
  op: () => `<span class="fx-ico stamp">${I.clipboard}</span><span class="fx-ring"></span>${fxSparks(10, 'sq')}`,
  msc2n: () => `<span class="fx-ico flip">${I.calCheck}</span>${Array.from({ length: 5 }, (_, i) => `<i class="page" style="--i:${i}"></i>`).join('')}`,
  rot: () => `<span class="fx-ico">${I.printer}</span><i class="label-strip"><b></b><b></b><b></b></i>`,
  od: () => `<span class="fx-ico bounce">${I.package}</span>${Array.from({ length: 6 }, (_, i) => `<i class="cube" style="--a:${-150 + i * 24}deg;--i:${i}"></i>`).join('')}`,
  skelta: () => `<span class="fx-ico">${I.barcode}<i class="laser"></i></span>${fxSparks(8)}`,
  revolog: () => `<span class="fx-ico spin">${I.calClock}</span>${Array.from({ length: 12 }, (_, i) => `<i class="tick" style="--a:${i * 30}deg;--i:${i}"></i>`).join('')}`,
  app: () => `<span class="fx-ico buzz">${I.phone}</span><i class="wave"></i><i class="wave w2"></i><i class="wave w3"></i>`,
};
function fxStep(env, pk) {
  const p = PREP.find((x) => x.k === pk);
  if (!p) return;
  const el = fxTarget(`[data-prep-one="${pk}"][data-env="${env}"]`, env);
  fxSpawn(el, `fx-step fx-${pk} c-${p.c}`, `${STEP_FX[pk]?.() || ''}<em class="fx-label">${esc(p.l)} ✓</em>`);
  if (el) { el.classList.add('fx-hit'); setTimeout(() => el.classList.remove('fx-hit'), 600); }
}
function fxReady(env) {
  const el = fxTarget(`[data-id="${env}"]`);
  fxSpawn(el, 'fx-ready', `<span class="fx-crown">${I.crown}</span>${fxSparks(16, 'gold')}<em class="fx-label big">Pronto para envase!</em>`);
}
function fxVeio(env) {
  const el = fxTarget(`[data-id="${env}"] .veio-badge`, env) || fxTarget(`[data-id="${env}"]`);
  fxSpawn(el, 'fx-veio', `<span class="fx-road"></span><span class="fx-truck">${I.truck}</span><span class="fx-ok">${I.check}</span>${fxSparks(14, 'ok')}<em class="fx-label big">Chegou!</em>`);
}
function fxNaoVeio(env) {
  const el = fxTarget(`[data-id="${env}"] .ns-ribbon`, env) || fxTarget(`[data-id="${env}"]`);
  fxSpawn(el, 'fx-no', `<span class="fx-stampx">${I.x}<b>Não veio</b></span>`);
}

/* ----- hora em que o caminhão chegou ----- */
let veioEdit = null;
function openVeioTime(k, id) {
  const e = findTruck(k, id);
  if (!e) return;
  veioEdit = { k, id };
  const planned = e.ajuste ?? plannedOp(e);
  const cur = e.t?.veio ? opToHHMM(Math.round(msToOp(k, e.t.veio))) : opToHHMM(Math.round(msToOp(k, Date.now())));
  $('#veioBody').innerHTML = `
    <div class="reag-truck ok">${mono(e)}<div><b>${esc(matName(e))}</b><small>${planned != null ? `Programado para ${opToHHMM(planned)}` : 'Sem horário programado'}</small></div></div>
    <label class="fl" for="veioHora">Que horas ele chegou?</label>
    <div class="veio-time-row">
      <input type="time" id="veioHora" value="${cur}" step="60">
      <div class="veio-quick">
        <button type="button" class="chip-btn" data-vq="now">Agora</button>
        ${planned != null ? `<button type="button" class="chip-btn" data-vq="${opToHHMM(planned)}">No horário · ${opToHHMM(planned)}</button>` : ''}
        <button type="button" class="chip-btn" data-vq="-5">−5 min</button>
        <button type="button" class="chip-btn" data-vq="+5">+5 min</button>
      </div>
    </div>
    <p class="veio-diff" id="veioDiff"></p>
    <div class="sheet-foot"><span class="spacer"></span><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="button" class="btn btn-veio" data-veio-save>${I.check}Salvar hora</button></div>`;
  updateVeioDiff();
  $('#veioDlg').showModal();
}
function updateVeioDiff() {
  if (!veioEdit) return;
  const e = findTruck(veioEdit.k, veioEdit.id);
  const v = $('#veioHora').value, box = $('#veioDiff');
  const planned = e && (e.ajuste ?? plannedOp(e));
  if (!v || planned == null) { box.textContent = ''; return; }
  const d = Math.round(hhmmToOp(v) - planned);
  box.className = `veio-diff ${d > 10 ? 'late' : d < -10 ? 'early' : 'ok'}`;
  const span = fmtDelta(Math.abs(d)).replace(/^[+−-]/, '');
  box.textContent = Math.abs(d) <= 10 ? 'Chegou no horário ✓' : d > 0 ? `Chegou ${span} depois do programado` : `Chegou ${span} antes do programado`;
}
function saveVeioTime() {
  if (!veioEdit) return;
  const { k, id } = veioEdit;
  const e = findTruck(k, id);
  const v = $('#veioHora').value;
  if (!e || !v) { $('#veioHora').focus(); return; }
  const prev = { status: e.status, t: { ...e.t } };
  e.t ||= {};
  e.t.veio = opStartMs(k) + hhmmToOp(v) * 60000;
  delete e.t.naoveio;
  const was = e.status;
  e.status = 'veio';
  save();
  $('#veioDlg').close();
  render();
  if (was !== 'veio') { celebrateTruck(id); fxVeio(id); }
  const undo = () => { e.status = prev.status; e.t = prev.t; save(); render(); };
  lastUndo = undo;
  const planned = e.ajuste ?? plannedOp(e);
  const late = planned != null ? hhmmToOp(v) - planned : 0;
  if (late > 10) toast(`Chegou às ${v} (${fmtDelta(late).replace(/^[+]/, '')} de atraso). Ajustar o horário?`, 'Ajustar', () => openAdjust(k, id, { motivo: 'Atraso do veículo', value: Math.round(hhmmToOp(v)) }));
  else toast(`Hora de chegada: ${v}`, 'Desfazer', undo);
}
document.addEventListener('click', (ev) => {
  const q = ev.target.closest('[data-vq]');
  if (q) {
    const inp = $('#veioHora'), a = q.dataset.vq;
    if (a === 'now') inp.value = opToHHMM(Math.round(msToOp(veioEdit.k, Date.now())));
    else if (/^[+-]\d+$/.test(a)) inp.value = opToHHMM(hhmmToOp(inp.value || '00:00') + Number(a));
    else inp.value = a;
    updateVeioDiff();
    return;
  }
  if (ev.target.closest('[data-veio-save]')) saveVeioTime();
  const vt = ev.target.closest('[data-veio-time]');
  if (vt) { ev.stopPropagation(); openVeioTime(vt.dataset.day, vt.dataset.veioTime); }
}, true);
document.addEventListener('input', (ev) => { if (ev.target.id === 'veioHora') updateVeioDiff(); });
document.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'veioHora') { ev.preventDefault(); saveVeioTime(); } });

/* ================= Planilha de materiais e embalagens =================
   O Excel é lido aqui mesmo no navegador (sem enviar para lugar nenhum)
   e fica guardado junto com os dados do painel — cifrado se a proteção
   estiver ativa. Formato: S.cat = { at, file, items: [[codMat, descr, codEmb, emb], ...] } */
// --- leitura de .xlsx (é um .zip com XML dentro) ---
async function unzipEntries(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('zip');
  const n = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out = {};
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
    out[name] = { method, csize, lho };
    p += 46 + nl + xl + cl;
  }
  out.read = async (name) => {
    const e = out[name];
    if (!e) return null;
    const start = e.lho + 30 + dv.getUint16(e.lho + 26, true) + dv.getUint16(e.lho + 28, true);
    const data = u8.subarray(start, start + e.csize);
    if (e.method === 0) return new TextDecoder().decode(data);
    if (e.method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('deflate');
    const ds = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(ds).text();
  };
  return out;
}
const xmlDoc = (s) => new DOMParser().parseFromString(s, 'application/xml');
const tags = (node, name) => [...node.getElementsByTagNameNS('*', name)];
async function readXlsx(buf) {
  const z = await unzipEntries(buf);
  const shared = [];
  const ss = await z.read('xl/sharedStrings.xml');
  if (ss) tags(xmlDoc(ss), 'si').forEach((si) => shared.push(tags(si, 't').map((t) => t.textContent).join('')));
  // primeira aba da pasta
  let sheet = 'xl/worksheets/sheet1.xml';
  try {
    const wb = xmlDoc(await z.read('xl/workbook.xml'));
    const first = tags(wb, 'sheet')[0];
    const rid = first?.getAttribute('r:id') || first?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    const rels = xmlDoc(await z.read('xl/_rels/workbook.xml.rels'));
    const tgt = tags(rels, 'Relationship').find((r) => r.getAttribute('Id') === rid)?.getAttribute('Target');
    if (tgt) sheet = tgt.startsWith('/') ? tgt.slice(1) : 'xl/' + tgt.replace(/^\.\//, '');
  } catch (e) { /* usa sheet1 */ }
  const xml = await z.read(sheet);
  if (!xml) throw new Error('aba');
  const colIdx = (ref) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
  const rows = [];
  tags(xmlDoc(xml), 'row').forEach((row) => {
    const r = [];
    tags(row, 'c').forEach((c, i) => {
      const ref = c.getAttribute('r');
      const ci = ref ? colIdx(ref) : i;
      const t = c.getAttribute('t');
      const v = tags(c, 'v')[0]?.textContent ?? '';
      let val;
      if (t === 's') val = shared[Number(v)] ?? '';
      else if (t === 'inlineStr') val = tags(c, 't').map((x) => x.textContent).join('');
      else if (t === 'b') val = v === '1' ? 'VERDADEIRO' : 'FALSO';
      else if (!t || t === 'n') { const num = Number(v); val = v === '' ? '' : Number.isFinite(num) && Number.isInteger(num) ? String(num) : v; }
      else val = v;
      r[ci] = val;
    });
    rows.push(Array.from(r, (x) => (x == null ? '' : String(x))));
  });
  return rows;
}
function readCsv(text) {
  const first = text.split(/\r?\n/)[0] || '';
  const d = [';', '\t', ','].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; continue; }
    if (ch === '"') q = true;
    else if (ch === d) { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
// acha as colunas pelo cabeçalho (Cod Acabado, Descrição, Cod Embalagem, Embalagem)
function catFromRows(rows) {
  const N = (s) => norm(String(s || '')).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  for (let h = 0; h < Math.min(15, rows.length); h++) {
    const H = rows[h].map(N);
    const find = (re, not) => H.findIndex((x, i) => re.test(x) && !(not || []).includes(i));
    const ec = find(/^(cod|codigo|cd)\b.*emb/);
    const mc = find(/^(cod|codigo|cd)\b.*(acab|mat|prod|item)|^material$|^codigo$|^cod$/, [ec]);
    if (mc < 0 || ec < 0) continue;
    const dc = find(/descri|^nome|^produto$/, [mc, ec]);
    const en = find(/emb/, [mc, ec, dc]);
    const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
    const items = [];
    rows.slice(h + 1).forEach((r) => {
      const code = clean(r[mc]).replace(/\.0+$/, '');
      if (!code) return;
      items.push([code, clean(r[dc]), clean(r[ec]).replace(/\.0+$/, ''), clean(r[en])]);
    });
    if (!items.length) throw new Error('A planilha não tem linhas de materiais abaixo do cabeçalho.');
    return items;
  }
  throw new Error('Não achei as colunas "Cod Acabado" e "Cod Embalagem" no cabeçalho.');
}
async function importCatFile(file) {
  try {
    const items = /\.csv$|\.txt$/i.test(file.name)
      ? catFromRows(readCsv(await file.text()))
      : catFromRows(await readXlsx(await file.arrayBuffer()));
    const prev = S.cat?.items.length;
    S.cat = { at: Date.now(), file: file.name, items };
    catIdx = null;
    delete S.catSkip;
    save(); render();
    const embs = new Set(items.map((x) => x[2])).size;
    toast(`Planilha atualizada · ${items.length} ${items.length === 1 ? 'material' : 'materiais'} · ${embs} ${embs === 1 ? 'embalagem' : 'embalagens'}${prev != null && prev !== items.length ? ` (antes ${prev})` : ''}`);
  } catch (e) {
    console.error(e);
    toast(e.message && !/^(zip|deflate|aba)$/.test(e.message) ? e.message : 'Não consegui ler esse arquivo. Salve como .xlsx (ou .csv) e tente de novo.');
  }
}
// --- consultas ---
let catIdx = null;
function catIndex() {
  if (!S.cat?.items?.length) return null;
  if (catIdx && catIdx.at === S.cat.at && catIdx.n === S.cat.items.length) return catIdx;
  const byMat = new Map(), byEmb = new Map(), byDesc = new Map();
  // código só com os números (a planilha às vezes traz "50151656*" ou espaços)
  const mk = (c) => String(c).match(/\d{4,}/)?.[0] || String(c).trim();
  S.cat.items.forEach((it) => {
    const key = mk(it[0]);
    if (!byMat.has(key)) byMat.set(key, []);
    byMat.get(key).push(it);
    if (!byEmb.has(it[2])) byEmb.set(it[2], { code: it[2], name: it[3], items: [] });
    byEmb.get(it[2]).items.push(it);
    byDesc.set(norm(it[1]), it);
  });
  catIdx = { at: S.cat.at, n: S.cat.items.length, byMat, byEmb, byDesc };
  return catIdx;
}
const kgOf = (desc) => { const m = /(\d+(?:[.,]\d+)?)\s*KG\b/i.exec(desc || ''); return m ? Number(m[1].replace(',', '.')) : null; };
const embNice = (s) => String(s || '').replace(/\s+/g, ' ').trim();
// tipo de envase sugerido pela embalagem (só quando é certeiro)
function tipoFromEmb(emb) {
  const n = norm(emb);
  if (/tambor|bombona/.test(n)) return 'tambor';
  if (/ibc/.test(n) && /papel/.test(n)) return 'ibc';
  return null;
}
const embIcon = (emb) => (/tambor|bombona/.test(norm(emb)) ? I.drum : /ibc/.test(norm(emb)) ? I.ibc : I.package);
// item da planilha para um material digitado ("50451613 Acronal…" ou só o nome)
function catLookup(material) {
  const ix = catIndex();
  if (!ix) return { state: 'none' };
  const { code, name } = splitMat(material);
  if (code) {
    const list = ix.byMat.get(code);
    return list ? { state: 'ok', code, list, it: list[0] } : { state: 'missing', code };
  }
  const it = ix.byDesc.get(norm(name));
  return it ? { state: 'ok', code: it[0], list: [it], it } : { state: 'nocode' };
}
function embMini(e) {
  const cl = catLookup(e.material);
  if (cl.state === 'missing') return `<span class="ichip warn-chip mini" title="Código fora da planilha — confira">${I.alert}fora da planilha</span>`;
  if (cl.state !== 'ok' || !cl.it[2] || cl.it[2] === 'NA') return '';
  return copyChip('emb mini', embIcon(cl.it[3]), '', cl.it[2]).replace('title="', `title="${esc(embNice(cl.it[3]))} · `);
}
function embQty(it, pesoKg) {
  const kg = kgOf(it?.[1]);
  return kg && pesoKg ? Math.ceil(pesoKg / kg - 1e-9) : null;
}
const catStale = () => !S.cat || keyOf(new Date(S.cat.at)) !== todayKey();
const catNeedsReminder = () => catStale() && S.catSkip !== todayKey();
function catAge() {
  if (!S.cat) return 'nunca importada';
  const d = new Date(S.cat.at), k = keyOf(d);
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (k === todayKey()) return `hoje às ${hm}`;
  if (k === keyOf(addDays(new Date(), -1))) return `ontem às ${hm}`;
  return `${fmtDM(d)} às ${hm}`;
}

/* ----- lembrete diário (tela Hoje) ----- */
function renderCatRemind() {
  const box = $('#catRemind');
  $$('.tab-btn[data-tab=materiais]').forEach((b) => b.classList.toggle('has-dot', catNeedsReminder()));
  if (!box) return;
  if (!catNeedsReminder()) { box.innerHTML = ''; box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<div class="cat-remind">
    <span class="cr-ico">${I.file}</span>
    <div class="cr-txt"><strong>${S.cat ? 'Atualize a planilha de embalagens' : 'Importe a planilha de embalagens'}</strong>
      <span>${S.cat ? `Exporte o Excel de hoje e importe aqui · última atualização ${catAge()}` : 'Com ela, o painel mostra a embalagem e o código de cada material'}</span></div>
    <div class="cr-act"><button class="btn btn-primary btn-sm" data-cat-import>${I.download}Importar agora</button>${S.cat ? '<button class="btn btn-ghost btn-sm" data-cat-skip>Hoje não</button>' : ''}</div>
  </div>`;
}

/* ----- aba Materiais ----- */
let catQ = '', catFilter = '';
function catSearch(q) {
  const ix = catIndex();
  const terms = norm(q).split(/\s+/).filter(Boolean);
  let list = S.cat.items;
  if (catFilter) list = list.filter((it) => it[2] === catFilter);
  if (!terms.length) return list;
  return list.filter((it) => { const h = norm(it.join(' ')); return terms.every((t) => h.includes(t)); })
    .sort((a, b) => {
      const t = terms[0];
      const sa = a[0].startsWith(t) ? 0 : a[2].startsWith(t) ? 1 : 2, sb = b[0].startsWith(t) ? 0 : b[2].startsWith(t) ? 1 : 2;
      return sa - sb || a[1].localeCompare(b[1]);
    });
}
function catRow(it, q) {
  const kg = kgOf(it[1]);
  return `<div class="cat-row">
    <div class="cr-mat">${copyChip('code', I.barcode, '', it[0])}<span class="cr-desc">${markHit(it[1] || '—', q)}</span></div>
    <div class="cr-emb"><span class="cr-emb-name">${embIcon(it[3])}${markHit(embNice(it[3]) || 'Sem nome', q)}</span>${it[2] && it[2] !== 'NA' ? copyChip('emb', I.package, '', it[2]) : '<span class="ichip muted-chip">Sem código</span>'}${kg ? `<span class="cr-kg">${fmtNum(kg)} kg</span>` : ''}</div>
  </div>`;
}
function catHero(list, q) {
  return list.map((it) => {
    const kg = kgOf(it[1]), tp = tipoFromEmb(it[3]);
    return `<section class="card cat-hero">
      <div class="ch-top"><span class="eyebrow">Material</span>${copyChip('code', I.barcode, '', it[0])}</div>
      <h2 class="ch-name">${esc(it[1] || 'Sem descrição')}</h2>
      <div class="ch-emb">
        <span class="ch-emb-ico">${embIcon(it[3])}</span>
        <div><span class="ch-lbl">Embalagem</span><strong>${esc(embNice(it[3]) || '—')}</strong>
          <span class="ch-meta">${kg ? `${fmtNum(kg)} kg por embalagem` : ''}${kg && tp ? ' · ' : ''}${tp ? `Tipo de envase: ${TYPES[tp].n}` : ''}</span></div>
        ${it[2] && it[2] !== 'NA' ? `<button class="ch-code copyable" data-copy="${esc(it[2])}" title="Copiar código da embalagem"><span>Código</span><b>${esc(it[2])}</b>${I.copy}</button>` : '<span class="ch-code none"><span>Código</span><b>sem código</b></span>'}
      </div>
    </section>`;
  }).join('') + (list.length > 1 ? `<p class="cat-note">${I.alert}Este código aparece ${list.length} vezes na planilha com descrições diferentes — confira qual é.</p>` : '');
}
function renderMateriais() {
  const st = $('#catStatus'), out = $('#catOut'), fl = $('#catFilters');
  const ix = catIndex();
  const stale = catStale();
  st.innerHTML = !ix ? '' : `<div class="cat-status ${stale ? 'stale' : 'ok'}">
    <span class="cs-ico">${stale ? I.alarm : I.check}</span>
    <div><strong>${S.cat.items.length} materiais · ${ix.byEmb.size} embalagens</strong>
    <span>Atualizada ${catAge()}${S.cat.file ? ` · ${esc(S.cat.file)}` : ''}${stale ? ' · exporte o Excel de hoje e importe de novo' : ''}</span></div>
  </div>`;
  $('#catSearchCard').hidden = !ix;
  if (!ix) {
    fl.innerHTML = '';
    out.innerHTML = `<section class="card cat-empty">
      <span class="ce-ico">${I.file}</span>
      <h2>Importe a planilha de embalagens</h2>
      <p class="muted">Use o Excel com as colunas <b>Cod Acabado</b>, <b>Descrição</b>, <b>Cod Embalagem</b> e <b>Embalagem</b>. Ele é lido aqui mesmo e fica só neste aparelho${SEC.vault ? ', cifrado com a sua senha' : ''}.</p>
      <button class="btn btn-primary" data-cat-import>${I.download}Escolher planilha</button>
    </section>`;
    return;
  }
  const inp = $('#catQ');
  if (document.activeElement !== inp && inp.value !== catQ) inp.value = catQ;
  $('#catClear').hidden = !catQ;
  const embs = [...ix.byEmb.values()].sort((a, b) => b.items.length - a.items.length);
  fl.innerHTML = `<button class="cf-chip${!catFilter ? ' active' : ''}" data-cat-filter="">Todas <em>${S.cat.items.length}</em></button>` +
    embs.map((g) => `<button class="cf-chip${catFilter === g.code ? ' active' : ''}" data-cat-filter="${esc(g.code)}" title="${esc(g.code)}">${embIcon(g.name)}${esc(embNice(g.name) || g.code)} <em>${g.items.length}</em></button>`).join('');
  const q = catQ.trim();
  const digits = /^\d{4,}$/.test(q);
  // código exato do material → resultado em destaque
  if (digits && ix.byMat.has(q) && !catFilter) { out.innerHTML = catHero(ix.byMat.get(q), q); return; }
  let head = '';
  if (digits && ix.byEmb.has(q)) { const g = ix.byEmb.get(q); head = `<div class="cat-group-head">${embIcon(g.name)}<div><strong>${esc(embNice(g.name))}</strong><span>Embalagem ${esc(g.code)} · usada por ${g.items.length} materiais</span></div>${copyChip('emb', I.package, '', g.code)}</div>`; }
  const res = catSearch(q);
  if (!res.length) {
    out.innerHTML = `<section class="card cat-empty small"><span class="ce-ico warn">${I.alert}</span><h2>${digits ? `O código ${esc(q)} não está na planilha` : 'Nada encontrado'}</h2><p class="muted">${digits ? 'Confira o número. Se for um material novo, ele aparece depois que a planilha atualizada for importada.' : 'Tente o código, parte do nome ou o código da embalagem.'}</p></section>`;
    return;
  }
  const shown = res.slice(0, 150);
  out.innerHTML = `<section class="card cat-list">${head}
    <div class="cat-count">${res.length} ${res.length === 1 ? 'material' : 'materiais'}${catFilter ? ` com ${esc(embNice(ix.byEmb.get(catFilter)?.name))}` : ''}${res.length > shown.length ? ` · mostrando ${shown.length}, refine a busca` : ''}</div>
    ${shown.map((it) => catRow(it, q)).join('')}</section>`;
}
document.addEventListener('click', (ev) => {
  if (ev.target.closest('[data-cat-import]')) { $('#catFile').click(); return; }
  if (ev.target.closest('[data-cat-skip]')) { S.catSkip = todayKey(); save(); render(); toast('Certo, lembro de novo amanhã'); return; }
  const f = ev.target.closest('[data-cat-filter]');
  if (f) { catFilter = f.dataset.catFilter; renderMateriais(); return; }
  const g = ev.target.closest('[data-cat-goto]');
  if (g) { catQ = g.dataset.catGoto; catFilter = ''; $('#searchDlg').close(); setTab('materiais'); }
});
$('#catFile').addEventListener('change', (ev) => { const f = ev.target.files[0]; if (f) importCatFile(f); ev.target.value = ''; });
$('#catQ').addEventListener('input', (ev) => { catQ = ev.target.value; renderMateriais(); });
$('#catClear').addEventListener('click', () => { catQ = ''; $('#catQ').value = ''; renderMateriais(); $('#catQ').focus(); });

/* ----- no cadastro do caminhão ----- */
let tipoTouched = false;
function updateCatHint(final) {
  const box = $('#catHint');
  const r = catLookup(form.material.value);
  const hide = () => { box.hidden = true; box.innerHTML = ''; box.className = 'span-2 cat-hint'; };
  if (r.state === 'none' || r.state === 'nocode' || !form.material.value.trim()) return hide();
  // ainda digitando o código: só avisa "não está na planilha" quando o número estiver completo
  if (r.state === 'missing' && !final && r.code.length < 8) return hide();
  box.hidden = false;
  if (r.state === 'missing') {
    box.className = 'cat-hint warn';
    box.innerHTML = `${I.alert}<span>O código <b>${esc(r.code)}</b> não está na planilha — confira o número.</span>`;
    return;
  }
  const it = r.it, kg = kgOf(it[1]);
  const qty = embQty(it, parsePesoKg(form.pesoT.value));
  box.className = 'cat-hint ok';
  box.innerHTML = `<span class="ch-ico">${embIcon(it[3])}</span>
    <span class="ch-body"><span><b>${esc(embNice(it[3]) || 'Embalagem')}</b>${it[2] && it[2] !== 'NA' ? ` · cód. <b class="copyable" data-copy="${esc(it[2])}" role="button" tabindex="0" title="Copiar">${esc(it[2])}</b>` : ''}</span>
    <small>${esc(it[1])}${kg ? ` · ${fmtNum(kg)} kg cada` : ''}${qty ? ` · ≈ <b>${qty}</b> embalage${qty === 1 ? 'm' : 'ns'} para este peso` : ''}${r.list.length > 1 ? ` · ${r.list.length} linhas com este código` : ''}</small></span>`;
}
function catApplyTipo() {
  const r = catLookup(form.material.value);
  if (r.state !== 'ok' || tipoTouched) return;
  const tp = tipoFromEmb(r.it[3]);
  if (tp && form.tipo.value !== tp) { form.tipo.value = tp; updateHint(); toast(`Tipo ajustado para ${TYPES[tp].n} pela embalagem`); }
}
form.material.addEventListener('input', () => { updateCatHint(); catApplyTipo(); });
// digitou só o código e saiu do campo → completa com a descrição da planilha
form.material.addEventListener('change', () => {
  const v = form.material.value.trim();
  const ix = catIndex();
  if (ix && /^\d{4,}$/.test(v) && ix.byMat.get(v)?.length === 1) form.material.value = `${v} ${ix.byMat.get(v)[0][1]}`;
  updateCatHint(true); catApplyTipo();
});
form.tipo.addEventListener('change', (ev) => { if (ev.isTrusted) tipoTouched = true; });
form.status.addEventListener('change', () => {
  $('#veioWrap').hidden = form.status.value !== 'veio';
  if (form.status.value === 'veio' && !form.veioHora.value) form.veioHora.value = opToHHMM(Math.round(msToOp(editing.day, Date.now())));
});
form.pesoT.addEventListener('input', updateCatHint);
function catDatalist() {
  const ix = catIndex();
  const recent = S.materials.slice(0, 60);
  const seen = new Set(recent.map((m) => norm(m)));
  const fromCat = ix ? S.cat.items.map((it) => `${it[0]} ${it[1]}`).filter((m) => !seen.has(norm(m))) : [];
  return [...recent, ...fromCat].map((m) => `<option value="${esc(m)}">`).join('');
}

/* ================= Segurança: tela de bloqueio e usuários ================= */
Object.assign(I, {
  lock: sv('<rect class="d" x="4" y="10.5" width="16" height="10.5" rx="2.5"/><rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 14.5v2.5"/>'),
  key: sv('<circle class="d" cx="8" cy="15" r="4.5"/><circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>'),
  shield: sv('<path class="d" d="M12 3l8 3v6c0 4.6-3.3 8.3-8 9-4.7-.7-8-4.4-8-9V6z"/><path d="M12 3l8 3v6c0 4.6-3.3 8.3-8 9-4.7-.7-8-4.4-8-9V6zM8.5 12l2.5 2.5 4.5-5"/>'),
  users: sv('<circle class="d" cx="9" cy="8" r="3.5"/><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>'),
  user: sv('<circle class="d" cx="12" cy="8" r="4"/><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>'),
  eye: sv('<path class="d" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: sv('<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  dialpad: sv('<circle cx="6" cy="5" r="1.4"/><circle cx="12" cy="5" r="1.4"/><circle cx="18" cy="5" r="1.4"/><circle cx="6" cy="11" r="1.4"/><circle cx="12" cy="11" r="1.4"/><circle cx="18" cy="11" r="1.4"/><circle cx="6" cy="17" r="1.4"/><circle cx="12" cy="17" r="1.4"/><circle cx="18" cy="17" r="1.4"/>'),
  download: sv('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>'),
  trash: sv('<path class="d" d="M6 7h12l-1 13H7z"/><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'),
  backspace: sv('<path class="d" d="M8 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-6-7z"/><path d="M8 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-6-7zM11 9l6 6M17 9l-6 6"/>'),
});
const AUTOLOCK_OPTS = [[5, '5 minutos'], [15, '15 minutos'], [30, '30 minutos'], [60, '1 hora'], [240, '4 horas'], [0, 'Nunca']];
const PW_MIN = 6;
const lockEl = () => $('#lock');
let lockView = 'login', lockFails = 0, lockUntil = 0, lockPin = '', lockPinUser = null, lockTick = null;
const pwField = (name, label, ac, extra = '') => `<label>${label}<span class="pw-wrap"><input type="password" name="${name}" autocomplete="${ac}" ${extra}><button type="button" class="pw-eye" data-pw-eye tabindex="-1" aria-label="Mostrar senha">${I.eye}</button></span></label>`;

function showLock(msg = '') {
  $$('dialog[open]').forEach((d) => d.close());
  document.documentElement.classList.add('is-locked');
  const v = SEC.vault;
  const last = secUser(v.last) || v.users[0];
  lockPinUser = last?.pin ? last.id : (v.users.find((u) => u.pin)?.id || null);
  lockView = last?.pin ? 'pin' : 'login';
  lockPin = '';
  lockEl().hidden = false;
  renderLock(msg);
  renderSecUi();
}
function renderLock(msg = '') {
  const v = SEC.vault, body = $('#lockBody');
  const last = secUser(v.last) || v.users[0];
  $('#lockSub').textContent = lockView === 'recover' ? 'Recuperar acesso' : 'Painel protegido';
  if (!secOk()) { body.innerHTML = `<p class="lock-msg err">Para desbloquear, abra o painel pelo link seguro (https) do GitHub Pages.</p>`; return; }
  if (lockView === 'pin') {
    const u = secUser(lockPinUser);
    if (!u?.pin) { lockView = 'login'; return renderLock(msg); }
    body.innerHTML = `
      <div class="pin-who">${I.user}<span>PIN de <b>${esc(u.u)}</b></span></div>
      <div class="pin-dots" aria-label="${lockPin.length} de ${u.pin.len} dígitos">${Array.from({ length: u.pin.len }, (_, i) => `<i class="${i < lockPin.length ? 'on' : ''}"></i>`).join('')}</div>
      <p class="lock-msg${msg ? ' err' : ''}" id="lockMsg" role="alert">${esc(msg)}</p>
      <div class="pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-pin-k="${n}">${n}</button>`).join('')}<span></span><button type="button" data-pin-k="0">0</button><button type="button" data-pin-k="del" aria-label="Apagar">${I.backspace}</button></div>
      <div class="lock-links"><button type="button" class="link-btn" data-lock-view="login">${I.key}Usar senha</button></div>`;
    return;
  }
  if (lockView === 'recover') {
    body.innerHTML = `
      <form id="recForm" class="lock-form" autocomplete="off" novalidate>
        <p class="lock-note">Digite o código de recuperação que você guardou ao ativar a proteção e escolha uma nova senha.</p>
        <label>Código de recuperação<input name="c" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" spellcheck="false" class="code-input"></label>
        <label>Usuário<input name="u" value="${esc(last?.u || '')}" autocapitalize="off" spellcheck="false"></label>
        ${pwField('p', 'Nova senha', 'new-password')}
        ${pwField('p2', 'Confirmar nova senha', 'new-password')}
        <p class="lock-msg${msg ? ' err' : ''}" id="lockMsg" role="alert">${esc(msg)}</p>
        <button class="btn btn-primary lock-go" type="submit">${I.shield}Redefinir e entrar</button>
      </form>
      <div class="lock-links"><button type="button" class="link-btn" data-lock-view="login">${I.back}Voltar</button></div>`;
    return;
  }
  const hasPin = v.users.some((u) => u.pin);
  body.innerHTML = `
    <form id="lockForm" class="lock-form" autocomplete="on" novalidate>
      <label>Usuário<input name="u" autocomplete="username" value="${esc(last?.u || '')}" autocapitalize="off" spellcheck="false"></label>
      ${pwField('p', 'Senha', 'current-password')}
      <p class="lock-msg${msg ? ' err' : ''}" id="lockMsg" role="alert">${esc(msg)}</p>
      <button class="btn btn-primary lock-go" type="submit">${I.key}Entrar</button>
    </form>
    <div class="lock-links">
      ${hasPin ? `<button type="button" class="link-btn" data-lock-view="pin">${I.dialpad}Entrar com PIN</button>` : ''}
      <button type="button" class="link-btn" data-lock-view="recover">Esqueci minha senha</button>
    </div>`;
  const f = $('#lockForm');
  (f.u.value ? f.p : f.u).focus({ preventScroll: true });
  throttleUi();
}
function lockMsg(msg, shake = true) {
  const m = $('#lockMsg');
  if (m) { m.textContent = msg; m.classList.toggle('err', !!msg); }
  if (shake) { const c = $('.lock-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
}
function throttleUi() {
  clearInterval(lockTick);
  const btn = $('#lockForm .lock-go');
  if (!btn) return;
  const upd = () => {
    const s = Math.ceil((lockUntil - Date.now()) / 1000);
    if (s > 0) { btn.disabled = true; btn.innerHTML = `${I.clock}Aguarde ${s}s`; }
    else { btn.disabled = false; btn.innerHTML = `${I.key}Entrar`; clearInterval(lockTick); }
  };
  upd();
  if (lockUntil > Date.now()) lockTick = setInterval(upd, 500);
}
function busyBtn(btn, on, label) {
  if (!btn) return;
  if (on) { btn.dataset.html = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span>${label || 'Verificando…'}`; }
  else { btn.disabled = false; if (btn.dataset.html) btn.innerHTML = btn.dataset.html; }
}
async function secOpen(dek, user) {
  const key = await dataKey(dek);
  const d = JSON.parse(td.decode(await unseal(key, SEC.vault.data)));
  SEC.dek = dek; SEC.key = key;
  S = migrate({ ...blank(), ...d, settings: { ...blank().settings, ...(d.settings || {}) } });
  SEC.user = user.id; SEC.locked = false; SEC.lastAct = Date.now();
  SEC.vault.last = user.id;
  if (user.pin) user.pin.fails = 0;
  lockFails = 0; lockUntil = 0; lockPin = '';
  secWriteVault();
  lockEl().hidden = true; $('#lockBody').innerHTML = '';
  document.documentElement.classList.remove('is-locked');
  applyTheme(); renderSecUi(); render();
  toast(`Bem-vindo de volta, ${user.u}`);
}
async function secLock(msg = '') {
  if (!SEC.vault || SEC.locked) return;
  if (SEC.key) { await secPersist(); await secFlush(); }
  SEC.key = null; SEC.dek = null; SEC.user = null; SEC.locked = true;
  S = load(); // estado vazio, só com o tema
  try { expanded.clear(); openTrucks.clear(); } catch (e) { /* ignora */ }
  render();
  showLock(msg);
}
async function doLogin(f) {
  if (Date.now() < lockUntil) return;
  const btn = f.querySelector('.lock-go');
  const name = f.u.value, pw = f.p.value;
  if (!name.trim() || !pw) return lockMsg('Preencha usuário e senha');
  busyBtn(btn, true);
  const user = SEC.vault.users.find((u) => normUser(u.u) === normUser(name));
  try {
    if (!user) { await kdf(pw, rnd(16), KDF_ITER); throw new Error('x'); } // mesmo tempo de resposta
    const dek = await unwrapDek(pw, user.pw);
    await secOpen(dek, user);
  } catch (e) {
    busyBtn(btn, false);
    lockFails++;
    f.p.value = ''; f.p.focus();
    if (lockFails >= 5) { lockUntil = Date.now() + 30000 * Math.min(8, 2 ** (lockFails - 5)); lockMsg('Muitas tentativas. Aguarde para tentar de novo.'); throttleUi(); }
    else lockMsg('Usuário ou senha incorretos');
  }
}
async function pinPress(k) {
  const u = secUser(lockPinUser);
  if (!u?.pin || SEC.pinBusy) return;
  if (k === 'del') lockPin = lockPin.slice(0, -1);
  else if (lockPin.length < u.pin.len) lockPin += k;
  $$('.pin-dots i').forEach((d, i) => d.classList.toggle('on', i < lockPin.length));
  if (lockPin.length < u.pin.len) return;
  SEC.pinBusy = true;
  $('.pin-dots').classList.add('checking');
  try {
    const dek = await unwrapDek(lockPin, u.pin);
    SEC.pinBusy = false;
    await secOpen(dek, u);
  } catch (e) {
    SEC.pinBusy = false;
    lockPin = '';
    u.pin.fails = (u.pin.fails || 0) + 1;
    if (u.pin.fails >= PIN_MAX_FAILS) {
      u.pin = null; secWriteVault();
      lockView = 'login'; renderLock('PIN bloqueado depois de 5 erros. Entre com a senha.');
      lockMsg('PIN bloqueado depois de 5 erros. Entre com a senha.');
      return;
    }
    secWriteVault();
    const left = PIN_MAX_FAILS - u.pin.fails;
    renderLock(`PIN incorreto · ${left} ${left === 1 ? 'tentativa restante' : 'tentativas restantes'}`);
    lockMsg($('#lockMsg').textContent);
  }
}
async function doRecover(f) {
  const btn = f.querySelector('.lock-go');
  const code = normCode(f.c.value), name = f.u.value, p = f.p.value, p2 = f.p2.value;
  const user = SEC.vault.users.find((u) => normUser(u.u) === normUser(name));
  if (code.length !== 20) return lockMsg('O código tem 20 letras e números');
  if (!user) return lockMsg('Usuário não encontrado neste painel');
  if (p.length < PW_MIN) return lockMsg(`A nova senha precisa de pelo menos ${PW_MIN} caracteres`);
  if (p !== p2) return lockMsg('As senhas não conferem');
  busyBtn(btn, true);
  try {
    const dek = await unwrapDek(code, SEC.vault.rec);
    user.pw = await wrapDek(p, dek);
    await secOpen(dek, user);
    toast('Senha redefinida. Bem-vindo de volta');
  } catch (e) { busyBtn(btn, false); lockMsg('Código de recuperação incorreto'); }
}
lockEl().addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (ev.target.id === 'lockForm') doLogin(ev.target);
  if (ev.target.id === 'recForm') doRecover(ev.target);
});
lockEl().addEventListener('click', (ev) => {
  const vb = ev.target.closest('[data-lock-view]');
  if (vb) {
    lockView = vb.dataset.lockView; lockPin = '';
    if (lockView === 'pin') {
      const typed = $('#lockForm')?.u.value;
      const u = SEC.vault.users.find((x) => x.pin && normUser(x.u) === normUser(typed)) || secUser(lockPinUser) || SEC.vault.users.find((x) => x.pin);
      lockPinUser = u?.id || null;
    }
    renderLock(); return;
  }
  const pk = ev.target.closest('[data-pin-k]');
  if (pk) { pinPress(pk.dataset.pinK); return; }
});
document.addEventListener('click', (ev) => {
  const eye = ev.target.closest('[data-pw-eye]');
  if (!eye) return;
  const inp = eye.parentElement.querySelector('input');
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  eye.innerHTML = show ? I.eyeOff : I.eye;
  eye.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
});
document.addEventListener('keydown', (ev) => {
  if (!SEC.locked || lockEl().hidden || lockView !== 'pin') return;
  if (/^\d$/.test(ev.key)) { ev.preventDefault(); pinPress(ev.key); }
  else if (ev.key === 'Backspace') { ev.preventDefault(); pinPress('del'); }
});
// bloqueio automático por inatividade
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => window.addEventListener(t, () => { SEC.lastAct = Date.now(); }, { passive: true, capture: true }));
function secIdleCheck() {
  if (!SEC.vault || SEC.locked) return;
  const m = SEC.vault.meta?.autoLock ?? 15;
  if (m > 0 && Date.now() - SEC.lastAct > m * 60000) secLock('Bloqueado por inatividade');
}
setInterval(secIdleCheck, 10000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) secIdleCheck(); });

/* ----- seção Segurança nas configurações ----- */
function renderSecUi() {
  const lb = $('#lockBtn');
  if (lb) lb.hidden = !SEC.vault || SEC.locked;
  const box = $('#secBlock');
  if (!box) return;
  if (!secOk()) {
    box.innerHTML = `<div class="sec-head"><span class="sec-ico">${I.shield}</span><div><strong>Proteção com senha</strong><p class="muted">Disponível quando o painel é aberto pelo link seguro (https) do GitHub Pages.</p></div></div>`;
    return;
  }
  if (!SEC.vault) {
    box.innerHTML = `
      <div class="sec-head"><span class="sec-ico">${I.shield}</span>
        <div><strong>Proteção com senha</strong><p class="muted">Desligada. Quem abrir este navegador vê o painel.</p></div>
        <button class="btn btn-primary btn-sm" data-sec="setup">${I.lock}Ativar</button></div>`;
    return;
  }
  const u = secUser();
  if (!u) { box.innerHTML = ''; return; }
  const al = SEC.vault.meta?.autoLock ?? 15;
  box.innerHTML = `
    <div class="sec-head on"><span class="sec-ico">${I.shield}</span>
      <div><strong>Proteção ativa</strong><p class="muted">Entrou como <b>${esc(u.u)}</b>${u.role === 'admin' ? ' · administrador' : ''} · dados cifrados neste aparelho</p></div>
      <button class="btn btn-ghost btn-sm" data-sec="lock">${I.lock}Bloquear</button></div>
    <div class="sec-grid">
      <button class="sec-act" data-sec="pass">${I.key}<span>Trocar minha senha</span></button>
      <button class="sec-act" data-sec="pin">${I.dialpad}<span>${u.pin ? 'PIN ativo' : 'Criar PIN'}</span>${u.pin ? `<em>${u.pin.len} dígitos</em>` : ''}</button>
      ${u.role === 'admin' ? `<button class="sec-act" data-sec="users">${I.users}<span>Usuários</span><em>${SEC.vault.users.length}</em></button>
      <button class="sec-act" data-sec="code">${I.shield}<span>Novo código de recuperação</span></button>` : ''}
    </div>
    <div class="set-row sec-row"><div><strong>Bloqueio automático</strong><p class="muted">Sem uso por esse tempo, pede a senha de novo</p></div>
      <select id="autoLockSel">${AUTOLOCK_OPTS.map(([m, l]) => `<option value="${m}"${m === al ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
    ${u.role === 'admin' ? `<div class="sec-off"><button class="btn btn-danger-ghost btn-sm" data-sec="off">Desativar proteção</button></div>` : ''}`;
}
$('#setDlg').addEventListener('change', (ev) => {
  if (ev.target.id !== 'autoLockSel') return;
  SEC.vault.meta = { ...secMeta(), autoLock: Number(ev.target.value) };
  secPersist();
  toast(Number(ev.target.value) ? `Bloqueio automático: ${ev.target.selectedOptions[0].text}` : 'Bloqueio automático desligado');
});
$('#setDlg').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-sec]');
  if (!b) return;
  const a = b.dataset.sec;
  if (a === 'lock') return secLock();
  if (a === 'code' && !confirm('Gerar um novo código de recuperação? O código antigo deixa de funcionar.')) return;
  openSecDlg(a);
});
$('#lockBtn').addEventListener('click', () => secLock());

/* ----- diálogo de segurança ----- */
const secDlg = $('#secDlg');
let secView = '';
function secHint(msg, ok = false) { const h = $('#secHint'); if (h) { h.textContent = msg; h.classList.toggle('ok', ok); h.classList.toggle('err', !ok && !!msg); } }
function openSecDlg(view, data) {
  secView = view;
  const T = { setup: ['Segurança', 'Ativar proteção'], code: ['Segurança', 'Código de recuperação'], pass: ['Sua conta', 'Trocar senha'], pin: ['Sua conta', 'PIN de acesso rápido'], users: ['Administração', 'Usuários'], off: ['Segurança', 'Desativar proteção'] }[view];
  $('#secEyebrow').textContent = T[0]; $('#secTitle').textContent = T[1];
  const body = $('#secBody');
  const u = secUser();
  const foot = (label, icon = I.check) => `<p class="sec-hint" id="secHint" role="alert"></p><div class="sheet-foot"><span class="spacer"></span><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="btn btn-primary">${icon}${label}</button></div>`;
  if (view === 'setup') {
    body.innerHTML = `<form class="sec-form" data-form="setup" novalidate>
      <p class="sec-lead">Os dados do painel passam a ficar <b>cifrados</b> neste navegador. Para abrir, será preciso entrar com usuário e senha (ou PIN).</p>
      <div class="form-grid">
        <label class="span-2">Usuário<input name="u" maxlength="30" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="Ex.: lelouch"></label>
        ${pwField('p', 'Senha', 'new-password')}
        ${pwField('p2', 'Confirmar senha', 'new-password')}
        <label class="span-2 check-line"><input type="checkbox" name="usePin"> Criar também um PIN para entrar rápido</label>
        <label class="pin-only" hidden>PIN (4 a 6 números)<input name="pin" inputmode="numeric" maxlength="6" autocomplete="off" type="password"></label>
        <label class="pin-only" hidden>Confirmar PIN<input name="pin2" inputmode="numeric" maxlength="6" autocomplete="off" type="password"></label>
        <label class="span-2">Bloqueio automático<select name="al">${AUTOLOCK_OPTS.map(([m, l]) => `<option value="${m}"${m === 15 ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <p class="sec-warn">${I.alert}<span>Não existe “esqueci a senha” sem o <b>código de recuperação</b>, que aparece no próximo passo. Sem senha e sem código, os dados não abrem mais — nem eu consigo abrir.</span></p>
      ${foot('Ativar proteção', I.lock)}</form>`;
  } else if (view === 'code') {
    const code = data;
    body.innerHTML = `<form class="sec-form" data-form="code" novalidate>
      <p class="sec-lead">Guarde este código fora do celular — anotado ou num lugar seguro. Ele é a única forma de redefinir a senha se você esquecer.</p>
      <div class="rec-code" id="recCode">${esc(code)}</div>
      <div class="rec-actions"><button type="button" class="btn btn-ghost btn-sm" data-rec="copy">${I.copy}Copiar</button><button type="button" class="btn btn-ghost btn-sm" data-rec="dl">${I.download}Baixar .txt</button></div>
      <label class="check-line"><input type="checkbox" name="ok"> Guardei o código em um lugar seguro</label>
      <p class="sec-hint" id="secHint" role="alert"></p>
      <div class="sheet-foot"><span class="spacer"></span><button type="submit" class="btn btn-primary" disabled>${I.check}Concluir</button></div></form>`;
  } else if (view === 'pass') {
    body.innerHTML = `<form class="sec-form" data-form="pass" novalidate><div class="form-grid">
      <input type="text" name="user" value="${esc(u.u)}" autocomplete="username" hidden>
      <div class="span-2">${pwField('cur', 'Senha atual', 'current-password')}</div>
      ${pwField('p', 'Nova senha', 'new-password')}
      ${pwField('p2', 'Confirmar nova senha', 'new-password')}
      </div>${foot('Trocar senha', I.key)}</form>`;
  } else if (view === 'pin') {
    body.innerHTML = `<form class="sec-form" data-form="pin" novalidate>
      <p class="sec-lead">O PIN serve para entrar rápido neste aparelho. Depois de ${PIN_MAX_FAILS} erros seguidos ele é desligado e só a senha funciona.</p>
      <div class="form-grid">
        <div class="span-2">${pwField('cur', 'Sua senha atual', 'current-password')}</div>
        <label>${u.pin ? 'Novo PIN' : 'PIN'} (4 a 6 números)<input name="pin" inputmode="numeric" maxlength="6" autocomplete="off" type="password"></label>
        <label>Confirmar PIN<input name="pin2" inputmode="numeric" maxlength="6" autocomplete="off" type="password"></label>
      </div>
      <p class="sec-hint" id="secHint" role="alert"></p>
      <div class="sheet-foot">${u.pin ? `<button type="button" class="btn btn-danger-ghost" data-pin-off>${I.trash}Remover PIN</button>` : ''}<span class="spacer"></span><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="btn btn-primary">${I.check}${u.pin ? 'Trocar PIN' : 'Criar PIN'}</button></div></form>`;
  } else if (view === 'users') {
    body.innerHTML = `<div class="sec-form">
      <div class="user-list">${SEC.vault.users.map((x) => `
        <div class="user-row" data-uid="${x.id}">
          <span class="user-av">${esc(x.u.slice(0, 1).toUpperCase())}</span>
          <div class="user-info"><b>${esc(x.u)}</b><span>${x.role === 'admin' ? 'Administrador' : 'Usuário'}${x.pin ? ' · PIN' : ''}${x.id === SEC.user ? ' · você' : ''}</span></div>
          ${x.id === SEC.user ? '' : `<button type="button" class="btn btn-ghost btn-sm" data-u-reset="${x.id}">${I.key}Nova senha</button><button type="button" class="icon-btn danger" data-u-del="${x.id}" title="Remover ${esc(x.u)}" aria-label="Remover ${esc(x.u)}">${I.trash}</button>`}
        </div>`).join('')}</div>
      <form class="sec-form user-add" data-form="adduser" novalidate>
        <strong class="mini-title">Adicionar usuário</strong>
        <div class="form-grid">
          <label>Usuário<input name="u" maxlength="30" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
          <label>Papel<select name="role"><option value="user">Usuário</option><option value="admin">Administrador</option></select></label>
          ${pwField('p', 'Senha', 'new-password')}
          ${pwField('p2', 'Confirmar senha', 'new-password')}
        </div>
        <p class="sec-hint" id="secHint" role="alert"></p>
        <div class="sheet-foot"><span class="spacer"></span><button type="submit" class="btn btn-primary">${I.plus}Adicionar</button></div>
      </form></div>`;
  } else if (view === 'reset') {
    const x = secUser(data);
    $('#secEyebrow').textContent = 'Administração'; $('#secTitle').textContent = `Nova senha de ${x.u}`;
    body.innerHTML = `<form class="sec-form" data-form="reset" data-uid="${x.id}" novalidate><div class="form-grid">
      ${pwField('p', 'Nova senha', 'new-password')}
      ${pwField('p2', 'Confirmar', 'new-password')}</div>
      <p class="sec-lead small">O PIN de ${esc(x.u)}, se existir, será removido.</p>
      ${foot('Salvar senha', I.key)}</form>`;
  } else if (view === 'off') {
    body.innerHTML = `<form class="sec-form" data-form="off" novalidate>
      <p class="sec-lead">Os dados voltam a ficar abertos neste navegador e todos os usuários são removidos.</p>
      ${pwField('cur', 'Sua senha atual', 'current-password')}
      ${foot('Desativar', I.alert)}</form>`;
  }
  $$('[data-ic]', body).forEach((el) => { el.innerHTML = I[el.dataset.ic] || ''; });
  if (!secDlg.open) secDlg.showModal();
  body.querySelector('input:not([hidden]):not([type=checkbox])')?.focus();
}
const pwErr = (p, p2) => (p.length < PW_MIN ? `A senha precisa de pelo menos ${PW_MIN} caracteres` : p !== p2 ? 'As senhas não conferem' : '');
const pinErr = (a, b) => (!/^\d{4,6}$/.test(a) ? 'O PIN precisa ter de 4 a 6 números' : a !== b ? 'Os PINs não conferem' : '');
const userErr = (name, exceptId) => {
  const n = normUser(name);
  if (n.length < 2) return 'O usuário precisa de pelo menos 2 letras';
  if (/\s/.test(n)) return 'O usuário não pode ter espaços';
  if (SEC.vault?.users.some((x) => x.id !== exceptId && normUser(x.u) === n)) return 'Já existe um usuário com esse nome';
  return '';
};
async function checkCur(pw) { try { await unwrapDek(pw, secUser().pw); return true; } catch (e) { return false; } }
secDlg.addEventListener('change', (ev) => {
  if (ev.target.name === 'usePin') $$('.pin-only', secDlg).forEach((el) => { el.hidden = !ev.target.checked; });
  if (ev.target.name === 'ok') secDlg.querySelector('[data-form=code] [type=submit]').disabled = !ev.target.checked;
});
secDlg.addEventListener('input', (ev) => { if (['pin', 'pin2'].includes(ev.target.name)) ev.target.value = ev.target.value.replace(/\D/g, ''); });
secDlg.addEventListener('click', async (ev) => {
  const t = ev.target;
  const rec = t.closest('[data-rec]');
  if (rec) {
    const code = $('#recCode').textContent;
    if (rec.dataset.rec === 'copy') { try { await navigator.clipboard.writeText(code); toast('Código copiado'); } catch (e) { toast('Não foi possível copiar'); } }
    else {
      const blob = new Blob([`Filling · Painel Real\nCódigo de recuperação (gerado em ${new Date().toLocaleString('pt-BR')}):\n\n${code}\n\nGuarde em lugar seguro. Ele redefine a senha de qualquer usuário do painel.\n`], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'filling-codigo-recuperacao.txt';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    return;
  }
  const rs = t.closest('[data-u-reset]');
  if (rs) return openSecDlg('reset', rs.dataset.uReset);
  const del = t.closest('[data-u-del]');
  if (del) {
    const x = secUser(del.dataset.uDel);
    if (!x || !confirm(`Remover o usuário ${x.u}? Ele não vai mais conseguir entrar.`)) return;
    SEC.vault.users = SEC.vault.users.filter((y) => y.id !== x.id);
    secWriteVault(); openSecDlg('users'); renderSecUi(); toast(`${x.u} removido`);
    return;
  }
  if (t.closest('[data-pin-off]')) {
    const f = t.closest('form');
    if (!(await checkCur(f.cur.value))) return secHint('Senha atual incorreta');
    secUser().pin = null; secWriteVault(); secDlg.close(); renderSecUi(); toast('PIN removido');
  }
});
secDlg.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target, kind = f.dataset.form, btn = f.querySelector('[type=submit]');
  const go = async (fn) => { busyBtn(btn, true, 'Protegendo…'); try { await fn(); } catch (e) { console.error(e); secHint('Algo deu errado. Tente de novo.'); } finally { if (btn.isConnected) busyBtn(btn, false); } };
  if (kind === 'setup') {
    const err = userErr(f.u.value) || pwErr(f.p.value, f.p2.value) || (f.usePin.checked ? pinErr(f.pin.value, f.pin2.value) : '');
    if (err) return secHint(err);
    await go(async () => {
      const dek = rnd(32), id = uid(), code = genCode();
      const user = { id, u: f.u.value.trim(), role: 'admin', created: Date.now(), pw: await wrapDek(f.p.value, dek), pin: null };
      if (f.usePin.checked) user.pin = { len: f.pin.value.length, fails: 0, ...(await wrapDek(f.pin.value, dek)) };
      SEC.vault = { v: 1, meta: { ...secMeta(), autoLock: Number(f.al.value) }, users: [user], rec: await wrapDek(normCode(code), dek), data: null, last: id };
      SEC.dek = dek; SEC.key = await dataKey(dek); SEC.user = id; SEC.locked = false; SEC.lastAct = Date.now();
      await secPersist(); await secFlush();
      localStorage.removeItem(STORE_KEY); // nada fica em texto aberto
      renderSecUi();
      openSecDlg('code', code);
    });
  } else if (kind === 'code') {
    secDlg.close(); toast('Proteção ativa');
  } else if (kind === 'pass') {
    const err = pwErr(f.p.value, f.p2.value);
    if (err) return secHint(err);
    await go(async () => {
      if (!(await checkCur(f.cur.value))) return secHint('Senha atual incorreta');
      secUser().pw = await wrapDek(f.p.value, SEC.dek); secWriteVault();
      secDlg.close(); toast('Senha trocada');
    });
  } else if (kind === 'pin') {
    const err = pinErr(f.pin.value, f.pin2.value);
    if (err) return secHint(err);
    await go(async () => {
      if (!(await checkCur(f.cur.value))) return secHint('Senha atual incorreta');
      secUser().pin = { len: f.pin.value.length, fails: 0, ...(await wrapDek(f.pin.value, SEC.dek)) }; secWriteVault();
      secDlg.close(); renderSecUi(); toast('PIN salvo');
    });
  } else if (kind === 'adduser') {
    const err = userErr(f.u.value) || pwErr(f.p.value, f.p2.value);
    if (err) return secHint(err);
    await go(async () => {
      SEC.vault.users.push({ id: uid(), u: f.u.value.trim(), role: f.role.value, created: Date.now(), pw: await wrapDek(f.p.value, SEC.dek), pin: null });
      secWriteVault(); renderSecUi(); openSecDlg('users'); toast('Usuário adicionado');
    });
  } else if (kind === 'reset') {
    const err = pwErr(f.p.value, f.p2.value);
    if (err) return secHint(err);
    await go(async () => {
      const x = secUser(f.dataset.uid);
      x.pw = await wrapDek(f.p.value, SEC.dek); x.pin = null; secWriteVault();
      openSecDlg('users'); toast(`Senha de ${x.u} redefinida`);
    });
  } else if (kind === 'off') {
    await go(async () => {
      if (!(await checkCur(f.cur.value))) return secHint('Senha atual incorreta');
      await secFlush();
      localStorage.setItem(STORE_KEY, JSON.stringify(S));
      localStorage.removeItem(VAULT_KEY);
      SEC.vault = null; SEC.key = null; SEC.dek = null; SEC.user = null; SEC.locked = false;
      secDlg.close(); renderSecUi(); toast('Proteção desativada');
    });
  }
});


/* brilho que acompanha o mouse nos cartões (só no PC) */
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let spotRaf = 0, spotEv = null, spotEl = null;
  const clearSpot = () => { if (spotEl) { spotEl.style.removeProperty('--mx'); spotEl.style.removeProperty('--my'); spotEl = null; } };
  document.addEventListener('pointermove', (ev) => {
    spotEv = ev;
    if (spotRaf) return;
    spotRaf = requestAnimationFrame(() => {
      spotRaf = 0;
      const el = spotEv.target.closest?.('.hs-tile, .card');
      if (el !== spotEl) clearSpot();
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${Math.round(spotEv.clientX - r.left)}px`);
      el.style.setProperty('--my', `${Math.round(spotEv.clientY - r.top)}px`);
      spotEl = el;
    });
  }, { passive: true });
  document.addEventListener('pointerleave', clearSpot);
}
/* ================= Atalhos de teclado ================= */
function shiftOpDay(k, dir) { let d = fromKey(k); do { d = addDays(d, dir); } while (!isOpDay(d)); return keyOf(d); }
function focusTruck() {
  const nt = nextTruckInfo();
  const x = nt && (nt.running || nt.nextT);
  return x ? { k: nt.k, e: x.e } : null;
}
document.addEventListener('keydown', (ev) => {
  if (SEC.locked) return;
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
  const go = { 1: 'hoje', 2: 'agenda', 3: 'preparo', 4: 'percurso', 5: 'historico', 6: 'materiais' }[key];
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
    ',': () => { applyTheme(); renderSecUi(); $('#setDlg').showModal(); },
    z: () => {
      if (!lastUndo) return toast('Nada para desfazer');
      const fn = lastUndo; lastUndo = null; $('#toast').classList.remove('show'); fn(); toast('Desfeito');
    },
    '?': () => $('#keysDlg').showModal(),
    '/': () => openSearch(),
    v: () => { S.settings.agView = agView() === 'compact' ? 'full' : 'compact'; expanded.clear(); save(); if (currentTab !== 'agenda') setTab('agenda'); else render(); toast(agView() === 'compact' ? 'Visão resumida' : 'Visão detalhada'); },
    b: () => openSearch(),
    l: () => (SEC.vault ? secLock() : toast('Ative a proteção em Configurações → Segurança')),
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
const setTopH = () => document.documentElement.style.setProperty('--top-h', ($('.topbar')?.offsetHeight || 62) + 'px');
setTopH(); window.addEventListener('resize', setTopH);
if (document.documentElement.classList.contains('is-splash')) setTimeout(() => document.documentElement.classList.remove('is-splash'), 1700);
$$('[data-ic]').forEach((el) => { el.innerHTML = I[el.dataset.ic] || ''; });
fillSelects();
renderLegend();
applyTheme();
setTab(location.hash.slice(1) || 'hoje', false);
renderSecUi();
if (SEC.vault && SEC.locked) showLock();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
