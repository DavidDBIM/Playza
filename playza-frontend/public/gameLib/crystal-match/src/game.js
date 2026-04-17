import { sdk } from './sdk.js';

const GRID_SIZE = 8;
const COLORS = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#d946ef', '#06b6d4'];
const GEM_NAMES = ['Ruby', 'Emerald', 'Sapphire', 'Topaz', 'Amethyst', 'Aquamarine'];
const GEM_IMAGES = ['red', 'green', 'blue', 'yellow', 'purple', 'pink'];
const LEVEL_TARGETS = Array.from({length: 50}, (_, i) => 2000 + i * 1500);
const GAME_TIME = 420;

export class CrystalMatch {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = [];
        this.selectedGem = null;
        this.cursorPos = { r: 3, c: 3 };
        this.isAnimating = false;
        this.score = 0;
        this.levelStartScore = 0;
        this.combo = 1;
        this.timeLeft = GAME_TIME;
        this.level = 1;
        this.targetScore = LEVEL_TARGETS[0];
        this.bestScore = this.loadBestScore();
        this.particles = [];
        this.floatingTexts = [];
        this.gameOver = false;
        this.levelComplete = false;
        this.lastUpdate = 0;
        this.shakeTime = 0;
        this.cellSize = 60;
        this.isPaused = false;
        this.gemImages = {};
        this.imagesLoaded = 0;

