// ----------------------------- DICTIONARY & PUZZLE DATA ---------------------------------
const WORD_DICT = new Set([
  "adventure", "beautiful", "challenge", "diamond", "explore", "freedom", "garden", "history",
  "imagine", "journey", "knowledge", "language", "mountain", "network", "perfect", "quality",
  "rainbow", "success", "thunder", "unicorn", "victory", "weather", "yellow", "zodiac",
  "ancient", "bravery", "capture", "danger", "energy", "future", "galaxy", "harmony",
  "island", "jungle", "kingdom", "legend", "mystery", "nature", "origin", "planet",
  "quest", "rhythm", "spirit", "treasure", "unknown", "vision", "wonder", "zephyr",
  "always", "bright", "castle", "dream", "eagle", "forest", "giant", "heart", "inner",
  "joyful", "knight", "lovely", "magic", "night", "other", "power", "quite", "river",
  "storm", "truth", "under", "voice", "world", "xenon", "youth", "zebra", "action",
  "bridge", "coffee", "design", "escape", "flight", "guitar", "humble", "intense",
  "object", "player", "rocket", "silent", "target", "unique", "vessel", "window",
  "aurora", "blast", "crisp", "delta", "echo", "frost", "glare", "house", "allege",
  "change", "glean", "angel", "leach", "clean", "tenure", "tread", "trade", "advent"
]);

const LEVEL_TEMPLATES = [
  {
    name: "adventure_path",
    required: ["adventure", "nature", "tenure", "advent", "under", "trade", "enter", "tread"],
    gridCols: 11, gridRows: 11,
    placements: [
      { word: "adventure", row: 4, col: 1, dir: "H" },
      { word: "nature", row: 1, col: 6, dir: "V" }, // T at 4,6
      { word: "tenure", row: 1, col: 4, dir: "H" }, // N at 1,6
      { word: "advent", row: 4, col: 1, dir: "V" }, // A at 4,1
      { word: "under", row: 4, col: 7, dir: "V" }, // U at 4,7
      { word: "trade", row: 1, col: 4, dir: "V" }, // T at 1,4, E at 4,4
      { word: "enter", row: 6, col: 4, dir: "H" }, // T at 6,6, E at 6,7
      { word: "tread", row: 8, col: 5, dir: "H" }, // E at 8,7
    ]
  },
  {
    name: "challenge_mode",
    required: ["challenge", "change", "allege", "leach", "clean", "angel", "eagle", "glean"],
    gridCols: 13, gridRows: 11,
    placements: [
      { word: "challenge", row: 3, col: 1, dir: "H" },
      { word: "change", row: 3, col: 1, dir: "V" },
      { word: "allege", row: 3, col: 3, dir: "V" },
      { word: "leach", row: 1, col: 3, dir: "V" }, // A at 3,3
      { word: "clean", row: 1, col: 2, dir: "H" }, // L at 1,3
      { word: "angel", row: 1, col: 7, dir: "V" }, // G at 3,7
      { word: "eagle", row: 4, col: 7, dir: "H" }, // E at 4,7
      { word: "glean", row: 7, col: 3, dir: "H" }, // G at 7,3
    ]
  }
];

let LEVELS = []; 
let currentLevelIdx = 0;
let currentLevel = null;
let currentWordSolvingIdx = 0; 
let gridModel = [];
let solvedWordsSet = new Set();
let totalRequiredWords = 0;
let score = 0;
let combo = 0;
let hintsLeft = 3;
let selectedIndices = []; 
let wheelLetters = [];
let wheelElements = [];
let isDragging = false;
let canvasCtx = null;
let audioEnabled = true;

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function getRandomSubset(str, count) {
    let result = "";
    for(let i=0; i<count; i++) result += ALPHABET[Math.floor(Math.random()*26)];
    return result.split("");
}

