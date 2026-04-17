window.createjs = window.createjs || {};
window.AdobeAn = window.AdobeAn || {};
(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib._1000WebGames = function() {
	this.initialize(img._1000WebGames);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,594,63);


(lib._1000Games = function() {
	this.initialize(img._1000Games);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,144,13);


(lib._1000bulta = function() {
	this.initialize(img._1000bulta);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,18,24);


(lib.bullets = function() {
	this.initialize(img.bullets);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,128);


(lib.button = function() {
	this.initialize(img.button);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,65,65);


(lib.drag = function() {
	this.initialize(img.drag);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,128);


(lib.explosion = function() {
	this.initialize(img.explosion);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,320,252);


(lib.gunshot = function() {
	this.initialize(img.gunshot);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,139,119);


(lib.health = function() {
	this.initialize(img.health);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,114);


(lib.joystick = function() {
	this.initialize(img.joystick);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,240,240);


(lib.joystick2 = function() {
	this.initialize(img.joystick2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,122,122);


(lib.mouse = function() {
	this.initialize(img.mouse);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,80,53);


(lib.pause = function() {
	this.initialize(img.pause);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,124,124);


(lib.roka2 = function() {
	this.initialize(img.roka2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,521,322);


(lib.sakums = function() {
	this.initialize(img.sakums);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1000,563);


(lib.settings = function() {
	this.initialize(img.settings);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,109,109);


(lib.shoot = function() {
	this.initialize(img.shoot);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,122,122);


(lib.smoke = function() {
	this.initialize(img.smoke);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,64,64);


(lib.smoke2 = function() {
	this.initialize(img.smoke2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,64,64);


(lib.smoke3 = function() {
	this.initialize(img.smoke3);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,64,64);


(lib.star0 = function() {
	this.initialize(img.star0);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,256,128);


(lib.star1 = function() {
	this.initialize(img.star1);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,256,128);


(lib.star2 = function() {
	this.initialize(img.star2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,256,128);


(lib.star3 = function() {
	this.initialize(img.star3);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,256,128);// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.stars = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_2 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Layer_1
	this.instance = new lib.star0();
	this.instance.parent = this;
	this.instance.setTransform(0,0,0.2734,0.2733);

	this.instance_1 = new lib.star1();
	this.instance_1.parent = this;
	this.instance_1.setTransform(0,0,0.2734,0.2733);

	this.instance_2 = new lib.star2();
	this.instance_2.parent = this;
	this.instance_2.setTransform(0,0,0.2734,0.2733);

	this.instance_3 = new lib.star3();
	this.instance_3.parent = this;
	this.instance_3.setTransform(0,0,0.2734,0.2733);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_3}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,70,35);


(lib.smokesymbol3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.instance = new lib.smoke3();
	this.instance.parent = this;
	this.instance.setTransform(-32,-32);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-32,-32,64,64);


(lib.smokesymbol2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.instance = new lib.smoke2();
	this.instance.parent = this;
	this.instance.setTransform(-32,-32);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-32,-32,64,64);


(lib.smokesymbol = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.instance = new lib.smoke();
	this.instance.parent = this;
	this.instance.setTransform(-32,-32);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-32,-32,64,64);


(lib.RELOADING = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FF0000").s().p("AgXAtQgLgGgGgMQgGgNAAgOQAAgPAHgMQAGgMANgHQAJgFAOAAQATAAAKAIQAKAIAEAOIgVAEQgCgIgFgEQgHgEgIAAQgMAAgIAIQgIAIAAARQAAARAIAJQAIAJAMAAQAGAAAGgDQAHgCAFgEIAAgNIgYAAIAAgPIAsAAIAAAmQgGAHgMAEQgNAFgMAAQgPAAgMgHg");
	this.shape.setTransform(42.4,-0.575);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF0000").s().p("AATAyIgnhAIAABAIgTAAIAAhjIAUAAIAoBBIAAhBIATAAIAABjg");
	this.shape_1.setTransform(31.975,-0.55);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FF0000").s().p("AgJAyIAAhjIATAAIAABjg");
	this.shape_2.setTransform(25.025,-0.55);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FF0000").s().p("AgpAyIAAhjIAlAAQAMAAAGABQAJADAGAHQAHAHADAJQADAKAAANQAAAMgDAJQgDALgIAHQgFAFgJADQgGACgLAAgAgUAhIAOAAIAMgBQAEgBAEgDQADgDACgHQACgGAAgMQAAgLgCgGQgCgGgDgEQgEgDgGgBQgEgBgLAAIgJAAg");
	this.shape_3.setTransform(18.15,-0.55);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FF0000").s().p("AAcAyIgIgXIgoAAIgIAXIgVAAIAnhjIAUAAIAoBjgAgNALIAaAAIgNglg");
	this.shape_4.setTransform(7.875,-0.55);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FF0000").s().p("AgiAmQgOgNAAgYQAAgPAFgKQADgIAGgGQAGgGAHgDQAKgEALAAQAWAAANAOQAOAOAAAXQAAAZgOANQgNAOgWAAQgVAAgNgOgAgTgZQgIAJAAAQQAAARAIAJQAIAJALAAQAMAAAIgJQAIgJAAgRQAAgQgIgJQgHgIgNAAQgMAAgHAIg");
	this.shape_5.setTransform(-2.575,-0.575);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FF0000").s().p("AgiAyIAAhjIAUAAIAABSIAyAAIAAARg");
	this.shape_6.setTransform(-11.95,-0.525);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FF0000").s().p("AglAyIAAhjIBJAAIAAARIg1AAIAAAWIAxAAIAAAQIgxAAIAAAbIA3AAIAAARg");
	this.shape_7.setTransform(-21.075,-0.55);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FF0000").s().p("AAUAyIgOgWIgJgOQgEgDgDgCQgDgBgHAAIgEAAIAAAqIgUAAIAAhjIArAAQAPAAAGACQAIADAFAHQADAHAAAJQAAALgGAHQgGAHgOACQAHAEAEAEQAEAFAIAMIAMATgAgYgHIAPAAQANAAAEgBQAEgBACgDQACgDAAgFQAAgFgDgDQgDgDgEgBIgOAAIgQAAg");
	this.shape_8.setTransform(-30.45,-0.55);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.RELOADING, new cjs.Rectangle(-38,-10.2,88.1,19.6), null);


(lib.openoptions = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.name = "pauseButton";
		this.stop();
		if(isPlaying) this.gotoAndStop(1);
	}
	this.frame_1 = function() {
		this.stop();
		if(!isPlaying) this.gotoAndStop(0);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 1
	this.instance = new lib.settings();
	this.instance.parent = this;
	this.instance.setTransform(5,40,0.3409,0.3404);

	this.instance_1 = new lib.pause();
	this.instance_1.parent = this;
	this.instance_1.setTransform(7,0,0.2984,0.2984);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(5,0,39,77.1);


(lib.menuscore = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		menuscoresrc = this;
		menuscoresrc.stop();
		
		menuscoresrc.scoreTxt.text = bestScore;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(2));

	// Layer 3
	this.scoreTxt = new cjs.Text("10000", "bold 13px 'Arial'", "#CCCCCC");
	this.scoreTxt.name = "scoreTxt";
	this.scoreTxt.lineHeight = 15;
	this.scoreTxt.lineWidth = 40;
	this.scoreTxt.parent = this;
	this.scoreTxt.setTransform(30.6,5.35);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFCC33").s().p("AAAAsIg0AjIASg8IgygnIA/gBIAVg7IAVA8IBAADIgzAkIARA+g");
	this.shape.setTransform(16.5,10.45);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.scoreTxt}]}).wait(2));

	// Layer 1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#999999").ss(0.2,1,1).p("Al5hvIBCDfIKxAA");
	this.shape_1.setTransform(37.8,11.175);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#424242").s().p("Ak3BwIhCjfILzAAIAADfg");
	this.shape_2.setTransform(37.8,11.175);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).to({state:[]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,77.6,24.4);


(lib.lockTxt = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgNAbIAAg0IAIAAIAAAJQADgGACgCQACgCADABQAFAAAEACIgDAIQgDgBgEAAQgCAAgCABQgCACgBADIgBAKIAAAbg");
	this.shape.setTransform(86.7,0.75);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgRAUQgGgHAAgNQAAgNAIgIQAGgFAJAAQALAAAGAHQAHAHAAAMQAAAJgDAGQgDAGgGADQgFADgHAAQgKAAgHgHgAgKgOQgEAFAAAJQAAAKAEAFQAEAFAGAAQAGAAAFgFQAEgFAAgKQAAgJgEgFQgFgFgGAAQgGAAgEAFg");
	this.shape_1.setTransform(81.875,0.8);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AgOAXQgFgEgBgIIAJgCQAAAFADADQAEADAEAAQAHAAACgDQADgCAAgDQAAgEgCgBIgJgDIgMgEQgEgBgCgDQgCgDAAgEQAAgDABgEQACgDADgBIAFgDIAIgBQAFAAAFACQAFACACACQACAEAAAEIgIABQAAgDgDgDQgDgCgFAAQgGAAgCACQgDACABADIABADIADADIAGACIAOADQADABACADQACADAAAFQAAAEgCAEQgDAEgFACQgEACgHAAQgJAAgFgEg");
	this.shape_2.setTransform(76.55,0.8);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AgNAbIAAg0IAIAAIAAAJQADgGACgCQACgCADABQAFAAAEACIgDAIQgDgBgDAAQgDAAgCABQgCACgBADIgBAKIAAAbg");
	this.shape_3.setTransform(72.8,0.75);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AgLAZQgEgCgCgDQgCgCgBgEIAAgIIAAggIAIAAIAAAcIABAJQABAEADACQADACADAAQADAAAEgCQAEgCABgEQABgDAAgHIAAgbIAJAAIAAA0IgIAAIAAgIQgGAJgKAAQgEgBgEgBg");
	this.shape_4.setTransform(67.95,0.85);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("AgPAUQgHgGAAgOQAAgHADgGQADgHAGgDQAGgDAFAAQAJAAAFAFQAFAEABAHIgIABQgBgFgDgCQgDgDgEAAQgHAAgDAFQgFAFAAAJQAAAKAFAFQAEAFAFAAQAFAAAEgDQADgDABgHIAIABQgBAJgFAFQgHAFgIAAQgJAAgHgHg");
	this.shape_5.setTransform(62.85,0.8);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AgQAUQgHgHAAgNQAAgMAHgHQAGgHAKAAQALAAAGAHQAHAHAAAMIAAADIgmAAQAAAIAFAEQAEAFAGAAQAFAAADgDQAEgCACgGIAJACQgDAHgFAFQgGAEgJAAQgLAAgGgHgAgJgOQgEAEAAAGIAcAAQgBgGgDgDQgEgGgHAAQgFAAgEAFg");
	this.shape_6.setTransform(54.6,0.8);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFFFF").s().p("AgNAXQgGgEgBgIIAJgCQAAAFADADQAEADAEAAQAHAAACgDQAEgCAAgDQAAgEgDgBIgJgDIgMgEQgEgBgCgDQgCgDAAgEQAAgDABgEQACgDADgBIAFgDIAIgBQAFAAAFACQAEACACACQADAEAAAEIgIABQgBgDgDgDQgCgCgFAAQgGAAgCACQgCACgBADIABADIAEADIAGACIAOADQAEABABADQADADAAAFQAAAEgDAEQgCAEgFACQgFACgHAAQgIAAgFgEg");
	this.shape_7.setTransform(49.3,0.8);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FFFFFF").s().p("AgLAZQgEgCgCgDQgCgCAAgEIgBgIIAAggIAJAAIAAAcIAAAJQABAEADACQACACAFAAQADAAADgCQADgCABgEQACgDAAgHIAAgbIAJAAIAAA0IgIAAIAAgIQgGAJgJAAQgFgBgEgBg");
	this.shape_8.setTransform(44.05,0.85);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFFFFF").s().p("AgRAUQgGgHAAgNQAAgNAIgIQAGgFAJAAQALAAAGAHQAHAHAAAMQAAAJgDAGQgDAGgGADQgFADgHAAQgKAAgHgHgAgKgOQgEAFAAAJQAAAKAEAFQAEAFAGAAQAGAAAFgFQAEgFAAgKQAAgJgEgFQgFgFgGAAQgGAAgEAFg");
	this.shape_9.setTransform(38.525,0.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#FFFFFF").s().p("AAaAbIAAggIAAgIQgBgCgDgBQgCgCgDAAQgFAAgEAEQgEAEAAAHIAAAeIgHAAIAAghQAAgGgCgDQgDgDgFAAQgDAAgDACQgEACgBAEQgBADAAAHIAAAbIgJAAIAAg0IAIAAIAAAIQACgEAEgCQAEgDAFABQAGgBAEADQADADABAEQAGgKAKABQAIAAAEAEQAEAEAAAJIAAAjg");
	this.shape_10.setTransform(31.575,0.75);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FFFFFF").s().p("AALAkIgQgbIgHAGIAAAVIgIAAIAAhHIAIAAIAAAoIAUgUIAMAAIgUASIAWAhg");
	this.shape_11.setTransform(22.4,-0.175);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#FFFFFF").s().p("AgPAUQgHgGABgOQAAgHACgGQADgHAGgDQAFgDAGAAQAIAAAGAFQAFAEACAHIgJABQgBgFgDgCQgDgDgFAAQgGAAgEAFQgDAFAAAJQAAAKADAFQAEAFAGAAQAFAAADgDQAEgDABgHIAJABQgCAJgFAFQgHAFgIAAQgKAAgGgHg");
	this.shape_12.setTransform(17.25,0.8);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFFFFF").s().p("AgRAUQgGgHAAgNQAAgNAIgIQAGgFAJAAQALAAAGAHQAHAHAAAMQAAAJgDAGQgDAGgGADQgFADgHAAQgKAAgHgHgAgKgOQgEAFAAAJQAAAKAEAFQAEAFAGAAQAGAAAFgFQAEgFAAgKQAAgJgEgFQgFgFgGAAQgGAAgEAFg");
	this.shape_13.setTransform(11.825,0.8);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#FFFFFF").s().p("AgDAkIAAhHIAHAAIAABHg");
	this.shape_14.setTransform(7.925,-0.175);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#FFFFFF").s().p("AANAbIAAgfIgBgIIgEgEQgDgCgDAAQgFAAgEADQgEAEAAAKIAAAcIgJAAIAAg0IAIAAIAAAIQAFgIALAAQAEgBAEACQAEACACADQACADABADIAAAIIAAAgg");
	this.shape_15.setTransform(4.05,0.75);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#FFFFFF").s().p("AgLAZQgEgCgCgDQgCgCAAgEIgBgIIAAggIAIAAIAAAcIABAJQABAEADACQACACAFAAQADAAADgCQADgCABgEQACgDAAgHIAAgbIAJAAIAAA0IgIAAIAAgIQgGAJgKAAQgEgBgEgBg");
	this.shape_16.setTransform(-1.5,0.85);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#FFFFFF").s().p("AgNAlIAUhJIAHAAIgUBJg");
	this.shape_17.setTransform(-8.45,-0.2);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#FFFFFF").s().p("AALAkIgQgbIgHAGIAAAVIgJAAIAAhHIAJAAIAAAoIAUgUIAMAAIgUASIAWAhg");
	this.shape_18.setTransform(-14.85,-0.175);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#FFFFFF").s().p("AgPAUQgGgGAAgOQgBgHADgGQADgHAFgDQAGgDAGAAQAJAAAFAFQAFAEACAHIgJABQgBgFgDgCQgDgDgFAAQgFAAgFAFQgDAFAAAJQAAAKADAFQAFAFAFAAQAFAAADgDQAEgDABgHIAJABQgCAJgGAFQgFAFgJAAQgKAAgGgHg");
	this.shape_19.setTransform(-20,0.8);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#FFFFFF").s().p("AgRAUQgGgHAAgNQAAgNAIgIQAGgFAJAAQALAAAGAHQAHAHAAAMQAAAJgDAGQgDAGgGADQgFADgHAAQgKAAgHgHgAgKgOQgEAFAAAJQAAAKAEAFQAEAFAGAAQAGAAAFgFQAEgFAAgKQAAgJgEgFQgFgFgGAAQgGAAgEAFg");
	this.shape_20.setTransform(-25.425,0.8);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#FFFFFF").s().p("AgDAkIAAhHIAHAAIAABHg");
	this.shape_21.setTransform(-29.325,-0.175);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#FFFFFF").s().p("AgRAUQgGgHAAgNQAAgNAIgIQAGgFAJAAQALAAAGAHQAHAHAAAMQAAAJgDAGQgDAGgGADQgFADgHAAQgKAAgHgHgAgKgOQgEAFAAAJQAAAKAEAFQAEAFAGAAQAGAAAFgFQAEgFAAgKQAAgJgEgFQgFgFgGAAQgGAAgEAFg");
	this.shape_22.setTransform(-35.975,0.8);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#FFFFFF").s().p("AAAAiQgDgCgBgCQgBgDgBgHIAAgdIgFAAIAAgHIAFAAIAAgNIAIgFIAAASIAJAAIAAAHIgJAAIAAAdIABAFIABACIAEAAIADAAIABAIIgGAAQgFAAgBgBg");
	this.shape_23.setTransform(-40.1,-0.075);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#FFFFFF").s().p("AAFANIgCgNIAAgMIAKAAIAAAMIgCANgAgKANIgCgNIAAgMIAKAAIAAAMIgCANg");
	this.shape_24.setTransform(-46.125,-2.475);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#FFFFFF").s().p("AgVAkIAAhHIAJAAIAAA+IAiAAIAAAJg");
	this.shape_25.setTransform(-50.475,-0.175);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#FFFFFF").s().p("AAFANIgCgNIAAgMIAKAAIAAAMIgCANgAgKANIgCgNIAAgMIAKAAIAAAMIgCANg");
	this.shape_26.setTransform(-58.025,-2.475);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#FFFFFF").s().p("AgOAXQgFgEgCgIIAJgCQABAFAEADQACADAGAAQAGAAADgDQACgCAAgDQAAgEgCgBIgJgDIgNgEQgDgBgCgDQgCgDAAgEQAAgDACgEQABgDADgBIAGgDIAHgBQAFAAAFACQAFACABACQADAEABAEIgJABQAAgDgEgDQgCgCgFAAQgFAAgDACQgDACAAADIABADIAEADIAHACIANADQAEABACADQABADAAAFQAAAEgCAEQgDAEgEACQgFACgGAAQgKAAgFgEg");
	this.shape_27.setTransform(-65.15,0.8);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#FFFFFF").s().p("AgOAXQgFgEgBgIIAJgCQAAAFADADQAEADAEAAQAHAAACgDQADgCAAgDQAAgEgCgBIgJgDIgMgEQgEgBgCgDQgCgDAAgEQAAgDABgEQACgDADgBIAFgDIAIgBQAFAAAFACQAFACACACQACAEAAAEIgIABQAAgDgDgDQgDgCgFAAQgGAAgCACQgDACABADIABADIADADIAGACIAOADQADABACADQACADAAAFQAAAEgCAEQgDAEgFACQgEACgHAAQgJAAgFgEg");
	this.shape_28.setTransform(-70.15,0.8);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#FFFFFF").s().p("AgQAUQgHgHAAgNQAAgMAHgHQAHgHAKAAQAKAAAHAHQAGAHAAAMIAAADIgmAAQABAIAEAEQAEAFAGAAQAFAAADgDQADgCACgGIAJACQgBAHgHAFQgFAEgJAAQgLAAgGgHgAgIgOQgFAEgBAGIAcAAQAAgGgDgDQgEgGgGAAQgGAAgDAFg");
	this.shape_29.setTransform(-75.4,0.8);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("#FFFFFF").s().p("AgNAbIAAg0IAIAAIAAAJQADgGACgCQACgCADABQAEAAAFACIgDAIQgDgBgEAAQgCAAgCABQgCACgBADIgBAKIAAAbg");
	this.shape_30.setTransform(-79.45,0.75);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("#FFFFFF").s().p("AgaAkIAAhHIAaAAIAKABQAGABADACQAEADACAEQACAFAAAFQABAJgHAFQgFAHgQAAIgRAAIAAAdgAgRgBIARAAQAKAAADgDQAFgEAAgGQAAgEgCgEQgDgDgEgBIgJAAIgRAAg");
	this.shape_31.setTransform(-84.65,-0.175);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_31},{t:this.shape_30},{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20},{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.lockTxt, new cjs.Rectangle(-90.1,-7.5,180.3,15.1), null);


(lib.lgames = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_9 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(9).call(this.frame_9).wait(1));

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-3.2,-6.5)).s().p("AggBBIAAiBIBAAAIAACBg");
	this.shape.setTransform(-68.75,0.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-10.9,-6.5)).s().p("AhsBBIAAiBIDZAAIAACBg");
	this.shape_1.setTransform(-61.1,0.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-18.5,-6.5)).s().p("Ai4BBIAAiBIFxAAIAACBg");
	this.shape_2.setTransform(-53.475,0.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-26.2,-6.5)).s().p("AkFBBIAAiBIILAAIAACBg");
	this.shape_3.setTransform(-45.825,0.5);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-33.8,-6.5)).s().p("AlRBBIAAiBIKjAAIAACBg");
	this.shape_4.setTransform(-38.2,0.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-41.4,-6.5)).s().p("AmeBBIAAiBIM8AAIAACBg");
	this.shape_5.setTransform(-30.55,0.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-49.1,-6.5)).s().p("AnqBBIAAiBIPVAAIAACBg");
	this.shape_6.setTransform(-22.925,0.5);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-56.7,-6.5)).s().p("Ao2BBIAAiBIRtAAIAACBg");
	this.shape_7.setTransform(-15.275,0.5);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-64.3,-6.5)).s().p("AqDBBIAAiBIUHAAIAACBg");
	this.shape_8.setTransform(-7.65,0.5);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.bf(img._1000Games, null, new cjs.Matrix2D(1,0,0,1,-72,-6.5)).s().p("ArPBBIAAiBIWfAAIAACBg");
	this.shape_9.setTransform(0,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-72,-6,144,13);


(lib.levelload = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgRAdIAAg5IAIAAIAAAyIAbAAIAAAHg");
	this.shape.setTransform(1.425,-2.925);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgUAdIAAg5IAoAAIAAAHIghAAIAAASIAfAAIAAAGIgfAAIAAATIAiAAIAAAHg");
	this.shape_1.setTransform(-3.525,-2.925);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AgDAdIgWg5IAIAAIAPApIACAJIADgJIAQgpIAHAAIgWA5g");
	this.shape_2.setTransform(-9,-2.925);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AgUAdIAAg5IAoAAIAAAHIghAAIAAASIAfAAIAAAGIgfAAIAAATIAiAAIAAAHg");
	this.shape_3.setTransform(-14.225,-2.925);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AgRAdIAAg5IAIAAIAAAyIAbAAIAAAHg");
	this.shape_4.setTransform(-19.075,-2.925);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("AgMAaQgGgEgEgHQgDgHAAgIQAAgHADgHQAEgIAGgDQAHgDAHgBQAGAAAFACQAFACADAEQADAEACAGIgHABIgDgHQgCgCgEgBQgDgCgFAAQgEAAgEACQgEABgCACQgCADgBADQgDAGAAAFQAAAHADAGQADAFAFACQAFACAEABQAFgBAFgBQAFgCACgDIAAgKIgRAAIAAgGIAYAAIAAAVQgFAEgGACQgGACgGABQgIAAgHgEg");
	this.shape_5.setTransform(-26.775,-2.9);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AAPAdIgdgsIAAAsIgHAAIAAg5IAHAAIAeAsIAAgsIAHAAIAAA5g");
	this.shape_6.setTransform(-32.8,-2.925);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFFFF").s().p("AgDAdIAAg5IAHAAIAAA5g");
	this.shape_7.setTransform(-36.725,-2.925);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FFFFFF").s().p("AgXAdIAAg5IAUAAIAJABQAFABAEADQAEAEADAGQACAGAAAHQAAAGgCAFQgBAFgDAEIgFAFIgHADIgIABgAgPAWIAMAAIAIgBIAFgDQADgDABgEQACgFAAgGQAAgIgDgFQgDgFgEgCIgJgBIgMAAg");
	this.shape_8.setTransform(-40.675,-2.925);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFFFFF").s().p("AgRAdIAAg5IAIAAIAAAyIAbAAIAAAHg");
	this.shape_9.setTransform(-45.725,-2.925);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#FFFFFF").s().p("AgDAdIAAg5IAHAAIAAA5g");
	this.shape_10.setTransform(-49.175,-2.925);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FFFFFF").s().p("AgMAaQgGgCgCgGQgBgFAAgJIAAggIAHAAIAAAgQAAAHACAEQABAEADABQADACAFAAQAIAAADgDQAEgEAAgLIAAggIAIAAIAAAgQAAAJgCAFQgCAFgFADQgGADgIAAQgHAAgFgDg");
	this.shape_11.setTransform(-53.2,-2.875);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#FFFFFF").s().p("AgUAdIAAg5IAUAAQAGAAAEACQAFACABAEQADADAAAEQAAAEgCADQgCADgEACQAFABADADQADAEAAAFQAAAEgCAEQgCADgDACIgGADIgJABgAgNAWIANAAIAGAAIADgCQABAAAAAAQABgBAAAAQABgBAAAAQAAgBABAAQAAgBAAAAQAAgBABAAQAAgBAAgBQAAAAAAgBQAAgDgCgCQgCgDgDgBIgHgBIgNAAgAgNgDIAMAAIAHgBQADgBABgCQACgCAAgDQAAgDgCgCQgBgCgDgBIgIgBIgLAAg");
	this.shape_12.setTransform(-58.7,-2.925);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFFFFF").s().p("AgDAEIAAgHIAHAAIAAAHg");
	this.shape_13.setTransform(6.85,-0.45);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#FFFFFF").s().p("AgDAEIAAgHIAHAAIAAAHg");
	this.shape_14.setTransform(6.85,-0.45);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#FFFFFF").s().p("AgDAEIAAgHIAHAAIAAAHg");
	this.shape_15.setTransform(6.85,-0.45);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.shape_13,p:{x:6.85}}]},19).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.shape_14,p:{x:6.85}},{t:this.shape_13,p:{x:9.05}}]},20).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.shape_15},{t:this.shape_14,p:{x:9.05}},{t:this.shape_13,p:{x:11.25}}]},20).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.shape_15},{t:this.shape_14,p:{x:9.05}},{t:this.shape_13,p:{x:11.25}}]},20).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-63.4,-9.2,77.9,12.899999999999999);


(lib.joystickPointer = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.joystick2();
	this.instance.parent = this;
	this.instance.setTransform(-61,-61);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.joystickPointer, new cjs.Rectangle(-61,-61,122,122), null);


(lib.healthline = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#F2F2F2").s().p("AmZAOIAAgbIMzAAIAAAbg");
	this.shape.setTransform(40.975,1.075);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.healthline, new cjs.Rectangle(0,-0.3,82,2.8), null);


(lib.gun2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.instance = new lib.roka2();
	this.instance.parent = this;
	this.instance.setTransform(-271,-149.05);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.gun2, new cjs.Rectangle(-271,-149,521,322), null);


(lib.fons = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#2B2B2B").s().p("Egx/AcIMAAAg4PMBj/AAAMAAAA4Pg");
	this.shape.setTransform(320,180);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.fons, new cjs.Rectangle(0,0,640,360), null);


(lib.fireButton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.shoot();
	this.instance.parent = this;
	this.instance.setTransform(-61,-61);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.fireButton, new cjs.Rectangle(-61,-61,122,122), null);


(lib.explosionsymbol = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.explosion();
	this.instance.parent = this;
	this.instance.setTransform(-160,-90);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.explosionsymbol, new cjs.Rectangle(-160,-90,320,252), null);


(lib.closeoptions = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#CCCCCC").ss(1,1,1).p("AiUiQICUCQIiUCRACViQIiVCQICVCR");
	this.shape.setTransform(17.025,18.85);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer 2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(66,66,66,0.02)").s().p("AjvEFIAAoJIHfAAIAAIJg");
	this.shape_1.setTransform(18.55,16.375);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

}).prototype = getMCSymbolPrototype(lib.closeoptions, new cjs.Rectangle(-5.4,-9.7,48,52.2), null);


(lib.buttonbackground = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#474747").ss(0.2,1,1).p("Au3AAIdvAA");
	this.shape.setTransform(97.6,28.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#999999").ss(1,1,1,3,true).p("APOifIAAEeIAAAhI+bAAIAAghIAAkeg");
	this.shape_1.setTransform(97.425,16);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#2E2E2E").s().p("AvNARIAAggIAYAAIdvAAIAUAAIAAAgg");
	this.shape_2.setTransform(97.425,30.35);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#333333").s().p("AO6CQI9vAAIgYAAIAAkfIebAAIAAEfg");
	this.shape_3.setTransform(97.425,14.35);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.buttonbackground, new cjs.Rectangle(-1,-1,196.9,34), null);


(lib.bultapreloader = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib._1000bulta();
	this.instance.parent = this;
	this.instance.setTransform(-9,-12);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.bultapreloader, new cjs.Rectangle(-9,-12,18,24), null);


(lib.bullets_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_3
	this.text = new cjs.Text("/ 20", "18px 'Arial'", "#E6E6E6");
	this.text.lineHeight = 22;
	this.text.lineWidth = 41;
	this.text.parent = this;
	this.text.setTransform(73.15,11.25);

	this.bullettxt = new cjs.Text("20", "22px 'Arial'", "#DEDEDE");
	this.bullettxt.name = "bullettxt";
	this.bullettxt.textAlign = "right";
	this.bullettxt.lineHeight = 27;
	this.bullettxt.lineWidth = 35;
	this.bullettxt.parent = this;
	this.bullettxt.setTransform(68.15,7.15);

	this.instance = new lib.bullets();
	this.instance.parent = this;
	this.instance.setTransform(0,0,0.2421,0.2421);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.bullettxt},{t:this.text}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.bullets_1, new cjs.Rectangle(0,0,116.5,39.3), null);


(lib.black = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#2B2B2B").s().p("Eg9KAisMAAAhFXMB6VAAAMAAABFXg");
	this.shape.setTransform(389.5,220);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.black, new cjs.Rectangle(-2,-2,783,444), null);


(lib.asinisScreen = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_7 = function() {
		this.gotoAndStop(0);
	}
	this.frame_16 = function() {
		this.gotoAndStop(0);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(7).call(this.frame_7).wait(9).call(this.frame_16).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FF0000").ss(2.5,1,1).p("EBHUgY3QA1EqAfEzQAvHFAAHZQAAHugzHZQgmFchBFREhG8AY4QhBlRgmlcQgznZAAnuQAAnZAvnFQAgkzA1kq");
	this.shape.setTransform(-1.5,0);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#00FF00").ss(4,1,1).p("EBHUgY3QA1EqAfEzQAvHFAAHZQAAHugzHZQgmFchBFREhG8AY4QhBlRgmlcQgznZAAnuQAAnZAvnFQAgkzA1kq");
	this.shape_1.setTransform(-1.5,0);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#00FF00").ss(3,1,1).p("EBHUgY3QA1EqAfEzQAvHFAAHZQAAHugzHZQgmFchBFREhG8AY4QhBlRgmlcQgznZAAnuQAAnZAvnFQAgkzA1kq");
	this.shape_2.setTransform(-1.5,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},6).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},8).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-473,-161.2,943,322.4);


(lib._1000WebGames_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.instance = new lib._1000WebGames();
	this.instance.parent = this;
	this.instance.setTransform(-297,-31.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib._1000WebGames_1, new cjs.Rectangle(-297,-31.5,594,63), null);


(lib.tryagainbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E3E3E3").s().p("AASAvIgkg8IAAA8IgSAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape.setTransform(90.6,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E3E3E3").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_1.setTransform(84.175,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#E3E3E3").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_2.setTransform(77.625,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E3E3E3").s().p("AgVAqQgKgGgGgMQgFgLAAgNQAAgOAGgLQAGgMAMgFQAIgFANAAQARAAAKAHQAJAHAEANIgTAEQgCgHgFgEQgGgEgIAAQgLAAgHAHQgIAJAAAPQAAAPAIAJQAHAIAKAAQAHAAAFgCQAHgDAEgDIAAgMIgWAAIAAgPIApAAIAAAkQgGAHgLAEQgLAEgMAAQgNAAgMgGg");
	this.shape_3.setTransform(67.8,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#E3E3E3").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_4.setTransform(58.125,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E3E3E3").s().p("AgIAvIAAgnIgjg1IAXAAIAUAlIAVglIAXAAIgjA1IAAAng");
	this.shape_5.setTransform(46.3,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#E3E3E3").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_6.setTransform(38.175,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#E3E3E3").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_7.setTransform(29.075,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(60.15,16,0.6159,1,0,0,0,97.5,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.tryagainbutton, new cjs.Rectangle(0.1,0,120,32), null);


(lib.temeklis = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_9 = function() {
		this.gotoAndStop(0);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(9).call(this.frame_9).wait(127));

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAjWIAACMADXAAIiMAAAAABLIAACMAhKAAIiMAAAAAAAIACAA");

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAhYIAAiMAAADlIAAiMABZAAICMAAAjkAAICMAA");

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAhlIAAiMAAADyIAAiMABmAAICMAAAjxAAICMAA");

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAj/IAACMAEAAAIiMAAAAAB0IAACMAhzAAIiMAAAAAAAIACAA");

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAhpIAAiMAAAD2IAAiMABqAAICMAAAj1AAICMAA");

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAheIAAiMAAADrIAAiMABfAAICMAAAjqAAICMAA");
	this.shape_5.setTransform(0.025,0.025);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAhUIAAiMAAADhIAAiMABVAAICMAAAjgAAICMAA");

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("#FFFFFF").ss(0.8,1,1).p("AAAjWIAACMAAABLIAACMADXAAIiMAAAhKAAIiMAAAAAAAIACAA");

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#FF0000").ss(0.8,1,1).p("AAAjWIAACMAAAAAIABAAAAABLIAACMADXAAIiMAAAhKAAIiMAA");
	this.shape_8.setTransform(0.1,0.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).wait(126));

	// Layer 2
	this.instance = new lib.RELOADING();
	this.instance.parent = this;
	this.instance.setTransform(63.85,22.6);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(10).to({_off:false},0).to({alpha:1},23).wait(2).to({alpha:0},24).to({alpha:1},26).wait(2).to({alpha:0},25).to({alpha:1},23).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-26.5,-26.5,140.4,58.5);


(lib.dums2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_33 = function() {
		this.stop();
		this.parent.removeChild(this);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(33).call(this.frame_33).wait(1));

	// Layer 1
	this.instance = new lib.smokesymbol2("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(0,0,0.0469,0.0469);
	this.instance.alpha = 0.1992;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({_off:false},0).to({scaleX:0.4219,scaleY:0.4219,alpha:1},8).to({scaleX:1.3906,scaleY:1.3906,alpha:0},24).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.4,-44.4,89,89);


(lib.dums = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_33 = function() {
		this.stop();
		this.parent.removeChild(this);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(33).call(this.frame_33).wait(1));

	// Layer 1
	this.instance = new lib.smokesymbol("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(0,0,0.0469,0.0469);
	this.instance.alpha = 0.1992;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({_off:false},0).to({scaleX:0.4219,scaleY:0.4219,alpha:0.7891},8).to({scaleX:1.3906,scaleY:1.3906,alpha:0},24).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.4,-44.4,89,89);


(lib.restartbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape.setTransform(143.525,16.425);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_1.setTransform(135.075,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AgJAvIghhcIAUAAIAXBDIAWhDIAUAAIghBcg");
	this.shape_2.setTransform(126.275,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_3.setTransform(117.775,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_4.setTransform(109.625,16.425);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_5.setTransform(97.775,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_6.setTransform(89.525,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_7.setTransform(79.675,16.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_8.setTransform(71.975,16.4);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#D9D9D9").s().p("AgaAoQgJgIgCgQIASgCQACAKAFAEQAFAFAIgBQAJAAAFgDQAEgEAAgFQAAgEgCgCQgCgDgFgBIgNgFQgQgDgGgFQgJgHAAgLQAAgIAFgFQADgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgHgEgEQgDgDgIAAQgIABgEADQgEACAAADQAAAEAEACQADADANADQAOADAGAEQAHAEADAEQAEAHAAAJQAAAHgEAIQgFAGgIAEQgJADgMAAQgQAAgKgIg");
	this.shape_9.setTransform(63.6,16.4);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_10.setTransform(55.175,16.4);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_11.setTransform(46.425,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.restartbutton, new cjs.Rectangle(0.2,0,194.8,32), null);


(lib.playButton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape.setTransform(89.525,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AAbAvIAAhJIgSBJIgRAAIgShJIAABJIgSAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_1.setTransform(79.6,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_2.setTransform(69.475,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AgUAqQgMgGgFgMQgGgLAAgNQAAgOAHgLQAGgMALgFQAKgFAMAAQARAAAKAHQAKAHADANIgTAEQgCgHgGgEQgFgEgIAAQgLAAgIAHQgHAJAAAPQAAAPAHAJQAIAIALAAQAFAAAHgCQAFgDAFgDIAAgMIgWAAIAAgPIAoAAIAAAkQgFAHgMAEQgLAEgLAAQgNAAgLgGg");
	this.shape_3.setTransform(59.65,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AATAvIgThFIgSBFIgUAAIgWhcIATAAIAOA/IARg/IAWAAIAQBAIAOhAIATAAIgWBcg");
	this.shape_4.setTransform(45,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_5.setTransform(34.675,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AASAvIglg8IAAA8IgRAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape_6.setTransform(25.45,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 3
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(57.6,16,0.6723,1,0,0,0,96.8,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.playButton, new cjs.Rectangle(-7.5,0,131,32), null);


(lib.playagainbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E3E3E3").s().p("AASAvIgkg8IAAA8IgSAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape.setTransform(95.1,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E3E3E3").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_1.setTransform(88.675,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#E3E3E3").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_2.setTransform(82.125,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E3E3E3").s().p("AgVAqQgKgGgGgMQgFgLgBgNQABgOAGgLQAGgMAMgFQAIgFANAAQARAAAKAHQAJAHAEANIgTAEQgCgHgFgEQgGgEgIAAQgLAAgHAHQgIAJAAAPQAAAPAIAJQAHAIAKAAQAHAAAFgCQAHgDAEgDIAAgMIgWAAIAAgPIApAAIAAAkQgGAHgLAEQgLAEgMAAQgNAAgMgGg");
	this.shape_3.setTransform(72.3,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#E3E3E3").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_4.setTransform(62.625,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E3E3E3").s().p("AgIAvIAAgnIgjg1IAXAAIAUAlIAVglIAXAAIgjA1IAAAng");
	this.shape_5.setTransform(50.8,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#E3E3E3").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_6.setTransform(42.925,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#E3E3E3").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_7.setTransform(34.575,16.425);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E3E3E3").s().p("AgjAvIAAhcIAeAAQARAAAFABQAIACAFAHQAGAHgBALQAAAJgCAFQgEAGgEACQgFAEgFABQgGABgMAAIgNAAIAAAkgAgQgEIAKAAQALABAEgCQADgCADgCQACgEAAgDQAAgGgDgDQgDgDgFgBIgNgBIgJAAg");
	this.shape_8.setTransform(26.15,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(60.05,16,0.6158,1,0,0,0,97.5,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.playagainbutton, new cjs.Rectangle(0,0,120,32), null);


(lib.normalbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape.setTransform(119.125,16.425);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_1.setTransform(110.125,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AAcAvIAAhJIgTBJIgRAAIgShJIAABJIgSAAIAAhcIAdAAIAPA+IARg+IAcAAIAABcg");
	this.shape_2.setTransform(100,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_3.setTransform(90.325,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AggAkQgMgNAAgWQAAgNAEgLQADgGAGgGQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAXgMANQgMAMgVAAQgUAAgMgMgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgQgHgHQgHgIgMAAQgLAAgHAIg");
	this.shape_4.setTransform(80.175,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AASAvIgkg8IAAA8IgSAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape_5.setTransform(70.35,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.normalbutton, new cjs.Rectangle(0.2,0,194.8,32), null);


(lib.moregamesbutton2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgFgBIgOgFQgPgDgGgFQgIgHgBgLQABgIADgFQAFgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgSABQgCgHgEgEQgEgDgHAAQgIABgFADQgDACAAADQAAAEADACQAEADAMADQAPADAGAEQAGAEAEAEQAEAHAAAJQAAAHgEAIQgFAGgIAEQgIADgMAAQgRAAgJgIg");
	this.shape.setTransform(97.95,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_1.setTransform(89.525,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AAbAvIAAhJIgSBJIgRAAIgShJIAABJIgSAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_2.setTransform(79.6,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_3.setTransform(69.475,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AgUAqQgMgGgFgMQgGgLAAgNQAAgOAHgLQAGgMALgFQAKgFAMAAQARAAAKAHQAKAHADANIgTAEQgCgHgGgEQgFgEgIAAQgLAAgIAHQgHAJAAAPQAAAPAHAJQAIAIALAAQAFAAAHgCQAFgDAFgDIAAgMIgWAAIAAgPIAoAAIAAAkQgFAHgMAEQgLAEgLAAQgNAAgLgGg");
	this.shape_4.setTransform(59.65,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_5.setTransform(46.925,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_6.setTransform(38.175,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFFFF").s().p("AggAkQgMgNAAgWQAAgNAEgLQADgGAGgGQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAXgMANQgMAMgVAAQgUAAgMgMgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgQgHgHQgHgIgMAAQgLAAgHAIg");
	this.shape_7.setTransform(28.025,16.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FFFFFF").s().p("AAcAvIAAhJIgTBJIgRAAIgShJIAABJIgSAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_8.setTransform(17.5,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(57.6,16,0.6723,1,0,0,0,96.8,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.moregamesbutton2, new cjs.Rectangle(-7.5,0,131,32), null);


(lib.morefinishbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E3E3E3").s().p("AgaAoQgJgIgCgQIASgCQACAKAFAEQAFAFAIgBQAJAAAFgDQAEgEAAgFQAAgEgCgCQgCgDgFgBIgNgFQgQgDgGgFQgJgHAAgLQAAgIAFgFQADgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgHgEgEQgDgDgIAAQgIABgEADQgEACAAADQAAAEAEACQADADANADQAOADAGAEQAHAEADAEQAEAHAAAJQAAAHgEAIQgFAGgIAEQgJADgMAAQgQAAgKgIg");
	this.shape.setTransform(100.95,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E3E3E3").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_1.setTransform(92.525,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#E3E3E3").s().p("AAbAvIAAhJIgSBJIgRAAIgThJIAABJIgRAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_2.setTransform(82.6,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E3E3E3").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_3.setTransform(72.475,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#E3E3E3").s().p("AgVAqQgLgGgFgMQgGgLABgNQAAgOAGgLQAGgMALgFQAJgFANAAQASAAAJAHQAJAHADANIgSAEQgCgHgGgEQgFgEgIAAQgLAAgHAHQgIAJAAAPQAAAPAIAJQAHAIALAAQAFAAAGgCQAHgDAEgDIAAgMIgWAAIAAgPIAoAAIAAAkQgFAHgLAEQgMAEgLAAQgOAAgLgGg");
	this.shape_4.setTransform(62.65,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E3E3E3").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_5.setTransform(49.925,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#E3E3E3").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_6.setTransform(41.175,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#E3E3E3").s().p("AggAkQgMgNAAgWQAAgNAEgLQADgGAGgGQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAXgMANQgMAMgVAAQgUAAgMgMgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgQgHgHQgHgIgMAAQgLAAgHAIg");
	this.shape_7.setTransform(31.025,16.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E3E3E3").s().p("AAbAvIAAhJIgSBJIgRAAIgThJIAABJIgRAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_8.setTransform(20.5,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(60.05,16,0.6158,1,0,0,0,97.5,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.morefinishbutton, new cjs.Rectangle(0,0,120,32), null);


(lib.mainmenubutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgBgFQgCgIAAgQIAAgwIATAAIAAAxQAAAMABAEQAAAFAFAEQAEADAIAAQAHAAAFgDQADgDACgFIAAgQIAAgyIATAAIAAAwQAAAQgBAHQgCAHgEAFQgEAFgHADQgHACgLAAQgNAAgGgDg");
	this.shape.setTransform(126.55,16.475);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AASAvIglg8IAAA8IgRAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape_1.setTransform(117.15,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_2.setTransform(108.325,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AAcAvIAAhJIgTBJIgRAAIgShJIAABJIgSAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_3.setTransform(98.4,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AASAvIgkg8IAAA8IgSAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape_4.setTransform(84.65,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_5.setTransform(78.225,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_6.setTransform(71.675,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AAbAvIAAhJIgSBJIgRAAIgThJIAABJIgRAAIAAhcIAdAAIAPA+IARg+IAcAAIAABcg");
	this.shape_7.setTransform(61.55,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.6,16,1,1,0,0,0,97.5,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.mainmenubutton, new cjs.Rectangle(0.1,0,194.9,32), null);


(lib.levelcompletebutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E3E3E3").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape.setTransform(97.125,16.425);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E3E3E3").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_1.setTransform(88.675,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#E3E3E3").s().p("AgJAvIghhcIAUAAIAXBDIAWhDIAUAAIghBcg");
	this.shape_2.setTransform(79.875,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E3E3E3").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_3.setTransform(71.375,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#E3E3E3").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_4.setTransform(63.225,16.425);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E3E3E3").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_5.setTransform(51.375,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#E3E3E3").s().p("AAVAvIgVghIgUAhIgWAAIAggwIgdgsIAWAAIARAeIATgeIAVAAIgdAtIAgAvg");
	this.shape_6.setTransform(43.075,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#E3E3E3").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_7.setTransform(34.575,16.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E3E3E3").s().p("AASAvIglg8IAAA8IgRAAIAAhcIASAAIAlA8IAAg8IASAAIAABcg");
	this.shape_8.setTransform(25.35,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(60.05,16,0.6158,1,0,0,0,97.5,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.levelcompletebutton, new cjs.Rectangle(0,0,120,32), null);


(lib.levelcomplete2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.levelscoretxt = new cjs.Text("Score: 10000", "italic 12px 'Arial'", "#D9D9D9");
	this.levelscoretxt.name = "levelscoretxt";
	this.levelscoretxt.lineHeight = 15;
	this.levelscoretxt.lineWidth = 146;
	this.levelscoretxt.parent = this;
	this.levelscoretxt.setTransform(-28.7,43.5);

	this.bestscoretxt = new cjs.Text("Best score: 10000", "italic 12px 'Arial'", "#666666");
	this.bestscoretxt.name = "bestscoretxt";
	this.bestscoretxt.lineHeight = 15;
	this.bestscoretxt.lineWidth = 155;
	this.bestscoretxt.parent = this;
	this.bestscoretxt.setTransform(-28.7,76);

	this.stars = new lib.stars();
	this.stars.name = "stars";
	this.stars.parent = this;
	this.stars.setTransform(295.35,61.65,1.1429,1.1429,0,0,0,35.1,17.6);

	this.againButton = new lib.playagainbutton();
	this.againButton.name = "againButton";
	this.againButton.parent = this;
	this.againButton.setTransform(320.35,157.5,1,1,0,0,0,97.5,16);

	this.nextButton = new lib.levelcompletebutton();
	this.nextButton.name = "nextButton";
	this.nextButton.parent = this;
	this.nextButton.setTransform(316.95,211.5,1,1,0,0,0,97.5,16);
	this.nextButton.visible = false;

	this.enemykilltxt = new cjs.Text("Enemies killed: 80", "italic 12px 'Arial'", "#D9D9D9");
	this.enemykilltxt.name = "enemykilltxt";
	this.enemykilltxt.lineHeight = 15;
	this.enemykilltxt.lineWidth = 146;
	this.enemykilltxt.parent = this;
	this.enemykilltxt.setTransform(-28.7,60.5);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFCC66").s().p("AgIAvIAAgSIARAAIAAASgAgEAXIgFguIAAgXIATAAIAAAXIgFAug");
	this.shape.setTransform(98.425,16.55);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFCC66").s().p("AgiAvIAAhdIBEAAIAAAQIgyAAIAAAVIAuAAIAAAPIguAAIAAAZIAzAAIAAAQg");
	this.shape_1.setTransform(88.525,16.55);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFCC66").s().p("AgIAvIAAhNIgcAAIAAgQIBJAAIAAAQIgcAAIAABNg");
	this.shape_2.setTransform(80.075,16.55);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFCC66").s().p("AgiAvIAAhdIBEAAIAAAQIgyAAIAAAVIAuAAIAAAPIguAAIAAAZIAzAAIAAAQg");
	this.shape_3.setTransform(71.925,16.55);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFCC66").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_4.setTransform(63.775,16.575);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFCC66").s().p("AgiAvIAAhdIAeAAQAPABAGABQAIACAGAHQAEAHAAALQAAAJgDAFQgDAFgEAEQgFADgFABQgHACgMAAIgMAAIAAAjgAgQgDIALAAQAKgBADgBQAEgCACgDQACgCAAgFQAAgFgCgDQgDgDgFgBIgMgBIgKAAg");
	this.shape_5.setTransform(55.35,16.55);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFCC66").s().p("AAbAvIAAhJIgSBJIgRAAIgShJIAABJIgSAAIAAhdIAcAAIAQA/IARg/IAcAAIAABdg");
	this.shape_6.setTransform(45.4,16.55);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFCC66").s().p("AggAjQgMgMAAgXQAAgMAEgKQADgIAGgFQAFgGAHgDQAJgDAKAAQAUAAANAMQAMANAAAWQAAAXgMAMQgMANgVAAQgUAAgMgNgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgPgHgIQgHgIgMAAQgLAAgHAIg");
	this.shape_7.setTransform(34.975,16.55);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FFCC66").s().p("AgbAjQgNgMAAgWQAAgXANgNQALgMATAAQARAAALAKQAGAGADALIgSAFQgCgIgFgEQgFgEgIAAQgJAAgHAIQgGAHAAAQQAAARAGAHQAHAIAJAAQAHAAAGgFQAFgEACgKIASAFQgEAPgJAIQgKAHgPAAQgSAAgLgNg");
	this.shape_8.setTransform(25.15,16.55);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFCC66").s().p("AASAvIglg8IAAA8IgRAAIAAhdIASAAIAmA9IAAg9IARAAIAABdg");
	this.shape_9.setTransform(12.15,16.55);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#FFCC66").s().p("AggAjQgMgMAAgXQAAgMAEgKQADgIAGgFQAFgGAHgDQAJgDAKAAQAUAAANAMQAMANAAAWQAAAXgMAMQgMANgVAAQgUAAgMgNgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgPgHgIQgHgIgMAAQgLAAgHAIg");
	this.shape_10.setTransform(2.475,16.55);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FFCC66").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_11.setTransform(-4.375,16.55);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#FFCC66").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAEAIAAQAJAAAEgDQAFgFAAgEQAAgEgCgCQgCgDgEgBIgPgEQgPgEgGgFQgIgHAAgLQAAgHADgHQAFgGAHgDQAIgDAKAAQARAAAJAIQAJAHAAANIgSABQgCgIgEgDQgEgCgHAAQgIgBgFAEQgCACAAAEQAAADACACQAEADAMADQAOADAHAEQAGAEAEAFQAEAFAAAKQAAAIgFAGQgEAIgIADQgIADgMAAQgRAAgJgIg");
	this.shape_12.setTransform(-10.6,16.55);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFCC66").s().p("AgZAoQgKgIgCgQIASgCQACAKAFAEQAFAEAIAAQAJAAAEgDQAFgFAAgEQAAgEgCgCQgCgDgEgBIgPgEQgPgEgGgFQgIgHAAgLQAAgHADgHQAFgGAHgDQAIgDAKAAQARAAAJAIQAJAHAAANIgTABQgBgIgDgDQgEgCgIAAQgIgBgFAEQgCACAAAEQAAADACACQAEADAMADQAOADAHAEQAGAEAEAFQAEAFAAAKQAAAIgFAGQgEAIgIADQgIADgMAAQgRAAgJgIg");
	this.shape_13.setTransform(-19.25,16.55);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#FFCC66").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_14.setTransform(-25.275,16.55);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#FFCC66").s().p("AAcAvIAAhJIgTBJIgRAAIgShJIAABJIgSAAIAAhdIAcAAIAQA/IARg/IAcAAIAABdg");
	this.shape_15.setTransform(-32.55,16.55);

	this.moreButton = new lib.morefinishbutton();
	this.moreButton.name = "moreButton";
	this.moreButton.parent = this;
	this.moreButton.setTransform(192.35,157.5,1,1,0,0,0,97.5,16);

	this.closeButton = new lib.closeoptions();
	this.closeButton.name = "closeButton";
	this.closeButton.parent = this;
	this.closeButton.setTransform(329.95,13.25,0.6667,0.6664,0,0,0,10.1,9.8);
	this.closeButton.visible = false;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.closeButton},{t:this.moreButton},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.enemykilltxt},{t:this.nextButton},{t:this.againButton},{t:this.stars},{t:this.bestscoretxt},{t:this.levelscoretxt}]}).wait(1));

	// Layer 1
	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f().s("#CCCCCC").ss(0.2,1,1).p("A/DAAMA+HAAA");
	this.shape_16.setTransform(152.75,35.5);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f().s("#CCCCCC").ss(1,1,1,3,true).p("A/DumMA+HAAAIAAFjIAAXqMg+HAAAIAA3qg");
	this.shape_17.setTransform(152.75,93.475);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#3B3B3B").s().p("A/CL1IAA3pMA+GAAAIAAXpg");
	this.shape_18.setTransform(152.75,111.225);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#333333").s().p("A/CCxIAAliMA+GAAAIAAFig");
	this.shape_19.setTransform(152.75,17.75);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16}]}).wait(1));

	// Layer 3
	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#262626").s().p("A/COaIAA8zMA+FAAAIAAczg");
	this.shape_20.setTransform(155.8,98.25);

	this.timeline.addTween(cjs.Tween.get(this.shape_20).wait(1));

}).prototype = getMCSymbolPrototype(lib.levelcomplete2, new cjs.Rectangle(-47,-1,401.6,228.5), null);


(lib.levelcomplete = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_48 = function() {
		if (backgroundSound) backgroundSound.stop();
		var nextcreen2 = this;
		nextcreen2.screen.stars.gotoAndStop(levelStars);
	}
	this.frame_69 = function() {
		backgroundSound = createjs.Sound.play("sakumamuzons",createjs.Sound.INTERRUPT_EARLY, 0, 0, -1);
	}
	this.frame_76 = function() {
		var nextcreen = this;
		nextcreen.stop();
		nextcreen.screen.levelscoretxt.text = "Score: " + levelScore;
		nextcreen.screen.bestscoretxt.text = "Best score: " + bestScore;
		nextcreen.screen.enemykilltxt.text = "Enemies killed: " + totalEnemies;
		
		nextcreen.screen.stars.gotoAndStop(levelStars);
		
		nextcreen.screen.closeButton.addEventListener("click", closeScreen);
		nextcreen.screen.nextButton.addEventListener("click", closeScreen);
		nextcreen.screen.againButton.addEventListener("click", closeScreen2);
		nextcreen.screen.moreButton.addEventListener("click", moreGbutton);
		
		
		
		function closeScreen(event) {
			
			removeListeners();
			nextcreen.gotoAndPlay(77);
			
		}
		
		function closeScreen2(event) {
			
			removeListeners();
			nextcreen.gotoAndPlay(77);
			again = true;
		}
		
		function moreGbutton()
		{
		var gotourl;
			if(mobile) {
			gotourl = "https://m.1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=moregames_starplevel&utm_source=" + ref;	
			} else {
			gotourl = "https://1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=moregames_starplevel&utm_source=" + ref;
			}
			window.open(gotourl, "_blank");	
		}
		
		function removeListeners() {
			nextcreen.screen.closeButton.removeEventListener("click", closeScreen);
			nextcreen.screen.nextButton.removeEventListener("click", closeScreen);
			nextcreen.screen.againButton.removeEventListener("click", closeScreen2);
			nextcreen.screen.moreButton.removeEventListener("click", moreGbutton);
		}
	}
	this.frame_167 = function() {
		this.stop();
		resetgame();
		againScreen = false;
		this.parent.removeChild(this);
		startGame();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(48).call(this.frame_48).wait(21).call(this.frame_69).wait(7).call(this.frame_76).wait(91).call(this.frame_167).wait(1));

	// Layer 1
	this.screen = new lib.levelcomplete2();
	this.screen.name = "screen";
	this.screen.parent = this;
	this.screen.setTransform(321,278.4,1,1,0,0,0,152,128.4);
	this.screen.alpha = 0;
	this.screen._off = true;

	this.instance = new lib.black();
	this.instance.parent = this;
	this.instance.setTransform(0,0,6.5979,4.8648);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.screen).wait(48).to({_off:false},0).wait(1).to({regX:154,regY:113.8,x:323,y:255.95,alpha:0.065},0).wait(1).to({y:248.2,alpha:0.1297},0).wait(1).to({y:240.55,alpha:0.1937},0).wait(1).to({y:232.95,alpha:0.2568},0).wait(1).to({y:225.55,alpha:0.3187},0).wait(1).to({y:218.25,alpha:0.3792},0).wait(1).to({y:211.2,alpha:0.4379},0).wait(1).to({y:204.4,alpha:0.4948},0).wait(1).to({y:197.8,alpha:0.5497},0).wait(1).to({y:191.5,alpha:0.6023},0).wait(1).to({y:185.45,alpha:0.6525},0).wait(1).to({y:179.75,alpha:0.7003},0).wait(1).to({y:174.35,alpha:0.7453},0).wait(1).to({y:169.25,alpha:0.7877},0).wait(1).to({y:164.5,alpha:0.8272},0).wait(1).to({y:160.15,alpha:0.8637},0).wait(1).to({y:156.1,alpha:0.8972},0).wait(1).to({y:152.45,alpha:0.9277},0).wait(1).to({y:149.2,alpha:0.955},0).wait(1).to({y:146.3,alpha:0.9791},0).wait(1).to({regX:152,regY:128.4,x:321,y:158.4,alpha:1},0).to({y:172.4},7).wait(1).to({regX:154,regY:113.8,x:323,y:155.1},0).wait(1).to({y:152},0).wait(1).to({y:148.9},0).wait(1).to({y:146.25},0).wait(1).to({y:144.45},0).wait(1).to({regX:152,regY:128.4,x:321,y:158.4},0).wait(1).to({regX:154,regY:113.8,x:323,y:143.95,alpha:0.9985},0).wait(1).to({y:144.5,alpha:0.994},0).wait(1).to({y:145.4,alpha:0.9865},0).wait(1).to({y:146.65,alpha:0.976},0).wait(1).to({y:148.25,alpha:0.9626},0).wait(1).to({y:150.2,alpha:0.9463},0).wait(1).to({y:152.55,alpha:0.9271},0).wait(1).to({y:155.2,alpha:0.9049},0).wait(1).to({y:158.2,alpha:0.8799},0).wait(1).to({y:161.5,alpha:0.8521},0).wait(1).to({y:165.2,alpha:0.8215},0).wait(1).to({y:169.2,alpha:0.7881},0).wait(1).to({y:173.55,alpha:0.752},0).wait(1).to({y:178.2,alpha:0.7132},0).wait(1).to({y:183.15,alpha:0.6718},0).wait(1).to({y:188.45,alpha:0.6278},0).wait(1).to({y:194,alpha:0.5813},0).wait(1).to({y:199.9,alpha:0.5323},0).wait(1).to({y:206.05,alpha:0.481},0).wait(1).to({y:212.5,alpha:0.4275},0).wait(1).to({y:219.15,alpha:0.3717},0).wait(1).to({y:226.1,alpha:0.3139},0).wait(1).to({y:233.25,alpha:0.2542},0).wait(1).to({y:240.65,alpha:0.1928},0).wait(1).to({y:248.2,alpha:0.1298},0).wait(1).to({y:255.9,alpha:0.0654},0).wait(1).to({regX:152,regY:128.4,x:321,y:278.4,alpha:0},0).to({_off:true},20).wait(39));
	this.timeline.addTween(cjs.Tween.get(this.instance).wait(129).to({_off:false},0).to({alpha:1},16).wait(23));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-13.2,-9.7,5166.2,2160);


(lib.joystickLeft = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.pointer = new lib.joystickPointer();
	this.pointer.name = "pointer";
	this.pointer.parent = this;

	this.timeline.addTween(cjs.Tween.get(this.pointer).wait(1));

	// Layer_1
	this.instance = new lib.joystick();
	this.instance.parent = this;
	this.instance.setTransform(-120,-120);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.joystickLeft, new cjs.Rectangle(-120,-120,240,240), null);


(lib.instructionsbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIASgCQACAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgEgBIgPgFQgPgDgGgFQgJgHABgLQAAgIADgFQAEgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgHgDgEQgFgDgHAAQgIABgFADQgCACAAADQAAAEACACQAEADANADQANADAHAEQAHAEADAEQAEAHAAAJQAAAHgFAIQgEAGgIAEQgJADgLAAQgRAAgJgIg");
	this.shape.setTransform(138.6,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AASAvIglg8IAAA8IgRAAIAAhcIASAAIAmA8IAAg8IARAAIAABcg");
	this.shape_1.setTransform(129.6,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AggAkQgMgNAAgWQAAgNAEgLQADgGAGgGQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAXgMANQgMAMgVAAQgUAAgMgMgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgQgHgHQgHgIgMAAQgLAAgHAIg");
	this.shape_2.setTransform(119.925,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_3.setTransform(113.075,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_4.setTransform(107.275,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AgcAkQgMgNABgWQgBgWAMgNQANgNASAAQASAAAKAKQAHAGACALIgSAFQgCgIgFgEQgGgEgGAAQgKAAgGAHQgHAIAAAQQAAARAHAHQAFAIAKAAQAHAAAGgEQAFgGACgKIASAGQgDAQgKAGQgKAIgPAAQgRAAgNgMg");
	this.shape_5.setTransform(98.55,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQAAAMABAEQACAFAEAEQAFADAGAAQAJAAADgDQAFgDABgFIAAgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgMAAgHgDg");
	this.shape_6.setTransform(89.15,16.475);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_7.setTransform(80.225,16.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_8.setTransform(71.125,16.4);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgEgBIgPgFQgPgDgGgFQgIgHAAgLQAAgIADgFQAFgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgSABQgCgHgDgEQgFgDgHAAQgIABgFADQgCACAAADQAAAEACACQAEADAMADQAOADAHAEQAGAEAEAEQAEAHAAAJQAAAHgFAIQgEAGgIAEQgIADgMAAQgRAAgJgIg");
	this.shape_9.setTransform(62.75,16.4);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#D9D9D9").s().p("AASAvIgkg8IAAA8IgSAAIAAhcIATAAIAlA8IAAg8IARAAIAABcg");
	this.shape_10.setTransform(53.75,16.4);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#D9D9D9").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_11.setTransform(47.325,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.instructionsbutton, new cjs.Rectangle(0.2,0,194.8,32), null);


(lib.hardbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgmAvIAAhcIAiAAQALAAAGABQAIACAGAHQAGAGADAJQADAJAAAMQAAALgDAIQgEALgGAGQgFAFgIADQgHACgIAAgAgTAfIANAAIALgBQAEgBADgDQAEgCACgHQABgGAAgLQAAgKgBgFQgDgHgDgCQgDgEgGgBIgOgBIgIAAg");
	this.shape.setTransform(108.5,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_1.setTransform(99.375,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_2.setTransform(89.525,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AASAvIAAgpIgjAAIAAApIgTAAIAAhcIATAAIAAAkIAjAAIAAgkIATAAIAABcg");
	this.shape_3.setTransform(80.125,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.hardbutton, new cjs.Rectangle(0.2,0,194.8,32), null);


(lib.gun = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_7 = function() {
		this.gotoAndStop(0);
	}
	this.frame_30 = function() {
		createjs.Sound.play("reload");
	}
	this.frame_120 = function() {
		this.gotoAndStop(0);
		bullets = maxBullets;
		exportRoot.onScreen.bulletScreen.bullettxt.text = bullets;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(7).call(this.frame_7).wait(23).call(this.frame_30).wait(90).call(this.frame_120).wait(1));

	// Layer 1
	this.instance = new lib.gun2();
	this.instance.parent = this;
	this.instance.setTransform(451.5,400.35);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:455.5,y:408.35},3).to({x:451.5,y:400.35},3).wait(8).to({rotation:14.9998,x:516.5,y:553.3},16).wait(37).to({scaleX:0.9989,scaleY:0.9989,rotation:15.0002,x:516,y:552.6},0).to({scaleX:1,scaleY:1,rotation:14.9998,x:514.5,y:550.3},3).wait(4).to({x:516.5,y:553.3},3).wait(27).to({scaleX:0.9991,scaleY:0.9991,rotation:15.0001,x:505.6,y:532.8},0).to({scaleX:1,scaleY:1,rotation:0,x:451.5,y:400.35},16).wait(1));

	// Layer 3
	this.instance_1 = new lib.gunshot();
	this.instance_1.parent = this;
	this.instance_1.setTransform(311,254.6,0.7352,0.7348,3.9497);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({_off:false},0).wait(2).to({_off:true},1).wait(117));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(180.5,251.3,616.1,533.8);


(lib.gmenu = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_4
	this.asinisScreen = new lib.asinisScreen();
	this.asinisScreen.name = "asinisScreen";
	this.asinisScreen.parent = this;
	this.asinisScreen.setTransform(486.4,278.1);

	this.timeline.addTween(cjs.Tween.get(this.asinisScreen).wait(1));

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#F2F2F2").ss(0.1,1,1).p("AmYgNIMyAAIAAAbIsyAAg");
	this.shape.setTransform(87.3,33.35);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer 1
	this.healthline = new lib.healthline();
	this.healthline.name = "healthline";
	this.healthline.parent = this;
	this.healthline.setTransform(46.35,32.3);

	this.timeline.addTween(cjs.Tween.get(this.healthline).wait(1));

	// Layer 2
	this.fullhealthtxt = new cjs.Text("/ 180", "18px 'Arial'", "#E6E6E6");
	this.fullhealthtxt.name = "fullhealthtxt";
	this.fullhealthtxt.lineHeight = 22;
	this.fullhealthtxt.lineWidth = 54;
	this.fullhealthtxt.parent = this;
	this.fullhealthtxt.setTransform(89.1,11.4);

	this.healthttxt = new cjs.Text("180", "22px 'Arial'", "#DEDEDE");
	this.healthttxt.name = "healthttxt";
	this.healthttxt.textAlign = "right";
	this.healthttxt.lineHeight = 27;
	this.healthttxt.lineWidth = 54;
	this.healthttxt.parent = this;
	this.healthttxt.setTransform(81.4,7.65);

	this.instance = new lib.health();
	this.instance.parent = this;
	this.instance.setTransform(5,6,0.2719,0.2719);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.healthttxt},{t:this.fullhealthtxt}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.gmenu, new cjs.Rectangle(5,5.7,139.9,31.900000000000002), null);


(lib.fullscreenButton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AASAvIgkg8IAAA8IgSAAIAAhcIATAAIAlA8IAAg8IARAAIAABcg");
	this.shape.setTransform(134.85,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_1.setTransform(126.025,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_2.setTransform(117.375,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_3.setTransform(108.625,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AgbAkQgMgNgBgWQABgWAMgNQALgNATAAQARAAALAKQAGAGADALIgSAFQgCgIgFgEQgGgEgGAAQgKAAgHAHQgGAIAAAQQAAARAGAHQAHAIAJAAQAHAAAGgEQAFgGACgKIASAGQgDAQgKAGQgKAIgPAAQgSAAgLgMg");
	this.shape_4.setTransform(98.75,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AgaAoQgJgIgCgQIASgCQACAKAFAEQAFAFAIgBQAJAAAFgDQAEgEAAgFQAAgEgCgCQgCgDgFgBIgNgFQgQgDgGgFQgJgHAAgLQAAgIAFgFQADgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgHgEgEQgDgDgIAAQgIABgEADQgEACAAADQAAAEAEACQADADANADQAOADAGAEQAHAEADAEQAEAHAAAJQAAAHgEAIQgFAGgIAEQgJADgMAAQgQAAgKgIg");
	this.shape_5.setTransform(89.7,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_6.setTransform(78.425,16.425);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_7.setTransform(70.475,16.425);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQAAAMABAEQABAFAFAEQAFADAGAAQAIAAAFgDQADgDABgFIABgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgNAAgGgDg");
	this.shape_8.setTransform(61.45,16.475);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#D9D9D9").s().p("AgfAvIAAhcIA/AAIAAAPIgsAAIAAAWIAlAAIAAAPIglAAIAAAog");
	this.shape_9.setTransform(53,16.4);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#D9D9D9").s().p("AASAvIglg8IAAA8IgRAAIAAhcIASAAIAmA8IAAg8IARAAIAABcg");
	this.shape_10.setTransform(151.1,16.4);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#D9D9D9").s().p("AgcAkQgMgNABgWQgBgWAMgNQANgNASAAQARAAALAKQAHAGADALIgTAFQgCgIgFgEQgGgEgGAAQgKAAgGAHQgHAIAAAQQAAARAHAHQAFAIAKAAQAIAAAFgEQAFgGADgKIASAGQgFAQgJAGQgKAIgPAAQgRAAgNgMg");
	this.shape_11.setTransform(115,16.4);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgEgBIgPgFQgPgDgGgFQgIgHAAgLQAAgIADgFQAFgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgSABQgCgHgEgEQgEgDgHAAQgIABgFADQgCACAAADQAAAEACACQAEADAMADQAOADAHAEQAGAEAEAEQAEAHAAAJQAAAHgFAIQgEAGgIAEQgIADgMAAQgRAAgJgIg");
	this.shape_12.setTransform(105.95,16.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgBgFQgCgIAAgQIAAgwIATAAIAAAxQAAAMABAEQABAFAEAEQAEADAIAAQAHAAAEgDQAFgDABgFIAAgQIAAgyIATAAIAAAwQAAAQgBAHQgCAHgEAFQgEAFgHADQgHACgLAAQgMAAgHgDg");
	this.shape_13.setTransform(77.7,16.475);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#D9D9D9").s().p("AgfAvIAAhcIA/AAIAAAPIgsAAIAAAWIAmAAIAAAPIgmAAIAAAog");
	this.shape_14.setTransform(69.25,16.4);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_15.setTransform(57.525,16.4);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#D9D9D9").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_16.setTransform(51.775,16.4);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#D9D9D9").s().p("AAVAvIgVghIgUAhIgWAAIAggwIgdgsIAWAAIARAeIATgeIAVAAIgdAtIAgAvg");
	this.shape_17.setTransform(45.625,16.4);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_18.setTransform(37.125,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7,p:{x:70.475}},{t:this.shape_6,p:{x:78.425}},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3,p:{x:108.625}},{t:this.shape_2,p:{x:117.375}},{t:this.shape_1,p:{x:126.025}},{t:this.shape}]}).to({state:[{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_7,p:{x:86.725}},{t:this.shape_6,p:{x:94.675}},{t:this.shape_12},{t:this.shape_11},{t:this.shape_3,p:{x:124.875}},{t:this.shape_2,p:{x:133.625}},{t:this.shape_1,p:{x:142.275}},{t:this.shape_10}]},1).wait(1));

	// Layer 3
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.2,0,194.8,32);


(lib.fadeout = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_10 = function() {
		pause = false;
	}
	this.frame_30 = function() {
		this.stop();
		this.parent.removeChild(this);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(10).call(this.frame_10).wait(20).call(this.frame_30).wait(1));

	// Layer_2
	this.instance = new lib.levelload();
	this.instance.parent = this;
	this.instance.setTransform(341,343.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true},10).wait(21));

	// Layer 1
	this.instance_1 = new lib.black();
	this.instance_1.parent = this;
	this.instance_1.setTransform(35.55,26.4,0.8365,0.8466,0,0,0,48.5,37.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(10).to({regY:36.9,y:26.25,alpha:0},19).to({_off:true},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-6.6,-6.7,655,376);


(lib.explosion_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_89 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(89).call(this.frame_89).wait(1));

	// Layer_1
	this.instance = new lib.explosionsymbol();
	this.instance.parent = this;
	this.instance.setTransform(0,13.9,0.3875,0.3875,0,0,0,0,36);
	this.instance.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:0.1,scaleX:0.4245,scaleY:0.4245,rotation:1.003,x:10.95,y:15.3,alpha:0.9297},5).to({scaleX:0.825,scaleY:0.8248,rotation:11.9993,x:65.1,y:29.7,alpha:0},84).wait(1));

	// Layer_1
	this.instance_1 = new lib.explosionsymbol();
	this.instance_1.parent = this;
	this.instance_1.setTransform(0,-0.05,0.4344,0.4343);
	this.instance_1.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({scaleX:0.5645,scaleY:0.5645,rotation:1.0022,x:7.2,y:0,alpha:0.4297},5).to({scaleX:0.9416,scaleY:0.9413,rotation:12.0007,x:69.25,alpha:0},79).to({_off:true},1).wait(5));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-109.8,-114.1,344,294.6);


(lib.easybutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgIAvIAAgnIgjg1IAXAAIAUAlIAVglIAXAAIgjA1IAAAng");
	this.shape.setTransform(107.6,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgEgBIgPgFQgPgDgGgFQgIgHAAgLQgBgIAEgFQAFgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgSABQgCgHgEgEQgEgDgHAAQgIABgFADQgDACAAADQAAAEADACQAEADAMADQAPADAGAEQAGAEAEAEQAEAHAAAJQAAAHgEAIQgFAGgIAEQgIADgMAAQgRAAgJgIg");
	this.shape_1.setTransform(98.85,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_2.setTransform(89.875,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_3.setTransform(81.025,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.easybutton, new cjs.Rectangle(0.2,0,194.8,32), null);


(lib.creditsbutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIASgCQACAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgEgBIgOgFQgQgDgGgFQgJgHABgLQAAgIADgFQAEgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgHgDgEQgFgDgHAAQgIABgEADQgDACAAADQAAAEADACQADADANADQANADAHAEQAHAEADAEQAEAHAAAJQAAAHgFAIQgEAGgIAEQgJADgLAAQgRAAgJgIg");
	this.shape.setTransform(118.35,16.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_1.setTransform(110.125,16.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_2.setTransform(104.375,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AgmAvIAAhcIAiAAQALAAAGABQAIACAGAHQAGAGADAJQADAJAAAMQAAALgDAIQgEALgGAGQgFAFgIADQgGACgJAAgAgUAfIAPAAIAKgBQAFgBADgDQACgCACgHQACgGABgLQgBgKgCgFQgCgHgDgCQgDgEgFgBIgPgBIgJAAg");
	this.shape_3.setTransform(98,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_4.setTransform(88.975,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_5.setTransform(80.225,16.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AgbAkQgMgNAAgWQAAgWAMgNQAMgNASAAQARAAALAKQAGAGAEALIgTAFQgCgIgFgEQgFgEgIAAQgJAAgGAHQgHAIAAAQQAAARAHAHQAFAIAKAAQAHAAAGgEQAFgGADgKIASAGQgFAQgJAGQgKAIgPAAQgRAAgMgMg");
	this.shape_6.setTransform(70.35,16.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.creditsbutton, new cjs.Rectangle(0.2,0,194.8,32), null);


(lib.bultadumi = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_160 = function() {
		this.stop();
		this.parent.removeChild(this);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(160).call(this.frame_160).wait(1));

	// Layer_1
	this.instance = new lib.smokesymbol3("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(0,0,0.1406,0.1406);
	this.instance.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({alpha:1},0).to({scaleX:0.2737,scaleY:0.2737,x:0.45,alpha:0.9805},4).to({regX:0.5,scaleX:0.4376,scaleY:0.4376,x:4.8,alpha:0},29).to({_off:true},1).wait(126));

	// Layer_1
	this.instance_1 = new lib.smokesymbol2("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(0,0,0.1406,0.1406);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({_off:false},0).to({scaleX:0.2737,scaleY:0.2737,x:0.45,alpha:0.9805},4).to({regX:-0.3,scaleX:3.2656,scaleY:3.2656,x:16.65,alpha:0},155).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-87.1,-104.4,209.3,209);


(lib.audiobutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgIAeIAAg5IAwgjIAAB9gAgnAeIAAg5IAZAAIAAA5g");
	this.shape.setTransform(42.5,17.125);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#B00000").s().p("AgmAmQgQgQAAgWQAAgWAQgPIAAAAIAFgFIAAAAIACgBQAOgKARAAQAWAAARAQQAPAPAAAWQAAAWgPAQIgDADIgBABQgPAMgUAAQgWABgQgRgAgnAAQAAARAMALQAMAMAPgBQALAAAJgEIgxg8QgKALAAAOgAgSgiIAxA7QAIgKABgPQAAgQgMgLQgMgLgQAAQgJgBgJAFg");
	this.shape_1.setTransform(48.95,22.55);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},1).wait(1));

	// Layer 2
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AggAkQgMgNAAgWQAAgNAEgLQADgGAGgGQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAXgMANQgMAMgVAAQgUAAgMgMgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgQgHgHQgHgIgMAAQgLAAgHAIg");
	this.shape_2.setTransform(138.525,16.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AgIAvIAAhcIARAAIAABcg");
	this.shape_3.setTransform(131.675,16.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AgmAvIAAhcIAiAAQALAAAGABQAIACAGAHQAGAGADAJQADAJAAAMQAAALgDAIQgDALgHAGQgFAFgIADQgHACgJAAgAgUAfIAPAAIAKgBQAEgBADgDQAEgCACgHQACgGAAgLQAAgKgCgFQgCgHgEgCQgDgEgGgBIgOgBIgJAAg");
	this.shape_4.setTransform(125.3,16.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQABAMAAAEQACAFAEAEQAFADAGAAQAJAAADgDQAFgDAAgFIABgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgMAAgHgDg");
	this.shape_5.setTransform(115.7,16.475);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AAaAvIgIgVIgkAAIgIAVIgUAAIAkhcIATAAIAmBcgAgMAKIAYAAIgMgig");
	this.shape_6.setTransform(106.325,16.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_7.setTransform(94.375,16.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgPIBJAAIAAAPIgcAAIAABNg");
	this.shape_8.setTransform(85.925,16.4);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQAAAMABAEQABAFAFAEQAFADAGAAQAIAAAFgDQADgDABgFIABgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgNAAgGgDg");
	this.shape_9.setTransform(77.2,16.475);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#D9D9D9").s().p("AAbAvIAAhJIgSBJIgRAAIgThJIAABJIgRAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_10.setTransform(67.1,16.4);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#D9D9D9").s().p("AgmAvIAAhcIAiAAQALAAAGABQAIACAGAHQAGAGADAJQADAJAAAMQAAALgDAIQgDALgHAGQgFAFgIADQgHACgJAAgAgTAfIANAAIALgBQAEgBADgDQADgCADgHQABgGAAgLQAAgKgBgFQgCgHgEgCQgDgEgGgBIgOgBIgIAAg");
	this.shape_11.setTransform(140.7,16.4);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#D9D9D9").s().p("AAbAvIAAhJIgSBJIgRAAIgShJIAABJIgSAAIAAhcIAcAAIAQA+IARg+IAcAAIAABcg");
	this.shape_12.setTransform(99.85,16.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQAAAMABAEQABAFAFAEQAFADAGAAQAIAAAFgDQADgDABgFIABgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgNAAgGgDg");
	this.shape_13.setTransform(89.7,16.475);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIASgCQACAKAFAEQAFAFAIgBQAJAAAEgDQAFgEAAgFQAAgEgCgCQgCgDgEgBIgPgFQgPgDgGgFQgIgHAAgLQAAgIADgFQAFgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgHgDgEQgEgDgIAAQgIABgFADQgCACAAADQAAAEACACQAEADAMADQAOADAHAEQAHAEADAEQAEAHAAAJQAAAHgFAIQgEAGgIAEQgIADgMAAQgRAAgJgIg");
	this.shape_14.setTransform(80.65,16.4);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#D9D9D9").s().p("AgiAvIAAhcIBEAAIAAAPIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_15.setTransform(72.225,16.4);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#D9D9D9").s().p("AATAvIgNgUIgJgPQgDgCgDgBIgJgBIgEAAIAAAnIgTAAIAAhcIAoAAQAOAAAHACQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgBACgEQACgCAAgEQAAgFgCgDQgDgDgFgBIgMAAIgPAAg");
	this.shape_16.setTransform(63.475,16.4);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#D9D9D9").s().p("AgIAeIAAg5IAwgjIAAB9gAgnAeIAAg5IAZAAIAAA5g");
	this.shape_17.setTransform(42.5,17.125);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_10},{t:this.shape_9,p:{x:77.2}},{t:this.shape_8},{t:this.shape_7,p:{x:94.375}},{t:this.shape_6,p:{x:106.325}},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3,p:{x:131.675}},{t:this.shape_2,p:{x:138.525}}]}).to({state:[{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_7,p:{x:109.775}},{t:this.shape_6,p:{x:121.725}},{t:this.shape_9,p:{x:131.1}},{t:this.shape_11},{t:this.shape_3,p:{x:147.075}},{t:this.shape_2,p:{x:153.925}}]},1).wait(1));

	// Layer 1
	this.instance = new lib.buttonbackground();
	this.instance.parent = this;
	this.instance.setTransform(97.55,16,1,1,0,0,0,97.4,16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.2,0,194.8,32);


(lib.webgamespreloader = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		loadscreen = this;
		var rotateto = 0;
		dumibultai = true;
		updatepreloader = setInterval(playpreloader, 30);
		
		function playpreloader() {
		
			if(dumibultai) {
				rotateto += 30;
		var dumi = new lib.bultadumi();	
		dumi.x = loadscreen.bulta.x;	
		dumi.y = loadscreen.bulta.y;
		dumi.rotation = rotateto;		
		loadscreen.fons.addChild(dumi);
			}
		}
		
		loadscreen.addEventListener("click", merePreloader);
		
		function merePreloader()
		{
			var gotourl;
			if(mobile) {
			gotourl = "https://m.1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=preloader&utm_source=" + ref;	
			} else {
			gotourl = "https://1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=preloader&utm_source=" + ref;
			}
			window.open(gotourl, "_blank");
		}
	}
	this.frame_162 = function() {
		dumibultai = false;
	}
	this.frame_494 = function() {
		this.stop();
		clearInterval(updatepreloader);
		loadscreen.removeAllEventListeners();
		exportRoot.gotoAndStop(1);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(162).call(this.frame_162).wait(332).call(this.frame_494).wait(1));

	// actions
	this.instance = new lib.fons();
	this.instance.parent = this;
	this.instance.setTransform(320,180,1,1,0,0,0,320,180);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(446).to({_off:false},0).to({alpha:1},22).wait(27));

	// 1000
	this.lgames = new lib.lgames();
	this.lgames.name = "lgames";
	this.lgames.parent = this;
	this.lgames.setTransform(332.5,189.55);
	this.lgames._off = true;

	this.timeline.addTween(cjs.Tween.get(this.lgames).wait(162).to({_off:false},0).wait(333));

	// bulta
	this.bulta = new lib.bultapreloader();
	this.bulta.name = "bulta";
	this.bulta.parent = this;
	this.bulta.setTransform(652.55,305.2,0.3695,0.3701,0,-118.9268,-119.0714);

	this.timeline.addTween(cjs.Tween.get(this.bulta).wait(14).to({scaleX:0.1015,scaleY:0.1012,skewX:-119.1595,skewY:-118.8221,x:652.35,y:304.9},0).to({regX:-0.1,regY:0.1,scaleX:1.3496,scaleY:1.3471,rotation:-176.7019,skewX:0,skewY:0,guide:{path:[652.4,304.9,633.5,270.8,611.7,240.8,587,207,560.2,173.3,486.9,81.6,456.2,64.2,415.5,41.1,376.6,29,338.6,17.3,299.5,14.8], orient:'auto'}},67).wait(1).to({regX:0,regY:0,scaleX:1.3453,scaleY:1.3429,rotation:-177.9683,x:291.8785,y:14.3496},0).wait(1).to({scaleX:1.341,scaleY:1.3386,rotation:-179.2289,x:284.5327,y:14.1293},0).wait(1).to({scaleX:1.3367,scaleY:1.3343,rotation:-180.4072,x:277.1932,y:14.0685},0).wait(1).to({scaleX:1.3323,scaleY:1.33,rotation:-180.9144,x:270.005,y:14.1074},0).wait(1).to({scaleX:1.3281,scaleY:1.3257,rotation:-181.3721,x:263.7031,y:14.194},0).wait(1).to({scaleX:1.3237,scaleY:1.3214,rotation:-181.8525,x:257.2582,y:14.3348},0).wait(1).to({scaleX:1.3194,scaleY:1.3172,rotation:-182.3463,x:250.8075,y:14.5299},0).wait(1).to({scaleX:1.3151,scaleY:1.3129,rotation:-182.8555,x:244.3331,y:14.7819},0).wait(1).to({scaleX:1.3108,scaleY:1.3086,rotation:-183.3808,x:237.8371,y:15.0928},0).wait(1).to({scaleX:1.3065,scaleY:1.3043,rotation:-183.9229,x:231.3189,y:15.4651},0).wait(1).to({scaleX:1.3022,scaleY:1.3,rotation:-184.4827,x:224.7785,y:15.9012},0).wait(1).to({scaleX:1.2979,scaleY:1.2958,rotation:-185.0609,x:218.216,y:16.4036},0).wait(1).to({scaleX:1.2936,scaleY:1.2915,rotation:-185.6584,x:211.6312,y:16.9751},0).wait(1).to({scaleX:1.2892,scaleY:1.2872,rotation:-186.2764,x:205.0244,y:17.6186},0).wait(1).to({scaleX:1.2849,scaleY:1.2829,rotation:-186.9156,x:198.3956,y:18.3371},0).wait(1).to({scaleX:1.2806,scaleY:1.2787,rotation:-187.5773,x:191.745,y:19.1338},0).wait(1).to({scaleX:1.2763,scaleY:1.2744,rotation:-188.2626,x:185.0731,y:20.0121},0).wait(1).to({scaleX:1.272,scaleY:1.2701,rotation:-188.9727,x:178.3788,y:20.9758},0).wait(1).to({scaleX:1.2677,scaleY:1.2658,rotation:-189.7088,x:171.6636,y:22.0285},0).wait(1).to({scaleX:1.2634,scaleY:1.2615,rotation:-190.4721,x:164.9293,y:23.1741},0).wait(1).to({scaleX:1.2591,scaleY:1.2573,rotation:-191.264,x:158.1767,y:24.4166},0).wait(1).to({scaleX:1.2548,scaleY:1.253,rotation:-192.0859,x:151.407,y:25.7605},0).wait(1).to({scaleX:1.2505,scaleY:1.2487,rotation:-192.9391,x:144.6217,y:27.2103},0).wait(1).to({scaleX:1.2462,scaleY:1.2444,rotation:-193.8253,x:137.8222,y:28.7707},0).wait(1).to({scaleX:1.2418,scaleY:1.2401,rotation:-194.7462,x:131.0087,y:30.4472},0).wait(1).to({scaleX:1.2375,scaleY:1.2359,rotation:-195.7031,x:124.1857,y:32.2445},0).wait(1).to({scaleX:1.2332,scaleY:1.2316,rotation:-196.6977,x:117.3552,y:34.168},0).wait(1).to({scaleX:1.2289,scaleY:1.2273,rotation:-197.7315,x:110.5203,y:36.2234},0).wait(1).to({scaleX:1.2246,scaleY:1.223,rotation:-198.8061,x:103.6843,y:38.4164},0).wait(1).to({scaleX:1.2203,scaleY:1.2188,rotation:-199.923,x:96.8516,y:40.7527},0).wait(1).to({scaleX:1.216,scaleY:1.2145,rotation:-201.12,x:90.0281,y:43.239},0).wait(1).to({scaleX:1.2117,scaleY:1.2102,rotation:-202.2384,x:84.0624,y:45.5502},0).wait(1).to({scaleX:1.2074,scaleY:1.206,rotation:-203.1677,x:79.5748,y:47.3816},0).wait(1).to({scaleX:1.2031,scaleY:1.2017,rotation:-204.3045,x:74.5803,y:49.5251},0).wait(1).to({scaleX:1.1988,scaleY:1.1974,rotation:-205.5205,x:69.7709,y:51.707},0).wait(1).to({scaleX:1.1945,scaleY:1.1931,rotation:-206.8919,x:64.9174,y:54.042},0).wait(1).to({scaleX:1.1902,scaleY:1.1888,rotation:-208.4267,x:60.1001,y:56.5115},0).wait(1).to({scaleX:1.1859,scaleY:1.1846,rotation:-210.1671,x:55.3019,y:59.1468},0).wait(1).to({scaleX:1.1816,scaleY:1.1803,rotation:-212.1567,x:50.5389,y:61.968},0).wait(1).to({scaleX:1.1772,scaleY:1.176,rotation:-214.4608,x:45.8135,y:65.0115},0).wait(1).to({scaleX:1.1729,scaleY:1.1717,rotation:-217.1553,x:41.1544,y:68.308},0).wait(1).to({scaleX:1.1686,scaleY:1.1674,rotation:-220.3469,x:36.5895,y:71.9033},0).wait(1).to({scaleX:1.1643,scaleY:1.1632,rotation:-224.1782,x:32.1603,y:75.8543},0).wait(1).to({scaleX:1.16,scaleY:1.1589,rotation:-228.8398,x:27.9275,y:80.2345},0).wait(1).to({scaleX:1.1557,scaleY:1.1546,rotation:-234.569,x:23.9881,y:85.1305},0).wait(1).to({scaleX:1.1514,scaleY:1.1503,rotation:-241.6073,x:20.497,y:90.626},0).wait(1).to({scaleX:1.1471,scaleY:1.146,rotation:-250.1015,x:17.6722,y:96.7865},0).wait(1).to({scaleX:1.1428,scaleY:1.1418,rotation:-259.8604,x:15.7911,y:103.5927},0).wait(1).to({scaleX:1.1385,scaleY:1.1375,rotation:-270.1244,x:15.1088,y:110.856},0).wait(1).to({scaleX:1.1342,scaleY:1.1332,rotation:-278.4639,x:15.599,y:118.1059},0).wait(1).to({scaleX:1.1299,scaleY:1.1289,rotation:-287.1976,x:17.208,y:125.4251},0).wait(1).to({scaleX:1.1255,scaleY:1.1246,rotation:-295.8969,x:20.0137,y:132.6771},0).wait(1).to({scaleX:1.1212,scaleY:1.1203,rotation:-303.8523,x:23.9047,y:139.558},0).wait(1).to({scaleX:1.1169,scaleY:1.1161,rotation:-310.6415,x:28.6118,y:145.8421},0).wait(1).to({scaleX:1.1126,scaleY:1.1118,rotation:-316.172,x:33.8309,y:151.4448},0).wait(1).to({scaleX:1.1083,scaleY:1.1075,rotation:-321.2213,x:39.3413,y:156.3771},0).wait(1).to({scaleX:1.1039,scaleY:1.1032,rotation:-326.4692,x:45.9222,y:161.2792},0).wait(1).to({scaleX:1.0996,scaleY:1.0989,rotation:-331.3177,x:52.9794,y:165.6284},0).wait(1).to({scaleX:1.0953,scaleY:1.0946,rotation:-335.6502,x:60.3004,y:169.3699},0).wait(1).to({scaleX:1.091,scaleY:1.0903,rotation:-339.463,x:67.7505,y:172.5347},0).wait(1).to({scaleX:1.0867,scaleY:1.0861,rotation:-342.7949,x:75.2312,y:175.1782},0).wait(1).to({scaleX:1.0824,scaleY:1.0818,rotation:-345.7054,x:82.6827,y:177.3655},0).wait(1).to({scaleX:1.078,scaleY:1.0775,rotation:-348.2557,x:90.0696,y:179.1588},0).wait(1).to({scaleX:1.0737,scaleY:1.0732,rotation:-349.7652,x:97.3308,y:180.641},0).wait(1).to({scaleX:1.0694,scaleY:1.0689,rotation:-350.9117,x:104.9318,y:182.0289},0).wait(1).to({scaleX:1.0651,scaleY:1.0646,rotation:-352.0217,x:112.6617,y:183.2846},0).wait(1).to({scaleX:1.0607,scaleY:1.0603,rotation:-353.0748,x:120.3578,y:184.387},0).wait(1).to({scaleX:1.0564,scaleY:1.056,rotation:-354.0734,x:128.008,y:185.3445},0).wait(1).to({scaleX:1.0521,scaleY:1.0517,rotation:-355.0212,x:135.6088,y:186.1658},0).wait(1).to({scaleX:1.0478,scaleY:1.0474,rotation:-355.9218,x:143.1614,y:186.8598},0).wait(1).to({scaleX:1.0434,scaleY:1.0431,rotation:-356.7785,x:150.6651,y:187.4343},0).wait(1).to({scaleX:1.0391,scaleY:1.0388,rotation:-357.5943,x:158.1203,y:187.8967},0).wait(1).to({scaleX:1.0348,scaleY:1.0345,rotation:-358.3616,x:165.6606,y:188.2583},0).wait(1).to({scaleX:1.0304,scaleY:1.0302,rotation:-358.9189,x:176.0137,y:188.6359},0).wait(1).to({scaleX:1.0261,scaleY:1.0259,rotation:-359.3049,x:188.7097,y:188.999},0).wait(1).to({scaleX:1.0218,scaleY:1.0216,rotation:-359.5301,x:200.0456,y:189.2663},0).wait(1).to({scaleX:1.0174,scaleY:1.0173,rotation:-359.675,x:209.7236,y:189.4649},0).wait(1).to({scaleX:1.0131,scaleY:1.013,rotation:-359.7815,x:218.4529,y:189.6261},0).wait(1).to({scaleX:1.0087,scaleY:1.0087,rotation:-359.8668,x:226.6676,y:189.765},0).wait(1).to({scaleX:1.0044,scaleY:1.0043,rotation:-359.9383,x:234.5531,y:189.8884},0).wait(1).to({scaleX:1,scaleY:1,rotation:-360,x:242.05,y:190.05},0).wait(333));

	// Layer 7
	this.wgames = new lib._1000WebGames_1();
	this.wgames.name = "wgames";
	this.wgames.parent = this;
	this.wgames.setTransform(320,137,0.1587,0.1587);
	this.wgames.alpha = 0;
	this.wgames._off = true;

	this.timeline.addTween(cjs.Tween.get(this.wgames).wait(34).to({_off:false},0).to({regY:-0.7,scaleX:0.9276,scaleY:0.927,x:318.75,y:134.65,alpha:1},116).wait(345));

	// objekti
	this.instance_1 = new lib.bultadumi();
	this.instance_1.parent = this;
	this.instance_1.setTransform(308,189,2,2);

	this.instance_2 = new lib.explosion_1();
	this.instance_2.parent = this;
	this.instance_2.setTransform(268,199.6,1,1,0,0,0,0,15.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_2},{t:this.instance_1}]},161).to({state:[{t:this.instance_2},{t:this.instance_1}]},333).wait(1));

	// fons
	this.fons = new lib.fons();
	this.fons.name = "fons";
	this.fons.parent = this;
	this.fons.setTransform(320,180,1,1,0,0,0,320,180);

	this.timeline.addTween(cjs.Tween.get(this.fons).wait(495));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-2.2,658.1,362.2);


(lib.tryagain2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	this.enemylefttxt = new cjs.Text("Enemies left: 80", "italic 12px 'Arial'", "#D9D9D9");
	this.enemylefttxt.name = "enemylefttxt";
	this.enemylefttxt.lineHeight = 15;
	this.enemylefttxt.lineWidth = 146;
	this.enemylefttxt.parent = this;
	this.enemylefttxt.setTransform(-16.45,60.55);

	this.enemykilltxt = new cjs.Text("Enemies killed: 80", "italic 12px 'Arial'", "#D9D9D9");
	this.enemykilltxt.name = "enemykilltxt";
	this.enemykilltxt.lineHeight = 15;
	this.enemykilltxt.lineWidth = 146;
	this.enemykilltxt.parent = this;
	this.enemykilltxt.setTransform(-16.45,43.55);

	this.stars = new lib.stars();
	this.stars.name = "stars";
	this.stars.parent = this;
	this.stars.setTransform(276.85,61.65,1.1429,1.1429,0,0,0,35.1,17.6);

	this.moreButton = new lib.morefinishbutton();
	this.moreButton.name = "moreButton";
	this.moreButton.parent = this;
	this.moreButton.setTransform(168.45,159.5,1,1,0,0,0,97.5,16);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FF3333").s().p("AgIAvIAAgSIARAAIAAASgAgEAXIgFguIAAgXIATAAIAAAXIgFAug");
	this.shape.setTransform(95.675,16.55);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF3333").s().p("AgmAvIAAhdIAiAAQALABAGABQAIACAGAHQAGAGADAJQADAJAAAMQAAALgDAJQgEAKgGAGQgFAFgIACQgGACgKABgAgUAfIAPAAIAKgBQAFgBADgDQACgDACgGQACgGABgLQgBgKgCgFQgCgHgDgCQgDgEgFgBQgEgBgLAAIgJAAg");
	this.shape_1.setTransform(85.4,16.55);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FF3333").s().p("AgiAvIAAhdIBEAAIAAAQIgyAAIAAAVIAuAAIAAAPIguAAIAAAZIAzAAIAAAQg");
	this.shape_2.setTransform(76.375,16.55);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FF3333").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_3.setTransform(68.225,16.575);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FF3333").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_4.setTransform(62.175,16.55);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FF3333").s().p("AAaAvIgIgWIgkAAIgIAWIgUAAIAkhdIATAAIAmBdgAgMAJIAYAAIgMghg");
	this.shape_5.setTransform(55.625,16.55);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FF3333").s().p("AgfAvIAAhdIA/AAIAAAQIgsAAIAAAWIAlAAIAAAPIglAAIAAAog");
	this.shape_6.setTransform(47.15,16.55);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FF3333").s().p("AASAvIglg8IAAA8IgRAAIAAhdIASAAIAmA9IAAg9IARAAIAABdg");
	this.shape_7.setTransform(34.65,16.55);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FF3333").s().p("AggAjQgMgMAAgXQAAgMAEgKQADgIAGgFQAFgGAHgDQAJgDAKAAQAUAAANAMQAMANAAAWQAAAXgMAMQgMANgVAAQgUAAgMgNgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgPgHgIQgHgIgMAAQgLAAgHAIg");
	this.shape_8.setTransform(24.975,16.55);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FF3333").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_9.setTransform(18.125,16.55);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#FF3333").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAEAIAAQAJAAAEgDQAFgFAAgEQAAgEgCgCQgCgDgEgBIgPgEQgPgEgGgFQgIgHAAgLQAAgHADgHQAFgGAHgDQAIgDAKAAQARAAAJAIQAJAHAAANIgSABQgCgIgDgDQgFgCgHAAQgIgBgFAEQgCACAAAEQAAADACACQAEADAMADQAOADAHAEQAGAEAEAFQAEAFAAAKQAAAIgFAGQgEAIgIADQgIADgMAAQgRAAgJgIg");
	this.shape_10.setTransform(11.9,16.55);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FF3333").s().p("AgZAoQgKgIgCgQIASgCQACAKAFAEQAFAEAIAAQAJAAAEgDQAFgFAAgEQAAgEgCgCQgCgDgEgBIgPgEQgPgEgGgFQgIgHAAgLQAAgHADgHQAFgGAHgDQAIgDAKAAQARAAAJAIQAJAHAAANIgTABQgBgIgDgDQgEgCgIAAQgIgBgFAEQgCACAAAEQAAADACACQAEADAMADQAOADAHAEQAGAEAEAFQAEAFAAAKQAAAIgFAGQgEAIgIADQgIADgMAAQgRAAgJgIg");
	this.shape_11.setTransform(3.25,16.55);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#FF3333").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_12.setTransform(-2.775,16.55);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FF3333").s().p("AAcAvIAAhJIgTBJIgRAAIgShJIAABJIgSAAIAAhdIAcAAIAQA/IARg/IAcAAIAABdg");
	this.shape_13.setTransform(-10.05,16.55);

	this.again = new lib.tryagainbutton();
	this.again.name = "again";
	this.again.parent = this;
	this.again.setTransform(295.95,159.5,1,1,0,0,0,97.5,16);

	this.closeButton = new lib.closeoptions();
	this.closeButton.name = "closeButton";
	this.closeButton.parent = this;
	this.closeButton.setTransform(307.95,13.25,0.6667,0.6664,0,0,0,10.1,9.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.closeButton},{t:this.again},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.moreButton},{t:this.stars},{t:this.enemykilltxt},{t:this.enemylefttxt}]}).wait(1));

	// Layer 1
	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("#CCCCCC").ss(0.2,1,1).p("A72AAMA3tAAA");
	this.shape_14.setTransform(151.75,35.5);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f().s("#CCCCCC").ss(1,1,1,3,true).p("A72umMA3tAAAIAAFjIAAXqMg3tAAAIAA3qg");
	this.shape_15.setTransform(151.75,93.475);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#3B3B3B").s().p("A71L1IAA3pMA3sAAAIAAXpg");
	this.shape_16.setTransform(151.75,111.225);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#333333").s().p("A71CxIAAliMA3sAAAIAAFig");
	this.shape_17.setTransform(151.75,17.75);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14}]}).wait(1));

	// Layer 3
	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#262626").s().p("A7rOaIAA8zMA3YAAAIAAczg");
	this.shape_18.setTransform(155.8,98.25);

	this.timeline.addTween(cjs.Tween.get(this.shape_18).wait(1));

}).prototype = getMCSymbolPrototype(lib.tryagain2, new cjs.Rectangle(-27.5,-1,360.6,191.5), null);


(lib.tryagain = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_48 = function() {
		if (backgroundSound) backgroundSound.stop();
	}
	this.frame_69 = function() {
		backgroundSound = createjs.Sound.play("sakumamuzons",createjs.Sound.INTERRUPT_EARLY, 0, 0, -1);
	}
	this.frame_76 = function() {
		var tryscreen = this;
		tryscreen.stop();
		
		tryscreen.screen.closeButton.addEventListener("click", closeScreen);
		tryscreen.screen.again.addEventListener("click", closeScreen);
		tryscreen.screen.moreButton.addEventListener("click", moregbutton);
		
		tryscreen.screen.enemykilltxt.text = "Enemies killed: " + (totalEnemies - enemies);
		tryscreen.screen.enemylefttxt.text = "Enemies left: " + enemies;
		
		function closeScreen(event) {
			
			removeListeners();
			tryscreen.gotoAndPlay(77);
			
		}
		
		function moregbutton()
		{
		var gotourl;
			if(mobile) {
			gotourl = "https://m.1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=moregames_starplevel&utm_source=" + ref;	
			} else {
			gotourl = "https://1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=moregames_starplevel&utm_source=" + ref;
			}
			window.open(gotourl, "_blank");	
		}
		
		function removeListeners() {
			tryscreen.screen.closeButton.removeEventListener("click", closeScreen);
			tryscreen.screen.again.removeEventListener("click", closeScreen);
			tryscreen.screen.moreButton.removeEventListener("click", moregbutton);
		}
	}
	this.frame_167 = function() {
		this.stop();
		resetgame();
		againScreen = false;
		this.parent.removeChild(this);
		startGame();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(48).call(this.frame_48).wait(21).call(this.frame_69).wait(7).call(this.frame_76).wait(91).call(this.frame_167).wait(1));

	// Layer 1
	this.screen = new lib.tryagain2();
	this.screen.name = "screen";
	this.screen.parent = this;
	this.screen.setTransform(321,278.4,1,1,0,0,0,152,128.4);
	this.screen.alpha = 0;
	this.screen._off = true;

	this.instance = new lib.black();
	this.instance.parent = this;
	this.instance.setTransform(0,0,6.5979,4.8648);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.screen).wait(48).to({_off:false},0).wait(1).to({regX:153,regY:95,x:322,y:237.15,alpha:0.065},0).wait(1).to({y:229.4,alpha:0.1297},0).wait(1).to({y:221.75,alpha:0.1937},0).wait(1).to({y:214.15,alpha:0.2568},0).wait(1).to({y:206.75,alpha:0.3187},0).wait(1).to({y:199.45,alpha:0.3792},0).wait(1).to({y:192.4,alpha:0.4379},0).wait(1).to({y:185.6,alpha:0.4948},0).wait(1).to({y:179,alpha:0.5497},0).wait(1).to({y:172.7,alpha:0.6023},0).wait(1).to({y:166.65,alpha:0.6525},0).wait(1).to({y:160.95,alpha:0.7003},0).wait(1).to({y:155.55,alpha:0.7453},0).wait(1).to({y:150.45,alpha:0.7877},0).wait(1).to({y:145.7,alpha:0.8272},0).wait(1).to({y:141.35,alpha:0.8637},0).wait(1).to({y:137.3,alpha:0.8972},0).wait(1).to({y:133.65,alpha:0.9277},0).wait(1).to({y:130.4,alpha:0.955},0).wait(1).to({y:127.5,alpha:0.9791},0).wait(1).to({regX:152,regY:128.4,x:321,y:158.4,alpha:1},0).to({y:172.4},7).wait(1).to({regX:153,regY:95,x:322,y:136.25},0).wait(1).to({y:133.1},0).wait(1).to({y:130},0).wait(1).to({y:127.4},0).wait(1).to({y:125.65},0).wait(1).to({regX:152,regY:128.4,x:321,y:158.4},0).wait(1).to({regX:153,regY:95,x:322,y:125.15,alpha:0.9985},0).wait(1).to({y:125.7,alpha:0.994},0).wait(1).to({y:126.6,alpha:0.9865},0).wait(1).to({y:127.85,alpha:0.976},0).wait(1).to({y:129.45,alpha:0.9626},0).wait(1).to({y:131.4,alpha:0.9463},0).wait(1).to({y:133.75,alpha:0.9271},0).wait(1).to({y:136.4,alpha:0.9049},0).wait(1).to({y:139.4,alpha:0.8799},0).wait(1).to({y:142.7,alpha:0.8521},0).wait(1).to({y:146.4,alpha:0.8215},0).wait(1).to({y:150.4,alpha:0.7881},0).wait(1).to({y:154.75,alpha:0.752},0).wait(1).to({y:159.4,alpha:0.7132},0).wait(1).to({y:164.35,alpha:0.6718},0).wait(1).to({y:169.65,alpha:0.6278},0).wait(1).to({y:175.2,alpha:0.5813},0).wait(1).to({y:181.1,alpha:0.5323},0).wait(1).to({y:187.25,alpha:0.481},0).wait(1).to({y:193.7,alpha:0.4275},0).wait(1).to({y:200.35,alpha:0.3717},0).wait(1).to({y:207.3,alpha:0.3139},0).wait(1).to({y:214.45,alpha:0.2542},0).wait(1).to({y:221.85,alpha:0.1928},0).wait(1).to({y:229.4,alpha:0.1298},0).wait(1).to({y:237.1,alpha:0.0654},0).wait(1).to({regX:152,regY:128.4,x:321,y:278.4,alpha:0},0).to({_off:true},20).wait(39));
	this.timeline.addTween(cjs.Tween.get(this.instance).wait(129).to({_off:false},0).to({alpha:1},16).wait(23));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-13.2,-9.7,5166.2,2160);


(lib.settings1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var po = this;
		po.stop();
		po.poga.addEventListener("click", settingsPoga);
		if(isPlaying) {	
		po.poga.gotoAndStop(1);
		} else {
		po.poga.gotoAndStop(0);	
		}
		function settingsPoga(event) {
			pause = true;
			po.poga.removeEventListener("click", settingsPoga);
			po.gotoAndStop(1);
			if(againScreen) tryAgainScreen.visible = false;
		}
		function removeL() {
			
			po.poga.removeEventListener("click", settingsPoga);
		}
	}
	this.frame_1 = function() {
		var set = this;
		set.stop();
		doc = window.document;
		if(againScreen) tryAgainScreen.visible = false;
		if(!mobile) anim_container.style.cursor = "default";
		
		setTimeout(stopit,0); // savadak muviklipi spele atrak neka lasa javascript
		
		if(isPlaying) {
		set.restartl.visible = true;	
		} else { 
			set.restartl.visible = false;
		}
		
		function stopit(){
		if(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) {
		set.fulls.gotoAndStop(1);
		} else {
			set.fulls.gotoAndStop(0);
			}
				if (skana) {
				set.audio.gotoAndStop(0);
			} else {
				set.audio.gotoAndStop(1);
			}
		}
		
		set.closeButton.addEventListener("click", closeSettings);
		set.fulls.addEventListener("click", fullScreen);
		set.mainm.addEventListener("click", mainMenu);
		set.audio.addEventListener("click", setAudio);
		set.instruct.addEventListener("click", instructions);
		set.credits.addEventListener("click", creditScreen);
		set.restartl.addEventListener("click", restartLevel);
		
		function closeSettings(event) {
			pause = false;
			removeListeners();
			set.gotoAndStop(0);
			if(againScreen) {tryAgainScreen.visible = true;pause = true;}
			if(isPlaying) {
				if(mobile) {if(!againScreen)resumeMobileGame();} else {if(!againScreen){anim_container.style.cursor = "none";}}
			}
		}
		
		function restartLevel(event) {
			removeListeners();
			set.gotoAndStop(0);
			if(isPlaying) {
				isPlaying = false;
				if(againScreen) {exportRoot.removeChild(tryAgainScreen);againScreen = false;}
				if(!mobile) anim_container.style.cursor = "none";
				resetgame();
				setTimeout(startGame,10);
			}	
		}
		
		function mainMenu(event) {
			removeListeners();
			set.gotoAndStop(0);
			if(isPlaying) {
				isPlaying = false;
				if(againScreen) {exportRoot.removeChild(tryAgainScreen);againScreen = false;}
				resetgame();
			}	
			exportRoot.gotoAndStop("first");
			
		}
		
		function setAudio(event) {
		
			if (skana) {
				skana = false;
				set.audio.gotoAndStop(1);
				createjs.Sound.muted = true;
			} else {
				skana = true;
				set.audio.gotoAndStop(0);
				createjs.Sound.muted = false;
			}
			
		}
		
		function instructions(event) {
		
			removeListeners();
			set.gotoAndStop(2);
		}
		
		function creditScreen(event) {
		
			removeListeners();
			set.gotoAndStop(3);
		}
		
		function fullScreen(event) {
		var docEl = doc.documentElement;
		
		var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
		
		  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		    requestFullScreen.call(docEl);
			  set.fulls.gotoAndStop(1);
		  }
		  else {
		    cancelFullScreen.call(doc);
			  set.fulls.gotoAndStop(0);
		  }
		
		}
		
		function removeListeners() {
			set.closeButton.removeEventListener("click", closeSettings);
			set.fulls.removeEventListener("click", fullScreen);
			set.mainm.removeEventListener("click", mainMenu);
			set.audio.removeEventListener("click", setAudio);
			set.instruct.removeEventListener("click", instructions);
			set.credits.removeEventListener("click", creditScreen);
			set.restartl.removeEventListener("click", restartLevel);
		}
	}
	this.frame_2 = function() {
		var inf = this;
		inf.stop();
		
		inf.closeButton.addEventListener("click", closeInfo);
		
		function closeInfo(event) {
			inf.closeButton.removeEventListener("click", closeInfo);
			inf.gotoAndStop(1);
		}
	}
	this.frame_3 = function() {
		var cr = this;
		cr.stop();
		
		cr.closeButton.addEventListener("click", closeInfo);
		cr.incom.addEventListener("click", creditOut);
		cr.audionautix.addEventListener("click", creditOut2);
		
		function closeInfo(event) {
			cr.closeButton.removeEventListener("click", closeInfo);
			cr.incom.removeEventListener("click", creditOut);
			cr.audionautix.removeEventListener("click", creditOut2);
			cr.gotoAndStop(1);
		}
		
		function creditOut(event) {
			
			window.open("http://incompetech.com", "_blank");
		}
		function creditOut2(event) {
			
			window.open("https://audionautix.com", "_blank");
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(2));

	// Layer 2
	this.poga = new lib.openoptions();
	this.poga.name = "poga";
	this.poga.parent = this;
	this.poga.setTransform(616.6,54.6,1,1,0,0,0,18.6,18.6);

	this.timeline.addTween(cjs.Tween.get(this.poga).to({_off:true},1).wait(4));

	// Layer_4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AgTAcIAAg4IALAAIAAAvIAcAAIAAAJg");
	this.shape.setTransform(95.075,278.35);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#333333").s().p("AAMAdIgJgNIgFgIIgDgCIgGgBIgCAAIAAAYIgMAAIAAg5IAYAAQAJAAAEACQAEACACAEQADADAAAGQAAAGgEAEQgEADgHABIAGAFIAHAKIAHALgAgNgDIAIAAIAKgBIADgCQAAgBAAAAQABgBAAAAQAAgBAAgBQAAAAAAgBQAAAAAAgBQAAgBAAAAQAAgBgBAAQAAgBAAAAQgCgCgDgBIgHAAIgJAAg");
	this.shape_1.setTransform(95.225,259.925);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#333333").s().p("AgXAdIAAg5IAVAAQAGAAAEACQAFABADAEQAEAEACAFQACAGAAAHQAAAHgCAFQgCAGgEAEQgDADgFACIgKABgAgMATIAJAAIAGAAIAEgDQADgCABgDQABgEAAgHQAAgFgBgEQgBgEgDgCQgBgCgEAAIgIgBIgGAAg");
	this.shape_2.setTransform(127.45,235.925);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#333333").s().p("AgPAZQgGgGgBgJIALgBQABAFADADQADADAEAAQAGAAADgDQADgCAAgDQAAAAAAgBQAAAAgBgBQAAAAAAgBQAAAAgBgBIgEgCIgIgCQgJgDgEgCQgFgFAAgHQAAgEACgEQADgEAEgCQAFgBAGAAQAKAAAGAEQAFAEABAJIgMAAQgBgEgCgCQgDgCgEAAQgFAAgCACQgBAAAAABQgBAAAAAAQAAABAAAAQAAABAAABQAAAAAAAAQAAABAAAAQAAABABAAQAAABAAAAQADACAHACIANAEQAEACACACQACAFAAAFQAAAEgDAFQgCAEgFACQgFACgIAAQgKAAgFgEg");
	this.shape_3.setTransform(111.025,235.95);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#333333").s().p("AAQAdIgFgNIgWAAIgEANIgNAAIAXg5IALAAIAXA5gAgHAGIAOAAIgHgUg");
	this.shape_4.setTransform(94.925,235.925);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#333333").s().p("AAMAdIgMgqIgLAqIgMAAIgOg5IAMAAIAIAnIALgnIANAAIAKAnIAJgnIAMAAIgPA5g");
	this.shape_5.setTransform(110.6,219.925);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#333333").s().p("AgWBXIASAAIAAgrIAJAAIAAArIATAAIgYAhgAClBXIgsAAIAAgKIAsAAIAAgSIAhAWIghAZgAjFBRIAhgWIAAASIArAAIAAAKIgrAAIAAATgAgEgrIAAgrIgSAAIAWghIAYAhIgTAAIAAArg");
	this.shape_6.setTransform(181.8,227.375);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},2).to({state:[]},1).wait(2));

	// pogas
	this.restartl = new lib.restartbutton();
	this.restartl.name = "restartl";
	this.restartl.parent = this;
	this.restartl.setTransform(321.5,304,1,1,0,0,0,97.5,16);

	this.credits = new lib.creditsbutton();
	this.credits.name = "credits";
	this.credits.parent = this;
	this.credits.setTransform(321.5,263,1,1,0,0,0,97.5,16);

	this.instruct = new lib.instructionsbutton();
	this.instruct.name = "instruct";
	this.instruct.parent = this;
	this.instruct.setTransform(321.5,222,1,1,0,0,0,97.5,16);

	this.audio = new lib.audiobutton();
	this.audio.name = "audio";
	this.audio.parent = this;
	this.audio.setTransform(321.5,181,1,1,0,0,0,97.5,16);

	this.mainm = new lib.mainmenubutton();
	this.mainm.name = "mainm";
	this.mainm.parent = this;
	this.mainm.setTransform(321.5,140,1,1,0,0,0,97.5,16);

	this.fulls = new lib.fullscreenButton();
	this.fulls.name = "fulls";
	this.fulls.parent = this;
	this.fulls.setTransform(321.5,99,1,1,0,0,0,97.5,16);

	this.closeButton = new lib.closeoptions();
	this.closeButton.name = "closeButton";
	this.closeButton.parent = this;
	this.closeButton.setTransform(415.35,49.3,0.6667,0.6664,0,0,0,10.1,9.8);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AgaAoQgJgIgCgQIATgCQABAKAFAEQAFAEAIAAQAJAAAFgDQAEgFAAgEQAAgEgCgCQgCgDgFgBIgNgFQgQgDgGgFQgJgHAAgLQAAgIAFgFQAEgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgSABQgCgIgEgDQgDgCgIAAQgIAAgEADQgEACAAAEQAAADAEACQADADAMADQAOADAHAEQAHAEADAEQAEAGAAAKQAAAHgEAHQgFAIgIADQgJADgMAAQgQAAgKgIg");
	this.shape_7.setTransform(266.9,53.1);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#D9D9D9").s().p("AASAvIgkg8IAAA8IgSAAIAAhdIASAAIAlA9IAAg9IASAAIAABdg");
	this.shape_8.setTransform(257.9,53.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#D9D9D9").s().p("AggAjQgMgMAAgWQAAgNAEgKQADgIAGgFQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAWgMANQgMANgVAAQgUAAgMgNgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgPgHgIQgHgIgMAAQgLAAgHAIg");
	this.shape_9.setTransform(248.225,53.1);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#D9D9D9").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_10.setTransform(241.375,53.1);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgQIBJAAIAAAQIgcAAIAABNg");
	this.shape_11.setTransform(235.575,53.1);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#D9D9D9").s().p("AgiAvIAAhdIAdAAQARAAAFACQAIACAFAHQAFAHABALQAAAJgEAFQgDAGgEACQgFAEgFABQgHABgMABIgMAAIAAAjgAgQgEIALAAQAJAAAFgBQADgBACgEQACgDABgDQgBgGgDgDQgDgDgEgBIgMgBIgKAAg");
	this.shape_12.setTransform(227.45,53.1);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#D9D9D9").s().p("AggAjQgMgMAAgWQAAgNAEgKQADgIAGgFQAFgFAHgDQAJgEAKAAQAUAAANANQAMANAAAVQAAAWgMANQgMANgVAAQgUAAgMgNgAgSgXQgHAIAAAPQAAAPAIAJQAHAIAKAAQALAAAIgIQAHgIAAgQQAAgPgHgIQgHgIgMAAQgLAAgHAIg");
	this.shape_13.setTransform(217.925,53.1);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#F1E8DE").s().p("AgFAFIACgJIAJAAIgDAJg");
	this.shape_14.setTransform(540.5,279.45);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#F1E8DE").s().p("AgSAbIAKgzIAIAAIgCAKQADgGAEgDQAEgCAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_15.setTransform(538.575,277.3);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAGQAFAFAAALIAAAGIgmAAIAAADQAAAIAEADQADAEAFAAQADAAAFgDQAEgDACgGIAJABQgCAHgHAGQgGAFgIAAQgGAAgFgCgAgGgPQgEADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgFAEg");
	this.shape_16.setTransform(533.65,277.35);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_17.setTransform(529.825,276.475);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#F1E8DE").s().p("AgQAWQgGgGAAgJQAAgIAEgJQADgIAGgDQAHgFAHAAQAIAAAFAFQAFAEAAAIIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAFAAAHQAAAGADAEQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgFg");
	this.shape_18.setTransform(525.775,277.35);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#F1E8DE").s().p("AgSAXQgFgFAAgGQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAAEgCIABgFQgBgDgCgDQgDgCgGAAQgEAAgEACQgDADgCAEIgJAAQACgIAHgEQAFgEAJAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgHIgJAGIgIACQgIAAgDgEgAAJABIgHAAIgKADQgDABgBACQgDACAAADQAAADAEADQACACAEAAQAFAAADgCQAEgDACgEQACgDACgIIgEABg");
	this.shape_19.setTransform(520.25,277.35);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#F1E8DE").s().p("AgSAbIAKgzIAIAAIgCAKQADgGAEgDQAEgCAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_20.setTransform(516.325,277.3);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAAEgCIABgFQgBgDgCgDQgDgCgGAAQgEAAgEACQgDADgCAEIgJAAQADgIAFgEQAGgEAJAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgHIgJAGIgIACQgIAAgEgEgAAJABIgHAAIgKADQgDABgBACQgCACgBADQABADADADQACACAFAAQAEAAADgCQAEgDACgEQACgDACgIIgEABg");
	this.shape_21.setTransform(511.35,277.35);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_22.setTransform(505.775,276.375);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#F1E8DE").s().p("AgQAWQgGgGAAgJQAAgIAEgJQADgIAGgDQAHgFAHAAQAIAAAFAFQAFAEAAAIIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAFAAAHQAAAGADAEQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgFg");
	this.shape_23.setTransform(500.775,277.35);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAGQAFAFAAALIgBAGIglAAIAAADQAAAIADADQAEAEAEAAQAEAAAEgDQAFgDACgGIAJABQgCAHgHAGQgGAFgJAAQgFAAgFgCgAgFgPQgFADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgEAEg");
	this.shape_24.setTransform(492.5,277.35);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_25.setTransform(486.875,276.375);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_26.setTransform(483.125,276.475);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#F1E8DE").s().p("AAIAbIAHggIABgIQAAAAAAgBQgBAAAAgBQAAAAAAgBQgBAAAAAAQgCgDgDAAQgHABgEAFQgGAEgCAMIgFAYIgJAAIALgzIAIAAIgCAJQAFgFAEgDQAEgCAFAAQAGgBAEAEQAEADAAAGIgCAJIgGAfg");
	this.shape_27.setTransform(475.725,277.3);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#F1E8DE").s().p("AgSAbIAKgzIAIAAIgCAKQADgGAEgDQAEgCAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_28.setTransform(471.825,277.3);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#F1E8DE").s().p("AgUAXQgEgDAAgFIACgMIAGgcIAJAAIgHAgIgBAGQAAADACACQACABADABQAEAAADgCQADgCACgDIAEgIQACgCABgGIAFgWIAJAAIgLAzIgIAAIABgKQgIALgKAAQgGAAgDgEg");
	this.shape_29.setTransform(467.125,277.4);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_30.setTransform(463.075,276.475);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_31.setTransform(456.125,276.425);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("#F1E8DE").s().p("AAIAbIAHggIABgIQAAAAAAgBQAAAAgBgBQAAAAAAgBQgBAAAAAAQgCgDgDAAQgHABgEAFQgGAEgCAMIgFAYIgJAAIALgzIAIAAIgCAJQAFgFAEgDQAEgCAFAAQAGgBAEAEQAEADAAAGIgCAJIgGAfg");
	this.shape_32.setTransform(450.125,277.3);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAADgCIABgFQABgDgDgDQgDgCgGAAQgEAAgEACQgEADgBAEIgJAAQADgIAFgEQAHgEAHAAQAKAAAGAFQAEADAAAGIgBAJIgDAMIgBAKIABAHIgJAAIgBgHIgJAGIgIACQgHAAgFgEgAAJABIgHAAIgKADQgDABgCACQgBACAAADQAAADACADQADACAFAAQAEAAADgCQAEgDADgEQABgDACgIIgEABg");
	this.shape_33.setTransform(444.6,277.35);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("#F1E8DE").s().p("AAWAaIAHghIABgGQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAgBAAAAQgDgBgCgBQgEABgFACQgDADgDADQgCAEgBAHIgGAZIgIAAIAHgiIABgEQAAgBAAgBQAAAAAAgBQAAAAgBgBQAAAAgBgBQAAAAAAAAQgBgBAAAAQgBAAAAAAQgBgBAAAAQgEABgEACQgFACgCAFQgDAEgBAHIgGAYIgIAAIAKgzIAJAAIgBAJQAEgGAEgBQAEgDAFAAQAEAAADADQADADABAEQAEgEAEgDQAFgDAFAAQAGAAADAEQAEADAAAFIgBAIIgHAgg");
	this.shape_34.setTransform(546.65,266.2);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAHAAIgJAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_35.setTransform(541.7,265.275);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("#F1E8DE").s().p("AgSAXQgFgEAAgHQAAgEACgEQACgDADgBIAIgDIALgBQAIAAADgCIABgGQAAgDgCgBQgDgDgGAAQgFAAgDADQgEACgBAFIgJgBQACgIAHgEQAGgEAHAAQAKAAAGAEQAEAEAAAFIgBAKIgDAMIgBAKIABAHIgJAAIgBgHIgJAHIgIABQgHAAgEgEgAAJABIgHAAIgKACQgDABgCADQgBACAAADQgBADADADQADADAEgBQAFABADgDQAEgDADgEQACgEABgHIgEABg");
	this.shape_36.setTransform(537.5,266.25);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f("#F1E8DE").s().p("AgOAZQgFgDgCgEQgDgGAAgFQABgPAIgKQAIgIAKAAQAKAAAGAGQAFAFABAKQgBAJgDAHQgDAIgIAEQgGAEgGAAQgHAAgFgCgAgDgRIgGAFIgFAJIgBAIQAAAIAEAEQADADAGAAIAEgBIAGgDIADgGIAEgGIABgJQAAgGgEgEQgDgEgGAAQgDAAgDACg");
	this.shape_37.setTransform(529.25,266.25);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_38.setTransform(525.375,265.375);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f("#F1E8DE").s().p("AAIAaIAHgfIABgHQAAgBAAgBQAAAAgBgBQAAAAAAgBQgBAAAAgBQgCgCgDAAQgHAAgEAGQgGAFgCALIgFAXIgJAAIALgzIAIAAIgCAJQAFgFAEgCQAEgDAFAAQAGAAAEAEQAEADAAAGIgCAJIgGAeg");
	this.shape_39.setTransform(517.975,266.2);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgGAAgGQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAFAFQAGAGAAAKIAAAHIgmAAIAAADQAAAHAEAEQADAEAFAAQADAAAFgDQAEgDACgFIAJABQgCAFgHAGQgGAGgIAAQgGAAgFgCgAgGgPQgEAEgDAHIAdAAIAAgCQAAgGgEgDQgDgEgFAAQgFAAgFAEg");
	this.shape_40.setTransform(512.5,266.25);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgGAAgGQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAFQAGAGAAAKIAAAHIglAAIgBADQAAAHADAEQAEAEAFAAQADAAAFgDQAEgDADgFIAIABQgCAFgGAGQgHAGgIAAQgGAAgFgCgAgFgPQgFAEgCAHIAcAAIAAgCQAAgGgDgDQgEgEgFAAQgEAAgFAEg");
	this.shape_41.setTransform(506.95,266.25);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("#F1E8DE").s().p("AgSAaIAKgzIAIAAIgCALQADgGAEgCQAEgEAEAAIAGADIgDAHIgFgBQgFAAgFAFQgEAGgDAMIgEAUg");
	this.shape_42.setTransform(502.975,266.2);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f("#F1E8DE").s().p("AgQAVQgGgFAAgJQAAgIAEgIQADgIAGgFQAHgEAHAAQAIAAAFAEQAFAGAAAHIgJABQAAgFgDgDQgDgDgEAAQgEAAgEAEQgEADgCAHQgDAGAAAGQAAAHADADQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAKgGAEQgGAFgHAAQgIAAgFgGg");
	this.shape_43.setTransform(498.525,266.25);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("#F1E8DE").s().p("AgQAWQgGgDAAgKIAJgBIABAGQACADADACQADABAEAAQAEABAEgDQADgDAAgDQAAAAgBgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgDgCgCgDQgBgDAAgDQgBgGAGgFQAEgEAIAAQAJAAAGAEQAFAFAAAIIgJAAQABgEgEgDQgDgDgGAAQgDAAgDACQgDACABACQAAABAAABQAAAAAAABQAAAAABABQAAAAABABIAGADQALAFACABQAEAFABAFQgBAEgCAEQgCAEgFACQgFACgFAAQgJAAgHgFg");
	this.shape_44.setTransform(493.4,266.25);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgGAAgGQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAFQAGAGAAAKIAAAHIglAAIgBADQAAAHAEAEQADAEAFAAQADAAAFgDQAEgDADgFIAIABQgCAFgGAGQgHAGgIAAQgGAAgFgCgAgGgPQgEAEgCAHIAcAAIAAgCQAAgGgDgDQgEgEgFAAQgEAAgGAEg");
	this.shape_45.setTransform(485.25,266.25);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_46.setTransform(479.625,265.275);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_47.setTransform(475.875,265.375);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("#F1E8DE").s().p("AgRAkIAJgsIgIAAIACgHIAIAAIABgGIADgIQABgDACgCQACgCAFAAIAKACIgCAIIgHgBQgBAAAAAAQgBAAgBAAQAAAAAAAAQgBABAAAAIgCAGIgCAFIAKAAIgBAHIgKAAIgIAsg");
	this.shape_48.setTransform(470.675,265.2);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f("#F1E8DE").s().p("AgOAZQgFgDgCgEQgDgGAAgFQABgPAIgKQAIgIAKAAQAKAAAGAGQAFAFABAKQgBAJgDAHQgDAIgIAEQgGAEgGAAQgGAAgGgCgAgDgRIgGAFIgFAJIgBAIQAAAIAEAEQADADAGAAIAEgBIAGgDIADgGIAEgGIABgJQAAgGgEgEQgDgEgGAAQgDAAgDACg");
	this.shape_49.setTransform(465.8,266.25);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgGAAgGQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAFQAFAGAAAKIgBAHIglAAIAAADQAAAHADAEQAEAEAEAAQAEAAAEgDQAFgDACgFIAJABQgCAFgHAGQgGAGgJAAQgFAAgFgCgAgFgPQgFAEgDAHIAdAAIAAgCQAAgGgEgDQgDgEgFAAQgFAAgEAEg");
	this.shape_50.setTransform(457.4,266.25);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_51.setTransform(452.225,265.325);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAIAAIgKAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_52.setTransform(448.25,265.275);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f("#F1E8DE").s().p("AgQAWQgGgDAAgKIAJgBIABAGQACADADACQADABAEAAQAEABAEgDQACgDABgDQgBAAAAgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgDgCgCgDQgBgDgBgDQAAgGAGgFQAEgEAIAAQAJAAAGAEQAFAFAAAIIgJAAQAAgEgDgDQgDgDgGAAQgDAAgDACQgCACgBACQAAABABABQAAAAAAABQAAAAABABQAAAAABABIAGADQALAFACABQAEAFAAAFQAAAEgCAEQgCAEgFACQgFACgFAAQgJAAgHgFg");
	this.shape_53.setTransform(444.45,266.25);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_54.setTransform(552.225,254.275);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_55.setTransform(547.625,254.175);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("#F1E8DE").s().p("AgRAjQgFgCgCgDQgCgCAAgFIAAgCIAKAAQgBABAAABQAAABAAAAQAAABABAAQAAABAAAAIACADIAHABQAHAAADgFQACgDADgJIABgEQgIAHgGAAQgIAAgFgGQgGgFAAgKQAAgJAFgHQADgIAHgDQAGgEAEAAQALAAAFAKIACgJIAIAAIgKAxQgCAIgDAFQgDAEgFADQgEADgGAAQgGAAgFgCgAgEgbQgDABgCAEQgDAEgCAEIgBAIIABAHQACAEADACQACACADAAQAEAAAEgEQAEgCADgGQADgGAAgGQAAgHgEgDQgDgEgGAAQgBAAgEACg");
	this.shape_56.setTransform(542.2,256.15);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAHAAIgJAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_57.setTransform(538.55,254.175);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("#F1E8DE").s().p("AgSAbIAKg0IAIAAIgCALQADgGAEgDQAEgDAEAAIAGACIgDAIIgFgBQgFAAgFAFQgEAFgDANIgEAVg");
	this.shape_58.setTransform(535.975,255.1);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgCgFQgDgGAAgGQAAgHAEgJQAEgHAHgEQAFgEAHAAQAJAAAFAFQAGAHAAAKIAAAHIgmAAIAAACQAAAIAEADQADAEAFAAQADAAAFgDQAEgDACgGIAJACQgCAFgHAHQgGAFgIAAQgGAAgFgDgAgGgPQgEADgDAIIAdAAIAAgBQAAgHgEgDQgDgEgFAAQgFAAgFAEg");
	this.shape_59.setTransform(528.25,255.15);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_60.setTransform(522.625,254.175);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_61.setTransform(518.875,254.275);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("#F1E8DE").s().p("AAIAbIAHghIABgHQAAAAAAgBQAAAAgBgBQAAAAAAgBQgBAAAAAAQgCgCgDAAQgHAAgEAEQgGAGgCAKIgFAZIgJAAIALg0IAIAAIgCAJQAFgEAEgDQAEgCAFgBQAGABAEADQAEADAAAGIgCAJIgGAfg");
	this.shape_62.setTransform(511.475,255.1);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgEAAgHQAAgOAJgKQAGgIAMAAQAJAAAGAGQAFAFAAALQAAAIgDAIQgDAHgIAEQgGAEgGAAQgHAAgEgDgAgDgRIgHAFIgDAJIgCAIQAAAIAEADQAEAFAFAAIAFgCIAEgEIAFgEIADgHIABgIQAAgIgEgDQgDgEgFAAQgEAAgDACg");
	this.shape_63.setTransform(506.05,255.15);

	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f("#F1E8DE").s().p("AgRAjQgEgCgCgDQgDgCAAgFIABgCIAJAAQgBABAAABQAAABAAAAQAAABABAAQAAABAAAAIADADIAGABQAHAAAEgFQABgDACgJIABgEQgGAHgHAAQgIAAgGgGQgEgFAAgKQAAgJADgHQAEgIAGgDQAHgEAFAAQAJAAAGAKIACgJIAIAAIgLAxQgBAIgDAFQgDAEgFADQgEADgGAAQgGAAgFgCgAgDgbQgDABgEAEQgCAEgBAEIgBAIIABAHQABAEACACQAEACADAAQADAAAEgEQAFgCACgGQADgGAAgGQAAgHgDgDQgEgEgFAAQgDAAgCACg");
	this.shape_64.setTransform(497.7,256.15);

	this.shape_65 = new cjs.Shape();
	this.shape_65.graphics.f("#F1E8DE").s().p("AgSAXQgFgFAAgGQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAADgBIABgHQAAgCgCgCQgDgDgGAAQgFAAgDADQgEACgBAEIgJAAQACgIAHgEQAGgEAHAAQAKAAAGAEQAEAEAAAGIgBAJIgDAMIgBAKIABAHIgJAAIgBgGIgJAFIgIACQgHAAgEgEgAAJABIgHABIgKACQgDABgCACQgCACABADQgBAEADACQADACAEABQAFgBADgCQAEgCADgEQACgFABgHIgEABg");
	this.shape_65.setTransform(492.05,255.15);

	this.shape_66 = new cjs.Shape();
	this.shape_66.graphics.f("#F1E8DE").s().p("AgSAbIAKg0IAIAAIgCALQADgGAEgDQAEgDAEAAIAGACIgDAIIgFgBQgFAAgFAFQgEAFgDANIgEAVg");
	this.shape_66.setTransform(488.125,255.1);

	this.shape_67 = new cjs.Shape();
	this.shape_67.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_67.setTransform(483.575,254.225);

	this.shape_68 = new cjs.Shape();
	this.shape_68.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_68.setTransform(475.225,254.225);

	this.shape_69 = new cjs.Shape();
	this.shape_69.graphics.f("#F1E8DE").s().p("AAIAbIAHghIABgHQAAAAAAgBQgBAAAAgBQAAAAAAgBQgBAAAAAAQgCgCgDAAQgHAAgEAEQgGAGgCAKIgFAZIgJAAIALg0IAIAAIgCAJQAFgEAEgDQAEgCAFgBQAGABAEADQAEADAAAGIgCAJIgGAfg");
	this.shape_69.setTransform(469.225,255.1);

	this.shape_70 = new cjs.Shape();
	this.shape_70.graphics.f("#F1E8DE").s().p("AgSAXQgFgFAAgGQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAADgBIABgHQAAgCgCgCQgDgDgGAAQgFAAgDADQgEACgBAEIgJAAQACgIAHgEQAGgEAHAAQAKAAAGAEQAEAEAAAGIgBAJIgDAMIgBAKIABAHIgJAAIgBgGIgJAFIgIACQgHAAgEgEgAAJABIgHABIgKACQgDABgCACQgCACAAADQABAEACACQADACAEABQAFgBADgCQAEgCADgEQACgFABgHIgEABg");
	this.shape_70.setTransform(463.7,255.15);

	this.shape_71 = new cjs.Shape();
	this.shape_71.graphics.f("#F1E8DE").s().p("AgaAkIAPhHIAIAAIgCAIQAFgFADgCQADgBAEgBQAIABAEAFQAFAGAAAJQAAAJgCAGQgDAGgEAEQgEAEgEACQgEABgEABQgIAAgGgKIgFAcgAABgaQgCABgCAEQgDADgBAGIgCAJIABAGQABAEADABQADACACAAQAIAAAFgIQAEgIAAgJQAAgGgDgEQgDgEgFABQgDAAgDACg");
	this.shape_71.setTransform(455.125,256.1);

	this.shape_72 = new cjs.Shape();
	this.shape_72.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAAEgBIABgHQgBgCgCgCQgDgDgGAAQgFAAgDADQgDACgCAEIgJAAQADgIAFgEQAHgEAIAAQAJAAAGAEQAEAEAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgGIgJAFIgIACQgIAAgEgEgAAJABIgHABIgKACQgDABgBACQgCACAAADQAAAEADACQACACAFABQAEgBADgCQAEgCACgEQACgFACgHIgEABg");
	this.shape_72.setTransform(449.8,255.15);

	this.shape_73 = new cjs.Shape();
	this.shape_73.graphics.f("#F1E8DE").s().p("AgSAkIANg/IgXAAIACgIIA3AAIgCAIIgXAAIgMA/g");
	this.shape_73.setTransform(445.9,254.175);

	this.instance = new lib.drag();
	this.instance.parent = this;
	this.instance.setTransform(380,249,0.3046,0.3046);

	this.shape_74 = new cjs.Shape();
	this.shape_74.graphics.f("#F1E8DE").s().p("AgFAFIACgJIAJAAIgDAJg");
	this.shape_74.setTransform(468.2,237.15);

	this.shape_75 = new cjs.Shape();
	this.shape_75.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_75.setTransform(466.075,234.175);

	this.shape_76 = new cjs.Shape();
	this.shape_76.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgFQAAgPAJgKQAGgIAMAAQAJAAAGAGQAFAGAAAKQAAAHgDAIQgEAIgGAEQgHAEgHAAQgFAAgFgCgAgDgRIgHAGIgDAJIgCAIQAAAHAEADQAEAEAEAAIAGgBIAEgDIAFgGIACgGIACgIQAAgHgEgFQgEgDgEAAQgEAAgDACg");
	this.shape_76.setTransform(461.6,235.05);

	this.shape_77 = new cjs.Shape();
	this.shape_77.graphics.f("#F1E8DE").s().p("AgOAZQgEgDgDgFQgCgFAAgFQgBgPAJgKQAIgIAKAAQAKAAAGAGQAGAGgBAKQAAAHgDAIQgEAIgGAEQgHAEgHAAQgGAAgFgCgAgEgRIgFAGIgFAJIgBAIQAAAHADADQAFAEAEAAIAFgBIAGgDIADgGIADgGIACgIQAAgHgEgFQgEgDgFAAQgDAAgEACg");
	this.shape_77.setTransform(456.05,235.05);

	this.shape_78 = new cjs.Shape();
	this.shape_78.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_78.setTransform(450.375,234.075);

	this.shape_79 = new cjs.Shape();
	this.shape_79.graphics.f("#F1E8DE").s().p("AgQAXQgGgFAAgKIAJAAIABAGQACADADABQADACAEAAQAFAAADgCQADgDAAgCQAAgBgBgBQAAAAAAgBQAAAAAAgBQgBAAAAgBQgCgCgHgDIgIgDQgDgCgCgDQgBgCgBgEQAAgGAGgEQAEgFAIAAQAJAAAGAFQAFAEAAAHIgJABQABgFgEgDQgDgCgFAAQgEAAgDACQgDACABADQAAAAAAABQAAAAAAABQAAAAABABQAAAAABAAIAHAFQAKAEACABQAEAFABAFQgBAFgCADQgCADgFADQgFACgFAAQgJAAgHgEg");
	this.shape_79.setTransform(445.25,235.05);

	this.shape_80 = new cjs.Shape();
	this.shape_80.graphics.f("#F1E8DE").s().p("AgOAZQgFgDgCgEQgDgGAAgFQABgPAIgKQAIgIAKAAQAKAAAGAGQAFAFABAKQgBAJgDAHQgDAIgIAEQgGAEgGAAQgHAAgFgCgAgDgRIgGAFIgFAJIgBAIQAAAIAEAEQADADAGAAIAEgBIAGgDIADgFIAEgHIABgJQAAgGgEgEQgDgEgGAAQgDAAgDACg");
	this.shape_80.setTransform(555.8,223.95);

	this.shape_81 = new cjs.Shape();
	this.shape_81.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_81.setTransform(551.925,223.075);

	this.shape_82 = new cjs.Shape();
	this.shape_82.graphics.f("#F1E8DE").s().p("AAIAaIAHgfIABgHQAAgBAAgBQAAAAgBgBQAAAAAAgBQgBAAAAgBQgCgCgDAAQgHAAgEAGQgGAFgCALIgFAXIgJAAIALgzIAIAAIgCAJQAFgFAEgCQAEgDAFAAQAGAAAEAEQAEADAAAGIgCAJIgGAeg");
	this.shape_82.setTransform(544.525,223.9);

	this.shape_83 = new cjs.Shape();
	this.shape_83.graphics.f("#F1E8DE").s().p("AgNAZQgGgDgCgEQgDgGABgFQgBgPAKgKQAGgIAMAAQAJAAAGAGQAFAFAAAKQABAJgEAHQgEAIgGAEQgHAEgHAAQgFAAgFgCgAgEgRIgGAFIgDAJIgCAIQAAAIADAEQAEADAFAAIAGgBIAEgDIAFgFIACgHIACgJQAAgGgEgEQgEgEgEAAQgEAAgEACg");
	this.shape_83.setTransform(539.1,223.95);

	this.shape_84 = new cjs.Shape();
	this.shape_84.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_84.setTransform(535.225,223.075);

	this.shape_85 = new cjs.Shape();
	this.shape_85.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_85.setTransform(532.425,223.075);

	this.shape_86 = new cjs.Shape();
	this.shape_86.graphics.f("#F1E8DE").s().p("AgUAXQgEgDAAgFIACgLIAGgeIAJAAIgHAhIgBAGQAAADACACQACACADAAQAEgBADgCQADgBACgDIAEgHQACgDABgGIAFgXIAJAAIgLAzIgIAAIABgJQgIAKgKAAQgGAAgDgDg");
	this.shape_86.setTransform(528.125,224);

	this.shape_87 = new cjs.Shape();
	this.shape_87.graphics.f("#F1E8DE").s().p("AgIAiQgEgDgDgGIgBAKIgIAAIAPhGIAJAAIgGAZQAEgEADgBIAHgCQAHAAAFAGQAFAFAAAJQAAAHgCAGQgCAGgDAEIgGAGIgGADIgGABQgEAAgEgCgAgDgGQgEAEgCAGIgCAKIAAACQAAAGADAEQADADAFAAQADAAAFgDQAEgDACgHQADgHAAgGQAAgFgEgEQgDgEgFAAQgEAAgEAEg");
	this.shape_87.setTransform(522.3,223.025);

	this.shape_88 = new cjs.Shape();
	this.shape_88.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgGAAgGQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAFQAFAGAAAKIgBAHIglAAIAAADQAAAHADAEQAEAEAEAAQAEAAAEgDQAFgDADgFIAIABQgCAFgGAGQgHAGgJAAQgFAAgFgCgAgFgPQgFAEgDAHIAdAAIAAgCQAAgGgDgDQgEgEgFAAQgFAAgEAEg");
	this.shape_88.setTransform(514,223.95);

	this.shape_89 = new cjs.Shape();
	this.shape_89.graphics.f("#F1E8DE").s().p("AgSAaIAKgzIAIAAIgCALQADgGAEgCQAEgEAEAAIAGADIgDAHIgFgBQgFAAgFAFQgEAGgDAMIgEAUg");
	this.shape_89.setTransform(510.025,223.9);

	this.shape_90 = new cjs.Shape();
	this.shape_90.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAHAAIgJAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_90.setTransform(507.05,222.975);

	this.shape_91 = new cjs.Shape();
	this.shape_91.graphics.f("#F1E8DE").s().p("AgRAkIAJgsIgIAAIACgHIAIAAIABgGIADgIQABgDACgCQACgCAFAAIAKACIgCAIIgHgBQgBAAAAAAQgBAAAAAAQgBAAAAAAQgBABAAAAIgCAGIgCAFIAKAAIgBAHIgKAAIgIAsg");
	this.shape_91.setTransform(505.025,222.9);

	this.shape_92 = new cjs.Shape();
	this.shape_92.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_92.setTransform(497.675,223.025);

	this.shape_93 = new cjs.Shape();
	this.shape_93.graphics.f("#F1E8DE").s().p("AgLAkIAOhHIAJAAIgOBHg");
	this.shape_93.setTransform(493.65,222.975);

	this.shape_94 = new cjs.Shape();
	this.shape_94.graphics.f("#F1E8DE").s().p("AgNAZQgGgDgCgEQgDgGABgFQgBgPAKgKQAGgIAMAAQAJAAAGAGQAGAFgBAKQABAJgEAHQgEAIgGAEQgHAEgHAAQgFAAgFgCgAgEgRIgGAFIgDAJIgCAIQAAAIADAEQAEADAFAAIAGgBIAEgDIAFgFIACgHIACgJQAAgGgEgEQgEgEgEAAQgEAAgEACg");
	this.shape_94.setTransform(489.6,223.95);

	this.shape_95 = new cjs.Shape();
	this.shape_95.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_95.setTransform(483.925,222.975);

	this.shape_96 = new cjs.Shape();
	this.shape_96.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_96.setTransform(476.025,223.025);

	this.shape_97 = new cjs.Shape();
	this.shape_97.graphics.f("#F1E8DE").s().p("AAIAaIAHgfIABgHQAAgBAAgBQAAAAgBgBQAAAAAAgBQgBAAAAgBQgCgCgDAAQgHAAgEAGQgGAFgCALIgFAXIgJAAIALgzIAIAAIgCAJQAFgFAEgCQAEgDAFAAQAGAAAEAEQAEADAAAGIgCAJIgGAeg");
	this.shape_97.setTransform(470.025,223.9);

	this.shape_98 = new cjs.Shape();
	this.shape_98.graphics.f("#F1E8DE").s().p("AgTAXQgEgEAAgHQAAgEACgEQACgDADgBIAIgDIALgBQAIAAADgCIABgGQAAgDgCgBQgDgDgGAAQgFAAgDADQgEACgBAFIgJgBQACgIAGgEQAGgEAIAAQAKAAAGAEQAEAEAAAFIgBAKIgDAMIgBAKIABAHIgJAAIgBgHIgJAHIgIABQgHAAgFgEgAAJABIgHAAIgKACQgDABgCADQgBACAAADQAAADACADQADADAEgBQAFABADgDQAEgDADgEQABgEACgHIgEABg");
	this.shape_98.setTransform(464.5,223.95);

	this.shape_99 = new cjs.Shape();
	this.shape_99.graphics.f("#F1E8DE").s().p("AgaAkIAPhHIAIAAIgCAIQAFgFADgBQADgDAEAAQAIAAAEAGQAFAGAAAKQAAAHgCAHQgDAGgEAEQgEAEgEACQgEABgEAAQgIAAgGgJIgFAcgAABgbQgCACgCAEQgDADgBAGIgCAJIABAHQABACADACQADACACABQAIAAAFgJQAEgIAAgIQAAgHgDgEQgDgDgFgBQgDAAgDACg");
	this.shape_99.setTransform(455.925,224.9);

	this.shape_100 = new cjs.Shape();
	this.shape_100.graphics.f("#F1E8DE").s().p("AgTAXQgEgEAAgHQAAgEACgEQACgDADgBIAIgDIAKgBQAJAAAEgCIABgGQgBgDgCgBQgDgDgGAAQgEAAgEADQgDACgCAFIgJgBQADgIAFgEQAGgEAJAAQAJAAAGAEQAEAEAAAFIgBAKIgDAMIgCAKIABAHIgIAAIgBgHIgJAHIgIABQgIAAgEgEgAAJABIgHAAIgKACQgDABgBADQgCACgBADQABADADADQACADAFgBQAEABADgDQAEgDACgEQACgEACgHIgEABg");
	this.shape_100.setTransform(450.6,223.95);

	this.shape_101 = new cjs.Shape();
	this.shape_101.graphics.f("#F1E8DE").s().p("AgSAkIANg/IgXAAIACgIIA3AAIgBAIIgYAAIgMA/g");
	this.shape_101.setTransform(446.7,222.975);

	this.fireButton = new lib.fireButton();
	this.fireButton.name = "fireButton";
	this.fireButton.parent = this;
	this.fireButton.setTransform(400.3,231.2,0.2705,0.2705,0,0,0,0.4,0.8);

	this.shape_102 = new cjs.Shape();
	this.shape_102.graphics.f("#F1E8DE").s().p("AgFAFIACgJIAJAAIgDAJg");
	this.shape_102.setTransform(528.95,187.2);

	this.shape_103 = new cjs.Shape();
	this.shape_103.graphics.f("#F1E8DE").s().p("AgSAbIAKgzIAIAAIgCAKQADgGAEgDQAEgCAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_103.setTransform(527.025,185.05);

	this.shape_104 = new cjs.Shape();
	this.shape_104.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAGQAFAFAAALIgBAGIglAAIAAADQAAAIADADQAEAEAEAAQAEAAAEgDQAFgDACgGIAJABQgCAHgHAGQgGAFgJAAQgFAAgFgCgAgFgPQgFADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgEAEg");
	this.shape_104.setTransform(522.1,185.1);

	this.shape_105 = new cjs.Shape();
	this.shape_105.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_105.setTransform(518.275,184.225);

	this.shape_106 = new cjs.Shape();
	this.shape_106.graphics.f("#F1E8DE").s().p("AgQAWQgGgGAAgJQAAgIAEgIQADgJAGgDQAHgFAHAAQAIAAAFAFQAFAEAAAIIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAFAAAHQAAAGADAEQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgFg");
	this.shape_106.setTransform(514.225,185.1);

	this.shape_107 = new cjs.Shape();
	this.shape_107.graphics.f("#F1E8DE").s().p("AgSAXQgFgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAADgCIABgFQAAgDgCgDQgDgCgGAAQgFAAgDACQgEADgBAFIgJgBQACgIAHgEQAGgEAHAAQAKAAAGAFQAEADAAAGIgBAJIgDAMIgBAKIABAHIgJAAIgBgHIgJAGIgIACQgHAAgEgEgAAJABIgHAAIgKADQgDABgCACQgCACAAADQABADACADQADACAEAAQAFAAADgCQAEgDADgEQACgDABgIIgEABg");
	this.shape_107.setTransform(508.7,185.1);

	this.shape_108 = new cjs.Shape();
	this.shape_108.graphics.f("#F1E8DE").s().p("AgSAbIAKgzIAIAAIgCAKQADgGAEgDQAEgCAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_108.setTransform(504.775,185.05);

	this.shape_109 = new cjs.Shape();
	this.shape_109.graphics.f("#F1E8DE").s().p("AgSAXQgFgFAAgGQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAADgCIACgFQAAgDgDgDQgDgCgGAAQgFAAgDACQgEADgBAFIgJgBQACgIAHgEQAGgEAHAAQAKAAAGAFQAEADAAAGIgBAJIgDAMIgBAKIABAHIgJAAIgBgHIgJAGIgIACQgHAAgEgEgAAJABIgHAAIgKADQgDABgCACQgCACAAADQAAADADADQADACAEAAQAFAAADgCQAEgDADgEQACgDABgIIgEABg");
	this.shape_109.setTransform(499.8,185.1);

	this.shape_110 = new cjs.Shape();
	this.shape_110.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_110.setTransform(494.225,184.125);

	this.shape_111 = new cjs.Shape();
	this.shape_111.graphics.f("#F1E8DE").s().p("AgQAWQgGgGAAgJQAAgIAEgIQADgJAGgDQAHgFAHAAQAIAAAFAFQAFAEAAAIIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAFAAAHQAAAGADAEQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgFg");
	this.shape_111.setTransform(489.225,185.1);

	this.shape_112 = new cjs.Shape();
	this.shape_112.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAGQAGAFAAALIgBAGIgkAAIgBADQAAAIADADQAEAEAFAAQADAAAEgDQAFgDADgGIAIABQgCAHgGAGQgHAFgIAAQgGAAgFgCgAgFgPQgFADgCAJIAcAAIAAgDQAAgGgDgEQgEgDgFAAQgEAAgFAEg");
	this.shape_112.setTransform(480.95,185.1);

	this.shape_113 = new cjs.Shape();
	this.shape_113.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_113.setTransform(475.325,184.125);

	this.shape_114 = new cjs.Shape();
	this.shape_114.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_114.setTransform(471.575,184.225);

	this.shape_115 = new cjs.Shape();
	this.shape_115.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAGQAFAFAAALIgBAGIglAAIAAADQAAAIAEADQADAEAEAAQAEAAAEgDQAFgDACgGIAJABQgCAHgHAGQgGAFgJAAQgFAAgFgCgAgGgPQgEADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgFAEg");
	this.shape_115.setTransform(464.25,185.1);

	this.shape_116 = new cjs.Shape();
	this.shape_116.graphics.f("#F1E8DE").s().p("AgOAaIgJgzIAJAAIAEAbIACAQIAGgMIAQgfIAKAAIgdAzg");
	this.shape_116.setTransform(459.55,185.1);

	this.shape_117 = new cjs.Shape();
	this.shape_117.graphics.f("#F1E8DE").s().p("AgNAZQgGgDgCgFQgDgFAAgFQABgPAIgKQAIgIALAAQAJAAAGAGQAFAGABAKQgBAHgDAIQgDAIgIAEQgGAEgGAAQgHAAgEgCgAgDgRIgHAGIgDAJIgCAIQAAAHAEADQADAEAGAAIAEgBIAGgDIADgGIAEgGIABgIQAAgHgEgFQgDgDgFAAQgEAAgDACg");
	this.shape_117.setTransform(453.75,185.1);

	this.shape_118 = new cjs.Shape();
	this.shape_118.graphics.f("#F1E8DE").s().p("AAWAbIAHgiIABgGQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAgBgBAAQgBgCgDAAQgEAAgEADQgFACgBAEQgDAFgBAHIgGAZIgIAAIAIgiIAAgGQAAAAAAgBQAAAAAAgBQAAAAgBgBQAAAAAAAAQgBgBAAAAQgBgBAAAAQgBAAAAAAQgBgBgBAAQgDAAgFADQgEACgCAFQgDAEgCAHIgEAZIgJAAIALgzIAJAAIgCAIQAEgFAFgCQAEgCAEAAQAEAAADACQADADABAEQAEgEAFgDQAEgCAFAAQAHAAADACQADADAAAGIgCAIIgHAhg");
	this.shape_118.setTransform(446.8,185.05);

	this.shape_119 = new cjs.Shape();
	this.shape_119.graphics.f("#F1E8DE").s().p("AgOAZQgFgDgCgEQgDgGAAgFQABgPAIgKQAIgIAKAAQAKAAAGAGQAFAFABAKQgBAJgDAHQgDAIgIAEQgGAEgGAAQgHAAgFgCgAgDgRIgGAFIgFAJIgBAIQAAAIAEAEQADADAGAAIAEgBIAGgDIADgFIAEgHIABgJQAAgGgEgFQgDgDgGAAQgDAAgDACg");
	this.shape_119.setTransform(554.45,174);

	this.shape_120 = new cjs.Shape();
	this.shape_120.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_120.setTransform(550.575,173.125);

	this.shape_121 = new cjs.Shape();
	this.shape_121.graphics.f("#F1E8DE").s().p("AAHAkIgJgbIgKAJIgEASIgJAAIAPhHIAJAAIgJAsIAYgYIAMAAIgWASIANAhg");
	this.shape_121.setTransform(541.05,173.025);

	this.shape_122 = new cjs.Shape();
	this.shape_122.graphics.f("#F1E8DE").s().p("AgQAVQgGgFAAgJQAAgIAEgIQADgIAGgFQAHgEAHAAQAIAAAFAEQAFAGAAAHIgJABQAAgFgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAGAAAGQAAAHADADQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAKgGAEQgGAFgHAAQgIAAgFgGg");
	this.shape_122.setTransform(535.925,174);

	this.shape_123 = new cjs.Shape();
	this.shape_123.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAIAAIgKAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_123.setTransform(532.4,173.025);

	this.shape_124 = new cjs.Shape();
	this.shape_124.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAABABAAQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_124.setTransform(529.975,173.125);

	this.shape_125 = new cjs.Shape();
	this.shape_125.graphics.f("#F1E8DE").s().p("AgQAWQgGgDAAgKIAJgBIABAGQACADADACQADABAEAAQAEABAEgDQADgDAAgDQAAAAgBgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgDgCgCgDQgBgDAAgDQgBgGAGgFQAEgEAIAAQAJAAAGAEQAFAFAAAIIgJAAQABgEgEgDQgDgDgGAAQgDAAgDACQgDACABACQAAABAAABQAAAAAAABQAAAAABABQAAAAABABIAGADQALAFACABQAEAFABAFQgBAEgCAEQgCAEgFACQgFACgFAAQgJAAgHgFg");
	this.shape_125.setTransform(525.8,174);

	this.shape_126 = new cjs.Shape();
	this.shape_126.graphics.f("#F1E8DE").s().p("AgbAjIAAgIIAGABIAEgBQACgCADgEIACgGIgIgzIAJAAIAEAbIACAOIAWgpIAJAAIggA7QgEAIgEADQgEADgFAAIgGgCg");
	this.shape_126.setTransform(520.9,175.05);

	this.shape_127 = new cjs.Shape();
	this.shape_127.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgEQgCgGAAgFQAAgPAJgKQAGgIAMAAQAJAAAGAGQAFAFABAKQgBAJgDAHQgDAIgIAEQgGAEgGAAQgHAAgEgCgAgDgRIgHAFIgDAJIgCAIQAAAIAEAEQADADAGAAIAFgBIAEgDIAFgFIADgHIABgJQAAgGgEgFQgDgDgFAAQgEAAgDACg");
	this.shape_127.setTransform(515.5,174);

	this.shape_128 = new cjs.Shape();
	this.shape_128.graphics.f("#F1E8DE").s().p("AgSAtIABgIIAGABQAAAAABAAQABAAAAAAQABAAAAgBQABAAAAgBQACgCACgIIAJg0IAJAAIgLA1QgCAKgCAEQgDAFgHAAIgIgBgAAJgjIACgKIAIAAIgCAKg");
	this.shape_128.setTransform(511.075,174.075);

	this.shape_129 = new cjs.Shape();
	this.shape_129.graphics.f("#F1E8DE").s().p("AAIAaIAHgfIABgHQAAgBAAgBQAAAAgBgBQAAAAAAgBQgBAAAAgBQgCgCgDAAQgHAAgEAGQgGAFgCALIgFAXIgJAAIALgzIAIAAIgCAJQAFgFAEgCQAEgDAFAAQAGAAAEAEQAEADAAAGIgCAJIgGAeg");
	this.shape_129.setTransform(504.825,173.95);

	this.shape_130 = new cjs.Shape();
	this.shape_130.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgGAAgGQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAFQAFAGAAAKIgBAHIglAAIAAADQAAAHAEAEQADAEAEAAQAEAAAEgDQAFgDACgFIAJABQgCAFgHAGQgGAGgJAAQgFAAgFgCgAgGgPQgEAEgDAHIAdAAIAAgCQAAgGgEgEQgDgDgFAAQgFAAgFAEg");
	this.shape_130.setTransform(499.35,174);

	this.shape_131 = new cjs.Shape();
	this.shape_131.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgGAAgGQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAFQAGAGAAAKIAAAHIglAAIgBADQAAAHAEAEQADAEAFAAQADAAAFgDQAEgDADgFIAIABQgCAFgGAGQgHAGgIAAQgGAAgFgCgAgGgPQgEAEgCAHIAcAAIAAgCQAAgGgDgEQgEgDgFAAQgEAAgGAEg");
	this.shape_131.setTransform(493.8,174);

	this.shape_132 = new cjs.Shape();
	this.shape_132.graphics.f("#F1E8DE").s().p("AgSAaIAKgzIAIAAIgCALQADgGAEgCQAEgEAEAAIAGADIgDAHIgFgBQgFAAgFAFQgEAGgDAMIgEAUg");
	this.shape_132.setTransform(489.825,173.95);

	this.shape_133 = new cjs.Shape();
	this.shape_133.graphics.f("#F1E8DE").s().p("AgQAVQgGgFAAgJQAAgIAEgIQADgIAGgFQAHgEAHAAQAIAAAFAEQAFAGAAAHIgJABQAAgFgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAGAAAGQAAAHADADQADADAEAAQAEAAAEgDQAEgDACgHIAJABQgEAKgGAEQgGAFgHAAQgIAAgFgGg");
	this.shape_133.setTransform(485.375,174);

	this.shape_134 = new cjs.Shape();
	this.shape_134.graphics.f("#F1E8DE").s().p("AgQAWQgGgDAAgKIAJgBIABAGQABADAEACQADABAEAAQAEABADgDQAEgDAAgDQAAAAgBgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgDgCgCgDQgCgDABgDQAAgGAEgFQAFgEAIAAQAKAAAFAEQAFAFAAAIIgJAAQABgEgEgDQgDgDgFAAQgEAAgDACQgDACABACQAAABAAABQAAAAAAABQAAAAABABQAAAAABABIAHADQAKAFACABQAEAFABAFQgBAEgCAEQgCAEgFACQgFACgGAAQgIAAgHgFg");
	this.shape_134.setTransform(480.25,174);

	this.shape_135 = new cjs.Shape();
	this.shape_135.graphics.f("#F1E8DE").s().p("AgNAEIABgIIAaAAIgBAIg");
	this.shape_135.setTransform(476.1,174);

	this.shape_136 = new cjs.Shape();
	this.shape_136.graphics.f("#F1E8DE").s().p("AAIAaIAHgfIABgHQAAgBAAgBQgBAAAAgBQAAAAAAgBQgBAAAAgBQgCgCgDAAQgHAAgEAGQgGAFgCALIgFAXIgJAAIALgzIAIAAIgCAJQAFgFAEgCQAEgDAFAAQAGAAAEAEQAEADAAAGIgCAJIgGAeg");
	this.shape_136.setTransform(471.475,173.95);

	this.shape_137 = new cjs.Shape();
	this.shape_137.graphics.f("#F1E8DE").s().p("AgOAZQgEgDgDgEQgCgGgBgFQAAgPAJgKQAIgIAKAAQAKAAAGAGQAGAFAAAKQAAAJgEAHQgEAIgGAEQgHAEgHAAQgFAAgGgCgAgEgRIgFAFIgFAJIgBAIQAAAIADAEQAFADAEAAIAFgBIAGgDIADgFIADgHIACgJQAAgGgEgFQgEgDgFAAQgDAAgEACg");
	this.shape_137.setTransform(466.05,174);

	this.shape_138 = new cjs.Shape();
	this.shape_138.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgGAAgGQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAGAFQAFAGAAAKIgBAHIgkAAIgBADQAAAHADAEQAEAEAEAAQAEAAAEgDQAFgDADgFIAIABQgCAFgGAGQgHAGgJAAQgFAAgFgCgAgFgPQgFAEgDAHIAdAAIAAgCQAAgGgDgEQgEgDgFAAQgFAAgEAEg");
	this.shape_138.setTransform(457.65,174);

	this.shape_139 = new cjs.Shape();
	this.shape_139.graphics.f("#F1E8DE").s().p("AgQAWQgGgDAAgKIAJgBIABAGQACADADACQADABAEAAQAFABADgDQADgDAAgDQAAAAgBgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgDgCgCgDQgBgDgBgDQAAgGAGgFQAEgEAIAAQAJAAAGAEQAFAFAAAIIgJAAQABgEgEgDQgDgDgGAAQgDAAgDACQgDACABACQAAABAAABQAAAAAAABQAAAAABABQAAAAABABIAGADQALAFACABQAEAFABAFQgBAEgCAEQgCAEgFACQgFACgFAAQgJAAgHgFg");
	this.shape_139.setTransform(452.45,174);

	this.shape_140 = new cjs.Shape();
	this.shape_140.graphics.f("#F1E8DE").s().p("AgUAiQgGgDgDgFQgDgEAAgGIACgOIAIglIAKAAIgKArIgBAIQAAAGAFADQAFADAGAAQAGAAAEgCQAEgDADgEQADgGACgKIAJgmIAJAAIgJAoQgCALgEAGQgDAHgHADQgHAFgHAAQgIAAgGgDg");
	this.shape_140.setTransform(446.8,173.1);

	this.joistickLeft = new lib.joystickLeft();
	this.joistickLeft.name = "joistickLeft";
	this.joistickLeft.parent = this;
	this.joistickLeft.setTransform(398.6,182.1,0.2375,0.2375,0,0,0,2.3,2.6);

	this.shape_141 = new cjs.Shape();
	this.shape_141.graphics.f("#F1E8DE").s().p("AgFAEIADgIIAIAAIgDAIg");
	this.shape_141.setTransform(232.6,281.45);

	this.shape_142 = new cjs.Shape();
	this.shape_142.graphics.f("#F1E8DE").s().p("AgQAYIAJguIAHAAIgBAKQACgGAEgCQADgDAEAAIAFACIgDAHQAAAAgBAAQAAgBgBAAQAAAAgBAAQgBAAAAAAQgEAAgFAEQgDAFgDALIgEATg");
	this.shape_142.setTransform(230.925,279.525);

	this.shape_143 = new cjs.Shape();
	this.shape_143.graphics.f("#F1E8DE").s().p("AgMAWQgFgCgBgFQgDgEAAgFQAAgNAIgJQAGgHAKAAQAJAAAFAFQAFAFAAAJQAAAHgDAHQgEAHgFAEQgHADgFAAQgGAAgEgCgAgDgQIgFAGQgDADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIAEgFIACgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_143.setTransform(226.55,279.575);

	this.shape_144 = new cjs.Shape();
	this.shape_144.graphics.f("#F1E8DE").s().p("AgOAUQgGgEAAgJIAIAAIABAGIAEAEQADABAEAAQAEAAADgCQADgCAAgDQAAAAAAgBQAAAAgBgBQAAAAAAgBQgBAAAAgBQgCgCgGgCIgHgDIgEgEQgCgDAAgDQAAgGAEgEQAFgDAHAAQAJAAAEAEQAFAEAAAGIgIABQAAgEgDgDQgDgCgFAAQgDAAgCACQgBAAAAABQgBAAAAAAQAAABgBABQAAAAAAABQAAAAAAABQAAAAABABQAAAAAAABQABAAAAABIAGADQAJAEADABQAEAEAAAFQAAAEgDADQgCADgEACQgEACgFAAQgIAAgGgEg");
	this.shape_144.setTransform(221.825,279.575);

	this.shape_145 = new cjs.Shape();
	this.shape_145.graphics.f("#F1E8DE").s().p("AgQAYIAJguIAHAAIgBAKQACgGAEgCQADgDAEAAIAFACIgDAHQAAAAgBAAQAAgBgBAAQAAAAgBAAQgBAAAAAAQgEAAgFAEQgDAFgDALIgEATg");
	this.shape_145.setTransform(218.425,279.525);

	this.shape_146 = new cjs.Shape();
	this.shape_146.graphics.f("#F1E8DE").s().p("AgSAVQgDgDAAgFIABgKIAGgaIAIAAIgGAdIgBAGQAAAAAAABQAAAAAAABQABAAAAABQAAAAABABQAAAAABAAQAAABABAAQAAAAABAAQAAAAABAAQAEAAADgBIAEgFQADgCABgEIACgIIAEgUIAIAAIgJAuIgIAAIACgJQgHAKgJAAQgFAAgEgDg");
	this.shape_146.setTransform(214.175,279.625);

	this.shape_147 = new cjs.Shape();
	this.shape_147.graphics.f("#F1E8DE").s().p("AgPATQgEgFgBgIQABgHADgHQACgIAHgEQAFgDAGAAQAHAAAFAEQAEAEABAHIgJABQABgFgDgCQgDgDgEAAQgDAAgEADQgEADgBAGQgDAFAAAGQAAAGADADQADADADAAQADAAAEgDQAEgDACgGIAIABQgEAJgFAEQgFAEgHAAQgHAAgFgFg");
	this.shape_147.setTransform(209.45,279.575);

	this.shape_148 = new cjs.Shape();
	this.shape_148.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgFAAgFQAAgHAEgHQADgHAGgEQAGgDAFAAQAJAAAFAFQAFAFAAAJIgBAGIghAAIgBACQAAAHADADQADAEAFAAQADAAAEgDQAEgDACgFIAIABQgCAGgGAFQgGAFgHAAQgFAAgFgCgAgFgOQgEAEgCAHIAZAAIAAgCQAAgGgDgDQgDgDgFAAQgEAAgEADg");
	this.shape_148.setTransform(202.025,279.575);

	this.shape_149 = new cjs.Shape();
	this.shape_149.graphics.f("#F1E8DE").s().p("AgOAUQgGgEAAgJIAIAAIABAGIAEAEQADABAEAAQAEAAADgCQADgCAAgDQAAAAAAgBQgBAAAAgBQAAAAAAgBQgBAAAAgBQgCgCgGgCIgHgDIgEgEQgCgDAAgDQAAgGAEgEQAFgDAHAAQAJAAAEAEQAFAEAAAGIgIABQAAgEgDgDQgDgCgFAAQgDAAgCACQgBAAAAABQgBAAAAAAQAAABgBABQAAAAAAABQAAAAAAABQAAAAABABQAAAAAAABQABAAAAABIAGADQAJAEADABQAEAEAAAFQAAAEgDADQgCADgEACQgEACgFAAQgIAAgGgEg");
	this.shape_149.setTransform(197.325,279.575);

	this.shape_150 = new cjs.Shape();
	this.shape_150.graphics.f("#F1E8DE").s().p("AgSAVQgDgDAAgFIABgKIAGgaIAIAAIgGAdIgBAGQAAAAAAABQAAAAAAABQAAAAABABQAAAAABABQAAAAABAAQAAABABAAQAAAAABAAQAAAAABAAQAEAAADgBIAEgFQADgCABgEIACgIIAEgUIAIAAIgJAuIgIAAIACgJQgHAKgJAAQgFAAgEgDg");
	this.shape_150.setTransform(192.675,279.625);

	this.shape_151 = new cjs.Shape();
	this.shape_151.graphics.f("#F1E8DE").s().p("AgMAWQgFgCgCgFQgCgEAAgFQAAgNAIgJQAHgHAKAAQAIAAAFAFQAFAFAAAJQAAAHgDAHQgDAHgHAEQgGADgFAAQgFAAgFgCgAgDgQIgGAGQgCADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIAEgFIACgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_151.setTransform(187.55,279.575);

	this.shape_152 = new cjs.Shape();
	this.shape_152.graphics.f("#F1E8DE").s().p("AAUAYIAHgeIAAgGQAAAAAAgBQAAAAAAgBQgBAAAAAAQAAgBAAAAIgFgBQgDAAgDACQgFACgBADQgCAEgCAGIgFAXIgHAAIAHgfIAAgEQAAgBAAAAQAAgBAAAAQAAgBAAAAQgBgBAAAAIgEgBQgDAAgDACQgFACgBAEQgDAEgCAGIgEAWIgIAAIAJguIAJAAIgCAIQAFgFADgCQADgCAFAAQADAAADACQADADABAEQADgFAEgCQAEgCAFAAQAGAAACADQADADAAAFIgBAHIgGAdg");
	this.shape_152.setTransform(181.3,279.525);

	this.shape_153 = new cjs.Shape();
	this.shape_153.graphics.f("#F1E8DE").s().p("AAHAgIgJgYIgJAJIgDAPIgIAAIANg/IAIAAIgJAnIAXgVIAKAAIgTAQIALAdg");
	this.shape_153.setTransform(173.15,278.675);

	this.shape_154 = new cjs.Shape();
	this.shape_154.graphics.f("#F1E8DE").s().p("AgOATQgGgFAAgIQAAgHADgHQAEgIAFgEQAGgDAGAAQAHAAAFAEQAFAEAAAHIgIABQAAgFgDgCQgCgDgEAAQgFAAgDADQgEADgCAGQgBAFAAAGQgBAGADADQADADAEAAQACAAAEgDQADgDACgGIAIABQgDAJgFAEQgGAEgFAAQgIAAgEgFg");
	this.shape_154.setTransform(168.55,279.575);

	this.shape_155 = new cjs.Shape();
	this.shape_155.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgEAAgFQAAgNAIgJQAGgHAKAAQAJAAAFAFQAFAFAAAJQAAAHgDAHQgEAHgFAEQgHADgFAAQgFAAgFgCgAgDgQIgFAGQgDADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIADgFIADgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_155.setTransform(163.65,279.575);

	this.shape_156 = new cjs.Shape();
	this.shape_156.graphics.f("#F1E8DE").s().p("AgKAgIANg/IAIAAIgNA/g");
	this.shape_156.setTransform(160.325,278.675);

	this.shape_157 = new cjs.Shape();
	this.shape_157.graphics.f("#F1E8DE").s().p("AAHAYIAGgdIABgGQAAgBAAAAQAAgBAAAAQAAgBgBAAQAAgBAAAAQgBAAAAAAQgBgBAAAAQgBAAAAAAQgBAAgBAAQgGAAgEAEQgFAEgCAKIgEAWIgIAAIAJguIAIAAIgCAIQAFgFADgCQAEgCAEAAQAGAAADADQADADAAAFIgBAIIgGAcg");
	this.shape_157.setTransform(156.525,279.525);

	this.shape_158 = new cjs.Shape();
	this.shape_158.graphics.f("#F1E8DE").s().p("AgSAVQgDgDAAgFIABgKIAGgaIAIAAIgGAdIgBAGQAAAAAAABQAAAAAAABQABAAAAABQAAAAABABQAAAAABAAQAAABABAAQAAAAABAAQABAAAAAAQAEAAADgBIAEgFQADgCABgEIACgIIAEgUIAIAAIgJAuIgIAAIACgJQgHAKgJAAQgFAAgEgDg");
	this.shape_158.setTransform(151.775,279.625);

	this.shape_159 = new cjs.Shape();
	this.shape_159.graphics.f("#F1E8DE").s().p("AgUAhIAihBIAHAAIgiBBg");
	this.shape_159.setTransform(145.625,278.675);

	this.shape_160 = new cjs.Shape();
	this.shape_160.graphics.f("#F1E8DE").s().p("AAHAgIgIgYIgKAJIgEAPIgHAAIANg/IAIAAIgJAnIAXgVIALAAIgUAQIAMAdg");
	this.shape_160.setTransform(139.65,278.675);

	this.shape_161 = new cjs.Shape();
	this.shape_161.graphics.f("#F1E8DE").s().p("AgPATQgEgFAAgIQAAgHACgHQAEgIAFgEQAGgDAGAAQAIAAAEAEQAFAEgBAHIgIABQAAgFgCgCQgDgDgEAAQgEAAgDADQgDADgCAGQgCAFAAAGQAAAGACADQADADAEAAQADAAADgDQADgDACgGIAJABQgDAJgGAEQgGAEgFAAQgIAAgFgFg");
	this.shape_161.setTransform(135.05,279.575);

	this.shape_162 = new cjs.Shape();
	this.shape_162.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgDgFQgCgEAAgFQAAgNAIgJQAGgHAKAAQAJAAAFAFQAFAFAAAJQAAAHgDAHQgEAHgFAEQgHADgFAAQgGAAgEgCgAgDgQIgFAGQgDADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIAEgFIACgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_162.setTransform(130.15,279.575);

	this.shape_163 = new cjs.Shape();
	this.shape_163.graphics.f("#F1E8DE").s().p("AgKAgIANg/IAIAAIgNA/g");
	this.shape_163.setTransform(126.825,278.675);

	this.shape_164 = new cjs.Shape();
	this.shape_164.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgEAAgFQAAgNAIgJQAHgHAJAAQAJAAAFAFQAFAFAAAJQAAAHgDAHQgEAHgGAEQgFADgGAAQgGAAgEgCgAgDgQIgGAGQgCADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIADgFIADgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_164.setTransform(120.65,279.575);

	this.shape_165 = new cjs.Shape();
	this.shape_165.graphics.f("#F1E8DE").s().p("AgJAeQgCgCAAgDIABgHIAGgaIgHAAIACgGIAGAAIADgMIAIgFIgEARIAIAAIgBAGIgIAAIgFAZIgBAFIABADIACAAIAEAAIgBAGIgFABQgEAAgDgCg");
	this.shape_165.setTransform(117.2,278.775);

	this.shape_166 = new cjs.Shape();
	this.shape_166.graphics.f("#F1E8DE").s().p("AgMAEIACgHIAXAAIgBAHg");
	this.shape_166.setTransform(111.7,279.55);

	this.instance_1 = new lib.button();
	this.instance_1.parent = this;
	this.instance_1.setTransform(88,272,0.2154,0.2153);

	this.instance_2 = new lib.button();
	this.instance_2.parent = this;
	this.instance_2.setTransform(88,253,0.2154,0.2153);

	this.instance_3 = new lib.button();
	this.instance_3.parent = this;
	this.instance_3.setTransform(191,229,0.2154,0.2153);

	this.instance_4 = new lib.button();
	this.instance_4.parent = this;
	this.instance_4.setTransform(159,229,0.2154,0.2153);

	this.instance_5 = new lib.button();
	this.instance_5.parent = this;
	this.instance_5.setTransform(175,229,0.2154,0.2153);

	this.instance_6 = new lib.button();
	this.instance_6.parent = this;
	this.instance_6.setTransform(175,213,0.2154,0.2153);

	this.instance_7 = new lib.button();
	this.instance_7.parent = this;
	this.instance_7.setTransform(120,229,0.2154,0.2153);

	this.instance_8 = new lib.button();
	this.instance_8.parent = this;
	this.instance_8.setTransform(88,229,0.2154,0.2153);

	this.instance_9 = new lib.button();
	this.instance_9.parent = this;
	this.instance_9.setTransform(104,229,0.2154,0.2153);

	this.shape_167 = new cjs.Shape();
	this.shape_167.graphics.f("#F1E8DE").s().p("AgFAFIACgIIAIAAIgCAIg");
	this.shape_167.setTransform(200.55,262.25);

	this.shape_168 = new cjs.Shape();
	this.shape_168.graphics.f("#F1E8DE").s().p("AAHAYIAGgdIABgGQAAgBAAAAQAAgBAAAAQAAgBgBAAQAAgBAAAAQgBAAAAAAQgBgBAAAAQgBAAAAAAQgBAAgBAAQgGAAgEAEQgFAEgCAKIgEAWIgIAAIAJguIAIAAIgCAIQAFgFADgCQAEgCAEAAQAGAAADADQADADAAAFIgBAIIgGAcg");
	this.shape_168.setTransform(197.025,260.325);

	this.shape_169 = new cjs.Shape();
	this.shape_169.graphics.f("#F1E8DE").s().p("AgMAWQgFgCgCgFQgCgEAAgFQAAgNAIgJQAHgHAKAAQAIAAAFAFQAFAFAAAJQAAAHgDAHQgDAHgGAEQgHADgFAAQgGAAgEgCgAgDgQIgGAGQgCADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIAEgFIACgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_169.setTransform(192.15,260.375);

	this.shape_170 = new cjs.Shape();
	this.shape_170.graphics.f("#F1E8DE").s().p("AgXAhIANhAIAHAAIgBAHQAEgFADgBQADgCADAAQAHAAAFAFQADAFAAAJQAAAHgCAGQgCAFgEAEQgDADgEACIgHACQgHAAgFgJIgFAagAABgYIgEAFQgCADgBAFIgBAIIAAAGQABADACACQADABADAAQAGAAAEgHQAFgHAAgIQAAgGgDgDQgDgEgEAAQgDAAgDACg");
	this.shape_170.setTransform(186.85,261.225);

	this.shape_171 = new cjs.Shape();
	this.shape_171.graphics.f("#F1E8DE").s().p("AgRAVQgEgEAAgGQAAgEACgDQACgDADgBIAHgDIAJAAQAIgBADgBIABgFQAAgBAAgBQgBAAAAgBQAAAAAAgBQgBAAAAgBQgDgCgFAAQgEAAgEACQgDACgBAFIgIgBQACgHAGgEQAFgDAHAAQAJAAAFAEQAEADAAAFIgBAIIgDALIgBAJIABAGIgIAAIgBgGQgEAEgEACIgHABQgHAAgEgDgAAIABIgGAAIgJACIgEADIgCAFQAAADACACQADACAEAAQAEAAADgCQADgCACgEQACgDACgHIgEABg");
	this.shape_171.setTransform(182.075,260.375);

	this.shape_172 = new cjs.Shape();
	this.shape_172.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgFAAgFQAAgHAEgHQADgHAGgEQAGgDAFAAQAJAAAFAFQAFAFAAAJIgBAGIghAAIgBACQAAAHADADQADAEAFAAQADAAAEgDQAEgDACgFIAIABQgCAGgGAFQgGAFgHAAQgFAAgFgCgAgFgOQgEAEgCAHIAZAAIAAgCQAAgGgDgDQgDgDgFAAQgEAAgEADg");
	this.shape_172.setTransform(177.125,260.375);

	this.shape_173 = new cjs.Shape();
	this.shape_173.graphics.f("#F1E8DE").s().p("AAAAXIAAgaIAAgKIgFAKIgMAaIgJAAIgFgtIAIAAIACAVIABAKIABAGIACgHIACgHIALgXIAIAAIACAWIABAOIAGgPIALgVIAHAAIgWAtg");
	this.shape_173.setTransform(171.85,260.375);

	this.shape_174 = new cjs.Shape();
	this.shape_174.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgFAAgFQAAgHAEgHQADgHAGgEQAGgDAFAAQAJAAAFAFQAFAFAAAJIgBAGIghAAIgBACQAAAHADADQADAEAFAAQADAAAEgDQAEgDACgFIAIABQgCAGgGAFQgGAFgHAAQgFAAgFgCgAgFgOQgEAEgCAHIAZAAIAAgCQAAgGgDgDQgDgDgFAAQgEAAgEADg");
	this.shape_174.setTransform(163.125,260.375);

	this.shape_175 = new cjs.Shape();
	this.shape_175.graphics.f("#F1E8DE").s().p("AAHAgIAGgcIABgHQAAAAAAgBQAAAAAAgBQAAAAgBgBQAAAAAAAAQgBgBAAAAQgBAAAAAAQgBgBAAAAQgBAAgBAAQgEAAgEACQgDADgCADQgCADgCAJIgEAUIgIAAIANg/IAIAAIgFAZQAEgFADgCIAIgBQAGAAADADQADADAAAFIgBAIIgGAbg");
	this.shape_175.setTransform(158.025,259.475);

	this.shape_176 = new cjs.Shape();
	this.shape_176.graphics.f("#F1E8DE").s().p("AgJAeQgCgCAAgDIABgHIAGgaIgHAAIACgGIAGAAIACgMIAIgFIgDARIAIAAIgBAGIgIAAIgFAZIgBAFIABADIACAAIAFAAIgBAGIgGABQgEAAgDgCg");
	this.shape_176.setTransform(154.7,259.575);

	this.shape_177 = new cjs.Shape();
	this.shape_177.graphics.f("#F1E8DE").s().p("AgTAcQgFgFAAgJQAAgJAEgGQADgHAGgDQAFgEAFAAQAIAAAEAIIAGgZIAIAAIgOBAIgHAAIABgHQgGAIgHAAQgHAAgEgFgAgFgHIgFAEIgEAHIgCAIIABAIQABADADACQACABADAAQAGAAADgFQAGgIAAgLQAAgEgDgDQgDgDgDAAIgFABg");
	this.shape_177.setTransform(148.425,259.525);

	this.shape_178 = new cjs.Shape();
	this.shape_178.graphics.f("#F1E8DE").s().p("AgRAVQgEgEAAgGQAAgEACgDQACgDADgBIAHgDIAJAAQAIgBADgBIABgFQAAgBAAgBQAAAAgBgBQAAAAAAgBQgBAAAAgBQgDgCgFAAQgEAAgEACQgDACgBAFIgIgBQACgHAGgEQAFgDAHAAQAJAAAFAEQAEADAAAFIgBAIIgDALIgBAJIABAGIgIAAIgBgGQgEAEgEACIgHABQgHAAgEgDgAAIABIgGAAIgJACIgEADIgCAFQAAADACACQADACAEAAQAEAAADgCQADgCACgEQACgDACgHIgEABg");
	this.shape_178.setTransform(143.075,260.375);

	this.shape_179 = new cjs.Shape();
	this.shape_179.graphics.f("#F1E8DE").s().p("AgMAWQgFgCgCgFQgCgEAAgFQAAgNAIgJQAHgHAKAAQAIAAAFAFQAFAFAAAJQAAAHgDAHQgDAHgGAEQgHADgFAAQgGAAgEgCgAgDgQIgGAGQgCADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIAEgFIACgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_179.setTransform(138.15,260.375);

	this.shape_180 = new cjs.Shape();
	this.shape_180.graphics.f("#F1E8DE").s().p("AgKAgIANg/IAIAAIgNA/g");
	this.shape_180.setTransform(134.825,259.475);

	this.shape_181 = new cjs.Shape();
	this.shape_181.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgFAAgFQAAgHAEgHQADgHAGgEQAGgDAFAAQAJAAAFAFQAFAFAAAJIgBAGIghAAIgBACQAAAHADADQADAEAFAAQADAAAEgDQAEgDACgFIAIABQgCAGgGAFQgGAFgHAAQgFAAgFgCgAgFgOQgEAEgCAHIAZAAIAAgCQAAgGgDgDQgDgDgFAAQgEAAgEADg");
	this.shape_181.setTransform(131.125,260.375);

	this.shape_182 = new cjs.Shape();
	this.shape_182.graphics.f("#F1E8DE").s().p("AgQAYIAJguIAHAAIgBAKQACgGAEgCQADgDAEAAIAFACIgDAHQAAAAgBAAQAAgBgBAAQAAAAgBAAQgBAAAAAAQgEAAgFAEQgDAFgDALIgEATg");
	this.shape_182.setTransform(127.525,260.325);

	this.shape_183 = new cjs.Shape();
	this.shape_183.graphics.f("#F1E8DE").s().p("AgMAWQgEgCgCgFQgDgEAAgFQAAgNAIgJQAHgHAJAAQAJAAAFAFQAFAFAAAJQAAAHgDAHQgEAHgGAEQgFADgGAAQgGAAgEgCgAgDgQIgGAGQgCADgBAFIgBAHQAAAGADAEQADADAFAAIAEgBIAFgDIADgFIADgGIABgHQAAgGgDgEQgDgDgFAAIgGABg");
	this.shape_183.setTransform(120.65,260.375);

	this.shape_184 = new cjs.Shape();
	this.shape_184.graphics.f("#F1E8DE").s().p("AgJAeQgCgCAAgDIABgHIAGgaIgHAAIACgGIAGAAIADgMIAIgFIgEARIAIAAIgBAGIgIAAIgFAZIgBAFIABADIACAAIAEAAIgBAGIgFABQgEAAgDgCg");
	this.shape_184.setTransform(117.2,259.575);

	this.shape_185 = new cjs.Shape();
	this.shape_185.graphics.f("#F1E8DE").s().p("AgMAEIACgHIAXAAIgBAHg");
	this.shape_185.setTransform(111.7,260.35);

	this.shape_186 = new cjs.Shape();
	this.shape_186.graphics.f("#F1E8DE").s().p("AgFAFIACgJIAJAAIgDAJg");
	this.shape_186.setTransform(313.6,236.9);

	this.shape_187 = new cjs.Shape();
	this.shape_187.graphics.f("#F1E8DE").s().p("AgSAbIAKg0IAIAAIgCALQADgGAEgDQAEgCAEAAIAGABIgDAIIgFgBQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_187.setTransform(311.675,234.75);

	this.shape_188 = new cjs.Shape();
	this.shape_188.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgGAAgGQAAgHAEgJQAEgHAHgEQAFgEAHAAQAJAAAGAFQAFAGAAALIgBAHIglAAIAAACQAAAHAEAEQADAEAEAAQAEAAAEgDQAFgDACgGIAJABQgCAGgHAHQgGAFgJAAQgFAAgFgDgAgGgPQgEADgDAJIAdAAIAAgCQAAgHgEgDQgDgEgFAAQgFAAgFAEg");
	this.shape_188.setTransform(306.75,234.8);

	this.shape_189 = new cjs.Shape();
	this.shape_189.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_189.setTransform(302.925,233.925);

	this.shape_190 = new cjs.Shape();
	this.shape_190.graphics.f("#F1E8DE").s().p("AgQAWQgGgGAAgKQAAgHAEgJQADgHAGgEQAHgFAHAAQAIAAAFAFQAFAEAAAIIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEAEQgEADgCAHQgDAGAAAGQAAAHADADQADAEAEAAQAEAAAEgEQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgFg");
	this.shape_190.setTransform(298.875,234.8);

	this.shape_191 = new cjs.Shape();
	this.shape_191.graphics.f("#F1E8DE").s().p("AgSAXQgFgEAAgHQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAAEgBIABgGQAAgDgDgDQgDgCgGAAQgFAAgDACQgEADgBAEIgJAAQADgIAGgEQAGgEAHAAQAKAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgGIgJAFIgIACQgIAAgDgEgAAJABIgHABIgKACQgDAAgCADQgCACAAADQAAADAEADQACADAEAAQAFAAADgDQAEgCACgEQADgFABgHIgEABg");
	this.shape_191.setTransform(293.35,234.8);

	this.shape_192 = new cjs.Shape();
	this.shape_192.graphics.f("#F1E8DE").s().p("AgSAbIAKg0IAIAAIgCALQADgGAEgDQAEgCAEAAIAGABIgDAIIgFgBQgFAAgFAFQgEAFgDAMIgEAWg");
	this.shape_192.setTransform(289.425,234.75);

	this.shape_193 = new cjs.Shape();
	this.shape_193.graphics.f("#F1E8DE").s().p("AgSAXQgFgEAAgHQAAgEACgDQACgEADgBIAIgDIAKgBQAJAAAEgBIABgGQgBgDgCgDQgDgCgGAAQgEAAgEACQgDADgCAEIgJAAQADgIAGgEQAFgEAJAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgGIgJAFIgIACQgIAAgDgEgAAJABIgHABIgKACQgDAAgBADQgDACAAADQAAADAEADQACADAEAAQAFAAADgDQAEgCACgEQACgFACgHIgEABg");
	this.shape_193.setTransform(284.45,234.8);

	this.shape_194 = new cjs.Shape();
	this.shape_194.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_194.setTransform(278.875,233.825);

	this.shape_195 = new cjs.Shape();
	this.shape_195.graphics.f("#F1E8DE").s().p("AgQAWQgGgGAAgKQAAgHAEgJQADgHAGgEQAHgFAHAAQAIAAAFAFQAFAEAAAIIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEAEQgEADgCAHQgDAGAAAGQAAAHADADQADAEAEAAQAEAAAEgEQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgFg");
	this.shape_195.setTransform(273.875,234.8);

	this.shape_196 = new cjs.Shape();
	this.shape_196.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgGAAgGQAAgHAEgJQAEgHAHgEQAFgEAHAAQAJAAAGAFQAFAGAAALIgBAHIglAAIAAACQAAAHADAEQAEAEAEAAQAEAAAEgDQAFgDADgGIAIABQgCAGgGAHQgHAFgJAAQgFAAgFgDgAgFgPQgFADgDAJIAdAAIAAgCQAAgHgDgDQgEgEgFAAQgFAAgEAEg");
	this.shape_196.setTransform(265.6,234.8);

	this.shape_197 = new cjs.Shape();
	this.shape_197.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_197.setTransform(259.975,233.825);

	this.shape_198 = new cjs.Shape();
	this.shape_198.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_198.setTransform(256.225,233.925);

	this.shape_199 = new cjs.Shape();
	this.shape_199.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgCgFQgDgGAAgGQAAgHAEgJQAEgHAGgEQAGgEAHAAQAJAAAFAFQAGAGAAALIAAAHIgmAAIAAACQAAAHAEAEQADAEAFAAQADAAAFgDQAEgDACgGIAJABQgCAGgHAHQgGAFgIAAQgGAAgFgDgAgGgPQgEADgCAJIAcAAIAAgCQAAgHgEgDQgDgEgFAAQgEAAgGAEg");
	this.shape_199.setTransform(248.9,234.8);

	this.shape_200 = new cjs.Shape();
	this.shape_200.graphics.f("#F1E8DE").s().p("AgPAaIgIgzIAIAAIAFAcIACAPIAGgNIAQgeIAKAAIgdAzg");
	this.shape_200.setTransform(244.2,234.8);

	this.shape_201 = new cjs.Shape();
	this.shape_201.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgEAAgHQAAgOAJgKQAGgIAMAAQAJAAAGAGQAFAFAAALQAAAHgDAJQgEAHgGAEQgHAEgGAAQgGAAgFgDgAgDgRIgHAGIgDAIIgCAIQAAAIADADQAFAFAFAAIAFgCIAEgEIAFgEIACgHIACgIQAAgIgEgDQgEgEgEAAQgEAAgDACg");
	this.shape_201.setTransform(238.4,234.8);

	this.shape_202 = new cjs.Shape();
	this.shape_202.graphics.f("#F1E8DE").s().p("AAWAbIAHgiIABgGQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAgBgBAAQgCgBgCAAQgEAAgEACQgEADgDAEQgCADgBAHIgGAaIgIAAIAIgiIAAgGQAAAAAAgBQAAAAAAgBQAAAAgBgBQAAAAAAAAQgBgBAAAAQgBgBAAAAQgBAAAAAAQgBAAgBAAQgDAAgEACQgEADgDAEQgDAEgCAHIgEAZIgJAAIAKg0IAKAAIgCAJQAEgGAFgCQAEgBAEAAQAEgBADADQADADABAEQAEgEAEgDQAFgDAFABQAGAAADACQAEADAAAGIgCAIIgGAhg");
	this.shape_202.setTransform(231.45,234.75);

	this.shape_203 = new cjs.Shape();
	this.shape_203.graphics.f("#F1E8DE").s().p("AgOAYQgFgCgCgFQgCgEgBgHQABgOAIgKQAHgIALAAQAKAAAGAGQAGAFAAALQAAAHgEAJQgDAHgIAEQgGAEgGAAQgGAAgGgDgAgEgRIgFAGIgFAIIgBAIQAAAIAEADQADAFAGAAIAEgCIAGgEIADgEIAEgHIABgIQAAgIgEgDQgDgEgGAAQgDAAgEACg");
	this.shape_203.setTransform(221.8,234.8);

	this.shape_204 = new cjs.Shape();
	this.shape_204.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_204.setTransform(217.925,233.925);

	this.shape_205 = new cjs.Shape();
	this.shape_205.graphics.f("#F1E8DE").s().p("AgQAXQgGgFAAgJIAJgBIABAGQACADACABQADACAFAAQAEAAADgCQADgDABgDQAAAAgBgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgEgCgBgDQgBgDAAgDQAAgGAEgEQAFgFAIAAQAJAAAGAFQAFAEAAAIIgIAAQgBgFgDgDQgDgCgFAAQgEAAgDACQgCACAAADQAAAAAAABQAAAAAAABQAAAAABABQAAAAABABIAHADQAJAFADABQAFAFAAAFQAAAEgDAEQgDADgEADQgFACgGAAQgIAAgHgEg");
	this.shape_205.setTransform(335.15,223.7);

	this.shape_206 = new cjs.Shape();
	this.shape_206.graphics.f("#F1E8DE").s().p("AgbAkIABgJIAFABIAEgBQADgCACgEIADgGIgJgyIAJAAIADAaIACAOIAXgoIAJAAIggA5QgEAJgFADQgDACgFABIgGgBg");
	this.shape_206.setTransform(330.25,224.75);

	this.shape_207 = new cjs.Shape();
	this.shape_207.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAGQAGAGAAAJIgBAHIgkAAIgBADQAAAIADADQAEAEAEAAQAEAAAFgDQAEgDADgFIAIAAQgCAHgGAFQgHAGgJAAQgFAAgFgCgAgFgPQgFADgCAJIAcAAIAAgDQAAgGgDgEQgEgDgFAAQgEAAgFAEg");
	this.shape_207.setTransform(324.8,223.7);

	this.shape_208 = new cjs.Shape();
	this.shape_208.graphics.f("#F1E8DE").s().p("AAHAkIgJgbIgKAJIgEASIgJAAIAPhHIAIAAIgJAsIAZgYIAMAAIgWASIANAhg");
	this.shape_208.setTransform(319.85,222.725);

	this.shape_209 = new cjs.Shape();
	this.shape_209.graphics.f("#F1E8DE").s().p("AAAAaIgBgdIAAgMIgFAMIgNAdIgKAAIgFgzIAJAAIACAYIABALIAAAHIADgIIADgIIAMgaIAJAAIACAZIAAAQIAIgRIALgYIAJAAIgZAzg");
	this.shape_209.setTransform(311.175,223.7);

	this.shape_210 = new cjs.Shape();
	this.shape_210.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgDgEABgGQgBgPAKgKQAGgIALAAQAKAAAGAGQAGAGgBAJQABAJgEAHQgEAIgGAEQgHAEgHAAQgGAAgEgCgAgEgRIgGAGIgDAJIgCAIQAAAHADAEQAEADAFAAIAGgBIAEgDIAFgGIACgGIACgJQAAgGgEgFQgEgDgFAAQgDAAgEACg");
	this.shape_210.setTransform(304.3,223.7);

	this.shape_211 = new cjs.Shape();
	this.shape_211.graphics.f("#F1E8DE").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAVg");
	this.shape_211.setTransform(300.275,223.65);

	this.shape_212 = new cjs.Shape();
	this.shape_212.graphics.f("#F1E8DE").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAVg");
	this.shape_212.setTransform(296.925,223.65);

	this.shape_213 = new cjs.Shape();
	this.shape_213.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAADgCIABgFQAAgEgCgCQgDgCgGAAQgEAAgEACQgDADgCAFIgJgBQADgIAFgEQAHgEAIAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIACAHIgJAAIgBgHIgJAHIgIABQgHAAgFgEgAAJABIgHAAIgKACQgDACgBACQgCACAAADQAAADACADQADACAFAAQAEAAADgCQAEgDACgEQADgDABgIIgEABg");
	this.shape_213.setTransform(291.95,223.7);

	this.shape_214 = new cjs.Shape();
	this.shape_214.graphics.f("#F1E8DE").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAVg");
	this.shape_214.setTransform(285.225,223.65);

	this.shape_215 = new cjs.Shape();
	this.shape_215.graphics.f("#F1E8DE").s().p("AgNAZQgGgDgCgFQgDgEABgGQgBgPAKgKQAGgIAMAAQAJAAAGAGQAGAGgBAJQABAJgEAHQgEAIgGAEQgHAEgHAAQgFAAgFgCgAgEgRIgGAGIgDAJIgCAIQAAAHADAEQAEADAFAAIAGgBIAEgDIAFgGIACgGIACgJQAAgGgEgFQgEgDgEAAQgEAAgEACg");
	this.shape_215.setTransform(280.35,223.7);

	this.shape_216 = new cjs.Shape();
	this.shape_216.graphics.f("#F1E8DE").s().p("AggAkIAPhHIAUAAIAMABQAGACAEAEQAEAEACAFQACAGAAAHQAAAIgCAHQgDAHgEAGQgEAFgFADQgEADgHACIgLABgAgVAcIALAAQAIAAAFgCIAGgCIAHgGQADgFADgGQACgGAAgHQAAgJgDgEQgDgFgFgCIgLgBIgLAAg");
	this.shape_216.setTransform(271.175,222.725);

	this.shape_217 = new cjs.Shape();
	this.shape_217.graphics.f("#F1E8DE").s().p("AgGAIQAGgBABgIIgFAAIACgKIAJAAIgBAIQgCAHgDAEQgDAEgEAAg");
	this.shape_217.setTransform(265.6,226.525);

	this.shape_218 = new cjs.Shape();
	this.shape_218.graphics.f("#F1E8DE").s().p("AgVAgQgIgFAAgOIAJgBIAAADQAAAEACADQACADAEACQAFACAGAAQAIAAAEgDQAFgFgBgEQAAgDgCgDQgCgDgLgFIgLgEQgFgEgCgDQgCgEAAgFQAAgFADgEQADgFAGgDQAGgCAGAAQAIAAAHADQAGADADAFQACAFAAAEIAAABIgJABIgBgEIgCgGIgHgCQgDgCgFAAQgGAAgEADQgEADAAAFQAAABAAAAQAAABAAAAQABABAAAAQAAABABAAIAEAFIALAFIALAEQAEADACAEQADAEAAAEQgBAGgEAFQgDAFgGADQgHACgHAAQgLAAgIgFg");
	this.shape_218.setTransform(261.65,222.7);

	this.shape_219 = new cjs.Shape();
	this.shape_219.graphics.f("#F1E8DE").s().p("AgGAIQAGgBABgIIgFAAIACgKIAJAAIgBAIQgCAHgDAEQgDAEgEAAg");
	this.shape_219.setTransform(256.15,226.525);

	this.shape_220 = new cjs.Shape();
	this.shape_220.graphics.f("#F1E8DE").s().p("AAXAkIgEgVIgcAAIgLAVIgLAAIAohHIALAAIAMBHgAAGgMIgLAUIAXAAIgDgRIgCgSIgHAPg");
	this.shape_220.setTransform(251.475,222.725);

	this.shape_221 = new cjs.Shape();
	this.shape_221.graphics.f("#F1E8DE").s().p("AgGAIQAGgBABgIIgFAAIACgKIAJAAIgBAIQgCAHgDAEQgDAEgEAAg");
	this.shape_221.setTransform(246.7,226.525);

	this.shape_222 = new cjs.Shape();
	this.shape_222.graphics.f("#F1E8DE").s().p("AAAAkIgBgrIgBgNIgFAKIgYAuIgKAAIgFhHIAKAAIACAjIAAANIAAAFIAAAFIAJgSIAWgoIAIAAIADApIAAARIADgHIAGgLIAUgoIAKAAIglBHg");
	this.shape_222.setTransform(242.525,222.725);

	this.shape_223 = new cjs.Shape();
	this.shape_223.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAGQAFAGAAAJIgBAHIglAAIAAADQAAAIAEADQADAEAEAAQAEAAAEgDQAFgDACgFIAJAAQgCAHgHAFQgGAGgJAAQgFAAgFgCgAgGgPQgEADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgFAEg");
	this.shape_223.setTransform(231.15,223.7);

	this.shape_224 = new cjs.Shape();
	this.shape_224.graphics.f("#F1E8DE").s().p("AgQAXQgGgFAAgJIAJgBIABAGQABADADABQADACAFAAQAFAAADgCQACgDAAgDQAAAAAAgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgEgCgBgDQgCgDAAgDQABgGAFgEQAEgFAIAAQAKAAAFAFQAFAEAAAIIgIAAQAAgFgEgDQgDgCgGAAQgDAAgDACQgCACgBADQAAAAABABQAAAAAAABQAAAAABABQAAAAABABIAGADQALAFACABQAFAFgBAFQABAEgDAEQgDADgEADQgFACgFAAQgKAAgGgEg");
	this.shape_224.setTransform(225.95,223.7);

	this.shape_225 = new cjs.Shape();
	this.shape_225.graphics.f("#F1E8DE").s().p("AgUAiQgGgDgDgFQgDgFAAgFIACgOIAJgmIAJAAIgJAsIgBAIQgBAFAFAEQAFAEAGgBQAGABAEgDQAEgDADgFQADgEACgLIAJgnIAJAAIgJAqQgCAKgEAHQgEAFgGAFQgGADgIAAQgIAAgGgCg");
	this.shape_225.setTransform(220.3,222.8);

	this.shape_226 = new cjs.Shape();
	this.shape_226.graphics.f("#F1E8DE").s().p("AgFAFIACgJIAJAAIgDAJg");
	this.shape_226.setTransform(240.95,190.1);

	this.shape_227 = new cjs.Shape();
	this.shape_227.graphics.f("#F1E8DE").s().p("AgQAXQgGgEAAgLIAJgBIABAHQACADADABQADADAEAAQAEAAAEgDQADgCAAgDQgBgBAAgBQAAAAAAgBQAAAAAAgBQgBAAAAgBQgCgCgHgDIgIgDQgDgCgCgDQgBgCgBgEQAAgGAGgEQAEgFAIAAQAJAAAGAFQAFAEAAAHIgJABQAAgFgDgDQgDgCgGAAQgDAAgDACQgCACgBADQABAAAAABQAAAAAAABQAAAAABABQAAAAABAAIAGAFQALAEACACQAEADAAAHQAAAEgCADQgCADgFADQgFACgFAAQgJAAgHgEg");
	this.shape_227.setTransform(237.45,188);

	this.shape_228 = new cjs.Shape();
	this.shape_228.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgGAAgGQAAgHAEgJQAEgHAGgEQAHgEAGAAQAJAAAFAFQAGAGAAALIgBAHIgkAAIgBACQAAAHADAEQAEAEAFAAQADAAAEgDQAFgDADgGIAIABQgCAGgGAHQgHAFgIAAQgGAAgFgDgAgFgPQgFADgCAJIAcAAIAAgCQAAgHgDgDQgEgEgFAAQgEAAgFAEg");
	this.shape_228.setTransform(232.1,188);

	this.shape_229 = new cjs.Shape();
	this.shape_229.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAHAAIgJAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_229.setTransform(228.5,187.025);

	this.shape_230 = new cjs.Shape();
	this.shape_230.graphics.f("#F1E8DE").s().p("AAWAbIAHgiIABgGQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAgBgBAAQgCgBgCAAQgEAAgEACQgFADgCAEQgCADgBAHIgGAaIgIAAIAHgiIABgGQAAAAAAgBQAAAAAAgBQAAAAgBgBQAAAAgBAAQAAgBAAAAQgBgBAAAAQgBAAAAAAQgBAAAAAAQgEAAgEACQgEADgDAEQgCAEgDAHIgEAZIgJAAIAKg0IAJAAIgBAJQAFgGAEgCQADgBAFAAQAEgBADADQADADABAEQAEgEAEgDQAFgDAFABQAGAAADACQAEADAAAGIgCAIIgGAhg");
	this.shape_230.setTransform(223,187.95);

	this.shape_231 = new cjs.Shape();
	this.shape_231.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgGAAgGQAAgHAEgJQAEgHAHgEQAFgEAHAAQAJAAAGAFQAFAGAAALIgBAHIglAAIAAACQAAAHADAEQAEAEAEAAQAEAAAEgDQAFgDACgGIAJABQgCAGgHAHQgGAFgJAAQgFAAgFgDgAgFgPQgFADgDAJIAdAAIAAgCQAAgHgEgDQgDgEgFAAQgFAAgEAEg");
	this.shape_231.setTransform(216.1,188);

	this.shape_232 = new cjs.Shape();
	this.shape_232.graphics.f("#F1E8DE").s().p("AAIAbIAHghIABgHQAAAAAAgBQgBAAAAgBQAAAAAAgBQgBAAAAAAQgCgCgDAAQgHAAgEAEQgGAGgCAKIgFAZIgJAAIALg0IAIAAIgCAKQAFgFAEgDQAEgDAFABQAGAAAEADQAEADAAAGIgCAJIgGAfg");
	this.shape_232.setTransform(210.475,187.95);

	this.shape_233 = new cjs.Shape();
	this.shape_233.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgCgFQgDgGAAgGQAAgHAEgJQAEgHAGgEQAHgEAGAAQAJAAAFAFQAGAGAAALIAAAHIglAAIgBACQAAAHADAEQAEAEAFAAQADAAAFgDQAEgDADgGIAIABQgCAGgGAHQgHAFgIAAQgGAAgFgDgAgFgPQgFADgCAJIAcAAIAAgCQAAgHgDgDQgEgEgFAAQgEAAgFAEg");
	this.shape_233.setTransform(205,188);

	this.shape_234 = new cjs.Shape();
	this.shape_234.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgGAAgGQAAgHAEgJQAEgHAGgEQAHgEAGAAQAJAAAGAFQAFAGAAALIgBAHIgkAAIgBACQAAAHADAEQAEAEAEAAQAEAAAEgDQAFgDADgGIAIABQgCAGgGAHQgHAFgJAAQgFAAgFgDgAgFgPQgFADgCAJIAcAAIAAgCQAAgHgDgDQgEgEgFAAQgFAAgEAEg");
	this.shape_234.setTransform(196.65,188);

	this.shape_235 = new cjs.Shape();
	this.shape_235.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_235.setTransform(191.025,187.025);

	this.shape_236 = new cjs.Shape();
	this.shape_236.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_236.setTransform(187.275,187.125);

	this.shape_237 = new cjs.Shape();
	this.shape_237.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_237.setTransform(181.675,187.125);

	this.shape_238 = new cjs.Shape();
	this.shape_238.graphics.f("#F1E8DE").s().p("AgNAYQgFgCgDgFQgCgEAAgHQAAgOAJgKQAGgIAMAAQAJAAAGAGQAFAFAAALQAAAHgDAJQgEAHgGAEQgHAEgHAAQgFAAgFgDgAgDgRIgHAFIgDAJIgCAJQAAAHADADQAFAFAEAAIAGgCIAEgEIAFgEIACgHIACgIQAAgIgEgDQgEgEgEAAQgEAAgDACg");
	this.shape_238.setTransform(177.2,188);

	this.shape_239 = new cjs.Shape();
	this.shape_239.graphics.f("#F1E8DE").s().p("AgOAYQgEgCgDgFQgCgEgBgHQAAgOAJgKQAIgIAKAAQAKAAAGAGQAGAFgBALQAAAHgDAJQgEAHgGAEQgHAEgHAAQgGAAgFgDgAgEgRIgFAFIgFAJIgBAJQAAAHADADQAFAFAEAAIAFgCIAGgEIAEgEIACgHIACgIQAAgIgEgDQgEgEgFAAQgDAAgEACg");
	this.shape_239.setTransform(171.65,188);

	this.shape_240 = new cjs.Shape();
	this.shape_240.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBgBQAAAAAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_240.setTransform(165.975,187.025);

	this.shape_241 = new cjs.Shape();
	this.shape_241.graphics.f("#F1E8DE").s().p("AgQAXQgGgEAAgLIAJgBIABAHQACADADABQADADAEAAQAFAAADgDQADgCAAgDQAAgBgBgBQAAAAAAgBQAAAAAAgBQgBAAAAgBQgCgCgHgDIgIgDQgDgCgCgDQgBgCAAgEQgBgGAGgEQAEgFAIAAQAJAAAGAFQAFAEAAAHIgJABQABgFgEgDQgDgCgGAAQgDAAgDACQgDACABADQAAAAAAABQAAAAAAABQAAAAABABQAAAAABAAIAGAFQALAEACACQAEADABAHQgBAEgCADQgCADgFADQgFACgFAAQgJAAgHgEg");
	this.shape_241.setTransform(160.85,188);

	this.shape_242 = new cjs.Shape();
	this.shape_242.graphics.f("#F1E8DE").s().p("AgWAfQgEgFAAgLQAAgJADgHQAEgIAGgEQAGgEAGAAQAIAAAFAKIAGgcIAJAAIgPBGIgIAAIACgHQgHAIgIAAQgIAAgFgFgAgGgIQgDABgDAEQgCADgCAEQgCAGAAAEIABAIQABADADACQADACADAAQAGAAAEgGQAHgIAAgMQAAgGgEgDQgDgEgEAAQgDAAgCACg");
	this.shape_242.setTransform(153.075,187.075);

	this.shape_243 = new cjs.Shape();
	this.shape_243.graphics.f("#F1E8DE").s().p("AAIAbIAHghIABgHQAAAAAAgBQAAAAgBgBQAAAAAAgBQgBAAAAAAQgCgCgDAAQgHAAgEAEQgGAGgCAKIgFAZIgJAAIALg0IAIAAIgCAKQAFgFAEgDQAEgDAFABQAGAAAEADQAEADAAAGIgCAJIgGAfg");
	this.shape_243.setTransform(147.075,187.95);

	this.shape_244 = new cjs.Shape();
	this.shape_244.graphics.f("#F1E8DE").s().p("AgTAXQgEgEAAgHQAAgEACgDQACgEADgBIAIgDIALgBQAIAAAEgBIAAgHQAAgCgCgDQgDgCgGAAQgFAAgDACQgDADgCAEIgJAAQADgIAFgEQAHgEAIAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgGIgJAFIgIACQgIAAgEgEgAAJABIgHABIgKACQgDAAgBADQgCACAAADQAAADADADQACADAFAAQAEAAADgDQAEgCACgEQACgFACgHIgEABg");
	this.shape_244.setTransform(141.55,188);

	this.shape_245 = new cjs.Shape();
	this.shape_245.graphics.f("#F1E8DE").s().p("AAWAaIAHghIABgGQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAgBgBAAQgCgCgCAAQgEAAgFADQgEACgCAEQgCAFgBAHIgGAYIgIAAIAHghIABgFQAAgBAAgBQAAAAAAgBQAAAAgBgBQAAAAAAAAQgBgBAAAAQgBgBAAAAQgBAAAAAAQgBgBAAAAQgEAAgEADQgEADgDAEQgCAEgDAHIgEAYIgJAAIAKgyIAJAAIgBAIQAFgFAEgCQADgCAFAAQAEAAADACQADADABAEQAEgEAEgDQAFgCAFAAQAGAAADADQAEADAAAFIgCAIIgGAgg");
	this.shape_245.setTransform(298.6,176.85);

	this.shape_246 = new cjs.Shape();
	this.shape_246.graphics.f("#F1E8DE").s().p("AgLAkIALgzIAHAAIgJAzgAABgZIACgKIAJAAIgDAKg");
	this.shape_246.setTransform(293.65,175.925);

	this.shape_247 = new cjs.Shape();
	this.shape_247.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAADgCIABgFQAAgEgCgCQgDgCgGAAQgFAAgDACQgEADgBAFIgJgBQACgIAGgEQAGgEAIAAQAKAAAGAFQAEADAAAGIgBAJIgDAMIgBAKIABAHIgJAAIgBgHIgJAHIgIABQgHAAgFgEgAAJABIgHAAIgKACQgDACgCACQgBACAAADQAAADACADQADACAEAAQAFAAADgCQAEgDADgEQABgDACgIIgEABg");
	this.shape_247.setTransform(289.45,176.9);

	this.shape_248 = new cjs.Shape();
	this.shape_248.graphics.f("#F1E8DE").s().p("AgGAIQAGgBABgIIgFAAIADgKIAJAAIgCAIQgCAHgDAEQgDAEgFAAg");
	this.shape_248.setTransform(282,179.725);

	this.shape_249 = new cjs.Shape();
	this.shape_249.graphics.f("#F1E8DE").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAVg");
	this.shape_249.setTransform(280.475,176.85);

	this.shape_250 = new cjs.Shape();
	this.shape_250.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgFAAgHQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAGQAGAGAAAJIAAAHIglAAIgBADQAAAIAEADQADAEAFAAQADAAAFgDQAEgDADgFIAIAAQgCAHgGAFQgHAGgIAAQgGAAgFgCgAgGgPQgEADgCAJIAcAAIAAgDQAAgGgDgEQgEgDgFAAQgEAAgGAEg");
	this.shape_250.setTransform(275.55,176.9);

	this.shape_251 = new cjs.Shape();
	this.shape_251.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_251.setTransform(271.725,176.025);

	this.shape_252 = new cjs.Shape();
	this.shape_252.graphics.f("#F1E8DE").s().p("AgQAVQgGgFAAgJQAAgIAEgIQADgJAGgDQAHgFAHAAQAIAAAFAFQAFAFAAAHIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAFAAAHQAAAHADADQADAEAEgBQAEABAEgEQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgGg");
	this.shape_252.setTransform(267.675,176.9);

	this.shape_253 = new cjs.Shape();
	this.shape_253.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAAEgCIAAgFQAAgEgCgCQgDgCgGAAQgFAAgDACQgDADgCAFIgJgBQADgIAFgEQAHgEAIAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIABAHIgIAAIgBgHIgJAHIgIABQgIAAgEgEgAAJABIgHAAIgKACQgDACgBACQgCACAAADQAAADADADQACACAFAAQAEAAADgCQAEgDACgEQACgDACgIIgEABg");
	this.shape_253.setTransform(262.15,176.9);

	this.shape_254 = new cjs.Shape();
	this.shape_254.graphics.f("#F1E8DE").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAVg");
	this.shape_254.setTransform(258.225,176.85);

	this.shape_255 = new cjs.Shape();
	this.shape_255.graphics.f("#F1E8DE").s().p("AgTAXQgEgFAAgGQAAgEACgDQACgEADgBIAIgDIALgBQAIAAADgCIABgFQABgEgDgCQgDgCgGAAQgEAAgEACQgDADgCAFIgJgBQADgIAFgEQAHgEAIAAQAJAAAGAFQAEADAAAGIgBAJIgDAMIgCAKIACAHIgJAAIgBgHIgJAHIgIABQgHAAgFgEgAAJABIgHAAIgKACQgDACgBACQgCACAAADQAAADACADQADACAFAAQAEAAADgCQAEgDACgEQADgDABgIIgEABg");
	this.shape_255.setTransform(253.25,176.9);

	this.shape_256 = new cjs.Shape();
	this.shape_256.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_256.setTransform(247.675,175.925);

	this.shape_257 = new cjs.Shape();
	this.shape_257.graphics.f("#F1E8DE").s().p("AgQAVQgGgFAAgJQAAgIAEgIQADgJAGgDQAHgFAHAAQAIAAAFAFQAFAFAAAHIgJAAQAAgEgDgDQgDgDgEAAQgEAAgEADQgEAEgCAHQgDAFAAAHQAAAHADADQADAEAEgBQAEABAEgEQAEgDACgHIAJABQgEAJgGAGQgGAEgHAAQgIAAgFgGg");
	this.shape_257.setTransform(242.675,176.9);

	this.shape_258 = new cjs.Shape();
	this.shape_258.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgCgFQgDgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAFAGQAGAGAAAJIAAAHIgmAAIAAADQAAAIAEADQADAEAFAAQADAAAFgDQAEgDACgFIAJAAQgCAHgHAFQgGAGgIAAQgGAAgFgCgAgGgPQgEADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgFAEg");
	this.shape_258.setTransform(234.4,176.9);

	this.shape_259 = new cjs.Shape();
	this.shape_259.graphics.f("#F1E8DE").s().p("AAIAkIAGggIACgHQAAgBAAAAQAAgBgBAAQAAgBAAAAQAAgBgBAAQgCgCgDAAQgFAAgEADQgDACgDAEQgCAEgCAJIgFAXIgJAAIAPhHIAJAAIgGAcQAFgFADgCQAFgCAEAAQAHAAADADQAEAEAAAFIgCAJIgGAfg");
	this.shape_259.setTransform(228.775,175.925);

	this.shape_260 = new cjs.Shape();
	this.shape_260.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_260.setTransform(225.025,176.025);

	this.shape_261 = new cjs.Shape();
	this.shape_261.graphics.f("#F1E8DE").s().p("AAIAaIAHgfIABgHQAAgBAAgBQAAAAgBgBQAAAAAAgBQgBAAAAAAQgCgDgDAAQgHABgEAFQgGAEgCAMIgFAXIgJAAIALgyIAIAAIgCAJQAFgFAEgDQAEgCAFAAQAGAAAEADQAEAEAAAFIgCAJIgGAeg");
	this.shape_261.setTransform(217.625,176.85);

	this.shape_262 = new cjs.Shape();
	this.shape_262.graphics.f("#F1E8DE").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEAAIAGACIgDAIIgFgCQgFAAgFAFQgEAFgDAMIgEAVg");
	this.shape_262.setTransform(213.725,176.85);

	this.shape_263 = new cjs.Shape();
	this.shape_263.graphics.f("#F1E8DE").s().p("AgUAXQgEgDAAgFIACgLIAGgdIAJAAIgHAgIgBAGQAAADACACQACABADABQAEAAADgCQADgCACgDIAEgIQACgCABgGIAFgWIAJAAIgLAyIgIAAIABgJQgIALgKAAQgGgBgDgDg");
	this.shape_263.setTransform(209.025,176.95);

	this.shape_264 = new cjs.Shape();
	this.shape_264.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_264.setTransform(204.975,176.025);

	this.shape_265 = new cjs.Shape();
	this.shape_265.graphics.f("#F1E8DE").s().p("AgNAZQgGgDgCgFQgDgEAAgGQABgPAIgKQAIgIALAAQAJAAAGAGQAFAGABAJQgBAJgDAHQgDAIgIAEQgGAEgGAAQgHAAgEgCgAgDgRIgHAGIgDAJIgCAIQAAAHAEAEQADADAGAAIAEgBIAFgDIAEgGIAEgGIABgJQAAgGgEgFQgDgDgFAAQgEAAgDACg");
	this.shape_265.setTransform(197.7,176.9);

	this.shape_266 = new cjs.Shape();
	this.shape_266.graphics.f("#F1E8DE").s().p("AgKAhQgCgCAAgDIABgIIAGgdIgHAAIACgHIAHAAIADgNIAJgGIgEATIAIAAIgBAHIgJAAIgFAbIgBAHIABACQAAAAABABQAAAAAAAAQABAAAAAAQAAAAAAAAIAFAAIgBAHIgFABQgGAAgDgDg");
	this.shape_266.setTransform(193.825,176.025);

	this.shape_267 = new cjs.Shape();
	this.shape_267.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAHgDQAFgEAHAAQAJAAAGAGQAFAGAAAJIgBAHIglAAIAAADQAAAIADADQAEAEAEAAQAEAAAEgDQAFgDACgFIAJAAQgCAHgHAFQgGAGgJAAQgFAAgFgCgAgGgPQgEADgDAJIAdAAIAAgDQAAgGgEgEQgDgDgFAAQgFAAgFAEg");
	this.shape_267.setTransform(186.5,176.9);

	this.shape_268 = new cjs.Shape();
	this.shape_268.graphics.f("#F1E8DE").s().p("AgQAXQgGgFAAgJIAJgBIABAGQACADACABQADACAFAAQAFAAADgCQACgDAAgDQAAAAAAgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgEgCgBgDQgBgDgBgDQAAgGAGgEQAEgFAIAAQAJAAAGAFQAFAEAAAIIgIAAQAAgFgEgDQgDgCgGAAQgDAAgDACQgCACgBADQAAAAABABQAAAAAAABQAAAAABABQAAAAABAAIAGAEQALAFACABQAEAFAAAFQABAEgDAEQgDADgEADQgFACgFAAQgKAAgGgEg");
	this.shape_268.setTransform(181.3,176.9);

	this.shape_269 = new cjs.Shape();
	this.shape_269.graphics.f("#F1E8DE").s().p("AgUAXQgEgDAAgFIACgLIAGgdIAJAAIgHAgIgBAGQAAADACACQACABADABQAEAAADgCQADgCACgDIAEgIQACgCABgGIAFgWIAJAAIgLAyIgIAAIABgJQgIALgKAAQgGgBgDgDg");
	this.shape_269.setTransform(176.175,176.95);

	this.shape_270 = new cjs.Shape();
	this.shape_270.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgEAAgGQAAgPAJgKQAGgIAMAAQAJAAAGAGQAFAGAAAJQAAAJgDAHQgEAIgGAEQgHAEgHAAQgFAAgFgCgAgDgRIgHAGIgDAJIgCAIQAAAHADAEQAFADAEAAIAGgBIAEgDIAFgGIACgGIACgJQAAgGgEgFQgEgDgEAAQgEAAgDACg");
	this.shape_270.setTransform(170.45,176.9);

	this.shape_271 = new cjs.Shape();
	this.shape_271.graphics.f("#F1E8DE").s().p("AAWAaIAHghIABgGQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAgBgBAAQgCgCgCAAQgEAAgEADQgEACgDAEQgCAFgBAHIgGAYIgIAAIAHghIABgFQAAgBAAgBQAAAAAAgBQAAAAgBgBQAAAAAAAAQgBgBAAAAQgBgBAAAAQgBAAAAAAQgBgBgBAAQgDAAgEADQgEADgDAEQgDAEgCAHIgEAYIgJAAIAKgyIAKAAIgCAIQAEgFAFgCQAEgCAEAAQAEAAADACQADADABAEQAEgEAEgDQAFgCAFAAQAGAAADADQAEADAAAFIgCAIIgGAgg");
	this.shape_271.setTransform(163.5,176.85);

	this.shape_272 = new cjs.Shape();
	this.shape_272.graphics.f("#F1E8DE").s().p("AgNAZQgFgDgDgFQgCgFAAgHQAAgIAEgHQAEgJAGgDQAHgEAGAAQAJAAAFAGQAGAGAAAJIgBAHIgkAAIgBADQAAAIADADQAEAEAEAAQAEAAAEgDQAFgDADgFIAIAAQgCAHgGAFQgHAGgJAAQgFAAgFgCgAgFgPQgFADgCAJIAcAAIAAgDQAAgGgDgEQgEgDgFAAQgEAAgFAEg");
	this.shape_272.setTransform(153.8,176.9);

	this.shape_273 = new cjs.Shape();
	this.shape_273.graphics.f("#F1E8DE").s().p("AgQAXQgGgFAAgJIAJgBIABAGQABADAEABQADACAEAAQAEAAADgCQAEgDAAgDQAAAAgBgBQAAAAAAgBQAAAAAAgBQgBgBAAAAQgCgCgHgDIgIgDQgDgCgCgDQgCgDABgDQAAgGAEgEQAFgFAIAAQAKAAAFAFQAFAEAAAIIgJAAQABgFgEgDQgDgCgFAAQgEAAgDACQgDACABADQAAAAAAABQAAAAAAABQAAAAABABQAAAAABAAIAHAEQAKAFACABQAEAFABAFQgBAEgCAEQgCADgFADQgFACgGAAQgIAAgHgEg");
	this.shape_273.setTransform(148.6,176.9);

	this.shape_274 = new cjs.Shape();
	this.shape_274.graphics.f("#F1E8DE").s().p("AgUAiQgGgDgDgFQgDgFAAgFIACgOIAIgmIAKAAIgKAsIgBAIQABAFAEAEQAFAEAGgBQAGABAEgDQAEgDADgFQADgEACgLIAIgnIAKAAIgJAqQgCAKgDAHQgEAFgHAFQgHADgHAAQgIAAgGgCg");
	this.shape_274.setTransform(142.95,176);

	this.instance_10 = new lib.mouse();
	this.instance_10.parent = this;
	this.instance_10.setTransform(85,171,0.5749,0.5744);

	this.shape_275 = new cjs.Shape();
	this.shape_275.graphics.f("#CCCCCC").s().p("AgSAaIAKgyIAIAAIgCAKQADgGAEgCQAEgDAEgBIAGADIgDAIIgFgCQgFAAgFAFQgEAGgDALIgEAVg");
	this.shape_275.setTransform(149.775,229.85);

	this.shape_276 = new cjs.Shape();
	this.shape_276.graphics.f("#CCCCCC").s().p("AgTAhQgGgEgEgIQgEgGAAgJQAAgSALgMQALgMAPAAQANAAAJAJQAIAJAAAOQAAAKgEAIQgDAIgFAEQgFAFgFADQgIADgHAAQgIAAgIgEgAgPgSQgIAJAAAQQgBAGADAFQADAGAFADQAFACAGAAQAEAAAFgCQAGgDADgFQAEgEADgHQABgHAAgGQABgKgGgHQgGgGgJAAQgKAAgJAKg");
	this.shape_276.setTransform(144,228.9);

	this.instance_11 = new lib.button();
	this.instance_11.parent = this;
	this.instance_11.setTransform(104,213,0.2154,0.2153);

	this.shape_277 = new cjs.Shape();
	this.shape_277.graphics.f("#FFCC99").s().p("AgPAnIADgPIAOAAIgCAPgAgCgXIADgPIAPAAIgEAPg");
	this.shape_277.setTransform(150.325,119.05);

	this.shape_278 = new cjs.Shape();
	this.shape_278.graphics.f("#FFCC99").s().p("AgYAiQgKgHABgPIANgBQAAAGACAEQACAEAFADQAEACAGAAQAIAAAFgDQAEgEAAgFQAAgDgDgDQgCgDgLgFIgMgFQgFgDgDgEQgCgEAAgFQAAgKAHgGQAIgHAMAAQAOAAAIAHQAIAHAAALIgNABQAAgHgFgEQgFgFgIAAQgGAAgEAEQgEADAAADQAAAEAEADQACACAIAEQAPAGAEADQAGAGAAAJQAAAGgDAFQgEAGgHADQgHAEgJAAQgOAAgJgHg");
	this.shape_278.setTransform(144.4488,119.075);

	this.shape_279 = new cjs.Shape();
	this.shape_279.graphics.f("#FFCC99").s().p("AgRA2IAWhrIANAAIgWBrg");
	this.shape_279.setTransform(139.225,117.575);

	this.shape_280 = new cjs.Shape();
	this.shape_280.graphics.f("#FFCC99").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_280.setTransform(133.125,119.075);

	this.shape_281 = new cjs.Shape();
	this.shape_281.graphics.f("#FFCC99").s().p("AgcAoIAQhNIAMAAIgEAQQAGgJAGgEQAFgFAGAAQAEAAAGADIgGAMQgDgCgEAAQgHAAgHAIQgHAHgEAUIgGAfg");
	this.shape_281.setTransform(127.1,118.975);

	this.shape_282 = new cjs.Shape();
	this.shape_282.graphics.f("#FFCC99").s().p("AgPAyQgEgDAAgFIACgMIAKgsIgLAAIACgLIALAAIAEgTIAOgJIgGAcIANAAIgCALIgNAAIgIAqIgCAKIABADIAEABIAIgBIgCALIgJACQgIAAgEgEg");
	this.shape_282.setTransform(122.375,117.725);

	this.shape_283 = new cjs.Shape();
	this.shape_283.graphics.f("#FFCC99").s().p("AAMAoIAKgxIACgKQAAgEgDgCQgCgDgGAAQgKAAgHAHQgHAIgEARIgIAkIgNAAIAQhNIANAAIgEAOQAIgIAGgEQAHgEAHAAQAJAAAGAFQAFAFAAAJIgBAOIgKAug");
	this.shape_283.setTransform(115.4,118.975);

	this.shape_284 = new cjs.Shape();
	this.shape_284.graphics.f("#FFCC99").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_284.setTransform(107.275,119.075);

	this.shape_285 = new cjs.Shape();
	this.shape_285.graphics.f("#FFCC99").s().p("AgkArQgLgMAAgWQAAgcASgTQAPgRAWAAQARAAALAJQAKAKACAPIgNACQgCgMgHgGQgHgGgKAAQgTAAgMARQgLAQAAATQABARAHAJQAJAIANAAQAKAAAJgHQAJgHAEgNIAOABQgGAUgNAJQgNAJgQAAQgTAAgMgMg");
	this.shape_285.setTransform(98.15,117.6);

	this.shape_286 = new cjs.Shape();
	this.shape_286.graphics.f("#FFFFFF").s().p("AgNAiIADgNIAMAAIgCANgAgBgUIABgNIANAAIgCANg");
	this.shape_286.setTransform(409.9,139.575);

	this.shape_287 = new cjs.Shape();
	this.shape_287.graphics.f("#FFFFFF").s().p("AgRAgQgGgEgEgGQgDgHAAgIQAAgKAFgLQAFgKAIgFQAIgFAJAAQAMAAAHAHQAHAIAAANIgBAJIgwAAIAAADQAAAKAEAFQAEAFAHAAQAEAAAGgEQAGgEADgHIALABQgCAIgJAIQgIAHgLAAQgIAAgGgDgAgHgUQgGAFgDAKIAlAAIAAgCQAAgJgFgFQgEgEgHAAQgGAAgGAFg");
	this.shape_287.setTransform(404.325,139.575);

	this.shape_288 = new cjs.Shape();
	this.shape_288.graphics.f("#FFFFFF").s().p("AgPAuIAThcIAMAAIgTBcg");
	this.shape_288.setTransform(399.55,138.3);

	this.shape_289 = new cjs.Shape();
	this.shape_289.graphics.f("#FFFFFF").s().p("AgOAuIANhCIALAAIgNBCgAABghIADgNIAMAAIgDANg");
	this.shape_289.setTransform(396.7,138.3);

	this.shape_290 = new cjs.Shape();
	this.shape_290.graphics.f("#FFFFFF").s().p("AgLAsQgFgEgDgHIgCANIgKAAIAThcIALAAIgHAhQAGgFADgCQAEgCAFAAQAKAAAGAHQAHAHAAAMQgBAJgCAIQgCAHgEAFQgEAFgEADIgIAFIgIABQgGAAgFgDgAgDgIQgGAFgDAJQgDAHAAAFIAAACQABAJAEAEQAEAFAFAAQAFAAAGgEQAFgFADgJQAEgIAAgIQAAgIgFgEQgEgFgGAAQgGAAgEAFg");
	this.shape_290.setTransform(391.2,138.375);

	this.shape_291 = new cjs.Shape();
	this.shape_291.graphics.f("#FFFFFF").s().p("AgSAgQgGgDgDgHQgEgGAAgIQAAgTAMgNQAJgKAPAAQAMAAAIAHQAHAIAAANQAAALgFAKQgEAKgJAFQgJAFgIAAQgIAAgHgDgAgEgXQgFADgDAFQgEAFgCAGIgBALQAAAKAEAEQAFAFAHAAIAGgBQAEgCADgDIAFgHIAEgIQACgFAAgGQAAgJgFgFQgFgFgHAAQgEAAgEACg");
	this.shape_291.setTransform(384.075,139.575);

	this.shape_292 = new cjs.Shape();
	this.shape_292.graphics.f("#FFFFFF").s().p("AAWAuIAKgtIAKgiIgKAUIgiA7IgMAAIgKg6IgBgTIgDATIgNA6IgMAAIAThcIAQAAIAJA8IACAWQAFgJAIgQIAgg5IAQAAIgTBcg");
	this.shape_292.setTransform(375.35,138.3);

	this.shape_293 = new cjs.Shape();
	this.shape_293.graphics.f("#FFFFFF").s().p("AgNAiIADgNIAMAAIgCANgAgBgUIACgNIAMAAIgCANg");
	this.shape_293.setTransform(150.05,144.375);

	this.shape_294 = new cjs.Shape();
	this.shape_294.graphics.f("#FFFFFF").s().p("AgcAoQgGgHgBgNQAAgNAGgJQAEgKAIgFQAIgFAHAAQAMAAAGAMIAIgkIAMAAIgUBcIgLAAIADgKQgKALgKAAQgKAAgGgHgAgIgLQgEACgEAEQgDAFgCAGQgCAGAAAGIABALQABAEAEACQAEADAEAAQAIAAAFgIQAJgLgBgQQAAgHgDgEQgEgFgGAAQgEAAgDACg");
	this.shape_294.setTransform(144.95,143.175);

	this.shape_295 = new cjs.Shape();
	this.shape_295.graphics.f("#FFFFFF").s().p("AgYAjIAOhDIAKAAIgDAOQAFgIAEgEQAFgEAFAAQAEABAFACIgEAKQgDgCgEAAQgGAAgHAHQgFAHgEARIgFAbg");
	this.shape_295.setTransform(139.3,144.3);

	this.shape_296 = new cjs.Shape();
	this.shape_296.graphics.f("#FFFFFF").s().p("AgZAeQgFgGAAgIQAAgGADgEQACgFAEgBIALgEIANgBQALgBAEgCIACgHQAAgEgDgDQgEgDgHAAQgHAAgFADQgEAEgCAGIgMgBQAEgLAIgFQAHgFALAAQANAAAHAGQAGAEAAAHIgCANIgEAQIgBANIABAJIgMAAIgBgJQgGAGgGACQgEACgGAAQgKAAgGgFgAAMABIgKABIgMACQgFACgCADQgCADAAADQAAAFADADQAEADAGAAQAGAAAEgDQAFgDADgFQAEgFABgKIgFABg");
	this.shape_296.setTransform(132.8,144.375);

	this.shape_297 = new cjs.Shape();
	this.shape_297.graphics.f("#FFFFFF").s().p("AgSAgQgGgDgDgHQgEgGAAgIQAAgTAMgNQAJgKAPAAQAMAAAIAHQAHAIAAANQAAALgFAKQgEAKgJAFQgJAFgIAAQgIAAgHgDgAgEgXQgFADgDAFQgEAFgCAGIgBALQAAAKAEAEQAFAFAHAAIAGgBQAEgCADgDIAFgHIAEgIQACgFAAgGQAAgJgFgFQgFgFgHAAQgEAAgEACg");
	this.shape_297.setTransform(125.675,144.375);

	this.shape_298 = new cjs.Shape();
	this.shape_298.graphics.f("#FFFFFF").s().p("AgLAsQgFgEgDgHIgDANIgKAAIAThcIAMAAIgHAhQAGgFADgCQAFgCAEAAQAKAAAHAHQAFAHABAMQAAAJgDAIQgCAHgEAFQgEAFgEADIgIAFIgIABQgGAAgFgDgAgEgIQgFAFgDAJQgCAHgBAFIAAACQAAAJAFAEQADAFAHAAQAEAAAGgEQAFgFADgJQAEgIgBgIQABgIgFgEQgEgFgGAAQgGAAgFAFg");
	this.shape_298.setTransform(118.3,143.175);

	this.shape_299 = new cjs.Shape();
	this.shape_299.graphics.f("#FFFFFF").s().p("AgkAuIABgLIAHABQAEAAACgBIAGgIIAEgHIgMhCIAMAAIAEAhIAEAUIAdg1IALAAIgqBLQgGALgFAEQgFADgFAAIgJgBg");
	this.shape_299.setTransform(111.75,145.75);

	this.shape_300 = new cjs.Shape();
	this.shape_300.graphics.f("#FFFFFF").s().p("AgRAgQgGgEgEgGQgDgHAAgIQAAgKAFgLQAFgKAIgFQAIgFAJAAQAMAAAHAHQAHAIAAANIgBAJIgwAAIAAADQAAAKAEAFQAEAFAHAAQAEAAAGgEQAGgEADgHIALABQgCAIgJAIQgIAHgLAAQgIAAgGgDgAgHgUQgGAFgDAKIAlAAIAAgCQAAgJgFgFQgEgEgHAAQgGAAgGAFg");
	this.shape_300.setTransform(104.625,144.375);

	this.shape_301 = new cjs.Shape();
	this.shape_301.graphics.f("#FFFFFF").s().p("AAUAvIgagvIgUAQIgGAfIgMAAIAThdIAMAAIgJAtIAygtIARAAIgrAnIAgA2g");
	this.shape_301.setTransform(97.325,143.1);

	this.shape_302 = new cjs.Shape();
	this.shape_302.graphics.f("#FFFFFF").s().p("AgGAGIACgLIALAAIgCALg");
	this.shape_302.setTransform(389.825,100.85);

	this.shape_303 = new cjs.Shape();
	this.shape_303.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgCIAJgDIANgBQAKgBAEgBIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJAAQAMgBAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEACgGABQgIAAgGgGgAALABIgJABQgIAAgEACQgEABgBADQgCADAAADQAAAEADAEQADACAFAAQAGAAAEgCQAEgEADgEQADgGACgIIgFABg");
	this.shape_303.setTransform(384.175,98.35);

	this.shape_304 = new cjs.Shape();
	this.shape_304.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgDgGQgDgGAAgIQAAgJAFgJQAFgLAHgEQAIgFAHABQALAAAHAGQAHAHAAAMIgBAJIgtAAIAAADQAAAJAEAEQAEAEAGABQAEgBAGgDQAFgEADgGIAKABQgCAIgIAGQgIAIgLAAQgGgBgGgDgAgHgTQgGAFgCAKIAiAAIAAgDQAAgIgEgEQgEgFgHABQgFAAgGAEg");
	this.shape_304.setTransform(376.6,98.35);

	this.shape_305 = new cjs.Shape();
	this.shape_305.graphics.f("#FFFFFF").s().p("AgWAgIANg9IAJAAIgDAMQAEgHAFgDQAEgEAFAAIAIACIgEAKQgDgCgDAAQgGAAgGAGQgFAHgDAPIgFAZg");
	this.shape_305.setTransform(370.825,98.275);

	this.shape_306 = new cjs.Shape();
	this.shape_306.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgCIAJgDIANgBQAKgBAEgBIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJAAQAMgBAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEACgGABQgIAAgGgGgAALABIgJABQgIAAgEACQgEABgBADQgCADAAADQAAAEADAEQADACAFAAQAGAAAEgCQAEgEADgEQADgGACgIIgFABg");
	this.shape_306.setTransform(363.875,98.35);

	this.shape_307 = new cjs.Shape();
	this.shape_307.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgDgGQgDgGAAgIQAAgJAFgJQAFgLAHgEQAIgFAIABQAKAAAHAGQAHAHAAAMIgBAJIgtAAIAAADQAAAJAEAEQAEAEAGABQAEgBAGgDQAFgEADgGIAKABQgCAIgIAGQgIAIgKAAQgHgBgGgDgAgHgTQgGAFgCAKIAiAAIAAgDQAAgIgEgEQgEgFgGABQgGAAgGAEg");
	this.shape_307.setTransform(351.95,98.35);

	this.shape_308 = new cjs.Shape();
	this.shape_308.graphics.f("#FFFFFF").s().p("AAKArIAHglIACgKQAAgDgCgCQgCgCgEAAQgGAAgFADQgEADgDAFQgDAEgDANIgFAaIgLAAIAShVIALAAIgHAhQAGgFAEgDQAFgCAFAAQAIAAAEADQAFAEAAAHIgCAMIgIAkg");
	this.shape_308.setTransform(344.175,97.15);

	this.shape_309 = new cjs.Shape();
	this.shape_309.graphics.f("#FFFFFF").s().p("AgMAoQgDgCAAgEIACgKIAHgjIgIAAIABgIIAJAAIADgQIALgHIgFAXIALAAIgCAIIgKAAIgHAiIgBAHIABADIADABIAHAAIgDAIIgGABQgGAAgEgDg");
	this.shape_309.setTransform(338.7,97.25);

	this.shape_310 = new cjs.Shape();
	this.shape_310.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_310.setTransform(327.825,98.275);

	this.shape_311 = new cjs.Shape();
	this.shape_311.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_311.setTransform(322.575,97.15);

	this.shape_312 = new cjs.Shape();
	this.shape_312.graphics.f("#FFFFFF").s().p("AgTAbQgIgGABgMIAKAAQAAAEACAEQABADAEACQAEACAFAAQAGAAADgCQAEgEAAgDQAAgDgCgDQgCgCgJgDIgKgFQgEgCgCgDQgCgDAAgEQAAgIAGgGQAGgEAKAAQALgBAHAGQAGAFAAAJIgKABQgBgGgDgDQgEgDgHAAQgFAAgDACQgDADAAACQAAAEADABIAIAGQAMAEADACQAFAGAAAHQAAAEgCAFQgDAEgGADQgGACgHABQgLgBgHgFg");
	this.shape_312.setTransform(312.6984,98.35);

	this.shape_313 = new cjs.Shape();
	this.shape_313.graphics.f("#FFFFFF").s().p("AggAsIAShVIAKAAIgCAIQAFgFAEgDQAEgCAFAAQAJAAAGAHQAGAGgBAMQAAAKgDAIQgCAHgGAFQgEAFgFACQgFACgFAAQgKAAgGgLIgHAigAACggQgDACgDAEQgDAEgCAHQgCAGAAAEIABAJQABAEAEACQADACAEAAQAJAAAGgKQAFgJAAgLQAAgIgDgEQgEgEgGAAQgEAAgDACg");
	this.shape_313.setTransform(304.95,99.475);

	this.shape_314 = new cjs.Shape();
	this.shape_314.graphics.f("#FFFFFF").s().p("AgRAeQgFgEgEgFQgDgGABgIQAAgRAKgMQAJgJAOAAQALAAAHAGQAGAIABAMQAAAJgFAKQgFAIgHAFQgJAGgHAAQgHAAgHgDgAgEgVQgEADgDAEQgEAEgCAHIgBAKQAAAIAEAEQAEAFAHAAIAGgBQADgBADgEIAFgFIADgIQACgGAAgEQAAgJgEgFQgEgEgHAAQgEAAgEACg");
	this.shape_314.setTransform(297.7,98.35);

	this.shape_315 = new cjs.Shape();
	this.shape_315.graphics.f("#FFFFFF").s().p("AgRAeQgFgEgEgFQgDgGABgIQAAgRAKgMQAJgJAOAAQALAAAHAGQAGAIABAMQAAAJgFAKQgFAIgHAFQgJAGgHAAQgHAAgHgDgAgEgVQgEADgDAEQgEAEgCAHIgBAKQAAAIAEAEQAEAFAHAAIAGgBQADgBADgEIAFgFIADgIQACgGAAgEQAAgJgEgFQgEgEgHAAQgEAAgEACg");
	this.shape_315.setTransform(290.05,98.35);

	this.shape_316 = new cjs.Shape();
	this.shape_316.graphics.f("#FFFFFF").s().p("AgWAgIANg9IAJAAIgDAMQAEgHAFgDQAEgEAFAAIAIACIgEAKQgDgCgDAAQgGAAgGAGQgFAHgDAPIgFAZg");
	this.shape_316.setTransform(284.225,98.275);

	this.shape_317 = new cjs.Shape();
	this.shape_317.graphics.f("#FFFFFF").s().p("AgMAoQgDgCAAgEIACgKIAHgjIgIAAIABgIIAJAAIADgQIALgHIgEAXIAKAAIgBAIIgLAAIgGAiIgCAHIACADIACABIAHAAIgDAIIgGABQgGAAgEgDg");
	this.shape_317.setTransform(279.4,97.25);

	this.shape_318 = new cjs.Shape();
	this.shape_318.graphics.f("#FFFFFF").s().p("AghAqIABgKIAGABQAEAAABgBQADgCADgFIAEgHIgLg9IALAAIAEAfIADASIAbgxIALAAIgnBGQgGAKgEADQgFAEgGAAIgHgCg");
	this.shape_318.setTransform(269.175,99.625);

	this.shape_319 = new cjs.Shape();
	this.shape_319.graphics.f("#FFFFFF").s().p("AAaAgIAJgoIABgIQAAgBAAAAQAAgBAAAAQAAgBgBAAQAAgBgBAAQgCgCgDAAQgFAAgFADQgFADgDAEQgCAFgCAJIgHAeIgJAAIAIgpIABgGQAAgDgBgCQgCgCgDAAQgFAAgFADQgFADgDAFQgDAFgCAIIgGAeIgLAAIANg9IALAAIgCAKQAGgHAEgCQAFgDAFAAQAFAAAEADQAEADABAGQAFgGAFgDQAFgDAGAAQAIAAAEAEQAEAEAAAGIgCAKIgIAng");
	this.shape_319.setTransform(259.875,98.275);

	this.shape_320 = new cjs.Shape();
	this.shape_320.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAFgLAHgEQAHgFAJABQALAAAGAGQAHAHAAAMIgBAJIgtAAIAAADQAAAJAEAEQAEAEAGABQAEgBAFgDQAGgEACgGIALABQgCAIgIAGQgIAIgLAAQgGgBgGgDgAgHgTQgGAFgCAKIAiAAIAAgDQAAgIgEgEQgEgFgGABQgGAAgGAEg");
	this.shape_320.setTransform(250.65,98.35);

	this.shape_321 = new cjs.Shape();
	this.shape_321.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_321.setTransform(242.875,98.275);

	this.shape_322 = new cjs.Shape();
	this.shape_322.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAFgLAHgEQAHgFAJABQALAAAGAGQAHAHAAAMIgBAJIgtAAIAAADQAAAJAEAEQAEAEAGABQAEgBAFgDQAGgEACgGIALABQgCAIgIAGQgIAIgLAAQgGgBgGgDgAgHgTQgFAFgDAKIAiAAIAAgDQAAgIgEgEQgEgFgGABQgGAAgGAEg");
	this.shape_322.setTransform(235.35,98.35);

	this.shape_323 = new cjs.Shape();
	this.shape_323.graphics.f("#FFFFFF").s().p("AgNArIARhVIAKAAIgQBVg");
	this.shape_323.setTransform(225.575,97.15);

	this.shape_324 = new cjs.Shape();
	this.shape_324.graphics.f("#FFFFFF").s().p("AgNArIARhVIAKAAIgQBVg");
	this.shape_324.setTransform(221.925,97.15);

	this.shape_325 = new cjs.Shape();
	this.shape_325.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgCIAJgDIANgBQAKgBAEgBIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJAAQAMgBAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEACgGABQgIAAgGgGgAALABIgJABQgIAAgEACQgEABgBADQgCADAAADQAAAEADAEQADACAFAAQAGAAAEgCQAEgEADgEQADgGACgIIgFABg");
	this.shape_325.setTransform(215.975,98.35);

	this.shape_326 = new cjs.Shape();
	this.shape_326.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAEgLAIgEQAIgFAHABQALAAAHAGQAHAHAAAMIgBAJIgtAAIAAADQAAAJAEAEQAEAEAGABQAEgBAFgDQAGgEACgGIALABQgCAIgIAGQgIAIgLAAQgGgBgGgDgAgHgTQgFAFgDAKIAiAAIAAgDQAAgIgEgEQgEgFgHABQgFAAgGAEg");
	this.shape_326.setTransform(204.05,98.35);

	this.shape_327 = new cjs.Shape();
	this.shape_327.graphics.f("#FFFFFF").s().p("AgMAoQgDgCAAgEIACgKIAIgjIgJAAIABgIIAJAAIADgQIAMgHIgGAXIALAAIgCAIIgKAAIgHAiIAAAHIAAADIADABIAGAAIgCAIIgGABQgGAAgEgDg");
	this.shape_327.setTransform(198.45,97.25);

	this.shape_328 = new cjs.Shape();
	this.shape_328.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgCIAJgDIANgBQAKgBAEgBIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJAAQAMgBAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEACgGABQgIAAgGgGgAALABIgJABQgIAAgEACQgEABgBADQgCADAAADQAAAEADAEQADACAFAAQAGAAAEgCQAEgEADgEQADgGACgIIgFABg");
	this.shape_328.setTransform(191.975,98.35);

	this.shape_329 = new cjs.Shape();
	this.shape_329.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_329.setTransform(184.275,98.275);

	this.shape_330 = new cjs.Shape();
	this.shape_330.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_330.setTransform(179.025,97.15);

	this.shape_331 = new cjs.Shape();
	this.shape_331.graphics.f("#FFFFFF").s().p("AAaAgIAJgoIABgIQAAgBAAAAQAAgBAAAAQAAgBgBAAQAAgBgBAAQgCgCgDAAQgFAAgFADQgFADgDAEQgCAFgCAJIgHAeIgJAAIAIgpIABgGQAAgDgBgCQgCgCgDAAQgFAAgFADQgFADgDAFQgDAFgCAIIgGAeIgLAAIANg9IALAAIgCAKQAGgHAEgCQAFgDAFAAQAFAAAEADQAEADABAGQAFgGAFgDQAFgDAGAAQAIAAAEAEQAEAEAAAGIgCAKIgIAng");
	this.shape_331.setTransform(171.325,98.275);

	this.shape_332 = new cjs.Shape();
	this.shape_332.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_332.setTransform(164.375,97.15);

	this.shape_333 = new cjs.Shape();
	this.shape_333.graphics.f("#FFFFFF").s().p("AgNArIARhVIAKAAIgQBVg");
	this.shape_333.setTransform(160.675,97.15);

	this.shape_334 = new cjs.Shape();
	this.shape_334.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAFgLAHgEQAHgFAIABQAMAAAGAGQAHAHAAAMIgBAJIgtAAIAAADQAAAJAEAEQAEAEAGABQAEgBAFgDQAGgEACgGIALABQgCAIgIAGQgIAIgLAAQgGgBgGgDgAgHgTQgGAFgCAKIAiAAIAAgDQAAgIgEgEQgEgFgHABQgFAAgGAEg");
	this.shape_334.setTransform(154.8,98.35);

	this.shape_335 = new cjs.Shape();
	this.shape_335.graphics.f("#FFFFFF").s().p("AgQAFIACgJIAfAAIgCAJg");
	this.shape_335.setTransform(144.225,98.325);

	this.shape_336 = new cjs.Shape();
	this.shape_336.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_336.setTransform(133.325,98.275);

	this.shape_337 = new cjs.Shape();
	this.shape_337.graphics.f("#FFFFFF").s().p("AgQAeQgHgEgCgFQgDgGAAgIQgBgRALgMQAJgJANAAQAMAAAGAGQAIAIgBAMQAAAJgEAKQgEAIgJAFQgHAGgIAAQgIAAgFgDgAgEgVQgFADgDAEQgDAEgBAHIgCAKQAAAIAEAEQAEAFAHAAIAFgBQAEgBADgEIAFgFIADgIQACgGAAgEQAAgJgFgFQgEgEgGAAQgEAAgEACg");
	this.shape_337.setTransform(125.85,98.35);

	this.shape_338 = new cjs.Shape();
	this.shape_338.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_338.setTransform(120.425,97.15);

	this.shape_339 = new cjs.Shape();
	this.shape_339.graphics.f("#FFFFFF").s().p("AgTAbQgIgGABgMIAKAAQAAAEACAEQABADAEACQAEACAFAAQAGAAADgCQAEgEAAgDQAAgDgCgDQgCgCgJgDIgKgFQgEgCgCgDQgCgDAAgEQAAgIAGgGQAGgEAKAAQALgBAHAGQAGAFAAAJIgKABQgBgGgDgDQgEgDgHAAQgFAAgDACQgDADAAACQAAAEADABIAIAGQAMAEADACQAFAGAAAHQAAAEgCAFQgDAEgGADQgGACgHABQgLgBgHgFg");
	this.shape_339.setTransform(114.8984,98.35);

	this.shape_340 = new cjs.Shape();
	this.shape_340.graphics.f("#FFFFFF").s().p("AgTAbQgIgGABgMIAKAAQAAAEACAEQABADAEACQAEACAFAAQAGAAADgCQAEgEAAgDQAAgDgCgDQgCgCgJgDIgKgFQgEgCgCgDQgCgDAAgEQAAgIAGgGQAGgEAKAAQALgBAHAGQAGAFAAAJIgKABQgBgGgDgDQgEgDgHAAQgFAAgDACQgDADAAACQAAAEADABIAIAGQAMAEADACQAFAGAAAHQAAAEgCAFQgDAEgGADQgGACgHABQgLgBgHgFg");
	this.shape_340.setTransform(107.8984,98.35);

	this.shape_341 = new cjs.Shape();
	this.shape_341.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_341.setTransform(102.775,97.15);

	this.shape_342 = new cjs.Shape();
	this.shape_342.graphics.f("#FFFFFF").s().p("AAaAgIAJgoIABgIQAAgBAAAAQAAgBAAAAQAAgBgBAAQAAgBgBAAQgCgCgDAAQgFAAgFADQgFADgDAEQgCAFgCAJIgHAeIgJAAIAIgpIABgGQAAgDgBgCQgCgCgDAAQgFAAgFADQgFADgDAFQgDAFgCAIIgGAeIgLAAIANg9IALAAIgCAKQAGgHAEgCQAFgDAFAAQAFAAAEADQAEADABAGQAFgGAFgDQAFgDAGAAQAIAAAEAEQAEAEAAAGIgCAKIgIAng");
	this.shape_342.setTransform(95.075,98.275);

	this.shape_343 = new cjs.Shape();
	this.shape_343.graphics.f("#FFFFFF").s().p("AABAfIgCgkIAAgMIgGANIgQAjIgLAAIgHg9IAKAAIADAcIABAOIABAHIADgJIADgJIAPgfIALAAIACAeIAAATIAKgVIANgcIALAAIgeA9g");
	this.shape_343.setTransform(360.875,85.1);

	this.shape_344 = new cjs.Shape();
	this.shape_344.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgDgGQgDgGAAgIQAAgJAFgJQAFgKAHgFQAIgFAIAAQAKABAHAGQAHAHAAAMIgBAIIgtAAIAAAEQAAAIAEAFQAEAFAGAAQAEAAAGgEQAFgDADgHIAKABQgCAHgIAIQgIAGgKABQgHAAgGgEgAgHgSQgGAEgCAJIAiAAIAAgCQAAgIgEgEQgEgFgGAAQgGABgGAFg");
	this.shape_344.setTransform(351.6,85.1);

	this.shape_345 = new cjs.Shape();
	this.shape_345.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_345.setTransform(343.825,85.025);

	this.shape_346 = new cjs.Shape();
	this.shape_346.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgBIAJgEIANgBQAKAAAEgCIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJgBQAMAAAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEADgGAAQgIgBgGgFgAALABIgJABQgIABgEABQgEABgBADQgCADAAADQAAAEADADQADADAFAAQAGAAAEgDQAEgDADgEQADgFACgJIgFABg");
	this.shape_346.setTransform(331.875,85.1);

	this.shape_347 = new cjs.Shape();
	this.shape_347.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAFgKAHgFQAHgFAIAAQAMABAGAGQAHAHAAAMIgBAIIgtAAIAAAEQAAAIAEAFQAEAFAGAAQAEAAAFgEQAGgDACgHIALABQgCAHgIAIQgIAGgLABQgGAAgGgEgAgHgSQgGAEgCAJIAiAAIAAgCQAAgIgEgEQgEgFgHAAQgFABgGAFg");
	this.shape_347.setTransform(319.95,85.1);

	this.shape_348 = new cjs.Shape();
	this.shape_348.graphics.f("#FFFFFF").s().p("AgSAfIgKg9IALAAIAFAhIACASIAIgPIAUgkIALAAIgjA9g");
	this.shape_348.setTransform(313.275,85.1);

	this.shape_349 = new cjs.Shape();
	this.shape_349.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgBIAJgEIANgBQAKAAAEgCIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJgBQAMAAAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEADgGAAQgIgBgGgFgAALABIgJABQgIABgEABQgEABgBADQgCADAAADQAAAEADADQADADAFAAQAGAAAEgDQAEgDADgEQADgFACgJIgFABg");
	this.shape_349.setTransform(305.225,85.1);

	this.shape_350 = new cjs.Shape();
	this.shape_350.graphics.f("#FFFFFF").s().p("AAKArIAHgmIACgJQAAgDgCgCQgCgCgEAAQgGAAgFADQgEADgDAFQgDAFgDAMIgFAaIgLAAIAShVIALAAIgHAhQAGgGAEgCQAFgDAFAAQAIABAEAEQAFADAAAHIgCALIgIAlg");
	this.shape_350.setTransform(297.525,83.9);

	this.shape_351 = new cjs.Shape();
	this.shape_351.graphics.f("#FFFFFF").s().p("AgYAcQgFgFAAgGIACgNIAIgjIAKAAIgIAnIgBAIQAAADACACQACACAEAAQAFAAAEgCQADgCADgEQAEgEABgFIADgKIAGgbIALAAIgNA9IgKAAIACgLQgKANgMAAQgHAAgEgEg");
	this.shape_351.setTransform(285.875,85.175);

	this.shape_352 = new cjs.Shape();
	this.shape_352.graphics.f("#FFFFFF").s().p("AgRAdQgFgDgEgGQgCgFAAgHQAAgSAKgMQAJgKANAAQAMABAGAGQAIAHgBAMQABAKgFAKQgEAIgJAFQgHAFgIABQgIAAgGgEgAgEgVQgEADgDAEQgEAEgCAHIgBAKQAAAIAEAEQAFAFAGAAIAFgBQAEgCADgDIAFgGIADgHQACgFAAgGQAAgIgEgEQgFgFgGgBQgEAAgEADg");
	this.shape_352.setTransform(278.05,85.1);

	this.shape_353 = new cjs.Shape();
	this.shape_353.graphics.f("#FFFFFF").s().p("AghAqIABgKIAGABQAEAAABgBQADgCADgFIAEgHIgLg9IALAAIAEAfIADASIAbgxIALAAIgnBGQgGAKgEADQgFAEgGAAIgHgCg");
	this.shape_353.setTransform(270.875,86.375);

	this.shape_354 = new cjs.Shape();
	this.shape_354.graphics.f("#FFFFFF").s().p("AgaAlQgGgGAAgNQAAgLAFgJQAEgJAHgFQAHgEAHAAQALAAAGALIAHgiIALAAIgSBVIgKAAIACgJQgIALgKAAQgJAAgGgHgAgIgKQgDACgDAEQgDAEgCAFQgCAGAAAFIABAKQABAEADADQADACAFAAQAHAAAFgHQAIgKAAgPQAAgGgEgEQgEgFgFAAQgEAAgDACg");
	this.shape_354.setTransform(259.425,83.975);

	this.shape_355 = new cjs.Shape();
	this.shape_355.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_355.setTransform(251.225,85.025);

	this.shape_356 = new cjs.Shape();
	this.shape_356.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgBIAJgEIANgBQAKAAAEgCIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJgBQAMAAAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEADgGAAQgIgBgGgFgAALABIgJABQgIABgEABQgEABgBADQgCADAAADQAAAEADADQADADAFAAQAGAAAEgDQAEgDADgEQADgFACgJIgFABg");
	this.shape_356.setTransform(243.625,85.1);

	this.shape_357 = new cjs.Shape();
	this.shape_357.graphics.f("#FFFFFF").s().p("AgWAgIANg9IAJAAIgDAMQAEgHAFgDQAEgEAFAAIAIACIgEAKQgDgCgDAAQgGAAgGAGQgFAHgDAPIgFAZg");
	this.shape_357.setTransform(233.575,85.025);

	this.shape_358 = new cjs.Shape();
	this.shape_358.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAFgKAHgFQAHgFAJAAQALABAGAGQAHAHAAAMIgBAIIgtAAIAAAEQAAAIAEAFQAEAFAGAAQAEAAAFgEQAGgDACgHIALABQgCAHgIAIQgIAGgKABQgHAAgGgEgAgHgSQgFAEgDAJIAiAAIAAgCQAAgIgEgEQgEgFgGAAQgGABgGAFg");
	this.shape_358.setTransform(226.7,85.1);

	this.shape_359 = new cjs.Shape();
	this.shape_359.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_359.setTransform(221.325,83.9);

	this.shape_360 = new cjs.Shape();
	this.shape_360.graphics.f("#FFFFFF").s().p("AgaAlQgGgGAAgNQAAgLAFgJQAEgJAHgFQAHgEAHAAQALAAAGALIAHgiIALAAIgSBVIgKAAIACgJQgIALgKAAQgJAAgGgHgAgIgKQgDACgDAEQgDAEgCAFQgCAGAAAFIABAKQABAEADADQADACAFAAQAHAAAFgHQAIgKAAgPQAAgGgEgEQgEgFgFAAQgEAAgDACg");
	this.shape_360.setTransform(215.825,83.975);

	this.shape_361 = new cjs.Shape();
	this.shape_361.graphics.f("#FFFFFF").s().p("AgNArIARhVIAKAAIgQBVg");
	this.shape_361.setTransform(209.975,83.9);

	this.shape_362 = new cjs.Shape();
	this.shape_362.graphics.f("#FFFFFF").s().p("AgQAdQgHgDgCgGQgDgFAAgHQgBgSALgMQAJgKANAAQAMABAGAGQAIAHgBAMQAAAKgEAKQgEAIgJAFQgHAFgIABQgIAAgFgEgAgEgVQgFADgDAEQgDAEgBAHIgCAKQAAAIAEAEQAEAFAHAAIAFgBQAEgCADgDIAFgGIADgHQACgFAAgGQAAgIgFgEQgEgFgGgBQgEAAgEADg");
	this.shape_362.setTransform(204.15,85.1);

	this.shape_363 = new cjs.Shape();
	this.shape_363.graphics.f("#FFFFFF").s().p("AgTAbQgIgGABgMIAKAAQAAAEACAEQABADAEACQAEACAFAAQAGAAADgDQAEgDAAgDQAAgDgCgDQgCgCgJgEIgKgDQgEgDgCgDQgCgDAAgFQAAgHAGgGQAGgEAKgBQALAAAHAGQAGAFAAAJIgKABQgBgGgDgDQgEgEgHAAQgFAAgDADQgDACAAADQAAADADADIAIAEQAMAGADABQAFAGAAAHQAAAEgCAFQgDAEgGADQgGADgHAAQgLAAgHgGg");
	this.shape_363.setTransform(196.8484,85.1);

	this.shape_364 = new cjs.Shape();
	this.shape_364.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgDgGQgDgGAAgIQAAgJAFgJQAEgKAIgFQAIgFAIAAQAKABAHAGQAHAHAAAMIgBAIIgtAAIAAAEQAAAIAEAFQAEAFAGAAQAEAAAGgEQAFgDADgHIAKABQgCAHgIAIQgIAGgKABQgHAAgGgEgAgHgSQgGAEgCAJIAiAAIAAgCQAAgIgEgEQgEgFgGAAQgGABgGAFg");
	this.shape_364.setTransform(185.1,85.1);

	this.shape_365 = new cjs.Shape();
	this.shape_365.graphics.f("#FFFFFF").s().p("AgMAoQgDgCAAgEIACgKIAHgjIgIAAIABgIIAJAAIADgPIALgIIgEAXIAKAAIgBAIIgLAAIgGAhIgCAIIACADIACABIAHAAIgDAIIgGABQgGAAgEgDg");
	this.shape_365.setTransform(179.5,84);

	this.shape_366 = new cjs.Shape();
	this.shape_366.graphics.f("#FFFFFF").s().p("AgNArIANg9IAJAAIgMA9gAABgeIADgMIAKAAIgCAMg");
	this.shape_366.setTransform(175.375,83.9);

	this.shape_367 = new cjs.Shape();
	this.shape_367.graphics.f("#FFFFFF").s().p("AgNArIARhVIAKAAIgQBVg");
	this.shape_367.setTransform(171.675,83.9);

	this.shape_368 = new cjs.Shape();
	this.shape_368.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgCgGQgEgGAAgIQAAgJAFgJQAEgKAIgFQAIgFAHAAQALABAHAGQAHAHAAAMIgBAIIgtAAIAAAEQAAAIAEAFQAEAFAGAAQAEAAAFgEQAGgDACgHIALABQgCAHgIAIQgIAGgLABQgGAAgGgEgAgHgSQgFAEgDAJIAiAAIAAgCQAAgIgEgEQgEgFgHAAQgFABgGAFg");
	this.shape_368.setTransform(165.8,85.1);

	this.shape_369 = new cjs.Shape();
	this.shape_369.graphics.f("#FFFFFF").s().p("AAKAgIAIgnIABgIQAAgDgCgCQgCgCgEAAQgIAAgGAGQgGAGgDANIgGAdIgLAAIANg9IAKAAIgCAKQAGgGAEgDQAGgDAFAAQAIAAAEAEQAFAEAAAHIgCALIgIAlg");
	this.shape_369.setTransform(153.675,85.025);

	this.shape_370 = new cjs.Shape();
	this.shape_370.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgBIAJgEIANgBQAKAAAEgCIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJgBQAMAAAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEADgGAAQgIgBgGgFgAALABIgJABQgIABgEABQgEABgBADQgCADAAADQAAAEADADQADADAFAAQAGAAAEgDQAEgDADgEQADgFACgJIgFABg");
	this.shape_370.setTransform(146.075,85.1);

	this.shape_371 = new cjs.Shape();
	this.shape_371.graphics.f("#FFFFFF").s().p("AgQAdQgGgDgDgGQgDgGAAgIQAAgJAFgJQAFgKAHgFQAIgFAIAAQAKABAHAGQAHAHAAAMIgBAIIgtAAIAAAEQAAAIAEAFQAEAFAGAAQAEAAAGgEQAFgDADgHIAKABQgCAHgIAIQgIAGgKABQgHAAgGgEgAgHgSQgGAEgCAJIAiAAIAAgCQAAgIgEgEQgEgFgGAAQgGABgGAFg");
	this.shape_371.setTransform(134.15,85.1);

	this.shape_372 = new cjs.Shape();
	this.shape_372.graphics.f("#FFFFFF").s().p("AgWAgIANg9IAJAAIgDAMQAEgHAFgDQAEgEAFAAIAIACIgEAKQgDgCgDAAQgGAAgGAGQgFAHgDAPIgFAZg");
	this.shape_372.setTransform(128.375,85.025);

	this.shape_373 = new cjs.Shape();
	this.shape_373.graphics.f("#FFFFFF").s().p("AgXAbQgFgFAAgHQAAgGACgEQADgEAEgBIAJgEIANgBQAKAAAEgCIABgHQAAgEgCgCQgEgDgHAAQgGAAgEADQgEADgCAGIgLgBQADgKAIgFQAHgEAJgBQAMAAAHAGQAFAEAAAGIgCAMIgDAOIgCANIACAIIgLAAIgBgHQgGAEgFACQgEADgGAAQgIgBgGgFgAALABIgJABQgIABgEABQgEABgBADQgCADAAADQAAAEADADQADADAFAAQAGAAAEgDQAEgDADgEQADgFACgJIgFABg");
	this.shape_373.setTransform(121.425,85.1);

	this.shape_374 = new cjs.Shape();
	this.shape_374.graphics.f("#FFFFFF").s().p("AgYAcQgFgFAAgGIACgNIAIgjIAKAAIgIAnIgBAIQAAADACACQACACAEAAQAFAAAEgCQADgCADgEQAEgEABgFIADgKIAGgbIALAAIgNA9IgKAAIACgLQgKANgMAAQgHAAgEgEg");
	this.shape_374.setTransform(109.725,85.175);

	this.shape_375 = new cjs.Shape();
	this.shape_375.graphics.f("#FFFFFF").s().p("AgQAdQgHgDgCgGQgDgFgBgHQAAgSALgMQAJgKANAAQAMABAGAGQAIAHgBAMQAAAKgEAKQgEAIgJAFQgHAFgIABQgIAAgFgEgAgEgVQgEADgEAEQgDAEgBAHIgCAKQAAAIAEAEQAEAFAHAAIAGgBQADgCADgDIAFgGIADgHQACgFAAgGQAAgIgFgEQgEgFgGgBQgEAAgEADg");
	this.shape_375.setTransform(101.9,85.1);

	this.shape_376 = new cjs.Shape();
	this.shape_376.graphics.f("#FFFFFF").s().p("AgTArIAHghIgag0IAMAAIAMAZIAIARQAFgHAHgJIAUgaIANAAIgoA1IgGAgg");
	this.shape_376.setTransform(95.35,83.9);

	this.shape_377 = new cjs.Shape();
	this.shape_377.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIASgCQACAKAFAEQAFAEAIAAQAJAAAEgDQAFgFAAgEQAAgEgCgCQgCgDgEgBIgOgFQgQgDgGgFQgJgHABgLQAAgIADgFQAEgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgIgDgDQgFgCgHAAQgIAAgFADQgCACAAAEQAAADACACQAEADANADQANADAHAEQAHAEADAEQAEAGAAAKQAAAHgFAHQgEAIgIADQgJADgLAAQgRAAgJgIg");
	this.shape_377.setTransform(182.25,53.1);

	this.shape_378 = new cjs.Shape();
	this.shape_378.graphics.f("#D9D9D9").s().p("AASAvIglg8IAAA8IgRAAIAAhdIASAAIAmA9IAAg9IARAAIAABdg");
	this.shape_378.setTransform(173.25,53.1);

	this.shape_379 = new cjs.Shape();
	this.shape_379.graphics.f("#D9D9D9").s().p("AgcAjQgMgMAAgWQAAgXAMgMQANgNASAAQASAAAKAKQAHAGADALIgTAFQgCgIgFgEQgGgEgGAAQgKAAgGAIQgHAHAAAQQAAARAHAHQAFAIAKAAQAHAAAGgEQAFgGACgJIATAFQgEAPgKAHQgKAIgPAAQgRAAgNgNg");
	this.shape_379.setTransform(142.2,53.1);

	this.shape_380 = new cjs.Shape();
	this.shape_380.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQAAAMABAEQACAFAEAEQAFADAGAAQAJAAADgDQAFgDABgFIAAgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgMAAgHgDg");
	this.shape_380.setTransform(132.8,53.175);

	this.shape_381 = new cjs.Shape();
	this.shape_381.graphics.f("#D9D9D9").s().p("AATAvIgNgVIgJgNQgDgDgDgCIgJgBIgEAAIAAAoIgTAAIAAhdIAoAAQAOAAAHADQAGADAEAGQAEAHAAAHQAAALgGAHQgGAFgMACQAGAEAEAEIALAQIALASgAgWgGIAOAAQAMAAAEgBQADgCACgDQACgCAAgFQAAgEgCgDQgDgCgFgCIgMAAIgPAAg");
	this.shape_381.setTransform(123.875,53.1);

	this.shape_382 = new cjs.Shape();
	this.shape_382.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgQIBJAAIAAAQIgcAAIAABNg");
	this.shape_382.setTransform(114.775,53.1);

	this.shape_383 = new cjs.Shape();
	this.shape_383.graphics.f("#D9D9D9").s().p("AgZAoQgKgIgCgQIATgCQABAKAFAEQAFAEAIAAQAJAAAEgDQAFgFAAgEQAAgEgCgCQgCgDgEgBIgPgFQgPgDgGgFQgIgHAAgLQAAgIADgFQAFgHAHgDQAIgDAKAAQARAAAJAHQAJAIAAANIgSABQgCgIgEgDQgEgCgHAAQgIAAgFADQgCACAAAEQAAADACACQAEADAMADQAOADAHAEQAGAEAEAEQAEAGAAAKQAAAHgFAHQgEAIgIADQgIADgMAAQgRAAgJgIg");
	this.shape_383.setTransform(106.4,53.1);

	this.shape_384 = new cjs.Shape();
	this.shape_384.graphics.f("#D9D9D9").s().p("AASAvIgkg8IAAA8IgSAAIAAhdIATAAIAlA9IAAg9IARAAIAABdg");
	this.shape_384.setTransform(97.4,53.1);

	this.shape_385 = new cjs.Shape();
	this.shape_385.graphics.f("#D9D9D9").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_385.setTransform(90.975,53.1);

	this.audionautix = new lib.black();
	this.audionautix.name = "audionautix";
	this.audionautix.parent = this;
	this.audionautix.setTransform(176.7,120.25,0.2368,0.0524,0,0,0,5.9,16.3);
	this.audionautix.alpha = 0.0195;

	this.shape_386 = new cjs.Shape();
	this.shape_386.graphics.f("#FFFFFF").s().p("AghA4IA4hvIALAAIg4Bvg");
	this.shape_386.setTransform(334.9,130.15);

	this.shape_387 = new cjs.Shape();
	this.shape_387.graphics.f("#FFFFFF").s().p("AAhAoIAKgzIACgJQAAgDgDgDQgCgCgEAAQgGAAgGAEQgGADgEAGQgDAGgDALIgIAmIgMAAIALg0IABgHQAAgEgCgDQgCgCgFAAQgFAAgGAEQgGADgEAHQgEAGgDALIgIAlIgMAAIAQhNIANAAIgDANQAIgIAFgEQAHgDAGAAQAHAAAEAEQAFAEACAHQAFgIAHgDQAHgEAHAAQAKAAAEAFQAGAEAAAJIgCAMIgLAxg");
	this.shape_387.setTransform(326.05,131.525);

	this.shape_388 = new cjs.Shape();
	this.shape_388.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_388.setTransform(315.775,131.625);

	this.shape_389 = new cjs.Shape();
	this.shape_389.graphics.f("#FFFFFF").s().p("AgZAgQgIgIAAgPQAAgLAFgNQAFgMAJgGQAKgHALAAQANAAAHAHQAHAHAAAMIgNABQAAgIgEgEQgEgEgIAAQgGAAgGAFQgGAFgDALQgDAJAAAJQAAAKADAFQAFAFAGAAQAGAAAGgFQAGgFADgKIANACQgFAOgIAHQgKAIgLAAQgNAAgHgJg");
	this.shape_389.setTransform(308.1,131.625);

	this.shape_390 = new cjs.Shape();
	this.shape_390.graphics.f("#FFFFFF").s().p("AgIAIIADgOIAOAAIgDAOg");
	this.shape_390.setTransform(301.475,134.75);

	this.shape_391 = new cjs.Shape();
	this.shape_391.graphics.f("#FFFFFF").s().p("AANAnIgIgQIgFgMIgXAcIgQAAIAhgnIgTgmIAPAAIAGAOIAGAPIAWgdIAQAAIggAnIATAmg");
	this.shape_391.setTransform(296.225,131.6);

	this.shape_392 = new cjs.Shape();
	this.shape_392.graphics.f("#FFFFFF").s().p("AgRA2IAQhNIANAAIgQBNgAACgmIADgPIANAAIgDAPg");
	this.shape_392.setTransform(291.075,130.125);

	this.shape_393 = new cjs.Shape();
	this.shape_393.graphics.f("#FFFFFF").s().p("AgPAyQgEgDAAgFIACgMIAKgsIgLAAIACgLIALAAIAEgTIAOgJIgGAcIANAAIgCALIgNAAIgIAqIgCAKIABADIAEABIAIgBIgCALIgJACQgIAAgEgEg");
	this.shape_393.setTransform(287.525,130.275);

	this.shape_394 = new cjs.Shape();
	this.shape_394.graphics.f("#FFFFFF").s().p("AgfAjQgFgGAAgHIADgRIAJgsIANAAIgLAxIgBAJQABAFACADQACACAGAAQAFAAAFgDQAFgCAEgFQADgEADgHIAEgNIAHgiIANAAIgQBNIgMAAIACgOQgNAQgOAAQgJAAgGgFg");
	this.shape_394.setTransform(281,131.7);

	this.shape_395 = new cjs.Shape();
	this.shape_395.graphics.f("#FFFFFF").s().p("AgdAiQgGgGAAgKQAAgHADgFQADgFAFgCQAFgDAHgBIAQgBQAMgBAGgCIABgJQAAgFgDgCQgFgEgJAAQgHAAgFAEQgGADgCAHIgOgBQAFgLAIgHQAJgGANAAQAOAAAJAHQAGAFAAAIQAAAHgCAIIgEASQgCAJAAAGIACALIgOAAIgBgKQgHAGgHADQgFADgHAAQgLAAgHgHgAAOABIgLABQgLABgEACQgFABgDAEQgCADAAAFQAAAFAEAEQAEADAHAAQAGAAAFgDQAHgEADgGQAEgGACgLIgGABg");
	this.shape_395.setTransform(272.275,131.625);

	this.shape_396 = new cjs.Shape();
	this.shape_396.graphics.f("#FFFFFF").s().p("AAMAoIALgxIABgKQAAgEgCgCQgEgDgEAAQgLAAgGAHQgJAIgDARIgIAkIgNAAIAQhNIAMAAIgCAOQAHgIAGgEQAHgEAHAAQAJAAAGAFQAFAFAAAJIgCAOIgKAug");
	this.shape_396.setTransform(263.85,131.525);

	this.shape_397 = new cjs.Shape();
	this.shape_397.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_397.setTransform(255.725,131.625);

	this.shape_398 = new cjs.Shape();
	this.shape_398.graphics.f("#FFFFFF").s().p("AgRA2IAQhNIANAAIgQBNgAACgmIADgPIANAAIgDAPg");
	this.shape_398.setTransform(250.175,130.125);

	this.shape_399 = new cjs.Shape();
	this.shape_399.graphics.f("#FFFFFF").s().p("AggAuQgIgIAAgPQAAgPAGgKQAGgMAJgGQAIgGAJAAQAOAAAHAOIAJgqIANAAIgWBrIgNAAIADgMQgLAOgMAAQgLAAgHgJgAgKgNQgEACgEAFIgGAMQgDAIAAAGQAAAIACAFQACAFADADQAEADAGAAQAJAAAGgJQAKgNAAgSQAAgIgFgGQgFgFgGAAQgFAAgEACg");
	this.shape_399.setTransform(244.475,130.225);

	this.shape_400 = new cjs.Shape();
	this.shape_400.graphics.f("#FFFFFF").s().p("AgfAjQgFgGAAgHIADgRIAJgsIANAAIgLAxIAAAJQAAAFACADQACACAGAAQAFAAAFgDQAFgCAEgFQADgEADgHIAEgNIAHgiIANAAIgQBNIgMAAIADgOQgOAQgOAAQgJAAgGgFg");
	this.shape_400.setTransform(235.9,131.7);

	this.shape_401 = new cjs.Shape();
	this.shape_401.graphics.f("#FFFFFF").s().p("AgdAiQgGgGAAgKQAAgHADgFQADgFAFgCQAFgDAHgBIAQgBQAMgBAGgCIABgJQAAgFgDgCQgFgEgJAAQgHAAgFAEQgGADgCAHIgOgBQAFgLAIgHQAJgGANAAQAOAAAJAHQAGAFAAAIQAAAHgCAIIgEASQgCAJAAAGIACALIgOAAIgBgKQgHAGgHADQgFADgHAAQgLAAgHgHgAAOABIgLABQgLABgEACQgFABgDAEQgCADAAAFQAAAFAEAEQAEADAHAAQAGAAAFgDQAHgEADgGQAEgGACgLIgGABg");
	this.shape_401.setTransform(227.175,131.625);

	this.shape_402 = new cjs.Shape();
	this.shape_402.graphics.f("#FFFFFF").s().p("AgiA4IA5hvIAMAAIg5Bvg");
	this.shape_402.setTransform(221.45,130.15);

	this.shape_403 = new cjs.Shape();
	this.shape_403.graphics.f("#FFFFFF").s().p("AgiA4IA5hvIAMAAIg5Bvg");
	this.shape_403.setTransform(217.3,130.15);

	this.shape_404 = new cjs.Shape();
	this.shape_404.graphics.f("#FFFFFF").s().p("AgPAnIADgPIAOAAIgCAPgAgCgXIADgPIAPAAIgEAPg");
	this.shape_404.setTransform(212.875,131.6);

	this.shape_405 = new cjs.Shape();
	this.shape_405.graphics.f("#FFFFFF").s().p("AgYAiQgKgHABgPIANgBQAAAGACAEQACAEAFADQAEACAGAAQAIAAAFgDQAEgEAAgFQAAgDgDgDQgCgDgLgFIgMgFQgFgDgDgEQgCgEAAgFQAAgKAHgGQAIgHAMAAQAOAAAIAHQAIAHAAALIgNABQAAgHgFgEQgFgFgIAAQgGAAgEAEQgEADAAADQAAAEAEADQACACAIAEQAPAGAEADQAGAGAAAJQAAAGgDAFQgEAGgHADQgHAEgJAAQgOAAgJgHg");
	this.shape_405.setTransform(206.9988,131.625);

	this.shape_406 = new cjs.Shape();
	this.shape_406.graphics.f("#FFFFFF").s().p("AgoA3IAXhrIAMAAIgCALQAGgHAEgDQAGgDAGAAQALAAAHAIQAIAIAAAPQAAANgEAKQgEAJgGAGQgGAGgGADQgGADgGAAQgNAAgIgPIgJArgAACgoQgEACgDAGQgEAFgDAIQgCAHAAAGQAAAIABADQACAFAFADQAEADAEAAQALAAAIgNQAGgMABgNQAAgKgFgGQgFgFgHAAQgFAAgEADg");
	this.shape_406.setTransform(198.55,133.025);

	this.shape_407 = new cjs.Shape();
	this.shape_407.graphics.f("#FFFFFF").s().p("AgPAyQgEgDAAgFIACgMIAKgsIgLAAIACgLIALAAIAEgTIAOgJIgGAcIANAAIgCALIgNAAIgIAqIgCAKIABADIAEABIAIgBIgCALIgJACQgIAAgEgEg");
	this.shape_407.setTransform(193.275,130.275);

	this.shape_408 = new cjs.Shape();
	this.shape_408.graphics.f("#FFFFFF").s().p("AgPAyQgEgDAAgFIACgMIAKgsIgLAAIACgLIALAAIAEgTIAOgJIgGAcIANAAIgCALIgNAAIgIAqIgCAKIABADIAEABIAIgBIgCALIgJACQgIAAgEgEg");
	this.shape_408.setTransform(189.125,130.275);

	this.shape_409 = new cjs.Shape();
	this.shape_409.graphics.f("#FFFFFF").s().p("AAMA2IAKgvIACgMQAAgEgDgCQgCgDgFAAQgIAAgGAEQgGAEgDAGQgEAGgDAOIgHAiIgNAAIAWhrIANAAIgIAqQAHgIAGgDQAGgDAHAAQAJAAAGAFQAFAFAAAJIgCAOIgKAug");
	this.shape_409.setTransform(182.175,130.125);

	this.incom = new lib.black();
	this.incom.name = "incom";
	this.incom.parent = this;
	this.incom.setTransform(288.45,101.25,0.2368,0.0524,0,0,0,5.9,16.3);
	this.incom.alpha = 0.0195;

	this.shape_410 = new cjs.Shape();
	this.shape_410.graphics.f("#FFFFFF").s().p("AgYBGQAJgJAJgRQAJgQAEgQQAFgPAAgQQAAgZgJgZIAKAAQAMAZAAAaQAAASgFAOQgFAQgJAPQgGAJgNAQg");
	this.shape_410.setTransform(408.925,110.825);

	this.shape_411 = new cjs.Shape();
	this.shape_411.graphics.f("#FFFFFF").s().p("AAhAoIAKgzIACgJQAAgDgCgDQgDgCgEAAQgGAAgGAEQgHADgDAGQgDAGgDALIgIAmIgMAAIALg0IABgHQAAgEgCgDQgDgCgEAAQgFAAgGAEQgGADgEAHQgEAGgCALIgJAlIgMAAIAPhNIAOAAIgDANQAIgIAFgEQAHgDAGAAQAHAAAEAEQAFAEACAHQAGgIAGgDQAGgEAIAAQAKAAAEAFQAFAEABAJIgDAMIgKAxg");
	this.shape_411.setTransform(401.1,110.725);

	this.shape_412 = new cjs.Shape();
	this.shape_412.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_412.setTransform(390.825,110.825);

	this.shape_413 = new cjs.Shape();
	this.shape_413.graphics.f("#FFFFFF").s().p("AgZAgQgIgIAAgPQAAgLAFgNQAFgMAJgGQAKgHALAAQANAAAHAHQAHAHAAAMIgNABQAAgIgEgEQgEgEgIAAQgGAAgGAFQgGAFgDALQgDAJgBAJQABAKAEAFQAEAFAGAAQAGAAAGgFQAGgFADgKIAOACQgFAOgKAHQgJAIgLAAQgMAAgIgJg");
	this.shape_413.setTransform(383.15,110.825);

	this.shape_414 = new cjs.Shape();
	this.shape_414.graphics.f("#FFFFFF").s().p("AgIAHIADgNIAOAAIgDANg");
	this.shape_414.setTransform(376.525,113.95);

	this.shape_415 = new cjs.Shape();
	this.shape_415.graphics.f("#FFFFFF").s().p("AAMA2IAKgvIACgMQAAgEgDgCQgCgDgFAAQgIAAgGAEQgGAEgDAGQgEAGgDAOIgHAiIgNAAIAWhrIANAAIgIAqQAHgIAGgDQAGgDAHAAQAJAAAGAFQAFAFAAAJIgCAOIgKAug");
	this.shape_415.setTransform(370.625,109.325);

	this.shape_416 = new cjs.Shape();
	this.shape_416.graphics.f("#FFFFFF").s().p("AgZAgQgIgIAAgPQAAgLAFgNQAFgMAKgGQAJgHALAAQAMAAAIAHQAHAHAAAMIgNABQAAgIgEgEQgEgEgIAAQgGAAgGAFQgGAFgDALQgEAJAAAJQAAAKAFAFQAEAFAHAAQAFAAAGgFQAGgFADgKIAOACQgGAOgJAHQgJAIgKAAQgNAAgIgJg");
	this.shape_416.setTransform(363.15,110.825);

	this.shape_417 = new cjs.Shape();
	this.shape_417.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgDgIQgEgIAAgJQAAgMAFgMQAHgMAJgGQAKgGAJAAQAOAAAIAJQAJAIAAAPIgCALIg3AAIgBAEQAAALAFAGQAFAGAIAAQAFAAAHgFQAHgEADgJIANACQgDAJgKAJQgKAJgMAAQgJAAgIgEgAgJgYQgHAGgEAMIArAAIAAgDQABgKgGgFQgEgFgJAAQgHAAgHAFg");
	this.shape_417.setTransform(354.95,110.825);

	this.shape_418 = new cjs.Shape();
	this.shape_418.graphics.f("#FFFFFF").s().p("AgPAyQgEgDAAgFIACgMIAKgsIgLAAIACgLIALAAIAEgTIAOgJIgGAcIANAAIgCALIgNAAIgIAqIgCAKIABADIAEABIAIgBIgCALIgJACQgIAAgEgEg");
	this.shape_418.setTransform(349.225,109.475);

	this.shape_419 = new cjs.Shape();
	this.shape_419.graphics.f("#FFFFFF").s().p("AgVAlQgGgEgEgIQgEgIAAgJQAAgMAFgMQAHgMAJgGQAKgGAJAAQAOAAAJAJQAIAIAAAPIgCALIg4AAIAAAEQAAALAFAGQAFAGAIAAQAFAAAHgFQAGgEAEgJIANACQgDAJgJAJQgLAJgMAAQgJAAgIgEgAgJgYQgHAGgEAMIArAAIAAgDQAAgKgEgFQgFgFgJAAQgHAAgHAFg");
	this.shape_419.setTransform(342.45,110.825);

	this.shape_420 = new cjs.Shape();
	this.shape_420.graphics.f("#FFFFFF").s().p("AgoA3IAXhrIAMAAIgCALQAGgHAEgDQAGgDAGAAQALAAAHAIQAIAIAAAPQAAANgEAKQgFAJgFAGQgGAGgGADQgGADgHAAQgMAAgIgPIgJArgAACgoQgDACgEAGQgEAFgDAIQgCAHAAAGQAAAIABADQADAFAEADQADADAFAAQALAAAHgNQAHgMABgNQgBgKgEgGQgFgFgHAAQgFAAgEADg");
	this.shape_420.setTransform(333.65,112.225);

	this.shape_421 = new cjs.Shape();
	this.shape_421.graphics.f("#FFFFFF").s().p("AAhAoIAKgzIACgJQAAgDgDgDQgCgCgEAAQgGAAgHAEQgFADgEAGQgDAGgDALIgHAmIgNAAIALg0IABgHQAAgEgCgDQgDgCgEAAQgFAAgGAEQgHADgEAHQgDAGgDALIgIAlIgNAAIARhNIANAAIgDANQAIgIAFgEQAHgDAGAAQAGAAAFAEQAFAEACAHQAFgIAHgDQAGgEAIAAQAKAAAEAFQAGAEgBAJIgBAMIgLAxg");
	this.shape_421.setTransform(323.55,110.725);

	this.shape_422 = new cjs.Shape();
	this.shape_422.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_422.setTransform(313.275,110.825);

	this.shape_423 = new cjs.Shape();
	this.shape_423.graphics.f("#FFFFFF").s().p("AgZAgQgIgIAAgPQAAgLAFgNQAFgMAJgGQAKgHALAAQAMAAAIAHQAHAHAAAMIgNABQAAgIgEgEQgFgEgGAAQgIAAgFAFQgGAFgEALQgCAJAAAJQAAAKADAFQAFAFAGAAQAGAAAGgFQAGgFADgKIANACQgFAOgIAHQgKAIgLAAQgNAAgHgJg");
	this.shape_423.setTransform(305.6,110.825);

	this.shape_424 = new cjs.Shape();
	this.shape_424.graphics.f("#FFFFFF").s().p("AAMAoIAKgxIACgKQAAgEgDgCQgCgDgGAAQgKAAgHAHQgHAIgEARIgIAkIgNAAIAQhNIANAAIgEAOQAIgIAGgEQAHgEAHAAQAJAAAGAFQAFAFAAAJIgBAOIgKAug");
	this.shape_424.setTransform(297.2,110.725);

	this.shape_425 = new cjs.Shape();
	this.shape_425.graphics.f("#FFFFFF").s().p("AgRA2IAQhNIANAAIgQBNgAACgmIADgPIANAAIgDAPg");
	this.shape_425.setTransform(291.875,109.325);

	this.shape_426 = new cjs.Shape();
	this.shape_426.graphics.f("#FFFFFF").s().p("AgMBGQgMgZAAgaQAAgSAFgOQAFgQAJgPQAGgKANgPIALAAQgJAJgJAQQgJARgEAQQgFAPAAAQQAAAYAJAag");
	this.shape_426.setTransform(288.375,110.825);

	this.shape_427 = new cjs.Shape();
	this.shape_427.graphics.f("#FFFFFF").s().p("AggAuQgIgIAAgPQAAgPAGgKQAGgMAJgGQAIgGAJAAQAOAAAHAOIAJgqIANAAIgWBrIgNAAIADgMQgLAOgMAAQgLAAgHgJgAgKgNQgEACgEAFIgGAMQgDAIAAAGQAAAIACAFQACAFADADQAEADAGAAQAJAAAGgJQAKgNAAgSQAAgIgFgGQgFgFgGAAQgFAAgEACg");
	this.shape_427.setTransform(277.025,109.425);

	this.shape_428 = new cjs.Shape();
	this.shape_428.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgHQgEgHAAgKQAAgWANgOQAMgNAQAAQAPAAAIAJQAJAJAAAPQAAAMgGAMQgFALgKAGQgKAHgKAAQgJAAgIgEgAgFgbQgGADgEAGQgEAGgCAHQgCAHAAAGQAAALAGAGQAFAFAIAAIAHgBQAFgCADgEIAGgIIAEgJQADgHAAgGQAAgLgGgGQgFgGgIAAQgFAAgFADg");
	this.shape_428.setTransform(268.225,110.825);

	this.shape_429 = new cjs.Shape();
	this.shape_429.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgIQgDgIAAgJQAAgMAFgMQAHgMAJgGQAJgGAKAAQAOAAAJAJQAIAIAAAPIgBALIg5AAIAAAEQAAALAFAGQAFAGAHAAQAHAAAGgFQAHgEADgJIANACQgDAJgJAJQgLAJgNAAQgJAAgHgEgAgJgYQgHAGgEAMIArAAIAAgDQAAgKgEgFQgGgFgIAAQgHAAgHAFg");
	this.shape_429.setTransform(259.85,110.825);

	this.shape_430 = new cjs.Shape();
	this.shape_430.graphics.f("#FFFFFF").s().p("AgjA2IAWhrIAOAAIgTBfIA2AAIgCAMg");
	this.shape_430.setTransform(251.325,109.325);

	this.shape_431 = new cjs.Shape();
	this.shape_431.graphics.f("#FFFFFF").s().p("AgZAgQgIgIAAgPQAAgLAFgNQAFgMAJgGQAKgHALAAQANAAAHAHQAHAHAAAMIgNABQAAgIgEgEQgFgEgGAAQgIAAgFAFQgGAFgEALQgCAJAAAJQAAAKADAFQAFAFAGAAQAGAAAGgFQAGgFADgKIANACQgFAOgIAHQgKAIgLAAQgNAAgHgJg");
	this.shape_431.setTransform(243.85,110.825);

	this.shape_432 = new cjs.Shape();
	this.shape_432.graphics.f("#FFFFFF").s().p("AgdAiQgGgGAAgKQAAgHADgFQADgFAFgCQAFgDAHgBIAQgBQAMgBAGgCIABgJQAAgFgDgCQgFgEgJAAQgHAAgFAEQgGADgCAHIgOgBQAFgLAIgHQAJgGANAAQAOAAAJAHQAGAFAAAIQAAAHgCAIIgEASQgCAJAAAGIACALIgOAAIgBgKQgHAGgHADQgFADgHAAQgLAAgHgHgAAOABIgLABQgLABgEACQgFABgDAEQgCADAAAFQAAAFAEAEQAEADAHAAQAGAAAFgDQAHgEADgGQAEgGACgLIgGABg");
	this.shape_432.setTransform(235.525,110.825);

	this.shape_433 = new cjs.Shape();
	this.shape_433.graphics.f("#FFFFFF").s().p("AAaA2IALg0QAEgSAHgWIgMAXIgnBFIgNAAIgLhEIgCgWIgEAWIgOBEIgOAAIAWhrIASAAIALBFIADAaQAEgLAJgSIAmhCIASAAIgWBrg");
	this.shape_433.setTransform(225.625,109.325);

	this.shape_434 = new cjs.Shape();
	this.shape_434.graphics.f("#FFFFFF").s().p("AAMAoIAKgxIACgKQAAgEgDgCQgCgDgGAAQgJAAgIAHQgHAIgEARIgIAkIgNAAIAQhNIANAAIgDAOQAHgIAGgEQAHgEAHAAQAJAAAGAFQAFAFAAAJIgBAOIgKAug");
	this.shape_434.setTransform(210.45,110.725);

	this.shape_435 = new cjs.Shape();
	this.shape_435.graphics.f("#FFFFFF").s().p("AgRA2IAQhNIANAAIgQBNgAACgmIADgPIANAAIgDAPg");
	this.shape_435.setTransform(205.125,109.325);

	this.shape_436 = new cjs.Shape();
	this.shape_436.graphics.f("#FFFFFF").s().p("AgXAnIgMhNIANAAIAGAqIADAXIAKgTIAZguIAOAAIgsBNg");
	this.shape_436.setTransform(200.2,110.8);

	this.shape_437 = new cjs.Shape();
	this.shape_437.graphics.f("#FFFFFF").s().p("AgVAlQgHgEgEgIQgDgIAAgJQAAgMAFgMQAHgMAJgGQAJgGAKAAQAOAAAJAJQAIAIAAAPIgBALIg5AAIAAAEQAAALAFAGQAFAGAHAAQAHAAAGgFQAHgEADgJIANACQgDAJgJAJQgLAJgNAAQgJAAgHgEgAgJgYQgHAGgEAMIArAAIAAgDQAAgKgEgFQgGgFgIAAQgHAAgHAFg");
	this.shape_437.setTransform(191.45,110.825);

	this.shape_438 = new cjs.Shape();
	this.shape_438.graphics.f("#FFFFFF").s().p("AAXA2Igeg2IgWATIgIAjIgOAAIAWhrIAPAAIgLA0IA5g0IAUAAIgxAsIAkA/g");
	this.shape_438.setTransform(182.925,109.325);

	this.shape_439 = new cjs.Shape();
	this.shape_439.graphics.f("#FFCC99").s().p("AgpA1IABgMIAIABQAEAAADgCQACgCAFgHIADgIIgMhNIAMAAIAHAoIACAWIAjg+IANAAIgxBYQgGAMgGAFQgGAEgHAAIgJgCg");
	this.shape_439.setTransform(232.95,93.575);

	this.shape_440 = new cjs.Shape();
	this.shape_440.graphics.f("#FFCC99").s().p("AgNAyQgGgEgDgIIgDAPIgMAAIAXhrIANAAIgIAnQAGgGAEgCQAFgDAGAAQALAAAHAIQAIAIAAAPQAAAKgDAJQgDAIgFAGQgEAGgFAEQgEADgFACQgFACgEAAQgHAAgGgFgAgEgKQgGAGgEAKQgDAJAAAGIAAACQAAAKAFAFQAEAGAHAAQAGAAAGgFQAGgFAEgKQADgLAAgIQAAgJgEgGQgFgFgHAAQgHAAgFAFg");
	this.shape_440.setTransform(224.675,90.625);

	this.shape_441 = new cjs.Shape();
	this.shape_441.graphics.f("#FFCC99").s().p("AgZAgQgIgIAAgPQAAgLAFgNQAFgMAKgGQAJgHALAAQAMAAAIAHQAHAHAAAMIgNABQAAgIgEgEQgFgEgGAAQgIAAgFAFQgGAFgEALQgCAJAAAJQAAAKADAFQAFAFAHAAQAFAAAGgFQAGgFADgKIANACQgEAOgJAHQgKAIgKAAQgOAAgHgJg");
	this.shape_441.setTransform(213,92.025);

	this.shape_442 = new cjs.Shape();
	this.shape_442.graphics.f("#FFCC99").s().p("AgRA2IAQhNIANAAIgQBNgAACgmIADgPIANAAIgDAPg");
	this.shape_442.setTransform(207.625,90.525);

	this.shape_443 = new cjs.Shape();
	this.shape_443.graphics.f("#FFCC99").s().p("AgeAjQgGgGAAgHIACgRIAJgsIAOAAIgKAxIgBAJQAAAFACADQADACAFAAQAGAAAEgDQAFgCAEgFQAEgEACgHIAEgNIAHgiIANAAIgQBNIgNAAIAEgOQgNAQgPAAQgJAAgFgFg");
	this.shape_443.setTransform(194.2,92.1);

	this.shape_444 = new cjs.Shape();
	this.shape_444.graphics.f("#FFCC99").s().p("AAaA2IALg0QAEgSAHgWIgMAXIgnBFIgNAAIgLhEIgCgWIgEAWIgOBEIgOAAIAWhrIASAAIALBFIADAaQAEgLAJgSIAmhCIASAAIgWBrg");
	this.shape_444.setTransform(183.925,90.525);

	this.shape_445 = new cjs.Shape();
	this.shape_445.graphics.f("#D9D9D9").s().p("AgaAoQgJgIgCgQIASgCQACAKAFAEQAFAEAIAAQAJAAAFgDQAEgFAAgEQAAgEgCgCQgCgDgFgBIgNgFQgQgDgGgFQgJgHAAgLQABgIAEgFQADgHAIgDQAIgDAKAAQARAAAJAHQAJAIAAANIgTABQgBgIgDgDQgFgCgHAAQgIAAgEADQgDACgBAEQABADADACQADADANADQAOADAGAEQAGAEAEAEQAEAGAAAKQAAAHgFAHQgEAIgIADQgJADgMAAQgQAAgKgIg");
	this.shape_445.setTransform(251.8,53.1);

	this.shape_446 = new cjs.Shape();
	this.shape_446.graphics.f("#D9D9D9").s().p("AgmAvIAAhdIAiAAQALAAAGACQAIADAGAGQAGAGADAJQADAJAAAMQAAALgDAJQgEAKgGAGQgFAFgIACQgGADgJAAgAgTAfIANAAIALgBQAFgBADgDQADgDABgGQACgGAAgLQAAgKgCgFQgCgHgDgCQgDgEgFgBIgPgBIgIAAg");
	this.shape_446.setTransform(231.45,53.1);

	this.shape_447 = new cjs.Shape();
	this.shape_447.graphics.f("#D9D9D9").s().p("AgiAvIAAhdIBEAAIAAAQIgyAAIAAAVIAuAAIAAAOIguAAIAAAaIAzAAIAAAQg");
	this.shape_447.setTransform(222.425,53.1);

	this.shape_448 = new cjs.Shape();
	this.shape_448.graphics.f("#D9D9D9").s().p("AgbAjQgNgMAAgWQAAgXANgMQALgNATAAQARAAALAKQAGAGADALIgSAFQgCgIgFgEQgFgEgIAAQgJAAgHAIQgGAHAAAQQAAARAGAHQAHAIAJAAQAHAAAGgEQAFgGACgJIASAFQgEAPgJAHQgKAIgPAAQgSAAgLgNg");
	this.shape_448.setTransform(203.8,53.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_13},{t:this.shape_12},{t:this.shape_11,p:{x:235.575}},{t:this.shape_10,p:{x:241.375}},{t:this.shape_9,p:{x:248.225}},{t:this.shape_8},{t:this.shape_7},{t:this.closeButton,p:{x:415.35,y:49.3}},{t:this.fulls},{t:this.mainm},{t:this.audio},{t:this.instruct},{t:this.credits},{t:this.restartl}]},1).to({state:[{t:this.shape_385},{t:this.shape_384},{t:this.shape_383},{t:this.shape_382},{t:this.shape_381,p:{x:123.875}},{t:this.shape_380},{t:this.shape_379},{t:this.shape_11,p:{x:150.925}},{t:this.shape_10,p:{x:156.725}},{t:this.shape_9,p:{x:163.575}},{t:this.shape_378},{t:this.shape_377},{t:this.closeButton,p:{x:556.05,y:49.55}},{t:this.shape_376},{t:this.shape_375},{t:this.shape_374},{t:this.shape_373},{t:this.shape_372},{t:this.shape_371},{t:this.shape_370},{t:this.shape_369},{t:this.shape_368},{t:this.shape_367},{t:this.shape_366},{t:this.shape_365},{t:this.shape_364},{t:this.shape_363},{t:this.shape_362},{t:this.shape_361},{t:this.shape_360},{t:this.shape_359},{t:this.shape_358},{t:this.shape_357},{t:this.shape_356},{t:this.shape_355},{t:this.shape_354},{t:this.shape_353},{t:this.shape_352},{t:this.shape_351},{t:this.shape_350},{t:this.shape_349},{t:this.shape_348},{t:this.shape_347},{t:this.shape_346},{t:this.shape_345},{t:this.shape_344},{t:this.shape_343},{t:this.shape_342},{t:this.shape_341},{t:this.shape_340},{t:this.shape_339},{t:this.shape_338},{t:this.shape_337},{t:this.shape_336},{t:this.shape_335},{t:this.shape_334},{t:this.shape_333},{t:this.shape_332},{t:this.shape_331},{t:this.shape_330},{t:this.shape_329},{t:this.shape_328},{t:this.shape_327},{t:this.shape_326},{t:this.shape_325},{t:this.shape_324},{t:this.shape_323},{t:this.shape_322},{t:this.shape_321},{t:this.shape_320},{t:this.shape_319},{t:this.shape_318},{t:this.shape_317},{t:this.shape_316},{t:this.shape_315},{t:this.shape_314},{t:this.shape_313},{t:this.shape_312},{t:this.shape_311},{t:this.shape_310},{t:this.shape_309},{t:this.shape_308},{t:this.shape_307},{t:this.shape_306},{t:this.shape_305},{t:this.shape_304},{t:this.shape_303},{t:this.shape_302},{t:this.shape_301},{t:this.shape_300},{t:this.shape_299},{t:this.shape_298},{t:this.shape_297},{t:this.shape_296},{t:this.shape_295},{t:this.shape_294},{t:this.shape_293},{t:this.shape_292},{t:this.shape_291},{t:this.shape_290},{t:this.shape_289},{t:this.shape_288},{t:this.shape_287},{t:this.shape_286},{t:this.shape_285},{t:this.shape_284},{t:this.shape_283},{t:this.shape_282},{t:this.shape_281},{t:this.shape_280},{t:this.shape_279},{t:this.shape_278,p:{x:144.4488,y:119.075}},{t:this.shape_277,p:{x:150.325,y:119.05}},{t:this.instance_11},{t:this.shape_276},{t:this.shape_275},{t:this.instance_10},{t:this.shape_274},{t:this.shape_273},{t:this.shape_272},{t:this.shape_271},{t:this.shape_270},{t:this.shape_269},{t:this.shape_268},{t:this.shape_267},{t:this.shape_266},{t:this.shape_265},{t:this.shape_264},{t:this.shape_263},{t:this.shape_262},{t:this.shape_261},{t:this.shape_260},{t:this.shape_259},{t:this.shape_258},{t:this.shape_257},{t:this.shape_256},{t:this.shape_255},{t:this.shape_254},{t:this.shape_253},{t:this.shape_252},{t:this.shape_251},{t:this.shape_250},{t:this.shape_249},{t:this.shape_248},{t:this.shape_247},{t:this.shape_246},{t:this.shape_245},{t:this.shape_244},{t:this.shape_243},{t:this.shape_242},{t:this.shape_241},{t:this.shape_240},{t:this.shape_239},{t:this.shape_238},{t:this.shape_237},{t:this.shape_236},{t:this.shape_235},{t:this.shape_234},{t:this.shape_233},{t:this.shape_232},{t:this.shape_231},{t:this.shape_230},{t:this.shape_229},{t:this.shape_228},{t:this.shape_227},{t:this.shape_226},{t:this.shape_225},{t:this.shape_224},{t:this.shape_223},{t:this.shape_222},{t:this.shape_221},{t:this.shape_220},{t:this.shape_219},{t:this.shape_218},{t:this.shape_217},{t:this.shape_216},{t:this.shape_215},{t:this.shape_214},{t:this.shape_213},{t:this.shape_212},{t:this.shape_211},{t:this.shape_210},{t:this.shape_209},{t:this.shape_208},{t:this.shape_207},{t:this.shape_206},{t:this.shape_205},{t:this.shape_204},{t:this.shape_203},{t:this.shape_202},{t:this.shape_201},{t:this.shape_200},{t:this.shape_199},{t:this.shape_198},{t:this.shape_197},{t:this.shape_196},{t:this.shape_195},{t:this.shape_194},{t:this.shape_193},{t:this.shape_192},{t:this.shape_191},{t:this.shape_190},{t:this.shape_189},{t:this.shape_188},{t:this.shape_187},{t:this.shape_186},{t:this.shape_185},{t:this.shape_184},{t:this.shape_183},{t:this.shape_182},{t:this.shape_181},{t:this.shape_180},{t:this.shape_179},{t:this.shape_178},{t:this.shape_177},{t:this.shape_176},{t:this.shape_175},{t:this.shape_174},{t:this.shape_173},{t:this.shape_172},{t:this.shape_171},{t:this.shape_170},{t:this.shape_169},{t:this.shape_168},{t:this.shape_167},{t:this.instance_9},{t:this.instance_8},{t:this.instance_7},{t:this.instance_6},{t:this.instance_5},{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.shape_166},{t:this.shape_165},{t:this.shape_164},{t:this.shape_163},{t:this.shape_162},{t:this.shape_161},{t:this.shape_160},{t:this.shape_159},{t:this.shape_158},{t:this.shape_157},{t:this.shape_156},{t:this.shape_155},{t:this.shape_154},{t:this.shape_153},{t:this.shape_152},{t:this.shape_151},{t:this.shape_150},{t:this.shape_149},{t:this.shape_148},{t:this.shape_147},{t:this.shape_146},{t:this.shape_145},{t:this.shape_144},{t:this.shape_143},{t:this.shape_142},{t:this.shape_141},{t:this.joistickLeft},{t:this.shape_140},{t:this.shape_139},{t:this.shape_138},{t:this.shape_137},{t:this.shape_136},{t:this.shape_135},{t:this.shape_134},{t:this.shape_133},{t:this.shape_132},{t:this.shape_131},{t:this.shape_130},{t:this.shape_129},{t:this.shape_128},{t:this.shape_127},{t:this.shape_126},{t:this.shape_125},{t:this.shape_124},{t:this.shape_123},{t:this.shape_122},{t:this.shape_121},{t:this.shape_120},{t:this.shape_119},{t:this.shape_118},{t:this.shape_117},{t:this.shape_116},{t:this.shape_115},{t:this.shape_114},{t:this.shape_113},{t:this.shape_112},{t:this.shape_111},{t:this.shape_110},{t:this.shape_109},{t:this.shape_108},{t:this.shape_107},{t:this.shape_106},{t:this.shape_105},{t:this.shape_104},{t:this.shape_103},{t:this.shape_102},{t:this.fireButton},{t:this.shape_101},{t:this.shape_100},{t:this.shape_99},{t:this.shape_98},{t:this.shape_97},{t:this.shape_96},{t:this.shape_95},{t:this.shape_94},{t:this.shape_93},{t:this.shape_92},{t:this.shape_91},{t:this.shape_90},{t:this.shape_89},{t:this.shape_88},{t:this.shape_87},{t:this.shape_86},{t:this.shape_85},{t:this.shape_84},{t:this.shape_83},{t:this.shape_82},{t:this.shape_81},{t:this.shape_80},{t:this.shape_79},{t:this.shape_78},{t:this.shape_77},{t:this.shape_76},{t:this.shape_75},{t:this.shape_74},{t:this.instance},{t:this.shape_73},{t:this.shape_72},{t:this.shape_71},{t:this.shape_70},{t:this.shape_69},{t:this.shape_68},{t:this.shape_67},{t:this.shape_66},{t:this.shape_65},{t:this.shape_64},{t:this.shape_63},{t:this.shape_62},{t:this.shape_61},{t:this.shape_60},{t:this.shape_59},{t:this.shape_58},{t:this.shape_57},{t:this.shape_56},{t:this.shape_55},{t:this.shape_54},{t:this.shape_53},{t:this.shape_52},{t:this.shape_51},{t:this.shape_50},{t:this.shape_49},{t:this.shape_48},{t:this.shape_47},{t:this.shape_46},{t:this.shape_45},{t:this.shape_44},{t:this.shape_43},{t:this.shape_42},{t:this.shape_41},{t:this.shape_40},{t:this.shape_39},{t:this.shape_38},{t:this.shape_37},{t:this.shape_36},{t:this.shape_35},{t:this.shape_34},{t:this.shape_33},{t:this.shape_32},{t:this.shape_31},{t:this.shape_30},{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20},{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14}]},1).to({state:[{t:this.shape_448},{t:this.shape_381,p:{x:213.675}},{t:this.shape_447},{t:this.shape_446},{t:this.shape_10,p:{x:237.825}},{t:this.shape_11,p:{x:243.575}},{t:this.shape_445},{t:this.closeButton,p:{x:451.45,y:49.55}},{t:this.shape_444},{t:this.shape_443},{t:this.shape_278,p:{x:201.9488,y:92.025}},{t:this.shape_442},{t:this.shape_441},{t:this.shape_440},{t:this.shape_439},{t:this.shape_277,p:{x:238.675,y:92}},{t:this.shape_438},{t:this.shape_437},{t:this.shape_436},{t:this.shape_435},{t:this.shape_434},{t:this.shape_433},{t:this.shape_432},{t:this.shape_431},{t:this.shape_430},{t:this.shape_429},{t:this.shape_428},{t:this.shape_427},{t:this.shape_426},{t:this.shape_425},{t:this.shape_424},{t:this.shape_423},{t:this.shape_422},{t:this.shape_421},{t:this.shape_420},{t:this.shape_419},{t:this.shape_418},{t:this.shape_417},{t:this.shape_416},{t:this.shape_415},{t:this.shape_414},{t:this.shape_413},{t:this.shape_412},{t:this.shape_411},{t:this.shape_410},{t:this.incom},{t:this.shape_409},{t:this.shape_408},{t:this.shape_407},{t:this.shape_406},{t:this.shape_405},{t:this.shape_404},{t:this.shape_403},{t:this.shape_402},{t:this.shape_401},{t:this.shape_400},{t:this.shape_399},{t:this.shape_398},{t:this.shape_397},{t:this.shape_396},{t:this.shape_395},{t:this.shape_394},{t:this.shape_393},{t:this.shape_392},{t:this.shape_391},{t:this.shape_390},{t:this.shape_389},{t:this.shape_388},{t:this.shape_387},{t:this.shape_386},{t:this.audionautix}]},1).to({state:[]},1).wait(1));

	// ramis
	this.shape_449 = new cjs.Shape();
	this.shape_449.graphics.f().s("#CCCCCC").ss(0.2,1,1).p("AyHAAMAkPAAA");
	this.shape_449.setTransform(321.45,71.5);

	this.shape_450 = new cjs.Shape();
	this.shape_450.graphics.f().s("#CCCCCC").ss(1,1,1,3,true).p("AyH3IMAkPAAAIAAFjMAAAAouMgkPAAAMAAAgoug");
	this.shape_450.setTransform(321.45,184.075);

	this.shape_451 = new cjs.Shape();
	this.shape_451.graphics.f("#3B3B3B").s().p("AyHUXMAAAgotMAkPAAAMAAAAotg");
	this.shape_451.setTransform(321.45,201.825);

	this.shape_452 = new cjs.Shape();
	this.shape_452.graphics.f("#333333").s().p("AyHCxIAAliMAkPAAAIAAFig");
	this.shape_452.setTransform(321.45,53.75);

	this.shape_453 = new cjs.Shape();
	this.shape_453.graphics.f().s("#CCCCCC").ss(0.2,1,1).p("Egm3AAAMBNvAAA");
	this.shape_453.setTransform(329.45,71.5);

	this.shape_454 = new cjs.Shape();
	this.shape_454.graphics.f().s("#CCCCCC").ss(1,1,1,3,true).p("Egm3gUEMBNvAAAIAAFjMAAAAimMhNvAAAMAAAgimg");
	this.shape_454.setTransform(329.45,164.475);

	this.shape_455 = new cjs.Shape();
	this.shape_455.graphics.f("#3B3B3B").s().p("Egm3ARTMAAAgilMBNvAAAMAAAAilg");
	this.shape_455.setTransform(329.45,182.225);

	this.shape_456 = new cjs.Shape();
	this.shape_456.graphics.f("#333333").s().p("Egm3ACxIAAliMBNvAAAIAAFig");
	this.shape_456.setTransform(329.45,53.75);

	this.shape_457 = new cjs.Shape();
	this.shape_457.graphics.f().s("#CCCCCC").ss(0.2,1,1).p("A3vAAMAvfAAA");
	this.shape_457.setTransform(321.45,71.5);

	this.shape_458 = new cjs.Shape();
	this.shape_458.graphics.f().s("#CCCCCC").ss(1,1,1,3,true).p("A3v0EMAvfAAAIAAFjMAAAAimMgvfAAAMAAAgimg");
	this.shape_458.setTransform(321.45,164.475);

	this.shape_459 = new cjs.Shape();
	this.shape_459.graphics.f("#3B3B3B").s().p("A3vRTMAAAgilMAvfAAAMAAAAilg");
	this.shape_459.setTransform(321.45,182.225);

	this.shape_460 = new cjs.Shape();
	this.shape_460.graphics.f("#333333").s().p("A3vCxIAAliMAvfAAAIAAFig");
	this.shape_460.setTransform(321.45,53.75);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_452},{t:this.shape_451},{t:this.shape_450},{t:this.shape_449}]},1).to({state:[{t:this.shape_456},{t:this.shape_455},{t:this.shape_454},{t:this.shape_453}]},1).to({state:[{t:this.shape_460},{t:this.shape_459},{t:this.shape_458},{t:this.shape_457}]},1).to({state:[]},1).wait(1));

	// background
	this.shape_461 = new cjs.Shape();
	this.shape_461.graphics.f("rgba(0,0,0,0.298)").s().p("EgyAAcIMAAAg4PMBkBAAAMAAAA4Pg");
	this.shape_461.setTransform(331.25,180);
	this.shape_461._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape_461).wait(1).to({_off:false},0).wait(2).to({_off:true},1).wait(1));

	// Layer 3
	this.shape_462 = new cjs.Shape();
	this.shape_462.graphics.f("#262626").s().p("AyLXDMAAAguFMAkXAAAMAAAAuFg");
	this.shape_462.setTransform(324.025,188.475);

	this.shape_463 = new cjs.Shape();
	this.shape_463.graphics.f("#262626").s().p("Egm4AUGMAAAgoLMBNxAAAMAAAAoLg");
	this.shape_463.setTransform(333.275,167.6);

	this.shape_464 = new cjs.Shape();
	this.shape_464.graphics.f("#262626").s().p("A34UGMAAAgoLMAvxAAAMAAAAoLg");
	this.shape_464.setTransform(324.475,167.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_462}]},1).to({state:[{t:this.shape_463}]},1).to({state:[{t:this.shape_464}]},1).to({state:[]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,651.3,360);


(lib.onScreen = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		if(mobile) this.lockTxt.visible = false;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer_1
	this.lockTxt = new lib.lockTxt();
	this.lockTxt.name = "lockTxt";
	this.lockTxt.parent = this;
	this.lockTxt.setTransform(331.75,348.75,1,1,0,0,0,1,1.6);

	this.enemyTextTotal = new cjs.Text("/ 80", "10px 'Arial'", "#E6E6E6");
	this.enemyTextTotal.name = "enemyTextTotal";
	this.enemyTextTotal.lineHeight = 13;
	this.enemyTextTotal.lineWidth = 32;
	this.enemyTextTotal.parent = this;
	this.enemyTextTotal.setTransform(343.05,3.75);

	this.fireButton = new lib.fireButton();
	this.fireButton.name = "fireButton";
	this.fireButton.parent = this;
	this.fireButton.setTransform(580.5,247.2,0.4918,0.4918);

	this.joistickLeft = new lib.joystickLeft();
	this.joistickLeft.name = "joistickLeft";
	this.joistickLeft.parent = this;
	this.joistickLeft.setTransform(67.9,287.8,0.4667,0.4667,0,0,0,0.6,0.6);

	this.enemyText = new cjs.Text("Enemies: 80", "12px 'Arial'", "#E6E6E6");
	this.enemyText.name = "enemyText";
	this.enemyText.textAlign = "right";
	this.enemyText.lineHeight = 15;
	this.enemyText.lineWidth = 91;
	this.enemyText.parent = this;
	this.enemyText.setTransform(339,2);

	this.healthScreen = new lib.gmenu();
	this.healthScreen.name = "healthScreen";
	this.healthScreen.parent = this;
	this.healthScreen.setTransform(0.7,-0.1,0.6539,0.6547,0,0,0,0.1,0.1);

	this.bulletScreen = new lib.bullets_1();
	this.bulletScreen.name = "bulletScreen";
	this.bulletScreen.parent = this;
	this.bulletScreen.setTransform(612.75,2.85,0.5893,0.5885,0,0,0,84.3,-0.4);

	this.temeklis = new lib.temeklis();
	this.temeklis.name = "temeklis";
	this.temeklis.parent = this;
	this.temeklis.setTransform(317.55,177.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.temeklis},{t:this.bulletScreen},{t:this.healthScreen},{t:this.enemyText},{t:this.joistickLeft},{t:this.fireButton},{t:this.enemyTextTotal},{t:this.lockTxt}]}).wait(1));

	// Layer_2
	this.gun = new lib.gun();
	this.gun.name = "gun";
	this.gun.parent = this;
	this.gun.setTransform(-131.5,-3.55,0.9597,0.9596,0,0,0,-10.5,79.3);

	this.timeline.addTween(cjs.Tween.get(this.gun).wait(1));

}).prototype = getMCSymbolPrototype(lib.onScreen, new cjs.Rectangle(3.9,0,627.8000000000001,470.5), null);


(lib.menu = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var men = this;
		men.stop();
		setTimeout(stopit,10);
		
		function stopit(){
		if (backgroundSound) backgroundSound.stop();
		setTimeout(playsound,10);	
		
		}
		function playsound() {
			backgroundSound = createjs.Sound.play("sakumamuzons",createjs.Sound.INTERRUPT_EARLY, 0, 0, -1);	
		}
		
		men.playButton.addEventListener("click", playGame);
		men.moreButton.addEventListener("click", playMore);
		
		
		function playGame()
		{	
			removeListeners();	
			//exportRoot.gotoAndStop(2);
			men.gotoAndStop(1);
		}
		
		function playMore()
		{
		var gotourl;
			if(mobile) {
			gotourl = "https://m.1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=moregames&utm_source=" + ref;	
			} else {
			gotourl = "https://1000webgames.com/?utm_campaign=bullet_fury_html5&utm_medium=moregames&utm_source=" + ref;
			}
			window.open(gotourl, "_blank");	
		}
		
		function removeListeners() {
			men.playButton.removeEventListener("click", playGame);
			men.moreButton.removeEventListener("click", playMore);
		}
	}
	this.frame_1 = function() {
		var men2 = this;
		men2.stop();
		
		men2.closeButton.addEventListener("click", closeDiff);
		men2.easyButton.addEventListener("click", playEasy);
		men2.normalButton.addEventListener("click", playNormal);
		men2.hardButton.addEventListener("click", playHard);
		
		function closeDiff() {
			men2.gotoAndStop(0);
			removeListeners();
		}
		function playEasy() {
			difficulty = 0;
			removeListeners();
			exportRoot.gotoAndStop(2);
		}
		function playNormal() {
			difficulty = 1;
			removeListeners();
			exportRoot.gotoAndStop(2);
		}
		function playHard() {
			difficulty = 2;
			removeListeners();
			exportRoot.gotoAndStop(2);
		}
		function removeListeners() {
			men2.closeButton.removeEventListener("click", closeDiff);
			men2.easyButton.removeEventListener("click", playEasy);
			men2.normalButton.removeEventListener("click", playNormal);
			men2.hardButton.removeEventListener("click", playHard);
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(2));

	// Layer 1
	this.moreButton = new lib.moregamesbutton2();
	this.moreButton.name = "moreButton";
	this.moreButton.parent = this;
	this.moreButton.setTransform(97.5,91.2,1,1,0,0,0,97.5,16);

	this.playButton = new lib.playButton();
	this.playButton.name = "playButton";
	this.playButton.parent = this;
	this.playButton.setTransform(109,62.1,1,1,0,0,0,109,24.5);

	this.hardButton = new lib.hardbutton();
	this.hardButton.name = "hardButton";
	this.hardButton.parent = this;
	this.hardButton.setTransform(310.45,4.95,1,1,0,0,0,97.5,16);

	this.normalButton = new lib.normalbutton();
	this.normalButton.name = "normalButton";
	this.normalButton.parent = this;
	this.normalButton.setTransform(310.45,-37.3,1,1,0,0,0,97.5,16);

	this.easyButton = new lib.easybutton();
	this.easyButton.name = "easyButton";
	this.easyButton.parent = this;
	this.easyButton.setTransform(310.45,-79.55,1,1,0,0,0,97.5,16);

	this.closeButton = new lib.closeoptions();
	this.closeButton.name = "closeButton";
	this.closeButton.parent = this;
	this.closeButton.setTransform(404.3,-132.05,0.6667,0.6664,0,0,0,10.1,9.8);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D9D9D9").s().p("AgIAvIAAgoIgig1IAVAAIAVAlIAVglIAWAAIgiA1IAAAog");
	this.shape.setTransform(274.6,-125.65);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#D9D9D9").s().p("AgIAvIAAhNIgcAAIAAgQIBJAAIAAAQIgcAAIAABNg");
	this.shape_1.setTransform(266.275,-125.65);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D9D9D9").s().p("AggAuIAAhbIATAAIAABMIAuAAIAAAPg");
	this.shape_2.setTransform(259.575,-125.625);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#D9D9D9").s().p("AgSAsQgHgDgEgFQgEgFgCgFQgBgIAAgQIAAgwIASAAIAAAxQAAAMABAEQACAFAEAEQAFADAGAAQAIAAAFgDQADgDABgFIABgQIAAgyIATAAIAAAwQAAAQgCAHQgBAHgEAFQgEAFgHADQgHACgLAAQgNAAgGgDg");
	this.shape_3.setTransform(250.55,-125.575);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D9D9D9").s().p("AgbAjQgNgMAAgWQAAgXANgNQALgMATAAQARAAALAKQAGAGADALIgSAFQgCgIgFgEQgFgEgIAAQgJAAgHAIQgGAHAAAQQAAARAGAHQAHAIAJAAQAHAAAGgFQAFgEACgKIASAFQgEAPgJAIQgKAHgPAAQgSAAgLgNg");
	this.shape_4.setTransform(241.15,-125.65);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D9D9D9").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_5.setTransform(234.725,-125.65);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D9D9D9").s().p("AgfAvIAAhdIA/AAIAAAQIgsAAIAAAWIAmAAIAAAPIgmAAIAAAog");
	this.shape_6.setTransform(229.1,-125.65);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D9D9D9").s().p("AgfAvIAAhdIA/AAIAAAQIgsAAIAAAWIAmAAIAAAPIgmAAIAAAog");
	this.shape_7.setTransform(221.15,-125.65);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#D9D9D9").s().p("AgIAvIAAhdIARAAIAABdg");
	this.shape_8.setTransform(215.225,-125.65);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#D9D9D9").s().p("AgmAvIAAhdIAiAAQALABAGABQAIACAGAHQAGAGADAJQADAJAAAMQAAALgDAJQgEAKgGAGQgFAFgIACQgHACgIABgAgTAfIANAAIALgBQAEgBADgDQAEgDABgGQACgGAAgLQAAgKgCgFQgCgHgDgCQgDgEgGgBQgDgBgLAAIgIAAg");
	this.shape_9.setTransform(208.85,-125.65);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.playButton},{t:this.moreButton}]}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.closeButton},{t:this.easyButton},{t:this.normalButton},{t:this.hardButton}]},1).wait(2));

	// Layer 2
	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("#CCCCCC").ss(0.2,1,1).p("AyHAAMAkPAAA");
	this.shape_10.setTransform(310.4,-109.85);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f().s("#CCCCCC").ss(1,1,1,3,true).p("AyHuMMAkPAAAIAAFjIAAW2MgkPAAAIAA22g");
	this.shape_11.setTransform(310.4,-54.475);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#3B3B3B").s().p("AyHLbIAA21MAkPAAAIAAW1g");
	this.shape_12.setTransform(310.4,-36.725);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#333333").s().p("AyHCxIAAliMAkPAAAIAAFig");
	this.shape_13.setTransform(310.4,-127.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},1).to({state:[]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-7.5,-146.3,434.9,253.5);


// stage content:
(lib.bulletfuryhtml5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{first:1,level1:2});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		readMemory();
		
		
		//stage.addEventListener("click", setFocus.bind(this));
		
		function setFocus()
		{
			window.focus();
		}
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_2 = function() {
		this.stop();
		startGame();
		
		//setTimeout(stopit,10000);
		
		function stopit(){
		//canvas.style.display = "block";	
		
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1));

	// fullscreen
	this.pausebutton = new lib.settings1();
	this.pausebutton.name = "pausebutton";
	this.pausebutton.parent = this;
	this.pausebutton.setTransform(-277.1,12.7,1,1,0,0,0,-265.9,12.7);
	this.pausebutton._off = true;

	this.timeline.addTween(cjs.Tween.get(this.pausebutton).wait(1).to({_off:false},0).wait(2));

	// game menu
	this.instance = new lib.menuscore();
	this.instance.parent = this;
	this.instance.setTransform(602.2,11.2,1,1,0,0,0,37.8,11.2);

	this.instance_1 = new lib.menu();
	this.instance_1.parent = this;
	this.instance_1.setTransform(74.65,253.4,1,1,0,0,0,58.3,16);

	this.onScreen = new lib.onScreen();
	this.onScreen.name = "onScreen";
	this.onScreen.parent = this;
	this.onScreen.setTransform(246.2,233.5,1,1,0,0,0,246.2,233.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1},{t:this.instance}]},1).to({state:[{t:this.onScreen}]},1).wait(1));

	// Actions
	this.movieClip_2 = new lib.webgamespreloader();
	this.movieClip_2.name = "movieClip_2";
	this.movieClip_2.parent = this;

	this.instance_2 = new lib.sakums();
	this.instance_2.parent = this;
	this.instance_2.setTransform(0,0,0.64,0.64);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.movieClip_2}]}).to({state:[{t:this.instance_2}]},1).to({state:[]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(320,179.9,338.1,290.6);
// library properties:
lib.properties = {
	id: '064A5EF8A526134DBB45A732B5EC511C',
	width: 640,
	height: 360,
	fps: 60,
	color: "#2B2B2B",
	opacity: 0.00,
	manifest: [
		{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", id:"_1000WebGames"},
		{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", id:"_1000Games"},
		{src:"images/_1000bulta.png", id:"_1000bulta"},
		{src:"images/bullets.png", id:"bullets"},
		{src:"images/button.png", id:"button"},
		{src:"images/drag.png", id:"drag"},
		{src:"images/explosion.png", id:"explosion"},
		{src:"images/gunshot.png", id:"gunshot"},
		{src:"images/health.png", id:"health"},
		{src:"images/joystick.png", id:"joystick"},
		{src:"images/joystick2.png", id:"joystick2"},
		{src:"images/mouse.png", id:"mouse"},
		{src:"images/pause.png", id:"pause"},
		{src:"images/roka2.png", id:"roka2"},
		{src:"images/sakums.jpg", id:"sakums"},
		{src:"images/settings.png", id:"settings"},
		{src:"images/shoot.png", id:"shoot"},
		{src:"images/smoke.png", id:"smoke"},
		{src:"images/smoke2.png", id:"smoke2"},
		{src:"images/smoke3.png", id:"smoke3"},
		{src:"images/star0.png", id:"star0"},
		{src:"images/star1.png", id:"star1"},
		{src:"images/star2.png", id:"star2"},
		{src:"images/star3.png", id:"star3"},
		{src:"sounds/ah.mp3", id:"ah"},
		{src:"sounds/au.mp3", id:"au"},
		{src:"sounds/fonamuzons.mp3", id:"fonamuzons"},
		{src:"sounds/gun1.mp3", id:"gun1"},
		{src:"sounds/gun1hero.mp3", id:"gun1hero"},
		{src:"sounds/pick.mp3", id:"pick"},
		{src:"sounds/reload.mp3", id:"reload"},
		{src:"sounds/sakumamuzons.mp3", id:"sakumamuzons"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['064A5EF8A526134DBB45A732B5EC511C'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(window.createjs, window.AdobeAn);