// ============================================================
//  MODO DE PRUEBA
//  true  → teclado: ESPACIO mantenido = jetpack. Sin cámara ni modelo.
//  false → Teachable Machine (comportamiento normal de juego).
//  ➡  Cambia solo esta línea para alternar entre modos.
// ============================================================
const MODO_PRUEBA = false;

// Indica si el jugador mantiene Espacio presionado (solo en modo prueba)
let teclaPulsada = false;

// ============================================================
//  CONFIGURACIÓN DEL MODELO DE TEACHABLE MACHINE
//  ➡  Reemplaza la URL con el enlace de tu modelo exportado
//     desde teachablemachine.withgoogle.com
//     El link debe terminar en "/" y apuntar a la carpeta
//     que contiene model.json, metadata.json y weights.bin
// ============================================================
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/dMpX9K8KB/';

// ============================================================
//  CONSTANTES DEL JUEGO
// ============================================================

// Dimensiones del canvas
const ANCHO = 900;
const ALTO = 500;

// Física – se pueden ajustar para cambiar la sensación del juego
const GRAVEDAD = 0.5;   // Aceleración gravitacional (px/frame²)
const FUERZA_JETPACK = 0.9;   // Fuerza opuesta a la gravedad al volar
const VEL_MAXIMA = 8;     // Velocidad vertical máxima (caps de caída)
const VEL_MUNDO = 4;     // Velocidad horizontal del mundo (obstáculos)

// Suelo y techo (márgenes internos del canvas)
const SUELO = ALTO - 40;
const TECHO = 40;

// Intervalo de aparición de obstáculos y monedas (en frames)
const INTERVALO_OBSTACULO = 90;
const INTERVALO_MONEDA = 60;

// Frecuencia de inferencia del modelo (ms). 80ms ~= 12.5 inferencias/seg.
const INTERVALO_CLASIFICACION_MS = 80;

// ============================================================
//  VARIABLES DE ESTADO GLOBALES
//  Se comparten entre módulos vía el scope global (window)
// ============================================================

// Estado del juego: 'esperando' | 'jugando' | 'gameOver'
let estado = 'esperando';
let puntaje = 0;
let frameInicio = 0; // frame en que comenzó la partida (para distancia)

// Objetos del mundo
let jugador;
let obstaculos = [];
let monedas = [];
let capas = []; // capas del parallax de fondo

// Partículas del jetpack (efecto visual)
let particulas = [];

// Flag de inicio del juego (se activa con el botón HTML)
let juegoIniciado = false;
