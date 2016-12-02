var SunCalc = require('suncalc');

var Lights = function(){
	this.group = new THREE.Object3D();
	this.altitudeGroup = new THREE.Object3D();
	this.azimuthGroup = new THREE.Object3D();
	this.altitudeGroup.add( this.azimuthGroup );
	this.group.add( this.azimuthGroup );

	this.ambientLight = new THREE.AmbientLight( 0xffffff , 0.6);
	
	this.group.add( this.ambientLight );

	this.directionalLightDistance = 500;
	this.directionalLight = new THREE.SpotLight( 0xffffff );
	this.directionalLight.lookAt( 0, 0, 0 )

	this.directionalLight.shadow.mapSize.width = 4096;
	this.directionalLight.shadow.mapSize.height = 4096;

	this.directionalLight.shadow.camera.near = 100;
	this.directionalLight.shadow.camera.far = 4000;
	this.directionalLight.shadow.camera.fov = 60;

	var lightHelper = new THREE.CameraHelper( this.directionalLight.shadow.camera );
	this.azimuthGroup.add( lightHelper)
	this.directionalLight.castShadow = true;
	this.directionalLight.position.x = 500;
	this.azimuthGroup.add( this.directionalLight );

	// setTimeout( function(){
	// 	if( !this.dateRanges ) console.log( 'too late for geo ');
	// }, 2000 );

	// this.latlon = [ Math.random() * 180 - 90, Math.random() * 360 - 180 ];
	this.latlon = [ 37.3909795, -122.0360722 ];
	this.update();

	// this.getLocation();
	// this.defaultDayNightData = '{"results":{"sunrise":"2016-12-01T15:04:52+00:00","sunset":"2016-12-02T00:50:27+00:00","solar_noon":"2016-12-01T19:57:39+00:00","day_length":35135,"civil_twilight_begin":"2016-12-01T14:36:12+00:00","civil_twilight_end":"2016-12-02T01:19:07+00:00","nautical_twilight_begin":"2016-12-01T14:03:51+00:00","nautical_twilight_end":"2016-12-02T01:51:28+00:00","astronomical_twilight_begin":"2016-12-01T13:32:20+00:00","astronomical_twilight_end":"2016-12-02T02:22:59+00:00"},"status":"OK"}';
	// this.set( this.defaultDayNightData );
	// this.update( 3 )
}
Lights.prototype.set = function( data ){
	console.log(data);
	this.dateRanges = {};
	for( var key in data ){
		this.dateRanges[ key ] = new Date( data[ key ] );
	}
	this.update();
}
Lights.prototype.update = function( stage ){
	console.log(stage);
	var stages = [
		{ 
			'stage' : 'dawn',
			'data' : {
				rotation : 0,
				ambient : [ 0, 0, 0, 0 ],
				directional : [ 0, 0, 0, 0 ]
			} 
		},
		{ 'stage' : 'sunrise',
			'data' : {
				rotation : 0.15,
				ambient : [ 1, 1, 1, 0.5 ],
				directional : [ 1, 0, 0, 0.5 ]
			}
		},
		{
			'stage' : 'solarNoon',
			'data' : {
				rotation : 0.5,
				ambient : [ 1, 1, 1, 1 ],
				directional : [ 1, 1, 1, 1 ]
			}
		},
		{
			'stage' : 'sunset',
			'data' : {
				rotation : 0.85,
				ambient : [ 1, 0.3, 0, 0.3 ],
				directional : [ 1, 0.8, 0.5, 0.8 ]
			}
		},
		{
			'stage' : 'dusk',
			'data' : {
				rotation : 1,
				ambient : [ 0, 0, 0, 0 ],
				directional : [ 0, 0, 0, 0 ]
			}
		},
		{
			'stage' : 'dawn',
			'data' : {
				rotation : 1,
				ambient : [ 0, 0, 0, 0 ],
				directional : [ 0, 0, 0, 0 ]
			}
		}
	]

	this.now = new Date();
	// if( !stage ){
	// 	for( var i = 0 ; i < stages.length ; i++ ){
	// 		if( this.now > this.dateRanges[ stages[i].stage ] ) stage = i;
	// 		else continue;
	// 	}
	// }


	Date.prototype.addHours = function(h) {    
 		this.setTime( this.getTime() + ( h*60*60*1000 ) ); 
 		return this;   
	}
	console.log(this.latlon);
	console.log(new Date().addHours(0));
	var position = SunCalc.getPosition( new Date().addHours(-18), this.latlon[0], this.latlon[1] );

	// this.altitudeGroup.rotation.z = position.altitude;
	// this.azimuthGroup.rotation.y = -Math.PI / 2 - position.azimuth * Math.PI;
	// this.directionalLight.position.set( Math.cos( position.altitude ), Math.sin( position.altitude ), 0 ).normalize().multiplyScalar( this.directionalLightDistance );
	// this.directionalLight.color = new THREE.Color( 1,1,1);
	// this.directionalLight.intensity = 1;
	console.log(position);



	// var initTime = this.dateRanges[ stages[stage].stage ].getTime();
	// var endTime = this.dateRanges[ stages[stage+1].stage ].getTime();
	// var nowProgress = ( this.now - initTime ) / ( endTime - initTime );

	// var rotation = stages[stage].data.rotation + ( stages[stage + 1].data.rotation - stages[stage].data.rotation ) * nowProgress;
	// var position = new THREE.Vector3( Math.cos( Math.PI * rotation ), Math.sin( Math.PI * rotation ), 0  ).normalize().multiplyScalar( this.directionalLightDistance );
	
	// this.directionalLight.position.set( position.x, position.y, position.z );
	
	// var directionalColor = []
	// for( var i = 0 ; i < stages[stage].data.directional.length ; i++ ) directionalColor[i] = stages[stage].data.directional[i] + ( stages[stage + 1].data.directional[i] - stages[stage].data.directional[i] ) * nowProgress;
	// this.directionalLight.color = new THREE.Color( directionalColor[0], directionalColor[1], directionalColor[2] );
	// this.directionalLight.intensity = directionalColor[3];

	// var ambientColor = []
	// for( var i = 0 ; i < stages[stage].data.ambient.length ; i++ ) ambientColor[i] = stages[stage].data.ambient[i] + ( stages[stage + 1].data.ambient[i] - stages[stage].data.ambient[i] ) * nowProgress;
	// this.ambientLight.color = new THREE.Color( ambientColor[0], ambientColor[1], ambientColor[2] );
	// this.ambientLight.intensity = ambientColor[3];

}
Lights.prototype.getDayNightData = function( position ){
	console.log(position);
	// this.set( SunCalc.getTimes( new Date(), position.coords.latitude, position.coords.longitude ) );
}
Lights.prototype.getLocation = function(){
	if ( navigator.geolocation ) navigator.geolocation.getCurrentPosition( this.getDayNightData.bind(this) );
	else this.getDayNightData(null);
}
Lights.prototype.step = function( time ){
	// var now = new Date().getSeconds();
	// if( ( now == 30 || now == 0 ) && now !== this.lastNow ) this.update();
	// this.lastNow = now;
}

module.exports = Lights;