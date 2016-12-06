window.THREE = require('three');

var Loading = require('./views/loading');
var Stage = require('./views/stage');
var Player = require('./views/player');
var Prizes = require('./views/prizes');
var Lights = require('./views/lights');

var OBJLoader = require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE);
var PointerLockControls = require('./scripts/vr/PointerLockControls');
var VRControls = require('./scripts/vr/VRControls');
var DeviceOrientationControls = require('./scripts/vr/DeviceOrientationControls');
var VREffect = require('./scripts/vr/VREffect');
var StereoEffect = require('./scripts/vr/StereoEffect');
var ViveController = require('./scripts/vr/ViveController');
var WebVR = require('./scripts/vr/WebVR');
// var PolyfillWebVR = require('./scripts/vr/webvr-polyfill');

var App = function() {

    this.forceNonWebVR = false;
    this.isWebVR = (THREE.WebVR.isAvailable() === true && !this.forceNonWebVR);
    this.isCardboard = !this.isWebVR && this.isTouchDevice();
    this.isDesktop = !this.isWebVR && !this.isCardboard;
    this.isPointerLock = false;
    this.isDeviceOrientation = false;

    this.hasPointerLock = 'pointerLockElement' in document || 'webkitPointerLockElement' in document;

	this.loading = new Loading( this );

	this.isPlayer = true;
    this.isIOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

	this.stiSleep = 0;

	// props
	this.containerEl = document.getElementById('main');0

	// three stuff
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.set( 0, 30, -200 );
	this.camera.rotation.x = Math.PI / 2;

	this.renderer = new THREE.WebGLRenderer({ alpha : true, antialias : true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
	// this.renderer.shadowMap.enabled = true;
	// this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.containerEl.appendChild( this.renderer.domElement );

    this.effect = new THREE.VREffect(this.renderer);

	this.prizes = new Prizes( this );
	this.stage = new Stage( this );
	this.player = new Player( this );
	this.lights = new Lights( this );

    this.scene.add( this.stage.group, this.player.group, this.prizes.group, this.lights.group );

    var axisHelper = new THREE.AxisHelper( 5 );
    this.scene.add( axisHelper );

    this.activeCamera = (this.isPlayer)? this.player.camera : this.camera;
	this.controls = new OrbitControls(this.activeCamera);

	// if (this.isPlayer) {

	// 	if (this.isWebVR) {

	// 		this.controls = new THREE.VRControls(this.activeCamera);

	// 	}
		// else if (this.isCardboard) {

	 //        if (this.isIOS) this.preventSleep();

	 //        this.controls = new THREE.DeviceOrientationControls(this.activeCamera);
	 //        this.controls.connect();
	 //        this.controls.update();

  //   	    this.renderer.domElement.addEventListener('click', this.fullscreen.bind(this), false);

		// } else {

		//     // put some limitations to the Orbit controls
		//     this.setupOrbitControls();
	 //    }
    // }

	if (this.isPlayer && this.isWebVR ) {

        this.controls.standing = false;

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

	window.addEventListener('resize', this.onResize.bind(this), true);

	document.addEventListener( 'pointerlockchange', this.onPointerLockChange.bind(this), false );
	document.addEventListener( 'webkitpointerlockchange', this.onPointerLockChange.bind(this), false );
	document.addEventListener( 'pointerlockerror', this.onPointerLockError.bind(this), false );
	document.addEventListener( 'webkitpointerlockerror', this.onPointerLockError.bind(this), false );

	// run
	this.onResize();

	if (this.isWebVR) {

		this.effect.requestAnimationFrame( this.step.bind(this) );

	} else {

		requestAnimationFrame( this.step.bind(this) );
	}
};

App.prototype.onClickStart = function() {

	if (this.isDesktop) {

		if (this.hasPointerLock) this.setupPointerLock();
		else this.setupOrbitControls();

	} else if (this.isCardboard) {

		// Controls are always the same on cardboard devices
		this.controls = new THREE.DeviceOrientationControls(this.activeCamera);
		this.controls.connect();
		this.controls.update();

		this.setupCardboad();

	}
};

App.prototype.toggleControls = function() {

	if (this.isDesktop) {

		if (this.isPointerLock) this.setupOrbitControls();
		else this.setupPointerLock();

	} else if (this.isCardboard) {

		if (!this.isDeviceOrientation) this.setupDeviceOrientation();
		else this.setupCardboad();

	}
};

App.prototype.setupDeviceOrientation = function() {

	this.isDeviceOrientation = true;

	this.effect = new THREE.VREffect(this.renderer);
	this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);

	if (this.isIOS) this.cancelSleep();
};

App.prototype.setupCardboad = function() {

	this.isDeviceOrientation = false;

	this.effect = new THREE.StereoEffect(this.renderer);
	this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);

	this.fullscreen();
	if (this.isIOS) this.preventSleep();
};

App.prototype.setupPointerLock = function() {

	// Fullscreen and pointerLock
	this.controls = new THREE.PointerLockControls(this.activeCamera);
	this.controls.enabled = false;
	this.isPointerLock = true;

	// Ask the browser to lock the pointer
	document.body.requestPointerLock();
};

App.prototype.onPointerLockAccepted = function() {

	this.controls.getObject().position.set( 0, 0, 0 );
	this.player.cameraContainer.add( this.controls.getObject() );
	this.controls.enabled = true;
	this.activeCamera = this.player.camera;
};

App.prototype.setupOrbitControls = function() {

	this.isPointerLock = false;

	this.controls = new OrbitControls(this.activeCamera);

	this.controls.enableZoom = false;
	this.controls.minPolarAngle = Math.PI / 4;
	this.controls.maxPolarAngle = Math.PI / 1.25;
	this.controls.minAzimuthAngle = -Math.PI / 4;
	this.controls.maxAzimuthAngle = Math.PI / 4;
	this.controls.target.set( 0, 0, -0.1 );
	this.controls.update();

	this.player.cameraContainer.add( this.activeCamera );
	this.activeCamera = this.player.camera;
};

App.prototype.onPointerLockChange = function() {

	var element = document.body;
	if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

		this.onPointerLockAccepted();

	} else {

		this.setupOrbitControls();
	}
};

App.prototype.onPointerLockError = function() {

	this.setupOrbitControls();
};

App.prototype.isTouchDevice = function () {

    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
};

App.prototype.preventSleep = function () {

    this.stiSleep = setInterval(function () {

        window.location.href = '/new/page';
        window.setTimeout(function () {
            window.stop();
        }, 0);

    }, 30000);
};

App.prototype.cancelSleep = function() {

	clearInterval( this.stiSleep );
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
	this.renderer.setSize( this.containerEl.offsetWidth, this.containerEl.offsetHeight );
	this.renderer.domElement.setAttribute('style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px');
}

App.prototype.step = function(time) {

	if (this.isWebVR) {

		this.effect.requestAnimationFrame( this.step.bind(this) );

	} else {

		requestAnimationFrame( this.step.bind(this) );
	}

	this.stage.step( time );
	this.player.step( time );
	this.prizes.step( time );
	this.lights.step( time );

	if (!this.isPointerLock) {

    	this.controls.update();
    }

    if ( this.isPlayer && this.isWebVR ) {

		this.viveController1.update();
		this.viveController2.update();
    }

    this.effect.render( this.scene, this.activeCamera );
};

var app = new App();