(() => {
  const DAS_MS = 140; // delayed auto shift
  const ARR_MS = 45; // auto repeat rate
  const SOFT_DROP_MS = 35;

  const repeaters = new Map();

  function isModalOpen() {
    const help = document.getElementById('help-modal');
    const settings = document.getElementById('settings-modal');
    return (help && !help.classList.contains('hidden')) || (settings && !settings.classList.contains('hidden'));
  }

  function press(action) {
    window.NeonTetris?.keyPress?.(action);
    window.render?.();
  }

  function stopRepeat(action) {
    const r = repeaters.get(action);
    if (!r) return;
    clearTimeout(r.timeout);
    clearInterval(r.interval);
    repeaters.delete(action);
  }

  function startRepeat(action, initialDelay, repeatEvery) {
    stopRepeat(action);
    press(action);

    const timeout = setTimeout(() => {
      const interval = setInterval(() => press(action), repeatEvery);
      repeaters.set(action, { timeout, interval });
    }, initialDelay);

    repeaters.set(action, { timeout, interval: null });
  }

  function normalizeKey(e) {
    // Prefer e.code when available
    const code = e.code || '';
    const key = (e.key || '').toLowerCase();

    if (code === 'ArrowLeft') return 'left';
    if (code === 'ArrowRight') return 'right';
    if (code === 'ArrowDown') return 'down';
    if (code === 'ArrowUp') return 'rotate';
    if (code === 'Space') return 'drop';
    if (code === 'ShiftLeft' || code === 'ShiftRight') return 'hold';
    if (code === 'KeyC') return 'hold';
    if (code === 'KeyZ') return 'rotateCCW';
    if (code === 'KeyX') return 'rotate';
    if (code === 'KeyP' || code === 'Escape') return 'pause';
    if (code === 'KeyR') return 'restart';
    if (code === 'KeyM') return 'toggleSound';

    if (key === 'p') return 'pause';
    if (key === 'escape') return 'pause';
    if (key === 'r') return 'restart';
    if (key === 'm') return 'toggleSound';

    return null;
  }

  document.addEventListener('keydown', (e) => {
    const action = normalizeKey(e);
    if (!action) return;

    if (isModalOpen() && e.code === 'Escape') return;

    // Let Esc close modals first; ui.js also listens but we keep input clean.
    if (isModalOpen() && action !== 'pause') {
      e.preventDefault();
      return;
    }

    if (e.repeat && (action === 'rotate' || action === 'rotateCCW' || action === 'hold' || action === 'drop')) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (action === 'left') return startRepeat('left', DAS_MS, ARR_MS);
    if (action === 'right') return startRepeat('right', DAS_MS, ARR_MS);
    if (action === 'down') return startRepeat('down', 0, SOFT_DROP_MS);
    if (action === 'toggleSound') return window.toggleSound?.();

    press(action);
  }, { passive: false });

  document.addEventListener('keyup', (e) => {
    const action = normalizeKey(e);
    if (!action) return;
    if (action === 'left' || action === 'right' || action === 'down') stopRepeat(action);
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space'].includes(e.code)) e.preventDefault();
  }, { passive: false });

  // Touch / pointer controls
  const touchButtons = [
    { id: 'btn-left', action: 'left', repeat: true },
    { id: 'btn-right', action: 'right', repeat: true },
    { id: 'btn-down', action: 'down', repeat: true },
    { id: 'btn-rotate', action: 'rotate', repeat: false },
    { id: 'btn-hold', action: 'hold', repeat: false },
    { id: 'btn-drop', action: 'drop', repeat: false }
  ];

  touchButtons.forEach((btn) => {
    const el = document.getElementById(btn.id);
    if (!el) return;

    const onDown = (e) => {
      e.preventDefault();
      if (btn.repeat) {
        const repeatEvery = btn.action === 'down' ? SOFT_DROP_MS : ARR_MS;
        startRepeat(btn.action, btn.action === 'down' ? 0 : DAS_MS, repeatEvery);
      } else {
        press(btn.action);
      }
    };
    const onUp = (e) => {
      e.preventDefault();
      if (btn.repeat) stopRepeat(btn.action);
    };

    el.addEventListener('pointerdown', onDown, { passive: false });
    el.addEventListener('pointerup', onUp, { passive: false });
    el.addEventListener('pointercancel', onUp, { passive: false });
    el.addEventListener('pointerleave', onUp, { passive: false });
  });

  // Swipe gestures on canvas
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 30;

  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > SWIPE_THRESHOLD) press(dx > 0 ? 'right' : 'left');
      } else {
        if (Math.abs(dy) > SWIPE_THRESHOLD) {
          if (dy > 0) press('down');
          else press('drop'); // swipe up = hard drop
        } else {
          press('rotate'); // tap-ish vertical swipe
        }
      }
    }, { passive: true });
  }

  // Prevent scrolling on game area
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest?.('.game-container')) e.preventDefault();
  }, { passive: false });
})();
