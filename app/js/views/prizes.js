var SimplexNoise = require('simplex-noise');
var boxModel = require('../../assets/box.obj');
var caneModel = require('../../assets/cane.obj');
var ballModel = require('../../assets/ball.obj');
var bookModel = require('../../assets/book.obj');
var OBJLoader = require('three-obj-loader')(THREE);

var PrizesPointsPool = require('./prizespointspool');

var Prizes = function( parent ){

	this.parent = parent;

	this.simplex = new SimplexNoise( Math.random );
	this.pointsPool = new PrizesPointsPool( this.parent );

	this.i1 = 0;
	this.i2 = 0;
	this.totalPrizes = (this.parent.isCardboard)? 80 : 100;
	this.prizes = [];
	this.minDistance = 20;
	this.maxDistance = (this.parent.isCardboard)? 250 : 300;
	this.minHeight = 100;
	this.maxHeight = 140;
	this.group = new THREE.Object3D();

	this.meshes = [
		{
			id : 'box',
			points : 10000,
			scale : 10.0 + 10.0,
			model : boxModel,
			mesh : null,
			color : 0xffdedf
		},
		{
			id : 'cane',
			points : 2000,
			scale : 10.0 + 10.0,
			model : caneModel,
			mesh : null,
			color : 0xe75656
		},
		{
			id : 'ball',
			points : 5000,
			scale : 15.0 + 10.0,
			model : ballModel,
			mesh : null,
			color : 0xdeffed
		},
		{
			id : 'book',
			points : 8000,
			scale : 20.0 + 10.0,
			model : bookModel,
			mesh : null,
			color : 0xfeffde
		}
	]
	this.loadMeshes();
	this.positionPrizes();

};

Prizes.prototype.reset = function() {

	for( var i = 0 ; i < this.totalPrizes ; i++ ){

		var prize = this.prizes[ i ];
		prize.userData.explosion = 0;
		prize.userData.active = true;
		prize.children[0].material.opacity = 1.0;
		prize.children[1].material.opacity = 1.0;
		prize.visible = true;

		this.resetWireframe( prize.children[1].geometry, prize.userData.originalPositions );
	}
};

Prizes.prototype.resetWireframe = function( wireframeGeometry, originalPositions) {

	for ( var j = 0; j < wireframeGeometry.attributes.position.array.length; j += 3 ) {

		wireframeGeometry.attributes.position.array[ j + 0 ] = originalPositions[ j + 0 ];
		wireframeGeometry.attributes.position.array[ j + 1 ] = originalPositions[ j + 1 ];
		wireframeGeometry.attributes.position.array[ j + 2 ] = originalPositions[ j + 2 ];
	}

	wireframeGeometry.attributes.position.needsUpdate = true;
};

