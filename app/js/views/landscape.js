var WebWorker = require('webworkify');

var Landscape = function( parent ){
	this.parent = parent;

	var landscapemap = require('./../../assets/landscapemap3.svg');
	var encodedData = window.btoa(landscapemap);

	var textureSize = 1000;
	var myImage = new Image(textureSize, textureSize);
	myImage.src = 'data:image/svg+xml;base64,' + encodedData;
	this.canvas = document.createElement('canvas');
	this.canvas.width = textureSize;
	this.canvas.height = textureSize;
	this.context = this.canvas.getContext('2d');
	this.context.drawImage(myImage, 0, 0, textureSize, textureSize);
	var imgData = this.context.getImageData( 0, 0, textureSize, textureSize );

	this.group = new THREE.Object3D();

	var geoWorker = WebWorker( require( './ww/treemesh' ) );
	geoWorker.onmessage = this.treeGeometryReady.bind(this);
	geoWorker.postMessage( JSON.stringify( { treeCount : 3000, imgData : imgData.data.toString() } ) );

	if (!this.parent.parent.isCardboard) {

		var geoWorker = WebWorker( require( './ww/houseMesh' ) );
		geoWorker.onmessage = this.houseGeometryReady.bind(this);
		geoWorker.postMessage( JSON.stringify( { treeCount : 1200, imgData : imgData.data.toString() } ) );
	}
}
Landscape.prototype.houseGeometryReady = function( msg ){
	var data = JSON.parse( msg.data );

	this.houseCoords = data.coords;
	this.houseVertices = data.vertices.length / data.coords.length;

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( data.vertices ), 3 ) );

	var material = new THREE.MeshPhongMaterial( { shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

	this.housesMesh = new THREE.Mesh( geometry, material );
	this.group.add(this.housesMesh)

	this.housesMesh.castShadow = true;

	geometry.addAttribute( 'color', new THREE.BufferAttribute(  new Float32Array( data.colors ), 3 ) );

	this.placedHouses = 0;
}

Landscape.prototype.treeGeometryReady = function( msg ){
	var data = JSON.parse( msg.data );

	this.treeCoords = data.coords;
	this.treesVertices = data.vertices.length / data.coords.length;

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( data.vertices ), 3 ) );

	var material = new THREE.MeshPhongMaterial( { shading: THREE.FlatShading, vertexColors: THREE.VertexColors, side : THREE.DoubleSide } );

	this.treeMesh = new THREE.Mesh( geometry, material );
	this.group.add(this.treeMesh)

	this.treeMesh.castShadow = true;

	geometry.addAttribute( 'color', new THREE.BufferAttribute(  new Float32Array( data.colors ), 3 ) );

	this.placedTrees = 0;

}
Landscape.prototype.step = function( time ){

	var raycastAmount = 100;
	if( this.placedHouses !== null && this.houseCoords && this.placedHouses < this.houseCoords.length ){
		for( var j = this.placedHouses ; j < this.placedHouses + raycastAmount ; j++ ){
			var raycaster = new THREE.Raycaster( new THREE.Vector3( this.houseCoords[j][1], -200, -this.houseCoords[j][0] ), new THREE.Vector3( 0, 1, 0 ), 0.1, 1000 );
			var intersects = raycaster.intersectObject( this.parent.mountainMesh );
			if( intersects ) {
				for( var i = this.houseVertices * j ; i < this.houseVertices * (j+1) ; i+= 3){
					if( intersects[ 0 ] ) this.housesMesh.geometry.attributes.position.array[ i + 1 ] += intersects[ 0 ].distance + 0.1;
				}
			}
		}
		this.housesMesh.geometry.attributes.position.needsUpdate = true;
		this.housesMesh.geometry.attributes.color.needsUpdate = true;
		this.placedHouses += raycastAmount;
	}

	if( this.placedTrees !== null && this.treeCoords && this.placedTrees < this.treeCoords.length ){
		for( var j = this.placedTrees ; j < this.placedTrees + raycastAmount ; j++ ){
			var raycaster = new THREE.Raycaster( new THREE.Vector3( this.treeCoords[j][1], -200, -this.treeCoords[j][0] ), new THREE.Vector3( 0, 1, 0 ), 0.1, 1000 );
			var intersects = raycaster.intersectObject( this.parent.mountainMesh );
			if( intersects ) {
				for( var i = this.treesVertices * j ; i < this.treesVertices * (j+1) ; i+= 3){
					if( intersects[ 0 ] ) this.treeMesh.geometry.attributes.position.array[ i + 1 ] += intersects[ 0 ].distance + 0.1;
				}
			}
		}
		this.treeMesh.geometry.attributes.position.needsUpdate = true;
		this.treeMesh.geometry.attributes.color.needsUpdate = true;
		this.placedTrees += raycastAmount;
	}
}

module.exports = Landscape