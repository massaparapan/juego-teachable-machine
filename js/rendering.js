// ============================================================
//  RENDERIZADO – Parallax, Ambiente, HUD, Cámara, UI
//  Todas las funciones de dibujo que no pertenecen a entidades.
// ============================================================

// ── FONDO PARALLAX ──────────────────────────────────────────
// Cada "capa" tiene rectángulos que se mueven a diferentes
// velocidades para simular profundidad.
// Capas más lejanas → más lentas y oscuras.
// ─────────────────────────────────────────────────────────────

let imgBgFar = null;
let imgBgNearUp = null;
let imgBgNearFloor = null;
let fondosParallaxListos = false;

let _bgOffsetFar = 0;
let _bgOffsetNearUp = 0;
let _bgOffsetNearFloor = 0;

function cargarFondosParallax() {
  imgBgFar = loadImage('assets/bg_far.png');
  imgBgNearUp = loadImage('assets/bg_near_up.png');
  imgBgNearFloor = loadImage('assets/bg_near_floor.png');
}

function _fondosValidos() {
  return (
    imgBgFar && imgBgFar.width > 0 &&
    imgBgNearUp && imgBgNearUp.width > 0 &&
    imgBgNearFloor && imgBgNearFloor.width > 0
  );
}

function _dibujarCapaTileHorizontal(img, offsetX) {
  const escala = ALTO / img.height;
  const dw = img.width * escala;
  const dh = ALTO;

  // Evita overflow numérico tras largas sesiones.
  if (offsetX <= -dw) offsetX += dw;
  if (offsetX > 0) offsetX -= dw;

  imageMode(CORNER);
  image(img, offsetX, 0, dw, dh);
  image(img, offsetX + dw, 0, dw, dh);

  return offsetX;
}

function _dibujarCapaTileHorizontalEnY(img, offsetX, y, hObjetivo) {
  const escala = hObjetivo / img.height;
  const dw = img.width * escala;
  const dh = hObjetivo;

  if (offsetX <= -dw) offsetX += dw;
  if (offsetX > 0) offsetX -= dw;

  imageMode(CORNER);
  image(img, offsetX, y, dw, dh);
  image(img, offsetX + dw, y, dw, dh);

  return offsetX;
}

/**
 * Inicializa las 3 capas del parallax con objetos de fondo.
 */
function inicializarParallax() {
  fondosParallaxListos = _fondosValidos();
  _bgOffsetFar = 0;
  _bgOffsetNearUp = 0;
  _bgOffsetNearFloor = 0;

  if (fondosParallaxListos) {
    capas = [];
    return;
  }

  capas = [
    // Capa 0 – lejana (estrellas/puntos)
    { velocidad: 0.3, objetos: crearObjetosBack(40, 2, 4,  [20, 20, 60]) },
    // Capa 1 – media (estructuras lejanas)
    { velocidad: 1.2, objetos: crearObjetosBack(15, 30, 60, [10, 20, 50]) },
    // Capa 2 – cercana (estructuras frontales)
    { velocidad: 2.5, objetos: crearObjetosBack(8,  50, 100, [0, 30, 70]) }
  ];
}

/**
 * Crea objetos de fondo con posiciones aleatorias.
 * @param {number} cantidad - cuántos objetos crear
 * @param {number} minH     - altura mínima del objeto
 * @param {number} maxH     - altura máxima del objeto
 * @param {number[]} col    - color RGB base [r, g, b]
 */
function crearObjetosBack(cantidad, minH, maxH, col) {
  let lista = [];
  for (let i = 0; i < cantidad; i++) {
    lista.push({
      x: random(ANCHO),
      y: random(TECHO, SUELO - maxH),
      w: random(10, 40),
      h: random(minH, maxH),
      col: col
    });
  }
  return lista;
}

/**
 * Dibuja y mueve todas las capas del parallax.
 */
function dibujarParallax() {
  if (_fondosValidos()) {
    fondosParallaxListos = true;

    // Velocidades calibradas para que se sienta "runner" estilo Jetpack.
    _bgOffsetFar -= VEL_MUNDO * 0.22;
    _bgOffsetNearUp -= VEL_MUNDO * 0.62;
    _bgOffsetNearFloor -= VEL_MUNDO * 0.9;

    _bgOffsetFar = _dibujarCapaTileHorizontal(imgBgFar, _bgOffsetFar);

    // Franja superior e inferior recortadas para reforzar techo/suelo.
    const hUp = ALTO * (imgBgNearUp.height / imgBgFar.height);
    const hFloor = ALTO * (imgBgNearFloor.height / imgBgFar.height);

    _bgOffsetNearUp = _dibujarCapaTileHorizontalEnY(
      imgBgNearUp,
      _bgOffsetNearUp,
      0,
      hUp
    );

    _bgOffsetNearFloor = _dibujarCapaTileHorizontalEnY(
      imgBgNearFloor,
      _bgOffsetNearFloor,
      ALTO - hFloor,
      hFloor
    );
    return;
  }

  for (let capa of capas) {
    for (let obj of capa.objetos) {
      obj.x -= capa.velocidad;

      // Reaparece por la derecha al salir por la izquierda
      if (obj.x + obj.w < 0) {
        obj.x = ANCHO + random(50);
        obj.y = random(TECHO, SUELO - obj.h);
      }

      noStroke();
      fill(obj.col[0], obj.col[1], obj.col[2], 140);
      rect(obj.x, obj.y, obj.w, obj.h, 2);
    }
  }
}

// ── AMBIENTE (suelo, techo, líneas neón) ────────────────────

