var model = require('../../assets/base4.obj');

var Stage = function( parent ){
	this.parent = parent;
	
	this.slopeOrigin = new THREE.Vector2( 255.3107, 189.05429 );
	this.slopePath = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0,0c64.32672,3.66378,76.99023,20.18553,97.45992,47.24449c21.76199,28.76728,54.05034,52.06145,86.35521,52.06145c4.24663,0,6.66487-0.38168,6.66487-0.38168" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
	
	this.group = new THREE.Object3D();
	this.wireframe = new THREE.Object3D();

	this.mesh = new THREE.OBJLoader().parse(model);
	this.mesh.traverse( function ( child ) {
		if( child.name == 'LANDING_BezierCurve' ) this.landing = child;
		
		child.material = new THREE.MeshNormalMaterial( { side : THREE.DoubleSide } );

		var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( child.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );
		this.wireframe.add( wireframe );

	}.bind(this) );

	this.group.add( this.mesh, this.wireframe );
	this.group.rotation.y = Math.PI / 2;
}
Stage.prototype.step = function( time ){

}

module.exports = Stage;