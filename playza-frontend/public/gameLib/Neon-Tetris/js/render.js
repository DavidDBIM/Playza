var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
var W = 300, H = 600;
var BLOCK_W = W / COLS, BLOCK_H = H / ROWS;

function getGhostY() {
    var ghostY = currentY;
    while (valid(0, ghostY - currentY + 1, current)) {
        ghostY++;
    }
    return ghostY;
}

function drawBlock(context, x, y, colorIndex, glow, isGhost) {
    var color = colors[colorIndex];
    var glowColor = colorGlows[colorIndex];
    
    if (isGhost) {
        context.fillStyle = color;
        context.globalAlpha = 0.3;
        context.fillRect(x * BLOCK_W + 1, y * BLOCK_H + 1, BLOCK_W - 2, BLOCK_H - 2);
        context.globalAlpha = 1;
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.strokeRect(x * BLOCK_W + 1, y * BLOCK_H + 1, BLOCK_W - 2, BLOCK_H - 2);
        return;
    }
    
    context.fillStyle = color;
    context.fillRect(x * BLOCK_W + 1, y * BLOCK_H + 1, BLOCK_W - 2, BLOCK_H - 2);
    
    if (glow) {
        context.shadowColor = glowColor;
        context.shadowBlur = 10;
    }
    
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * BLOCK_W + 1, y * BLOCK_H + 1, BLOCK_W - 2, 4);
    context.fillRect(x * BLOCK_W + 1, y * BLOCK_H + 1, 4, BLOCK_H - 2);
    
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * BLOCK_W + 1, y * BLOCK_H + BLOCK_H - 5, BLOCK_W - 2, 4);
    context.fillRect(x * BLOCK_W + BLOCK_W - 5, y * BLOCK_H + 1, 4, BLOCK_H - 2);
    
    context.shadowBlur = 0;
    
    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_W + 1, y * BLOCK_H + 1, BLOCK_W - 2, BLOCK_H - 2);
}

function render() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);
    
    ctx.strokeStyle = '#1a1a25';
    ctx.lineWidth = 1;
    for (var x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_W, 0);
        ctx.lineTo(x * BLOCK_W, H);
        ctx.stroke();
    }
    for (var y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_H);
        ctx.lineTo(W, y * BLOCK_H);
        ctx.stroke();
    }
    
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
            if ( board[ y ][ x ] ) {
                drawBlock(ctx, x, y, board[ y ][ x ] - 1, true, false);
            }
        }
    }
    
    var ghostY = getGhostY();
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                drawBlock(ctx, currentX + x, ghostY + y, current[ y ][ x ] - 1, false, true);
            }
        }
    }
    
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                drawBlock(ctx, currentX + x, currentY + y, current[ y ][ x ] - 1, true, false);
            }
        }
    }
}
