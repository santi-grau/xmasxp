
var Loading = function( parent ){

	this.parent = parent;
	
	this.buttonEl = document.querySelector('#start-button');
	this.buttonModeEl = document.querySelector('#mode-button');
	this.buttonAudioEl = document.querySelector('#audio-toggle');
	this.loadingBgEl = document.querySelector('#intro');

	this.isAudioPlaying = true;

	if (this.parent.isWebVR) {

		this.buttonEl.innerText = "GO WEBVR";

	} else if (this.parent.isCardboard) {

		this.buttonEl.innerText = "GO CARDBOARD";

	} else {

		this.buttonEl.innerText = "GO DESKTOP";
	}

	this.addEventListeners();
};

Loading.prototype.addEventListeners = function(){

	this.buttonEl.addEventListener( 'click', this.onClickButton.bind(this), false );
	this.buttonModeEl.addEventListener( 'click', this.onClickButtonMode.bind(this), false );
	this.buttonAudioEl.addEventListener( 'click', this.onClickButtonAudio.bind(this), false );
};

Loading.prototype.changeButton = function(buttonType) {

	this.buttonModeEl.className = "";
	this.buttonModeEl.classList.add(buttonType);
};

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

	this.buttonModeEl.style.display = 'block';
	TweenMax.to( this.buttonModeEl, 1.0, {

		opacity: 0.999,
		ease: Power2.easeInOut,
		delay: 1.0
	} );

	this.buttonAudioEl.style.display = 'block';
	TweenMax.to( this.buttonAudioEl, 1.0, {

		opacity: 0.999,
		ease: Power2.easeInOut,
		delay: 1.0
	} );

	this.parent.onClickStart();
};

Loading.prototype.onClickButtonMode = function(e) {

	e.preventDefault();

	this.parent.toggleControls();
};

Loading.prototype.onClickButtonAudio = function(e) {

	e.preventDefault();

	this.isAudioPlaying = !this.isAudioPlaying;
	this.buttonAudioEl.classList.toggle('playing');

	if (this.isAudioPlaying) {

		this.parent.player.noise.play();

	} else {

		this.parent.player.noise.pause();
	}
};

module.exports = Loading;