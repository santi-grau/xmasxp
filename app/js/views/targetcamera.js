
var TargetCamera = function( parent, prizes ){

    this.parent = parent;
    this.prizes = prizes.slice();
    this.speedTarget = this.parent.target;
    this.speedLineMultiplier = 1.0;

    this.isGazeIntro = false;
    this.gazeIntroTime = 0;
    this.gazeIntroStartTime = 0;
    this.gazeIntroTotalTime = 3;

    this.isGazeReset = false;
    this.gazeResetTime = 0;
    this.gazeResetStartTime = 0;
    this.gazeResetTotalTime = 2;

    this.percentageTime = 0;
    this.isOver = false;
    this.stoOver = 0;

    this.showTime = true;
    this.showSpeed = false;

    var sizePlane = (this.parent.parent.isWebVR || this.parent.parent.isCardboard)? 0.3 : 0.1;
    this.plane = new THREE.PlaneBufferGeometry( sizePlane, sizePlane );

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
    this.mesh.position.set( 0, 0, -5 );

    var lineDistance = (this.parent.parent.isWebVR || this.parent.parent.isCardboard)? 0.06 : 0.02;
    var materialLine = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2.0, opacity: 0.0, transparent: true, depthTest: false });
    var geometryLine = new THREE.Geometry();
        geometryLine.vertices.push(new THREE.Vector3(-5, 0, 0));
        geometryLine.vertices.push(new THREE.Vector3(-1 * lineDistance, 0, 0));
        geometryLine.vertices.push(new THREE.Vector3(lineDistance, 0, 0));
        geometryLine.vertices.push(new THREE.Vector3(5, 0, 0));
    this.line = new THREE.LineSegments(geometryLine, materialLine);

    this.mesh.add( this.line );

    this.drawTargetCamera();

    this.raycaster = new THREE.Raycaster();
};
TargetCamera.prototype.updateColor = function( col1, col2 ) {

    this.col1 = col1;
    this.col2 = col2;

    this.line.material.color.setRGB( col1[0], col1[1], col1[2] );
    this.line.material.needsUpdate = true;

    this.drawTargetCamera();
}
TargetCamera.prototype.reset = function() {

    this.speedLineMultiplier = 1.0;

    this.isGazeIntro = false;
    this.gazeIntroTime = 0;
    this.gazeIntroStartTime = 0;
    this.gazeIntroTotalTime = 3.25;
    this.percentageTime = 0;
    this.isOver = false;

    this.mesh.position.set( 0, 0, -5 );

    this.showTime = true;
    this.showSpeed = false;

    this.drawTargetCamera();
};

TargetCamera.prototype.drawTargetCamera = function () {
    var halfSize = this.canvas.width * 0.5;
    if(this.col1) this.context.strokeStyle = 'rgb('+Math.floor(this.col1[0]*255)+','+Math.floor(this.col1[1]*255)+','+Math.floor(this.col1[2]*255)+')';
    else this.context.strokeStyle = '#000000';
    this.context.lineWidth = 15;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, (this.isOver)? 60 : 50, 0, 2 * Math.PI);
    this.context.stroke();

    if (this.showSpeed) {

        // 3 lines depending on the percentage
        var speedPercent = this.parent.descendingSpeed / this.parent.maxDescendingSpeed;


        if (speedPercent > 0.4) {

            this.context.beginPath();
            this.context.arc(halfSize, halfSize, 90, Math.PI + 0.3, 2 * Math.PI - 0.3);
            this.context.stroke();

            this.context.beginPath();
            this.context.arc(halfSize, halfSize, 90, 0.3, Math.PI - 0.3);
            this.context.stroke();
        }

        if (speedPercent > 0.8) {

            this.context.beginPath();
            this.context.arc(halfSize, halfSize, 120, Math.PI + 0.3, 2 * Math.PI - 0.3);
            this.context.stroke();

            this.context.beginPath();
            this.context.arc(halfSize, halfSize, 120, 0.3, Math.PI - 0.3);
            this.context.stroke();
        }
    }

    if (this.showTime && this.percentageTime > 0) {

        if(this.col2) this.context.strokeStyle = 'rgb('+Math.floor(this.col2[0]*255)+','+Math.floor(this.col2[1]*255)+','+Math.floor(this.col2[2]*255)+')';
        else this.context.strokeStyle = '#000000';
        this.context.lineWidth = 20;
        this.context.lineCap = 'round';

        this.context.beginPath();
        this.context.arc(halfSize, halfSize, (this.isOver)? 95 : 85, Math.PI + 0.1, Math.PI + 0.1 + ((Math.PI - 0.2) * this.percentageTime));
        this.context.stroke();

        this.context.beginPath();
        this.context.arc(halfSize, halfSize, (this.isOver)? 95 : 85, 0.1, 0.1 + ((Math.PI - 0.2) * this.percentageTime));
        this.context.stroke();
    }

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

