var model = require('../../assets/base9.obj');
var mountain = require('../../assets/lamp.obj');
var lamp = require('../../assets/lamp.obj');
var pole = require('../../assets/pole.obj');

var Skybox = require('./skybox'); // Scoreboard
var Score = require('./score'); // Scoreboard
var Intro = require('./intro'); // Introboard
var Landscape = require('./landscape'); // Trees, village and decoration on stage

var OBJLoader = require('three-obj-loader')(THREE);
var Stage = function( parent ){
	this.parent = parent;

	this.slopeOrigin = new THREE.Vector2( 0,0 );
	this.landingPath = 'M-291.324-174.0877c47.978-0.2317,71.3112,17.3651,108.8553,46.0455c43.1519,32.9643,96.7334,40.8891,144.6539,63.8938C2.5818-44.7557,39.0152-15.6982,84.4878-9.421C140.7772-1.6506,200.2027,0,258.4094,0';
	this.slopePath = 'M-255.3108-189.054c64.3267,3.6638,76.9902,20.1856,97.4599,47.2444c21.762,28.7673,54.0503,52.0614,86.3552,52.0614c4.2467,0,6.6649-0.3817,6.6649-0.3817';
	this.slope = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + this.slopePath + '" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];

	this.slopeAngle = 30;

	this.group = new THREE.Object3D();
	this.wireframe = new THREE.Object3D();

	// var texture = require('./../../assets/texture.svg');
	// var textureData = window.btoa(texture);
	// var myImage = new Image();
	// myImage.src = 'data:image/svg+xml;base64,' + textureData;

	this.mesh = new THREE.OBJLoader().parse(model);
	this.mesh.traverse( function ( child ) {
		// console.log(child.name);
		if( child.name == 'SNOW_MOUNTAIN_Mesh.026' ) this.mountainMesh = child;


		child.material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : 0xffffff } );

		if( child.name == 'WATER_MOUNTAIN_Mesh.000' ) child.material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : 0x0000ff } );
		if( child.name == 'STONE_MOUNTAIN_Mesh.001' ) child.material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : 0xABABAB } );

		// if( child.name == 'MOUNTAIN_Mesh.026' ) console.log(child);

		// if( child.name == 'MOUNTAIN_Mesh.026' ) child.material.map = THREE.ImageUtils.loadTexture( 'data:image/svg+xml;base64,' + textureData );
		// if( child.name == 'MOUNTAIN_Mesh.026' ) console.log(child.material);
		// child.material.needsUpdate = true;

		child.castShadow = true;
		child.receiveShadow = (child.name == 'RAMP_Mesh.017')? false : true;
		var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( child.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );
		this.wireframe.add( wireframe );

	}.bind(this) );

	this.score = new Score( this );
	this.intro = new Intro( this );
	this.landscape = new Landscape( this );
	this.skybox = new Skybox( this );

	this.landingMesh = this.makeLandingMesh();
	this.lamps = this.addLamps();
	this.poles = this.addPoles();

	var wireframeLanding = new THREE.LineSegments( new THREE.WireframeGeometry( this.landingMesh.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );
	this.wireframe.add( wireframeLanding );

	this.group.add(
		this.mesh,
		this.wireframe,
		this.landingMesh,
		this.lamps,
		this.poles,
		this.score.mesh,
		this.intro.mesh,
		this.landscape.group
		// this.skybox.mesh
	);
	this.group.rotation.y = Math.PI / 2;

}


Stage.prototype.addPoles = function(){
	var poleCount = 80
	var group = new THREE.Object3D();
	var mesh = new THREE.OBJLoader().parse(pole).children[0];
	mesh.material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : 0x9C704E } );
	for( var i = 0 ; i < poleCount ; i++ ){
		var m = mesh.clone();
		m.position.set( this.slope.getPointAtLength( i / ( poleCount - 1) * this.slope.getTotalLength() ).x, -this.slope.getPointAtLength( i / ( poleCount - 1) * this.slope.getTotalLength() ).y - 0.2, 0 );
		var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( m.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: 0.5, fog : true  } ) );
		wireframe.position.set( m.position.x, m.position.y, m.position.z);
		group.add(m, wireframe);
	}
	return group;
}

Stage.prototype.addLamps = function(){
	var lampCount = 60
	var group = new THREE.Object3D();
	var mesh = new THREE.OBJLoader().parse(lamp).children[0];

	mesh.material = new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : 0xffffff } );
	mesh.castShadow = true;
	for( var i = 7 ; i < lampCount - 3 ; i++ ){
		var m = mesh.clone()
		m.position.y = 2;
		var lampGroup = new THREE.Object3D();
		lampGroup.position.set( this.slope.getPointAtLength( i / ( lampCount - 1) * this.slope.getTotalLength() ).x, -this.slope.getPointAtLength( i / ( lampCount - 1) * this.slope.getTotalLength() ).y, 0 );
		var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( m.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );
		wireframe.position.y = m.position.y;
		lampGroup.add(m, wireframe);
		var angle = Math.atan2( (-this.slope.getPointAtLength( i / ( lampCount - 1) * this.slope.getTotalLength() + 1 ).y) - ( - this.slope.getPointAtLength( i / ( lampCount - 1) * this.slope.getTotalLength() ).y), this.slope.getPointAtLength( i / ( lampCount - 1) * this.slope.getTotalLength() + 1 ).x - this.slope.getPointAtLength( i / ( lampCount - 1) * this.slope.getTotalLength() ).x );
		lampGroup.rotation.z = angle;
		group.add( lampGroup );
	}
	return group;
}

Stage.prototype.makeLandingMesh = function(){
	var path = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + this.landingPath + '" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
	var segments = 100;
	var geometry = new THREE.Geometry();
	var width = 200;
	var ovs = [];
	for( var i = 0 ; i < segments ; i++ ){
		var nvs = [];
		var pp = path.getPointAtLength( i / (segments - 1) * path.getTotalLength() );
		for( var j = 0 ; j < 2 ; j++ ){
			nvs.push( geometry.vertices.push( new THREE.Vector3( pp.x, -pp.y, -width / 2 + width * j ) ) - 1 );
			if( i > 0 && j > 0 ) geometry.faces.push( new THREE.Face3( ovs[j-1], ovs[j], nvs[j-1] ), new THREE.Face3( nvs[j], nvs[j-1], ovs[j] ) );
		}
		var ovs = nvs;
	}

	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { side : THREE.DoubleSide, color : 0xffffff } ) );
	// mesh.castShadow = true;
	// mesh.receiveShadow = true;
	return mesh;
}
Stage.prototype.step = function( time ){
	this.landscape.step( time );
}

module.exports = Stage;