// Notebook 3D da seção de sites (three.js), na ideia do foldfolio: começa fechado, abre com a
// rolagem e a tela vai mostrando cada site. O print do site "rola" dentro da tela, como se alguém
// estivesse navegando, e na troca de um site para o outro as telas se misturam (crossfade).
// Uma luz atrás da tampa pinta as bordas com a cor do site da vez.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface Estado {
  abrir: number; // 0 = fechado, 1 = aberto
  a: number; // site na tela
  b: number; // próximo site (para a mistura)
  mistura: number; // 0 = só "a", 1 = só "b"
  rolarA: number; // quanto o site "a" já rolou (0 = topo)
  cor: string; // cor da luz de trás
}

export interface Aparelho {
  definir(e: Partial<Estado>): void;
}

const LARGURA = 3.4;
const PROFUNDIDADE = 2.3;
const TAMPA = 2.2;
const TELA = { w: 3.12, h: 1.95 };

const fragmentoTela = /* glsl */ `
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float vA; // fração da altura do print que cabe na tela
  uniform float vB;
  uniform float sA; // rolagem do print A (0 = topo, 1 = fim)
  uniform float uMistura;
  uniform float uLuz;
  varying vec2 vUv;

  vec3 ler(sampler2D t, float v, float s) {
    float y = (1.0 - v) * (1.0 - s) + vUv.y * v;
    return texture2D(t, vec2(vUv.x, y)).rgb;
  }

  void main() {
    vec3 cor = mix(ler(tA, vA, sA), ler(tB, vB, 0.0), uMistura);
    // reflexo suave de vidro na diagonal
    float reflexo = smoothstep(0.55, 0.0, abs(vUv.x - vUv.y * 0.6 - 0.15)) * 0.06;
    gl_FragColor = vec4(cor * uLuz + reflexo, 1.0);
  }
`;

