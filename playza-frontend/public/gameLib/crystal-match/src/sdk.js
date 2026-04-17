/**
 * Playza Game SDK (JS Version)
 * This SDK allows games to communicate with the Playza Platform.
 */

class PlayzaSDK {
  constructor() {
    const params = new URLSearchParams(window.location.search);
    this.sessionId = params.get('session_id');
    this.gameId = params.get('game_id') || 'crystal-match';
    
    console.log(`[PlayzaSDK] Initialized for game: ${this.gameId}, session: ${this.sessionId}`);
  }

  /**
   * Submit a score to the Playza platform.
   */
  async submitScore(data) {
    console.log(`[PlayzaSDK] Submitting score: ${data.score}`, data.metadata);
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'PLAYZA_SCORE_SUBMISSION',
        payload: {
          game_id: this.gameId,
          session_id: this.sessionId,
          ...data
        }
      }, '*');
    }

    return { success: true, timestamp: Date.now() };
  }

  /**
   * Signal that the game is loaded and ready.
   */
  ready() {
    console.log('[PlayzaSDK] Game is ready');
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'PLAYZA_GAME_READY' }, '*');
    }
  }
}

export const sdk = new PlayzaSDK();
