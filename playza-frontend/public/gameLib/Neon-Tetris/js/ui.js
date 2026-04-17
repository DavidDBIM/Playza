(() => {
  const SPRINT_BEST_KEY = 'neon-tetris-sprint40-best';

  function $(id) {
    return document.getElementById(id);
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.classList.toggle('hidden', hidden);
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    setHidden(modalEl, false);
    modalEl.querySelector('button, input')?.focus?.();
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    setHidden(modalEl, true);
  }

  function syncSettingsUI() {
    const api = window.NeonTetris;
    if (!api?.getSettings) return;
    const settings = api.getSettings();

    const ghostEl = $('setting-ghost');
    if (ghostEl) ghostEl.checked = !!settings.ghostEnabled;

    const matrixEl = $('setting-matrix');
    if (matrixEl) matrixEl.checked = !!settings.matrixEnabled;

    const soundEl = $('setting-sound');
    if (soundEl) soundEl.checked = !!settings.soundEnabled;
  }

  function applySettingsFromUI() {
    const api = window.NeonTetris;
    if (!api?.setSettings) return;

    api.setSettings({
      ghostEnabled: $('setting-ghost')?.checked ?? true,
      matrixEnabled: $('setting-matrix')?.checked ?? true,
      soundEnabled: $('setting-sound')?.checked ?? true,
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    const helpModal = $('help-modal');
    const settingsModal = $('settings-modal');
    const modeHint = $('mode-hint');

    function setMode(mode) {
      $('mode-classic')?.classList.toggle('active', mode === 'classic');
      $('mode-sprint')?.classList.toggle('active', mode === 'sprint40');
      window.NeonTetris?.setMode?.(mode);

      if (!modeHint) return;
      if (mode === 'sprint40') {
        let best = null;
        try {
          best = parseInt(localStorage.getItem(SPRINT_BEST_KEY), 10);
        } catch (e) {
          best = null;
        }
        const bestText = best ? formatTime(best) : '--:--';
        modeHint.textContent = `Sprint 40: clear 40 lines fast. Best: ${bestText}`;
      } else {
        modeHint.textContent = 'Classic mode: endless run.';
      }
    }

    function formatTime(totalSeconds) {
      totalSeconds = Math.max(0, totalSeconds | 0);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    $('mode-classic')?.addEventListener('click', () => setMode('classic'));
    $('mode-sprint')?.addEventListener('click', () => setMode('sprint40'));

    $('help-btn')?.addEventListener('click', () => openModal(helpModal));
    $('help-close')?.addEventListener('click', () => closeModal(helpModal));

    $('settings-btn')?.addEventListener('click', () => {
      syncSettingsUI();
      openModal(settingsModal);
    });
    $('settings-close')?.addEventListener('click', () => closeModal(settingsModal));

    $('pause-btn')?.addEventListener('click', () => window.NeonTetris?.togglePause?.());

    $('setting-ghost')?.addEventListener('change', applySettingsFromUI);
    $('setting-matrix')?.addEventListener('change', applySettingsFromUI);
    $('setting-sound')?.addEventListener('change', applySettingsFromUI);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (helpModal && !helpModal.classList.contains('hidden')) closeModal(helpModal);
        if (settingsModal && !settingsModal.classList.contains('hidden')) closeModal(settingsModal);
      }
    });

    // Click outside modal card closes it
    [helpModal, settingsModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Initial mode
    setMode(window.NeonTetris?.getMode?.() || 'classic');
  });
})();