Prizes.prototype.loadMeshes = function() {

	for (var i = 0; i < this.meshes.length; i++) {

		this.meshes[ i ].mesh = new THREE.Object3D();
		var model = new THREE.OBJLoader().parse(this.meshes[ i ].model);
		var firstChild = true;
		model.traverse( function ( child ) {

			if (firstChild) {

				firstChild = false;

			} else {

				child.material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: this.meshes[ i ].color, transparent: true, opacity: 1.0 } );
				var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( child.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog: true, transparent: true, opacity: 1.0  } ) );

				this.meshes[ i ].mesh.add( child );
				this.meshes[ i ].mesh.add( wireframe );

				this.meshes[ i ].model = child;
				this.meshes[ i ].wireframeGeometry = child.geometry;
				this.meshes[ i ].material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: this.meshes[ i ].color, transparent: true, opacity: 1.0 } );
				this.meshes[ i ].wireframeMaterial = new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog: true, transparent: true, opacity: 1.0  } );

				var wireframePositionsStart = [];
				var wireframePositionsEnd = [];
				for ( var j = 0; j < wireframe.geometry.attributes.position.array.length; j += 3 ) {

					var originalPosition = new THREE.Vector3(wireframe.geometry.attributes.position.array[ j + 0 ], wireframe.geometry.attributes.position.array[ j + 1 ], wireframe.geometry.attributes.position.array[ j + 2 ]);
					var direction = originalPosition.clone();
					var incPosition = direction.multiplyScalar( Math.random() * 1 );

					wireframePositionsStart[ j + 0 ] = originalPosition.x;
					wireframePositionsStart[ j + 1 ] = originalPosition.y;
					wireframePositionsStart[ j + 2 ] = originalPosition.z;

					wireframePositionsEnd[ j + 0 ] = incPosition.x;
					wireframePositionsEnd[ j + 1 ] = incPosition.y;
					wireframePositionsEnd[ j + 2 ] = incPosition.z;
				}

				this.meshes[ i ].originalPositions = wireframePositionsStart;
				this.meshes[ i ].explodePositions = wireframePositionsEnd;
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
		var prize = new THREE.Object3D();
		var priceChild = this.meshes[ prizeIndex ].model.clone( true );
		priceChild.material = this.meshes[ prizeIndex ].material.clone();
		prize.add( priceChild );
		prize.add( new THREE.LineSegments( new THREE.WireframeGeometry( this.meshes[ prizeIndex ].wireframeGeometry.clone() ), this.meshes[ prizeIndex ].wireframeMaterial.clone() ) );

		prize.position.set( 0, 0, Math.random() * ( this.maxDistance - this.minDistance ) + this.minDistance );
		prize.scale.set(this.meshes[ prizeIndex ].scale, this.meshes[ prizeIndex ].scale, this.meshes[ prizeIndex ].scale);
		prize.userData = {

			points : this.meshes[ prizeIndex ].points,
			index : i,
			explosion : 0,
			active : true,
			originalPositions : this.meshes[ prizeIndex ].originalPositions,
			explodePositions : this.meshes[ prizeIndex ].explodePositions
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

	var prizeMesh = this.prizes[index];
	/////////////////////////////////////////////////////////////////////////////
	if( !prizeMesh ) return; // had to add this to solve conflct... no idea why tho
	/////////////////////////////////////////////////////////////////////////////

	prizeMesh.updateMatrixWorld();
	var points = this.pointsPool.getPrizePointsInstance(prizeMesh.userData.points);
	var pointsPosition = new THREE.Vector3();
	pointsPosition.setFromMatrixPosition( prizeMesh.matrixWorld );
	points.mesh.position.set( pointsPosition.x, pointsPosition.y, pointsPosition.z );
	this.parent.scene.add( points.mesh );
	points.animate();

	prizeMesh.userData.active = false;

    TweenMax.to( prizeMesh.children[0].material, 0.7, {

        opacity : 0.0,
        ease : Power2.easeInOut
    });

    TweenMax.to( prizeMesh.children[1].material, 1.0, {

        opacity : 0.0,
        ease : Power2.easeInOut,
        onComplete : function () {

			prizeMesh.visible = false;
        }
    });

    if (!this.parent.isCardboard) {

	    TweenMax.to( prizeMesh.userData, 1.0, {

	        explosion : 1.0,
	        ease : Power2.easeInOut,
	        onUpdate : function () {

	        	this.removeWireframe( prizeMesh.children[1].geometry, prizeMesh.userData.explosion, prizeMesh.userData.originalPositions, prizeMesh.userData.explodePositions );

	        }.bind( this )
	    });
    }
};

Prizes.prototype.updateWireframeColor = function( color ){
	for(var i = 0 ; i < this.group.children.length ; i++ ) for( var j = 0 ; j < this.group.children[i].children[0].children.length ; j++ ) if( this.group.children[i].children[0].children[j] instanceof THREE.LineSegments ) this.group.children[i].children[0].children[j].material.color.setHex( color );
}

Prizes.prototype.removeWireframe = function( wireframeGeometry, percentage, originalPositions, incPositions) {

	for ( var j = 0; j < wireframeGeometry.attributes.position.array.length; j += 3 ) {

		wireframeGeometry.attributes.position.array[ j + 0 ] = originalPositions[ j + 0 ] + (incPositions[ j + 0 ] * percentage);
		wireframeGeometry.attributes.position.array[ j + 1 ] = originalPositions[ j + 1 ] + (incPositions[ j + 1 ] * percentage);
		wireframeGeometry.attributes.position.array[ j + 2 ] = originalPositions[ j + 2 ] + (incPositions[ j + 2 ] * percentage);
	}

	wireframeGeometry.attributes.position.needsUpdate = true;
};

Prizes.prototype.step = function( time ){

	this.i1 += 0.0001;
	this.i2 += 0.001;

	for ( var i = 0 ; i < this.group.children.length ; i++ ) {

		if ( this.group.children[i].children[0].userData.explosion < 1.0 ) {

			var rotationMultiplier = ( this.group.children[i].rotationSense ) ? 1 : -1 ;
			var position = this.simplex.noise2D( i / this.group.children.length + this.i1, i / this.group.children.length );
			var rotation = this.simplex.noise2D( i / this.group.children.length + this.i2, i / this.group.children.length );

			this.group.children[i].position.y = this.group.children[i].inity + position * 20;
			this.group.children[i].rotation.y += 0.005 * rotation;
			this.group.children[i].children[0].rotation.x += 0.01 * position;
			this.group.children[i].children[0].rotation.y += 0.01 * rotation;
		}
	}
}

module.exports = Prizes;