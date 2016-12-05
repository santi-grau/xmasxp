window.THREE = require('three');

var Stage = require('./views/stage');
var Player = require('./views/player');
var Prizes = require('./views/prizes');
var Lights = require('./views/lights');

var OrbitControls = require('three-orbit-controls')(THREE);

var App = function() {
	// props
	this.containerEl = document.getElementById('main');

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.set( 0, 30, -200 );
	// this.camera.rotation.x = Math.PI / 2
	var controls = new OrbitControls(this.camera);
	
	this.renderer = new THREE.WebGLRenderer({ alpha : false, antialias : true });
	this.renderer.setClearColor( 0x000000, 1 );

	this.renderer.shadowMap.enabled = true;
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	this.containerEl.appendChild( this.renderer.domElement );

	this.stage = new Stage( this );
	this.player = new Player( this );
	this.prizes = new Prizes( this );
	this.lights = new Lights( this );
	
	this.scene.add( this.stage.group, this.player.group, this.prizes.group, this.lights.group );
	
	var axisHelper = new THREE.AxisHelper( 5 );
	this.scene.add( axisHelper );

	window.onresize = this.onResize.bind(this);
	setTimeout( this.player.onStart.bind(this.player), 1000 );
	
	// run
	this.onResize();
	this.step();
}

App.prototype.onResize = function(e) {
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
	this.renderer.setSize( this.containerEl.offsetWidth * 1, this.containerEl.offsetHeight * 1 );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
	this.camera.updateProjectionMatrix();
}

App.prototype.step = function(time) {
	window.requestAnimationFrame(this.step.bind(this));
	this.stage.step( time );
	this.player.step( time );
	this.prizes.step( time );
	this.lights.step( time );
	this.renderer.render( this.scene, this.player.camera );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();