        this.loadImages();
    }

    loadImages() {
        GEM_IMAGES.forEach((name, index) => {
            const img = new Image();
            img.src = `public/images/${name}.png`;
            img.onload = () => {
                this.imagesLoaded++;
                if (this.imagesLoaded === GEM_IMAGES.length) {
                    this.initGame();
                }
            };
            this.gemImages[index] = img;
        });
    }

    initGame() {
        this.resize();
        this.initGrid();
        this.setupEventListeners();
        this.animate(0);
        this.startTimer();
        window.addEventListener('resize', () => this.resize());
        sdk.ready();
    }

    loadBestScore() {
        try {
            return parseInt(localStorage.getItem('crystalmatch_best') || '0', 10);
        } catch { return 0; }
    }

    saveBestScore(score) {
        try {
            if (score > this.bestScore) {
                localStorage.setItem('crystalmatch_best', score.toString());
                this.bestScore = score;
            }
        } catch {}
    }

    resize() {
        const containerWidth = Math.min(window.innerWidth - 30, 480);
        this.cellSize = containerWidth / GRID_SIZE;
        this.canvas.width = containerWidth;
        this.canvas.height = this.cellSize * GRID_SIZE; 
        
        for (let r = 0; r < GRID_SIZE; r++) {
            if (!this.grid[r]) continue;
            for (let c = 0; c < GRID_SIZE; c++) {
                const gem = this.grid[r][c];
                gem.targetX = c * this.cellSize;
                gem.targetY = r * this.cellSize;
                gem.x = gem.targetX;
                gem.y = gem.targetY;
            }
        }
    }

    initGrid(allowMatches = false) {
        for (let r = 0; r < GRID_SIZE; r++) {
            this.grid[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                this.grid[r][c] = this.createGem(r, c);
            }
        }
        if (allowMatches) {
            this.shuffleGrid();
            while (this.findMatches().length > 0 || !this.hasPossibleMoves()) {
                this.shuffleGrid();
            }
        } else {
            while (this.findMatches().length > 0) {
                this.shuffleGrid();
            }
            if (!this.hasPossibleMoves()) {
                this.shuffleGrid();
                while (this.findMatches().length > 0 || !this.hasPossibleMoves()) {
                    this.shuffleGrid();
                }
            }
        }
    }

    createGem(r, c) {
        return {
            type: Math.floor(Math.random() * COLORS.length),
            x: c * this.cellSize,
            y: -this.cellSize * 5 + (r * this.cellSize), 
            targetX: c * this.cellSize,
            targetY: r * this.cellSize,
            isMatching: false,
            isPrismatic: false,
            isRowBlast: false,
            isBomb: false,
            isColorClear: false,
            scale: 1,
            alpha: 1
        };
    }

    shuffleGrid() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                this.grid[r][c].type = Math.floor(Math.random() * COLORS.length);
            }
        }
    }

    setupEventListeners() {
        const getPointerPos = (e) => {
             const rect = this.canvas.getBoundingClientRect();
             const scaleX = this.canvas.width / rect.width;
             const scaleY = this.canvas.height / rect.height;
             return {
                 x: (e.clientX - rect.left) * scaleX,
                 y: (e.clientY - rect.top) * scaleY
             };
        };

        // Mouse support (desktop)
        this.canvas.addEventListener('mousedown', (e) => {
             const pos = getPointerPos(e);
             this.handlePointer(pos.x, pos.y);
        });
        // Touch handled externally in main.js (swipe detection)
    }

    handlePointer(x, y) {
        if (this.isAnimating) return;

        if (this.gameOver || this.levelComplete) {
            this.restart();
            return;
        }

        const c = Math.floor(x / this.cellSize);
        const r = Math.floor(y / this.cellSize);

        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;

        if (!this.selectedGem) {
            this.selectedGem = { r, c };
        } else {
            const dr = Math.abs(this.selectedGem.r - r);
            const dc = Math.abs(this.selectedGem.c - c);

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                this.swapGems(this.selectedGem, { r, c });
                this.selectedGem = null;
            } else {
                this.selectedGem = { r, c };
            }
        }
    }

    moveCursor(dr, dc) {
        if (this.gameOver) return;
        const newR = this.cursorPos.r + dr;
        const newC = this.cursorPos.c + dc;
        if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE) {
            this.cursorPos = { r: newR, c: newC };
        }
    }

    actionCursor() {
        if (this.gameOver || this.isAnimating) return;
        const { r, c } = this.cursorPos;

        if (!this.selectedGem) {
            this.selectedGem = { r, c };
        } else {
            const dr = Math.abs(this.selectedGem.r - r);
            const dc = Math.abs(this.selectedGem.c - c);

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                this.swapGems(this.selectedGem, { r, c });
                this.selectedGem = null;
            } else {
                this.selectedGem = { r, c };
            }
        }
    }

    async swapGems(p1, p2, isUndo = false) {
        this.isAnimating = true;
        
        const gem1 = this.grid[p1.r][p1.c];
        const gem2 = this.grid[p2.r][p2.c];
        
        gem1.targetX = p2.c * this.cellSize;
        gem1.targetY = p2.r * this.cellSize;
        gem2.targetX = p1.c * this.cellSize;
        gem2.targetY = p1.r * this.cellSize;

        [this.grid[p1.r][p1.c], this.grid[p2.r][p2.c]] = [this.grid[p2.r][p2.c], this.grid[p1.r][p1.c]];

        await new Promise(res => setTimeout(res, 300));

        if (!isUndo) {
            const matchesDetailed = this.findMatchesWithDetails();
            if (matchesDetailed.length > 0) {
                this.processMatchesDetailed(matchesDetailed);
            } else {
                this.swapGems(p1, p2, true);
            }
        } else {
            this.isAnimating = false;
        }
    }

    findMatchesWithDetails() {
        const matches = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            let rowMatch = [{ r, c: 0, type: this.grid[r][0].type }];
            for (let c = 1; c < GRID_SIZE; c++) {
                if (this.grid[r][c].type === rowMatch[0].type) {
                    rowMatch.push({ r, c, type: this.grid[r][c].type });
                } else {
                    if (rowMatch.length >= 3) matches.push([...rowMatch]);
                    rowMatch = [{ r, c, type: this.grid[r][c].type }];
                }
            }
            if (rowMatch.length >= 3) matches.push(rowMatch);
        }
        for (let c = 0; c < GRID_SIZE; c++) {
            let colMatch = [{ r: 0, c, type: this.grid[0][c].type }];
            for (let r = 1; r < GRID_SIZE; r++) {
                if (this.grid[r][c].type === colMatch[0].type) {
                    colMatch.push({ r, c, type: this.grid[r][c].type });
                } else {
                    if (colMatch.length >= 3) matches.push([...colMatch]);
                    colMatch = [{ r, c, type: this.grid[r][c].type }];
                }
            }
            if (colMatch.length >= 3) matches.push(colMatch);
        }
        return matches;
    }

    findMatches() {
        const set = new Set();
        this.findMatchesWithDetails().forEach(match => {
            match.forEach((m) => set.add(`${m.r},${m.c}`));
        });
        return Array.from(set).map(s => { const [r,c] = s.split(',').map(Number); return {r,c}; });
    }

    hasPossibleMoves() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (c < GRID_SIZE - 1) {
                    this.swapInGrid(r, c, r, c + 1);
                    if (this.findMatches().length > 0) { this.swapInGrid(r, c, r, c + 1); return true; }
                    this.swapInGrid(r, c, r, c + 1);
                }
                if (r < GRID_SIZE - 1) {
                    this.swapInGrid(r, c, r + 1, c);
                    if (this.findMatches().length > 0) { this.swapInGrid(r, c, r + 1, c); return true; }
                    this.swapInGrid(r, c, r + 1, c);
                }
            }
        }
        return false;
    }

    swapInGrid(r1, c1, r2, c2) {
        const temp = this.grid[r1][c1].type;
        this.grid[r1][c1].type = this.grid[r2][c2].type;
        this.grid[r2][c2].type = temp;
    }

    reshuffleWithMatch() {
        this.shuffleGrid();
        while (this.findMatches().length > 0 || !this.hasPossibleMoves()) {
            this.shuffleGrid();
        }
        this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2, "🔄 RESHUFFLE!", "#38bdf8");
    }

    async processMatchesDetailed(matchesArr) {
        let totalMatched = 0;
        let timeBonus = 0;
        
        matchesArr.forEach(match => {
            totalMatched += match.length;
            const center = match[Math.floor(match.length / 2)];
            
            match.forEach((m) => {
                const g = this.grid[m.r][m.c];
                if (g.isPrismatic) { this.clearCross(m.r, m.c); timeBonus += 3; }
                else if (g.isRowBlast) { this.clearRow(m.r); timeBonus += 2; }
                else if (g.isBomb) { this.clearBomb(m.r, m.c); timeBonus += 5; }
                else if (g.isColorClear) { this.clearColor(g.clearColor); timeBonus += 7; }
            });

            if (match.length >= 6) {
                this.grid[center.r][center.c].isBomb = true;
                this.addFloatingText(center.c * this.cellSize, center.r * this.cellSize, "💣 MEGA BOMB!", "#ff6b35"); 
            } else if (match.length === 5) {
                this.grid[center.r][center.c].isColorClear = true;
                this.grid[center.r][center.c].clearColor = match[0].type;
                this.combo = 6;
                this.addFloatingText(center.c * this.cellSize, center.r * this.cellSize, "🌈 SUPER RAINBOW COMBO 6!", "#fbbf24");
            } else if (match.length === 4) {
                this.grid[center.r][center.c].isPrismatic = true;
                this.addFloatingText(center.c * this.cellSize, center.r * this.cellSize, "⚡ POWER BLAST!", "#c084fc");
            } else if (match.length === 3) {
                if (Math.random() < 0.12) {
                    this.grid[center.r][center.c].isRowBlast = true;
                    this.addFloatingText(center.c * this.cellSize, center.r * this.cellSize, "💫 LINE BLAST!", COLORS[match[0].type]);
                }
            }

            match.forEach((m) => this.grid[m.r][m.c].isMatching = true);
        });

        this.score += totalMatched * 10 * this.combo;
        if (timeBonus > 0 && !this.levelComplete) {
            this.timeLeft = Math.min(this.timeLeft + timeBonus, GAME_TIME);
        }
        this.shakeTime = 0.3;
        await this.processFinalize();
    }

    clearCross(row, col) {
        for (let c = 0; c < GRID_SIZE; c++) this.grid[row][c].isMatching = true;
        for (let r = 0; r < GRID_SIZE; r++) this.grid[r][col].isMatching = true;
        this.shakeTime = 0.7;
        this.score += 300;
        this.addFloatingText(col * this.cellSize, row * this.cellSize, "⚡ CROSS BLAST!", "#c084fc");
    }

    clearRow(row) {
        for (let c = 0; c < GRID_SIZE; c++) this.grid[row][c].isMatching = true;
        this.shakeTime = 0.4;
        this.score += 150;
        this.addFloatingText(4 * this.cellSize, row * this.cellSize, "💫 ROW BLAST!", COLORS[this.grid[row][4]?.type || 0]);
    }

    clearBomb(row, col) {
        const startR = Math.max(0, row - 1);
        const endR = Math.min(GRID_SIZE - 1, row + 1);
        const startC = Math.max(0, col - 1);
        const endC = Math.min(GRID_SIZE - 1, col + 1);
        for (let r = startR; r <= endR; r++) {
            for (let c = startC; c <= endC; c++) {
                this.grid[r][c].isMatching = true;
            }
        }
        this.shakeTime = 0.6;
        this.score += 400;
        this.addFloatingText(col * this.cellSize, row * this.cellSize, "💥 EXPLOSION!", "#ff6b35");
    }

    clearColor(colorType) {
        let cleared = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.grid[r][c].type === colorType) {
                    this.grid[r][c].isMatching = true;
                    cleared++;
                }
            }
        }
        this.shakeTime = 0.6;
        this.score += Math.min(cleared * 50, 500);
        this.addFloatingText(GRID_SIZE * this.cellSize / 2, GRID_SIZE * this.cellSize / 2, `🌈 CLEARED ${cleared}!`, "#fbbf24");
    }

    async processFinalize() {
        for (let c = 0; c < GRID_SIZE; c++) {
            let emptySpaces = 0;
            for (let r = GRID_SIZE - 1; r >= 0; r--) {
                if (this.grid[r][c].isMatching) {
                    this.createParticles(c * this.cellSize, r * this.cellSize, COLORS[this.grid[r][c].type]);
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    const gem = this.grid[r][c];
                    this.grid[r + emptySpaces][c] = gem;
                    gem.targetY = (r + emptySpaces) * this.cellSize;
                }
            }
            for (let i = 0; i < emptySpaces; i++) this.grid[i][c] = this.createGem(i, c);
        }

        await new Promise(res => setTimeout(res, 400));
        
        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            this.combo++;
            this.processMatchesDetailed(this.findMatchesWithDetails());
        } else {
            this.combo = 1;
            if (!this.hasPossibleMoves() && !this.levelComplete && !this.gameOver) {
                this.reshuffleWithMatch();
                await new Promise(res => setTimeout(res, 600));
                this.isAnimating = false;
            } else {
                this.isAnimating = false;
            }
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x + this.cellSize/2, y: y + this.cellSize/2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                size: Math.random() * 6 + 2, alpha: 1, color
            });
        }
    }

    addFloatingText(x, y, text, color = '#f472b6') {
        this.floatingTexts.push({ x, y, text, alpha: 1, color });
    }

    startTimer() {
        const itv = setInterval(() => {
            if (this.gameOver || this.levelComplete || this.isPaused) { 
                clearInterval(itv); 
                return; 
            }
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.handleGameOver();
            }
        }, 1000);
    }

    handleLevelComplete() {
        this.levelComplete = true;
        this.isPaused = true;
        this.saveBestScore(this.score);
        this.levelStartScore = this.score;
        
        if (this.level >= LEVEL_TARGETS.length) {
            this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2, "🏆 ULTIMATE CHAMPION!", "#fbbf24");
            setTimeout(() => this.handleGameOver(), 3000);
            return;
        }
        
        const oldTime = this.timeLeft;
        this.level++;
        this.targetScore = LEVEL_TARGETS[this.level - 1];
        
        setTimeout(() => {
            this.levelComplete = false;
            this.isPaused = false;
            this.combo = 1;
            this.timeLeft = oldTime;
            this.initGrid(true);
            this.startTimer();
        }, 2000);
    }

    handleGameOver() {
        this.gameOver = true;
        this.isAnimating = true;
        this.saveBestScore(this.score);
        sdk.submitScore({ score: this.score, metadata: { game_id: 'crystal-match', category: 'Puzzle' } });
    }

    restart() {
        this.gameOver = false;
        this.levelComplete = false;
        this.isPaused = false;
        this.score = 0;
        this.combo = 1;
        this.timeLeft = GAME_TIME;
        this.level = 1;
        this.targetScore = LEVEL_TARGETS[0];
        this.particles = [];
        this.floatingTexts = [];
        this.selectedGem = null;
        this.initGrid();
        this.startTimer();
    }

    animate(time) {
        const dt = (time - this.lastUpdate) / 1000;
        this.lastUpdate = time;

        if (!this.levelComplete && !this.gameOver && this.score >= this.targetScore && !this.isAnimating) {
            this.handleLevelComplete();
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#0a0a1a";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        if (this.shakeTime > 0) {
            this.ctx.translate((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
            this.shakeTime -= dt;
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const gem = this.grid[r][c];
                gem.x += (gem.targetX - gem.x) * 0.25;
                gem.y += (gem.targetY - gem.y) * 0.25;
                if (gem.isMatching) gem.scale *= 0.75;

                this.ctx.save();
                this.ctx.translate(gem.x + this.cellSize / 2, gem.y + this.cellSize / 2);

                if (this.selectedGem?.r === r && this.selectedGem?.c === c) {
                     this.ctx.lineWidth = 4;
                     this.ctx.strokeStyle = "#fff";
                     this.ctx.strokeRect(-this.cellSize/2 + 3, -this.cellSize/2 + 3, this.cellSize - 6, this.cellSize - 6);
                     this.ctx.shadowBlur = 15; this.ctx.shadowColor = "#fff";
                }

                this.ctx.scale(gem.scale, gem.scale);
                
                if (gem.isBomb) {
                    this.ctx.shadowBlur = 30; this.ctx.shadowColor = "#ff4444";
                    this.ctx.fillStyle = "#1a1a2e";
                    this.ctx.beginPath(); this.ctx.arc(0, 0, (this.cellSize / 2) * 0.8, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = "#ff6b35";
                    this.ctx.beginPath(); this.ctx.arc(0, 0, (this.cellSize / 2) * 0.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = "#ffdd00";
                    this.ctx.beginPath(); this.ctx.arc(0, 0, (this.cellSize / 2) * 0.25, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (gem.isColorClear) {
                    this.ctx.shadowBlur = 40; this.ctx.shadowColor = "#fff";
                    const gradient = this.ctx.createLinearGradient(-this.cellSize/2, -this.cellSize/2, this.cellSize/2, this.cellSize/2);
                    gradient.addColorStop(0, COLORS[0]);
                    gradient.addColorStop(0.2, COLORS[1]);
                    gradient.addColorStop(0.4, COLORS[2]);
                    gradient.addColorStop(0.6, COLORS[3]);
                    gradient.addColorStop(0.8, COLORS[4]);
                    gradient.addColorStop(1, COLORS[5]);
                    this.ctx.fillStyle = gradient;
                    
                    this.ctx.save();
                    this.ctx.rotate(time / 600);
                    const outerRadius = (this.cellSize / 2) * 0.95;
                    const innerRadius = outerRadius * 0.4;
                    this.ctx.beginPath();
                    for (let i = 0; i < 12; i++) {
                        const r = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i * Math.PI) / 6;
                        this.ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.restore();
                    
                    this.ctx.fillStyle = "rgba(255,255,255,0.9)";
                    this.ctx.beginPath(); this.ctx.arc(0, 0, (this.cellSize / 2) * 0.2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (gem.isPrismatic) {
                    this.ctx.shadowBlur = 50; this.ctx.shadowColor = "#c084fc";
                    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.cellSize / 2);
                    gradient.addColorStop(0, "#ffffff");
                    gradient.addColorStop(0.5, "#c084fc");
                    gradient.addColorStop(1, "#8b5cf6");
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath(); this.ctx.arc(0, 0, (this.cellSize / 2) * 0.85, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i + time / 500;
                        this.ctx.moveTo(0, 0);
                        this.ctx.lineTo(Math.cos(angle) * this.cellSize * 0.4, Math.sin(angle) * this.cellSize * 0.4);
                    }
                    this.ctx.stroke();
                } else if (gem.isRowBlast) {
                    this.ctx.shadowBlur = 30; this.ctx.shadowColor = COLORS[gem.type];
                    const gradient = this.ctx.createLinearGradient(0, -this.cellSize/2, 0, this.cellSize/2);
                    gradient.addColorStop(0, COLORS[gem.type]);
                    gradient.addColorStop(0.5, "#fff");
                    gradient.addColorStop(1, COLORS[gem.type]);
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath(); this.ctx.roundRect(-this.cellSize * 0.35, -this.cellSize * 0.35, this.cellSize * 0.7, this.cellSize * 0.7, 8);
                    this.ctx.fill();
                } else {
                    if (this.gemImages[gem.type] && this.imagesLoaded === GEM_IMAGES.length) {
                        const img = this.gemImages[gem.type];
                        const size = this.cellSize - 6;
                        this.ctx.drawImage(img, -size/2, -size/2, size, size);
                    } else {
                        this.ctx.shadowBlur = 15; this.ctx.shadowColor = COLORS[gem.type];
                        this.ctx.fillStyle = COLORS[gem.type];
                        this.ctx.fillRect(-(this.cellSize - 6) / 2, -(this.cellSize - 6) / 2, this.cellSize - 6, this.cellSize - 6);
                    }
                }
                this.ctx.restore();
            }
        }
        this.ctx.restore();

        // Particles
        this.particles = this.particles.filter(p => (p.alpha -= 0.02) > 0);
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Floating combo texts
        this.floatingTexts = this.floatingTexts.filter(t => (t.alpha -= 0.02) > 0);
        this.floatingTexts.forEach(t => {
            t.y -= 2;
            this.ctx.globalAlpha = t.alpha;
            this.ctx.fillStyle = t.color || '#f472b6';
            this.ctx.font = "bold 18px 'Inter'";
            this.ctx.textAlign = "center";
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = t.color || '#f472b6';
            this.ctx.fillText(t.text, t.x + this.cellSize/2, t.y);
            this.ctx.shadowBlur = 0;
        });

        this.ctx.globalAlpha = 1;
        if (this.levelComplete) {
            this.ctx.fillStyle = "rgba(2, 6, 23, 0.9)"; 
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "#10b981"; 
            this.ctx.textAlign = "center";
            this.ctx.font = "italic 900 38px 'Outfit'"; 
            this.ctx.shadowBlur = 20; this.ctx.shadowColor = "#10b981";
            this.ctx.fillText(`LEVEL ${this.level} COMPLETE!`, this.canvas.width/2, this.canvas.height/2 - 30);
            
            this.ctx.shadowBlur = 0;
            this.ctx.font = "bold 24px 'Inter'"; 
            this.ctx.fillStyle = "#fff";
            this.ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.canvas.width/2, this.canvas.height/2 + 20);
            
            this.ctx.font = "14px 'Inter'"; 
            this.ctx.fillStyle = "#f472b6";
            this.ctx.fillText(`NEXT: LEVEL ${this.level + 1} - TARGET ${this.targetScore.toLocaleString()}`, this.canvas.width/2, this.canvas.height/2 + 55);
            
            this.ctx.font = "12px 'Inter'"; 
            this.ctx.fillStyle = "rgba(255,255,255,0.5)";
            this.ctx.fillText("GET READY...", this.canvas.width/2, this.canvas.height/2 + 90);
        } else if (this.gameOver) {
            this.ctx.fillStyle = "rgba(2, 6, 23, 0.95)"; 
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "#fff"; 
            this.ctx.textAlign = "center";
            
            const progress = Math.floor((this.score / this.targetScore) * 100);
            this.ctx.font = "italic 900 44px 'Outfit'"; 
            this.ctx.shadowBlur = 30; 
            if (this.score >= this.targetScore) {
                this.ctx.shadowColor = "#10b981";
                this.ctx.fillText("MISSION ACCOMPLISHED!", this.canvas.width/2, this.canvas.height/2 - 60);
            } else {
                this.ctx.shadowColor = "#ef4444";
                this.ctx.fillText("TIME'S UP!", this.canvas.width/2, this.canvas.height/2 - 60);
            }
            
            this.ctx.shadowBlur = 0;
            this.ctx.font = "900 32px 'Inter'"; 
            this.ctx.fillStyle = "#fff";
            this.ctx.fillText(`${this.score.toLocaleString()} PTS`, this.canvas.width/2, this.canvas.height/2 - 10);
            
            this.ctx.fillStyle = "rgba(255,255,255,0.4)";
            this.ctx.font = "14px 'Inter'";
            this.ctx.fillText(`TARGET: ${this.targetScore.toLocaleString()} (${progress}%)`, this.canvas.width/2, this.canvas.height/2 + 25);
            
            this.ctx.font = "14px 'Inter'"; 
            this.ctx.fillStyle = this.score >= this.bestScore ? "#f59e0b" : "rgba(255,255,255,0.5)";
            if (this.score >= this.bestScore && this.score > 0) {
                this.ctx.fillText("🎉 NEW PERSONAL BEST!", this.canvas.width/2, this.canvas.height/2 + 55);
            } else {
                this.ctx.fillText(`BEST: ${this.bestScore.toLocaleString()}`, this.canvas.width/2, this.canvas.height/2 + 55);
            }
            
            this.ctx.fillStyle = "rgba(255,255,255,0.35)";
            this.ctx.font = "12px 'Inter'"; 
            this.ctx.fillText(`REACHED LEVEL ${this.level}`, this.canvas.width/2, this.canvas.height/2 + 85);
            
            this.ctx.fillStyle = "rgba(255,255,255,0.25)";
            this.ctx.fillText("TAP TO PLAY AGAIN", this.canvas.width/2, this.canvas.height/2 + 120);
        }

        requestAnimationFrame((t) => this.animate(t));
    }
}
