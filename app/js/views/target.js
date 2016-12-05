
var Target = function( parent ){

    this.parent = parent;

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
    this.alpha = 0.0;
    this.drawTarget();

    this.mesh.position.y = 1;
    this.mesh.position.x = 0;
    this.mesh.position.z = -10;
    this.mesh.visible = false;
};

Target.prototype.step = function() {

    // TODO: Move randomly
};

Target.prototype.show = function() {

    this.mesh.visible = true;

    if (this.tween) this.tween.kill();
    this.tween = TweenMax.to( this, 2.0, {

        alpha : 1.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTarget.bind(this)
    });
};

Target.prototype.hide = function() {

    if (this.tween) this.tween.kill();
    TweenMax.to( this, 1.0, {

        alpha : 0.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTarget.bind(this),
        onComplete : this.hideEnd.bind(this)
    });
};

Target.prototype.hideEnd = function() {

    this.mesh.visible = false;
};

Target.prototype.drawTarget = function () {

    var halfSize = this.canvas.width * 0.5;

    this.context.globalAlpha = this.alpha;
    this.context.strokeStyle = "#cc0000";
    this.context.lineWidth = 6;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, halfSize - 3, 0, 2 * Math.PI);
    this.context.stroke();

    this.texture.needsUpdate = true;
};

module.exports = Target;