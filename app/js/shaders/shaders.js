var Shader = function() {
	this.matcapVS = [
		"varying vec2 vN;",

		"void main() {",
		"	vec3 vU = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );",
		"	vec3 n = normalize( normalMatrix * normal );",
		"	vec3 r = reflect( vU, n );",
		"	float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z + 1.0 ) );",
		"	vN = vec2( r.x / m + 0.5,  r.y / m + 0.5 );",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}\n"
	].join("\n");

	this.matcapFS = [
		"varying vec2 vN;",

		"uniform sampler2D mc;",
		"uniform float noise;",

		"float random( vec3 scale,float seed ) { return fract( sin( dot( gl_FragCoord.xyz+seed, scale ) ) * 43758.5453 + seed ); }",

		"void main() {",
		"	vec2 calculatedNormal = vN;\n;",
		"	vec3 base = texture2D( mc, calculatedNormal ).rgb;\n;",
		"	base += noise * ( .5 - random( vec3( 1. ), length( gl_FragCoord ) ) );\n;",
		"	gl_FragColor = vec4( base, 1.0 );",
		"}\n"
	].join("\n");

	this.ipadVS = [
		"varying vec3 vN;",

		"void main() {",
		"	vN = normal;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}\n"
	].join("\n");

	this.ipadFS = [
		"varying vec3 vN;",
		"uniform float time;",

		"void main() {",
		"	vec3 col;",
		"	if( vN.g > 0.9 ) col = vec3( 0.0 );",
		"	else if( vN.g > 0.5 && vN.g < 0.9 ) col = vec3( 1.0 + vN.r + vN.b );",
		"	else col = vec3( 0.5 );",
		"	gl_FragColor = vec4( col * time, 1.0 );",
		"}\n"
	].join("\n");

	this.ipadGroundVs = [
		"varying vec2 vUv;",
		"void main() {",
		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}\n"
	].join("\n");

	this.ipadGroundFs = [
		"varying vec2 vUv;",
		
		"uniform sampler2D shadow;",
		"uniform sampler2D depth;",
		"uniform float time;",
		"uniform float color;",

		"float random( vec3 scale,float seed ) { return fract( sin( dot( gl_FragCoord.xyz+seed, scale ) ) * 43758.5453 + seed ); }",

		"void main() {",
		"	vec3 base = vec3(0.0);",
		"	vec3 shadow = texture2D( shadow, vUv ).rgb;\n;",
		"	vec3 depth = texture2D( depth, vUv ).rgb;\n;",
		"	base += .1 - random( vec3( 1. ), length( gl_FragCoord ) );\n;",
		"	gl_FragColor = vec4( vec3( base ), shadow.r * (1.0 - depth) * pow(time,2.0) * 0.1 );",
		"}\n"
	].join("\n");

	this.aoVS = [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}",
	].join("\n");

	this.aoFS = [
		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform bool onlyAO;",
		"uniform vec2 size;",
		"uniform float aoClamp;",
		"uniform float lumInfluence;",
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",
		"varying vec2 vUv;",
		"#define DL 2.399963229728653",
		"#define EULER 2.718281828459045",

		// user variables
		"const int samples = 8;",
		"const float radius = 5.0;",
		"const bool useNoise = true;",
		"const float noiseAmount = 0.0003;",
		"const float diffArea = 0.4;",
		"const float gDisplace = 0.4;",
		"#include <packing>",
		"vec2 rand( const vec2 coord ) {",
			"vec2 noise;",
			"if ( useNoise ) {",
				"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
				"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",
				"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",
			"} else {",
				"float ff = fract( 1.0 - coord.s * ( size.x / 2.0 ) );",
				"float gg = fract( coord.t * ( size.y / 2.0 ) );",
				"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",
			"}",
			"return ( noise * 2.0  - 1.0 ) * noiseAmount;",
		"}",
		"float readDepth( const in vec2 coord ) {",
			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",
			"return cameraCoef / ( cameraFarPlusNear - unpackRGBAToDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );",
		"}",
		"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",
			"float garea = 2.0;",
			"float diff = ( depth1 - depth2 ) * 100.0;",
			"if ( diff < gDisplace ) {",
				"garea = diffArea;",
			"} else {",
				"far = 1;",
			"}",
			"float dd = diff - gDisplace;",
			"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
			"return gauss;",
		"}",
		"float calcAO( float depth, float dw, float dh ) {",
			"float dd = radius - depth * radius;",
			"vec2 vv = vec2( dw, dh );",
			"vec2 coord1 = vUv + dd * vv;",
			"vec2 coord2 = vUv - dd * vv;",
			"float temp1 = 0.0;",
			"float temp2 = 0.0;",
			"int far = 0;",
			"temp1 = compareDepths( depth, readDepth( coord1 ), far );",
			"if ( far > 0 ) {",
				"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
				"temp1 += ( 1.0 - temp1 ) * temp2;",
			"}",
			"return temp1;",
		"}",
		"void main() {",
			"vec2 noise = rand( vUv );",
			"float depth = readDepth( vUv );",
			"float tt = clamp( depth, aoClamp, 1.0 );",
			"float w = ( 1.0 / size.x )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
			"float h = ( 1.0 / size.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );",
			"float ao = 0.0;",
			"float dz = 1.0 / float( samples );",
			"float z = 1.0 - dz / 2.0;",
			"float l = 0.0;",
			"for ( int i = 0; i <= samples; i ++ ) {",
				"float r = sqrt( 1.0 - z );",
				"float pw = cos( l ) * r;",
				"float ph = sin( l ) * r;",
				"ao += calcAO( depth, pw * w, ph * h );",
				"z = z - dz;",
				"l = l + DL;",
			"}",
			"ao /= float( samples );",
			"ao = 1.0 - ao;",
			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",
			"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
			"float lum = dot( color.rgb, lumcoeff );",
			"vec3 luminance = vec3( lum );",
			"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // mix( color * ao, white, luminance )
			"if ( onlyAO ) {",
				"final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // ambient occlusion only
			"}",
			"gl_FragColor = vec4( final, 1.0 );",
		"}",
	].join("\n");
}

module.exports = Shader;