TargetCamera.prototype.getCoordinates = function( element, camera, renderer ) {

    var screenVector = new THREE.Vector3();
    element.localToWorld( screenVector );

    screenVector.project( camera );

    var posx = Math.round(( screenVector.x + 1 ) * renderer.domElement.offsetWidth / 2 );
    var posy = Math.round(( 1 - screenVector.y ) * renderer.domElement.offsetHeight / 2 );

    return new THREE.Vector2( posx, posy );
};

TargetCamera.prototype.step = function() {

    if (this.parent.currentStatus === 'descending') {

        // Calc distance from this point to the target point
        var renderer = this.parent.parent.renderer;
        var maxDistance = 60;
        var positionRay = new THREE.Vector2( window.innerWidth * 0.5, window.innerHeight * 0.5);// this.getCoordinates( this.mesh, this.parent.camera, renderer);
        var positionTarget = this.getCoordinates( this.speedTarget.mesh, this.parent.camera, renderer);
        var distance = Math.min( maxDistance, Math.max( 0, positionRay.distanceTo( positionTarget ) ) );
        var distancePercentage = 1.0 - (distance / maxDistance);

        this.isOver = (distancePercentage > 0);
        this.updateSpeedDescend( distancePercentage );

    } else if ( this.parent.currentStatus == 'waiting' || this.parent.currentStatus == 'ascending' || this.parent.currentStatus == 'hovering' || this.parent.currentStatus == 'breaking' || this.parent.currentStatus == 'ending' ) {

        // Throw a ray to check if it intersects with something
        var cameraDirection = new THREE.Vector3();
        this.parent.camera.getWorldDirection( cameraDirection );

        this.raycaster.ray.origin.setFromMatrixPosition( this.parent.camera.matrixWorld );
        this.raycaster.ray.direction = cameraDirection.normalize();

        if (this.parent.currentStatus == 'waiting') {

            var intersects = this.raycaster.intersectObject( this.parent.parent.stage.countdown.mesh );
            if (intersects.length > 0) {

                if (intersects[0].object == this.parent.parent.stage.countdown.mesh) {

                    this.onGazeOverIntro();
                }
            } else {

                this.onGazeOutIntro();
                this.parent.parent.stage.countdown.updateSeconds( 0 );
            }

            if (this.isGazeIntro) {

                this.gazeIntroTime = (new Date() - this.gazeIntroStartTime) / 1000;
                this.percentageTime = this.gazeIntroTime / this.gazeIntroTotalTime;
                this.drawTargetCamera();

                this.parent.parent.stage.countdown.updateSeconds( this.gazeIntroTime );

                if (this.gazeIntroTime > this.gazeIntroTotalTime) {

                    this.onGazeEndIntro();
                }
            }

        } else if (this.parent.currentStatus == 'ascending' || this.parent.currentStatus == 'hovering') {

            var intersects = this.raycaster.intersectObjects( this.prizes, true );
            if (intersects.length > 0) {

                var intersectMesh = intersects[0].object;
                if (!intersectMesh.userData.points) {

                    if (intersectMesh.parent.userData.active === true) {

                        this.incrementPoints( intersectMesh.parent.userData.index, intersectMesh.parent.userData.points );
                    }
                } else {

                    if (intersectMesh.userData.active === true) {

                        this.incrementPoints( intersectMesh.userData.index, intersectMesh.userData.points );
                    }
                }
            }

        } else if (this.parent.currentStatus == 'breaking' || this.parent.currentStatus == 'ending') {


            var intersects = this.raycaster.intersectObject( this.parent.parent.stage.score.mesh );
            if (intersects.length > 0) {

                if (intersects[0].object == this.parent.parent.stage.score.mesh) {

                    this.onGazeOverReset();
                }
            } else {

                this.onGazeOutReset();
            }

            if (this.isGazeReset) {

                this.gazeResetTime = (new Date() - this.gazeResetStartTime) / 1000;
                this.percentageTime = this.gazeResetTime / this.gazeResetTotalTime;
                this.drawTargetCamera();

                if (this.gazeResetTime > this.gazeResetTotalTime) {

                    this.onGazeEndReset();
                }
            }
        }
    }
};

