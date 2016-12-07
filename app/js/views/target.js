var SimplexNoise = require('simplex-noise');

var Target = function( parent ){

    this.parent = parent;
    this.position = new THREE.Vector3(0, 1.5, -5);
    this.colorNoHit = "#666666";
    this.colorHit = "#00cc00";
    this.colorDescend = "#ffffff";
    this.color = this.colorNoHit;
    this.scale = 4.5;
    this.sto = 0;
    this.sti = 0;

    this.simplex = new SimplexNoise( Math.random );
    this.simplexInc = 0.0;
    this.useNoise = false;

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
    this.mesh.position.set(0, 1.5, -5);

    var materialLine = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2.0, opacity: 0.0, transparent: true, depthTest: false });
    var geometryLine = new THREE.Geometry();
        geometryLine.vertices.push(new THREE.Vector3(-5, 0, 0));
        geometryLine.vertices.push(new THREE.Vector3(-0.02, 0, 0));
        geometryLine.vertices.push(new THREE.Vector3(0.02, 0, 0));
        geometryLine.vertices.push(new THREE.Vector3(5, 0, 0));
    this.line = new THREE.LineSegments(geometryLine, materialLine);

    this.mesh.add( this.line );

    this.tween;
    this.alpha = 1.0;
    this.drawTarget();
};

Target.prototype.updateColor = function( col1, col2 ){
    this.col1 = col1;
    this.col2 = col2;
    
    this.line.material.color.setRGB( col2[0], col2[1], col2[2] );
    this.line.material.needsUpdate = true;

    this.mesh.material.color.setRGB( col2[0], col2[1], col2[2] );
    this.mesh.material.needsUpdate = true;
}
Target.prototype.reset = function() {

    this.color = this.colorNoHit;
    this.scale = 4.5;
    this.alpha = 1.0;

    this.line.visible = false;
    this.line.material.alpha = 0.0;

    this.mesh.visible = true;
    this.mesh.material.alpha = 1.0;
    this.mesh.position.set(0, 1.5, -5);

    this.position.set(0, 1.5, -5);

    this.useNoise = false;

    this.drawTarget();
};

Target.prototype.step = function() {

    // Move randomly using a simple noise
    if (this.useNoise) {

        this.simplexInc += 0.01;
        var noisePosition = this.simplex.noise2D( 0.1, this.simplexInc );
        this.position.y = 1.2 + (noisePosition * 0.1);
    }

    // Ease to the random position
    this.mesh.position.x += (this.position.x - this.mesh.position.x) / 20;
    this.mesh.position.y += (this.position.y - this.mesh.position.y) / 20;
    this.mesh.position.z += (this.position.z - this.mesh.position.z) / 20;
};

Target.prototype.show = function() {

    this.mesh.visible = true;
    this.line.visible = true;
    this.color = this.colorDescend;

    TweenMax.to( this.line.material, 2.0, {

        opacity : 1.0,
        ease : Linear.none
    });

    TweenMax.to( this, 1.0, {

        scale : 0.5,
        ease : Power2.easeInOut,
        onUpdate: this.drawTarget.bind(this)
    });

    this.useNoise = true;
};

Target.prototype.hide = function() {

    TweenMax.to( this, 1.0, {

        alpha : 0.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTarget.bind(this),
        onComplete : this.hideEnd.bind(this)
    });

    TweenMax.to( this.line.material, 1.0, {

        opacity : 0.0,
        ease : Power2.easeOut,
        onUpdate: this.drawTarget.bind(this),
        onComplete : this.hideEnd.bind(this)
    });

    this.useNoise = false;
    this.position = new THREE.Vector3(0, 1, -10);
};

Target.prototype.hideEnd = function() {

    this.mesh.visible = false;
    this.line.visible = false;
};

Target.prototype.drawHit = function() {

    this.color = this.colorHit;
    this.drawTarget();

    clearTimeout( this.sto );
    this.sto = setTimeout( function () {

        this.color = this.colorNoHit;
        this.drawTarget();

    }.bind(this), 250 );
};

Target.prototype.drawTarget = function () {

    var halfSize = this.canvas.width * 0.5;

    this.context.globalAlpha = this.alpha;
    this.context.strokeStyle = this.color;
    this.context.lineWidth = 15;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(halfSize, halfSize, (25 * this.scale), 0, 2 * Math.PI);
    this.context.stroke();

    this.texture.needsUpdate = true;
};

module.exports = Target;