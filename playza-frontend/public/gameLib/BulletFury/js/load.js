var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation, lib;
function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");

	var comp = AdobeAn.getComposition("064A5EF8A526134DBB45A732B5EC511C");
	if (!comp) {
		console.error("AdobeAn Composition not found!");
		return;
	}
	lib = comp.getLibrary();
	createjs.MotionGuidePlugin.install();

	// Register sounds separately so they load lazily (not part of the progress queue).
	// Audio tags inside iframes often never fire 'complete', freezing loading at 0%.
	var fullManifest = lib.properties.manifest;
	var soundManifest = fullManifest.filter(function(item) { return item.src && !item.src.startsWith("data:") && /\.(mp3|ogg|wav)$/i.test(item.src); });
	var dataManifest = fullManifest.filter(function(item) { return item.src && typeof item.src === "string" && item.src.indexOf("data:") === 0; });
	var assetManifest = fullManifest.filter(function(item) { return !soundManifest.includes(item) && !dataManifest.includes(item); });

	// Register sounds with createjs.Sound so they play correctly when needed
	soundManifest.forEach(function(s) {
		createjs.Sound.registerSound(s.src, s.id);
	});

	// Use XHR-based loading (true) which works reliably inside iframes
	var loader = new createjs.LoadQueue(true);
	loader.setMaxConnections(6);
	loader.addEventListener("fileload", function(evt) { handleFileLoad(evt, comp); });
	loader.addEventListener("complete", function(evt) { handleComplete(evt, comp); });
	loader.addEventListener("progress", function(evt) { handleProgress(evt); });
	loader.addEventListener("error", function(evt) {
		console.warn("Asset load warning:", evt.item ? evt.item.src : evt);
		// Continue — non-critical asset failures should not block the game
	});

	loader.loadManifest(assetManifest);

	// Safety net: if still at 0% after 30s, force-complete (e.g. CSP blocked some assets)
	setTimeout(function() {
		var txt = document.getElementById("centertext");
		if (txt && txt.textContent.indexOf("0%") !== -1) {
			console.warn("[BulletFury] Loader appears hung — forcing handleComplete");
			handleComplete({ target: loader }, comp);
		}
	}, 30000);
}

function handleFileLoad(evt, comp) {
	var images=comp.getImages();	
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}
function handleProgress(evt) {
		var el = document.getElementById("centertext");
		if (el) el.textContent = "LOADING ASSETS... " + Math.floor((evt.progress || 0) * 100)+"%";
}
function handleComplete(evt,comp) {
	lib=comp.getLibrary();
	var ss=comp.getSpriteSheet();
	var queue = evt.target;
	var ssMetadata = lib.ssMetadata;
	for(i=0; i<ssMetadata.length; i++) {
		ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
	}
	var stbc = document.getElementById("stButContainer");
	stbc.style.display = 'block';
}
function startG() {

	var preloaderDiv = document.getElementById("_preload_div_");
	preloaderDiv.style.display = 'none';
	canvas.style.display = 'block';

	// lib.webgamespreloader (owners intro) uses img._1000Games / img._1000WebGames which are
	// data: URI images — XHR-based LoadQueue cannot load data: URIs, so they remain undefined,
	// causing `beginBitmapFill` to crash with "Cannot read properties of undefined (reading 'naturalWidth')".
	// We skip the owners animation entirely by replacing it with a blank no-op MovieClip.
	lib.webgamespreloader = function(mode, startPosition, loop) {
		this.initialize(mode, startPosition, loop, {});
	};
	lib.webgamespreloader.prototype = new createjs.MovieClip();

	exportRoot = new lib.bulletfuryhtml5();
	stage = new lib.Stage(canvas);	
	fnStartAnimation = function() {
		stage.addChild(exportRoot);
		createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
		//createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.interval = 1000/60;
		createjs.Ticker.addEventListener("tick", stage);
	}	    
	function makeResponsive(isResp, respDim, isScale, scaleType) {		
		var lastW, lastH, lastS=1;		
		window.addEventListener('resize', resizeCanvas);		
		resizeCanvas();		
		function resizeCanvas() {			
			var w = lib.properties.width, h = lib.properties.height;			
			var iw = window.innerWidth, ih=window.innerHeight;			
			var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
			if(isResp) {                
				if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
					sRatio = lastS;                
				}				
				else if(!isScale) {					
					if(iw<w || ih<h)						
						sRatio = Math.min(xRatio, yRatio);				
				}				
				else if(scaleType==1) {					
					sRatio = Math.min(xRatio, yRatio);				
				}				
				else if(scaleType==2) {					
					sRatio = Math.max(xRatio, yRatio);				
				}			
			}			
			canvas.width = w*sRatio;			
			canvas.height = h*sRatio;
			canvas.style.width = anim_container.style.width = dom_overlay_container.style.width = preloaderDiv.style.width = w*sRatio+'px';				
			canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = preloaderDiv.style.height = h*sRatio+'px';	
			stage.scaleX = sRatio;			
			stage.scaleY = sRatio;			
			lastW = iw; lastH = ih; lastS = sRatio;            
			stage.tickOnUpdate = false;            
			stage.update();            
			stage.tickOnUpdate = true;	

			//renderer.setSize(parseInt(document.getElementById("animation_container").style.width), parseInt(document.getElementById("animation_container").style.height));
		}
		
	}
		
	
	makeResponsive(true,'both',true,1);	
	AdobeAn.compositionLoaded(lib.properties.id);
	fnStartAnimation();

	// Skip the owners/intro animation and the game menu — jump directly into the active gameplay (frame 2)
	readMemory();
	difficulty = 2;
	exportRoot.gotoAndStop(2);
		
}
function playSound(id, loop) {return createjs.Sound.play(id, createjs.Sound.INTERRUPT_EARLY, 0, 0, loop);}
var ref = "direct";checkdomain();
function checkdomain() {if(self!=top) ref = document.referrer.split('/')[2];}