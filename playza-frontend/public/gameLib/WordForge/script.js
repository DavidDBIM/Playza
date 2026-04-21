const WORD_SETS = [
  ["CAT", "DOG"], // 1
  ["SUN", "FUN"], // 2
  ["RED", "BLUE"], // 3
  ["ONE", "TWO"], // 4
  ["BIRD", "FISH"], // 5
  ["IRON", "GOLD", "CLAY"], // 6
  ["FIRE", "WATER", "WIND"], // 7
  ["SWORD", "BOW", "AXE"], // 8
  ["JUMP", "RUN", "WALK"], // 9
  ["NIGHT", "DAY", "DUSK"], // 10
  ["MILK", "TEA", "COFFEE"], // 11
  ["RAIN", "SNOW", "HAIL"], // 12
  ["LION", "TIGER", "BEAR"], // 13
  ["HEAD", "HAND", "FOOT"], // 14
  ["ROCK", "PAPER", "SCISSOR"], // 15
  ["TRUE", "FALSE", "NULL"], // 16
  ["KING", "QUEEN", "JACK"], // 17
  ["WOLF", "FOX", "HARE"], // 18
  ["FROST", "ICE", "COLD"], // 19
  ["TIME", "HOUR", "MINUTE"], // 20
  ["CIRCLE", "SQUARE", "OVAL"], // 21
  ["MARS", "VENUS", "EARTH"], // 22
  ["BREAD", "MEAT", "RICE"], // 23
  ["SHIP", "BOAT", "RAFT"], // 24
  ["NORTH", "SOUTH", "EAST"], // 25
  ["SPRING", "SUMMER", "FALL"], // 26
  ["HAPPY", "SAD", "ANGRY"], // 27
  ["EAGLE", "HAWK", "CROW"], // 28
  ["MUSIC", "SONG", "BEAT"], // 29
  ["FORGE", "ANVIL", "HAMMER"] // 30
];

const EXTRA_LETTERS = ["A", "E", "S", "R", "N", "L", "T"];
const BONUS_WORDS = new Set([
  "ART", "BAT", "BEAT", "COP", "DOG", "FORGE", "GOLD", "HAT", "ICE", "IRON",
  "RUN", "SON", "SUN", "TEA", "THE", "WATER", "WIND",
]);

// generate level configs
const levels = WORD_SETS.map((words) => {
  let pool = [];
  words.forEach(w => {
    for (let char of w) {
      pool.push(char);
    }
  });
  // Add 1 or 2 extra filler letters for a bit of challenge
  pool.push(EXTRA_LETTERS[Math.floor(Math.random() * EXTRA_LETTERS.length)]);
  if (Math.random() > 0.5) {
    pool.push(EXTRA_LETTERS[Math.floor(Math.random() * EXTRA_LETTERS.length)]);
  }
  // shuffle
  pool.sort(() => Math.random() - 0.5);
  return {
    targetWords: words,
    letterPool: pool,
    hintsUsed: 0
  };
});

let gameData = {
  currentTargets: [], // [{word, filled: false, slots:[]}]
  solvedWords: new Set(),
  lettersRemaining: [], // array of letter objects {char, id, usedInCurrentBuild?}
  selectedIndices: [], // indices from lettersRemaining that are currently selected for building
  currentBuildWord: "",
  score: 0,
  combo: 1,
  lastCorrectTimestamp: 0,
  activeLevel: 0,
  bonusWordCooldown: false,
  usedBonusWords: new Set(),
};

