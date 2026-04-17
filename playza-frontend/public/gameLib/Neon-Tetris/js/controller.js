// Keyboard Controls
document.body.onkeydown = function(e) {
    var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'drop',
        16: 'hold',
        67: 'hold'
    };
    if (typeof keys[e.keyCode] != 'undefined') {
        e.preventDefault();
        keyPress(keys[e.keyCode]);
        render();
    }
};

document.addEventListener('keyup', function(e) {
    if ([37, 38, 39, 40, 32, 16, 67].includes(e.keyCode)) {
        e.preventDefault();
    }
});

// Touch Button Controls
const touchButtons = [
    { id: 'btn-left', action: 'left' },
    { id: 'btn-right', action: 'right' },
    { id: 'btn-down', action: 'down' },
    { id: 'btn-rotate', action: 'rotate' },
    { id: 'btn-drop', action: 'drop' }
];

touchButtons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (!el) return;

    const handler = (e) => {
        e.preventDefault();
        handleTouch(btn.action);
    };

    el.addEventListener('touchstart', handler, { passive: false });
    el.addEventListener('click', handler);
});

// Swipe Detection Logic
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

document.getElementById('game-canvas').addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.getElementById('game-canvas').addEventListener('touchend', function(e) {
    if (lose) return;
    
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            handleTouch(dx > 0 ? 'right' : 'left');
        }
    } else {
        if (Math.abs(dy) > SWIPE_THRESHOLD) {
            if (dy > 0) handleTouch('down');
            else handleTouch('rotate');
        }
    }
}, { passive: true });

// Prevent scrolling on game area
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });
