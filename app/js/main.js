window.THREE = require('three');

var Loading = require('./views/loading');
var Stage = require('./views/stage');
var Player = require('./views/player');
var Prizes = require('./views/prizes');
var Lights = require('./views/lights');

var OBJLoader = require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE);
var VRControls = require('./scripts/vr/VRControls');
var DeviceOrientationControls = require('./scripts/vr/DeviceOrientationControls');
var VREffect = require('./scripts/vr/VREffect');
var StereoEffect = require('./scripts/vr/StereoEffect');
var ViveController = require('./scripts/vr/ViveController');
var WebVR = require('./scripts/vr/WebVR');
// var PolyfillWebVR = require('./scripts/vr/webvr-polyfill');

var App = function() {

	this.loading = new Loading(this);

    this.forceNonWebVR = false;
    this.isWebVR = (THREE.WebVR.isAvailable() === true && !this.forceNonWebVR);
    this.isCardboard = !this.isWebVR && this.isTouchDevice();
	this.isPlayer = true;
    this.isIOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

	// props
	this.containerEl = document.getElementById('main');0

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.set( 0, 30, -200 );
	this.camera.rotation.x = Math.PI / 2;

    // delete this
    // this.designCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
    // this.designCamera.position.set( 0, 37, -200 );
    // this.designCamera.rotation.y = 0

	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.shadowMap.enabled = true;
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.containerEl.appendChild( this.renderer.domElement );

    this.effect = (this.isCardboard)? new THREE.StereoEffect(this.renderer) : new THREE.VREffect(this.renderer);

	this.prizes = new Prizes( this );
	this.stage = new Stage( this );
	this.player = new Player( this );
	this.lights = new Lights( this );
    this.scene.add( this.stage.group, this.player.group, this.prizes.group, this.lights.group );

    var axisHelper = new THREE.AxisHelper( 5 );
    this.scene.add( axisHelper );

    this.activeCamera = (this.isPlayer)? this.player.camera : this.camera;
	this.controls = new OrbitControls(this.activeCamera);
	if (this.isPlayer) {

		if (this.isWebVR) {

			this.controls = new THREE.VRControls(this.activeCamera);

		} else if (this.isCardboard) {

	        if (this.isIOS) this.preventSleep();

	        this.controls = new THREE.DeviceOrientationControls(this.activeCamera);
	        this.controls.connect();
	        this.controls.update();

    	    this.renderer.domElement.addEventListener('click', this.fullscreen.bind(this), false);

		} else {

		    // put some limitations to the Orbit controls
	        this.controls.enableZoom = false;
	        this.controls.minPolarAngle = Math.PI / 4;
	        this.controls.maxPolarAngle = Math.PI / 1.25;
	        this.controls.minAzimuthAngle = -Math.PI / 4;
	        this.controls.maxAzimuthAngle = Math.PI / 4;
	        this.controls.target.set( 0, 0, -0.1 );
	        this.controls.update();
	    }
    }

	if (this.isPlayer && this.isWebVR ) {

        this.controls.standing = false;

        // Vive controllers
        console.log('here');
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

	window.addEventListener('resize', this.onResize.bind(this), true);


    // setTimeout( this.player.onStart.bind(this.player), 2000 );

	// run
	this.onResize();
	if (this.isCardboard) {

		requestAnimationFrame( this.step.bind(this) );

	} else {

    	this.effect.requestAnimationFrame( this.step.bind(this) );
    }
}

App.prototype.isTouchDevice = function () {

    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
};

App.prototype.preventSleep = function () {

    setInterval(function () {

        window.location.href = '/new/page';
        window.setTimeout(function () {
            window.stop();
        }, 0);

    }, 30000);
};

App.prototype.fullscreen = function () {

    if (this.containerEl.requestFullscreen) {
        this.containerEl.requestFullscreen();
    } else if (this.containerEl.msRequestFullscreen) {
        this.containerEl.msRequestFullscreen();
    } else if (this.containerEl.mozRequestFullScreen) {
        this.containerEl.mozRequestFullScreen();
    } else if (this.containerEl.webkitRequestFullscreen) {
        this.containerEl.webkitRequestFullscreen();
    }
}

App.prototype.onResize = function(e) {

    this.player.onResize(e);

    this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);
	this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
    this.camera.updateProjectionMatrix();
	// this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.setSize( this.containerEl.offsetWidth, this.containerEl.offsetHeight );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
}

App.prototype.step = function(time) {

	if (this.isCardboard) {

		requestAnimationFrame( this.step.bind(this) );

	} else {

    	this.effect.requestAnimationFrame( this.step.bind(this) );
    }

	this.stage.step( time );
	this.player.step( time );
	this.prizes.step( time );
	this.lights.step( time );

    this.controls.update();
    if ( this.isPlayer && this.isWebVR ) {

		this.viveController1.update();
		this.viveController2.update();
    }

    this.effect.render( this.scene, this.activeCamera );
    // this.effect.render( this.scene, this.designCamera ); // camera to debug score, delete when done
};

var app = new App();