// ============================================================
//  SPRITES – Carga y coordenadas de todos los spritesheets
//
//  Archivos en /assets/:
//    coins.png   → 300×208  – 4 frames de moneda rotando (fila superior)
//    laser.png   → 113×124  – zapper: frame único (x=0..33) y doble (x=38..109)
//    missile.png → 225×45   – 4 frames de misil (62+40+62+40 px de ancho)
//    fly.png     → 548×133  – 4 frames del personaje volando
//    walking.png → 548×133  – 4 frames del personaje caminando
// ============================================================

let imgCoins   = null;
let imgLaser   = null;
let imgMissileFrames = [null, null, null, null];
let imgFly     = null;
let imgWalk    = null;

let spritesListos = false;
let _spritesLoaded = 0;
const _TOTAL_SPRITES = 8;

function _onSpriteLoad() {
  _spritesLoaded++;
  if (_spritesLoaded >= _TOTAL_SPRITES) spritesListos = true;
}

function _safeFrameIndex(frame, total) {
  return constrain(floor(frame), 0, total - 1);
}

/** Llamar desde preload() de p5.js */
function cargarSprites() {
  spritesListos = false;
  _spritesLoaded = 0;

  imgCoins   = loadImage('assets/coins.png',   _onSpriteLoad);
  imgLaser   = loadImage('assets/laser.png',   _onSpriteLoad);
  imgMissileFrames[0] = loadImage('assets/missile_0.png', _onSpriteLoad);
  imgMissileFrames[1] = loadImage('assets/missile_1.png', _onSpriteLoad);
  imgMissileFrames[2] = loadImage('assets/missile_2.png', _onSpriteLoad);
  imgMissileFrames[3] = loadImage('assets/missile_3.png', _onSpriteLoad);
  imgFly     = loadImage('assets/fly.png',     _onSpriteLoad);
  imgWalk    = loadImage('assets/walking.png', _onSpriteLoad);
}

// ============================================================
//  MONEDAS  (coins.png – 300×208)
//  Fila superior y=9..98: 4 frames de rotación
//    0: x=5..95   (90×90) – frente completo
//    1: x=108..177 (70×90) – diagonal
//    2: x=192..211 (20×90) – canto
//    3: x=224..293 (70×90) – diagonal otro lado
// ============================================================
const COIN_SHEET = [
  [5,   9, 90, 90],
  [108, 9, 70, 90],
  [192, 9, 20, 90],
  [224, 9, 70, 90],
];

/**
 * Dibuja frame de moneda centrado en (cx, cy).
 * escala 0.38 → ~34px de alto
 */
function dibujarFrameMoneda(frame, cx, cy, escala = 0.38) {
  if (!spritesListos) return false;
  frame = _safeFrameIndex(frame, COIN_SHEET.length);
  let [sx, sy, sw, sh] = COIN_SHEET[frame];
  imageMode(CENTER);
  image(imgCoins, cx, cy, sw * escala, sh * escala, sx, sy, sw, sh);
  imageMode(CORNER);
  return true;
}

// ============================================================
//  LASER / ZAPPER  (laser.png – 113×124)
//  3 frames verticales del mismo zapper (parpadeo):
//    0: x=0,  y=3, w=34, h=118
//    1: x=38, y=3, w=34, h=118
//    2: x=76, y=3, w=34, h=118
//  Se escala verticalmente para llenar la altura del obstáculo.
// ============================================================
const LASER_SX = 0;
const LASER_SY = 3;
const LASER_SW = 34;
const LASER_SH = 118;
const ZAPPER_TOTAL_FRAMES = 3;
const ZAPPER_SHEET = [
  [0,  3, 34, 118],
  [38, 3, 34, 118],
  [76, 3, 34, 118],
];

/**
 * Dibuja el zapper con la parte superior en (cx, ty).
 * Se escala para que mida exactamente alturaObst px de alto.
 */
function dibujarLaser(cx, ty, alturaObst) {
  if (!spritesListos) return false;
  let escH  = alturaObst / LASER_SH;
  let dw    = LASER_SW * escH;
  imageMode(CORNER);
  image(imgLaser,
        cx - dw / 2, ty, dw, alturaObst,
        LASER_SX, LASER_SY, LASER_SW, LASER_SH);
  return true;
}

/** API compatible con Obstacle.js */
function dibujarFrameZapper(frame, cx, ty, alturaObst, anchoObst = null) {
  if (!spritesListos) return false;

  // Recorremos los 3 frames reales del sheet.
  let idx = floor(frame) % ZAPPER_TOTAL_FRAMES;
  if (idx < 0) idx += ZAPPER_SHEET.length;
  let [sx, sy, sw, sh] = ZAPPER_SHEET[idx];

  let escH = alturaObst / sh;
  let dw = (anchoObst != null) ? anchoObst : sw * escH;

  // Pulso de brillo adicional para dar sensación eléctrica.
  let brillo = 220 + idx * 16;

  push();
  tint(255, brillo);
  imageMode(CORNER);
  image(imgLaser,
        cx - dw / 2, ty, dw, alturaObst,
        sx, sy, sw, sh);
  noTint();
  pop();

  return true;
}

