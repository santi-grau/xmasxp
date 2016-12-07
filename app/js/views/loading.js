
var LoadingCanvas = require('./loadingcanvas');

var Loading = function( parent ){

	this.parent = parent;
	this.buttonEl = document.querySelector('#start-button');
	this.buttonModeEl = document.querySelector('#mode-button');
	this.loadingBgEl = document.querySelector('#intro');

	if (this.parent.isWebVR) {

		this.buttonEl.innerText = "GO WEBVR";

	} else if (this.parent.isCardboard) {

		this.buttonEl.innerText = "GO CARDBOARD";

	} else {

		this.buttonEl.innerText = "GO DESKTOP";
	}

	// this.loadingCanvas = new LoadingCanvas( this );

	this.addEventListeners();
}

Loading.prototype.addEventListeners = function(){

	this.buttonEl.addEventListener( 'click', this.onClickButton.bind(this), false );
	this.buttonModeEl.addEventListener( 'click', this.onClickButtonMode.bind(this), false );
}

Loading.prototype.onClickButton = function(e) {

	e.preventDefault();

	TweenMax.to( this.loadingBgEl, 1.5, {

		opacity: 0.001,
		ease: Power2.easeInOut,
		onComplete: function () { this.loadingBgEl.style.display = 'none'; }.bind( this )
	} );

	TweenMax.to( this.buttonEl, 1.0, {

		opacity: 0.001,
		ease: Power2.easeInOut,
		onComplete: function () { this.buttonEl.style.display = 'none'; }.bind( this )
	} );

	this.parent.onClickStart();
}

Loading.prototype.onClickButtonMode = function(e) {

	e.preventDefault();

	this.parent.toggleControls();
}

module.exports = Loading;