function playBeep(type) {
  if (!audioEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    let freq = 800;
    let duration = 0.12;
    if (type === "success") { freq = 1200; duration = 0.2; gain.gain.value = 0.3; }
    else if (type === "error") { freq = 400; duration = 0.18; gain.gain.value = 0.25; }
    else if (type === "swipe") { freq = 900; duration = 0.05; gain.gain.value = 0.1; }
    else if (type === "complete") { freq = 1400; duration = 0.35; gain.gain.value = 0.4; }
    osc.frequency.value = freq;
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function buildGridFromLevel(level) {
  const rows = level.gridRows;
  const cols = level.gridCols;
  const grid = Array(rows).fill().map(() => Array(cols).fill().map(() => ({ letter: "", isFixed: false, label: "" })));
  
  level.placements.forEach((pl, index) => {
    const word = pl.word;
    for (let i = 0; i < word.length; i++) {
        let r = pl.row, c = pl.col;
        if (pl.dir === "H") c = pl.col + i; else r = pl.row + i;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
            if (!grid[r][c].letter) grid[r][c].letter = word[i];
            grid[r][c].isFixed = true;
            if (i === 0) {
                if (!grid[r][c].label) {
                    grid[r][c].label = (index + 1).toString();
                } else {
                    // Avoid duplicate labels if possible, but keep tracking
                    if (!grid[r][c].label.includes((index + 1).toString())) {
                        grid[r][c].label += `/${index + 1}`;
                    }
                }
            }
        }
    }
  });
  return grid;
}

function renderGridUI() {
  const gridContainer = document.getElementById("crosswordGrid");
  const rows = currentLevel.gridRows;
  const cols = currentLevel.gridCols;
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridContainer.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = gridModel[i][j];
      const div = document.createElement("div");
      div.className = "grid-cell";
      if (!cell.isFixed) div.classList.add("hidden-cell");
      
      if (cell.label && cell.isFixed) {
          const label = document.createElement("span");
          label.className = "cell-label";
          label.textContent = cell.label;
          div.appendChild(label);
      }

      const textSpan = document.createElement("span");
      if (cell.isFixed && cell.filledLetter) {
        textSpan.textContent = cell.filledLetter.toUpperCase();
        div.classList.add("filled");
      }
      div.appendChild(textSpan);
      gridContainer.appendChild(div);
    }
  }
}

function updateProgressBar() {
  const solved = solvedWordsSet.size;
  const total = totalRequiredWords;
  const percent = total === 0 ? 0 : (solved / total) * 100;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressPercent").innerText = `${Math.floor(percent)}%`;
  if (solved === total && total > 0) {
    levelCompleteCelebration();
  }
}

function levelCompleteCelebration() {
  playBeep("complete");
  const msgDiv = document.getElementById("feedbackMsg");
  msgDiv.innerHTML = "🎉 LEVEL COMPLETE! 🎉 +1000 BONUS";
  score += 1000;
  updateScoreUI();
  createConfetti();
  setTimeout(() => {
    if (currentLevelIdx + 1 < LEVELS.length) {
      currentLevelIdx++;
      loadLevel(currentLevelIdx);
    } else {
      msgDiv.innerHTML = "🏆 YOU BEAT THE GAME! 🏆 Play Daily soon!";
      if (window.parent !== window) window.parent.postMessage({ type: "GAME_COMPLETE", score: score }, "*");
    }
  }, 2200);
}

function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const conf = document.createElement("div");
    conf.style.position = "fixed"; conf.style.width = "8px"; conf.style.height = "8px";
    conf.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    conf.style.left = Math.random() * window.innerWidth + "px"; conf.style.top = "-20px";
    conf.style.pointerEvents = "none"; conf.style.zIndex = "999"; conf.style.borderRadius = "50%";
    document.body.appendChild(conf);
    let fall = 0;
    const interval = setInterval(() => {
      fall += 5; conf.style.top = fall + "px";
      if (fall > window.innerHeight) { clearInterval(interval); conf.remove(); }
    }, 20);
    setTimeout(() => { if (conf) conf.remove(); }, 2000);
  }
}

function updateScoreUI() {
  document.getElementById("scoreValue").innerText = score;
  document.getElementById("comboValue").innerText = combo;
}