// ============================================================
//  MISIL  (missile.png – 225×45)
//  4 frames en fila: llama grande | cuerpo | llama grande | cuerpo
//    Frame 0: x=1,   y=0, w=62, h=45
//    Frame 1: x=66,  y=0, w=40, h=45
//    Frame 2: x=109, y=0, w=62, h=45
//    Frame 3: x=176, y=0, w=40, h=45
//  El sprite apunta a la IZQUIERDA (punta al frente, llama atrás).
//  En el juego viaja de derecha a izquierda, por lo que NO se espeja.
// ============================================================
const MISIL_FRAME_ORDER = [0, 1, 2, 3];

/**
 * Dibuja el misil en orientación original (punta a la izquierda).
 * @param {number} frame  – 0..3
 * @param {number} lx     – borde izquierdo del obstáculo en canvas
 * @param {number} cy     – centro Y del obstáculo
 * @param {number} escala – factor de escala (default 1)
 */
function dibujarMisil(frame, lx, cy, escala = 1, anchoForzado = null, altoForzado = null) {
  if (!spritesListos) return false;
  frame = _safeFrameIndex(frame, MISIL_FRAME_ORDER.length);

  let img = imgMissileFrames[MISIL_FRAME_ORDER[frame]];
  if (!img) return false;

  let sw = img.width;
  let sh = img.height;
  let dw = (anchoForzado != null) ? anchoForzado : sw * escala;
  let dh = (altoForzado != null) ? altoForzado : sh * escala;
  push();
    // No espejamos: el sprite ya apunta a la izquierda.
    // Como el misil viene desde la derecha hacia la izquierda,
    // la orientación original es correcta.
    imageMode(CORNER);
    image(img, lx, cy - dh / 2, dw, dh);
  pop();
  return true;
}

/** API compatible con Obstacle.js */
function dibujarFrameMisil(frame, lx, cy, escala = 1, anchoForzado = null, altoForzado = null) {
  return dibujarMisil(frame, lx, cy, escala, anchoForzado, altoForzado);
}

// ============================================================
//  JUGADOR – VOLANDO  (fly.png – 548×133)
//  4 frames, el personaje mira a la izquierda → espejamos.
//    Frame 0: x=17,  y=4, w=113, h=124
//    Frame 1: x=154, y=4, w=113, h=124
//    Frame 2: x=290, y=4, w=120, h=124
//    Frame 3: x=426, y=4, w=119, h=124
// ============================================================
const FLY_SHEET = [
  [17,  4, 113, 124],
  [154, 4, 113, 124],
  [290, 4, 120, 124],
  [426, 4, 119, 124],
];

/**
 * Dibuja frame de vuelo centrado en (cx, cy), espejado para mirar derecha.
 * escala 0.55 → ~68px de alto
 */
function dibujarFrameFly(frame, cx, cy, escala = 0.55) {
  if (!spritesListos) return false;
  frame = _safeFrameIndex(frame, FLY_SHEET.length);
  let [sx, sy, sw, sh] = FLY_SHEET[frame];
  let dw = sw * escala;
  let dh = sh * escala;
  push();
    translate(cx, cy);
    scale(-1, 1);          // espejo: personaje mira a la derecha
    imageMode(CENTER);
    image(imgFly, 0, 0, dw, dh, sx, sy, sw, sh);
  pop();
  return true;
}

/**
 * Dibuja un frame del jugador anclado por pies para evitar micro-jitter
 * entre frames con bounding boxes ligeramente distintas.
 */
function _dibujarFrameJugadorAnclado(img, sheet, frame, cx, pieY, ancho, alto) {
  if (!spritesListos) return false;

  frame = _safeFrameIndex(frame, sheet.length);
  let [sx, sy, sw, sh] = sheet[frame];

  push();
    // Anclamos la base del sprite a pieY y mantenemos tamaño fijo.
    translate(cx, pieY - alto / 2);
    imageMode(CENTER);
    image(img, 0, 0, ancho, alto, sx, sy, sw, sh);
  pop();

  return true;
}

function dibujarFrameFlyAnclado(frame, cx, pieY, ancho = 60, alto = 64) {
  return _dibujarFrameJugadorAnclado(imgFly, FLY_SHEET, frame, cx, pieY, ancho, alto);
}

// ============================================================
//  JUGADOR – CAMINANDO  (walking.png – 548×133)
//  4 frames, mismo layout que fly.png
//    Frame 0: x=5,   y=1, w=109, h=132
//    Frame 1: x=142, y=1, w=109, h=132
//    Frame 2: x=281, y=1, w=110, h=132
//    Frame 3: x=416, y=1, w=117, h=132
// ============================================================
const WALK_SHEET = [
  [5,   1, 109, 132],
  [142, 1, 109, 132],
  [281, 1, 110, 132],
  [416, 1, 117, 132],
];

/**
 * Dibuja frame de caminata centrado en (cx, cy), espejado para mirar derecha.
 * escala 0.55 → ~73px de alto
 */
function dibujarFrameWalk(frame, cx, cy, escala = 0.55) {
  if (!spritesListos) return false;
  frame = _safeFrameIndex(frame, WALK_SHEET.length);
  let [sx, sy, sw, sh] = WALK_SHEET[frame];
  let dw = sw * escala;
  let dh = sh * escala;
  push();
    translate(cx, cy);
    scale(-1, 1);          // espejo: personaje mira a la derecha
    imageMode(CENTER);
    image(imgWalk, 0, 0, dw, dh, sx, sy, sw, sh);
  pop();
  return true;
}

function dibujarFrameWalkAnclado(frame, cx, pieY, ancho = 58, alto = 66) {
  return _dibujarFrameJugadorAnclado(imgWalk, WALK_SHEET, frame, cx, pieY, ancho, alto);
}
