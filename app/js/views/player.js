var skiModel = require('../../assets/ski.obj');

var svgIntersections = require('svg-intersections');
var intersect = svgIntersections.intersect;
intersect.plugin( require('svg-intersections/lib/functions/bezier') )
var shape = svgIntersections.shape;

var TweenMax = require('gsap');

var Player = function( parent ){
	this.parent = parent;

	this.oldPosition = new THREE.Vector3( 0, 0 ,0 );
	this.oldAltitude = null;
	// this.oldPosition = null;

	this.gravity = 0.98;
	// states
	this.waiting = true; // lapse while waiting to start descent
	this.descending = false; // lapse while descending slope
	this.ascending = false; // lapse while gaining altitude after jump
	this.hovering = false; // lapse when loosing altitude and approaching floor
	this.landing = false; // lapse when loosing altitude and approaching floor
	this.breaking = false; // lapse while stoping
	this.end = false; // lapse after stoping until EOT

	this.slopePosition = 0;
	this.rotation = -1.6286101308328111 + Math.PI / 2; // trust me on this one...
	this.speed = 0;
	this.landing = false;
	this.motionSpeed = 1;
	this.group = new THREE.Object3D();

	this.camera = new THREE.PerspectiveCamera( 24, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.y = 1.75;
	this.group.add( this.camera );

	// var cube = new THREE.Mesh( new THREE.BoxBufferGeometry( 10, 1.6, 10 ), new THREE.MeshBasicMaterial( { color: 0xff0000, side : THREE.DoubleSide } ) );
	// cube.position.y = 0.8;
	// this.group.add( cube );

	this.skiMesh = new THREE.OBJLoader().parse(skiModel);
	// this.skiMesh.traverse( function ( child ) { child.material = new THREE.MeshBasicMaterial( { side : THREE.DoubleSide, color : 0xff0000 } ); }.bind(this) );
	this.skiMesh.rotation.y = Math.PI / 2;
	this.skiMesh.position.y = 0.05;
	this.skiMesh.position.x = 0.1;
	this.skiMesh2 = this.skiMesh.clone();
	this.skiMesh2.position.x = -0.1;

	this.group.add( this.skiMesh, this.skiMesh2 );

	var pp = this.parent.stage.slopePath.getPointAtLength( this.slopePosition );
	this.position = new THREE.Vector3( 0 , this.parent.stage.slopeOrigin.y - pp.y, this.parent.stage.slopeOrigin.x - pp.x );

	this.raycaster = new THREE.Raycaster( this.group.position, new THREE.Vector3( 0, -1, 0 ), 0.1, 1000 );

	console.log('Player waiting to start');
}

Player.prototype.onStart = function(){
	this.waiting = false;
	// this.started = true;
	this.speed = 0.2
	console.log('Player start');
	// this.started = false;
	this.descending = true;
}
Player.prototype.descent = function( time ){
	var mass = 75;
	this.pos = new THREE.Vector3(0,0,0);
	var angleRadians = Math.atan2( this.parent.stage.slopePath.getPointAtLength( this.slopePosition + 1 ).y - this.parent.stage.slopePath.getPointAtLength( this.slopePosition ).y, this.parent.stage.slopePath.getPointAtLength( this.slopePosition + 1 ).x - this.parent.stage.slopePath.getPointAtLength( this.slopePosition ).x );
	var friction = 0.01;
	var P = mass * this.gravity;
	var Px = P * Math.sin(angleRadians);
	var Py = P * Math.cos(angleRadians);
	var Fr = friction * Py;
	var Ef = Px * Fr;
	var a = Ef / mass;

	this.speed += a / 60;
	this.slopePosition += this.speed;
	
	var pp = this.parent.stage.slopePath.getPointAtLength( this.slopePosition );
	this.position = new THREE.Vector3( 0 , this.parent.stage.slopeOrigin.y - pp.y, this.parent.stage.slopeOrigin.x - pp.x );
	var angle = Math.atan2(  this.position.z - this.oldPosition.z,  this.position.y - this.oldPosition.y );
	this.rotation += ( angle + Math.PI / 2 - this.rotation ) * 0.3;

	if( this.slopePosition > this.parent.stage.slopePath.getTotalLength() ) this.onJump();
}
Player.prototype.onJump = function(){
	this.descending = false;
	this.jumpOrigin = this.group.position;
	this.speedUp = Math.sin( this.parent.stage.slopeAngle * Math.PI / 180 ) * this.speed;
	this.speedForward = Math.cos( this.parent.stage.slopeAngle * Math.PI / 180 ) * this.speed;

	TweenMax.to( this, 2, { motionSpeed : 0.9, ease : Power2.easeOut });
	
	this.ascending = true;	
	console.log('Player jumps');
}

Player.prototype.ascent = function( time ){
	this.speedUp -= this.gravity / 60 * this.motionSpeed;
	this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );
	this.rotation += ( -this.rotation ) * 0.3;
	if(this.intersect.length) this.altitude = this.intersect[0].distance;
	if( this.speedUp < 0 ) this.onPeak();
}
Player.prototype.onPeak = function(){
	this.ascending = false;
	// TweenMax.to( this, 2, { motionSpeed : 1, ease : Power2.easeOut });
	this.peakAltitude = this.altitude;
	this.hovering = true;
	console.log('Player reached max height ( ' + this.peakAltitude + ' )' );
}
Player.prototype.onEndHover = function(){
	this.hovering = false;
	TweenMax.to( this, 2, { motionSpeed : 1, ease : Power2.easeOut });
	
	this.landing = true;
	console.log( 'Player ended hovering' );
}
Player.prototype.hover = function( time ){
	this.speedUp -= this.gravity / 60 * this.motionSpeed;
	this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );
	if(this.intersect.length) this.altitude = this.intersect[0].distance;
	if( this.altitude < this.peakAltitude - 3 ) this.onEndHover();
}

