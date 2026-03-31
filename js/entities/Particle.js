// ============================================================
//  CLASE: Particula (Efectos visuales del jetpack)
//  Se emite desde la boca del jetpack y desaparece gradualmente.
// ============================================================
class Particula {
  /**
   * @param {number} x - posición X inicial (boca del jetpack)
   * @param {number} y - posición Y inicial
   */
  constructor(x, y) {
    this.x    = x + random(-4, 4);
    this.y    = y + random(-2, 2);
    this.vx   = random(-3, -1); // se mueve hacia la izquierda (escape)
    this.vy   = random(-1, 1);  // leve movimiento vertical aleatorio
    this.vida = 255;            // opacidad (255 = completamente opaco)
    this.tam  = random(4, 10);  // tamaño inicial

    // Color aleatorio entre naranja y amarillo
    this.r = random(220, 255);
    this.g = random(60, 200);
    this.b = 0;
  }

  // ── Movimiento + fade out ─────────────────────────────────
  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.vida -= 12;  // desaparece gradualmente
    this.tam  -= 0.3;
  }

  // ── Renderizado: círculo con opacidad decreciente ─────────
  show() {
    noStroke();
    fill(this.r, this.g, this.b, this.vida);
    ellipse(this.x, this.y, max(0, this.tam), max(0, this.tam));
  }

  // ── ¿Ya no es visible? → eliminar ────────────────────────
  muerta() {
    return this.vida <= 0 || this.tam <= 0;
  }
}
