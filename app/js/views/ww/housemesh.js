module.exports = function( self ){
	self.addEventListener('message',function (msg){
		var data = JSON.parse( msg.data );
		
		var vertices = [];
		var colors = [];
		var coords = [];

		var verts = [
			-0.5, 0, -0.5, 
			-0.5, 1, -0.5,
			0.5, 0, -0.5,

			0.5, 0, -0.5,
			-0.5, 1, -0.5,
			0.5, 1, -0.5,


			0.5, 1, -0.5, 
			-0.5, 1, -0.5, 
			0, 1.3, -0.5,


			0.5, 0, -0.5, 
			0.5, 1, -0.5,
			0.5, 0, 0.5,

			0.5, 0, 0.5, 
			0.5, 1, -0.5,
			0.5, 1, 0.5,

			0.5, 0, 0.5, 
			0.5, 1, 0.5,
			-0.5, 0, 0.5,

			-0.5, 0, 0.5, 
			0.5, 1, 0.5,
			-0.5, 1, 0.5,

			-0.5, 1, 0.5, 
			0.5, 1, 0.5, 
			0, 1.3, 0.5,

			-0.5, 0, 0.5, 
			-0.5, 1, 0.5,
			-0.5, 0, -0.5,

			-0.5, 0, -0.5, 
			-0.5, 1, 0.5,
			-0.5, 1, -0.5,
			
			// roof
			0, 1.3, 0.7, 
			-0.6, 0.95, -0.7, 
			-0.6, 0.95, 0.7,

			0, 1.3, 0.7, 
			0, 1.3, -0.7, 
			-0.6, 0.95, -0.7,

			0, 1.3, 0.7, 
			0.6, 0.95, -0.7,
			0, 1.3, -0.7, 

			0, 1.3, 0.7, 
			0.6, 0.95, 0.7,
			0.6, 0.95, -0.7, 

		];

		var colsroof = [[145,73,75],[156,89,78],[133,90,73]];
		var colsdark = [[140,114,138],[133,120,106],[133,117,99],[110,88,69],[133,91,87]];
		var cols = [[140,114,138],[133,120,106],[133,117,99],[110,88,69],[133,91,87]];

		var c1 = 0;
		var c2 = 1

		
		// var cols = [ c2,0,0,c2,0,0,c2,0,0,c2,0,0,c2,0,0,c2,0,0,c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, c2,0,0,c2,0,0,c2,0,0, 0,0,c2,0,0,c2,0,0,c2, 0,0,c2,0,0,c2,0,0,c2, 0,0,c2,0,0,c2,0,0,c2, 0,0,c2,0,0,c2,0,0,c2 ];

		var added = 0;
		var addVs = function(){
			
			data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 ] = 0;
			var cls = [];
			var colPic = Math.floor( Math.random() * cols.length );
			var colRoof = Math.floor( Math.random() * colsroof.length );
			for( var i = 0; i < verts.length ; i+=3 ){
				if( i < verts.length - 39 ){
					if( verts[ i + 1 ] == 0 ) cls.push( colsdark[colPic][0] / 255, colsdark[colPic][1] / 255, colsdark[colPic][2] / 255 );
					else cls.push( cols[colPic][0] / 255, cols[colPic][1] / 255, cols[colPic][2] / 255 );
				}else{
					cls.push( colsroof[colRoof][0] / 255, colsroof[colRoof][1] / 255, colsroof[colRoof][2] / 255 );
				}		
			}

			for( var j = 0 ; j < verts.length ; j+=3 ){
				vertices.push( verts[ j ] * scale + px, verts[ j + 1 ] * scale - 200, verts[ j + 2 ] * scale + py  );
				colors.push( cls[ j ], cls[ j + 1 ], cls[ j + 2 ] );
			}
			coords.push( [ px, py ] );
			added++;
		}
		while( added < data.treeCount ){
			var px = Math.random() * 998 - 499;
			var py = Math.random() * 998 - 499;
			
			var scale = Math.random() * 1 + 1;
			var scaleHeight = Math.random() * 1 + 1;

			var r = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 ];
			var g = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 1 ];
			var b = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 2 ];
			var a = data.imgData[ ( ( ( Math.floor( py ) + 500 - 1) * 1000 +  Math.floor( px ) + 500 ) - 1 ) * 4 + 3 ];

			if( r > 0 ){
				addVs();
			} else if( Math.random() > 0.995 && r == 0 && g == 0 && b == 0 && a == 0 ) {
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