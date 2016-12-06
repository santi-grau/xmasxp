
var Loading = function( parent ){

	this.parent = parent;
	this.buttonEl = document.querySelector("#start-button");
	this.loadingBgEl = document.querySelector("#intro");

	this.addEventListeners();


}

Loading.prototype.addEventListeners = function(){

	this.buttonEl.addEventListener( 'click', this.onClickButton.bind(this), false );
}

Loading.prototype.onClickButton = function(e) {

	e.preventDefault();

	this.loadingBgEl.style.display = 'none';
	this.buttonEl.style.display = 'none';

	// this.parent.fullscreen();
}

module.exports = Loading;