var SunCalc = require('suncalc');

var Lights = function( parent ){
	this.parent = parent;

	this.group = new THREE.Object3D();

	this.fog = this.parent.scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );

	this.sunGroup = this.makeSun();
	this.moonGroup = this.makeMoon();

	this.ambientLight = new THREE.AmbientLight( 0xffffff , 0.6);
	this.group.add( this.ambientLight );
	// setTimeout( function(){
	// 	if( !this.dateRanges ) console.log( 'too late for geo ');
	// }, 2000 );

	this.timeOffset = 0;
	// setInterval( function(){
	// 	this.update();
	// }.bind(this), 10 );
	this.incDebug = 0.0;

	// var spotLight = new THREE.SpotLight( 0xffffff, 10, 1550 );
	// spotLight.position.set( 46, 37, -212 );
	// this.group.add(spotLight);


	// var helper = new THREE.SpotLightHelper( spotLight, 10 )
	// this.group.add(helper);

	this.latlon = [ 37.3909795, -122.0360722 ];
	this.update();

	// this.getLocation();
}
Lights.prototype.makeMoon = function(){
	this.moonGroup = new THREE.Object3D();
	this.moonAltitudeGroup = new THREE.Object3D();
	this.moonAzimuthGroup = new THREE.Object3D();

	this.moonDirectionalLightDistance = 500;
	this.moonDirectionalLight = new THREE.PointLight( 0xffffff, 1, 400 );
	this.moonDirectionalLight.lookAt( 0, 0, 0 );
	this.moonDirectionalLight.position.set(0, 0, this.moonDirectionalLightDistance);

	var geometry = new THREE.SphereBufferGeometry( 1.8, 16, 16 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
	this.sunSphere = new THREE.Mesh( geometry, material );
	this.sunSphere.position.z = this.moonDirectionalLightDistance;
	this.moonAzimuthGroup.add( this.sunSphere );

	this.moonAzimuthGroup.add( this.moonDirectionalLight )
	this.moonAltitudeGroup.add( this.moonAzimuthGroup );
	this.moonGroup.add( this.moonAltitudeGroup )
	this.moonGroup.rotation.x = -Math.PI / 2;
	this.group.add( this.moonGroup );
}
Lights.prototype.makeSun = function(){
	this.sunGroup = new THREE.Object3D();
	this.altitudeGroup = new THREE.Object3D();
	this.azimuthGroup = new THREE.Object3D();

	this.directionalLightDistance = 500;
	this.directionalLight = new THREE.PointLight( 0xffffff, 1, 1000 );
	this.directionalLight.lookAt( 0, 0, 0 );
	this.directionalLight.shadow.mapSize.width = 2048;
	this.directionalLight.shadow.mapSize.height = 2048;
	this.directionalLight.castShadow = true;
	this.directionalLight.position.set(0, 0, this.directionalLightDistance);

	var geometry = new THREE.SphereBufferGeometry( 20, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	this.sunSphere = new THREE.Mesh( geometry, material );
	this.sunSphere.position.z = this.directionalLightDistance;
	this.azimuthGroup.add( this.sunSphere );

	this.azimuthGroup.add( this.directionalLight )
	this.altitudeGroup.add( this.azimuthGroup );
	this.sunGroup.add( this.altitudeGroup )
	this.sunGroup.rotation.x = -Math.PI / 2;
	this.sunGroup.position.y = -100
	this.group.add( this.sunGroup );
}

Lights.prototype.update = function( ){
	var stages = [
		{
			'stage' : 'nightEnd',
			'data' : {
				clear : [ 0, 0, 0, 0.002 ],
				fog : [ 0, 0, 0, 0.002 ],
				ambient : [ 0, 0, 0, 0 ],
				directional : [ 0, 0, 0, 0 ],
				gazeColor1 : [ .1, .1, .1 ],
				gazeColor2 : [ 0.3, 0.4, 0.2 ]
			}
		},
		{ 'stage' : 'sunrise',
			'data' : {
				clear : [ 1, 0.3, 0.1, 0.002 ],
				fog : [ 1, 0.3, 0.1, 0.002 ],
				ambient : [ 1, 1, 1, 0.5 ],
				directional : [ 1, 0, 0, 0.5 ],
				gazeColor1 : [ .1, .1, .1 ],
				gazeColor2 : [ 0.3, 0.4, 0.2 ]
			}
		},
		{
			'stage' : 'solarNoon',
			'data' : {
				clear : [ 0.82, 0.93, 0.94, 0.002 ],
				fog : [ 1, 1, 1, 0.002 ],
				ambient : [ 1, 1, 1, 1 ],
				directional : [ 1, 1, 1, 1 ],
				gazeColor1 : [ .1, .1, .1 ],
				gazeColor2 : [ 0.3, 0.4, 0.2 ]
			}
		},
		{
			'stage' : 'sunset',
			'data' : {
				clear : [ 1, 0.2, 0.3, 0.002 ],
				fog : [ 1, 0.2, 0.3, 0.002 ],
				ambient : [ 1, 0.3, 0, 0.3 ],
				directional : [ 1, 0.8, 0.5, 0.8 ],
				gazeColor1 : [ .1, .1, .1 ],
				gazeColor2 : [ 0.3, 0.4, 0.2 ]
			}
		},
		{
			'stage' : 'night',
			'data' : {
				clear : [ 0, 0, 0, 0.002 ],
				fog : [ 0, 0, 0, 0.002 ],
				ambient : [ 0, 0, 0, 0 ],
				directional : [ 0, 0, 0, 0 ],
				gazeColor1 : [ .1, .1, .1 ],
				gazeColor2 : [ 0.3, 0.4, 0.2 ]
			}
		}
	]

	Date.prototype.addHours = function(h) {
 		this.setTime( this.getTime() + ( h*60*60*1000 ) );
 		return this;
	}


	this.timeOffset+=this.incDebug;
	// console.log(new Date().addHours(this.timeOffset));
	var sunPsition = SunCalc.getPosition( new Date().addHours(this.timeOffset), this.latlon[0], this.latlon[1] );

	this.azimuthGroup.rotation.y = -sunPsition.azimuth;
	this.altitudeGroup.rotation.x = sunPsition.altitude;

	// console.log(sunPsition.altitude);

	var moonPosition = SunCalc.getMoonPosition( new Date().addHours(this.timeOffset), this.latlon[0], this.latlon[1] );
	this.moonAzimuthGroup.rotation.y = -moonPosition.azimuth;
	this.moonAltitudeGroup.rotation.x = moonPosition.altitude;

	var moonIllumination = SunCalc.getMoonIllumination( new Date().addHours(this.timeOffset) );
	this.moonDirectionalLight.intensity = 1 - Math.abs(moonIllumination.phase-0.5) / 0.5;

	var getTimes = SunCalc.getTimes( new Date().addHours(this.timeOffset), this.latlon[0], this.latlon[1] );

	var phase = 4;
	var now = new Date().addHours(this.timeOffset).getTime();
	if( now > getTimes[stages[0].stage] && now < getTimes[stages[1].stage] ) phase = 0;
	else if( now > new Date( getTimes[stages[1].stage] ).getTime() && now < new Date( getTimes[stages[2].stage] ).getTime() ) phase = 1;
	else if( now > new Date( getTimes[stages[2].stage]).getTime() && now < new Date( getTimes[stages[3].stage]).getTime() ) phase = 2;
	else if( now > new Date( getTimes[stages[3].stage]).getTime() && now < new Date( getTimes[stages[4].stage]).getTime() ) phase = 3;
	else phase = 4;

	var frac;
	var directionalColor = [];
	var ambientColor = [];
	var fogColor = [];
	var clearColor = [];
	this.gazeColor1 = [];
	this.gazeColor2 = [];
	if( phase < 4 ){
		frac = ( new Date().addHours(this.timeOffset).getTime() - new Date( getTimes[stages[phase].stage] ).getTime() ) / ( new Date( getTimes[stages[parseInt(phase)+1].stage] ).getTime() - new Date( getTimes[stages[phase].stage] ).getTime() );
		for( var i = 0 ; i < stages[phase].data.directional.length ; i++ ) directionalColor[i] = stages[phase].data.directional[i] + ( stages[phase + 1].data.directional[i] - stages[phase].data.directional[i] ) * frac;
		for( var i = 0 ; i < stages[phase].data.ambient.length ; i++ ) ambientColor[i] = stages[phase].data.ambient[i] + ( stages[phase + 1].data.ambient[i] - stages[phase].data.ambient[i] ) * frac;
		for( var i = 0 ; i < stages[phase].data.fog.length ; i++ ) fogColor[i] = stages[phase].data.fog[i] + ( stages[phase + 1].data.fog[i] - stages[phase].data.fog[i] ) * frac;
		for( var i = 0 ; i < stages[phase].data.clear.length ; i++ ) clearColor[i] = stages[phase].data.clear[i] + ( stages[phase + 1].data.clear[i] - stages[phase].data.clear[i] ) * frac;
		for( var i = 0 ; i < stages[phase].data.gazeColor1.length ; i++ ) this.gazeColor1[i] = stages[phase].data.gazeColor1[i] + ( stages[phase + 1].data.gazeColor1[i] - stages[phase].data.gazeColor1[i] ) * frac;
		for( var i = 0 ; i < stages[phase].data.gazeColor2.length ; i++ ) this.gazeColor2[i] = stages[phase].data.gazeColor2[i] + ( stages[phase + 1].data.gazeColor2[i] - stages[phase].data.gazeColor2[i] ) * frac;


		this.fog.color = new THREE.Color( fogColor[0], fogColor[1], fogColor[2] );

		this.ambientLight.color = new THREE.Color( ambientColor[0], ambientColor[1], ambientColor[2] );
		this.ambientLight.intensity = ambientColor[3];

		this.directionalLight.color = new THREE.Color( directionalColor[0], directionalColor[1], directionalColor[2] );
		this.directionalLight.intensity = directionalColor[3];

		this.parent.renderer.setClearColor(new THREE.Color( clearColor[0], clearColor[1], clearColor[2] ), 1 );

		this.sunSphere.material.color = this.directionalLight.color;

		this.wireframeColor = 0x444444;
	} else {
		var t1 = new Date().addHours(this.timeOffset).getTime() - new Date( getTimes.night ).getTime();
		if( t1 < 0 ) t1 = new Date().addHours(parseInt(this.timeOffset) + 24).getTime() - new Date( getTimes.night ).getTime();
		frac = t1 / ( new Date( getTimes[stages[0].stage] ).addHours(24).getTime() - new Date( getTimes[stages[phase].stage] ).getTime() );

		this.fog.color = new THREE.Color( 0, 0, 0 );

		this.directionalLight.color = new THREE.Color( 0, 0, 0 );
		this.directionalLight.intensity = 0;

		this.ambientLight.color = new THREE.Color( 1, 1, 1 );
		this.ambientLight.intensity = 0.2;

		this.gazeColor1 = [ 1, 0.85490196078431, 0.62745098039216 ];
		this.gazeColor2 = [ 1, 0.62745098039216, 0.62745098039216 ];

		this.wireframeColor = 0xcccccc;

		this.parent.renderer.setClearColor( this.fog.color, 1 );
	}
	
	this.parent.player.targetCamera.updateColor( this.gazeColor1, this.gazeColor2 );
	this.parent.player.target.updateColor( this.gazeColor1, this.gazeColor2 );
	this.parent.stage.updateWireframeColor( this.wireframeColor );
	this.parent.prizes.updateWireframeColor( this.wireframeColor );

}
Lights.prototype.getDayNightData = function( position ){
	console.log(position);
}
Lights.prototype.getLocation = function(){
	if ( navigator.geolocation ){
		navigator.geolocation.getCurrentPosition( this.getDayNightData.bind(this) );

	} else{
		this.getDayNightData(null);
	}
}
Lights.prototype.step = function( time ){

	var now = new Date().getSeconds();
	if( ( now == 30 || now == 0 ) && now !== this.lastNow ) this.update();
	this.lastNow = now;
}

module.exports = Lights;