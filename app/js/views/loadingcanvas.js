
var LoadingCanvas = function (parent) {

    this.parent = parent;

    this.total = 5;
    this.loaded = 0;

    this.dpi = window.devicePixelRatio;
    this.size = 100 * this.dpi;

    this.canvas = document.getElementById('loader');
    this.ctx = this.canvas.getContext('2d');

    this.center = this.size * 0.5;
    this.radiusInner = this.center - ( 21 * this.dpi );
    this.radiusOuter = this.center - ( 12 * this.dpi );
    this.PI2 = Math.PI * 2;

    this.currentProgress = 0;
    this.targetProgress = 0;

    this.isActive = true;

    this.init();
};

LoadingCanvas.prototype.init = function () {

    this.canvas.width = this.size;
    this.canvas.height = this.size;

    this.draw();
    requestAnimationFrame(this.update.bind(this));
};

LoadingCanvas.prototype.destroy = function () {

    this.isActive = false;
};

LoadingCanvas.prototype.preloadedElement = function () {

    this.loaded++;
    this.targetProgress = this.loaded / this.total;
};

LoadingCanvas.prototype.update = function () {

    if (this.targetProgress !== this.currentProgress) {

        this.currentProgress += ( this.targetProgress - this.currentProgress ) / 25;
        if (Math.abs(this.currentProgress - this.targetProgress) < 0.01) this.currentProgress = this.targetProgress;

        this.draw();
        if (this.currentProgress === 1) {

            this.canvas.classList.add('hidden');
            this.isActive = false;
        }
    }

    if (this.isActive) {

        requestAnimationFrame(this.update.bind(this));
    }
};

LoadingCanvas.prototype.draw = function () {

    this.clear();

    // Inner circle
    this.ctx.beginPath();
    this.ctx.arc(this.center, this.center, this.radiusInner, 0, this.PI2, false);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();


    // Outer circle
    this.ctx.beginPath();
    this.ctx.arc(this.center, this.center, this.radiusOuter, 0, this.PI2 * this.currentProgress, false);
    this.ctx.lineWidth = 8 * this.dpi;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
};

LoadingCanvas.prototype.clear = function () {

    this.ctx.clearRect(0, 0, this.size, this.size);
};

module.exports = LoadingCanvas;