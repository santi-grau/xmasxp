var Intro = function( parent ) {
	this.parent = parent;

	this.introEl = document.getElementById('intro');
	this.screen1 = document.getElementById('screen1');
	this.screen2 = document.getElementById('screen2');
	this.screen3 = document.getElementById('screen3');
	this.screen4 = document.getElementById('screen4');

	this.screen1.classList.add('active');
	this.loading = document.querySelector('.loading');

	setInterval( function(){
		if( this.loading.classList.length == 1 ) this.loading.classList.add('active');
		else this.loading.classList.remove('active');
	}.bind(this), 1000 );

	setTimeout( this.onLoad.bind(this), 3000 );

	
};

Intro.prototype.onLoad = function( time ) {
	this.screen1.classList.remove('active');
	setTimeout( function(){
		this.introEl.classList.remove('screen1');
	}.bind(this),1000)
	
	this.introEl.classList.add('screen2');
	
	setTimeout( function(){
		this.screen2.classList.add('active');
	}.bind(this),1)

	setTimeout( this.onScreen3.bind(this), 5000 );
	
};

Intro.prototype.onScreen3 = function( time ) {
	this.screen2.classList.remove('active');
	setTimeout( function(){
		this.introEl.classList.remove('screen2');
	}.bind(this),1000)
	
	this.introEl.classList.add('screen3');
	
	setTimeout( function(){
		this.screen3.classList.add('active');
	}.bind(this),1)
	
	setTimeout( this.onScreen4.bind(this), 5000 );
};

Intro.prototype.onScreen4 = function( time ) {
	this.screen3.classList.remove('active');
	setTimeout( function(){
		this.introEl.classList.remove('screen3');
	}.bind(this),1000)
	
	this.introEl.classList.add('screen4');
	
	setTimeout( function(){
		this.screen4.classList.add('active');
	}.bind(this),1)
	
	// setTimeout( this.onScreen4.bind(this), 5000 );
};

Intro.prototype.step = function( time ) {

};

module.exports = Intro;