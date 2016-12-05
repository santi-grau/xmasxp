
var TargetCamera = function( parent, prizes ){

    this.parent = parent;
    this.prizes = prizes.slice();
    this.speedTarget = this.parent.target;


    this.plane = new THREE.PlaneBufferGeometry( 0.05, 0.05 );

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
    this.context.lineWidth = 30;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, halfSize - 15, 0, 2 * Math.PI);
    this.context.stroke();

    this.texture.needsUpdate = true;
};

TargetCamera.prototype.step = function() {

    if ( this.parent.currentStatus !== 'descending' && this.parent.currentStatus !== 'ascending' ) return;

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
            if (!intersectMesh.userData.points) this.incrementPoints( intersectMesh.parent.userData.points );
            else this.incrementPoints( intersectMesh.userData.points );
        }
    }
};

TargetCamera.prototype.incrementSpeedDescend = function() {

    console.log('go faster');
};

TargetCamera.prototype.incrementPoints = function( points ) {

    console.log('increment points:', points);
};

module.exports = TargetCamera;