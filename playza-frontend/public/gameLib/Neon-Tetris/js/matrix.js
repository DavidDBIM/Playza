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
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    matrixCtx.fillStyle = '#00f0ff';
    matrixCtx.font = fontSize + 'px monospace';
    
    for (var i = 0; i < drops.length; i++) {
        var text = String.fromCharCode(0x30A0 + Math.random() * 96);
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        
        matrixCtx.fillStyle = 'rgba(0, 240, 255, ' + (Math.random() * 0.5 + 0.5) + ')';
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
