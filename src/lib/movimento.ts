// Movimento do site novo, num lugar só: GSAP + ScrollTrigger registrados uma vez, a rolagem suave
// (Lenis) presa no mesmo relógio do GSAP e a ordem em que as seções que travam a tela são medidas.
//
// Por que um arquivo só: com várias seções travadas (pin), a ordem de medição importa. Se uma seção
// de baixo mede antes da de cima, ela calcula o começo dela sem contar o espaço que a de cima ainda
// vai ocupar, e a página "pula". Aqui cada seção marcada com data-trava ganha a prioridade pela
// posição na página (a de cima mede primeiro), sem número escrito à mão em cada componente.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const temMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const celular = matchMedia('(max-width: 760px)').matches;

// Prioridade de medição de uma seção travada: a 1ª da página = 100, a 2ª = 99...
// Os gatilhos que não travam nada (como a lente do Fundo) usam números negativos e medem por último.
export function prioridade(el: Element): number {
  const travas = [...document.querySelectorAll('[data-trava]')];
  const i = travas.indexOf(el.closest('[data-trava]') ?? el);
  return i < 0 ? 0 : 100 - i;
}

// Depois que uma trava é criada fora de ordem (o notebook 3D monta mais tarde), reordena e remede.
export function remedir() {
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

type Rolagem = { stop(): void; start(): void; scrollTo(alvo: number | string | HTMLElement, o?: object): void };

// Rolagem suave só no computador (no celular a rolagem nativa já é macia e o Lenis atrapalha o dedo).
// O Lenis anda no relógio do GSAP: um quadro só por vez para rolagem e animação, sem tremida.
export function iniciarRolagem(): Rolagem | undefined {
  const janela = window as unknown as { lenis?: Lenis };
  if (janela.lenis || !temMouse || semMovimento) return janela.lenis;
  const lenis = new Lenis({ lerp: 0.09, anchors: true });
  janela.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function rolagem(): Rolagem | undefined {
  return (window as unknown as { lenis?: Rolagem }).lenis;
}
