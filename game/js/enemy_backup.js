(function (window) {
    function Enemy(image) {
        this.initialize(image);
    }
    Enemy.prototype = new Bitmap();

    Enemy.prototype.Bitmap_initialize = Enemy.prototype.initialize;
   
    Enemy.prototype.initialize = function (image) {

        this.Bitmap_initialize(image);
        this.name = 'Enemy';
        this.snapToPixel = true;
    };

	
    window.Enemy = Enemy;
} (window));