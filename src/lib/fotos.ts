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

function legenda(nome: string) {
  const texto = nome.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim();
  return texto || 'Fotografia';
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