export async function montarAparelho(tela: HTMLCanvasElement, urls: string[]): Promise<Aparelho> {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  // no celular 1.5x basta (a tela é pequena); no computador fica 2x pro texto dos prints ficar nítido
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // reflexo do alumínio: no celular em resolução menor (128 em vez de 256), a tela é pequena
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04, 0.1, 100, { size: innerWidth < 768 ? 128 : 256 }).texture;
  pmrem.dispose();
  cena.environmentIntensity = 0.9;
  cena.add(new THREE.HemisphereLight(0xffffff, 0xb8c2d8, 0.8));
  const sol = new THREE.DirectionalLight(0xffffff, 1.4);
  sol.position.set(3, 6, 5);
  cena.add(sol);
  const luzCor = new THREE.PointLight(0x2346a8, 30, 8, 1.6); // atrás da tampa: borda na cor do site
  luzCor.position.set(0, 1.4, -1.8);
  cena.add(luzCor);

  const olho = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  // ---------- texturas (prints) ----------
  const carregador = new THREE.TextureLoader();
  const texturas = await Promise.all(
    urls.map(
      (url) =>
        new Promise<THREE.Texture>((ok, erro) =>
          carregador.load(
            url,
            (t) => {
              t.colorSpace = THREE.NoColorSpace; // o shader devolve a cor como veio (já em sRGB)
              t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); // 4x já deixa o print nítido inclinado
              ok(t);
            },
            undefined,
            erro,
          ),
        ),
    ),
  );
  const fracao = (t: THREE.Texture) => {
    const img = t.image as HTMLImageElement;
    return Math.min(1, img.width / img.height / (TELA.w / TELA.h));
  };

  // ---------- modelo ----------
  const aluminio = new THREE.MeshStandardMaterial({ color: 0xc9ccd4, metalness: 0.75, roughness: 0.32 });
  const escuro = new THREE.MeshStandardMaterial({ color: 0x1b1d24, metalness: 0.2, roughness: 0.6 });
  const moldura = new THREE.MeshStandardMaterial({ color: 0x0b0c10, metalness: 0.1, roughness: 0.25 });

  const modelo = new THREE.Group();
  cena.add(modelo);

  const base = new THREE.Mesh(new RoundedBoxGeometry(LARGURA, 0.12, PROFUNDIDADE, 4, 0.05), aluminio);
  modelo.add(base);
  const teclado = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA - 0.5, 0.95), escuro);
  teclado.rotation.x = -Math.PI / 2;
  teclado.position.set(0, 0.061, -0.35);
  const trackpad = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.62), new THREE.MeshStandardMaterial({ color: 0xb9bcc5, metalness: 0.6, roughness: 0.4 }));
  trackpad.rotation.x = -Math.PI / 2;
  trackpad.position.set(0, 0.061, 0.62);
  modelo.add(teclado, trackpad);

  // A tampa gira na dobradiça (borda de trás da base)
  const dobradica = new THREE.Group();
  dobradica.position.set(0, 0.06, -PROFUNDIDADE / 2 + 0.02);
  modelo.add(dobradica);
  const tampa = new THREE.Mesh(new RoundedBoxGeometry(LARGURA, TAMPA, 0.07, 4, 0.04), aluminio);
  tampa.position.set(0, TAMPA / 2, -0.035);
  const bisel = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA - 0.1, TAMPA - 0.1), moldura);
  bisel.position.set(0, TAMPA / 2, 0.001);
  const uniformes = {
    tA: { value: texturas[0] },
    tB: { value: texturas[0] },
    vA: { value: fracao(texturas[0]) },
    vB: { value: fracao(texturas[0]) },
    sA: { value: 0 },
    uMistura: { value: 0 },
    uLuz: { value: 0 },
  };
  const tela3d = new THREE.Mesh(
    new THREE.PlaneGeometry(TELA.w, TELA.h),
    new THREE.ShaderMaterial({
      uniforms: uniformes,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: fragmentoTela,
      toneMapped: false,
    }),
  );
  tela3d.position.set(0, TAMPA / 2 + 0.03, 0.002);
  dobradica.add(tampa, bisel, tela3d);

  // ---------- estado ----------
  const estado: Estado = { abrir: 0, a: 0, b: 0, mistura: 0, rolarA: 0, cor: '#2346a8' };
  const suave = { abrir: 0, rolarA: 0, mistura: 0 };
  const corAlvo = new THREE.Color(estado.cor);
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  });

  let distancia = 9;
  function redimensionar() {
    const caixa = tela.getBoundingClientRect();
    renderer.setSize(Math.max(1, caixa.width), Math.max(1, caixa.height), false);
    olho.aspect = caixa.width / Math.max(1, caixa.height);
    olho.updateProjectionMatrix();
    // afasta o suficiente para o notebook inteiro caber na largura
    distancia = Math.max(8.2, (LARGURA * 1.35) / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * olho.aspect));
  }
  redimensionar();
  new ResizeObserver(redimensionar).observe(tela);

  // só desenha quando algo mudou (rolagem, mouse/dedo, troca de site): parado, a GPU descansa
  let sujo = true;
  addEventListener('pointermove', () => (sujo = true), { passive: true });
  new ResizeObserver(() => (sujo = true)).observe(tela);
  const quase = (a: number, b: number) => Math.abs(a - b) < 0.0005;
  const mudando = () =>
    !quase(estado.abrir, suave.abrir) ||
    !quase(estado.rolarA, suave.rolarA) ||
    !quase(estado.mistura, suave.mistura) ||
    !quase(mouse.x, mouse.sx) ||
    !quase(mouse.y, mouse.sy) ||
    !luzCor.color.equals(corAlvo);

  let visivel = true;
  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel) sujo = true;
  }).observe(tela);
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  function desenhar() {
    if (!sujo && !mudando()) return;
    sujo = false;
    suave.abrir += (estado.abrir - suave.abrir) * 0.1;
    suave.rolarA += (estado.rolarA - suave.rolarA) * 0.1;
    suave.mistura += (estado.mistura - suave.mistura) * 0.15;
    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;
    const abrir = ease(suave.abrir);

    // fechada = tampa deitada sobre a base (+90°); aberta = um pouco para trás (-13°)
    dobradica.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.02, -0.22, abrir);
    uniformes.uLuz.value = THREE.MathUtils.smoothstep(abrir, 0.35, 0.9);
    uniformes.sA.value = suave.rolarA;
    uniformes.uMistura.value = suave.mistura;

    luzCor.color.lerp(corAlvo, 0.06);
    // perto o bastante: encaixa na cor final, senão a mistura nunca termina e ele não para de desenhar
    const c = luzCor.color;
    if (Math.abs(c.r - corAlvo.r) + Math.abs(c.g - corAlvo.g) + Math.abs(c.b - corAlvo.b) < 0.004) c.copy(corAlvo);
    luzCor.intensity = 30 * abrir;

    // câmera: vista de cima com o notebook fechado, desce para a frente conforme abre
    const altura = THREE.MathUtils.lerp(6.5, 1.7, abrir);
    olho.position.set(mouse.sx * 0.8, altura - mouse.sy * 0.5, THREE.MathUtils.lerp(distancia * 0.62, distancia, abrir));
    olho.lookAt(0, THREE.MathUtils.lerp(0, 1.05, abrir), 0);
    // o balanço segue a rolagem e o mouse/dedo (antes balançava sozinho e nunca parava de desenhar)
    modelo.rotation.y = (Math.sin(suave.rolarA * Math.PI * 2) * 0.06 + mouse.sx * 0.12) * abrir;
    renderer.render(cena, olho);
  }

  // prepara tudo antes da seção aparecer: sobe os prints pra GPU um por vez (nos intervalos do
  // navegador) e compila os shaders. Assim a primeira imagem não engasga a rolagem.
  const folga = () =>
    new Promise<void>((ok) => ('requestIdleCallback' in window ? requestIdleCallback(() => ok(), { timeout: 400 }) : setTimeout(ok, 50)));
  for (const t of texturas) {
    await folga();
    renderer.initTexture(t);
  }
  await folga();
  renderer.compile(cena, olho);

  renderer.setAnimationLoop(() => visivel && desenhar());

  return {
    definir(novo) {
      Object.assign(estado, novo);
      const a = texturas[estado.a] ?? texturas[0];
      const b = texturas[estado.b] ?? a;
      if (uniformes.tA.value !== a) {
        uniformes.tA.value = a;
        uniformes.vA.value = fracao(a);
        // trocou de site: sem suavizar, senão a tela "voltaria rolando" para o topo
        suave.mistura = estado.mistura;
        suave.rolarA = estado.rolarA;
      }
      if (uniformes.tB.value !== b) {
        uniformes.tB.value = b;
        uniformes.vB.value = fracao(b);
      }
      corAlvo.set(estado.cor);
      sujo = true;
    },
  };
}
