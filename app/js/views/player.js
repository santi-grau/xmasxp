var skiModel = require('../../assets/ski.obj');
var OBJLoader = require('three-obj-loader')(THREE);
var svgIntersections = require('svg-intersections');
var intersect = svgIntersections.intersect;
intersect.plugin( require('svg-intersections/lib/functions/bezier') )
var shape = svgIntersections.shape;

var Target = require('./target'); // Target object for the player
var TargetCamera = require('./targetcamera'); // Point where the camera is targeting

var TweenMax = require('gsap');

var Player = function( parent ) {

	this.parent = parent;
	this.gravity = 0.98;
	this.currentStatus = 'waiting';

	// simulate head movement w mouse
	// window.addEventListener('mousemove', this.onMouseMove.bind(this) );

	var T = timbre;
	this.noise = T("noise", { mul:0.15 } );
	this.pan = T("pan", { pos : 0.5 }, this.noise ).play();

	this.slopePosition = 0;
	this.rotation = -1.6286101308328111 + Math.PI / 2; // trust me on this one...
	this.speed = 0;
	this.motionSpeed = 1;
	this.group = new THREE.Object3D();

	this.cameraContainer = new THREE.Object3D();
	this.cameraContainer.position.y = (this.parent.isWebVR)? 1 : 1.75;
	this.camera = new THREE.PerspectiveCamera( 24, this.parent.containerEl.offsetWidth / this.parent.containerEl.offsetHeight, 0.1, 10000 );
	this.camera.position.y = 0.01;
	this.cameraContainer.add( this.camera );
	this.group.add( this.cameraContainer );

	this.target = new Target( this );
	this.group.add( this.target.mesh );
	this.targetCamera = new TargetCamera( this, this.parent.prizes.prizes );
	this.camera.add( this.targetCamera.mesh );

	if (!this.parent.isPlayer) {

		var cube = new THREE.Mesh( new THREE.BoxBufferGeometry( 10, 1.6, 10 ), new THREE.MeshBasicMaterial( { color: 0x0000ff, side : THREE.DoubleSide } ) );
		cube.position.y = 0.8;
		this.group.add( cube );
	}

	this.skiMesh = new THREE.OBJLoader().parse(skiModel);
	this.skiMesh.rotation.y = Math.PI / 2;
	this.skiMesh.position.y = 0.05;
	this.skiMesh.position.x = 0.1;
	this.skiMesh2 = this.skiMesh.clone();
	this.skiMesh2.position.x = -0.1;

	this.group.add( this.skiMesh, this.skiMesh2 );

	var pp = this.parent.stage.slope.getPointAtLength( this.slopePosition );
	this.position = new THREE.Vector3( 0 , this.parent.stage.slopeOrigin.y - pp.y, this.parent.stage.slopeOrigin.x - pp.x );

	console.log('Player waiting to start');
}
// Player.prototype.onMouseMove = function( e ){
// 	this.posX = (e.x / window.innerWidth - 0.5) / 0.5;
// }
Player.prototype.waiting = function(){
	this.rotation = Math.PI / 24
}

Player.prototype.onStart = function(){

	this.speed = 0.2
	this.currentStatus = 'descending';
	this.target.show();

	console.log('Player start');
}

Player.prototype.descending = function( time ){

	var mass = 75;
	this.pos = new THREE.Vector3(0,0,0);
	var angleRadians = Math.atan2( this.parent.stage.slope.getPointAtLength( this.slopePosition + 1 ).y - this.parent.stage.slope.getPointAtLength( this.slopePosition ).y, this.parent.stage.slope.getPointAtLength( this.slopePosition + 1 ).x - this.parent.stage.slope.getPointAtLength( this.slopePosition ).x );
	var friction = 0.01;
	var P = mass * this.gravity;
	var Px = P * Math.sin(angleRadians);
	var Py = P * Math.cos(angleRadians);
	var Fr = friction * Py;
	var Ef = Px * Fr;
	var a = Ef / mass;

	this.speed += a / 60;
	this.slopePosition += this.speed;

	var pp = this.parent.stage.slope.getPointAtLength( this.slopePosition );
	this.position = new THREE.Vector3( 0 , this.parent.stage.slopeOrigin.y - pp.y, this.parent.stage.slopeOrigin.x - pp.x );
	var angle = Math.atan2(  this.position.z - this.oldPosition.z,  this.position.y - this.oldPosition.y );
	this.rotation += ( angle + Math.PI / 2 - this.rotation ) * 0.3;

	if( this.slopePosition > this.parent.stage.slope.getTotalLength() ) this.onJump();
}

