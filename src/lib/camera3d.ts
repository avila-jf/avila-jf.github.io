// Nikon D3200 modelada em código com three.js (WebGL): corpo, pega, prisma, botões e a lente 18-55
// com anéis torneados e ranhuras. A CameraCena move tudo pela rolagem com definir({ virar, zoom, foco }):
// a câmera vira para quem está vendo, mira no mouse, dá zoom, foca e dispara.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Pose da câmera na cena, tudo de 0 a 1 (quem controla é a CameraCena, pela rolagem)
export interface Pose {
  virar: number; // 0 = de costas (display com o menu à vista), 1 = de frente, lente apontada para quem vê
  zoom: number; // lente estica de 18 para 55 mm e a câmera chega mais perto
  foco: number; // anel de foco gira
}

export interface Camera3D {
  definir(pose: Partial<Pose>): void;
  disparar(): void; // tranco do clique e a luz da frente acende
}

// Medidas do corpo (unidades livres; a câmera real tem ~125 x 96 x 77 mm)
const W = 4; // largura
const H = 2.6; // altura (sem o prisma)
const D = 1.3; // profundidade
const LX = 0.3; // eixo da lente (x)
const LY = -0.12; // eixo da lente (y)
const TELA = { x: 0.42, y: -0.12, w: 2.05, h: 1.55 }; // display traseiro (x visto de frente)

const FOV = 24; // lente "mais longa" = menos distorção de perspectiva
const TG = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// ---------- texturas desenhadas em canvas ----------
function canvas(largura: number, altura: number) {
  const c = document.createElement('canvas');
  c.width = largura;
  c.height = altura;
  return [c, c.getContext('2d')!] as const;
}

