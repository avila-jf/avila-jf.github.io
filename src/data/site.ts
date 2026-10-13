// Tudo que é texto "seu" fica aqui. Mude este arquivo e o site inteiro atualiza.

export const site = {
  nome: 'Francis Avila',
  apelido: 'Ávila', // como o pessoal te chama (aparece no "Olá, eu sou...")
  descricao: 'Fotografia em Maceió e arredores: Pedras do Pôr do Sol, Jaraguá, Carneiros e mais.',
  cidade: 'Maceió, Brasil',
  // Frase grande da capa. "destaque" ganha o marca-texto azul.
  frase: {
    inicio: 'O mundo',
    destaque: 'pelas minhas lentes.',
  },
  bio: [
    'Tô começando na fotografia e pronto pra tirar os melhores cliques: registrar o seu lifestyle, os seus rolês, as pessoas que você ama e muito mais.',
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
  codigo?: string;
  imagem?: string;
  cor?: string; // cor da luz de fundo do projeto na vitrine (a cor principal do site)
  destaque?: boolean;
}[] = [
  {
    nome: 'Manoel.ink',
    tipo: 'Site para cliente',
    descricao:
      'Site do tatuador Juan Manoel, de Maceió: blackwork, fine line e tatuagens geek, com galeria de trabalhos, flashes disponíveis, antes/depois de cicatrizadas e pedido de orçamento.',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    site: 'https://manoelink.github.io/',
    codigo: 'https://github.com/manoelink/manoelink.github.io',
    imagem: 'manoelink',
    cor: '#d8392c',
    destaque: true,
  },
  {
    nome: 'Ótica Beco São José',
    tipo: 'Site para cliente',
    descricao:
      'Loja online de uma ótica de Maceió: catálogo com busca e filtros, escolha de lentes de grau, carrinho, checkout, login, acompanhamento do pedido e painel da loja.',
    tecnologias: ['JavaScript', 'Vite', 'Supabase', 'GSAP', 'Three.js'],
    site: 'https://otica-beco-sao-jose.vercel.app/',
    imagem: 'otica-beco',
    cor: '#f7d35c',
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
    cor: '#3fd598',
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

// Cada ensaio é um lugar (ou evento) e vira uma página (/pedras, /jaragua, ...)
// e lê as fotos de src/assets/fotos/<slug>/
// "capa" (opcional) = nome do arquivo sem .jpg: aparece no cartão da home, no menu e primeiro na galeria.
export const categorias: { slug: string; titulo: string; descricao: string; capa?: string }[] = [
  {
    slug: 'pedras',
    titulo: 'Pedras do Pôr do Sol',
    descricao: 'Do fim de tarde à noite na beira da baía: barcos, silhuetas e as luzes da cidade na água.',
    capa: '03-fim-de-tarde-nas-pedras',
  },
  {
    slug: 'jaragua',
    titulo: 'Jaraguá',
    descricao: 'O bairro histórico: fachadas antigas, luz de poste e gente na rua.',
    capa: '05-escadaria-a-noite',
  },
  {
    slug: 'carneiros',
    titulo: 'Carneiros',
    descricao: 'Pernambuco: coqueiros, areia clara e um dia inteiro de praia.',
  },
  {
    slug: 'ato',
    titulo: 'Ato de manifestação',
    descricao: 'A rua em dia de manifestação: cartazes, bandeiras e gente junta.',
    capa: '09-pela-defesa-da-democracia',
  },
];
