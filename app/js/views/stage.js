var model = require('../../assets/base9.obj');

var Stage = function( parent ){
	this.parent = parent;
	
	this.slopeOrigin = new THREE.Vector2( 0,0 );
	this.landingPath = 'M-291.324-174.0877c47.978-0.2317,71.3112,17.3651,108.8553,46.0455c43.1519,32.9643,96.7334,40.8891,144.6539,63.8938C2.5818-44.7557,39.0152-15.6982,84.4878-9.421C140.7772-1.6506,200.2027,0,258.4094,0';
	this.slopePath = 'M-255.3108-189.054c64.3267,3.6638,76.9902,20.1856,97.4599,47.2444c21.762,28.7673,54.0503,52.0614,86.3552,52.0614c4.2467,0,6.6649-0.3817,6.6649-0.3817';
	this.slope = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + this.slopePath + '" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
	
	this.slopeAngle = 30;

	this.group = new THREE.Object3D();
	this.wireframe = new THREE.Object3D();

	this.mesh = new THREE.OBJLoader().parse(model);
	this.mesh.traverse( function ( child ) {
		
		child.material = new THREE.MeshNormalMaterial( { side : THREE.DoubleSide } );
		child.material = new THREE.MeshBasicMaterial( { side : THREE.DoubleSide, color : 0xffffff } );

		var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( child.geometry ), new THREE.LineBasicMaterial( { color: 0x444444, linewidth: .5, fog : true  } ) );
		this.wireframe.add( wireframe );

	}.bind(this) );

	this.landingMesh = this.makeLandingMesh();

	var wireframeLanding = new THREE.LineSegments( new THREE.WireframeGeometry( this.landingMesh.geometry ), new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: .5, fog : true  } ) );
	this.wireframe.add( wireframeLanding );
	
	this.group.add( this.mesh, this.wireframe, this.landingMesh );
	this.group.rotation.y = Math.PI / 2;
}
Stage.prototype.makeLandingMesh = function(){
	var path = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + this.landingPath + '" /></svg>', "application/xml").querySelector('svg').querySelectorAll('path')[0];
	var segments = 100;
	var geometry = new THREE.Geometry();
	var width = 200;
	var ovs = [];
	for( var i = 0 ; i < segments ; i++ ){
		var nvs = [];
		var pp = path.getPointAtLength( i / (segments - 1) * path.getTotalLength() );
		for( var j = 0 ; j < 2 ; j++ ){
			nvs.push( geometry.vertices.push( new THREE.Vector3( pp.x, -pp.y, -width / 2 + width * j ) ) - 1 );
			if( i > 0 && j > 0 ) geometry.faces.push( new THREE.Face3( ovs[j-1], ovs[j], nvs[j-1] ), new THREE.Face3( nvs[j], nvs[j-1], ovs[j] ) );
		}
		var ovs = nvs;
	}
	
	var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe : false } ) )
	return mesh;
}
Stage.prototype.step = function( time ){

}

module.exports = Stage;