// ============================================================
//  CLASE: Obstacle (Obstáculos – Zappers y Misiles)
//  Tipo 0 = zapper vertical, Tipo 1 = misil horizontal
// ============================================================
class Obstacle {
  constructor() {
    // Los obstáculos aparecen en el borde derecho del canvas
    this.x = ANCHO + 20;

    // Tipo aleatorio: 0 = zapper, 1 = misil
    this.tipo = floor(random(2));

    if (this.tipo === 0) {
      // Zapper: barra vertical
      this.w = 20;
      this.h = random(80, 200);
      this.y = random(TECHO + 10, SUELO - this.h - 10);
    } else {
      // Misil: rectángulo horizontal
      this.w = 70;
      this.h = 25;
      this.y = random(TECHO + 10, SUELO - this.h - 10);
    }

    this.vel = VEL_MUNDO + random(0, 1.5); // velocidad con leve variación
    this.animFrame = 0;
  }

  // ── Movimiento: x = x - vel ──────────────────────────────
  update() {
    this.x -= this.vel;
    this.animFrame++;
  }

  // ── Renderizado con formas primitivas ─────────────────────
  show() {
    if (this.tipo === 0) {
      this._dibujarZapper();
    } else {
      this._dibujarMisil();
    }
  }

  // ── Zapper (barra eléctrica con efecto parpadeo) ──────────
  _dibujarZapper() {
    let brillo = (this.animFrame % 10 < 5) ? 255 : 180;

    // Cuerpo
    fill(255, 60, 0);
    stroke(255, 150, 0, brillo);
    strokeWeight(3);
    rect(this.x, this.y, this.w, this.h, 4);

    // Línea de energía central
    stroke(255, 255, 100, brillo);
    strokeWeight(2);
    line(this.x + this.w / 2, this.y + 5,
         this.x + this.w / 2, this.y + this.h - 5);

    // Chispa animada
    noStroke();
    fill(255, 255, 50, brillo);
    let chY = this.y + random(this.h);
    ellipse(this.x + this.w / 2, chY, 6, 6);
  }

  // ── Misil (con punta, llama trasera y ventana) ────────────
  _dibujarMisil() {
    // Cuerpo
    fill(200, 50, 255);
    stroke(255, 100, 255);
    strokeWeight(2);
    rect(this.x + 15, this.y, this.w - 15, this.h, 4);

    // Punta (triángulo)
    noStroke();
    fill(255, 50, 200);
    triangle(
      this.x + 15, this.y,
      this.x + 15, this.y + this.h,
      this.x,      this.y + this.h / 2
    );

    // Llama trasera
    fill(255, 150, 0, 200 - (this.animFrame % 20) * 5);
    triangle(
      this.x + this.w, this.y + 4,
      this.x + this.w, this.y + this.h - 4,
      this.x + this.w + random(15, 30), this.y + this.h / 2
    );

    // Ventana
    fill(100, 255, 255, 180);
    noStroke();
    ellipse(this.x + 30, this.y + this.h / 2, 12, 10);
  }
}
