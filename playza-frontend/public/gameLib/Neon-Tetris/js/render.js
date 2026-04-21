var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var BLOCK_W = W / COLS, BLOCK_H = H / ROWS;

function recalcDimensions() {
    W = canvas.width;
    H = canvas.height;
    BLOCK_W = W / COLS;
    BLOCK_H = H / ROWS;
}

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
    var inset = Math.max(1, Math.floor(Math.min(BLOCK_W, BLOCK_H) * 0.1));
    var bevel = Math.max(2, Math.floor(Math.min(BLOCK_W, BLOCK_H) * 0.18));
    var w = Math.max(2, BLOCK_W - inset * 2);
    var h = Math.max(2, BLOCK_H - inset * 2);
    
    if (isGhost) {
        context.fillStyle = color;
        context.globalAlpha = 0.3;
        context.fillRect(x * BLOCK_W + inset, y * BLOCK_H + inset, w, h);
        context.globalAlpha = 1;
        context.strokeStyle = color;
        context.lineWidth = Math.max(1, Math.floor(inset * 0.8));
        context.strokeRect(x * BLOCK_W + inset, y * BLOCK_H + inset, w, h);
        return;
    }
    
    context.fillStyle = color;
    context.fillRect(x * BLOCK_W + inset, y * BLOCK_H + inset, w, h);
    
    if (glow) {
        context.shadowColor = glowColor;
        context.shadowBlur = Math.max(4, Math.floor(Math.min(BLOCK_W, BLOCK_H) * 0.45));
    }
    
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * BLOCK_W + inset, y * BLOCK_H + inset, w, Math.min(bevel, h));
    context.fillRect(x * BLOCK_W + inset, y * BLOCK_H + inset, Math.min(bevel, w), h);
    
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * BLOCK_W + inset, y * BLOCK_H + inset + h - Math.min(bevel, h), w, Math.min(bevel, h));
    context.fillRect(x * BLOCK_W + inset + w - Math.min(bevel, w), y * BLOCK_H + inset, Math.min(bevel, w), h);
    
    context.shadowBlur = 0;
    
    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_W + inset, y * BLOCK_H + inset, w, h);
}

function render() {
    recalcDimensions();
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = Math.max(0.5, Math.min(BLOCK_W, BLOCK_H) * 0.05);
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

    var ghostEnabled = true;
    try {
        ghostEnabled = window.NeonTetris && window.NeonTetris.getSettings ? (window.NeonTetris.getSettings().ghostEnabled !== false) : true;
    } catch (e) {
        ghostEnabled = true;
    }

    if (ghostEnabled && current) {
        var ghostY = getGhostY();
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    drawBlock(ctx, currentX + x, ghostY + y, current[ y ][ x ] - 1, false, true);
                }
            }
        }
    }
    
    if (current) {
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    drawBlock(ctx, currentX + x, currentY + y, current[ y ][ x ] - 1, true, false);
                }
            }
        }
    }
}
