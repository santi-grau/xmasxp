
var PrizePoints = require('./prizepoints');

var PrizesPointsPool = function( parent ){

	this.parent = parent;
	this.pool = [];
}

PrizesPointsPool.prototype.getPrizePointsInstance = function(points) {

	var availableInstance = null;
	for (var i = 0; i < this.pool.length; i++) {

		if (this.pool[ i ].available === true) {

			this.pool[i].updatePoints( points );
			return this.pool[ i ];
		}
	}

	// If we are here, there are no instances available, create one
	var prizePoints = this.createPrizePointsInstance( points );
	// Add it to the pool
	this.pool.push( prizePoints );

	return prizePoints;
};

PrizesPointsPool.prototype.createPrizePointsInstance = function(points) {

	var prizePoints = new PrizePoints(points);
	return prizePoints;
};

module.exports = PrizesPointsPool;