window.THREE = require('three');

var Stage = require('./views/stage');
var Player = require('./views/player');
var Prizes = require('./views/prizes');
var Lights = require('./views/lights');

var OBJLoader = require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE);
var VRControls = require('./scripts/vr/VRControls');
var VREffect = require('./scripts/vr/VREffect');
var ViveController = require('./scripts/vr/ViveController');
var WEBVR = require('./scripts/vr/WebVR');
var PolyfillWebVR = require('./scripts/vr/webvr-polyfill');

var App = function() {

	this.isPlayer = true;

	// props
	this.containerEl = document.getElementById('main');

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.set( 0, 30, -200 );
	this.camera.rotation.x = Math.PI / 2

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
	if (this.isPlayer) {

		this.controls.standing = false;

        if ( THREE.WebVR.isAvailable() === true ) {

			// Vive controllers

			this.viveController1 = new THREE.ViveController( 0 );
			this.viveController1.standingMatrix = this.controls.getStandingMatrix();
			this.scene.add( this.viveController1 );
			this.viveController2 = new THREE.ViveController( 1 );
			this.viveController2.standingMatrix = this.controls.getStandingMatrix();
			this.scene.add( this.viveController2 );

            var loader = new THREE.OBJLoader();
			loader.load( 'assets/vive-controller/vr_controller_vive_1_5.obj', function ( object ) {

				var loader = new THREE.TextureLoader();
				loader.setPath( 'assets/vive-controller/' );
				var controller = object.children[ 0 ];
				controller.material.map = loader.load( 'onepointfive_texture.png' );
				controller.material.specularMap = loader.load( 'onepointfive_spec.png' );
				this.viveController1.add( object.clone() );
				this.viveController2.add( object.clone() );
			}.bind(this) );

			document.body.appendChild( THREE.WebVR.getButton(this.effect) );
        }
    }

	this.scene.add( this.stage.group, this.player.group, this.prizes.group, this.lights.group );

	var axisHelper = new THREE.AxisHelper( 5 );
	this.scene.add( axisHelper );

	window.onresize = this.onResize.bind(this);
	setTimeout( this.player.onStart.bind(this.player), 1000 );

	// run
	this.onResize();
	this.effect.requestAnimationFrame( this.step.bind(this) );
}

App.prototype.onResize = function(e) {

  	this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
	this.camera.updateProjectionMatrix();
}

App.prototype.step = function(time) {

    this.effect.requestAnimationFrame( this.step.bind(this) );

	this.stage.step( time );
	this.player.step( time );
	this.prizes.step( time );
	this.lights.step( time );


    if ( this.isPlayer && THREE.WebVR.isAvailable() === true ) {

		this.viveController1.update();
		this.viveController2.update();
    }

	this.controls.update();

	if (this.isPlayer) {

		this.effect.render( this.scene, this.player.camera );
	} else {

		this.renderer.render( this.scene, this.camera );
	}
};

var app = new App();