function paraTextura(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texto(txt: string, fonte: string, largura = 512, altura = 128, cor = '#f2f0f5') {
  const [c, g] = canvas(largura, altura);
  g.fillStyle = cor;
  g.font = fonte;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(txt, largura / 2, altura / 2);
  return paraTextura(c);
}

// Ruído fino para o "couro" do corpo e da pega
function ruido(tamanho: number, grao: number) {
  const [c, g] = canvas(tamanho, tamanho);
  const img = g.createImageData(tamanho, tamanho);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * grao;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

// Escrita em volta da frente da lente
function aroDaLente() {
  const [c, g] = canvas(1024, 1024);
  const frase = 'AF-S DX NIKKOR 18-55mm 1:3.5-5.6G VR   ·   Nikon   ·   Ø52   ·   ';
  g.fillStyle = '#e9e6ee';
  g.font = '500 34px Inter, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.translate(512, 512);
  const passo = (Math.PI * 2) / frase.length;
  for (const letra of frase) {
    g.save();
    g.translate(0, -432);
    g.fillText(letra, 0, 0);
    g.restore();
    g.rotate(passo);
  }
  return paraTextura(c);
}

// Ícone da lixeira (desenhado, porque o emoji sai colorido)
function lixeira() {
  const [c, g] = canvas(128, 128);
  g.strokeStyle = '#e4e1ea';
  g.lineWidth = 8;
  g.lineCap = g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(30, 40);
  g.lineTo(98, 40);
  g.moveTo(52, 40);
  g.lineTo(52, 28);
  g.lineTo(76, 28);
  g.lineTo(76, 40);
  g.moveTo(40, 40);
  g.lineTo(46, 104);
  g.lineTo(82, 104);
  g.lineTo(88, 40);
  g.stroke();
  return paraTextura(c);
}

// O que aparece no display: os dados do portfólio, como um menu da própria câmera
export interface InfoDisplay {
  nome: string;
  cidade: string;
  ensaios: { titulo: string; total: number }[];
  totalFotos: number;
  sitesNoAr: number;
}

// Menu no estilo Nikon: barra no topo, lista com a linha selecionada em azul, rodapé com dicas.
// "sel" é a linha destacada (a CameraCena não precisa saber: o próprio display vai passando).
function desenharMenu(g: CanvasRenderingContext2D, info: InfoDisplay, sel: number, foto?: HTMLImageElement) {
  const L = 1024;
  const A = 774;
  g.save();
  g.clearRect(0, 0, L, A);

  // fundo: a foto (como object-fit: cover) bem escurecida, ou um degradê azul
  if (foto) {
    const escala = Math.max(L / foto.width, A / foto.height);
    const w = foto.width * escala;
    const h = foto.height * escala;
    g.drawImage(foto, (L - w) / 2, (A - h) * 0.3, w, h);
    g.fillStyle = 'rgba(3, 7, 16, 0.82)';
    g.fillRect(0, 0, L, A);
  } else {
    const d = g.createLinearGradient(0, 0, 0, A);
    d.addColorStop(0, '#0b1730');
    d.addColorStop(1, '#03060d');
    g.fillStyle = d;
    g.fillRect(0, 0, L, A);
  }

  g.textBaseline = 'middle';

  // barra do topo
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.fillRect(0, 0, L, 96);
  g.fillStyle = '#6aa9ec';
  g.font = '700 34px Inter, sans-serif';
  g.fillText('MENU', 44, 50);
  g.fillStyle = '#e8eef7';
  g.font = '500 30px Inter, sans-serif';
  g.textAlign = 'right';
  g.fillText(info.nome.toUpperCase(), L - 130, 50);
  // bateria
  g.strokeStyle = '#e8eef7';
  g.lineWidth = 3;
  g.strokeRect(L - 104, 34, 58, 32);
  g.fillRect(L - 44, 42, 6, 16);
  g.fillStyle = '#4ade80';
  g.fillRect(L - 98, 40, 44, 20);
  g.textAlign = 'left';

  // linhas: os ensaios, a agenda e os sites
  const linhas = [
    ...info.ensaios.map((e) => ({ texto: e.titulo, valor: String(e.total), serifa: true })),
    { texto: `Agenda aberta · ${info.cidade}`, valor: '●', serifa: false },
    { texto: `${info.sitesNoAr} sites no ar`, valor: '</>', serifa: false },
  ];
  const topo = 118;
  const altura = 96;
  linhas.forEach((l, i) => {
    const y = topo + i * altura;
    if (i === sel) {
      g.fillStyle = 'rgba(106,169,236,0.24)';
      g.fillRect(24, y, L - 48, altura - 10);
      g.fillStyle = '#6aa9ec';
      g.fillRect(24, y, 8, altura - 10);
    }
    if (i === info.ensaios.length) {
      // separador entre ensaios e o resto
      g.fillStyle = 'rgba(255,255,255,0.12)';
      g.fillRect(44, y - 6, L - 88, 2);
    }
    g.fillStyle = i === sel ? '#ffffff' : 'rgba(232,238,247,0.82)';
    g.font = l.serifa ? 'italic 500 58px "Cormorant Garamond", Georgia, serif' : '400 40px Inter, sans-serif';
    g.fillText(l.texto, 64, y + (altura - 10) / 2 + 2);
    g.textAlign = 'right';
    g.fillStyle = l.valor === '●' ? '#4ade80' : '#6aa9ec';
    g.font = '600 40px Inter, sans-serif';
    g.fillText(l.valor, L - 64, y + (altura - 10) / 2 + 2);
    g.textAlign = 'left';
  });

  // rodapé com as dicas, como nos menus de câmera
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.fillRect(0, A - 84, L, 84);
  g.fillStyle = 'rgba(232,238,247,0.75)';
  g.font = '400 30px Inter, sans-serif';
  g.fillText(`${info.totalFotos} fotos · Nikon D3200`, 44, A - 42);
  g.textAlign = 'right';
  g.fillText('OK ▸ fotografar', L - 44, A - 42);
  g.restore();
}

export async function montarCamera(tela: HTMLCanvasElement, fotoUrl?: string, info?: InfoDisplay): Promise<Camera3D> {
  await document.fonts?.ready;

  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.35;

  const olho = new THREE.PerspectiveCamera(FOV, 1, 0.05, 100);

  // Luz: principal suave, contorno laranja (como na referência) e contorno azul do site
  cena.add(new THREE.HemisphereLight(0xa9bbd6, 0x03060d, 0.32));
  const principal = new THREE.DirectionalLight(0xffffff, 1.6);
  principal.position.set(3, 5, 7);
  const laranja = new THREE.DirectionalLight(0xff8a5c, 4);
  laranja.position.set(-6, 3, -3);
  const azul = new THREE.DirectionalLight(0x2a64c8, 1.5);
  azul.position.set(6, -2, -2);
  const frontal = new THREE.DirectionalLight(0xffe2cc, 0.8);
  frontal.position.set(-2, 1, 6);
  cena.add(principal, laranja, azul, frontal);

  // ---------- materiais ----------
  const couro = ruido(256, 90);
  const corpo = new THREE.MeshStandardMaterial({ color: 0x1b1a1f, roughness: 0.6, metalness: 0.08, bumpMap: couro, bumpScale: 0.4 });
  const borracha = new THREE.MeshStandardMaterial({ color: 0x131216, roughness: 0.92, bumpMap: ruido(256, 160), bumpScale: 1.2 });
  const lenteMat = new THREE.MeshStandardMaterial({ color: 0x151418, roughness: 0.38, metalness: 0.35 });
  const ranhura = new THREE.MeshStandardMaterial({ color: 0x0f0e11, roughness: 0.75, metalness: 0.1 });
  const prata = new THREE.MeshStandardMaterial({ color: 0xd6d5dc, roughness: 0.22, metalness: 1 });
  const botao = new THREE.MeshStandardMaterial({ color: 0x2b2a31, roughness: 0.45, metalness: 0.2 });
  const brilho = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.12, metalness: 0.4 });
  const vermelho = new THREE.MeshStandardMaterial({ color: 0xd4202a, roughness: 0.35, emissive: 0x3a0508 });
  const vidro = new THREE.MeshPhysicalMaterial({
    color: 0x081329,
    roughness: 0.04,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 0.8,
    iridescenceIOR: 1.4,
    envMapIntensity: 3,
  });

  const modelo = new THREE.Group();
  cena.add(modelo);

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    modelo.add(m);
    return m;
  };
  const placa = (map: THREE.Texture, w: number, h: number, x: number, y: number, z: number, deCostas = false) => {
    const m = add(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }),
      x,
      y,
      z,
    );
    if (deCostas) m.rotation.y = Math.PI;
    return m;
  };
  const torneado = (pontos: [number, number][], mat: THREE.Material, segmentos = 96) => {
    const m = new THREE.Mesh(
      new THREE.LatheGeometry(pontos.map(([r, z]) => new THREE.Vector2(r, z)), segmentos),
      mat,
    );
    m.rotation.x = Math.PI / 2; // o eixo do torno (y) vira o eixo da lente (z)
    mat.side = THREE.DoubleSide; // o torno não precisa de "lado certo"
    return m;
  };

  // ---------- corpo ----------
  add(new RoundedBoxGeometry(W, H, D, 6, 0.22), corpo);

  // Pega (mão direita): sai para a frente, com borracha e o risco vermelho
  add(new RoundedBoxGeometry(1.2, H * 0.98, 0.95, 8, 0.3), borracha, -W / 2 + 0.62, -0.01, D / 2 + 0.12);
  const risco = new THREE.Shape();
  risco.moveTo(0, 0);
  risco.lineTo(0.5, 0.17);
  risco.lineTo(0.5, 0.23);
  risco.lineTo(0.1, 0.03);
  const riscoM = add(new THREE.ShapeGeometry(risco), vermelho, -W / 2 + 0.38, H / 2 - 0.42, D / 2 + 0.602);
  riscoM.rotation.y = -0.15;
  add(new THREE.CircleGeometry(0.07, 24), new THREE.MeshStandardMaterial({ color: 0x3a0d12, roughness: 0.2 }), -W / 2 + 0.66, H / 2 - 0.8, D / 2 + 0.6);

  // Apoio do polegar atrás
  add(new RoundedBoxGeometry(1.15, 0.7, 0.32, 4, 0.14), borracha, -W / 2 + 0.62, H / 2 - 0.42, -D / 2 - 0.02);

  // Prisma (o "morrinho" com o flash) e o logo
  const perfil = new THREE.Shape();
  perfil.moveTo(-0.88, 0);
  perfil.lineTo(0.88, 0);
  perfil.lineTo(0.5, 0.82);
  perfil.lineTo(-0.5, 0.82);
  perfil.closePath();
  const prismaGeo = new THREE.ExtrudeGeometry(perfil, { depth: 1, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.09, bevelSegments: 5 });
  prismaGeo.translate(0, 0, -0.5);
  add(prismaGeo, corpo, LX, H / 2 - 0.08, -0.12);
  placa(texto('Nikon', '800 118px Inter, sans-serif'), 1.0, 0.25, LX, H / 2 + 0.26, 0.49);
  add(new THREE.BoxGeometry(0.62, 0.05, 0.62), prata, LX, H / 2 + 0.86, -0.12); // sapata do flash

  // Ocular do visor, atrás do prisma
  add(new RoundedBoxGeometry(0.8, 0.6, 0.3, 4, 0.12), borracha, LX, H / 2 + 0.28, -0.72);
  add(new THREE.PlaneGeometry(0.46, 0.3), brilho, LX, H / 2 + 0.3, -0.875).rotation.y = Math.PI;

  // Frente: baioneta, luz de foco, botão da lente e o nome do modelo
  const baioneta = torneado([[0.9, 0], [1.08, 0], [1.08, 0.06], [1.02, 0.1], [0.9, 0.1]], prata);
  baioneta.position.set(LX, LY, D / 2 - 0.02);
  modelo.add(baioneta);
  const luzAf = add(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0xfff0cc, emissive: 0x6a4a18, roughness: 0.2 }), -W / 2 + 1.42, H / 2 - 0.42, D / 2);
  luzAf.rotation.x = Math.PI / 2;
  const soltaLente = add(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 32), botao, LX + 1.3, LY - 0.15, D / 2);
  soltaLente.rotation.x = Math.PI / 2;
  placa(texto('D3200', '500 72px Inter, sans-serif'), 0.6, 0.15, W / 2 - 0.55, H / 2 - 0.32, D / 2 + 0.006);

  // Alças da tira dos dois lados
  for (const lado of [-1, 1]) {
    const alca = add(new THREE.TorusGeometry(0.1, 0.03, 12, 24), prata, lado * (W / 2 + 0.02), H / 2 - 0.3, 0);
    alca.rotation.y = Math.PI / 2;
  }

  // ---------- topo ----------
  // Seletor de modos (as faces planas viram as ranhuras) com o AUTO verde
  const seletor = add(new THREE.CylinderGeometry(0.4, 0.42, 0.22, 40, 1), new THREE.MeshStandardMaterial({ color: 0x2c2b33, roughness: 0.5, metalness: 0.3, flatShading: true }), -1.2, H / 2 + 0.1, -0.2);
  const topoSeletor = placa(texto('AUTO  P  S  A  M', '700 46px Inter, sans-serif', 512, 128, '#58d07a'), 0.62, 0.15, -1.2, H / 2 + 0.215, -0.2);
  topoSeletor.rotation.x = -Math.PI / 2;
  void seletor;
  // Disparador com a chave liga/desliga em volta, em cima da pega
  add(new THREE.CylinderGeometry(0.17, 0.18, 0.08, 40), prata, -W / 2 + 0.62, H / 2 + 0.06, D / 2 + 0.28);
  const chave = add(new THREE.TorusGeometry(0.25, 0.05, 12, 40), botao, -W / 2 + 0.62, H / 2 + 0.03, D / 2 + 0.28);
  chave.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 24), vermelho, -W / 2 + 1.1, H / 2 + 0.02, D / 2 - 0.05);
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24), botao, -W / 2 + 1.35, H / 2 + 0.02, D / 2 - 0.05);

  // ---------- traseira ----------
  // Moldura e o display com o menu (desenhado num canvas que vira textura; virado para trás)
  add(new RoundedBoxGeometry(TELA.w + 0.2, TELA.h + 0.2, 0.05, 3, 0.06), brilho, TELA.x, TELA.y, -D / 2 - 0.01);
  const [telaMenu, g2d] = canvas(1024, 774);
  const texturaMenu = paraTextura(telaMenu);
  const display = add(new THREE.PlaneGeometry(TELA.w, TELA.h), new THREE.MeshBasicMaterial({ map: texturaMenu, toneMapped: false }), TELA.x, TELA.y, -D / 2 - 0.04);
  display.rotation.y = Math.PI;

  // A linha selecionada do menu vai descendo sozinha, como alguém navegando
  let fotoFundo: HTMLImageElement | undefined;
  let selecionada = 0;
  const redesenharMenu = () => {
    if (!info) return;
    desenharMenu(g2d, info, selecionada, fotoFundo);
    texturaMenu.needsUpdate = true;
  };
  redesenharMenu();
  if (info) {
    const linhas = info.ensaios.length + 2;
    setInterval(() => {
      selecionada = (selecionada + 1) % linhas;
      redesenharMenu();
    }, 1400);
  }
  if (fotoUrl) {
    const img = new Image();
    img.onload = () => {
      fotoFundo = img;
      redesenharMenu();
    };
    img.src = fotoUrl;
  }

  // Coluna de botões à esquerda do display (vista de trás)
  ['▶', 'MENU', '⊕', '⊖', 'i'].forEach((rotulo, i) => {
    const y = 0.55 - i * 0.33;
    add(new RoundedBoxGeometry(0.34, 0.2, 0.08, 2, 0.04), botao, W / 2 - 0.28, y, -D / 2 - 0.02);
    placa(texto(rotulo, '600 64px Inter, sans-serif', 256, 128), 0.26, 0.13, W / 2 - 0.28, y, -D / 2 - 0.065, true);
  });

  // Multisseletor com OK, lixeira, AE-L, Lv e a luz do cartão (lado direito, vista de trás)
  const multi = add(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 48), botao, -1.28, -0.15, -D / 2 - 0.03);
  multi.rotation.x = Math.PI / 2;
  const ok = add(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 32), corpo, -1.28, -0.15, -D / 2 - 0.05);
  ok.rotation.x = Math.PI / 2;
  placa(texto('OK', '600 60px Inter, sans-serif', 256, 128), 0.2, 0.1, -1.28, -0.15, -D / 2 - 0.101, true);
  const lixo = add(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 32), botao, -1.5, -0.95, -D / 2 - 0.03);
  lixo.rotation.x = Math.PI / 2;
  placa(lixeira(), 0.14, 0.14, -1.5, -0.95, -D / 2 - 0.066, true);
  add(new RoundedBoxGeometry(0.3, 0.18, 0.08, 2, 0.04), botao, -1.05, H / 2 - 0.42, -D / 2 - 0.19);
  placa(texto('AE-L', '600 56px Inter, sans-serif', 256, 128), 0.24, 0.12, -1.05, H / 2 - 0.42, -D / 2 - 0.235, true);
  add(new RoundedBoxGeometry(0.26, 0.18, 0.08, 2, 0.04), botao, -1.6, 0.35, -D / 2 - 0.02);
  placa(texto('Lv', '600 64px Inter, sans-serif', 256, 128), 0.2, 0.1, -1.6, 0.35, -D / 2 - 0.065, true);
  add(new THREE.SphereGeometry(0.035, 16, 16), new THREE.MeshBasicMaterial({ color: 0x58d07a }), -0.85, -1.0, -D / 2 - 0.01);

  // Roda de comando saindo no canto de cima atrás
  const roda = add(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 30), new THREE.MeshStandardMaterial({ color: 0x2a2930, roughness: 0.5, flatShading: true }), -1.4, H / 2 - 0.08, -D / 2 + 0.08);
  roda.rotation.z = Math.PI / 2;

  // ---------- lente 18-55 ----------
  const lente = new THREE.Group();
  lente.position.set(LX, LY, D / 2 + 0.06);
  modelo.add(lente);
  const noEixo = (m: THREE.Object3D) => (lente.add(m), m);

  // Corpo torneado: baioneta, degraus, anel de zoom, escala, anel de foco e a boca
  noEixo(
    torneado(
      [
        [0.9, 0],
        [0.96, 0.02],
        [0.97, 0.3],
        [0.94, 0.34],
        [0.94, 0.42],
        [0.92, 0.44],
        [0.92, 1.42],
        [0.95, 1.46],
        [0.95, 1.6],
        [0.9, 1.64],
        [0.9, 1.74],
        [0.94, 1.78],
        [0.94, 2.06],
        [0.9, 2.12],
        [0.86, 2.14],
        [0.64, 2.14],
        [0.62, 2.06],
      ],
      lenteMat,
    ),
  );
  // Filete branco da escala de zoom
  const filete = noEixo(torneado([[0.952, 1.5], [0.952, 1.52]], new THREE.MeshBasicMaterial({ color: 0xd9d6e0 })));
  void filete;

  // Ranhuras: dezenas de barrinhas em volta do anel (InstancedMesh = uma única chamada de desenho)
  const ranhuras = (qtd: number, raio: number, zIni: number, zFim: number, largura: number) => {
    const comprimento = zFim - zIni;
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, largura, comprimento), ranhura, qtd);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2;
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a);
      m.compose(new THREE.Vector3(Math.cos(a) * raio, Math.sin(a) * raio, zIni + comprimento / 2), q, e);
      inst.setMatrixAt(i, m);
    }
    lente.add(inst);
  };
  // anel de zoom largo, de borracha
  noEixo(torneado([[0.955, 0.5], [0.955, 1.36]], borracha));
  ranhuras(120, 0.965, 0.52, 1.34, 0.036);
  // anel de foco fino
  ranhuras(160, 0.95, 1.8, 2.02, 0.026);

  // Aro da frente com a escrita e o vidro abaulado
  const aro = new THREE.Mesh(
    new THREE.RingGeometry(0.64, 0.9, 96),
    new THREE.MeshStandardMaterial({ map: aroDaLente(), color: 0xffffff, roughness: 0.5, metalness: 0.1, transparent: true }),
  );
  aro.position.z = 2.141;
  noEixo(aro);
  const aroFundo = new THREE.Mesh(new THREE.RingGeometry(0.64, 0.86, 96), new THREE.MeshStandardMaterial({ color: 0x0c0b0e, roughness: 0.6 }));
  aroFundo.position.z = 2.1405;
  noEixo(aroFundo);
  // miolo escuro e anéis internos
  noEixo(torneado([[0.62, 2.06], [0.58, 1.95], [0.4, 1.9]], new THREE.MeshStandardMaterial({ color: 0x050407, roughness: 0.3 })));
  const R = 1.5;
  const abertura = Math.asin(0.6 / R);
  const lenteVidro = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 16, 0, Math.PI * 2, 0, abertura), vidro);
  lenteVidro.rotation.x = Math.PI / 2;
  lenteVidro.position.z = 2.02 - R * Math.cos(abertura);
  noEixo(lenteVidro);
  const reflexo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: 0x3d7fd6, transparent: true, opacity: 0.55 }));
  reflexo.position.z = 2.0;
  noEixo(reflexo);

  // ---------- movimento ----------
  const pose: Pose = { virar: 0, zoom: 0, foco: 0 };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const inicio = new THREE.Vector3();
  const olhar = new THREE.Vector3(0.1, 0.05, 0.6);
  const afMat = luzAf.material as THREE.MeshStandardMaterial;
  const reflexoMat = reflexo.material as THREE.MeshBasicMaterial;
  let tranco = 0; // 1 logo depois do disparo, cai para 0
  let largura = 1;
  let altura = 1;

  function redimensionar() {
    const caixa = tela.parentElement!.getBoundingClientRect();
    largura = Math.max(1, caixa.width);
    altura = Math.max(1, caixa.height);
    renderer.setSize(largura, altura, false);
    olho.aspect = largura / altura;
    olho.updateProjectionMatrix();
    // distância para a câmera inteira caber: ~46% da largura numa tela larga, 72% numa estreita
    // (na CameraCena o canvas ocupa só a metade esquerda, então costuma ser estreito)
    const fracao = olho.aspect < 1 || largura < 500 ? 0.72 : 0.46;
    const porLargura = 5.2 / fracao / (2 * TG * olho.aspect);
    const porAltura = 3.9 / 0.62 / (2 * TG);
    inicio.set(0, 0.9, Math.max(porLargura, porAltura));
  }

  const suave = (t: number) => t * t * (3 - 2 * t);

  function desenhar(tempo: number) {
    const v = suave(pose.virar);
    const z = suave(pose.zoom);
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
    tranco *= 0.88;

    // Começa de costas (display com o menu virado para quem chega) e vira até ficar de frente;
    // de frente, a câmera mira no mouse de verdade (segue o cursor como se enquadrasse você)
    const mira = 0.2 + v * 0.6;
    modelo.rotation.set(
      0.16 * (1 - v) + mouse.sy * 0.5 * mira - tranco * 0.06,
      (Math.PI - 0.28) * (1 - v) + mouse.sx * 0.9 * mira,
      0.03 * (1 - v),
    );
    modelo.position.y = Math.sin(tempo / 900) * 0.05 * (1 - z * 0.7);
    modelo.position.z = -tranco * 0.25;

    // Zoom: a lente estica (18 → 55 mm) e o anel gira; o foco gira o anel de novo
    lente.scale.z = 1 + z * 0.38;
    lente.rotation.z = z * 0.9 + suave(pose.foco) * 0.6;

    // Luz da frente acende no disparo e o reflexo da lente brilha ao focar
    afMat.emissive.setRGB(0.42 + tranco * 3, 0.29 + tranco * 2.5, 0.09 + tranco * 2);
    reflexoMat.opacity = 0.55 + pose.foco * 0.35 + tranco;

    // Câmera do three.js: perto do display enquanto está de costas (para ler o menu), se afasta
    // enquanto ela vira e volta a chegar perto com o zoom
    const pertoDisplay = (1 - v) * 0.3;
    olho.position.set(inicio.x - pertoDisplay * 1.2, inicio.y * (1 - z * 0.4) * (1 - pertoDisplay), inicio.z * (1 - z * 0.22) * (1 - pertoDisplay));
    olho.lookAt(olhar.x - pertoDisplay * 1.2, olhar.y - pertoDisplay * 0.5, olhar.z);
    modelo.updateMatrixWorld();
    renderer.render(cena, olho);
  }

  redimensionar();
  new ResizeObserver(redimensionar).observe(tela.parentElement!);
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  });

  // Só desenha enquanto a cena está na tela
  let visivel = true;
  new IntersectionObserver(([e]) => (visivel = e.isIntersecting)).observe(tela);
  renderer.setAnimationLoop((tempo) => visivel && desenhar(tempo));

  return {
    definir(nova) {
      Object.assign(pose, nova);
    },
    disparar() {
      tranco = 1;
    },
  };
}
