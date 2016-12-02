window.THREE = require('three');

var Stage = require('./views/stage');
var Player = require('./views/player');
var Prizes = require('./views/prizes');
var Lights = require('./views/lights');

var OrbitControls = require('three-orbit-controls')(THREE);
var VRControls = require('./scripts/vr/VRControls');
var VRControls = require('./scripts/vr/VREffect');
var VRControls = require('./scripts/vr/webvr-polyfill');

var App = function() {

	this.isPlayer = true;

	// props
	this.containerEl = document.getElementById('main');

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.set( 0, 30, -200 );
	// this.camera.rotation.x = Math.PI / 2

	// this.scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );

	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
	this.renderer.shadowMap.enabled = true;
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	this.effect = new THREE.VREffect(this.renderer);

	this.containerEl.appendChild( this.renderer.domElement );

	this.stage = new Stage( this );
	this.player = new Player( this );
	this.prizes = new Prizes( this );
	this.lights = new Lights( this );

	this.controls = (this.isPlayer)? new THREE.VRControls(this.player.camera) : new OrbitControls(this.camera);

	this.scene.add( this.stage.group, this.player.group, this.prizes.group, this.lights.group );

	var axisHelper = new THREE.AxisHelper( 5 );
	this.scene.add( axisHelper );

	window.onresize = this.onResize.bind(this);
	setTimeout( this.player.onStart.bind(this.player), 1000 );

	// run
	this.onResize();

	// Detection of VR displays and step method assigned to them
	this.vrDisplay = null;
	navigator.getVRDisplays().then(function(displays) {

	  	if (displays.length > 0) {

			this.vrDisplay = displays[0];
			this.vrDisplay.requestAnimationFrame( this.step.bind(this) );
		}
	}.bind(this));
}

App.prototype.onResize = function(e) {

  	this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
	this.camera.updateProjectionMatrix();
}

App.prototype.step = function(time) {

	this.stage.step( time );
	this.player.step( time );
	this.prizes.step( time );
	this.lights.step( time );

	this.controls.update();

	if (this.isPlayer) {
		this.effect.render( this.scene, this.player.camera );
	} else {
		this.renderer.render( this.scene, this.camera );
	}

	this.vrDisplay.requestAnimationFrame( this.step.bind(this) );
};

var app = new App();