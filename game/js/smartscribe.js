var		SCRIBE_IMAGE = 'assets/scribe.png',
		PLATFORM_IMAGE = 'assets/platform.png',
		FLY_IMAGE = 'assets/fly.png',
		ENEMY_IMAGE = 'assets/enemy.png',
		BASE_WIDTH = 800,
		BASE_HEIGHT = 400,
		GRID_HORIZONTAL = 8,
		GRID_VERTICAL = 4,
		pause = 0;
function _game()
{
	window.Game = this;
	var self = this,
		w = getWidth(),
		h = getHeight(),
		// to have a good looking scaling
		// we will snap all values to 0.5-steps
		// so 1.4 e.g. becomes 1.5 - you can also
		// set the snapping to 1.0 e.g.
		// however I would recommend to use only 
		// a multiple of 0.5 - but play around
		// with it and see the results
		scale = snapValue(Math.min(w/BASE_WIDTH,h/BASE_HEIGHT),.5),
		ticks = 0,
		canvas,ctx,
		stage,
		background,
		background_2,
		world,
		scribe, fly, enemy, enemies = [],
		assets = [], spriteSheets = [],
		parallaxObjects = [], highscore = 0,
		keyDown = false;

	self.width = w;
	self.height = h;
	self.scale = scale;

	// holds all collideable objects
	var collideables = [];
	self.getCollideables = function() { return collideables; };

	// starts to load all the assets
	self.preloadResources = function() {
		self.loadImage(SCRIBE_IMAGE);
		self.loadImage(PLATFORM_IMAGE);
		self.loadImage(FLY_IMAGE);
	}

	var requestedAssets = 0,
		loadedAssets = 0;
	// loads the assets and keeps track 
	// of how many assets where there to
	// be loaded
	self.loadImage = function(e) {
		var img = new Image();
		img.onload = self.onLoadedAsset;
		img.src = e;

		assets[e] = img;

		++requestedAssets;
	}
	// each time an asset is loaded
	// check if all assets are complete
	// and initialize the game, if so
	self.onLoadedAsset = function(e) {
		++loadedAssets;
		if ( loadedAssets == requestedAssets ) {
			self.initializeGame();
		}
	}

	self.initializeGame = function() {
		assets[SCRIBE_IMAGE] = nearestNeighborScale(assets[SCRIBE_IMAGE], scale);
		assets[PLATFORM_IMAGE] = nearestNeighborScale(assets[PLATFORM_IMAGE], scale);
		assets[FLY_IMAGE] = nearestNeighborScale(assets[FLY_IMAGE], scale);

		self.initializeSpriteSheets();

		// creating the canvas-element
		canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		document.body.appendChild(canvas);

		// initializing the stage
		stage = new Stage(canvas);

		background = self.createBgGrid(GRID_HORIZONTAL,GRID_VERTICAL);
		stage.addChild(background);

		// create and add another background-
		// /parallax-layer
		background_2 = new Container();
		stage.addChild(background_2);
		for ( var c = 0; c < 4; c++) {
			// create a line
			var line = self.createPixelLine((Math.random()*3+1)|0);
			// add it to the scene
			background_2.addChild(line);
			// and push it to the parallaxObjects
			// don't forget to initialize that array
			parallaxObjects.push(line);
		}

		world = new Container();
		stage.addChild(world);

		// creating the Scribe, and assign an image
		// also position the scribe in the middle of the screen
		scribe = new Scribe(assets[SCRIBE_IMAGE]);
		fly = new BitmapAnimation(spriteSheets[FLY_IMAGE]);
		fly.gotoAndPlay('fly');

		self.reset();

		// Setting the listeners
		if ('ontouchstart' in document.documentElement) {
			canvas.addEventListener('touchstart', function(e) {
				self.handleKeyDown();
			}, false);

			canvas.addEventListener('touchend', function(e) {
				self.handleKeyUp();
			}, false);
		} else {
			document.onkeydown = self.handleKeyDown;
			document.onkeyup = self.handleKeyUp;
			document.onmousedown = self.handleMouseDown;
			document.onmouseup = self.handleKeyUp;
		}
		
		Ticker.setFPS(30);
		Ticker.addListener(self.tick, self);
	}
	self.initializeSpriteSheets = function() {
		var flyData = {
			images: [assets[FLY_IMAGE]],
			frames: {
				height: 6 * scale,
				width: 16 * scale,
				regX: 8 * scale,
				regY: 3 * scale,
				count: 2
			},
			animations: {
				fly: {
					frames:[0, 1],
					frequency: 4
				}
			}
		}
		spriteSheets[FLY_IMAGE] = new SpriteSheet(flyData);
	}

	self.reset = function() {
		collideables = [];
		self.lastPlatform = null;
		world.removeAllChildren();
		world.x = world.y = 0;

		scribe.x = 50 * scale;
		scribe.y = h/2 + 50 * scale;
		scribe.reset();
		world.addChild(scribe);
		world.addChild(fly);

		// add a platform for the scribe to collide with
		self.addPlatform(10 * scale, h/1.25);

		var c, l = w / (assets[PLATFORM_IMAGE].width * 1.5) + 2, atX=0, atY = h/1.25;

		for ( c = 1; c < l; c++ ) {
			var atX = (c-.5) * assets[PLATFORM_IMAGE].width*2 + (Math.random()*assets[PLATFORM_IMAGE].width-assets[PLATFORM_IMAGE].width/2);
			var atY = atY + (Math.random() * 300 - 150) * scale;
			self.addPlatform(atX,atY);
		}
	}

	self.tick = function(e)
	{
		if (pause == 0) {
		var c,p,l;
		ticks++;

		scribe.tick();
		if (ticks == 1)
			pause = 1;
		if ( scribe.y > h*3 ) {
			if (ticks > highscore) {
				highscore = ticks;
			}
			ticks = 0;
			self.reset();
			return;
		}

		// the movement of the fly
		// calculate an offset to create a "swirling-like" behaviour
		fly.offsetX = ( Math.cos(ticks/10) * 10) * scale;
		fly.offsetY = ( Math.sin(ticks/ 7) *  5) * scale;
		// smoothly follow the scribe by 10% of the distance every frame
		fly.x = fly.x + (scribe.x - fly.x) * .1 + fly.offsetX;
		fly.y = fly.y + (scribe.y - fly.y) * .1 + fly.offsetY;

		// if the scribe "leaves" it's bounds of
		// screenWidth * 0.3 and screenHeight * 0.3(to both ends)
		// we will reposition the "world-container", so our scribe
		// is always visible
		if ( scribe.x > w*.3 ) {
			world.x = -scribe.x + w*.3;
		}
		if ( scribe.y > h*.7 ) {
			world.y = -scribe.y + h*.7;
		} else if ( scribe.y < h*.3 ) {
			world.y = -scribe.y + h*.3;
		}

		l = collideables.length;
		for ( c = 0; c < l; c++ ) {
			p = collideables[c];
			if ( p.localToGlobal(p.image.width,0).x < -10 ) {
				self.movePlatformToEnd(p);
			}
		}

		// the background 'moves' about 45% of the speed of the world-object
		// and it's position snaps back to zero once it's reached a limit 
		background.x = (world.x * .45) % (w/GRID_HORIZONTAL);
		background.y = (world.y * .45) % (h/GRID_VERTICAL);

		l = parallaxObjects.length;
		for ( c = 0; c < l; c++ ) {
			p = parallaxObjects[c];
			// just change the x-coordinate
			// a change in the y-coordinate would not have any
			// result, since it's just a white line
			p.x = ((world.x * p.speedFactor - p.offsetX) % p.range) + p.range;
		}

		stage.update();
		
		
		canvas.getContext("2d").font = "30px Impact";
		canvas.getContext("2d").fillStyle = "ffffff";
		canvas.getContext("2d").fillText("Score: " + ticks, 10, 30);
		canvas.getContext("2d").fillText("High Score: " + highscore, 10, 60);
		}
		else {
			canvas.getContext("2d").font = "30px Arial";
			canvas.getContext("2d").fillText("Click to Start", 250, 320);
		}
	}
	
	self.createBgGrid = function(numX, numY) {
		var grid = new Container();
		grid.snapToPixel = true;
		// calculating the distance between
		// the grid-lines
		var gw = w/numX;
		var gh = h/numY;
		// drawing the vertical line
		var verticalLine = new Graphics();
		//verticalLine.beginFill(Graphics.getRGB(101, 60, 176));
		verticalLine.drawRect(0,0,gw * 0.03,gh*(numY+2));
		var vs;
		// placing the vertical lines:
		// we're placing 1 more than requested
		// to have seamless scrolling later
		for ( var c = -1; c < numX+1; c++) {
			vs = new Shape(verticalLine);
			vs.snapToPixel = true;
			vs.x = c * gw;
			vs.y = -gh;
			grid.addChild(vs);
		}
		// drawing a horizontal line
		var horizontalLine = new Graphics();
		//horizontalLine.beginFill(Graphics.getRGB(101, 60, 176));
		horizontalLine.drawRect(0,0,gw*(numX+1),gh * 0.03);
		var hs;
		// placing the horizontal lines:
		// we're placing 1 more than requested
		// to have seamless scrolling later
		for ( c = -1; c < numY+1; c++ ) {
			hs = new Shape(horizontalLine);
			hs.snapToPixel = true;
			hs.x = 0;
			hs.y = c * gh;
			grid.addChild(hs);
		}

		// return the grid-object
		return grid;
	}

	self.createPixelLine = function(width) {
		// adjusting the width to the games scale
		// but not smaller than 1px and round it
		// to only have full pixels to render or
		// anti-aliasing will slow everything down
		width = Math.max(Math.round(width * scale),1);
		// drawing the line
		vl = new Graphics();
		//vl.beginFill(Graphics.getRGB(255,255,255));
		vl.drawRect(0,0,width,h);

		lineShape = new Shape(vl);
		lineShape.snapToPixel = true;
		// the thinner the line, the less alpha
		// to make it look like it's further away
		lineShape.alpha = width * .25;
		// if it's further away, make it move slower
		lineShape.speedFactor = 0.3 + lineShape.alpha * 0.3 + Math.random() * 0.2;
		// the range defines when the line will be
		// moved back to the end of the screen
		lineShape.range = w + Math.random() * w * .3;
		// every line needs an offset, so they
		// don't start off at the same position
		lineShape.offsetX = Math.random() * w;
		
		return lineShape;
	}

	// this method adds a platform at the
	// given x- and y-coordinates and adds
	// it to the collideables-array
	self.lastPlatform = null;
	self.addPlatform = function(x,y) {
		x = Math.round(x);
		y = Math.round(y);

		var platform = new Bitmap(assets[PLATFORM_IMAGE]);
		platform.x = x;
		platform.y = y;
		platform.snapToPixel = true;

		world.addChild(platform);
		collideables.push(platform);
		self.lastPlatform = platform;
	}

	self.onImageLoaded = function(e) {
    		var myBitmap = new Bitmap(img);
    		enemyLayer.addChild(myBitmap);
    }
	self.movePlatformToEnd = function(platform) {
		platform.x = self.lastPlatform.x + platform.image.width*2 + (Math.random()*platform.image.width*2 - platform.image.width);
		platform.y = self.lastPlatform.y + (Math.random() * 300 - 150)* scale;
		self.lastPlatform = platform;
	}

	self.handleKeyDown = function(e)
	{
		if ( !keyDown ) {
			keyDown = true;
			scribe.jump();
		}
	}

	self.handleKeyUp = function(e)
	{
		keyDown = false;
	}
	self.handleMouseDown = function(e) {
		if (pause == 0)
			pause = 1;
		else
			pause = 0;
	}
	self.preloadResources();
};

new _game();