Player.prototype.land = function( time ){
	this.speedUp -= this.gravity / 60 * this.motionSpeed;
	this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );
	if(this.intersect.length) this.altitude = this.intersect[0].distance;
	// else this.onLand();
	var angle = Math.atan2(  this.position.z - this.oldPosition.z, this.altitude * 0.1 - this.oldAltitude  * 0.1);
	this.rotation = angle + Math.PI / 2;
	if( this.altitude < 3 ) this.onLand();


	var intersections = intersect(  
		shape("path", { d: 'M-291.324-174.0877c47.978-0.2317,71.3112,17.3651,108.8553,46.0455c43.1519,32.9643,96.7334,40.8891,144.6539,63.8938C2.5818-44.7557,39.0152-15.6982,84.4878-9.421C140.7772-1.6506,200.2027,0,258.4094,0' }),
		shape("line", { x1: -this.position.z, y1: -1000, x2: -this.position.z, y2: 1000 })  
	);
	console.log( -intersections.points[0].y, this.altitude );
}
Player.prototype.onLand = function(){
	this.landing = false;
	this.breaking = true;
	console.log( 'Player landed' );
}

Player.prototype.decel = function( time ){

	// this.speedUp -= this.gravity / 60 * this.motionSpeed;
	// this.position = new THREE.Vector3( this.jumpOrigin.x, ( this.jumpOrigin.y + this.speedUp ), ( this.jumpOrigin.z - this.speedForward * this.motionSpeed ) );
	// if(this.intersect.length) this.altitude = this.intersect[0].distance;
	// if( this.altitude < this.peakAltitude - 3 ) this.onEndHover();
}

Player.prototype.step = function( time ){

	this.intersect = this.raycaster.intersectObject ( this.parent.stage.landing, false );

	if( this.descending ) this.descent( time );
	if( this.ascending ) this.ascent( time );
	if( this.hovering ) this.hover( time );
	if( this.landing ) this.land( time );
	if( this.breaking ) this.decel( time );


	this.group.position.set( this.position.x, this.position.y, this.position.z );
	this.group.rotation.x = this.rotation;
	// console.log(this.altitude);
	// console.log(this.rotation * 180 / Math.PI);

	// store values for physics
	this.oldAltitude = this.altitude;
	this.oldRotation = this.rotation;
	this.oldPosition = this.group.position.clone();
}

module.exports = Player;