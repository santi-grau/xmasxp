module.exports = function( self ){
	self.addEventListener('message',function (msg){
		// var data = {}
		var data = JSON.parse( msg.data );
		data.imgData = data.imgData.split(',');

		var vertices = [];
		var colors = [];
		var coords = [];

	

		var verts = [ -0.5, 0, -0.5, 0, 1, 0, 0.5, 0, -0.5, 0.5, 0, -0.5, 0, 1, 0, 0.5, 0, 0.5, 0.5, 0, 0.5,0, 1, 0, -0.5, 0, 0.5, -0.5, 0, 0.5, 0, 1, 0,-0.5, 0, -0.5 ];

		var c2 = 0.64705882352941;
		var c1 = 0.82352941176471

		var cols = [ 0,c2,0,0,c1,0,0,c2,0,0,c2,0,0,c1,0,0,c2,0,0,c2,0,0,c1,0,0,c2,0,0,c2,0,0,c1,0,0,c2,0 ];

		var added = 0;

		var addVs = function(){
			for( var j = 0 ; j < verts.length ; j+=3 ){
				vertices.push( verts[ j ] * scale + px, verts[ j + 1 ] * scaleHeight - 200, verts[ j + 2 ] * scale + py  );
				colors.push( cols[ j ], cols[ j + 1 ], cols[ j + 2 ] );
			}
			coords.push( [ px, py ] );
			added++;
		}
		while( added < data.treeCount ){
			var px = Math.random() * 998 - 499;
			var py = Math.random() * 998 - 499;
			
			var scale = Math.random() * 2 + 1;
			var scaleHeight = Math.random() * 4 + 4;

			var r = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 ];
			var g = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 1 ];
			var b = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 2 ];
			var a = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 3 ];

			if( g > 0 ){
				addVs();
			} else if( Math.random() > 0.95 && r == 0 && g == 0 && b == 0 && a == 0 ) {
				addVs();
			}
			
		}
		var data = {
			'vertices' : vertices,
			'colors' : colors,
			'coords' : coords
		}
		self.postMessage( JSON.stringify( data ) );
	});
}