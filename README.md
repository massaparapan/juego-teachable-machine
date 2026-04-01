# ⚡ Jetpack Control — Endless Runner con Machine Learning

Un **endless runner** al estilo *Jetpack Joyride* donde controlás al personaje con tu **cámara web** y un modelo de **Inteligencia Artificial** entrenado con Teachable Machine.

- 🖐️ **Mano abierta** → Jetpack activado (el personaje sube)
- ✊ **Mano cerrada** → Jetpack apagado (el personaje cae)

Esquivá obstáculos, recolectá monedas y sobreviví el mayor tiempo posible.

---

## 🚀 Cómo ejecutar el juego

### Opción A — Abrir directamente (más sencillo)
1. Cloná o descargá este repositorio.
2. Abrí el archivo `index.html` directamente en tu navegador (doble clic).
3. Otorgá permiso de cámara cuando el navegador lo solicite.
4. Presioná **▶ INICIAR JUEGO**.

> **Nota:** El juego requiere conexión a internet para cargar las librerías externas (p5.js y ml5.js) desde CDN.

### Opción B — Servidor local (recomendado para desarrollo)
```bash
# Python 3
python3 -m http.server 8080
# Luego abrí http://localhost:8080 en el navegador
```

---

## 🕹️ Controles

| Acción | Control |
|--------|---------|
| Activar jetpack | Mano abierta frente a la cámara |
| Desactivar jetpack | Mano cerrada frente a la cámara |
| Reiniciar partida | Tecla `R` |
| Jetpack (fallback teclado) | `Espacio` *(modo ML)* |

### Modo Prueba (sin cámara)
En `js/config.js` cambiá:
```javascript
const MODO_PRUEBA = true;
```
Esto te permite jugar manteniendo presionada la barra **espaciadora**, sin necesitar cámara ni modelo de IA. Ideal para desarrollo.

---

## 📁 Arquitectura de archivos

```text
/
├── index.html                # Punto de entrada — carga librerías y scripts
├── css/
│   └── styles.css            # Estilos de UI (pantalla de inicio, HUD)
├── assets/
│   ├── bg_far.png            # Capas de fondo parallax (lejos → cerca)
│   ├── bg_mid.png
│   ├── bg_near_floor.png
│   ├── bg_near_up.png
│   ├── coins.png             # Spritesheet de monedas
│   ├── fly.png               # Spritesheet del personaje volando
│   ├── walking.png           # Spritesheet del personaje caminando
│   ├── laser.png             # Sprite del zapper (obstáculo)
│   ├── missile_0..3.png      # Frames del misil animado (obstáculo)
│   └── sounds/               # Efectos de sonido y música
│       ├── music_background.wav      # Música de fondo en loop
│       ├── jetpack_plain_start.wav   # Arranque del jetpack
│       ├── jetpack_plain_lp.wav      # Loop del jetpack activo
│       ├── jetpack_plain_stop.wav    # Apagado del jetpack
│       ├── coin_pickup_1/2/3.wav     # Recolección de moneda (aleatorio)
│       ├── laser_warning.wav         # Aviso de zapper
│       ├── missile_warning.wav       # Aviso de misil
│       ├── player_hurt_1.wav         # Game Over
│       ├── ui_select.wav             # Selección de UI
│       ├── ui_fail.wav               # Fallo de UI
│       └── headstart_start.wav       # Inicio de partida
└── js/
    ├── config.js             # Constantes físicas, URL del modelo, variables globales
    ├── sound.js              # SoundManager — carga y reproducción de audio
    ├── ml5-handler.js        # Cámara + modelo Teachable Machine (inferencia async)
    ├── sprites.js            # Carga y recorte de spritesheets
    ├── physics.js            # Colisiones AABB (cajas) y circulares
    ├── rendering.js          # Dibujo: parallax, HUD, pantallas de UI
    ├── game.js               # Game loop principal (setup/draw de p5.js)
    └── entities/
        ├── Player.js         # Jugador: física, animación, jetpack
        ├── Obstacle.js       # Obstáculos: Zapper y Misil
        ├── Coin.js           # Monedas recolectables
        └── Particle.js       # Partículas de humo del jetpack
```

### Responsabilidades por módulo

| Archivo | Qué hace |
|---------|----------|
| `config.js` | Define todas las constantes del juego (gravedad, velocidad, dimensiones) y el estado global compartido entre módulos |
| `sound.js` | Carga todos los `.wav` con `new Audio()` y expone funciones específicas por evento (jetpack, moneda, game over, etc.) |
| `ml5-handler.js` | Activa la cámara, carga el modelo de Teachable Machine y actualiza `etiquetaActual` y `confianzaActual` cada ~80ms |
| `sprites.js` | Parsea y recorta los spritesheets para las animaciones del jugador y obstáculos |
| `physics.js` | Funciones puras de detección de colisiones, sin estado ni efectos secundarios |
| `rendering.js` | Todas las llamadas de dibujo a p5.js: fondo parallax, HUD, pantalla de Game Over |
| `game.js` | Orquesta todo: `setup()` inicial, `draw()` a 60fps, spawn de entidades, entrada de teclado |
| `entities/` | Clases OOP autocontenidas con `update()` (física) y `show()` (render) |

---

## 🔄 Flujo de datos

Dos ciclos corren en paralelo:

```
┌─── Loop de IA (ml5-handler.js) ───────────────────────┐
│  Cámara → modelo → etiquetaActual / confianzaActual    │
│  Frecuencia: ~12.5 veces/seg (cada 80ms)               │
└────────────────────────────────────────────────────────┘
                          ↓ lee variables globales
┌─── Game Loop (game.js / p5.js draw()) ────────────────┐
│  1. Lee predicción → llama jugador.volar() si "palma"  │
│  2. Actualiza física de todas las entidades            │
│  3. Detecta colisiones (physics.js)                    │
│  4. Dibuja todo en el canvas (rendering.js + show())   │
│  Frecuencia: ~60 veces/seg                             │
└────────────────────────────────────────────────────────┘
```

---

## 🤖 Conectar tu propio modelo de Teachable Machine

1. Entrá a [teachablemachine.withgoogle.com](https://teachablemachine.withgoogle.com/) y creá un proyecto **Image Project**.
2. Creá una clase llamada exactamente **`palma`** (en minúsculas — el código busca esta palabra exacta).
3. Entrená esa clase con fotos de tu mano abierta frente a la cámara (variá fondos e iluminación para mayor robustez).
4. Creá otra clase (`cerrada`, `fondo`, o similar) para el estado de reposo.
5. Entrenás el modelo y lo exportás: **Export Model → TensorFlow.js → Upload**.
6. Copiás la URL generada (ej. `https://teachablemachine.withgoogle.com/models/XYZ/`).
7. En `js/config.js`, reemplazás la URL:

```javascript
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/TU_ID/';
```

> ⚠️ La URL **debe terminar en `/`** para que ml5.js encuentre los archivos `model.json`, `metadata.json` y `weights.bin`.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| [p5.js](https://p5js.org/) | 1.9.4 | Motor de render y game loop |
| [ml5.js](https://ml5js.org/) | 0.12.2 | Clasificador de imágenes con Teachable Machine |
| HTML5 Audio API | — | Efectos de sonido y música |
| Vanilla JavaScript | ES6+ | Toda la lógica del juego |