var Player = function( parent ){
	this.parent = parent;

	this.oldPosition = new THREE.Vector3( 0, 0 ,0 );

	this.position = 0;
	this.speed = 0;
	this.airborn = false;

	this.group = new THREE.Object3D();

	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
	this.camera.position.y = 1.75;
	this.group.add( this.camera );

	var cube = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1.6, 1 ), new THREE.MeshBasicMaterial( {color: 0xff0000, side : THREE.DoubleSide } ) );
	cube.position.y = 0.8;
	this.group.add( cube );

	this.group.position.z = this.parent.stage.slopeOrigin.x;
	this.group.position.y = this.parent.stage.slopeOrigin.y;

	this.raycaster = new THREE.Raycaster( this.group.position, new THREE.Vector3( 0, -1, 0 ), 0.1, 1000 );
}

Player.prototype.step = function( time ){
	var gravity = 0.98;
	var mass = 75;
	var pos = new THREE.Vector3(0,0,0);
	if( this.position < this.parent.stage.slopePath.getTotalLength() ){
		var angleRadians = Math.atan2( this.parent.stage.slopePath.getPointAtLength( this.position + 1 ).y - this.parent.stage.slopePath.getPointAtLength( this.position ).y, this.parent.stage.slopePath.getPointAtLength( this.position + 1 ).x - this.parent.stage.slopePath.getPointAtLength( this.position ).x );
		var friction = 0.01;
		var P = mass * gravity;
		var Px = P * Math.sin(angleRadians);
		var Py = P * Math.cos(angleRadians);
		var Fr = friction * Py;
		var Ef = Px * Fr;
		var a = Ef / mass;

		this.speed += a / 60;
		this.position += this.speed;

		var pp = this.parent.stage.slopePath.getPointAtLength( this.position );
		
		pos = new THREE.Vector3( 0 , this.parent.stage.slopeOrigin.y - pp.y, this.parent.stage.slopeOrigin.x - pp.x );
	} else {
		var slopeAngle = 30 * Math.PI / 180;
		if( !this.airborn ){
			this.jumpOrigin = this.group.position;
			
			this.speedUp = Math.sin( slopeAngle ) * this.speed;
			this.speedRight = Math.cos( slopeAngle ) * this.speed;
			this.airborn = true;			
		}

		this.speedUp -= gravity / 60;
		pos = new THREE.Vector3( this.jumpOrigin.x, this.jumpOrigin.y + this.speedUp, this.jumpOrigin.z - this.speedRight );
	}

	this.group.position.set(pos.x,pos.y,pos.z);
	var angle = Math.atan2(  this.group.position.z - this.oldPosition.z,  this.group.position.y - this.oldPosition.y );
	
	var intersect = this.raycaster.intersectObject ( this.parent.stage.landing, false );
	if(intersect.length) this.altitude = intersect[0].distance;
	this.group.rotation.x = angle + Math.PI / 2;

	this.oldPosition = this.group.position.clone();

}


module.exports = Player;