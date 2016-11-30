var model = require('../../assets/base7.obj');

var Stage = function( parent ){
	this.parent = parent;
	
	this.slopeOrigin = new THREE.Vector2( 0,0 );
	this.slopePath = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="M-255.3108-189.054c64.3267,3.6638,76.9902,20.1856,97.4599,47.2444c21.762,28.7673,54.0503,52.0614,86.3552,52.0614c4.2467,0,6.6649-0.3817,6.6649-0.3817" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
	this.landingPath = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="M-291.324-174.0877c47.978-0.2317,71.3112,17.3651,108.8553,46.0455c43.1519,32.9643,96.7334,40.8891,144.6539,63.8938C2.5818-44.7557,39.0152-15.6982,84.4878-9.421C140.7772-1.6506,200.2027,0,258.4094,0" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
	
	this.slopeAngle = 30;

	this.group = new THREE.Object3D();
	this.wireframe = new THREE.Object3D();

	this.mesh = new THREE.OBJLoader().parse(model);
	this.mesh.traverse( function ( child ) {
		// console.log(child.name);
		if( child.name == 'LANDING_Mesh.028' ) this.landing = child;
		
		child.material = new THREE.MeshNormalMaterial( { side : THREE.DoubleSide } );
		child.material = new THREE.MeshBasicMaterial( { side : THREE.DoubleSide, color : 0xffffff } );

		var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( child.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );
		this.wireframe.add( wireframe );

	}.bind(this) );

	this.group.add( this.mesh, this.wireframe );
	this.group.rotation.y = Math.PI / 2;
}
Stage.prototype.step = function( time ){

}

module.exports = Stage;