function loadLevel(levelIdx) {
  const level = levels[levelIdx];
  const targetList = level.targetWords.map((word) => ({
    word: word,
    filled: false,
    slots: word.split(""),
  }));
  let lettersArray = [];
  for (let i = 0; i < level.letterPool.length; i++) {
    lettersArray.push({
      char: level.letterPool[i].toUpperCase(),
      id: Date.now() + i + Math.random(),
      used: false,
    });
  }
  gameData.currentTargets = targetList;
  gameData.solvedWords.clear();
  gameData.selectedIndices = [];
  gameData.currentBuildWord = "";
  gameData.combo = 1;
  gameData.lettersRemaining = lettersArray;
  gameData.activeLevel = levelIdx;
  gameData.usedBonusWords.clear();
  
  document.getElementById("levelIndicator").innerText = `LEVEL ${levelIdx + 1}`;
  updateScoreUI();
  updateComboUI();
  renderSlots();
  renderLetterPool();
  updatePreview();
}

function updateScoreUI() {
  document.getElementById("scoreValue").innerText = gameData.score;
}

function updateComboUI() {
  document.getElementById("comboValue").innerHTML = `x${gameData.combo}`;
}

function addPoints(basePoints = 100) {
  let points = basePoints * gameData.combo;
  gameData.score += points;
  updateScoreUI();
  gameData.combo = Math.min(gameData.combo + 1, 6);
  updateComboUI();
  showFloatingText(`+${points}`, "#FFD966");
}

function resetCombo() {
  gameData.combo = 1;
  updateComboUI();
}

function showFloatingText(text, color = "#FFB347") {
  const div = document.createElement("div");
  div.className = "combo-bonus";
  div.innerText = text;
  div.style.background = color;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 600);
}

function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    let freq = 800;
    let duration = 0.1;
    if (type === "tap") {
      freq = 650;
      duration = 0.05;
      gain.gain.value = 0.1;
    }
    if (type === "success") {
      freq = 1200;
      duration = 0.2;
      gain.gain.value = 0.15;
    }
    if (type === "error") {
      freq = 280;
      duration = 0.2;
      gain.gain.value = 0.12;
      osc.type = "sawtooth";
    }
    osc.frequency.value = freq;
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log("audio not supported");
  }
}

function validateAndSubmit() {
  const word = gameData.currentBuildWord;
  if (word.length === 0) return;
  let foundMatch = false;
  let matchedIndex = -1;
  for (let i = 0; i < gameData.currentTargets.length; i++) {
    const target = gameData.currentTargets[i];
    if (!target.filled && target.word === word) {
      foundMatch = true;
      matchedIndex = i;
      break;
    }
  }
  if (foundMatch) {
    gameData.currentTargets[matchedIndex].filled = true;
    gameData.solvedWords.add(word);
    
    let indicesToRemove = [...gameData.selectedIndices].sort((a, b) => b - a);
    for (let idx of indicesToRemove) {
      gameData.lettersRemaining.splice(idx, 1);
    }
    
    addPoints(100);
    playSound("success");
    animateSlotSuccess(matchedIndex);
    clearBuild();
    renderSlots();
    renderLetterPool();
    updatePreview();

    const allFilled = gameData.currentTargets.every((t) => t.filled === true);
    if (allFilled) {
      playSound("success");
      showCompletionAndNext();
    }
  } else {
    const normalizedWord = word.toUpperCase();
    if (word.length >= 3 && !gameData.solvedWords.has(word) && !gameData.usedBonusWords.has(normalizedWord) && BONUS_WORDS.has(normalizedWord)) {
      gameData.usedBonusWords.add(normalizedWord);
      addPoints(25);
      playSound("success");
      showFloatingText("✨ NICE! +25 ✨", "#FFB347");
      clearBuild();
      renderLetterPool();
      updatePreview();
      const previewDiv = document.getElementById("previewWord");
      previewDiv.style.transform = "scale(1.05)";
      setTimeout(() => (previewDiv.style.transform = ""), 150);
      return;
    } else {
      playSound("error");
      const builderDiv = document.querySelector(".builder-preview");
      builderDiv.classList.add("shake-animation");
      setTimeout(() => builderDiv.classList.remove("shake-animation"), 400);
      resetCombo();
      clearBuild();
      updatePreview();
      renderLetterPool();
    }
  }
}

