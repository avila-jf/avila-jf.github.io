// Tudo que é texto "seu" fica aqui. Mude este arquivo e o site inteiro atualiza.

export const site = {
  nome: 'Francis Avila',
  apelido: 'Ávila', // como o pessoal te chama (aparece no "Olá, eu sou...")
  descricao: 'Photography in Maceió and around: Pedras do Pôr do Sol, Jaraguá, Carneiros and more.',
  cidade: 'Maceió, Brazil',
  // Frase grande da capa. "destaque" ganha o marca-texto azul.
  frase: {
    inicio: 'The world',
    destaque: 'through my lens.',
  },
  bio: [
    "I'm early in my photography journey and ready to take the best shots: your lifestyle, your nights out, the people you love and much more.",
    'Between one line of code and the next, I take photos. This site is where the things I love most meet: programming, photography and art. Every photo here is mine, and the site itself is part of the project too.',
    "I'm still at the start, and that's exactly what I want to show: growth. If you like it, let's talk.",
  ],
  equipamento: ['Camera: Nikon D3200'],
  contato: {
    instagram: '_avila.jf', // só o @, sem o "@"
    whatsapp: '5582993327581', // DDI + DDD + número, só dígitos
  },
};

// Foto grande do topo da home. Formato: 'categoria/nome-do-arquivo' (sem o .jpg).
export const capaPrincipal = 'pedras/01-sol-sobre-a-baia';

// Fotos do slider principal da home, na ordem em que aparecem (da mais escura para a mais clara;
// a primeira também aparece no display da câmera 3D).
// Formato: 'categoria/nome-do-arquivo' (sem o .jpg). Lista vazia = escolha automática.
export const destaques: string[] = [
  'pedras/12-wonder-why', // primeira: aparece no display da câmera
  'pedras/18-noite-de-festa',
  'pedras/19-luzes-da-praca',
  'pedras/15-olhando-a-cidade',
  'pedras/13-perfil-na-noite',
  'pedras/11-bolsa-na-pedra',
  'pedras/03-fim-de-tarde-nas-pedras',
  'carneiros/01-buggy-e-bandeira',
  'carneiros/08-bar-da-praia',
  'carneiros/02-escola-de-surf',
  'carneiros/04-ceu-amarelo-e-coqueiros',
  'carneiros/09-kit-de-praia',
  'ato/06-beijo-e-leque',
  'jaragua/11-sorriso',
  'pedras/10-capa-mortal-no-barco',
  'pedras/04-navio-ao-entardecer',
  'pedras/05-barcos-no-azul',
  'carneiros/06-ambulante-na-areia',
  'carneiros/14-bicicleta-na-praia',
  'carneiros/11-amigos-no-mar',
];

// Divulgação: você também cria sites de portfólio para outras pessoas.
// Aparece como uma seção na home (não é o foco do site) e na página de contato.
export const criacaoDeSites = {
  titulo: 'Want a site like this one?',
  texto:
    'Besides shooting, I build portfolios for photographers, artists and creators. Fast, beautiful on mobile and ready for the link in bio.',
  vantagens: [
    'A gallery that builds itself from your photos',
    'A look made your way',
    'Ready for your Instagram link in bio',
  ],
  mensagemWhatsApp: 'Hi! I saw your portfolio and I want a site like this.',
};

