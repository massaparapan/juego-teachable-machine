// ============================================================
//  CLASE: Player (El jugador)
//  Controla la posición, física y renderizado del personaje.
// ============================================================
class Player {
  /**
   * @param {number} x - posición X fija (a la izquierda)
   * @param {number} y - posición Y inicial (centro vertical)
   */
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    this.w  = 40; // ancho del sprite
    this.h  = 50; // alto del sprite
    this.vy = 0;  // velocidad vertical (positivo = baja, negativo = sube)
    this.volando = false; // ¿jetpack activo?
    this.animFrame = 0;   // frame de animación actual
  }

  // ──────────────────────────────────────────────────────────
  //  VOLAR
  //  Activa el jetpack. Se llama cada frame que la mano está "Abierta".
  //
  //  Física:  vy = vy - FUERZA_JETPACK
  //  Acumulamos fuerza hacia arriba (vy negativa) contra la gravedad.
  // ──────────────────────────────────────────────────────────
  volar() {
    this.vy -= FUERZA_JETPACK;
    this.volando = true;
    this.emitirParticulas();
  }

  // ──────────────────────────────────────────────────────────
  //  UPDATE
  //  Aplica física cada frame (integración de Euler):
  //    1. vy += GRAVEDAD       (aceleración → velocidad)
  //    2. vy = constrain(...)  (limitar velocidad terminal)
  //    3. y  += vy             (velocidad  → posición)
  //    4. Colisión con suelo y techo
  // ──────────────────────────────────────────────────────────
  update() {
    this.vy += GRAVEDAD;
    this.vy = constrain(this.vy, -VEL_MAXIMA, VEL_MAXIMA);
    this.y += this.vy;

    // Colisión con el suelo
    if (this.y + this.h >= SUELO) {
      this.y  = SUELO - this.h;
      this.vy = 0;
    }

    // Colisión con el techo
    if (this.y <= TECHO) {
      this.y  = TECHO;
      this.vy = 0;
    }

    // Resetear flag de vuelo (se activa de nuevo si volar() es llamado)
    this.volando = false;

    // Animar el sprite
    this.animFrame = (this.animFrame + 1) % 60;
  }

  // ──────────────────────────────────────────────────────────
  //  SHOW
  //  Dibuja el jugador con formas primitivas de p5.js.
  //
  //  TODO: Reemplazar con image(spriteJugador, ...) cuando
  //        tengamos el spritesheet final.
  // ──────────────────────────────────────────────────────────
  show() {
    let cx = this.x + this.w / 2;
    let cy = this.y + this.h / 2;

    // Efecto de brillo (glow)
    noStroke();
    fill(0, 200, 255, 20);
    ellipse(cx, cy, this.w + 30, this.h + 30);
    fill(0, 200, 255, 15);
    ellipse(cx, cy, this.w + 50, this.h + 50);

    // Cuerpo principal (traje de vuelo)
    fill(0, 180, 255);
    stroke(0, 230, 255);
    strokeWeight(2);
    rect(this.x + 4, this.y + 5, this.w - 8, this.h - 10, 8);

    // Cabeza
    fill(0, 220, 255);
    stroke(0, 255, 255);
    strokeWeight(1);
    ellipse(cx - 2, this.y + 4, 26, 26);

    // Visor del casco
    fill(255, 200, 50, 200);
    noStroke();
    ellipse(cx - 2, this.y + 2, 14, 10);

    // Jetpack (caja detrás del personaje)
    fill(80, 80, 120);
    stroke(120, 120, 200);
    strokeWeight(1);
    rect(this.x - 14, this.y + 10, 18, 30, 4);

    // Llamas del jetpack (si está volando)
    if (this.volando || this.animFrame % 10 < 5) {
      noStroke();
      // Llama naranja
      fill(255, 120, 0, 200);
      triangle(
        this.x - 16, this.y + 35,
        this.x - 5,  this.y + 35,
        this.x - 10, this.y + 35 + random(8, 20)
      );
      // Núcleo amarillo
      fill(255, 240, 0, 180);
      triangle(
        this.x - 14, this.y + 35,
        this.x - 8,  this.y + 35,
        this.x - 11, this.y + 35 + random(4, 12)
      );
    }

    // Botas
    fill(0, 100, 180);
    noStroke();
    rect(this.x + 6,  this.y + this.h - 8, 10, 8, 3);
    rect(this.x + 20, this.y + this.h - 8, 10, 8, 3);
  }

  // ──────────────────────────────────────────────────────────
  //  EMITIR PARTÍCULAS
  //  Las partículas nacen en la posición del jetpack.
  // ──────────────────────────────────────────────────────────
  emitirParticulas() {
    for (let i = 0; i < 3; i++) {
      particulas.push(new Particula(this.x - 10, this.y + 35));
    }
  }
}