function submitWord(word) {
  if (word.length < 3) {
    showFeedback("⚠️ No!", true);
    resetSelection();
    return false;
  }
  const lowerWord = word.toLowerCase();
  const targetReq = currentLevel.required[currentWordSolvingIdx].toLowerCase();
  
  if (lowerWord === targetReq) {
      const placement = currentLevel.placements[currentWordSolvingIdx];
      const wordChars = placement.word.split("");
      for (let i = 0; i < wordChars.length; i++) {
        let r = placement.row, c = placement.col;
        if (placement.dir === "H") c = placement.col + i; else r = placement.row + i;
        if (gridModel[r] && gridModel[r][c]) gridModel[r][c].filledLetter = wordChars[i];
      }
      solvedWordsSet.add(placement.word);
      renderGridUI();
      playBeep("success");
      showFeedback(`✅ ${word.toUpperCase()}!`, false);
      score += word.length * 50;
      combo++;
      updateScoreUI();
      resetSelection();
      
      if (currentWordSolvingIdx + 1 < currentLevel.required.length) {
          currentWordSolvingIdx++;
          setTimeout(() => prepareWheelForWord(), 800);
      }
      updateProgressBar();
      return true;
  }

  if (WORD_DICT.has(lowerWord)) {
      playBeep("success");
      score += word.length * 20;
      updateScoreUI();
      showFeedback(`✨ BONUS! ${word.toUpperCase()} ✨`, false);
      resetSelection();
      return true;
  }

  showFeedback("❌ Try again!", true);
  resetSelection();
  combo = 0;
  updateScoreUI();
  return false;
}

function showFeedback(msg, isError) {
  const fb = document.getElementById("feedbackMsg");
  fb.innerText = msg;
  fb.style.color = isError ? "#ff8a7a" : "#cafc6e";
  if (isError) {
    document.querySelector(".game-container").classList.add("shake-effect");
    setTimeout(() => document.querySelector(".game-container").classList.remove("shake-effect"), 400);
    playBeep("error");
  }
  setTimeout(() => { if (fb.innerText === msg) fb.innerText = `🔍 Solve Word #${currentWordSolvingIdx+1}`; }, 2000);
}

function buildWheel(lettersArray) {
  const container = document.getElementById("lettersWheel");
  container.innerHTML = "";
  wheelElements = [];
  lettersArray.forEach((ch, idx) => {
    const btn = document.createElement("div");
    btn.className = "letter-btn"; btn.textContent = ch.toUpperCase();
    btn.setAttribute("data-idx", idx); btn.setAttribute("data-letter", ch);
    container.appendChild(btn); wheelElements.push(btn);
  });
  positionWheelLetters(); attachWheelEvents(); drawLinesClean();
}

function positionWheelLetters() {
  const wheelWrapper = document.querySelector(".wheel-wrapper");
  if (!wheelWrapper) return;
  const wheelDiv = document.getElementById("lettersWheel");
  const btns = Array.from(wheelDiv.children);
  const count = btns.length;
  
  const w = wheelWrapper.offsetWidth;
  const h = wheelWrapper.offsetHeight;
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = w * 0.36; // Keep letters within the wheel circle
  
  btns.forEach((btn, idx) => {
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    const btnW = btn.offsetWidth || 56;
    const btnH = btn.offsetHeight || 56;
    
    const x = centerX + radius * Math.cos(angle) - (btnW / 2);
    const y = centerY + radius * Math.sin(angle) - (btnH / 2);
    
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.position = "absolute";
  });
}

function attachWheelEvents() {
  const btns = wheelElements;
  const startDrag = (e, startIdx) => { isDragging = true; selectedIndices = [startIdx]; highlightSelected(); drawLines(); playBeep("swipe"); };
  const onMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    const elem = document.elementsFromPoint(x, y).find((el) => el.classList && el.classList.contains("letter-btn"));
    if (elem) {
      const idx = parseInt(elem.getAttribute("data-idx"));
      if (!selectedIndices.includes(idx)) { selectedIndices.push(idx); highlightSelected(); drawLines(); playBeep("swipe"); }
    }
  };
  const endDrag = () => { if (isDragging && selectedIndices.length > 0) {
      const word = selectedIndices.map((i) => wheelLetters[i]).join("");
      submitWord(word);
    }
    resetSelection(); isDragging = false; drawLinesClean();
  };
  btns.forEach((btn, idx) => {
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); startDrag(e, idx); });
    btn.addEventListener("touchstart", (e) => { e.preventDefault(); startDrag(e, idx); });
  });
  window.addEventListener("pointermove", onMove); window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("pointerup", endDrag); window.addEventListener("touchend", endDrag);
}