Player.prototype.onJump = function(){

	this.jumpOrigin = this.group.position;
	this.speedUp = Math.sin( this.parent.stage.slopeAngle * Math.PI / 180 ) * this.speed;
	this.speedForward = Math.cos( this.parent.stage.slopeAngle * Math.PI / 180 ) * this.speed;

	TweenMax.to( this, 0.2, { speed : 0, ease : Power2.easeOut });
	TweenMax.to( this, 2, { motionSpeed : 0.01, ease : Power2.easeOut });
	TweenMax.to( this.camera, 2, { fov : 40, ease : Power2.easeOut, onUpdate : this.updateCamera.bind(this) });

	this.currentStatus = 'ascending'
	this.target.hide();

	console.log('Player jumps');
}

Player.prototype.updateCamera = function(){
	this.camera.updateProjectionMatrix();
}

Player.prototype.getGroundIntersection = function( playerData ){
	var xsect;
	var intersections = intersect(
		shape("path", { d: this.parent.stage.landingPath }),
		shape("line", playerData)
	);
	if( intersections.points.length ) xsect = -intersections.points[0].y;
	else xsect = null;
	return xsect;
}

Player.prototype.getAltitude = function(){
	return this.getGroundIntersection( { x1: -this.position.z, y1: -this.position.y, x2: -this.position.z, y2: 1000 } );
}

Player.prototype.ascending = function( time ){
	this.speedUp -= this.gravity / 60 * this.motionSpeed;
	this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );
	this.rotation += ( -this.rotation ) * 0.3;
	this.altitude = this.getAltitude();
	if( this.speedUp < 0 ) this.onPeak();
}

Player.prototype.onPeak = function(){
	// TweenMax.to( this, 2, { motionSpeed : 1, ease : Power2.easeOut });
	this.peakAltitude = this.altitude;
	this.currentStatus = 'hovering'
	console.log('Player reached max height ( ' + this.peakAltitude + ' )' );
}

Player.prototype.onEndHover = function(){
	TweenMax.to( this, 2, { motionSpeed : 1, ease : Power2.easeOut });
	this.currentStatus = 'landing';
	console.log( 'Player ended hovering' );
}

Player.prototype.hovering = function( time ){
	this.speedUp -= this.gravity / 60 * this.motionSpeed;
	this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );

	this.altitude = this.getAltitude();
	if( this.altitude < this.peakAltitude - 3 ) this.onEndHover();
}

Player.prototype.landing = function( time ){
	this.speedUp -= this.gravity / 60 * this.motionSpeed;
	this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );
	this.rotation += ( 0 - this.rotation ) * 0.1

	this.altitude = this.getAltitude();
	if( !this.altitude ) this.onLand();
}

Player.prototype.onLand = function(){
	this.position.y = this.getGroundIntersection( { x1: -this.position.z, y1: -this.position.y, x2: -this.position.z, y2: -100 } );
	TweenMax.to( this.camera, 3, { fov : 32, ease : Power2.easeOut, onUpdate : this.updateCamera.bind(this) });

	console.log( 'Player touched the ground' );
	this.currentStatus = 'breaking'
}

Player.prototype.onEnd = function(){
	this.currentStatus = 'ending'
	console.log( 'Player has stopped completely' );
}

Player.prototype.breaking = function( time ){
	var friction = 0.987;
	this.speedForward *= friction;
	this.position.y = this.getGroundIntersection( { x1: -this.position.z, y1: 1000, x2: -this.position.z, y2: -100 } );
	this.position.z += -this.speedForward;
	this.speed = this.speedForward;
	// Bounce fitipaldi!!
	if( this.position.z < -230 ) this.speedForward *= -1;
	this.position.z -= this.speedForward;
	if( Math.abs( this.speedForward ) < 0.01 ) this.onEnd();
}

Player.prototype.ending = function( time ){
	// console.log(time);
}

Player.prototype.step = function( time ){
	// this.pan.pos = (Math.sin( time/1000 ) + 1) / 2

	this.noise.mul = this.speed / 10;

	this[this.currentStatus]( time );

	this.group.position.set( this.position.x, this.position.y, this.position.z );
	this.group.rotation.x = this.rotation;

	// store values for physics
	this.oldAltitude = this.altitude;
	this.oldRotation = this.rotation;
	this.oldPosition = this.group.position.clone();

	this.target.step();
	this.targetCamera.step();
}

Player.prototype.onResize = function(e) {

    this.camera.aspect = this.parent.containerEl.offsetWidth / this.parent.containerEl.offsetHeight;
    this.camera.updateProjectionMatrix();
}

module.exports = Player;