// ============================================================
//  CLASE: Player (El jugador)
//  Controla posición, física y renderizado del personaje.
//  Usa fly.png y walking.png para animar el sprite.
//  Fallback: formas geométricas si los sprites no están listos.
// ============================================================
class Player {
  /**
   * @param {number} x - posición X fija (izquierda del hitbox)
   * @param {number} y - posición Y inicial (borde superior del hitbox)
   */
  constructor(x, y) {
    // Hitbox (usado por colisiones en physics.js)
    this.x  = x;
    this.y  = y;
    this.w  = 40;
    this.h  = 55;

    this.vy      = 0;       // velocidad vertical
    this.volando = false;   // ¿jetpack activo este frame?

    // ── Animación ─────────────────────────────────────────
    this._tick     = 0;     // contador global de frames
    this._seqIdx   = 0;     // índice dentro de la secuencia actual
    this._ANIM_SPD = 8;     // ticks por frame de animación

    // Secuencia ping-pong: 0→1→2→3→2→1→0→...
    this._seq = [0, 1, 2, 3, 2, 1];

    // Tamaños visuales fijos (evitan jitter entre frames con recortes distintos)
    this._walkW = 58;
    this._walkH = 66;
    this._flyW  = 60;
    this._flyH  = 64;

    // Ajuste fino de contacto con suelo (positivo = más abajo)
    this._ajustePieSuelo = 1;
  }

  // ── Activar jetpack ──────────────────────────────────────
  volar() {
    this.vy -= FUERZA_JETPACK;
    this.volando = true;
    this.emitirParticulas();
  }

  // ── Física + animación por frame ─────────────────────────
  update() {
    // Física
    this.vy += GRAVEDAD;
    this.vy  = constrain(this.vy, -VEL_MAXIMA, VEL_MAXIMA);
    this.y  += this.vy;

    // Límites verticales
    if (this.y + this.h >= SUELO) { this.y = SUELO - this.h; this.vy = 0; }
    if (this.y <= TECHO)          { this.y = TECHO;           this.vy = 0; }

    // Avanzar frame de animación
    this._tick++;
    if (this._tick >= this._ANIM_SPD) {
      this._tick   = 0;
      this._seqIdx = (this._seqIdx + 1) % this._seq.length;
    }

    // Resetear flag (se vuelve a poner en true si volar() es llamado)
    this.volando = false;
  }

  // ── Renderizado ──────────────────────────────────────────
  show() {
    let cx = this.x + this.w / 2;
    let cy = this.y + this.h / 2;
    let pieY = this.y + this.h;
    let frame = this._seq[this._seqIdx];

    // Elegir entre sprite de vuelo o caminata
    // "volando" ya fue reseteado en update(), así que usamos la velocidad:
    // vy < -0.5 → subiendo (jetpack) | vy > 1 → cayendo | cerca del suelo → caminando
    let enSuelo = (this.y + this.h >= SUELO - 4);

    let dibujado = false;
    if (!enSuelo) {
      dibujado = dibujarFrameFlyAnclado(frame, cx, pieY, this._flyW, this._flyH);
    } else {
      dibujado = dibujarFrameWalkAnclado(
        frame,
        cx,
        pieY + this._ajustePieSuelo,
        this._walkW,
        this._walkH
      );
    }

    // Fallback a primitivas si el sprite no cargó
    if (!dibujado) {
      this._dibujarPrimitivo(cx, cy);
    }
  }

  // ── Partículas del jetpack ────────────────────────────────
  emitirParticulas() {
    // Posición del escape del jetpack (detrás y debajo del jugador)
    for (let i = 0; i < 3; i++) {
      particulas.push(new Particula(this.x + 5, this.y + this.h - 10));
    }
  }

  // ── Fallback primitivo (diseño original) ─────────────────
  _dibujarPrimitivo(cx, cy) {
    noStroke();
    fill(0, 200, 255, 20);
    ellipse(cx, cy, this.w + 30, this.h + 30);

    fill(0, 180, 255);
    stroke(0, 230, 255);
    strokeWeight(2);
    rect(this.x + 4, this.y + 5, this.w - 8, this.h - 10, 8);

    fill(0, 220, 255);
    stroke(0, 255, 255);
    strokeWeight(1);
    ellipse(cx - 2, this.y + 4, 26, 26);

    fill(255, 200, 50, 200);
    noStroke();
    ellipse(cx - 2, this.y + 2, 14, 10);

    fill(80, 80, 120);
    stroke(120, 120, 200);
    strokeWeight(1);
    rect(this.x - 14, this.y + 10, 18, 30, 4);

    if (this.vy < 0) {
      noStroke();
      fill(255, 120, 0, 200);
      triangle(
        this.x - 16, this.y + 35,
        this.x - 5,  this.y + 35,
        this.x - 10, this.y + 35 + random(8, 20)
      );
    }
  }
}
