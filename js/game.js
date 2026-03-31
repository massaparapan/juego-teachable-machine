// ============================================================
//  GAME LOOP – Setup, Draw, Lógica principal y Entrada
//  Este archivo orquesta todo el juego usando p5.js.
// ============================================================

// ── FUNCIÓN PÚBLICA – llamada por el botón HTML ─────────────
function iniciarJuego() {
  document.getElementById('instrucciones').classList.add('oculto');
  juegoIniciado = true;
}

// ============================================================
//  SETUP – se ejecuta UNA VEZ al cargar la página
// ============================================================
function setup() {
  let canvas = createCanvas(ANCHO, ALTO);
  canvas.parent(document.body);

  textFont('Courier New');

  // ── Cámara ──────────────────────────────────────────────
  // createCapture(VIDEO) activa la cámara del usuario.
  // La ocultamos del DOM porque la dibujamos en p5.
  captura = createCapture(VIDEO, () => {
    console.log('✅ Cámara lista');
    cargarModelo(); // arrancamos el modelo cuando la cámara está lista
  });
  captura.size(224, 224); // tamaño esperado por Teachable Machine
  captura.hide();

  // ── Fondo Parallax ──────────────────────────────────────
  inicializarParallax();

  // ── Jugador ─────────────────────────────────────────────
  jugador = new Player(120, ALTO / 2);
}

// ============================================================
//  DRAW – se ejecuta ~60 veces/seg (el "game loop")
//
//  Flujo:
//    1. Fondo + parallax
//    2. Suelo y techo
//    3. Lógica según estado (esperando / jugando / gameOver)
//    4. HUD (puntaje y distancia)
//    5. Visor de cámara
// ============================================================
function draw() {
  background(10, 10, 20);

  dibujarParallax();
  dibujarAmbiente();

  if (estado === 'jugando') {
    actualizarJuego();
  } else if (estado === 'gameOver') {
    mostrarGameOver();
  } else {
    mostrarCarga();
  }

  if (estado === 'jugando' || estado === 'gameOver') {
    dibujarHUD();
  }

  mostrarCamara();
}

// ============================================================
//  ACTUALIZAR JUEGO – lógica principal por frame
// ============================================================
function actualizarJuego() {

  // ── Interpretar etiqueta del modelo ─────────────────────
  if (modeloCargado && confianzaActual > 0.6) {
    if (etiquetaActual === 'Abierta') {
      jugador.volar();
    }
    // 'Cerrada' o cualquier otra → cae por gravedad
  }

  // ── Spawn de obstáculos ──────────────────────────────────
  if (frameCount % INTERVALO_OBSTACULO === 0) {
    obstaculos.push(new Obstacle());
  }

  // ── Spawn de monedas ─────────────────────────────────────
  if (frameCount % INTERVALO_MONEDA === 0) {
    monedas.push(new Coin());
  }

  // ── Partículas del jetpack ───────────────────────────────
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].update();
    particulas[i].show();
    if (particulas[i].muerta()) particulas.splice(i, 1);
  }

  // ── Jugador ──────────────────────────────────────────────
  jugador.update();
  jugador.show();

  // ── Obstáculos ───────────────────────────────────────────
  for (let i = obstaculos.length - 1; i >= 0; i--) {
    obstaculos[i].update();
    obstaculos[i].show();

    if (colisionAABB(jugador, obstaculos[i])) {
      activarGameOver();
      return;
    }

    if (obstaculos[i].x < -obstaculos[i].w) {
      obstaculos.splice(i, 1);
    }
  }

  // ── Monedas ──────────────────────────────────────────────
  for (let i = monedas.length - 1; i >= 0; i--) {
    monedas[i].update();
    monedas[i].show();

    if (colisionCircular(jugador, monedas[i])) {
      puntaje += 10;
      monedas.splice(i, 1);
      continue;
    }

    if (monedas[i].x < -20) {
      monedas.splice(i, 1);
    }
  }

  // ── Puntaje por supervivencia (1 punto cada 30 frames) ──
  if (frameCount % 30 === 0) {
    puntaje += 1;
  }
}

// ============================================================
//  GAME OVER Y REINICIO
// ============================================================
function activarGameOver() {
  estado = 'gameOver';
}

function reiniciar() {
  puntaje    = 0;
  obstaculos = [];
  monedas    = [];
  particulas = [];
  jugador    = new Player(120, ALTO / 2);
  frameInicio = frameCount;
  estado     = 'jugando';
  inicializarParallax();
}

// ============================================================
//  ENTRADA DE TECLADO
// ============================================================
function keyPressed() {
  // R → reiniciar partida
  if (key === 'r' || key === 'R') {
    reiniciar();
  }
  // Espacio → control manual de respaldo (para pruebas sin modelo)
  if (key === ' ') {
    if (estado === 'jugando') jugador.volar();
  }
}

function keyReleased() {
  // Extensible: agregar lógica al soltar teclas si es necesario
}
