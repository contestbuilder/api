'use strict';

function getLastRunNumber(solutions) {
	var lastRunNumber = 0;
	solutions.forEach(function(solution) {
		solution.run.forEach(function(run) {
			lastRunNumber = Math.max(lastRunNumber, run.run_number);
		});
	});
	return lastRunNumber;
}

module.exports = {
	getLastRunNumber: getLastRunNumber
};
