window.THREE = require('three');

var Stage = require('./views/stage');
var Player = require('./views/player');

var OrbitControls = require('three-orbit-controls')(THREE);
var model = require('../assets/base4.obj');
var OBJLoader = require('three-obj-loader')(THREE);

var App = function() {
	// props
	this.containerEl = document.getElementById('main');

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.set( 0, 100, 0 );
	this.camera.rotation.x = Math.PI / 2
	var controls = new OrbitControls(this.camera);

	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
	this.containerEl.appendChild( this.renderer.domElement );

	this.stage = new Stage( this );
	this.player = new Player( this );
	
	this.scene.add( this.stage.group, this.player.group );
	
	window.onresize = this.onResize.bind(this);

	// run
	this.onResize();
	this.step();
}

App.prototype.onResize = function(e) {
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
	this.camera.updateProjectionMatrix();
}

App.prototype.updatePosition = function(){
	document.getElementById('position').innerHTML = 'position : ' + ( this.player.group.position.x + ' ' + this.player.group.position.y );
	document.getElementById('speed').innerHTML = 'speed : ' + this.speed;
	document.getElementById('altitude').innerHTML = 'altitude : ' + this.player.altitude;
}

App.prototype.step = function(time) {
	window.requestAnimationFrame(this.step.bind(this));
	this.updatePosition();
	this.stage.step( time );
	this.player.step( time );
	// this.renderer.render( this.scene, this.player.camera );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();