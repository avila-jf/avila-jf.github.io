// Flash da câmera entre as páginas (sites ⇄ fotografia).
// Quem dispara: dispararPara(url), ou qualquer link com data-flash (ligarLinksComFlash()).
// A tela fica branca num clarão rápido, a página nova abre e começa no mesmo branco, que se apaga.
// Para a página nova saber que veio do flash, fica uma marca no sessionStorage; o script inline do
// layout (Portfolio.astro) lê a marca antes da primeira pintura e liga html.do-flash.
const MARCA = 'flash-camera';

export function dispararPara(destino: string) {
  const tela = document.querySelector<HTMLElement>('.flash-tela');
  try {
    sessionStorage.setItem(MARCA, '1');
  } catch {
    /* sem storage: abre sem o flash na chegada */
  }
  if (!tela || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    location.href = destino;
    return;
  }
  tela.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out', fill: 'forwards' }).finished.then(() => {
    location.href = destino;
  });
}

export function ligarLinksComFlash() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-flash]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // nova aba: segue normal
      const destino = new URL(a.href, location.href);
      if (destino.pathname === location.pathname) return; // já está nesta página
      e.preventDefault();
      dispararPara(destino.href);
    });
  });
}

// Na página nova: apaga o branco devagar (como o olho se acostumando depois do flash)
export function chegarDoFlash() {
  const raiz = document.documentElement;
  if (!raiz.classList.contains('do-flash')) return;
  const tela = document.querySelector<HTMLElement>('.flash-tela');
  const apagar = () => {
    tela?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'forwards' });
    setTimeout(() => raiz.classList.remove('do-flash'), 900);
  };
  if (document.readyState === 'complete') apagar();
  else addEventListener('load', apagar, { once: true });
  setTimeout(apagar, 2500); // segurança: nunca fica branco preso
}

export const marcaDoFlash = MARCA;
