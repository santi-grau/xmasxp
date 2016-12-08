var SimplexNoise = require('simplex-noise');

var Countdown = function( parent ) {

	this.parent = parent;
	this.value = 0;

	this.plane = new THREE.PlaneBufferGeometry( 5.9, 3.6 );

	this.canvas = document.createElement('canvas');
	this.canvas.width = 512;
	this.canvas.height = 256;
	this.context = this.canvas.getContext('2d');

	this.texture = new THREE.Texture( this.canvas );
	var material = new THREE.MeshBasicMaterial( { color : 0xffffff, map : this.texture } );

	this.mesh = new THREE.Mesh( this.plane,  material );
	this.mesh.rotation.y = -Math.PI / 2;
	this.mesh.position.set( -235, 193, 0 );

	this.secondsLeft = 3;
	this.secondsTotal = 3;

	this.drawTexture();
};

Countdown.prototype.step = function( time ) {

};

Countdown.prototype.updateSeconds = function(numSeconds) {

	var secondsBefore = this.secondsLeft;
	var secondsNow = Math.ceil(this.secondsTotal - numSeconds);

	if (secondsBefore != secondsNow) {

		this.secondsLeft = secondsNow;
		this.drawTexture();
	}
};

Countdown.prototype.drawTexture = function() {

	var col1 = '#000000';
	var col2 = '#ffdaa0';
	this.context.fillStyle = col1;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


	this.context.fillStyle = col2;
	this.context.fillRect( 10, 10, this.canvas.width - 20, 40 );
	this.context.fill();
    this.context.fillStyle = col1;
    this.context.textAlign = 'center';
    this.context.font = "30px matrix";
    this.context.fillText('GAZE HERE TO BEGIN', this.canvas.width / 2, 40);

	this.context.fillStyle = col2;
    this.context.fillRect( 10, 60, this.canvas.width - 20, this.canvas.height - 60 - 10 );

    this.context.fillStyle = col1;
    this.context.textAlign = 'center';
    this.context.font = "180px matrix";
    this.context.fillText(this.secondsLeft, this.canvas.width / 2, 210);

    // this.context.font = "20px matrix";
    // this.context.fillText('TOP SPEED: ' + this.speed.toFixed(2) + 'km/h', this.canvas.width / 2, 140);

    // this.context.fillRect( 10, 150, this.canvas.width - 20, 2 );

    // this.context.font = "20px matrix";
    // this.context.fillText('TOP ALTITUDE: ' + this.altitude.toFixed(2) + 'm', this.canvas.width / 2, 175);

    // this.context.fillRect( 10, 185, this.canvas.width - 20, 2 );

    this.texture.needsUpdate = true;
};

module.exports = Countdown;