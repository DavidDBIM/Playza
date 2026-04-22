export class AudioManager {
    constructor(engine) {
        this.engine = engine;
        this.context = null;
        this.masterGain = null;
        this.sfxGain = null;
    }

    async init() {
        try {
            if (this.context) {
                return;
            }

            this.context = new (window.AudioContext || window.webkitAudioContext)();

            const compressor = this.context.createDynamicsCompressor();
            compressor.threshold.value = -18;
            compressor.knee.value = 18;
            compressor.ratio.value = 8;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.18;

            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.34;

            this.sfxGain = this.context.createGain();
            this.sfxGain.gain.value = 0.72;

            this.sfxGain.connect(compressor);
            compressor.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    async ensureContext() {
        await this.init();
        if (!this.context) {
            return false;
        }

        if (this.context.state === 'suspended') {
            await this.context.resume();
        }

        return true;
    }

    async playMusic() {
        await this.ensureContext();
    }

    update() {}

    playTone(freq, duration, type = 'sine', volume = 0.18, options = {}) {
        if (!this.context || !this.sfxGain) {
            return;
        }

        const now = this.context.currentTime;
        const attack = options.attack ?? 0.012;
        const release = options.release ?? Math.min(0.08, duration * 0.55);
        const endTime = now + duration;
        const sustainUntil = Math.max(now + attack, endTime - release);

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        if (options.endFreq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, options.endFreq), endTime);
        }

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(volume, now + attack);
        gain.gain.setValueAtTime(volume, sustainUntil);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(endTime + 0.02);
    }

    playJump() {
        this.playTone(420, 0.12, 'sine', 0.12, { endFreq: 560 });
        this.playTone(620, 0.08, 'triangle', 0.08, { attack: 0.008 });
    }

    playSlide() {
        this.playTone(240, 0.16, 'triangle', 0.1, { endFreq: 180 });
    }

    playWhoosh() {
        this.playTone(310, 0.07, 'triangle', 0.07, { endFreq: 230, attack: 0.005, release: 0.045 });
    }

    playCoin() {
        this.playTone(880, 0.07, 'sine', 0.11);
        this.playTone(1180, 0.08, 'triangle', 0.08, { attack: 0.006 });
    }

    playPowerUp() {
        this.playTone(523, 0.11, 'sine', 0.12);
        this.playTone(659, 0.14, 'triangle', 0.1);
        this.playTone(784, 0.16, 'sine', 0.12);
    }

    playShield() {
        this.playTone(410, 0.18, 'triangle', 0.11, { endFreq: 520 });
    }

    playCrashPulse() {
        this.playTone(180, 0.14, 'triangle', 0.09, { endFreq: 120 });
    }

    playCrash() {
        this.playTone(140, 0.22, 'triangle', 0.12, { endFreq: 90, release: 0.1 });
        this.playTone(92, 0.28, 'sine', 0.08, { attack: 0.01, release: 0.12 });
    }

    playNearMiss() {
        this.playTone(680, 0.05, 'triangle', 0.08);
    }

    stop() {}

    reset() {
        this.stop();
    }
}
