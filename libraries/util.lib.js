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

module.exports = {
	validateQuery: validateQuery,
	getItem      : getItem,
	getItemIndex : getItemIndex
};
