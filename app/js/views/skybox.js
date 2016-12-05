
var Skybox = function( parent ){

	this.parent = parent;

	var geometry = new THREE.SphereBufferGeometry(400, 60, 40);

	var loader = new THREE.TextureLoader();
	var texture = loader.load( 'assets/skybox/skybox.jpg' );
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texture, side: THREE.DoubleSide } );

	this.mesh = new THREE.Mesh(geometry, material);
	this.mesh.scale.set(-1, 1, 1);
	this.mesh.rotation.order = 'XZY';
	this.mesh.renderDepth = 1000.0;
};

module.exports = Skybox;