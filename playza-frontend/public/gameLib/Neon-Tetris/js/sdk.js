/**
 * Playza Game SDK (Legacy Script Version)
 * This SDK allows games to communicate with the Playza Platform via global object.
 */

window.PlayzaSDK = (() => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const gameId = params.get('game_id') || 'canvas-tetris';
  
  console.log(`[PlayzaSDK] Initialized for game: ${gameId}, session: ${sessionId}`);

  return {
    gameId: gameId,
    sessionId: sessionId,
    
    /**
     * Submit score to the Playza platform.
     */
    submitScore: (data) => {
      console.log(`[PlayzaSDK] Submitting score: ${data.score}`, data.metadata);
      
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'PLAYZA_SCORE_SUBMISSION',
          payload: {
            game_id: gameId,
            session_id: sessionId,
            ...data
          }
        }, '*');
      }
      return Promise.resolve({ success: true, timestamp: Date.now() });
    },

    /**
     * Signal that the game is loaded and ready.
     */
    ready: () => {
      console.log('[PlayzaSDK] Game is ready');
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'PLAY_GAME_READY' }, '*');
      }
    }
  };
})();

// Automatic ready check
window.addEventListener('load', () => {
  if (window.PlayzaSDK) window.PlayzaSDK.ready();
});
