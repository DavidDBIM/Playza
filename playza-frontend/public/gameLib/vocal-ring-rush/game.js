import { WORD_LIST } from './words.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.state = 'START';
        this.ringPos = 0;
        this.speed = 1.0;
        this.currentWord = null;
        this.isCorrect = false;
        this.particles = [];
        this.tunnelZ = 0;
        this.lastMatchedConfidence = 0;
        this.totalConfidence = 0;
        this.correctCount = 0;
        
        this.speech = null;
        this.initSpeech();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initSpeech() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            document.getElementById('browser-warning').style.display = 'block';
            return;
        }

        this.speech = new SpeechRecognition();
        this.speech.continuous = true;
        this.speech.interimResults = true;
        this.speech.lang = 'en-US';

        this.speech.onresult = (event) => {
            let transcript = '';
            let confidence = 0;
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                confidence = event.results[i][0].confidence;
            }
            this.handleSpeech(transcript, confidence);
        };

        this.speech.onend = () => {
            if (this.state === 'PLAYING') {
                try { this.speech.start(); } catch(e) {}
            }
        };
    }

    handleSpeech(transcript, confidence) {
        if (this.state !== 'PLAYING' || this.isCorrect) return;
        
        const t = transcript.toLowerCase().trim();
        const target = this.currentWord.word.toLowerCase();
        
        document.getElementById('transcript').textContent = `"${t}"`;
        
        // Exact match or contains the target
        if (t.includes(target)) {
            this.lastMatchedConfidence = confidence;
            this.triggerSuccess();
        }
    }

    triggerSuccess() {
        if (this.isCorrect) return;
        this.isCorrect = true;
        this.correctCount++;
        this.totalConfidence += this.lastMatchedConfidence;
        
        // Visual Feedback
        this.showFeedback('✅');
        this.showGrade(this.lastMatchedConfidence);
        document.getElementById('word-display').classList.add('word-success');
        this.createExplosion();

        // Progressive Difficulty
        // We allow the user a small window to see the success before moving to next word
        // or wait for the ring to naturally pass if it's close.
        if (this.ringPos > 80) {
            // Instant transition if we are close to collision
            this.speedUpAndNext();
        } else {
            // Speed up to 100% to pass through quickly
            const passInterval = setInterval(() => {
                this.ringPos += 2;
                if (this.ringPos >= 100) {
                    clearInterval(passInterval);
                    this.speedUpAndNext();
                }
            }, 10);
        }
    }

    speedUpAndNext() {
        this.score += Math.round(10 * (1 + this.lastMatchedConfidence));
        document.getElementById('score-val').textContent = this.score;
        this.speed = Math.min(this.speed + 0.1, 5.0);
        this.nextWord();
    }

    showGrade(confidence) {
        const el = document.getElementById('grade-popup');
        const valEl = el.querySelector('.grade-val');
        const score = Math.round(confidence * 100);
        valEl.textContent = `${score}%`;
        
        let color = '#ef4444';
        if (score > 85) color = '#22c55e';
        else if (score > 60) color = '#eab308';
        
        valEl.style.color = color;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 800);
    }

    showFeedback(text) {
        const el = document.getElementById('feedback');
        el.textContent = text;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1000);
    }

    start() {
        this.state = 'PLAYING';
        this.score = 0;
        this.speed = 1.0;
        this.ringPos = 0;
        this.correctCount = 0;
        this.totalConfidence = 0;
        this.nextWord();
        
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-over-screen').classList.remove('active');
        document.getElementById('hud').style.opacity = '1';
        document.getElementById('game-ui').style.opacity = '1';
        document.getElementById('score-val').textContent = '0';
        
        if (this.speech) {
            try { this.speech.start(); } catch(e) {}
            document.getElementById('mic-status').classList.add('listening');
            document.getElementById('mic-text').textContent = 'Listening...';
        }
    }

    nextWord() {
        // Pick words based on score (progression)
        let filtered = WORD_LIST;
        if (this.score < 100) filtered = WORD_LIST.filter(w => w.difficulty === 'easy');
        else if (this.score < 300) filtered = WORD_LIST.filter(w => w.difficulty !== 'hard');
        else filtered = WORD_LIST.filter(w => w.difficulty !== 'easy');

        const last = this.currentWord;
        do {
            this.currentWord = filtered[Math.floor(Math.random() * filtered.length)];
        } while (last && this.currentWord.word === last.word);
        
        this.isCorrect = false;
        this.ringPos = 0;
        document.getElementById('word-display').textContent = this.currentWord.word;
        document.getElementById('word-display').classList.remove('word-success');
        document.getElementById('transcript').textContent = '';
        this.generateOptions();
    }

    generateOptions() {
        const container = document.getElementById('options');
        container.innerHTML = '';
        const others = WORD_LIST
            .filter(w => w.word !== this.currentWord.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
            .map(w => w.word);
        
        const opts = [this.currentWord.word, ...others].sort(() => Math.random() - 0.5);
        opts.forEach(o => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.textContent = o;
            btn.onclick = () => {
                if (o === this.currentWord.word) {
                    this.lastMatchedConfidence = 0.5; // Penalty for manual click
                    this.triggerSuccess();
                } else {
                    this.gameOver("Wrong word selected!");
                }
            };
            container.appendChild(btn);
        });
    }

    gameOver(reason) {
        this.state = 'GAME_OVER';
        if (this.speech) this.speech.stop();
        
        const avgConfidence = this.correctCount > 0 ? (this.totalConfidence / this.correctCount) : 0;
        
        document.getElementById('hud').style.opacity = '0';
        document.getElementById('game-ui').style.opacity = '0';
        document.getElementById('mic-status').classList.remove('listening');
        
        // Update Game Over Stats
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('avg-accuracy').textContent = `${Math.round(avgConfidence * 100)}%`;
        document.getElementById('total-words').textContent = this.correctCount;
        document.getElementById('death-reason').textContent = reason;
        document.getElementById('game-over-screen').classList.add('active');
        
        this.showFeedback('❌');

        // Report to Platform
        this.reportScore();
    }

    reportScore() {
        // Post message to parent window (Playza Platform)
        const payload = {
            type: 'GAME_OVER',
            score: this.score,
            accuracy: this.totalConfidence / (this.correctCount || 1),
            wordsSolved: this.correctCount,
            gameId: 'pronunciation-ring-rush'
        };
        console.log("Reporting score to platform:", payload);
        window.parent.postMessage(payload, '*');
    }

    createExplosion() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height * 0.45;
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: cx,
                y: cy,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 0.5) * 25,
                life: 1.0,
                color: Math.random() > 0.5 ? '#22c55e' : '#ffffff',
                size: Math.random() * 4 + 2
            });
        }
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Progress handled manually in triggerSuccess if correct
        if (!this.isCorrect) {
            this.ringPos += this.speed * dt * 0.05;
            document.getElementById('progress-bar').style.width = this.ringPos + '%';

            if (this.ringPos >= 100) {
                this.gameOver("Collision! You hit the tunnel wall.");
            }
        }

        this.tunnelZ += this.speed * dt * 0.1;

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 0.002;
            return p.life > 0;
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height * 0.45;

        // Draw Tunnel Lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        
        const step = 50;
        for (let z = 0; z < 500; z += step) {
            const offset = (z - (this.tunnelZ % step));
            const scale = 80 / (80 + offset);
            if (scale <= 0) continue;

            const r = (canvas.width * 0.4) * (1 - scale);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // The Ring (Gate)
        const ringScale = this.ringPos / 100;
        const baseR = canvas.width * 0.05;
        const targetR = canvas.width * 0.35;
        const ringRadius = baseR + (ringScale * (targetR - baseR));
        const alpha = Math.max(0, (this.ringPos - 10) / 90);

        ctx.save();
        ctx.translate(cx, cy);
        
        const ringColor = this.isCorrect ? '34, 197, 94' : '255, 255, 255';
        
        // Glow Effect
        const grad = ctx.createRadialGradient(0, 0, ringRadius - 15, 0, 0, ringRadius + 15);
        grad.addColorStop(0, `rgba(${ringColor}, 0)`);
        grad.addColorStop(0.5, `rgba(${ringColor}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${ringColor}, 0)`);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Sharp Line
        ctx.strokeStyle = `rgba(${ringColor}, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();

        // Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    animate(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.update(dt || 0);
        this.draw();
        requestAnimationFrame(this.animate);
    }
}

// Global instance
window.game = new Game();
