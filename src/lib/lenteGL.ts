// Efeitos em WebGL do site novo, escritos do zero (estudei a técnica da FlexCarousel do
// @echo_builds, mas o código é meu):
//
//  - lenteDoTopo(): o meu retrato recortado, em preto e branco de revista. Ele entra desfocado e
//    estourado, como se a câmera acertasse o foco, e no lugar do mouse aparece uma LENTE redonda:
//    dentro dela eu apareço em cor e ampliado, com as cores se separando na borda. Sem mouse
//    (celular), a lente fica parada no rosto.
//
//  - faixaQueCurva(): os cartões da faixa de protótipos/ensaios desenhados num canvas só. O meio
//    fica reto; a ponta direita SOBE e a esquerda DESCE, as duas crescendo na nossa direção,
//    como uma tela que enrola, com as cores abrindo em arco-íris na dobra. Rolando, torce mais.
//
// WebGL 1 (roda em qualquer celular). Sem WebGL, o HTML de sempre continua lá.

/* ---------------- utilidades ---------------- */
const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

function criarGL(canvas: HTMLCanvasElement, frag: string): { gl: WebGLRenderingContext; u: Uniforms } | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const shader = (tipo: number, src: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[lenteGL]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const v = shader(gl.VERTEX_SHADER, VERT);
  const f = shader(gl.FRAGMENT_SHADER, frag);
  if (!v || !f) return null;
  const pr = gl.createProgram()!;
  gl.attachShader(pr, v);
  gl.attachShader(pr, f);
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u: Uniforms = {};
  const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const nome = gl.getActiveUniform(pr, i)!.name;
    u[nome] = gl.getUniformLocation(pr, nome);
  }
  return { gl, u };
}

function textura(gl: WebGLRenderingContext, src: TexImageSource) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

async function carregada(img: HTMLImageElement) {
  img.loading = 'eager';
  if (!img.complete || !img.naturalWidth) await new Promise((ok) => img.addEventListener('load', ok, { once: true }));
  try {
    await img.decode();
  } catch {
    /* já decodificada */
  }
}

