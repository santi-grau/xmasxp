module.exports = function( self ){
	self.addEventListener('message',function (msg){
		var data = JSON.parse( msg.data );
	
		var treeVerts = [ -0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, 0.5, 0, -0.5, 0, 1, 0, 0.5, 0, -0.5, 0.5, 0, 0.5, 0, 1, 0, 0.5, 0, 0.5,-0.5, 0, 0.5, 0, 1, 0, -0.5, 0, 0.5, -0.5, 0, -0.5, 0, 1, 0 ];

		var vertices = [];
		var coords = [];

		var added = 0;
		while( added < data.treeCount ){
			var px = Math.random() * 998 - 499;
			var py = Math.random() * 998 - 499;
			
			var scale = Math.random() * 2 + 1;
			var scaleHeight = Math.random() * 4 + 4;

			var p = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 3 ];

			if( p > 0 ){
				for( var j = 0 ; j < treeVerts.length ; j+=3 ){
					var p1 = treeVerts[ j ] * scale;
					var p2 = treeVerts[ j + 1 ] * scaleHeight - 200;
					var p3 = treeVerts[ j + 2 ] * scale;
					vertices.push( p1 + px );
					vertices.push( p2 );
					vertices.push( p3 + py  );
				}
				coords.push( [ px, py ] );
				added++;
			}
			
		}
		var data = {
			'vertices' : vertices,
			'coords' : coords
		}
		self.postMessage( JSON.stringify( data ) );
	});
}