function animateSlotSuccess(index) {
  const slotDivs = document.querySelectorAll(".slot-item");
  if (slotDivs[index]) {
    const lettersDivs = slotDivs[index].querySelectorAll(".slot-letter");
    lettersDivs.forEach((ld) => {
      ld.classList.add("success-flash");
      setTimeout(() => ld.classList.remove("success-flash"), 300);
    });
  }
}

function clearBuild() {
  gameData.selectedIndices = [];
  gameData.currentBuildWord = "";
  updatePreview();
  renderLetterPool();
}

function popLastLetter() {
  if (gameData.selectedIndices.length > 0) {
    gameData.selectedIndices.pop();
    gameData.currentBuildWord = gameData.currentBuildWord.slice(0, -1);
    playSound("tap");
    updatePreview();
    renderLetterPool();
  }
}

function updatePreview() {
  const previewSpan = document.getElementById("previewWord");
  if (!gameData.currentBuildWord) {
    previewSpan.innerHTML = "____";
    return;
  }
  previewSpan.innerHTML = "";
  gameData.currentBuildWord.split("").forEach((ch, idx) => {
    const s = document.createElement("span");
    s.className = "preview-char";
    s.innerText = ch;
    s.onclick = () => {
      popLastLetter();
    };
    previewSpan.appendChild(s);
  });
}

function toggleLetterSelection(idx) {
  if (gameData.selectedIndices.includes(idx)) return;
  const letterObj = gameData.lettersRemaining[idx];
  if (!letterObj) return;
  gameData.selectedIndices.push(idx);
  gameData.currentBuildWord += letterObj.char;
  playSound("tap");
  updatePreview();
  renderLetterPool();
}

function renderLetterPool() {
  const container = document.getElementById("letterGrid");
  if (!container) return;
  container.innerHTML = "";
  gameData.lettersRemaining.forEach((letter, idx) => {
    const tile = document.createElement("div");
    tile.className = "letter-tile";
    if (gameData.selectedIndices.includes(idx)) tile.classList.add("selected");
    tile.innerText = letter.char;
    tile.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLetterSelection(idx);
    });
    container.appendChild(tile);
  });
}

function renderSlots() {
  const slotContainer = document.getElementById("wordSlotsContainer");
  slotContainer.innerHTML = '<div class="global-forge-label">⚙️ FORGE THESE WORDS</div>';
  gameData.currentTargets.forEach((target, idx) => {
    const slotDiv = document.createElement("div");
    slotDiv.className = "slot-item";
    const wordDiv = document.createElement("div");
    wordDiv.className = "slot-word";
    target.word.split("").forEach((ch, i) => {
      const letterSpan = document.createElement("div");
      letterSpan.className = "slot-letter";
      if (target.filled) {
        letterSpan.innerText = ch;
        letterSpan.classList.add("filled");
      } else {
        letterSpan.innerText = "";
      }
      wordDiv.appendChild(letterSpan);
    });
    slotDiv.appendChild(wordDiv);
    if (target.filled) {
      const mark = document.createElement("div");
      mark.className = "slot-completed-mark";
      mark.innerText = "✓";
      slotDiv.appendChild(mark);
    }
    slotContainer.appendChild(slotDiv);
  });
}

function shuffleLetters() {
  for (let i = gameData.lettersRemaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameData.lettersRemaining[i], gameData.lettersRemaining[j]] = [
      gameData.lettersRemaining[j],
      gameData.lettersRemaining[i],
    ];
  }
  if (gameData.selectedIndices.length) clearBuild();
  renderLetterPool();
  playSound("tap");
}

