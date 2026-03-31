// ============================================================
//  CLASE: Coin (Monedas coleccionables)
//  Aparecen a la derecha y avanzan hacia la izquierda.
//  Tienen animación de rotación simulada en 3D.
// ============================================================
class Coin {
  constructor() {
    this.x      = ANCHO + 10;
    this.y      = random(TECHO + 30, SUELO - 30);
    this.radio  = 12;       // radio para colisión circular
    this.vel    = VEL_MUNDO;
    this.angulo = 0;        // ángulo de rotación para animación
  }

  // ── Movimiento + rotación visual ──────────────────────────
  update() {
    this.x      -= this.vel;
    this.angulo += 0.05; // rotación continua
  }

  // ── Renderizado con efecto de giro 3D ─────────────────────
  show() {
    // Escala X simulando rotación: abs(sin) oscila [0, 1]
    let escalaX      = abs(sin(this.angulo));
    let anchoVisible = this.radio * 2 * escalaX;

    // Brillo exterior
    noStroke();
    fill(255, 220, 0, 50);
    ellipse(this.x, this.y, (this.radio + 8) * 2, (this.radio + 8) * 2);

    // Cuerpo de la moneda
    fill(255, 210, 0);
    stroke(255, 240, 100);
    strokeWeight(2);
    ellipse(this.x, this.y, anchoVisible + 2, this.radio * 2 + 2);

    // Interior brillante
    noStroke();
    fill(255, 255, 150);
    ellipse(this.x, this.y, anchoVisible * 0.6, this.radio * 1.2);

    // Símbolo "$" (solo cuando la moneda está de frente)
    if (escalaX > 0.5) {
      fill(200, 120, 0);
      textAlign(CENTER, CENTER);
      textSize(12);
      noStroke();
      text('$', this.x, this.y);
    }
  }
}
