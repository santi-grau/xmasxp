window.THREE = require('three');

var Loading = require('./views/loading');
var Stage = require('./views/stage');
var Player = require('./views/player');
var Prizes = require('./views/prizes');
var Lights = require('./views/lights');
var Intro = require('./views/intro');
var Audience = require('./views/audience');

var OBJLoader = require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE);
var PointerLockControls = require('./scripts/vr/PointerLockControls');
var VRControls = require('./scripts/vr/VRControls');
var DeviceOrientationControls = require('./scripts/vr/DeviceOrientationControls');
var VREffect = require('./scripts/vr/VREffect');
var StereoEffect = require('./scripts/vr/StereoEffect');
var ViveController = require('./scripts/vr/ViveController');
var WebVR = require('./scripts/vr/WebVR');

var App = function() {

    this.onIntro = true;

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
    this.isReseting = false;

    // props
    this.containerEl = document.getElementById('main');0

    // three stuff
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.camera.position.set( 200, 500, 0 );
    this.camera.lookAt(new THREE.Vector3( 0,0,0 ) )

    // // delete this
    this.introCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.introCamera.position.set( 300, 400, 0 );
    this.introCamera.lookAt(new THREE.Vector3( 0,0,0 ) )
    // this.introCamera.rotation.y = 0

    this.renderer = new THREE.WebGLRenderer({ alpha : false, antialias : true });
    this.renderer.autoClear = false;
    var maxDPR = (this.isCardboard)? window.devicePixelRatio * 1 : window.devicePixelRatio * 0.75;
    this.renderer.setPixelRatio(Math.max( 1, maxDPR ));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.containerEl.appendChild( this.renderer.domElement );

    this.effect = new THREE.VREffect(this.renderer);

    this.intro = new Intro( this );
    this.prizes = new Prizes( this );
    this.stage = new Stage( this );
    this.player = new Player( this );
    this.audience = new Audience( this );
    this.lights = new Lights( this );

    this.scene.add( this.stage.group, this.player.group, this.prizes.group, this.lights.group );

    var axisHelper = new THREE.AxisHelper( 5 );
    this.scene.add( axisHelper );

    this.activeCamera = (this.isPlayer)? this.player.camera : this.camera;
    this.controls = (this.isWebVR)? new THREE.VRControls(this.activeCamera) : new OrbitControls(this.activeCamera);

    if (this.isPlayer && this.isWebVR ) {

        this.controls.standing = false;

        // Vive controllers :: TODO
        // this.viveController1 = new THREE.ViveController( 0 );
        // this.viveController1.standingMatrix = this.controls.getStandingMatrix();
        // this.scene.add( this.viveController1 );
        // this.viveController2 = new THREE.ViveController( 1 );
        // this.viveController2.standingMatrix = this.controls.getStandingMatrix();
        // this.scene.add( this.viveController2 );
        //
        // var loader = new THREE.OBJLoader();
        // loader.load( 'assets/vive-controller/vr_controller_vive_1_5.obj', function ( object ) {
        //
        //     var loader = new THREE.TextureLoader();
        //     loader.setPath( 'assets/vive-controller/' );
        //     var controller = object.children[ 0 ];
        //     controller.material.map = loader.load( 'onepointfive_texture.png' );
        //     controller.material.specularMap = loader.load( 'onepointfive_spec.png' );
        //     this.viveController1.add( object.clone() );
        //     this.viveController2.add( object.clone() );
        //
        // }.bind(this) );

        // document.body.appendChild( THREE.WebVR.getButton(this.effect) );
    }

    window.addEventListener('resize', this.onResize.bind(this), true);
    window.addEventListener('orientationchange', this.onResize.bind(this), true);

    document.addEventListener( 'pointerlockchange', this.onPointerLockChange.bind(this), false );
    document.addEventListener( 'webkitpointerlockchange', this.onPointerLockChange.bind(this), false );
    document.addEventListener( 'pointerlockerror', this.onPointerLockError.bind(this), false );
    document.addEventListener( 'webkitpointerlockerror', this.onPointerLockError.bind(this), false );

    document.addEventListener('keyup', function(e) { if (e.keyCode == 32) this.reset(); }.bind(this), false);
    // run
    this.onResize();

    if (this.isWebVR) {

        this.effect.requestAnimationFrame( this.step.bind(this) );

    } else {

        requestAnimationFrame( this.step.bind(this) );
    }
};