function giveHint() {
  const unsolved = gameData.currentTargets.filter((t) => !t.filled);
  if (unsolved.length === 0) return;
  const randomWordObj = unsolved[Math.floor(Math.random() * unsolved.length)];
  const hintLetter = randomWordObj.word[0];
  const index = gameData.lettersRemaining.findIndex(
    (l) => l.char === hintLetter
  );
  if (index !== -1) {
    const tileElements = document.querySelectorAll(".letter-tile");
    if (tileElements[index]) {
      tileElements[index].style.transform = "scale(1.2)";
      tileElements[index].style.backgroundColor = "#ffaa55";
      setTimeout(() => {
        if (tileElements[index]) {
          tileElements[index].style.transform = "";
          tileElements[index].style.backgroundColor = "";
        }
      }, 800);
    }
    playSound("tap");
    showFloatingText(`💡 ${hintLetter}`, "#bbaaff");
  } else {
    showFloatingText("No hint available", "#aa8866");
  }
}

function showCompletionAndNext() {
  const overlay = document.createElement("div");
  overlay.className = "completion-overlay";
  overlay.innerHTML = `
    <div class="completion-card">
      <h2>🔥 LEVEL COMPLETE!</h2>
      <p>Score: ${gameData.score}</p>
      <button id="nextLevelBtn" style="background:#e2a526; border:none; padding:12px 28px; border-radius:60px; margin-top:16px; font-weight:bold; cursor:pointer;">NEXT FORGE →</button>
    </div>
  `;
  document.body.appendChild(overlay);
  const nextBtn = document.getElementById("nextLevelBtn");
  const goNext = () => {
    let nextLvl = gameData.activeLevel + 1;
    if (nextLvl >= levels.length) {
      if (window.parent !== window) {
        window.parent.postMessage({ type: "GAME_COMPLETE", score: gameData.score }, "*");
      }
      overlay.innerHTML = `<div class="completion-card"><h2>🏆 MASTER FORGER!</h2><p>Final Score: ${gameData.score}</p><button id="restartBtn" style="background:#e2a526; border:none; padding:12px 28px; border-radius:60px; margin-top:16px; font-weight:bold; cursor:pointer;">PLAY AGAIN</button></div>`;
      const restart = document.getElementById("restartBtn");
      if (restart) restart.onclick = () => { location.reload(); };
    } else {
      loadLevel(nextLvl);
      overlay.remove();
    }
  };
  nextBtn.addEventListener("click", goNext);
}

document.getElementById("clearBtn").addEventListener("click", () => {
  clearBuild();
  resetCombo();
  playSound("tap");
});
document.getElementById("submitBtn").addEventListener("click", () => validateAndSubmit());
document.getElementById("shuffleBtn").addEventListener("click", () => shuffleLetters());
document.getElementById("hintBtn").addEventListener("click", () => giveHint());

let swipeActive = false;
function initSwipe() {
  const grid = document.getElementById("letterGrid");
  if (!grid) return;
  
  // We handle touch interactions directly so we don't block taps.
  grid.addEventListener("touchstart", (e) => {
    const tile = e.target.closest(".letter-tile");
    if (!tile) return;
    // Don't prevent default immediately, allowing normal click if it's just a tap without swipe
    swipeActive = true;
    
    // Actually evaluate the first tile they touched instantly for responsiveness
    const allTiles = Array.from(document.querySelectorAll(".letter-tile"));
    const idx = allTiles.indexOf(tile);
    if (idx !== -1 && !gameData.selectedIndices.includes(idx)) {
      toggleLetterSelection(idx);
    }
  }, {passive: true});
  
  grid.addEventListener("touchmove", (e) => {
    if (!swipeActive) return;
    
    // We shouldn't preventDefault if we set passive true. But we can catch the elements via move without it.
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const tile = elem?.closest(".letter-tile");
    if (tile) {
      const allTiles = Array.from(document.querySelectorAll(".letter-tile"));
      const idx = allTiles.indexOf(tile);
      if (idx !== -1 && !gameData.selectedIndices.includes(idx)) {
        toggleLetterSelection(idx);
      }
    }
  }, {passive: true});
  
  grid.addEventListener("touchend", () => {
    swipeActive = false;
  });
  
  grid.addEventListener("touchcancel", () => {
    swipeActive = false;
  });
}

// initialize game
loadLevel(0);
initSwipe();
