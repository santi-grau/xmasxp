var SimplexNoise = require('simplex-noise');
var boxModel = require('../../assets/box.obj');
var caneModel = require('../../assets/cane.obj');
var ballModel = require('../../assets/ball.obj');
var bookModel = require('../../assets/book.obj');
var OBJLoader = require('three-obj-loader')(THREE);

var Prizes = function( parent ){

	this.parent = parent;

	this.simplex = new SimplexNoise( Math.random );

	this.i1 = 0;
	this.i2 = 0;
	this.totalPrizes = 100;
	this.prizes = [];
	this.minDistance = 20;
	this.maxDistance = 300;
	this.minHeight = 100;
	this.maxHeight = 140;
	this.group = new THREE.Object3D();

	this.meshes = [
		{
			id : 'box',
			points : 10,
			scale : 10.0 + 10.0,
			model : boxModel,
			mesh : null,
			color : 0xffdedf
		},
		{
			id : 'cane',
			points : 2,
			scale : 10.0 + 10.0,
			model : caneModel,
			mesh : null,
			color : 0xe75656
		},
		{
			id : 'ball',
			points : 5,
			scale : 15.0 + 10.0,
			model : ballModel,
			mesh : null,
			color : 0xdeffed
		},
		{
			id : 'book',
			points : 5,
			scale : 20.0 + 10.0,
			model : bookModel,
			mesh : null,
			color : 0xfeffde
		}
	]
	this.loadMeshes();
	this.positionPrizes();

}

Prizes.prototype.loadMeshes = function() {

	for (var i = 0; i < this.meshes.length; i++) {

		this.meshes[ i ].mesh = new THREE.Object3D();
		var model = new THREE.OBJLoader().parse(this.meshes[ i ].model);
		var firstChild = true;
		model.traverse( function ( child ) {

			if (firstChild) {
				firstChild = false;

			} else {

				child.material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : this.meshes[ i ].color } );
				var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( child.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );

				this.meshes[ i ].mesh.add( model );
				this.meshes[ i ].mesh.add( wireframe );
			}

		}.bind(this) );
	}
};

Prizes.prototype.positionPrizes = function() {

	for( var i = 0 ; i < this.totalPrizes ; i++ ){

		var prizeGroup = new THREE.Object3D();
		prizeGroup.inity = prizeGroup.position.y = Math.random() * ( this.maxHeight - this.minHeight ) + this.minHeight;
		prizeGroup.rotation.y = Math.random() * Math.PI * 2;
		var size = Math.random() * 1 + 0.5;
		var prizeIndex = this.getRandomInt( 0, this.meshes.length - 1 );
		var prize = this.meshes[ prizeIndex ].mesh.clone();
		prize.position.set( 0, 0, Math.random() * ( this.maxDistance - this.minDistance ) + this.minDistance );
		prize.scale.set(this.meshes[ prizeIndex ].scale, this.meshes[ prizeIndex ].scale, this.meshes[ prizeIndex ].scale);
		prize.userData = {
			points : this.meshes[ prizeIndex ].points,
			index : i
		};

		prizeGroup.add( prize );
		this.group.add( prizeGroup );
		this.prizes.push( prize );
	}
};

Prizes.prototype.getRandomInt = function(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Prizes.prototype.removePrizeWithIndex = function(index) {

	// TODO: Make something more interesting than this dissapearing
	this.prizes[index].visible = false;
};

Prizes.prototype.step = function( time ){
	this.i1 += 0.0001;
	this.i2 += 0.001;
	for( var i = 0 ; i < this.group.children.length ; i++ ){
		var rotationMultiplier = ( this.group.children[i].rotationSense ) ? 1 : -1 ;
		var position = this.simplex.noise2D( i / this.group.children.length + this.i1, i / this.group.children.length );
		var rotation = this.simplex.noise2D( i / this.group.children.length + this.i2, i / this.group.children.length );

		this.group.children[i].position.y = this.group.children[i].inity + position * 20;
		this.group.children[i].rotation.y += 0.005 * rotation;
		this.group.children[i].children[0].rotation.x += 0.01 * position;
		this.group.children[i].children[0].rotation.y += 0.01 * rotation;
	}
}

module.exports = Prizes;