App.prototype.reset = function() {

    if (!this.isReseting) {

        this.isReseting = true;

        TweenMax.to( this.renderer.domElement, 1.0, {

            opacity: 0.001,
            ease: Power2.easeInOut,
            onComplete: function () {

                this.player.reset();
                this.prizes.reset();
                this.stage.score.reset();

                this.isReseting = false;

                TweenMax.to( this.renderer.domElement, 1.0, {

                    opacity: 0.999,
                    ease: Power2.easeInOut
                } );

            }.bind( this )

        } );
    }
};

App.prototype.onClickStart = function(startInCardboard) {
    this.onIntro = false;
    this.intro.onEnd();
    this.stage.countdown.drawTexture();
    if (this.isDesktop) {

        if (this.hasPointerLock) this.setupPointerLock();
        else this.setupOrbitControls();

    } else if (this.isCardboard) {

        // Controls are always the same on cardboard devices
        this.controls = new THREE.DeviceOrientationControls(this.activeCamera);
        this.controls.connect();
        this.controls.update();

        if (startInCardboard) {

            this.setupCardboad();

        } else {

            this.setupDeviceOrientation();
        }

    } else if (this.isWebVR) {

        this.effect.requestPresent();
    }
};

App.prototype.toggleControls = function() {

    if (this.isDesktop) {

        if (this.isPointerLock) this.setupOrbitControls();
        else this.setupPointerLock();

    } else if (this.isCardboard) {

        if (!this.isDeviceOrientation) this.setupDeviceOrientation();
        else this.setupCardboad();

    } else if (this.isWebVR) {

        this.effect.isPresenting ? this.effect.exitPresent() : this.effect.requestPresent();
    }
};

App.prototype.setupDeviceOrientation = function() {

    this.isDeviceOrientation = true;

    this.effect = new THREE.VREffect(this.renderer);
    this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);

    // if (this.isIOS) this.cancelSleep();

    this.loading.changeButton('cardboard');
};

App.prototype.setupCardboad = function() {

    this.isDeviceOrientation = false;

    this.effect = new THREE.StereoEffect(this.renderer);
    this.effect.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);

    this.fullscreen();
    // if (this.isIOS) this.preventSleep();

	this.loading.changeButton('phone');
};

App.prototype.setupPointerLock = function() {

    // Fullscreen and pointerLock
    this.controls = new THREE.PointerLockControls(this.activeCamera);
    this.controls.enabled = false;
    this.isPointerLock = true;

    // Ask the browser to lock the pointer
    document.body.requestPointerLock();

    this.loading.changeButton('drag');
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

    this.loading.changeButton('pointerlock');
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

    if (this.isWebVR) time = time / 1000;

    if (this.onIntro){

        this.intro.step( time );
        this.introCamera.position.set( Math.sin( (time + 50000) / 50000 ) * 250, 300 + Math.cos( time / 50000 ) * 150, Math.cos( time / 50000 ) * 300 );
        this.introCamera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

        // DEBUG for audience positioning
        // this.introCamera.position.set( 0, 80, -220 );
        // this.introCamera.lookAt( new THREE.Vector3( 0, 20, -220 ) );
    }

    if (this.isWebVR) {

        this.effect.requestAnimationFrame( this.step.bind(this) );

    } else {

        requestAnimationFrame( this.step.bind(this) );
    }

    this.stage.step( time );
    this.player.step( time );
    this.prizes.step( time );
    this.lights.step( time );
    this.audience.step( time );

    if (!this.isPointerLock) {

        this.controls.update();
    }

    // if ( this.isPlayer && this.isWebVR ) {
    //
    //     this.viveController1.update();
    //     this.viveController2.update();
    // }

    this.renderer.clear();

     if( !this.onIntro ) this.effect.render( this.scene, this.activeCamera );
     if( this.onIntro ) this.effect.render( this.scene, this.introCamera ); // camera to debug score, delete when done
};

var app = new App();