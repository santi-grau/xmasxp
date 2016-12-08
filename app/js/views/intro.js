var SimplexNoise = require('simplex-noise');

var Intro = function( parent ) {
	this.parent = parent;

	this.simplex = new SimplexNoise( Math.random );

	this.introEl = document.getElementById('intro');
	this.targetEl = document.getElementById('target');
	this.gazeEl = document.getElementById('gaze');
	this.targetInc = 0;

	this.currentScreen = 0;
	this.screens = document.getElementsByClassName('screenHolder')

	this.swapScreen();

	this.loading = document.querySelector('.loading');
	setInterval( function(){
		if( this.loading.classList.length == 1 ) this.loading.classList.add('active');
		else this.loading.classList.remove('active');
	}.bind(this), 1000 );

// <<<<<<< HEAD

// 	setTimeout( this.onLoad.bind(this), 3000 );


// };

// Intro.prototype.onLoad = function( time ) {
// 	this.screen1.classList.remove('active');
// 	setTimeout( function(){
// 		this.introEl.classList.remove('screen1');
// 	}.bind(this),1000)

// 	this.introEl.classList.add('screen2');

// 	setTimeout( function(){
// 		this.screen2.classList.add('active');
// 	}.bind(this),1)

// 	setTimeout( this.onScreen3.bind(this), 5000 );

// };

// Intro.prototype.onScreen3 = function( time ) {
// 	this.screen2.classList.remove('active');
// 	setTimeout( function(){
// 		this.introEl.classList.remove('screen2');
// 	}.bind(this),1000)

// 	this.introEl.classList.add('screen3');

// 	setTimeout( function(){
// 		this.screen3.classList.add('active');
// 	}.bind(this),1)

// 	setTimeout( this.onScreen4.bind(this), 5000 );
// };

// Intro.prototype.onScreen4 = function( time ) {
// 	this.screen3.classList.remove('active');
// 	setTimeout( function(){
// 		this.introEl.classList.remove('screen3');
// 	}.bind(this),1000)

// 	this.introEl.classList.add('screen4');

// 	setTimeout( function(){
// 		this.screen4.classList.add('active');
// 	}.bind(this),1)

// 	// setTimeout( this.onScreen4.bind(this), 5000 );
// };
// =======
};

Intro.prototype.swapScreen = function( ) {
	for( var i = 0 ; i < this.screens.length ; i++ ) this.screens[ i ].classList.remove('active');
	this.screens[ this.currentScreen ].classList.add('active');
	if( this.currentScreen < this.screens.length - 1 ) setTimeout( this.swapScreen.bind(this), 5000 );
	this.currentScreen++;
}
// >>>>>>> origin/master

Intro.prototype.step = function( time ) {
	if( this.currentScreen == 2 ){
		this.targetInc += 0.006;
		var val = this.simplex.noise2D( 0.55, this.targetInc );
		var val2 = this.simplex.noise2D( 0.82, this.targetInc );
		this.targetEl.style.transform = 'translate3D( 0px, ' + ( val * 10 ) + 'px, 0px )';
		this.gazeEl.style.transform = 'translate3D( 0px, ' + ( val * 10 + val2 * 20 ) + 'px, 0px )'
	}
};

module.exports = Intro;