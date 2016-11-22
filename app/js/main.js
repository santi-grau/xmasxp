window.THREE = require('three');

var OrbitControls = require('three-orbit-controls')(THREE);
// var model = require('../assets/test/ball.obj');
var OBJLoader = require('three-obj-loader')(THREE);

var App = function() {
	// props
	this.containerEl = document.getElementById('main');

	window.onresize = this.onResize.bind(this);
	
	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
	var controls = new OrbitControls(this.camera);
	
	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
	this.containerEl.appendChild( this.renderer.domElement );

	// run
	this.onResize();
	this.step();
}

App.prototype.onResize = function(e) {
	var vFOV = this.camera.fov * Math.PI / 180;
	this.camera.position.z = this.containerEl.offsetHeight / ( 2 * Math.tan( vFOV / 2 ) );
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
	this.camera.updateProjectionMatrix();
}

App.prototype.step = function(time) {
	window.requestAnimationFrame(this.step.bind(this));
	this.renderer.render( this.scene, this.camera );
};

var app = new App();