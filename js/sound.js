// ============================================================
//  SOUND MANAGER – Efectos de sonido con new Audio()
//  Funciona con file:// y servidores locales.
// ============================================================

const SoundManager = (() => {
  const BASE = 'assets/sounds/';
  const _cache = {};

  let _jetpackOn   = false;
  let _loopNode    = null;

  // ── Crea y cachea un elemento <audio> ─────────────────────
  function _crear(nombre) {
    const a = new Audio(BASE + nombre);
    a.preload = 'auto';
    _cache[nombre] = a;
  }

  // ── Reproduce (one-shot: clona para superposición) ────────
  function _play(nombre, vol = 1) {
    const src = _cache[nombre];
    if (!src) return null;
    const a = src.cloneNode();
    a.volume = Math.min(1, Math.max(0, vol));
    const p = a.play();
    if (p) p.catch(() => {});
    return a;
  }

  // ── Precarga todos los sonidos ────────────────────────────
  function init() {
    [
      'coin_pickup_1.wav', 'coin_pickup_2.wav', 'coin_pickup_3.wav',
      'jetpack_plain_start.wav', 'jetpack_plain_lp.wav', 'jetpack_plain_stop.wav',
      'laser_warning.wav', 'missile_warning.wav',
      'player_hurt_1.wav', 'ui_select.wav', 'ui_fail.wav', 'headstart_start.wav',
    ].forEach(_crear);
  }

  // ── API pública ───────────────────────────────────────────

  function monedaRecogida() {
    const idx = Math.floor(Math.random() * 3) + 1;
    _play(`coin_pickup_${idx}.wav`, 0.7);
  }

  function jetpackInicio() {
    if (_jetpackOn) return;
    _jetpackOn = true;
    _play('jetpack_plain_start.wav', 0.8);

    // Loop arranca 400ms después del clip de inicio
    setTimeout(() => {
      if (!_jetpackOn) return;
      const loop = _cache['jetpack_plain_lp.wav'].cloneNode();
      loop.loop   = true;
      loop.volume = 0.5;
      loop.play().catch(() => {});
      _loopNode = loop;
    }, 400);
  }

  function jetpackParada() {
    if (!_jetpackOn) return;
    _jetpackOn = false;
    if (_loopNode) { _loopNode.pause(); _loopNode = null; }
    _play('jetpack_plain_stop.wav', 0.7);
  }

  function resetJetpack() {
    _jetpackOn = false;
    if (_loopNode) { _loopNode.pause(); _loopNode = null; }
  }

  function avisoMisil()    { _play('missile_warning.wav', 0.55); }
  function avisoLaser()    { _play('laser_warning.wav',   0.45); }

  function jugadorHerido() {
    resetJetpack();
    _play('player_hurt_1.wav', 1.0);
    _play('ui_fail.wav',       0.5);
  }

  function uiSelect()      { _play('ui_select.wav',       0.8);  }
  function inicioPartida() { _play('headstart_start.wav', 0.65); }

  return {
    init, monedaRecogida,
    jetpackInicio, jetpackParada, resetJetpack,
    avisoMisil, avisoLaser,
    jugadorHerido, uiSelect, inicioPartida,
  };
})();
