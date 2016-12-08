var SimplexNoise = require('simplex-noise');

var Intro = function( parent ) {
	this.parent = parent;

	this.simplex = new SimplexNoise( Math.random );

	this.introEl = document.getElementById('intro');
	this.targetEl = document.getElementById('target');
	this.gazeEl = document.getElementById('gaze');
	this.skipButEl = document.getElementById('skipbut');

	this.targetInc = 0;

	this.currentScreen = 0;
	this.screens = document.getElementsByClassName('screenHolder')

	this.skipButEl.addEventListener( 'click', function(){
		this.currentScreen = 3;
		this.swapScreen();
		this.skipButEl.style.display = 'none';
		clearInterval( this.swapInterval );
		clearTimeout( this.swapTimeout );
	}.bind(this), false );

	this.swapScreen();

	this.loading = document.querySelector('.loading');
	this.swapInterval = setInterval( function(){
		if( this.loading.classList.length == 1 ) this.loading.classList.add('active');
		else this.loading.classList.remove('active');
	}.bind(this), 1000 );
};

Intro.prototype.swapScreen = function( ) {
	if( this.currentScreen == 3 ) this.skipButEl.style.display = 'none';
	for( var i = 0 ; i < this.screens.length ; i++ ) this.screens[ i ].classList.remove('active');
	this.screens[ this.currentScreen ].classList.add('active');
	if( this.currentScreen < this.screens.length - 1 ) this.swapTimeout = setTimeout( this.swapScreen.bind(this), 5000 );
	this.currentScreen++;
}

Intro.prototype.step = function( time ) {
	if( this.currentScreen == 2 ){
		this.targetInc += 0.006;
		var val = this.simplex.noise2D( 0.55, this.targetInc );
		var val2 = this.simplex.noise2D( 0.82, this.targetInc );
		this.targetEl.style.transform = 'translate3D( 0px, ' + ( val * 10 ) + 'px, 0px )';
		this.gazeEl.style.transform = 'translate3D( 0px, ' + ( val * 10 + val2 * 20 ) + 'px, 0px )'
	}
};

Intro.prototype.onEnd = function() {
	this.introEl.style.display = 'none';
}

module.exports = Intro;