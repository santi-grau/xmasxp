var WebWorker = require('webworkify');

var Landscape = function( parent ){
	this.parent = parent;
	this.treesCount  = 1000;

	var treemap = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve"><path fill="#00FF00" d="M374.3932,179.4243C364.6439,204.0842,340.011,259.7371,368,301c20.816,30.6881,92.9106,49.3516,104,63c26,32,7.2108,50.2925-8.5,72.5c-16.2858,23.0203,44.5-7,88-1.5c44.3681,5.6097-11.5-79-7.5-145s-4-72-78-98S440,78,440,32c0-9.8997,11.6772-20.7261,29.1194-32H342.4427C338.5206,68.2643,386.3975,149.0605,374.3932,179.4243z"/><path fill="#00FF00" d="M536,628c-56-12-174,72-180,130s-37.5735,118-13.7867,242h198.9004c18.0758-72.766,58.7026-147.3625,81.5357-196C648,750,592,640,536,628z"/><path fill="#00FF00" d="M868,270c-32,18-80,90-62,164s0.5757,82.0879-11.4243,116.0879s71.8809-30.665,114.521-50.5754c29.7153-13.8753,56.5305-0.5491,90.9033-3.6473V237.8549C944.4902,270.5303,895.201,254.6994,868,270z"/></svg>';
	var encodedData = window.btoa(treemap);

	var myImage = new Image(1000, 1000);
	myImage.src = 'data:image/svg+xml;base64,' + encodedData;
	this.canvas = document.createElement('canvas');
	this.canvas.width = 1000;
	this.canvas.height = 1000;
	this.context = this.canvas.getContext('2d');
	this.context.drawImage(myImage, 0, 0);
	var imgData = this.context.getImageData( 0, 0, 1000, 1000 );

	this.group = new THREE.Object3D();

	var geoWorker = WebWorker( require( './treemesh' ) );
	geoWorker.onmessage = this.geometryReady.bind(this);
	geoWorker.postMessage( JSON.stringify( { treeCount : 2000, imgData : imgData.data } ) );

}
Landscape.prototype.geometryReady = function( msg ){
	var data = JSON.parse( msg.data );

	this.coords = data.coords;
	this.treesVertices = data.vertices.length / data.coords.length;

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( data.vertices ), 3 ) );
	var material = new THREE.MeshBasicMaterial( { color: 0x00A500 } );
	this.treeMesh = new THREE.Mesh( geometry, material );
	this.group.add(this.treeMesh)

	
	for( var j = 0 ; j < this.coords.length ; j++ ){
		var raycaster = new THREE.Raycaster( new THREE.Vector3( this.coords[j][1], -200, -this.coords[j][0] ), new THREE.Vector3( 0, 1, 0 ), 0.1, 1000 );
		var intersects = raycaster.intersectObject( this.parent.mountainMesh );
		if( intersects ) {
			for( var i = this.treesVertices * j ; i < this.treesVertices * (j+1) ; i+= 3){
				this.treeMesh.geometry.attributes.position.array[ i + 1 ] += intersects[ 0 ].distance + 0.1;
			}
		}
	}



	// this.treeMesh.geometry.attributes.position.needsUpdate = true;

	
}
Landscape.prototype.step = function( time ){
	// if( this.coords && this.coords.length ){
	// 	var coords = this.coords.splice( 0, 10 );

	// 	for( var j = 0 ; j < coords.length ; j++ ){
	// 		var raycaster = new THREE.Raycaster( new THREE.Vector3( coords[j][1], -200, -coords[j][0] ), new THREE.Vector3( 0, 1, 0 ), 0.1, 1000 );
	// 		var intersects = raycaster.intersectObject( this.parent.mountainMesh );
	// 		if( intersects ) {
	// 			for( var i = this.treesVertices * j ; i < this.treesVertices * (j+1) ; i+= 3){
	// 				this.treeMesh.geometry.attributes.position.array[ i + 1 ] += intersects[ 0 ].distance + 0.1;
	// 			}
	// 		}
	// 	}
	// 	this.treeMesh.geometry.attributes.position.needsUpdate = true;
	// }
}

module.exports = Landscape