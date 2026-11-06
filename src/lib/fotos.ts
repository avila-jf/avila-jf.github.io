import type { ImageMetadata } from 'astro';
import { categorias, capaPrincipal } from '../data/site';

// Lê automaticamente toda imagem dentro de src/assets/fotos/<categoria>/
// Nome do arquivo vira a legenda: "03-por-do-sol-na-serra.jpg" -> "por do sol na serra"
// O número no começo serve só para definir a ordem.
const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/fotos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

export interface Foto {
  src: ImageMetadata;
  categoria: string;
  nome: string;
  alt: string;
}

// Legenda em inglês de cada foto (a chave é o nome do arquivo sem o número).
// Foto nova sem tradução aqui mostra o nome do arquivo, como antes.
const EN: Record<string, string> = {
  'maos-pro-ceu': 'hands to the sky', 'beijo-e-cartazes': 'a kiss and signs', pare: 'stop',
  'cartaz-erguido': 'sign held high', 'o-voto-e-individual': 'the vote is personal', 'beijo-e-leque': 'a kiss and a fan',
  constituicao: 'the constitution', 'bandeira-na-avenida': 'flag on the avenue', 'pela-defesa-da-democracia': 'in defense of democracy',
  'o-brasil-nao-cabe-no-quintal': "brazil doesn't fit in a backyard", 'tire-suas-patas': 'hands off', 'camisa-amarela': 'yellow shirt',
  'buggy-e-bandeira': 'buggy and flag', 'escola-de-surf': 'surf school', 'coqueiros-ao-entardecer': 'palm trees at dusk',
  'ceu-amarelo-e-coqueiros': 'yellow sky and palm trees', 'bandeira-vermelha': 'red flag', 'ambulante-na-areia': 'beach vendor',
  'salva-vidas': 'lifeguard', 'bar-da-praia': 'beach bar', 'kit-de-praia': 'beach kit', 'camera-na-praia': 'camera on the beach',
  'amigos-no-mar': 'friends in the sea', 'fim-de-tarde-nas-cadeiras': 'late afternoon in the chairs', 'torres-da-igreja': 'church towers',
  'bicicleta-na-praia': 'bike on the beach',
  'luz-do-estudio': 'studio light', 'de-perfil': 'in profile', 'flash-na-tela': 'flash on the screen', concentrado: 'focused',
  'luvas-azuis': 'blue gloves', 'traco-na-perna': 'line on the leg',
  'vermelho-na-rua': 'red on the street', 'olhar-direto': 'straight gaze', 'vermelho-e-atitude': 'red and attitude',
  'parede-de-pedra': 'stone wall', 'escadaria-a-noite': 'stairs at night', 'fachada-a-noite': 'facade at night',
  'postes-e-varal-de-luz': 'poles and string lights', cartazes: 'posters', 'parede-de-cartazes': 'wall of posters', mangas: 'mangoes',
  sorriso: 'smile',
  'sol-sobre-a-baia': 'sun over the bay', 'barcos-na-hora-dourada': 'boats at golden hour', 'fim-de-tarde-nas-pedras': 'late afternoon on the rocks',
  'navio-ao-entardecer': 'ship at dusk', 'barcos-no-azul': 'boats in the blue', 'por-do-sol-com-barcos': 'sunset with boats',
  'anoitecer-no-mar': 'nightfall at sea', 'olhando-a-baia': 'looking at the bay', 'silhueta-e-nuvem': 'silhouette and cloud',
  'capa-mortal-no-barco': 'backflip off the boat', 'bolsa-na-pedra': 'bag on the rock', 'wonder-why': 'wonder why',
  'perfil-na-noite': 'profile at night', 'noite-em-roxo': 'night in purple', 'olhando-a-cidade': 'looking at the city',
  'camisa-10': 'number 10 shirt', 'casal-no-porto': 'couple at the port', 'noite-de-festa': 'party night', 'luzes-da-praca': 'lights of the square',
};

function legenda(nome: string) {
  const chave = nome.replace(/^\d+[-_ ]*/, '');
  const texto = EN[chave] ?? chave.replace(/[-_]+/g, ' ').trim();
  return texto || 'Photograph';
}

export const fotos: Foto[] = Object.entries(arquivos)
  .map(([caminho, modulo]) => {
    const partes = caminho.split('/');
    const nome = partes[partes.length - 1].replace(/\.[^.]+$/, '');
    return {
      src: modulo.default,
      categoria: partes[partes.length - 2],
      nome,
      alt: legenda(nome),
    };
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));

// Fotos de uma categoria, com a capa escolhida em site.ts (se houver) na frente.
export function fotosDa(categoria: string) {
  const lista = fotos.filter((foto) => foto.categoria === categoria);
  const nomeCapa = categorias.find((c) => c.slug === categoria)?.capa;
  const i = lista.findIndex((f) => f.nome === nomeCapa);
  if (i > 0) lista.unshift(...lista.splice(i, 1));
  return lista;
}

// Mistura as categorias (1 de cada, depois a próxima de cada...) para a home.
export function selecionadas(limite = 12) {
  const grupos = [...new Set(fotos.map((f) => f.categoria))].map(fotosDa);
  const misturadas: Foto[] = [];
  for (let i = 0; misturadas.length < fotos.length; i++) {
    for (const grupo of grupos) if (grupo[i]) misturadas.push(grupo[i]);
  }
  return misturadas.slice(0, limite);
}

// Fotos do slider: as da lista (ex.: 'rua/02-noite-de-festa') ou, se vazia, uma seleção automática.
export function fotosEmDestaque(lista: string[], limite = 10) {
  if (lista.length === 0) return selecionadas(limite);
  return lista
    .map((chave) => fotos.find((f) => `${f.categoria}/${f.nome}` === chave))
    .filter((f): f is Foto => Boolean(f));
}

// Foto de capa: a escolhida em site.ts (capaPrincipal), senão a primeira das Pedras.
export function capa() {
  return (
    fotos.find((f) => `${f.categoria}/${f.nome}` === capaPrincipal) ??
    fotosDa('pedras')[0] ??
    fotos[0]
  );
}