// Projetos de programação (página /projetos e as seções da home).
// "imagem" = nome do print em src/assets/projetos/ (sem .jpg). Sem imagem = cartão só com texto.
// Onde cada um aparece na home:
//  - destaque: true      → "Sites no ar", no notebook 3D
//  - grupo: 'prototipo'  → a faixa curva de protótipos e landing pages
//  - todos               → a pilha de projetos no fim
export const projetos: {
  nome: string;
  tipo: string;
  descricao: string;
  tecnologias: string[];
  site?: string;
  codigo?: string;
  imagem?: string;
  cor?: string; // cor da luz de fundo do projeto na vitrine (a cor principal do site)
  destaque?: boolean;
  grupo?: 'prototipo';
}[] = [
  {
    nome: 'Manoel.ink',
    tipo: 'Client website',
    descricao:
      'Website for Juan Manoel, a tattoo artist from Maceió: blackwork, fine line and geek tattoos, with a work gallery, available flashes, healed before/after and quote requests.',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    site: 'https://manoelink.github.io/',
    codigo: 'https://github.com/manoelink/manoelink.github.io',
    imagem: 'manoelink',
    cor: '#d8392c',
    destaque: true,
  },
  {
    nome: 'Manoel.ink (demo)',
    tipo: 'Client showcase',
    descricao:
      'The version of Manoel\'s site with every effect, to show clients: razor intro, labeled cursor, magnetic buttons, word-by-word text and bands that bend as you scroll.',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    site: 'https://josefrancisco-alt.github.io/manoel-ink-demo/',
    codigo: 'https://github.com/JoseFrancisco-alt/manoel-ink-demo',
    imagem: 'manoel-demo',
    cor: '#d8392c',
    destaque: true,
  },
  {
    nome: 'Ótica Beco São José',
    tipo: 'Client website',
    descricao:
      'Online store for an optician in Maceió: catalog with search and filters, prescription lens picker, cart, checkout, login, order tracking and a store dashboard.',
    tecnologias: ['JavaScript', 'Vite', 'Supabase', 'GSAP', 'Three.js'],
    site: 'https://otica-beco-sao-jose.vercel.app/',
    imagem: 'otica-beco',
    cor: '#f7d35c',
    destaque: true,
  },
  {
    nome: 'Magnobag',
    tipo: 'Personal project',
    descricao:
      'An analysis platform for Brazilian stocks, crypto and FX: charts, indicators, backtests with real hit rates, news and a martingale simulator.',
    tecnologias: ['Python', 'Flask', 'pandas', 'SQLite', 'Chart.js'],
    site: 'https://josefrancisco-alt.github.io/magnobag/',
    codigo: 'https://github.com/JoseFrancisco-alt/magnobag',
    imagem: 'magnobag',
    cor: '#3fd598',
    destaque: true,
  },
  {
    nome: 'Raiz & Orgulho',
    tipo: 'Prototype · barbershop',
    descricao: 'Website prototype for a barbershop in Maceió, with online booking by service, barber, day and time, straight to WhatsApp.',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    site: 'https://josefrancisco-alt.github.io/raiz-e-orgulho/',
    codigo: 'https://github.com/JoseFrancisco-alt/raiz-e-orgulho',
    imagem: 'raiz-e-orgulho',
    grupo: 'prototipo',
  },
  {
    nome: 'Zeroalta',
    tipo: 'Prototype · barbershop (Portugal)',
    descricao: 'Prototype for a barbershop with three shops in Porto, Espinho and Lourosa: one booking for all three, services and prices up front.',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    site: 'https://josefrancisco-alt.github.io/zeroalta/',
    codigo: 'https://github.com/JoseFrancisco-alt/zeroalta',
    imagem: 'zeroalta',
    grupo: 'prototipo',
  },
  {
    nome: "La'Gringa",
    tipo: 'Prototype · barbershop',
    descricao: 'Prototype for a barbershop in Jatiúca with the shop\'s own identity: mustache orange, brick walls, booking and a store.',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    site: 'https://josefrancisco-alt.github.io/lagringa/',
    codigo: 'https://github.com/JoseFrancisco-alt/lagringa',
    imagem: 'lagringa',
    grupo: 'prototipo',
  },
  {
    nome: 'Espaço Liv Sá',
    tipo: 'Prototype',
    descricao: 'Website prototype for Espaço Liv Sá, in Jaraguá, Maceió.',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    site: 'https://josefrancisco-alt.github.io/liv-sa/',
    codigo: 'https://github.com/JoseFrancisco-alt/liv-sa',
    imagem: 'liv-sa',
    grupo: 'prototipo',
  },
];

export const github = 'https://github.com/JoseFrancisco-alt';

// "Onde eu já estive" (a trajetória que passa de lado na home). Confira os anos.
export const trajetoria: { ano: string; titulo: string; texto: string; detalhe: string }[] = [
  {
    ano: '2025',
    titulo: 'Software Engineering',
    texto: 'College at Estácio: logic, databases and my first systems in Java.',
    detalhe: 'Java · MySQL · Git',
  },
  {
    ano: '2026',
    titulo: 'Photographer',
    texto: 'A Nikon D3200 and all of Maceió: Pedras do Pôr do Sol, Jaraguá, Carneiros and people on the street.',
    detalhe: 'Nikon D3200 · 5 series',
  },
  {
    ano: '2026',
    titulo: 'Web developer',
    texto: 'Client sites and prototypes: from the tattoo artist to the barbershop, each one with the face of the business.',
    detalhe: 'Astro · GSAP · Three.js · Supabase',
  },
];

// Cada ensaio é um lugar (ou evento) e vira uma página (/pedras, /jaragua, ...)
// e lê as fotos de src/assets/fotos/<slug>/
// "capa" (opcional) = nome do arquivo sem .jpg: aparece no cartão da home, no menu e primeiro na galeria.
export const categorias: { slug: string; titulo: string; descricao: string; capa?: string }[] = [
  {
    slug: 'pedras',
    titulo: 'Pedras do Pôr do Sol',
    descricao: 'From late afternoon to night by the bay: boats, silhouettes and the city lights on the water.',
    capa: '03-fim-de-tarde-nas-pedras',
  },
  {
    slug: 'jaragua',
    titulo: 'Jaraguá',
    descricao: 'The historic district: old facades, streetlight glow and people outside.',
    capa: '05-escadaria-a-noite',
  },
  {
    slug: 'carneiros',
    titulo: 'Carneiros',
    descricao: 'Pernambuco: palm trees, white sand and a whole day at the beach.',
  },
  {
    slug: 'ato',
    titulo: 'Street protest',
    descricao: 'The street on protest day: signs, flags and people together.',
    capa: '09-pela-defesa-da-democracia',
  },
  {
    slug: 'estudio',
    titulo: 'In the studio',
    descricao: 'A tattoo session up close: studio light, blue gloves and the line on skin.',
    capa: '01-luz-do-estudio',
  },
];
