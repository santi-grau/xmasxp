var SimplexNoise = require('simplex-noise');

var Audience = function( parent ){

	this.parent = parent;
	this.simplex = new SimplexNoise( Math.random );
	this.simplexInc = 0.0;
	this.isAnimated = false;


	var vs = '' +
		'	attribute float size;' +
		'	attribute vec3 customColor;' +
		'	varying vec3 vColor;' +
		'	void main() {' +
		'		vColor = customColor;' +
		'		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );' +
		'		gl_PointSize = size * ( 300.0 / -mvPosition.z );' +
		'		gl_Position = projectionMatrix * mvPosition;' +
		'	}';

	var fs = '' +
		'	uniform vec3 color;' +
		'	uniform sampler2D texture;' +
		'	varying vec3 vColor;' +
		'	void main() {' +
		'		gl_FragColor = vec4( color * vColor, 1.0 );' +
		'		gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );' +
		'	}';

	var uniforms =

	// THREE.UniformsUtils.merge( [

	//     THREE.UniformsLib[ "fog" ],{

{			color	: { value : new THREE.Color( 0xffffff ) },
			texture	: { value : new THREE.TextureLoader().load( "assets/particle.png" ) }
		}
	// ] );

	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms		: uniforms,
		vertexShader	: vs,
		fragmentShader	: fs,
		// blending		: THREE.AdditiveBlending,
		// depthTest		: true,
		transparent		: true
		// opacity         : 1.0,
		// fog             :false
	});

	this.geometry = new THREE.BufferGeometry();


	this.numParticlesPerRow = 24;
	this.numParticlesRows = 12;
	this.numParticles = this.numParticlesRows * this.numParticlesPerRow;

	for ( var j = 0; j < this.numParticlesRows; j++ ) {
		this.numParticles += j;
	}

	var radiusX = 14.2;
	var radiusZ = 11.6;
	var positions = new Float32Array( this.numParticles * 3 );
	var colors = new Float32Array( this.numParticles * 3 );
	var sizes = new Float32Array( this.numParticles );
	var color = new THREE.Color();
	this.positionsY = [];

	var index = 0;
	var incRadiusX = 1.7;
	var incRadiusZ = 1.39;
	var incY = 1.0;
	var incZ = -0.3;
	var posY = 6.1;
	var posZ = -221;
	for ( var j = 0; j < this.numParticlesRows; j++ ) {

		for ( var i = 0, i3 = (index * 3); i < (this.numParticlesPerRow + j); i ++, i3 += 3 ) {

			if (i < 7) {

				positions[ i3 + 0 ] = 0 + radiusX * Math.cos(0);
				positions[ i3 + 1 ] = posY;
				positions[ i3 + 2 ] = posZ + (4 * i);

			} else if (i >= 7 && i < (17 + j)) {

				positions[ i3 + 0 ] = 0 + radiusX * Math.cos( Math.PI * (i - 7) / ((17 + j - 7) - 1) );
				positions[ i3 + 1 ] = posY;
				positions[ i3 + 2 ] = posZ - radiusZ * Math.sin( Math.PI * (i - 7) / ((17 + j - 7) - 1) );

			} else {

				positions[ i3 + 0 ] = 0 - radiusX;
				positions[ i3 + 1 ] = posY;
				positions[ i3 + 2 ] = posZ + (4 * (i - (17 + j)));
			}

			this.positionsY[ index ] = positions[ i3 + 1];


			color.setHSL( index / this.numParticles, 1.0, 0.5 );
			colors[ i3 + 0 ] = color.r;
			colors[ i3 + 1 ] = color.g;
			colors[ i3 + 2 ] = color.b;

			sizes[ index ] = 5;

			index++;
		}


		if (j !== 7) {

			radiusX += incRadiusX;
			radiusZ += incRadiusZ;
			posY += incY;
			posZ += incZ;

		} else {

			radiusX += incRadiusX * 2.5;
			radiusZ += incRadiusZ * 2.5;
			posY += incY * 2.5;
			posZ += incZ * 2.5;

		}
	}

	this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

	this.particleSystem = new THREE.Points( this.geometry, shaderMaterial );
	this.parent.scene.add( this.particleSystem );
};

Audience.prototype.updateColor = function(color1, color2) {

	var colors = this.geometry.attributes.customColor.array;
	for ( var i = 0, i3 = 0; i < this.numParticles; i ++, i3 += 3 ) {

		colors[ i3 + 0 ] = color2[ 0 ];
		colors[ i3 + 1 ] = color2[ 1 ];
		colors[ i3 + 2 ] = color2[ 2 ];
	}
	this.geometry.attributes.customColor.needsUpdate = true;
};

Audience.prototype.step = function( time ) {

	if (this.isAnimated) {

		this.simplexInc += 0.01;

		var positions = this.geometry.attributes.position.array;
		for ( var i = 0, i3 = 0; i < this.numParticles; i ++, i3 += 3 ) {

			var noisePosition = this.simplex.noise2D( 0.1 * i, this.simplexInc );
			positions[ i3 + 1 ] = this.positionsY[ i ] + Math.abs( noisePosition );
		}
		this.geometry.attributes.position.needsUpdate = true;
	}
};

module.exports = Audience;
