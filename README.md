# ⚡ Jetpack Control - Endless Runner con Machine Learning

Un prototipo de **endless runner** al estilo *Jetpack Joyride*, en donde controlas a tu personaje utilizando tu cámara web y un modelo de inteligencia artificial entrenado mediante **Teachable Machine**.

Cuando abres la mano frente a la cámara, el jetpack se activa y el personaje sube. Cuando cierras la mano, el jetpack se apaga y el personaje cae.

---

## 🏗️ Arquitectura de la Aplicación (Código Limpio)

El proyecto está diseñado bajo principios de código limpio, separando claramente las responsabilidades en distintos archivos para facilitar el mantenimiento y la escalabilidad de cada componente.

La estructura de directorios principal es la siguiente:

```text
/
├── index.html              # Punto de entrada de la app
├── css/
│   └── styles.css          # Estilos visuales compartidos y UI
└── js/
    ├── config.js           # Variables globales, constantes de físicas y URL del modelo
    ├── ml5-handler.js      # Conexión con cámara, carga del modelo de IA y lógica asíncrona de ML5
    ├── entities/           # Clases OOP que definen los componentes del mundo físico
    │   ├── Player.js         # Lógica, estado, gravedad y render del Jugador
    │   ├── Obstacle.js       # Zappers y Misiles (obstáculos enemigos)
    │   ├── Coin.js           # Monedas recolectables y su animación 3D
    │   └── Particle.js       # Efecto visual de partículas (humo del jetpack)
    ├── physics.js          # Lógica pura de detección de colisiones (Cajas/AABB y Circulares)
    ├── rendering.js        # Funciones de dibujo puro: HUD, fondo Parallax, y pantallas UI (GameOver)
    └── game.js             # "Game Loop" principal (Setup y Draw de p5.js) y orquestación
```

Esta separación ayuda a que, si necesitas modificar las físicas, solo vayas a `physics.js` o `Player.js`. Si necesitas mejorar los dibujos del fondo, vas a `rendering.js`.

---

## 🔄 Flujo de Datos del Juego

El juego funciona con dos grandes ciclos que ocurren al mismo tiempo en paralelo (asincronía):

### 1. El Loop de Predicción (La IA)
Ocurre en `ml5-handler.js`. Toma un fotograma/imagen de la cámara web, se lo pasa al clasificador de Teachable Machine y éste escupe una predicción. Por ejemplo: `"Mano Abierta" con un 95% de confianza`. En cuanto termina, analiza el siguiente fotograma, y actualiza variables globales de estado (`etiquetaActual` y `confianzaActual`).

### 2. El Game Loop (Los Gráficos y Físicas)
Ocurre en `game.js` gracias a la función `draw()` de p5.js. Corre a 60 cuadros por segundo:
1. **Entrada de Usuario:** `game.js` lee la última predicción dejada por el paso anterior (`etiquetaActual`). Si dice "Mano Abierta" con un buen margen de confianza, llama al método `jugador.volar()`.
2. **Actualización (Posiciones y Estado):** Actualiza posiciones de enemigos asumiendo el movimiento del parallax. Actualiza al jugador basándose en gravedad estándar restando el empuje extra del jetpack. Revisa la distancia entre entidades utilizando `physics.js` para encontrar colisiones (perder o sumar puntos).
3. **Renderizado (Dibujo):** Llama a todos los métodos `show()` de las entidades y llama a las funciones en `rendering.js` para dibujar el fondo, marcadores y elementos UI.

---

## 🤖 Cómo conectar tu propio modelo de Teachable Machine

El juego necesita diferenciar, como mínimo, dos estados para funcionar correctamente: **Mano Abierta** y otra pose (como **Mano Cerrada** o Fondo vacío).

Para integrar tu propio modelo, sigue estos pasos:

1. Ingresa a [Teachable Machine](https://teachablemachine.withgoogle.com/) y crea un proyecto de tipo **Imagen (Image Project)**.
2. Crea una clase llamada exactamente `"Abierta"` (es extremadamente importante respetar la mayúscula y ortografía, pues el código busca esta palabra exacta).
3. Entrena la clase `"Abierta"` capturando muchas fotos de tu mano haciendo esa seña frente a la cámara (recomendable usar fondos y luces distintas).
4. Crea otra clase, puede llamarse `"Cerrada"`, `"Nada"`, o `"Fondo"`, y entrena esta pose, donde no intentes volar.
5. Inicia el entrenamiento (con la configuración por defecto suele ser suficiente).
6. Haz clic en **Export Model (Exportar Modelo)**, elige formato para la web (`Tensorflow.js`) y luego haz clic en el botón de **"Upload" ("Subir a la Nube")**.
7. Teachable Machine te generará un **enlace URL público** al finalizar (ej. `https://teachablemachine.withgoogle.com/models/abc12345/`).

**¡Instálalo en el código!**
Abre el archivo `js/config.js` de nuestro directorio, encuentra el siguiente bloque al inicio del archivo:

```javascript
// ============================================================
//  CONFIGURACIÓN DEL MODELO DE TEACHABLE MACHINE
// ============================================================
let imageModelURL = 'TU_LINK_AQUI/';
```

Simplemente reemplaza `'TU_LINK_AQUI/'` por tu URL generada, cuidando que **quede entre las comillas simples** y asegurándote de **que siempre termine en barra cruzada `/`**.

¡Abre `index.html` en tu navegador, da permiso a tu cámara y comienza a jugar con tu propia inteligencia artificial!