var SimplexNoise = require('simplex-noise');

var Target = function( parent ){

    this.parent = parent;
    this.position = new THREE.Vector3(0, 1.5, -10);
    this.colorNoHit = "#cc0000";
    this.colorHit = "#00cc00";
    this.color = this.colorNoHit;
    this.sto = 0;
    this.sti = 0;

    this.simplex = new SimplexNoise( Math.random );
    this.simplexInc = 0.0;
    this.useNoise = false;

    this.plane = new THREE.PlaneBufferGeometry( 1, 1 );

    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.context = this.canvas.getContext('2d');

    this.texture = new THREE.Texture( this.canvas );
    var material = new THREE.MeshBasicMaterial( {
        color : 0xffffff,
        map: this.texture,
        side : THREE.DoubleSide,
        transparent : true,
        depthTest: false
    } );

    this.mesh = new THREE.Mesh( this.plane, material );

    this.tween;
    this.alpha = 1.0;
    this.drawTarget();

    this.mesh.position.set(0, 1.5, -10);
    this.mesh.scale.set(0.75, 0.75, 0.75);
};

Target.prototype.step = function() {

    // Move randomly using a simple noise
    if (this.useNoise) {

        this.simplexInc += 0.01;
        var noisePosition = this.simplex.noise2D( 0.1, this.simplexInc );
        this.position.y = 0.75 + (noisePosition * 0.5);
    }

    // Ease to the random position
    this.mesh.position.x += (this.position.x - this.mesh.position.x) / 20;
    this.mesh.position.y += (this.position.y - this.mesh.position.y) / 20;
    this.mesh.position.z += (this.position.z - this.mesh.position.z) / 20;
};

Target.prototype.show = function() {

    this.mesh.visible = true;

    if (this.tween) this.tween.kill();
    this.tween = TweenMax.to( this, 2.0, {

        alpha : 1.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTarget.bind(this)
    });

    TweenMax.to( this.mesh.scale, 1.0, {

        x : 1.0,
        y : 1.0,
        z : 1.0,
        ease : Power3.easeInOut
    });

    this.useNoise = true;
};

Target.prototype.hide = function() {

    if (this.tween) this.tween.kill();
    this.tween = TweenMax.to( this, 1.0, {

        alpha : 0.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTarget.bind(this),
        onComplete : this.hideEnd.bind(this)
    });

    this.useNoise = false;
    this.position = new THREE.Vector3(0, 1, -10);
};

Target.prototype.hideEnd = function() {

    this.mesh.visible = false;
};

Target.prototype.drawHit = function() {

    this.color = this.colorHit;
    this.drawTarget();

    clearTimeout( this.sto );
    this.sto = setTimeout( function () {

        this.color = this.colorNoHit;
        this.drawTarget();

    }.bind(this), 250 );
};

Target.prototype.drawTarget = function () {

    var halfSize = this.canvas.width * 0.5;

    this.context.globalAlpha = this.alpha;
    this.context.strokeStyle = this.color;
    this.context.lineWidth = 6;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, halfSize - 3, 0, 2 * Math.PI);
    this.context.stroke();

    this.texture.needsUpdate = true;
};

module.exports = Target;