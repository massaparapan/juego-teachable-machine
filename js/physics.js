// ============================================================
//  DETECCIÓN DE COLISIONES
//  Funciones puras que reciben dos objetos y retornan boolean.
// ============================================================

/**
 * AABB (Axis-Aligned Bounding Box):
 * Detecta si dos rectángulos se solapan comparando sus bordes.
 *
 * La condición de NO colisión es que alguno está totalmente
 * a la izquierda / derecha / arriba / abajo del otro.
 * Negamos eso para obtener cuándo SÍ hay colisión.
 *
 * Los márgenes de tolerancia hacen el hitbox un poco más
 * pequeño que el sprite visible (se siente más "justo").
 *
 * @param {Object} a - objeto con {x, y, w, h}
 * @param {Object} b - objeto con {x, y, w, h}
 * @returns {boolean}
 */
function colisionAABB(a, b) {
  const margenA = 8;
  const margenB = 6;

  return (
    a.x + margenA        < b.x + b.w - margenB &&
    a.x + a.w - margenA  > b.x + margenB       &&
    a.y + margenA        < b.y + b.h - margenB  &&
    a.y + a.h - margenA  > b.y + margenB
  );
}

/**
 * Colisión circular:
 * Calcula la distancia entre los centros de dos objetos.
 * Si la distancia < suma de radios → hay colisión.
 * Ideal para objetos circulares como monedas.
 *
 * @param {Object} a - jugador con {x, y, w, h}
 * @param {Object} b - moneda  con {x, y, radio}
 * @returns {boolean}
 */
function colisionCircular(a, b) {
  let cx1 = a.x + a.w / 2;
  let cy1 = a.y + a.h / 2;
  let r1  = min(a.w, a.h) / 2;

  let cx2 = b.x;
  let cy2 = b.y;
  let r2  = b.radio;

  let distancia = dist(cx1, cy1, cx2, cy2);

  return distancia < r1 + r2 + 4; // +4 px de tolerancia
}
