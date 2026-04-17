export class AudioManager {
    constructor(engine) {
        this.engine = engine;
        this.context = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicPlaying = false;
        this.baseDrone = null;
        this.baseDroneGain = null;
        this.topDrone = null;
        this.topDroneGain = null;
    }

    async init() {
        try {
            if (this.context) {
                return;
            }

            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.context.createGain();
            this.musicGain.gain.value = 0.22;
            this.musicGain.connect(this.context.destination);

            this.sfxGain = this.context.createGain();
            this.sfxGain.gain.value = 0.52;
            this.sfxGain.connect(this.context.destination);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    async playMusic() {
        await this.init();
        if (!this.context) {
            return;
        }
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
        if (this.musicPlaying) {
            return;
        }

        this.baseDrone = this.context.createOscillator();
        this.baseDrone.type = 'sawtooth';
        this.baseDrone.frequency.value = 90;
        this.baseDroneGain = this.context.createGain();
        this.baseDroneGain.gain.value = 0.02;

        this.topDrone = this.context.createOscillator();
        this.topDrone.type = 'triangle';
        this.topDrone.frequency.value = 180;
        this.topDroneGain = this.context.createGain();
        this.topDroneGain.gain.value = 0.01;

        this.baseDrone.connect(this.baseDroneGain);
        this.topDrone.connect(this.topDroneGain);
        this.baseDroneGain.connect(this.musicGain);
        this.topDroneGain.connect(this.musicGain);

        this.baseDrone.start();
        this.topDrone.start();
        this.musicPlaying = true;
    }

    update() {
        if (!this.context || !this.musicPlaying || !this.baseDrone || !this.topDrone) {
            return;
        }

        const now = this.context.currentTime;
        const speedRatio = this.engine.currentSpeed / this.engine.config.maxSpeed;
        const turboBoost = this.engine.powerups.activeEffects.speed ? 1 : 0;

        this.baseDrone.frequency.linearRampToValueAtTime(88 + speedRatio * 48 + turboBoost * 15, now + 0.1);
        this.topDrone.frequency.linearRampToValueAtTime(174 + speedRatio * 92 + turboBoost * 28, now + 0.1);
        this.baseDroneGain.gain.linearRampToValueAtTime(0.025 + speedRatio * 0.03 + turboBoost * 0.015, now + 0.1);
        this.topDroneGain.gain.linearRampToValueAtTime(0.01 + speedRatio * 0.02 + turboBoost * 0.02, now + 0.1);
    }

    playTone(freq, duration, type = 'sine', volume = 0.3) {
        if (!this.context) {
            return;
        }

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.context.currentTime + duration);
    }

    playNoise(duration, volume = 0.3) {
        if (!this.context) {
            return;
        }

        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i += 1) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        source.connect(gain);
        gain.connect(this.sfxGain);
        source.start();
    }

    playJump() {
        this.playTone(430, 0.12, 'sine', 0.25);
        setTimeout(() => this.playTone(540, 0.08, 'triangle', 0.18), 40);
    }

    playSlide() {
        this.playTone(180, 0.16, 'sawtooth', 0.24);
    }

    playWhoosh() {
        this.playNoise(0.08, 0.28);
    }

    playCoin() {
        this.playTone(880, 0.08, 'sine', 0.28);
        setTimeout(() => this.playTone(1180, 0.08, 'triangle', 0.22), 45);
    }

    playPowerUp() {
        this.playTone(523, 0.12, 'sine', 0.34);
        setTimeout(() => this.playTone(659, 0.14, 'sine', 0.32), 80);
        setTimeout(() => this.playTone(784, 0.18, 'triangle', 0.34), 170);
    }

    playShield() {
        this.playTone(410, 0.22, 'square', 0.24);
    }

    playCrashPulse() {
        this.playNoise(0.12, 0.22);
        this.playTone(160, 0.18, 'square', 0.18);
    }

    playCrash() {
        this.playNoise(0.55, 0.55);
        this.playTone(100, 0.34, 'sawtooth', 0.42);
    }

    playNearMiss() {
        this.playTone(680, 0.05, 'square', 0.17);
    }

    stop() {
        if (this.baseDrone) {
            this.baseDrone.stop();
            this.baseDrone.disconnect();
            this.baseDrone = null;
        }
        if (this.topDrone) {
            this.topDrone.stop();
            this.topDrone.disconnect();
            this.topDrone = null;
        }
        if (this.baseDroneGain) {
            this.baseDroneGain.disconnect();
            this.baseDroneGain = null;
        }
        if (this.topDroneGain) {
            this.topDroneGain.disconnect();
            this.topDroneGain = null;
        }
        this.musicPlaying = false;
    }

    reset() {
        this.stop();
    }
}
