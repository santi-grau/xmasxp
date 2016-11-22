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

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 12, window.innerWidth / window.innerHeight, 0.1, 10000 );
	
	var controls = new OrbitControls(this.camera);

	this.origin = new THREE.Vector2( 255.3107, 189.05429 )
	this.camera.position.x = 100.515213;
	
	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
	this.containerEl.appendChild( this.renderer.domElement );

	this.path = this.parsePath('M0,0c64.32672,3.66378,76.99023,20.18553,97.45992,47.24449c21.76199,28.76728,54.05034,52.06145,86.35521,52.06145c4.24663,0,6.66487-0.38168,6.66487-0.38168');

	
	this.cameraPlayer = new THREE.PerspectiveCamera( 12, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.cameraPlayer.position.y = 1.75

	this.player = new THREE.Object3D();

	this.player.position.z = this.origin.x;
	this.player.position.y = this.origin.y;


	var geometry = new THREE.BoxBufferGeometry( 1, 1.7, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side : THREE.DoubleSide } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.y = 0.85;
	this.player.add( cube );



	this.player.add( this.cameraPlayer )
	this.scene.add( this.player );


	this.model = new THREE.OBJLoader().parse(model);
	this.model.traverse( function ( child ) {
		// console.log(child.name);
		if( child.name == 'PATH_SLOPE' ) console.log(child);
		child.material = new THREE.MeshBasicMaterial( {color: 0xffffff, side : THREE.DoubleSide } );

		child.material = new THREE.MeshNormalMaterial( {color: 0xffffff, side : THREE.DoubleSide } );

		geo = new THREE.WireframeGeometry( child.geometry );
		var mat = new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } );
		var wireframe = new THREE.LineSegments( geo, mat );
		wireframe.rotation.y = Math.PI / 2;
		this.scene.add( wireframe );    

	}.bind(this) );

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

	this.model.rotation.y = Math.PI / 2;
	this.scene.add(this.model);

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
	var angleRadians
	// if( this.position < 1.1 ){
		angleRadians = Math.atan2( this.getPoint( this.path, this.position + 1 ).y - this.getPoint( this.path, this.position ).y, this.getPoint( this.path, this.position + 1 ).x - this.getPoint( this.path, this.position ).x );
	// } else {
	// 	angleRadians = Math.atan2( this.getPoint( this.path, this.position ).y - this.getPoint( this.path, this.position - 1 ).y, this.getPoint( this.path, this.position ).x - this.getPoint( this.path, this.position - 1 ).x );
	// }

	this.player.rotation.x = -angleRadians;

	var gravity = 9.8;
	var mass = .25;
	var friction = 0.02;

	var P = mass * gravity;
	Px = P * Math.sin(angleRadians);
	Py = P * Math.cos(angleRadians);
	Fr = friction * Py;
	Ef = Px * Fr;
	a = Ef / mass;

	this.speed += a * 1 / 60;
	this.position += this.speed;

	document.getElementById('speed').innerHTML = this.speed;
	var pp = this.path.getPointAtLength( this.position );
	document.getElementById('position').innerHTML = (this.origin.x - parseInt(pp.x.toFixed(3))) + ' ' + (this.origin.y - parseInt(pp.y.toFixed(3)));

	this.player.position.z = this.origin.x - pp.x;
	this.player.position.y = this.origin.y - pp.y;
}

App.prototype.step = function(time) {
	window.requestAnimationFrame(this.step.bind(this));
	// this.camera.lookAt(this.player.position)
	this.updatePosition();
	this.renderer.render( this.scene, this.cameraPlayer );
	// this.renderer.render( this.scene, this.camera );
};

var app = new App();