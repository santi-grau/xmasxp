var SimplexNoise = require('simplex-noise');

var Score = function( parent ){

	this.parent = parent;

	this.speed = 0.1;
	this.points = 0;

	this.plane = new THREE.PlaneBufferGeometry( 30, 20 );

	this.canvas = document.createElement('canvas');
	this.canvas.width = 512;
	this.canvas.height = 256;
	this.context = this.canvas.getContext('2d');

	this.texture = new THREE.Texture( this.canvas );
	var material = new THREE.MeshBasicMaterial( { color : 0xffff00, map : this.texture } );

	this.mesh = new THREE.Mesh( this.plane,  material );
	this.mesh.rotation.y = -Math.PI / 2;



	this.mesh.position.y = 37;
	this.mesh.position.x = 262.5;
	this.mesh.position.z = 0;
}

Score.prototype.drawTexture = function() {

	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.font = "Bold 20px Arial";
	this.context.fillStyle = "rgba(255,0,0,0.95)";
    this.context.fillText('Hello Player!', 10, 20);
    this.context.fillText('Mx speed:' + this.speed.toFixed(2) + ' mph', 10, 40);
    this.context.fillText('Total points:' + this.points, 10, 60);

    this.texture.needsUpdate = true;
};

Score.prototype.updateSpeed = function(speed) {

	this.speed = speed * 100;
	this.drawTexture();
};

Score.prototype.updatePoints = function(points) {

	this.points = points;
	this.drawTexture();
};

Score.prototype.step = function( time ){

}

module.exports = Score;