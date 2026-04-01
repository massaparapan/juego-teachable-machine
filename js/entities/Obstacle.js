// ============================================================
//  CLASE: Obstacle (Obstáculos – Zappers y Misiles)
//  Tipo 0 = zapper vertical (columna de electricidad)
//  Tipo 1 = misil horizontal
//
//  Ambos usan el spritesheet stage_hazard.png.
//  Fallback: formas primitivas si el sprite no está disponible.
// ============================================================
class Obstacle {
  constructor() {
    this.x    = ANCHO + 20;
    this.tipo = floor(random(2));  // 0 = zapper, 1 = misil

    if (this.tipo === 0) {
      // Zapper: la anchura se escala proporcionalmente al alto
      // El sprite natural mide 34×118px; usamos esa proporción.
      this.h = random(80, 200);
      this.w = 34 * (this.h / 118);   // ≈ 23–58 px
      this.y = random(TECHO + 10, SUELO - this.h - 10);
    } else {
      // Misil: frames recortados individuales (missile_0..3).
      this.escala = 0.95;
      // El cuerpo del misil se mantiene, solo cambia la llama (ancho a la derecha).
      this.w = 63 * this.escala;   // ancho máximo aprox (frame con más llama)
      this.h = 23 * this.escala;   // alto máximo aprox de frames recortados
      this.y = random(TECHO + 10, SUELO - this.h - 10);
    }

    this.vel       = VEL_MUNDO + random(0, 1.5);
    this.animFrame = 0;
    this._frameBase = floor(random(ZAPPER_TOTAL_FRAMES));

    // Aviso de sonido al spawnear
    if (this.tipo === 0) SoundManager.avisoLaser();
    else                 SoundManager.avisoMisil();
  }

  // ── Movimiento ──────────────────────────────────────────
  update() {
    this.x -= this.vel;
    this.animFrame++;
  }

  // ── Renderizado ─────────────────────────────────────────
  show() {
    if (this.tipo === 0) {
      this._dibujarZapper();
    } else {
      this._dibujarMisil();
    }
  }

  // ── Colisión AABB ────────────────────────────────────────
  // Propiedades requeridas por physics.js: x, y, w, h
  // (x e y son esquina superior-izquierda)

  // ── Zapper ──────────────────────────────────────────────
  _dibujarZapper() {
    // Parpadeo: recorre 3 frames del láser con ritmo más lento.
    let frame = (this._frameBase + floor(this.animFrame / 6)) % ZAPPER_TOTAL_FRAMES;
    let cx = this.x + this.w / 2;

    let dibujado = dibujarFrameZapper(frame, cx, this.y, this.h, this.w);
    if (!dibujado) this._dibujarZapperPrimitivo();
  }

  // ── Misil ────────────────────────────────────────────────
  _dibujarMisil() {
    // Recorre los 4 frames del misil con mayor fluidez.
    let frameIdx = floor(this.animFrame / 4) % 4;
    let cy = this.y + this.h / 2;

    // Sin ancho/alto forzado: respeta que algunos frames son más anchos
    // por la llama trasera y se vea natural la animación.
    let dibujado = dibujarFrameMisil(frameIdx, this.x, cy, this.escala);
    if (!dibujado) this._dibujarMisilPrimitivo();
  }

  // ── Fallbacks primitivos (idénticos al código original) ──

  _dibujarZapperPrimitivo() {
    let brillo = (this.animFrame % 10 < 5) ? 255 : 180;

    fill(255, 60, 0);
    stroke(255, 150, 0, brillo);
    strokeWeight(3);
    rect(this.x, this.y, this.w, this.h, 4);

    stroke(255, 255, 100, brillo);
    strokeWeight(2);
    line(this.x + this.w / 2, this.y + 5,
         this.x + this.w / 2, this.y + this.h - 5);

    noStroke();
    fill(255, 255, 50, brillo);
    let chY = this.y + random(this.h);
    ellipse(this.x + this.w / 2, chY, 6, 6);
  }

  _dibujarMisilPrimitivo() {
    fill(200, 50, 255);
    stroke(255, 100, 255);
    strokeWeight(2);
    rect(this.x + 15, this.y, this.w - 15, this.h, 4);

    noStroke();
    fill(255, 50, 200);
    triangle(
      this.x + 15, this.y,
      this.x + 15, this.y + this.h,
      this.x,      this.y + this.h / 2
    );

    fill(255, 150, 0, 200 - (this.animFrame % 20) * 5);
    triangle(
      this.x + this.w, this.y + 4,
      this.x + this.w, this.y + this.h - 4,
      this.x + this.w + random(15, 30), this.y + this.h / 2
    );

    fill(100, 255, 255, 180);
    noStroke();
    ellipse(this.x + 30, this.y + this.h / 2, 12, 10);
  }
}