TargetCamera.prototype.onGazeOverIntro = function() {

    if (!this.isGazeIntro) {

        this.isOver = true;
        this.isGazeIntro = true;
        this.gazeIntroStartTime = new Date();
        if (this.tweenGaze) this.tweenGaze.kill();
    }
};

TargetCamera.prototype.onGazeOutIntro = function() {

    if (this.isGazeIntro) {

        this.isOver = false;
        this.isGazeIntro = false;
        this.gazeIntroTime = 0;

        if (this.tweenGaze) this.tweenGaze.kill();
        this.tweenGaze = TweenMax.to( this, 0.5, {
            percentageTime : 0,
            ease : Power2.easeInOut,
            onUpdate : this.drawTargetCamera.bind(this)
        });

        this.drawTargetCamera();
    }
};

TargetCamera.prototype.onGazeEndIntro = function() {

    this.isOver = false;
    this.showTime = false;
    this.showSpeed = true;
    this.parent.onGazeEndIntro();

    TweenMax.to( this.line.material, 2.0, {

        opacity : 1.0,
        ease : Linear.none
    });
};

TargetCamera.prototype.onGazeOverReset = function() {

    this.showTime = true;
    this.showSpeed = false;

    if (!this.isGazeReset) {

        this.isOver = true;
        this.isGazeReset = true;
        this.gazeResetStartTime = new Date();
        if (this.tweenGaze) this.tweenGaze.kill();

        this.parent.parent.stage.score.onOverReset();
    }
};

TargetCamera.prototype.onGazeOutReset = function() {

    if (this.isGazeReset) {

        this.isOver = false;
        this.isGazeReset = false;
        this.gazeResetTime = 0;

        if (this.tweenGaze) this.tweenGaze.kill();
        this.tweenGaze = TweenMax.to( this, 0.5, {
            percentageTime : 0,
            ease : Power2.easeInOut,
            onUpdate : this.drawTargetCamera.bind(this)
        });

        this.parent.parent.stage.score.onOutReset();
    }
};

TargetCamera.prototype.onGazeEndReset = function() {

    this.isOver = false;
    this.parent.parent.reset();
};

TargetCamera.prototype.onJump = function() {

    this.hideSpeed();

    this.showSpeed = false;
    this.drawTargetCamera();

    TweenMax.to( this.line.material, 1.0, {

        opacity : 0.0,
        ease : Linear.none
    });
};

TargetCamera.prototype.updateSpeedDescend = function(speedDescend) {

    this.parent.updateSpeedDescend(speedDescend);
    this.drawTargetCamera();
};

TargetCamera.prototype.incrementPoints = function( index, points ) {

    this.isOver = true;
    this.drawTargetCamera();
    clearTimeout( this.stoOver );
    this.stoOver = setTimeout( function () {

        this.isOver = false;
        this.drawTargetCamera();
    }.bind(this), 250 );

    this.parent.incrementPoints( points, index );
};

module.exports = TargetCamera;