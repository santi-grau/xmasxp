var SimplexNoise = require('simplex-noise');

var Score = function( parent ){
	this.parent = parent;
	this.value = 0;

	this.plane = new THREE.PlaneBufferGeometry( 30, 20 );

	this.canvas = document.createElement('canvas');
	this.canvas.width = 300;
	this.canvas.height = 200;
	this.context = this.canvas.getContext('2d');

	this.context.font = "Bold 20px Arial";
	this.context.fillStyle = "rgba(255,0,0,0.95)";
    this.context.fillText('Hello Israel!', 10, 20);	
    this.context.fillText('How did it go??', 10, 40);

	this.texture = new THREE.Texture( this.canvas );
	var material = new THREE.MeshBasicMaterial( { color : 0xffff00, map : this.texture } );

	this.mesh = new THREE.Mesh( this.plane,  material );
	this.mesh.rotation.y = -Math.PI / 2;

	this.texture.needsUpdate = true;

	this.mesh.position.y = 37;
	this.mesh.position.x = 262.5;
	this.mesh.position.z = 0

}
Score.prototype.step = function( time ){
	
}

module.exports = Score;