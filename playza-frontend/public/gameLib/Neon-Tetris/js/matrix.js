var matrixCanvas = document.getElementById('matrix-bg');
var matrixCtx = matrixCanvas.getContext('2d');

var fontSize = 14;
var columns;
var drops = [];

function initMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    
    columns = Math.floor(matrixCanvas.width / fontSize);
    drops = [];
    
    for (var i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }
}

function drawMatrix() {
    var matrixOn = true;
    try {
        matrixOn = window.NeonTetris && window.NeonTetris.getSettings ? (window.NeonTetris.getSettings().matrixEnabled !== false) : true;
    } catch (e) {
        matrixOn = true;
    }

    if (!matrixOn) {
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        return;
    }

    var combo = (window.NeonTetrisState && window.NeonTetrisState.combo) ? window.NeonTetrisState.combo : 0;
    var level = (window.NeonTetrisState && window.NeonTetrisState.level) ? window.NeonTetrisState.level : 1;
    var fade = Math.max(0.03, 0.07 - Math.min(0.03, combo * 0.004));

    matrixCtx.fillStyle = 'rgba(0, 0, 0, ' + fade.toFixed(3) + ')';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    matrixCtx.font = fontSize + 'px monospace';
    var hue = 185 + Math.min(60, (level - 1) * 3);
    
    for (var i = 0; i < drops.length; i++) {
        var text = String.fromCharCode(0x30A0 + Math.random() * 96);
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        
        matrixCtx.fillStyle = 'hsla(' + hue + ', 100%, 65%, ' + (Math.random() * 0.5 + 0.35) + ')';
        matrixCtx.fillText(text, x, y);
        
        if (y > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

var matrixInterval;
function startMatrix() {
    initMatrix();
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(drawMatrix, 35);
}

window.addEventListener('resize', function() {
    initMatrix();
});

startMatrix();
