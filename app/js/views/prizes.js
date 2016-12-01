var SimplexNoise = require('simplex-noise');

var Prizes = function( parent ){
	this.parent = parent;

	this.simplex = new SimplexNoise( Math.random );

	this.i1 = 0;
	this.i2 = 0;
	this.totalPrizes = 100;
	this.minDistance = 20;
	this.maxDistance = 300;
	this.minHeight = 100;
	this.maxHeight = 140;
	this.group = new THREE.Object3D();

	for( var i = 0 ; i < this.totalPrizes ; i++ ){
		var prizeGroup = new THREE.Object3D();
		prizeGroup.inity = prizeGroup.position.y = Math.random() * ( this.maxHeight - this.minHeight ) + this.minHeight;
		prizeGroup.rotation.y = Math.random() * Math.PI * 2;
		var size = Math.random() * 1 + 0.5
		var cube = new THREE.Mesh( new THREE.BoxBufferGeometry( size, size, size ), new THREE.MeshBasicMaterial( { color: 0x0000ff } ) );
		cube.position.set( 0, 0, Math.random() * ( this.maxDistance - this.minDistance ) + this.minDistance );
		prizeGroup.add( cube ); 
		this.group.add( prizeGroup );
	}
}
Prizes.prototype.step = function( time ){
	this.i1 += 0.0001;
	this.i2 += 0.001;
	for( var i = 0 ; i < this.group.children.length ; i++ ){

		var position = this.simplex.noise2D( i / this.group.children.length + this.i1, i / this.group.children.length );
		var rotation = this.simplex.noise2D( i / this.group.children.length + this.i2, i / this.group.children.length );
		
		this.group.children[i].position.y = this.group.children[i].inity + position * 20;
		this.group.children[i].rotation.y += 0.005 * ( rotation + 1 ) / 2;
		this.group.children[i].children[0].rotation.x += 0.01 * position;
		this.group.children[i].children[0].rotation.y += 0.01 * rotation;
	}
}

module.exports = Prizes;