function dibujarAmbiente() {
  if (fondosParallaxListos) {
    // Con fondos ilustrados, solo marcamos límites suaves para lectura visual.
    stroke(120, 190, 255, 45);
    strokeWeight(1);
    line(0, SUELO, ANCHO, SUELO);
    line(0, TECHO, ANCHO, TECHO);
    noStroke();
    return;
  }

  // Suelo
  fill(20, 40, 80);
  noStroke();
  rect(0, SUELO, ANCHO, ALTO - SUELO);

  // Línea neón del suelo
  stroke(0, 180, 255);
  strokeWeight(2);
  line(0, SUELO, ANCHO, SUELO);

  // Techo
  fill(10, 20, 50);
  noStroke();
  rect(0, 0, ANCHO, TECHO);

  // Línea neón del techo
  stroke(0, 180, 255, 180);
  strokeWeight(1);
  line(0, TECHO, ANCHO, TECHO);
}

// ── HUD (Heads Up Display – puntaje y distancia) ────────────

function dibujarHUD() {
  let distancia = floor((frameCount - frameInicio) / 30);

  textAlign(LEFT, TOP);
  noStroke();

  // Sombra para legibilidad
  fill(0, 0, 0, 120);
  textSize(20);
  text(`⭐ ${puntaje}`, ANCHO - 148, 18);
  text(`📏 ${distancia}m`,  ANCHO - 148, 45);

  // Texto principal
  fill(255, 230, 50);
  textSize(20);
  text(`⭐ ${puntaje}`, ANCHO - 150, 16);

  fill(100, 200, 255);
  text(`📏 ${distancia}m`, ANCHO - 150, 44);

  // Badge de modo activo (esquina superior izquierda)
  textSize(13);
  fill(MODO_PRUEBA ? color(255, 210, 0) : color(0, 255, 150));
  text(MODO_PRUEBA ? '🕹️ PRUEBA (ESPACIO)' : '🤖 TEACHABLE ML', 16, 16);
}

// ── VISOR DE CÁMARA (esquina inferior derecha, espejo) ──────

function mostrarCamara() {
  if (!captura) return;

  const CW = 180; // ancho del visor
  const CH = 135; // alto del visor
  const PX = ANCHO - CW - 16;
  const PY = ALTO  - CH - 50;

  // Marco decorativo
  stroke(0, 255, 200);
  strokeWeight(2);
  noFill();
  rect(PX - 2, PY - 2, CW + 4, CH + 4, 6);

  // Efecto espejo: translate + scale(-1,1) invierte el eje X
  push();
  translate(PX + CW, PY);
  scale(-1, 1);
  image(captura, 0, 0, CW, CH);
  pop();

  // Etiqueta de debug – estado del modelo
  noStroke();
  fill(0, 0, 0, 150);
  rect(PX - 2, PY + CH + 2, CW + 4, 42, 4);

  textAlign(CENTER, TOP);
  textSize(13);
  fill(0, 255, 150);
  text(`🤖 ${etiquetaActual}`, PX + CW / 2, PY + CH + 6);

  textSize(11);
  fill(180, 180, 255);
  let porcentaje = nf(confianzaActual * 100, 1, 1);
  text(`Confianza: ${porcentaje}%`, PX + CW / 2, PY + CH + 24);
}

// ── PANTALLA DE GAME OVER ───────────────────────────────────

function mostrarGameOver() {
  // Mundo congelado
  jugador.show();
  for (let o of obstaculos) o.show();
  for (let m of monedas)    m.show();

  // Overlay semitransparente
  fill(0, 0, 0, 160);
  noStroke();
  rect(0, 0, ANCHO, ALTO);

  // Texto neón
  textAlign(CENTER, CENTER);

  // Sombra
  fill(255, 0, 60, 100);
  textSize(72);
  text('GAME OVER', ANCHO / 2 + 3, ALTO / 2 - 50 + 3);

  // Texto principal
  fill(255, 60, 100);
  textSize(72);
  text('GAME OVER', ANCHO / 2, ALTO / 2 - 50);

  // Puntaje
  textSize(22);
  fill(255, 220, 100);
  text(`Puntaje: ${puntaje}`, ANCHO / 2, ALTO / 2 + 20);

  // Instrucción de reinicio
  textSize(16);
  fill(180, 180, 255);
  text('Presiona R para reiniciar', ANCHO / 2, ALTO / 2 + 60);
}

// ── PANTALLA DE CARGA (mientras el modelo carga) ────────────

function mostrarCarga() {
  textAlign(CENTER, CENTER);

  if (!juegoIniciado) {
    textSize(18);
    fill(100, 255, 200);
    text('Presiona INICIAR JUEGO', ANCHO / 2, ALTO / 2);
    return;
  }

  if (MODO_PRUEBA) {
    // Sin modelo que esperar → arrancar de inmediato
    estado = 'jugando';
    frameInicio = frameCount;
    return;
  }

  if (!modeloCargado) {
    // Animación de puntos
    let puntos = '.'.repeat((frameCount % 60 < 20) ? 1 : (frameCount % 60 < 40) ? 2 : 3);
    textSize(20);
    fill(100, 220, 255);
    text(`Cargando modelo${puntos}`, ANCHO / 2, ALTO / 2 - 20);

    textSize(14);
    fill(160, 160, 200);
    text('(se necesita conexión a internet y la URL del modelo)', ANCHO / 2, ALTO / 2 + 20);
  } else {
    // Modelo listo → iniciar
    estado      = 'jugando';
    frameInicio = frameCount;
  }
}
