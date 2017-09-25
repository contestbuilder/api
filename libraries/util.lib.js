'use strict';

function validateQuery(obj, query) {
	return Object.keys(query).every(function(key) {
		if(key == '_id') {
			return obj[key].toString() == query[key].toString();
		} else {
			return obj[key] == query[key];
		}
	});
}

function getItem(arr, query) {
	if(!Array.isArray(arr)) {
		return null;
	}

	for(var index=0; index<arr.length; index++) {
		if(validateQuery(arr[index], query)) {
			return arr[index];
		}
	}

	return null;
}

function getItemIndex(arr, query) {
	if(!Array.isArray(arr)) {
		return null;
	}

	for(var index=0; index<arr.length; index++) {
		if(validateQuery(arr[index], query)) {
			return index;
		}
	}

	return null;
}

function aggregate(model, aggregation) {
	return new Promise(function(resolve, reject) {
		model.aggregate(aggregation, function(err, results) {
			if(err) {
				return reject(err);
			}

			return resolve(results);
		});
	});
}

module.exports = {
	validateQuery: validateQuery,
	getItem:       getItem,
	getItemIndex:  getItemIndex,
	aggregate:     aggregate
};
