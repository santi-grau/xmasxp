window.THREE = require('three');

var Shaders = require('./shaders/shaders.js');

var OrbitControls = require('three-orbit-controls')(THREE);
var model = require('../assets/base4.obj');
var OBJLoader = require('three-obj-loader')(THREE);

var App = function() {
	// props
	this.containerEl = document.getElementById('main');

	window.onresize = this.onResize.bind(this);
	
	this.position = 0;
	this.speed = 0;
	this.airborn = false;
	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 36, window.innerWidth / window.innerHeight, 0.1, 10000 );
	

	var controls = new OrbitControls(this.camera);

	this.origin = new THREE.Vector2( 255.3107, 189.05429 )
	this.camera.position.x = 100.515213;
	this.camera.position.y = 100.515213;
	
	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
	this.containerEl.appendChild( this.renderer.domElement );

	this.path = this.parsePath('M0,0c64.32672,3.66378,76.99023,20.18553,97.45992,47.24449c21.76199,28.76728,54.05034,52.06145,86.35521,52.06145c4.24663,0,6.66487-0.38168,6.66487-0.38168');

	
	this.cameraPlayer = new THREE.PerspectiveCamera( 12, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.cameraPlayer.position.y = 1.75

	this.player = new THREE.Object3D();

	this.player.position.z = this.origin.x;
	this.player.position.y = this.origin.y;


	var geometry = new THREE.BoxBufferGeometry( 1, 1.6, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side : THREE.DoubleSide } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.y = 0.8;
	this.player.add( cube );



	this.player.add( this.cameraPlayer )
	this.scene.add( this.player );


	this.model = new THREE.OBJLoader().parse(model);
	this.model.traverse( function ( child ) {
		// console.log(child.name);
		if( child.name == 'LANDING_BezierCurve' ) this.landing = child;
		child.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side : THREE.DoubleSide } );

		child.material = new THREE.MeshNormalMaterial( { side : THREE.DoubleSide } );

		geo = new THREE.WireframeGeometry( child.geometry );
		var mat = new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } );
		var wireframe = new THREE.LineSegments( geo, mat );
		wireframe.rotation.y = Math.PI / 2;
		this.scene.add( wireframe );    

	}.bind(this) );


	console.log(this.landing);
	var size = 1000;
	var step = 100;

	var gridHelper = new THREE.GridHelper( size, step );
	this.scene.add( gridHelper );

	var axisHelper = new THREE.AxisHelper( 100 );
	this.scene.add( axisHelper );
	// console.log(gridHelper);

	for( var i = 0 ; i < 51 ; i++ ){
		var geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.set( 0, this.origin.y -  this.getPoint( this.path, this.path.getTotalLength() * i / 50 ).y, this.origin.x - this.getPoint( this.path, this.path.getTotalLength() * i / 50 ).x )
		// this.scene.add( sphere );
	}
	this.raycaster = new THREE.Raycaster( this.player.position, new THREE.Vector3( 0, -1, 0 ), 0.1, 1000 );
	this.model.rotation.y = Math.PI / 2;
	this.scene.add(this.model);
	this.oldPosition = new THREE.Vector3(0,0,0)
	// run
	this.onResize();
	this.step();
}

App.prototype.parsePath = function( path ) {
	return new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + path + '" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
};


App.prototype.onResize = function(e) {
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
	this.camera.updateProjectionMatrix();
}

App.prototype.getPoint = function(path,d){
	return path.getPointAtLength( d )
}
App.prototype.updatePosition = function(){
	
	var gravity = 0.98;
	var mass = 75;
	var pos = new THREE.Vector3(0,0,0);
	if( this.position < this.path.getTotalLength() ){
		var angleRadians = Math.atan2( this.getPoint( this.path, this.position + 1 ).y - this.getPoint( this.path, this.position ).y, this.getPoint( this.path, this.position + 1 ).x - this.getPoint( this.path, this.position ).x );
		var friction = 0.01;
		var P = mass * gravity;
		var Px = P * Math.sin(angleRadians);
		var Py = P * Math.cos(angleRadians);
		var Fr = friction * Py;
		var Ef = Px * Fr;
		var a = Ef / mass;

		this.speed += a / 60;
		this.position += this.speed;

		var pp = this.path.getPointAtLength( this.position );
		
		pos = new THREE.Vector3( 0 , this.origin.y - pp.y, this.origin.x - pp.x );
	} else {
		var slopeAngle = 9 * Math.PI / 180;
		if( !this.airborn ){
			this.jumpOrigin = this.player.position;
			
			this.speedUp = Math.sin( slopeAngle ) * this.speed;
			this.speedRight = Math.cos( slopeAngle ) * this.speed;
			this.airborn = true;			
		}

		this.speedUp -= gravity / 60;
		pos = new THREE.Vector3( this.jumpOrigin.x, this.jumpOrigin.y + this.speedUp, this.jumpOrigin.z - this.speedRight );
	}

	this.player.position.set(pos.x,pos.y,pos.z);
	var angle = Math.atan2(  this.player.position.z - this.oldPosition.z,  this.player.position.y - this.oldPosition.y );
	
	var intersect = this.raycaster.intersectObject ( this.landing, false );

	this.player.rotation.x = angle + Math.PI / 2;

	
	this.oldPosition = this.player.position.clone();
	document.getElementById('position').innerHTML = 'position : ' + ( this.player.position.x + ' ' + this.player.position.y );
	document.getElementById('speed').innerHTML = 'speed : ' + this.speed;
	if(intersect.length) document.getElementById('altitude').innerHTML = 'altitude : ' + intersect[0].distance;
	
}

App.prototype.step = function(time) {
	window.requestAnimationFrame(this.step.bind(this));
	this.updatePosition();
	this.renderer.render( this.scene, this.cameraPlayer );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();