// ============================================================
//  ML5 – CÁMARA Y CLASIFICADOR DE IMÁGENES
//  Maneja la conexión con Teachable Machine via ml5.js
// ============================================================

// Variables del módulo ML5
let captura;                     // elemento de video (createCapture)
let clasificador;                // el modelo de Teachable Machine
let etiquetaActual  = 'Esperando...';
let confianzaActual = 0;
let modeloCargado   = false;

// ============================================================
//  CARGAR MODELO
//  Se llama después de que la cámara está lista.
//  ml5.imageClassifier recibe la URL del modelo y la fuente de video.
//  Compatible con ml5 v0.12.x
// ============================================================
function cargarModelo() {
  clasificador = ml5.imageClassifier(
    imageModelURL + 'model.json',
    captura,
    () => {
      console.log('✅ Modelo cargado');
      modeloCargado = true;
      clasificar(); // iniciamos el loop de clasificación
    }
  );
}

// ============================================================
//  LOOP DE CLASIFICACIÓN
//  Se llama a sí mismo continuamente de forma asíncrona.
//  Corre en paralelo al draw() de p5.
//
//  classify() analiza el frame actual del video y devuelve
//  un array de resultados: [{ label, confidence }, ...]
// ============================================================
function clasificar() {
  clasificador.classify(captura, (error, resultados) => {
    if (error) {
      console.warn('Error de clasificación:', error);
    } else {
      // El primer resultado es siempre el de mayor confianza
      etiquetaActual  = resultados[0].label;
      confianzaActual = resultados[0].confidence;
    }
    // Volvemos a clasificar → loop continuo de predicciones
    clasificar();
  });
}