function highlightSelected() {
  wheelElements.forEach((el, i) => { if (selectedIndices.includes(i)) el.classList.add("selected"); else el.classList.remove("selected"); });
}

function drawLines() {
  if (!canvasCtx) return;
  const canvas = document.getElementById("wheelCanvas");
  const rect = canvas.getBoundingClientRect(); canvas.width = rect.width; canvas.height = rect.height;
  const ctx = canvasCtx; ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (selectedIndices.length < 2) return;
  const points = [];
  for (let idx of selectedIndices) {
    const btn = wheelElements[idx]; if (!btn) continue;
    const btnRect = btn.getBoundingClientRect(); const canvasRect = canvas.getBoundingClientRect();
    const centerX = (btnRect.left + btnRect.right) / 2 - canvasRect.left;
    const centerY = (btnRect.top + btnRect.bottom) / 2 - canvasRect.top;
    points.push({ x: centerX, y: centerY });
  }
  ctx.beginPath(); ctx.strokeStyle = "#facc15"; ctx.lineWidth = 4; ctx.shadowBlur = 4; ctx.shadowColor = "cyan"; ctx.lineCap = "round";
  for (let i = 0; i < points.length - 1; i++) { ctx.beginPath(); ctx.moveTo(points[i].x, points[i].y); ctx.lineTo(points[i + 1].x, points[i + 1].y); ctx.stroke(); }
}

function drawLinesClean() { if (canvasCtx) { const canvas = document.getElementById("wheelCanvas"); const ctx = canvasCtx; ctx.clearRect(0, 0, canvas.width, canvas.height); } }
function resetSelection() { selectedIndices = []; highlightSelected(); drawLinesClean(); }

function shuffleWheel() {
  for (let i = wheelLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wheelLetters[i], wheelLetters[j]] = [wheelLetters[j], wheelLetters[i]];
  }
  buildWheel(wheelLetters); resetSelection();
}

function hintAction() {
  if (hintsLeft <= 0) { showFeedback("No hints!", true); return; }
  const targetWord = currentLevel.required[currentWordSolvingIdx];
  const placement = currentLevel.placements[currentWordSolvingIdx];
  for (let i = 0; i < targetWord.length; i++) {
      let r = placement.row, c = placement.col;
      if (placement.dir === "H") c = placement.col + i; else r = placement.row + i;
      if (!gridModel[r][c]?.filledLetter) {
        gridModel[r][c].filledLetter = targetWord[i];
        hintsLeft--; renderGridUI();
        showFeedback(`🔍 Hint: Added '${targetWord[i].toUpperCase()}'!`, false);
        return;
      }
  }
}

function prepareWheelForWord() {
    const targetWord = currentLevel.required[currentWordSolvingIdx];
    let pool = targetWord.split("");
    const noiseCount = Math.max(2, 6 - pool.length);
    const noiseLetters = getRandomSubset(ALPHABET, noiseCount);
    wheelLetters = [...pool, ...noiseLetters].sort(() => Math.random() - 0.5);
    buildWheel(wheelLetters);
    showFeedback(`🔍 Word #${currentWordSolvingIdx + 1}`, false);
}

function loadLevel(levelIndex) {
  currentLevel = LEVELS[levelIndex];
  currentWordSolvingIdx = 0;
  totalRequiredWords = currentLevel.required.length;
  solvedWordsSet.clear();
  gridModel = buildGridFromLevel(currentLevel);
  renderGridUI();
  updateProgressBar();
  prepareWheelForWord();
  score = Math.max(score, 0); combo = 0; hintsLeft = 3;
  updateScoreUI();
  document.getElementById("levelValue").innerText = levelIndex + 1;
}

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheelCanvas");
  canvasCtx = canvas.getContext("2d");
  // Only use verified templates
  LEVELS = LEVEL_TEMPLATES.sort(() => Math.random() - 0.5);
  loadLevel(currentLevelIdx);
  document.getElementById("shuffleBtn").onclick = shuffleWheel;
  document.getElementById("hintBtn").onclick = hintAction;
  window.addEventListener("resize", () => { positionWheelLetters(); drawLinesClean(); });
  document.body.addEventListener('click', () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (new AudioCtx().state === 'suspended') new AudioCtx().resume();
  }, { once: true });
});
