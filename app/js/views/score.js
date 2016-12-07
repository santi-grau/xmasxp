var TweenMax = require('gsap');

var Score = function( parent ){

	this.parent = parent;

	this.speed = 0.1;
	this.points = 0;
	this.altitude = 0;

	this.bonusAnimation = 0;

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

	this.updateFrameInterval = 20;
	this.updateFrameCount = 0;

	this.drawTexture();

	// this.showBonus('speed')
	// this.points = 1;
}

Score.prototype.drawTexture = function() {
	if( this.bonus ) return;
	var col1 = '#000000';
	var col2 = '#ffdaa0';
	this.context.fillStyle = col1;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	
	
	this.context.fillStyle = col2;
	this.context.rect( 10, 10, this.canvas.width - 20, 40 );
	this.context.fill();
    this.context.fillStyle = col1;
    this.context.textAlign = 'center'; 
    this.context.font = "30px matrix";
    this.context.fillText('TOTAL SCORE', this.canvas.width / 2, 40);
    this.context.fillStyle = col2;
    this.context.font = "50px matrix";
    this.context.fillText( Math.floor(this.points).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),  this.canvas.width / 2, 100);

    this.context.rect( 10, 115, this.canvas.width - 20, 2 );

    this.context.font = "20px matrix";
    this.context.fillText('TOP SPEED: ' + this.speed.toFixed(2) + 'km/h', this.canvas.width / 2, 140);

    this.context.rect( 10, 150, this.canvas.width - 20, 2 );

     this.context.font = "20px matrix";
    this.context.fillText('TOP ALTITUDE: ' + this.altitude.toFixed(2) + 'm', this.canvas.width / 2, 175);

    this.context.rect( 10, 185, this.canvas.width - 20, 2 );

    // this.texture.needsUpdate = true;
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

Score.prototype.showBonus = function( bonus ) {
	this.bonus = true;


	// var col1 = '#000000';
	// var col2 = '#ffdaa0';
	// this.context.fillStyle = col1;
	// this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	// this.context.fillStyle = col2;
 //    this.context.font = "40px matrix";
 //    this.context.fillText('SPEED BONUS!!! ', this.canvas.width / 2, 175);

    TweenMax.to( this, 10, { bonusAnimation : 10, onUpdate : this.animateBonus.bind(this), onComplete: function(){ this.bonus = false; }.bind(this) });

	// this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
	// this.context.globalCompositeOperation = "source-atop";
	// this.context.drawImage(this.speeedIcon,0,0, 100, 100);

    // this.texture.needsUpdate = true;

	console.log('bonus : ' + bonus);
};
Score.prototype.animateBonus = function( step ) {

	var col1 = '#000000';
	var col2 = '#ffdaa0';

	
	var scale = Math.floor( this.bonusAnimation ) + 1;
	console.log(scale);
	
	
	this.context.fillStyle = col1;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.save();
	this.context.fillStyle = col2;

	
	// this.context.translate( -this.canvas.width / 2, -this.canvas.height / 2 );
	// this.context.scale( scale, scale );

    this.context.font = "20px matrix";
    this.context.fillText('SPEED BONUS!!! ', this.canvas.width / 2, this.canvas.height / 2);
    this.context.restore();
	this.texture.needsUpdate = true;

}

Score.prototype.updateTexture = function( time ) {
	
}


Score.prototype.drawIdleScreen = function( time ) {
	var col1 = '#000000';
	var col2 = '#ffdaa0';
	this.phaseinc += 0.1;
	var phase = Math.sin( this.phaseinc ) + 1;
	if( Math.floor(phase) ){
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
	this.updateTexture();
	// this.texture.needsUpdate = true;
};



Score.prototype.step = function( time ){
	if( this.points == 0 ){
		this.drawIdleScreen( time );
	}
	if( this.updateFrameCount < this.updateFrameInterval ) this.updateFrameCount++;
	else{
		this.texture.needsUpdate = true;
		this.updateFrameCount = 0;
	}
}
module.exports = Score;