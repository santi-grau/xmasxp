
var TargetCamera = function( parent, prizes ){

    this.parent = parent;
    this.prizes = prizes.slice();
    this.speedTarget = this.parent.target;
    this.speedLineMultiplier = 1.0;


    this.plane = new THREE.PlaneBufferGeometry( 0.1, 0.1 );

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
        depthTest : false
    } );

    this.mesh = new THREE.Mesh( this.plane, material );

    this.mesh.position.y = 0;
    this.mesh.position.x = 0;
    this.mesh.position.z = -5;

    this.drawTargetCamera();

    this.raycaster = new THREE.Raycaster();
};

TargetCamera.prototype.drawTargetCamera = function () {

    var halfSize = this.canvas.width * 0.5;

    this.context.strokeStyle = "#333333";
    this.context.lineWidth = 15;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, 50, 0, 2 * Math.PI);
    this.context.stroke();

    var speedPercent = this.parent.descendingSpeed / this.parent.maxDescendingSpeed;
    var speed = (100 * speedPercent * this.speedLineMultiplier);
    this.context.fillRect(halfSize - speed, 220, speed, 15);
    this.context.fillRect(halfSize, 220, speed, 15);

    this.texture.needsUpdate = true;
};

TargetCamera.prototype.hideSpeed = function() {

    TweenMax.to( this, 1.0, {

        speedLineMultiplier : 0.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTargetCamera.bind(this)
    });

    clearInterval( this.sti );
    this.position = new THREE.Vector3(0, 1, -10);
};

TargetCamera.prototype.step = function() {

    if ( this.parent.currentStatus !== 'descending' && this.parent.currentStatus !== 'ascending' && this.parent.currentStatus !== 'hovering' ) return;

    // Throw a ray to check if it intersects with the speed target
    var cameraDirection = new THREE.Vector3();
    this.parent.camera.getWorldDirection( cameraDirection );

    this.raycaster.ray.origin.setFromMatrixPosition( this.parent.camera.matrixWorld );
    this.raycaster.ray.direction = cameraDirection.normalize();

    var intersects = ( this.parent.currentStatus == 'descending' )? this.raycaster.intersectObject( this.speedTarget.mesh ) : this.raycaster.intersectObjects( this.prizes, true );
    if (intersects.length > 0) {

        if (intersects[0].object == this.speedTarget.mesh) {

            this.incrementSpeedDescend();

        } else {

            var intersectMesh = intersects[0].object;
            if (!intersectMesh.userData.points) this.incrementPoints( intersectMesh.parent.userData.index, intersectMesh.parent.userData.points );
            else this.incrementPoints( intersectMesh.userData.index, intersectMesh.userData.points );
        }
    }
};

TargetCamera.prototype.incrementSpeedDescend = function() {

    this.speedTarget.drawHit();
    this.parent.incrementSpeed();
    this.drawTargetCamera();
};

TargetCamera.prototype.incrementPoints = function( index, points ) {

    this.parent.incrementPoints( points, index );
};

module.exports = TargetCamera;