
var Loading = function( parent ){

	this.parent = parent;

	this.buttonEl1 = document.querySelector('#start-button1');
	this.buttonEl2 = document.querySelector('#start-button2');
	this.buttonEl3 = document.querySelector('#start-button3');
	this.buttonModeEl = document.querySelector('#mode-button');
	this.buttonAudioEl = document.querySelector('#audio-toggle');
	this.loadingBgEl = document.querySelector('#intro');
	// this.introColorEl = document.querySelector('#bg');
	this.introEl = document.getElementById('intro');

	this.isAudioPlaying = true;

	if (this.parent.isWebVR) {
		// this.buttonEl.innerText = "GO WEBVR";
		this.introEl.classList.add('webvr');

	} else if (this.parent.isCardboard) {

		// this.buttonEl.innerText = "GO CARDBOARD";
		this.introEl.classList.add('cardboard');

	} else {

		// this.buttonEl.innerText = "GO DESKTOP";
		this.introEl.classList.add('desktop');
	}

	if (this.parent.isCardboard) {

		this.audio = document.createElement('audio');
		this.audio.src = 'assets/pickPrize.m4a';
		this.audioWind = document.createElement('audio');
		this.audioWind.src = 'assets/wind.m4a';
	}


	this.addEventListeners();
};

Loading.prototype.addEventListeners = function(){

	this.buttonEl1.addEventListener( 'click', this.onClickButton.bind(this), false );
	this.buttonEl2.addEventListener( 'click', this.onClickButton.bind(this), false );
	this.buttonEl3.addEventListener( 'click', this.onClickButton.bind(this), false );
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
		onComplete: function () {
			this.loadingBgEl.style.display = 'none';
			// this.introColorEl.style.display = 'none';
		}.bind( this )
	} );

	TweenMax.to( this.buttonEl1, 1.0, {

		opacity: 0.001,
		ease: Power2.easeInOut,
		onComplete: function () {
			this.buttonEl1.style.display = 'none';
			this.buttonEl2.style.display = 'none';
			this.buttonEl3.style.display = 'none';
		}.bind( this )
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

	this.parent.onClickStart((e.currentTarget.id == "start-button2"));

	if (this.parent.isCardboard) {

		this.audio.play();
		this.audioWind.play();
	}
};

Loading.prototype.onClickButtonMode = function(e) {

	e.preventDefault();

	this.parent.toggleControls();
};

Loading.prototype.onClickButtonAudio = function(e) {

	e.preventDefault();

	this.isAudioPlaying = !this.isAudioPlaying;
	this.buttonAudioEl.classList.toggle('playing');

	if (!this.parent.isCardboard) {

		if (this.isAudioPlaying) this.parent.player.noise.play();
		else this.parent.player.noise.pause();
	}
};

module.exports = Loading;