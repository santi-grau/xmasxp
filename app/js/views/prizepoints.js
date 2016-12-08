var PrizePoints = function( parent, points ){

	this.parent = parent;

	this.points = points;
	this.available = true;
	this.audio = new Audio("assets/pickPrize.mp3");


	this.createMesh();
	this.drawTexture();
}

PrizePoints.prototype.createMesh = function() {

    this.plane = new THREE.PlaneBufferGeometry( 8, 8 );

    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.context = this.canvas.getContext('2d');

    this.texture = new THREE.Texture( this.canvas );
    var material = new THREE.MeshBasicMaterial( {
        color : 0xffffff,
        map: this.texture,
        side : THREE.DoubleSide,
        transparent : true,
        opacity : 0.0,
        depthTest : false
    } );

    this.mesh = new THREE.Mesh( this.plane, material );
    this.mesh.position.set(0, 0, 0);
};

PrizePoints.prototype.drawTexture = function() {

	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.font = "Bold 128px Arial";
	this.context.textAlign = "center";
	this.context.fillStyle = "#ffffff";
    this.context.fillText(this.points, 128, 128);

    this.texture.needsUpdate = true;
};

PrizePoints.prototype.updatePoints = function(points) {

	if (this.points !== points) {

		this.points = points;
		this.drawTexture();
	}
};

PrizePoints.prototype.animate = function() {

	this.available = false;
	this.mesh.visible = true;

	if (this.parent.parent.loading.isAudioPlaying) {

		this.audio.play();
	}

	TweenMax.to( this.mesh.position, 1.5, {

        y : this.mesh.position.y + 10.0,
        ease : Power2.easeOut
    } );

	TweenMax.to( this.mesh.material, 0.5, {

        opacity : 1.0,
        ease : Linear.none,
        onComplete : function () {

			TweenMax.to( this.mesh.material, 0.5, {

		        opacity : 0.0,
		        delay: 0.5,
		        ease : Power2.easeOut,
		        onComplete : function () {

		        	this.available = true;
		        	this.mesh.material.opacity = 0.0;
					this.mesh.position.set( 0, 0, 0 );
					this.mesh.visible = false;

					this.audio.pause();
					this.audio.currentTime = 0;

		        }.bind( this )
		    } );

        }.bind( this )
    } );
};

module.exports = PrizePoints;