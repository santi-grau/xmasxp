var SimplexNoise = require('simplex-noise');

var Intro = function( parent ){
	this.parent = parent;
	this.value = 0;

	this.plane = new THREE.PlaneBufferGeometry( 6, 3 );

	this.canvas = document.createElement('canvas');
	this.canvas.width = 512;
	this.canvas.height = 256;
	this.context = this.canvas.getContext('2d');

	this.context.font = "Bold 20px Arial";
	this.context.fillStyle = "rgba(0,0,0,1)";
    this.context.fillText('Intro here!', 10, 20);

	this.texture = new THREE.Texture( this.canvas );
	var material = new THREE.MeshBasicMaterial( { color : 0xffff00, map : this.texture } );

	this.mesh = new THREE.Mesh( this.plane,  material );
	this.mesh.rotation.y = -Math.PI / 2;

	this.texture.needsUpdate = true;

	this.mesh.position.y = 193;
	this.mesh.position.x = -235;
	this.mesh.position.z = 0

}
Intro.prototype.step = function( time ){

}

module.exports = Intro;