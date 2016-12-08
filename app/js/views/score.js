var TweenMax = require('gsap');

var Score = function( parent ){

	this.parent = parent;

	this.speed = 0.1;
	this.points = 0;
	this.altitude = 0;

	this.phaseinc = 0;
	this.plane = new THREE.PlaneBufferGeometry( 30, 20 );

	this.canvas = document.createElement('canvas');
	this.canvas.width = 512;
	this.canvas.height = 256;
	this.context = this.canvas.getContext('2d');

	this.texture = new THREE.Texture( this.canvas );
	var material = new THREE.MeshBasicMaterial( { color : 0xffffff, map : this.texture } );

	this.mesh = new THREE.Mesh( this.plane,  material );
	this.mesh.rotation.y = -Math.PI / 2;

	this.mesh.position.y = 37;
	this.mesh.position.x = 262.5;
	this.mesh.position.z = 0;

	this.speeedIcon = new Image();
	this.speeedIcon.src = 'assets/speed.png';

	this.isOver = false;

	this.timeTicker = 0;

	this.drawTexture();
};

Score.prototype.reset = function() {

	this.speed = 0.1;
	this.points = 0;
	this.altitude = 0;
	this.bonus = false;
	this.isOver = false;

	this.drawTexture();
};

Score.prototype.drawTexture = function() {

	// if( this.bonus ) return;

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
    this.context.fillText('TOTAL SCORE', this.canvas.width / 2, 40);
    this.context.fillStyle = col2;
    this.context.font = "50px matrix";
    this.context.fillText( Math.floor(this.points).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),  this.canvas.width / 2, 100);

    this.context.fillRect( 10, 115, this.canvas.width - 20, 2 );

    this.context.font = "20px matrix";
    this.context.fillText('TOP SPEED: ' + this.speed.toFixed(2) + 'km/h', this.canvas.width / 2, 140);

    this.context.fillRect( 10, 150, this.canvas.width - 20, 2 );

    this.context.font = "20px matrix";
    this.context.fillText('TOP ALTITUDE: ' + this.altitude.toFixed(2) + 'm', this.canvas.width / 2, 175);

    this.context.fillRect( 10, 185, this.canvas.width - 20, 2 );

    // Play again button

    if (this.isOver) {

    	this.context.fillStyle = col2;
    	this.context.fillRect( 10, 205, this.canvas.width - 20, 40 );

    } else {

    	this.context.strokeStyle = col2;
    	this.context.lineWidth = 2;
    	this.context.strokeRect( 10, 205, this.canvas.width - 20, 40 );
    }
    this.context.fillStyle = (this.isOver)? col1 : col2;
    this.context.font = "30px matrix";
    this.context.fillText('PLAY AGAIN', this.canvas.width / 2, 235);

    this.texture.needsUpdate = true;
};

Score.prototype.updateSpeed = function(speed) {
	this.speed = speed * 100;
	this.drawTexture();
};


Score.prototype.updateAltitude = function(altitude) {
	this.altitude = altitude;
	this.drawTexture();
};

Score.prototype.updatePoints = function(points) {
	this.points = points;
	this.drawTexture();
};

Score.prototype.showBonus = function(bonus) {
	this.bonus = true;


	// var col1 = '#000000';
	// var col2 = '#ffdaa0';
	// this.context.fillStyle = col1;
	// this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	// this.context.fillStyle = col2;
 //    this.context.font = "20px matrix";
 //    this.context.fillText('BONUS!!! ', this.canvas.width / 2, 175);

	// this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
	// this.context.globalCompositeOperation = "source-atop";
	// this.context.drawImage(this.speeedIcon,0,0, 100, 100);

 //    this.texture.needsUpdate = true;

	console.log('bonus : ' + bonus);
};

Score.prototype.onOverReset = function() {

	this.isOver = true;
	this.drawTexture();
};

Score.prototype.onOutReset = function() {

	this.isOver = false;
	this.drawTexture();
};

Score.prototype.drawIdleScreen = function( time ) {

	var col1 = '#000000';
	var col2 = '#ffdaa0';
	if( this.phaseinc ){
		this.context.fillStyle = col1;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = col2;
	} else {
		this.context.fillStyle = col2;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = col1;
	}
	this.context.textAlign = 'left';
	this.context.font = "20px blck";
	for( var i = 0; i < 50 ; i++ ) this.context.fillText('*', Math.random() * this.canvas.width, Math.random() * this.canvas.height );

	this.context.font = "80px blck";
	this.context.fillText('SKI', 10, 140);
	this.context.fillText('JUMP', 210, 196);

	this.texture.needsUpdate = true;
};



Score.prototype.step = function( time ){
	this.timeTicker++;

	if( this.points == 0 ){
		if(this.timeTicker % 60 == 0 ) {
			this.phaseinc = !this.phaseinc;
			this.drawIdleScreen( time );
		}
	}
}
module.exports = Score;