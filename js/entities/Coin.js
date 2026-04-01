// ============================================================
//  CLASE: Coin (Monedas coleccionables)
//  Usan el spritesheet coins.png con 4 frames de rotación.
//  La secuencia 0→1→2→3→2→1→0→... simula un giro completo.
//  Fallback: formas primitivas si el sprite no está disponible.
// ============================================================
class Coin {
  constructor() {
    this.x      = ANCHO + 10;
    this.y      = random(TECHO + 30, SUELO - 30);
    this.radio  = 13;        // radio para colisión circular (px)
    this.vel    = VEL_MUNDO;
    this.tick   = 0;         // contador de frames para animación
    this.frameIdx = 0;       // frame actual del spritesheet
    this.escala   = 0.38;    // escala del sprite (90px × 0.38 ≈ 34px de alto)

    // Secuencia de frames: 0 1 2 3 2 1 0 1 2 3 2 1 ...
    // (ping-pong de la animación de giro)
    this._seq = [0, 1, 2, 3, 2, 1];
    this._seqIdx = 0;
  }

  // ── Movimiento + avance de animación ─────────────────────
  update() {
    this.x -= this.vel;

    // Avanzar frame cada 5 ticks (~12fps a 60fps)
    this.tick++;
    if (this.tick >= 5) {
      this.tick = 0;
      this._seqIdx = (this._seqIdx + 1) % this._seq.length;
      this.frameIdx = this._seq[this._seqIdx];
    }
  }

  // ── Renderizado ──────────────────────────────────────────
  show() {
    let dibujado = dibujarFrameMoneda(this.frameIdx, this.x, this.y, this.escala);

    if (!dibujado) {
      // Fallback a la animación original con primitivas
      let escalaX = abs(sin(this._seqIdx * PI / 3));
      this._dibujarPrimitivo(escalaX);
    }
  }

  // ── Fallback primitivo ───────────────────────────────────
  _dibujarPrimitivo(escalaX) {
    let anchoVisible = this.radio * 2 * escalaX;

    noStroke();
    fill(255, 220, 0, 50);
    ellipse(this.x, this.y, (this.radio + 8) * 2, (this.radio + 8) * 2);

    fill(255, 210, 0);
    stroke(255, 240, 100);
    strokeWeight(2);
    ellipse(this.x, this.y, anchoVisible + 2, this.radio * 2 + 2);

    noStroke();
    fill(255, 255, 150);
    ellipse(this.x, this.y, anchoVisible * 0.6, this.radio * 1.2);

    if (escalaX > 0.5) {
      fill(200, 120, 0);
      textAlign(CENTER, CENTER);
      textSize(12);
      noStroke();
      text('$', this.x, this.y);
    }
  }
}
