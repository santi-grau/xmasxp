
var Target = function( parent ){

    this.parent = parent;

    this.plane = new THREE.PlaneBufferGeometry( 2, 2 );
   // this.plane = new THREE.BoxBufferGeometry( 10, 1.6, 10 );

    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.context = this.canvas.getContext('2d');

    this.texture = new THREE.Texture( this.canvas );
    var material = new THREE.MeshBasicMaterial( { color : 0xffffff, map: this.texture, side : THREE.DoubleSide, transparent : true } );

    this.mesh = new THREE.Mesh( this.plane, material );
    // this.mesh.rotation.y = -Math.PI / 2;

    this.drawTarget();

    this.mesh.position.y = 1;
    this.mesh.position.x = 0;
    this.mesh.position.z = -10;
};

Target.prototype.step = function() {

};

Target.prototype.drawTarget = function () {

    var halfSize = this.canvas.width * 0.5;

    this.context.strokeStyle = "#FF0000";
    this.context.lineWidth = 6;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, halfSize - 3, 0, 2 * Math.PI);
    this.context.stroke();

    this.texture.needsUpdate = true;
};

module.exports = Target;