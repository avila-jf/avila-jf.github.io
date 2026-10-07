// Tudo que é texto "seu" fica aqui. Mude este arquivo e o site inteiro atualiza.

export const site = {
  nome: 'Francis Avila',
  apelido: 'Ávila', // como o pessoal te chama (aparece no "Olá, eu sou...")
  descricao: 'Fotografia de paisagem, retrato e rua.',
  cidade: 'Maceió, AL',
  // Frase grande da capa. "destaque" ganha o marca-texto roxo.
  frase: {
    inicio: 'Fotografias que guardam',
    destaque: 'o que o olho sente.',
  },
  bio: [
    'Tô começando na fotografia e aprendendo no caminho: saio com a Nikon pendurada no pescoço, correndo atrás de fim de tarde, luz de rua e gente sendo gente.',
    'Entre uma linha de código e outra, eu fotografo. Esse site é onde as coisas que eu mais amo se encontram: programação, fotografia e arte. Todas as fotos aqui são minhas, e o site em si também é parte do projeto.',
    'Ainda tô no começo, mas é exatamente isso que eu quero mostrar: evolução. Se curtiu, chega junto.',
  ],
  equipamento: ['Câmera: Nikon D3200'],
  contato: {
    instagram: '_avila.jf', // só o @, sem o "@"
    whatsapp: '5582993327581', // DDI + DDD + número, só dígitos
  },
};

// Foto grande do topo da home. Formato: 'categoria/nome-do-arquivo' (sem o .jpg).
export const capaPrincipal = 'paisagem/01-sol-sobre-a-baia';

// Fotos do slider principal da home, na ordem em que aparecem.
// Formato: 'categoria/nome-do-arquivo' (sem o .jpg). Lista vazia = escolha automática.
export const destaques: string[] = [
  'retrato/10-perfil-na-noite',
  'retrato/09-wonder-why',
  'rua/12-kit-de-praia',
  'paisagem/06-ceu-amarelo-e-coqueiros',
  'rua/07-escola-de-surf',
  'retrato/07-amigos-no-mar',
  'rua/08-buggy-e-bandeira',
  'rua/11-bar-da-praia',
  'rua/09-ambulante-na-areia',
  'rua/02-noite-de-festa',
  'retrato/05-sorriso',
  'rua/03-luzes-da-praca',
  'retrato/02-olhando-a-cidade',
  'rua/06-bolsa-na-pedra',
  'paisagem/05-barcos-no-azul',
  'paisagem/03-fim-de-tarde-nas-pedras',
  'paisagem/04-navio-ao-entardecer',
  'rua/01-capa-mortal-no-barco',
];

// Divulgação: você também cria sites de portfólio para outras pessoas.
// Aparece como uma seção na home (não é o foco do site) e na página de contato.
export const criacaoDeSites = {
  titulo: 'Quer um site como este?',
  texto:
    'Além de fotografar, eu crio portfólios para fotógrafos, artistas e criadores. Rápidos, bonitos no celular e prontos para o link da bio.',
  vantagens: [
    'Galeria que se monta sozinha com suas fotos',
    'Visual feito do seu jeito',
    'Pronto para o link da bio do Instagram',
  ],
  mensagemWhatsApp: 'Olá! Vi seu portfólio e quero um site assim para mim.',
};

// Projetos de programação (página /projetos e seção na home).
// "imagem" = nome do print em src/assets/projetos/ (sem .jpg). Sem imagem = cartão só com texto.
export const projetos: {
  nome: string;
  tipo: string;
  descricao: string;
  tecnologias: string[];
  site?: string;
  codigo: string;
  imagem?: string;
  destaque?: boolean;
}[] = [
  {
    nome: 'Sofiarte',
    tipo: 'Site para cliente',
    descricao:
      'Portfólio da tatuadora Sofia (@sofiarte_tattoo), aqui de Maceió: trabalhos, tatuagens sobre cicatriz, flashes e agendamento direto pelo WhatsApp.',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    site: 'https://josefrancisco-alt.github.io/sofiarte/',
    codigo: 'https://github.com/JoseFrancisco-alt/sofiarte',
    imagem: 'sofiarte',
    destaque: true,
  },
  {
    nome: 'Magnobag',
    tipo: 'Projeto pessoal',
    descricao:
      'Plataforma de análise de ações da B3, cripto e câmbio: gráficos, indicadores, backtests com taxa de acerto real, notícias e um simulador de gale.',
    tecnologias: ['Python', 'Flask', 'pandas', 'SQLite', 'Chart.js'],
    site: 'https://josefrancisco-alt.github.io/magnobag/',
    codigo: 'https://github.com/JoseFrancisco-alt/magnobag',
    imagem: 'magnobag',
    destaque: true,
  },
  {
    nome: 'Este portfólio',
    tipo: 'Projeto pessoal',
    descricao:
      'O site que você está vendo: galeria que se monta sozinha, slider em 3D, animações de rolagem e deploy automático a cada commit.',
    tecnologias: ['Astro', 'TypeScript', 'GSAP', 'CSS'],
    site: 'https://josefrancisco-alt.github.io/portfolio-fotografia/',
    codigo: 'https://github.com/JoseFrancisco-alt/portfolio-fotografia',
    imagem: 'portfolio-fotografia',
    destaque: true,
  },
  {
    nome: 'BookSmart',
    tipo: 'Faculdade',
    descricao:
      'Sistema de gerenciamento de biblioteca: cadastro de livros e usuários, empréstimos, devoluções e consultas do acervo.',
    tecnologias: ['Java', 'MySQL', 'NetBeans'],
    codigo: 'https://github.com/JoseFrancisco-alt/BookSmart',
  },
  {
    nome: 'BookSmart Web',
    tipo: 'Faculdade',
    descricao: 'A versão web do BookSmart, com o back-end em Java e a interface no navegador.',
    tecnologias: ['Java', 'HTML', 'CSS', 'JavaScript'],
    codigo: 'https://github.com/JoseFrancisco-alt/booksmartweb',
  },
  {
    nome: 'Sistema de Leilões',
    tipo: 'Faculdade',
    descricao: 'Sistema para uma casa de leilões com cadastro e listagem de produtos, integrado ao banco de dados.',
    tecnologias: ['Java', 'Swing', 'MySQL', 'JDBC'],
    codigo: 'https://github.com/JoseFrancisco-alt/LeiloesTDSat',
  },
];

export const github = 'https://github.com/JoseFrancisco-alt';

// Cada categoria vira uma página (/paisagem, /retrato, /rua)
// e lê as fotos de src/assets/fotos/<slug>/
// "capa" (opcional) = nome do arquivo sem .jpg: aparece no cartão da home, no menu e primeiro na galeria.
export const categorias: { slug: string; titulo: string; descricao: string; capa?: string }[] = [
  {
    slug: 'paisagem',
    titulo: 'Paisagem',
    descricao: 'Horizontes, luz de fim de tarde e lugares que pedem silêncio.',
  },
  {
    slug: 'retrato',
    titulo: 'Retrato',
    descricao: 'Pessoas, olhares e a luz certa no rosto certo.',
    capa: '10-perfil-na-noite',
  },
  {
    slug: 'rua',
    titulo: 'Rua',
    descricao: 'O acaso da cidade: sombras, pressa e momentos que não se repetem.',
    capa: '03-luzes-da-praca',
  },
];