const perto = (el: Element, folga = 200) => {
  const r = el.getBoundingClientRect();
  return r.bottom > -folga && r.top < innerHeight + folga;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dprLimite = (max: number) => Math.min(devicePixelRatio || 1, max);

/* =========================================================
   1) A LENTE DO TOPO
   ========================================================= */
const FRAG_LENTE = `precision highp float;
varying vec2 vUv;
uniform sampler2D uPb, uCor;  // o retrato em preto e branco e o mesmo recorte em cor
uniform vec2 uRes;            // canvas em px (css)
uniform vec2 uMouse;          // centro da lente, em px (css), y para cima
uniform float uRaio, uFoco, uTempo, uForca;

vec4 desfoque(vec2 uv, float raioPx){
  // 12 amostras em espiral: barato e sem cara de quadradinho
  vec2 passo = raioPx / uRes;
  vec4 soma = texture2D(uPb, uv);
  float a = 0.;
  for (int i = 1; i <= 12; i++) {
    float r = sqrt(float(i) / 12.);
    a += 2.39996;
    soma += texture2D(uPb, uv + vec2(cos(a), sin(a)) * r * passo);
  }
  return soma / 13.;
}

void main(){
  vec2 px = vUv * uRes;

  // fora da lente: o retrato em preto e branco (desfocado só na entrada, enquanto acerta o foco)
  vec4 fora = uFoco < .999 ? desfoque(vUv, pow(1. - uFoco, 2.) * 28.) : texture2D(uPb, vUv);

  // a lente: em cor e ampliada, com as cores se abrindo na borda
  vec2 rel = px - uMouse;
  float d = length(rel);
  float R = uRaio;
  float k = clamp(d / R, 0., 1.);
  vec2 dir = d > .001 ? rel / d : vec2(0.);
  float zoom = 1.25 + uForca * .12;
  vec2 base = (uMouse + rel / zoom * (1. - .18 * k * k)) / uRes;  // barril: a borda puxa pra dentro
  vec2 sep = dir * pow(k, 4.) * (5. + uForca * 7.) / uRes;   // só na beirada da lente
  vec4 g = texture2D(uCor, base);
  vec4 dentro = vec4(texture2D(uCor, base + sep).r, g.g, texture2D(uCor, base - sep).b, g.a);
  float lumD = dot(dentro.rgb, vec3(.299, .587, .114));
  dentro.rgb = mix(vec3(lumD), dentro.rgb, .8);                 // cor de verdade, sem estourar o laranja
  dentro.rgb = mix(dentro.rgb, dentro.rgb * vec3(.94, .98, 1.08), .6) * (1. - pow(k, 6.) * .3);

  float mLente = (1. - smoothstep(R - 1.5, R + .5, d)) * uFoco;
  vec4 cor = mix(fora, dentro, mLente);

  // aro: anel fino + marquinhas de foco girando devagar (aparecem até fora do corpo)
  float aro = smoothstep(2.2, .4, abs(d - R - 3.));
  float ang = atan(rel.y, rel.x) + uTempo * .25;
  float marca = step(.82, fract(ang * 36. / 6.28318)) * step(abs(d - R - 12.), 4.);
  float linha = clamp(aro + marca * .8, 0., 1.) * uFoco * .9;
  vec3 tinta = vec3(.11, .13, .2);
  cor = vec4(mix(cor.rgb, tinta * max(cor.a, linha), linha), max(cor.a, linha));

  // entrada: estourado de luz, como o flash antes do foco
  cor.rgb = mix(cor.rgb, vec3(cor.a), pow(1. - uFoco, 3.) * .85);

  // grão de filme
  float gr = fract(sin(dot(px + fract(uTempo) * 61., vec2(12.9898, 78.233))) * 43758.5453);
  cor.rgb += (gr - .5) * .05 * cor.a;
  gl_FragColor = cor;
}`;

export async function lenteDoTopo(
  caixa: HTMLElement,
  opcoes: { atraso: number; temMouse: boolean; alvo: [number, number]; cor: string },
) {
  const img = caixa.querySelector('img');
  if (!img) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'lente-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = criarGL(canvas, FRAG_LENTE);
  if (!ctx) return;
  const { gl, u } = ctx;
  const imgCor = new Image();
  imgCor.src = opcoes.cor;
  await Promise.all([carregada(img), carregada(imgCor)]);
  gl.activeTexture(gl.TEXTURE0);
  textura(gl, img);
  gl.activeTexture(gl.TEXTURE1);
  textura(gl, imgCor);
  caixa.append(canvas);
  caixa.classList.add('com-gl');

  let W = 1, H = 1;
  const medir = () => {
    const dpr = dprLimite(1.75);
    const r = caixa.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  medir();
  new ResizeObserver(medir).observe(caixa);

  // onde a lente descansa (0..1 da foto, de cima para baixo): no rosto
  const descanso = () => ({ x: opcoes.alvo[0] * W, y: (1 - opcoes.alvo[1]) * H });
  const m = { x: 0, y: 0, tx: 0, ty: 0, forca: 0, ultimo: -1e9 };
  ({ x: m.x, y: m.y } = descanso());
  const mirar = (cx: number, cy: number) => {
    const r = caixa.getBoundingClientRect();
    const x = cx - r.left, y = r.bottom - cy;
    if (x < -80 || x > W + 80 || y < -80 || y > H + 80) { m.ultimo = -1e9; return; }
    m.tx = x; m.ty = y; m.ultimo = performance.now();
  };
  if (opcoes.temMouse) {
    addEventListener('pointermove', (e) => mirar(e.clientX, e.clientY), { passive: true });
  } else {
    // celular: a lente vai até onde o dedo toca (e segue o dedo enquanto ele arrasta)
    caixa.addEventListener('touchstart', (e) => mirar(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    caixa.addEventListener('touchmove', (e) => mirar(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  }
  // sem mouse, a lente passeia sozinha pela foto: rosto → boné → camiseta → rosto
  const passeio: [number, number][] = [opcoes.alvo, [0.5, 0.1], [0.42, 0.5], [0.58, 0.68]];

  const t0 = performance.now() + opcoes.atraso * 1000;
  const quadro = (agora: number) => {
    requestAnimationFrame(quadro);
    if (!perto(caixa)) return;
    const t = (agora - t0) / 1000;
    const foco = Math.min(1, Math.max(0, t / 1.6));
    const focoSuave = 1 - Math.pow(1 - foco, 3);
    if (agora - m.ultimo > 1800) {
      if (opcoes.temMouse) {
        const d = descanso();
        m.tx = d.x + Math.sin(t * .6) * 8; m.ty = d.y + Math.cos(t * .45) * 8;
      } else {
        // troca de ponto a cada 2,6 s, depois que o foco acertou
        const [ax, ay] = passeio[Math.floor(Math.max(0, t - 1.6) / 2.6) % passeio.length];
        m.tx = ax * W + Math.sin(t * .9) * 10; m.ty = (1 - ay) * H + Math.cos(t * .7) * 10;
      }
    }
    const px = m.x, py = m.y;
    const passo = opcoes.temMouse || agora - m.ultimo < 1800 ? .14 : .045; // passeio mais lento e suave que o dedo
    m.x = lerp(m.x, m.tx, passo); m.y = lerp(m.y, m.ty, passo);
    m.forca = lerp(m.forca, Math.min(1, Math.hypot(m.x - px, m.y - py) / 18), .1);
    const raio = Math.min(W, H) * (.16 + .015 * Math.sin(t * .8)) * (.5 + .5 * focoSuave);

    gl.uniform1i(u.uPb, 0);
    gl.uniform1i(u.uCor, 1);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform2f(u.uMouse, m.x, m.y);
    gl.uniform1f(u.uRaio, raio);
    gl.uniform1f(u.uFoco, focoSuave);
    gl.uniform1f(u.uTempo, Math.max(0, t));
    gl.uniform1f(u.uForca, m.forca);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(quadro);
}

/* =========================================================
   2) A FAIXA QUE CURVA
   ========================================================= */
const FRAG_FAIXA = `precision highp float;
varying vec2 vUv;
uniform sampler2D uAtlas;
uniform vec2 uRes;          // palco em px (css)
uniform vec2 uCard;         // tamanho do cartão (css px)
uniform float uTopo;        // topo dos cartões no palco (css px)
uniform float uInicio;      // x do 1º cartão no palco (css px)
uniform float uPasso;       // largura + espaço
uniform float uN, uCols, uRaioCanto, uCurva, uDisp;
uniform float uFecha;       // 0..1: no fim da faixa ela recua pro centro e some (dá lugar à grade de todos os projetos)
uniform vec2 uCel;          // tamanho de uma célula do atlas, em 0..1

vec4 cartao(vec2 p){
  float sx = p.x - uInicio;
  float i = floor(sx / uPasso);
  if (i < 0. || i >= uN) return vec4(0.);
  vec2 l = vec2(sx - i * uPasso, p.y - uTopo);
  // canto arredondado
  vec2 q = abs(l - uCard * .5) - uCard * .5 + uRaioCanto;
  float sd = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - uRaioCanto;
  float m = clamp(.5 - sd, 0., 1.);
  if (m <= 0.) return vec4(0.);
  vec2 uvc = clamp(l / uCard, 0., 1.);
  float col = mod(i, uCols), lin = floor(i / uCols);
  vec2 uv = vec2((col + uvc.x) * uCel.x, 1. - (lin + uvc.y) * uCel.y);
  return texture2D(uAtlas, uv) * m;
}

void main(){
  vec2 px = vec2(vUv.x, 1. - vUv.y) * uRes;       // y para baixo, como a página
  float meio = uRes.x * .5;
  float alcance = (px.x - meio) / meio;            // -1 .. 1
  float lado = smoothstep(.22, 1.05, abs(alcance));
  float s = sign(alcance);
  // a curva, como no reel dele: uma TORÇÃO. A ponta direita sobe e a esquerda desce, e as duas
  // crescem, vindo na nossa direção como uma tela que enrola. Rolando, a torção aumenta.
  float sobe = lado * lado * uCurva * s;
  float meioY = uTopo + uCard.y * .5;
  float cresce = 1. - lado * lado * .2;              // nas pontas o cartão fica mais alto (vem pra frente)
  vec2 p = vec2(px.x, (px.y - meioY) * cresce + meioY + sobe * (1. + uFecha * 2.));

  // fechando: a faixa recua pro centro, como uma câmera abrindo o zoom
  if (uFecha > 0.) {
    vec2 c0 = vec2(meio, meioY);
    float ang = 0.;
    vec2 d = (p - c0) * (1. + uFecha * uFecha * 2.2);
    p = c0 + vec2(cos(ang) * d.x - sin(ang) * d.y, sin(ang) * d.x + cos(ang) * d.y);
  }

  // arco-íris na curva: cada cor é lida um pouco deslocada
  float abre = lado * uDisp;
  vec4 c = cartao(p);
  if (abre > .3) {
    vec4 r = cartao(p + vec2(0., abre));
    vec4 b = cartao(p - vec2(0., abre));
    c = vec4(r.r, c.g, b.b, max(c.a, max(r.a, b.a)));
  }
  c.rgb *= 1. - lado * .28;                         // as pontas escurecem: profundidade
  gl_FragColor = c * (1. - smoothstep(.55, 1., uFecha));
}`;

export type Faixa = { atualizar(x: number, velocidade: number, fecha?: number): void; medir(): void } | null;

export async function faixaQueCurva(palco: HTMLElement, cards: HTMLElement[], celular: boolean): Promise<Faixa> {
  if (!cards.length) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'faixa-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = criarGL(canvas, FRAG_FAIXA);
  if (!ctx) return null;
  const { gl, u } = ctx;
  const imgs = cards.map((c) => c.querySelector('img'));
  await Promise.all(imgs.map((i) => (i ? carregada(i) : Promise.resolve())));

  // atlas: todos os cartões numa textura só, já recortados no formato do cartão
  const cols = Math.min(cards.length, 3);
  const lins = Math.ceil(cards.length / cols);
  const r0 = cards[0].getBoundingClientRect();
  const celW = Math.min(1024, Math.floor(4096 / cols));
  const celH = Math.round((celW * r0.height) / r0.width);
  const atlas = document.createElement('canvas');
  atlas.width = celW * cols;
  atlas.height = celH * lins;
  const a2 = atlas.getContext('2d')!;
  a2.fillStyle = getComputedStyle(cards[0]).backgroundColor || '#1b2133';
  imgs.forEach((img, i) => {
    const x = (i % cols) * celW, y = Math.floor(i / cols) * celH;
    a2.fillRect(x, y, celW, celH);
    if (!img) return;
    const pos = getComputedStyle(img).objectPosition.split(' ');
    const py = pos[1]?.includes('%') ? parseFloat(pos[1]) / 100 : pos[1] === 'top' || pos[1] === '0px' ? 0 : .5;
    const ia = img.naturalWidth / img.naturalHeight, ca = celW / celH;
    let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
    if (ia > ca) { sw = sh * ca; sx = (img.naturalWidth - sw) / 2; } else { sh = sw / ca; sy = (img.naturalHeight - sh) * py; }
    a2.drawImage(img, sx, sy, sw, sh, x, y, celW, celH);
  });
  textura(gl, atlas);

  palco.append(canvas);
  palco.classList.add('com-gl');

  let W = 1, H = 1, card = { w: 1, h: 1, topo: 0, esq: 0, passo: 1, raio: 18 };
  const medir = () => {
    const dpr = dprLimite(1.5);
    const rp = palco.getBoundingClientRect();
    W = rp.width; H = rp.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const a = cards[0], b = cards[1];
    const ra = a.getBoundingClientRect();
    const passo = b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
    card = { w: a.offsetWidth, h: a.offsetHeight, topo: ra.top - rp.top, esq: a.offsetLeft, passo, raio: parseFloat(getComputedStyle(a).borderTopLeftRadius) || 18 };
  };
  medir();

  let curva = 0, x = 0, vel = 0, fecha = 0;
  const desenhar = () => {
    // o topo dos cartões é lido a cada quadro: a trava do GSAP muda a página depois da 1ª medida
    card.topo = cards[0].getBoundingClientRect().top - palco.getBoundingClientRect().top;
    // a torção segue o sentido da rolagem: rolando pra cima, ela vira pro outro lado
    const alvo = ((celular ? 60 : 110) + Math.min(110, Math.abs(vel) / 18)) * (vel < -40 ? -1 : 1);
    curva = lerp(curva, alvo, .08);
    gl.uniform1i(u.uAtlas, 0);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform2f(u.uCard, card.w, card.h);
    gl.uniform1f(u.uTopo, card.topo);
    gl.uniform1f(u.uInicio, card.esq + x);
    gl.uniform1f(u.uPasso, card.passo);
    gl.uniform1f(u.uN, cards.length);
    gl.uniform1f(u.uCols, cols);
    gl.uniform2f(u.uCel, 1 / cols, 1 / lins);
    gl.uniform1f(u.uRaioCanto, card.raio);
    gl.uniform1f(u.uCurva, curva);
    gl.uniform1f(u.uFecha, fecha);
    gl.uniform1f(u.uDisp, 3 + Math.min(9, Math.abs(vel) / 160));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  // continua assentando a curva mesmo depois que a rolagem para
  const quadro = () => {
    requestAnimationFrame(quadro);
    if (perto(palco)) desenhar();
    vel = lerp(vel, 0, .06);
  };
  requestAnimationFrame(quadro);

  return {
    atualizar(nx, v, f = 0) { x = nx; vel = v; fecha = f; },
    medir,
  };
}
