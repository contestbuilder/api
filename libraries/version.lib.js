'use strict';

function getLastVersion(versions) {
	return versions[ versions.length - 1 ];
}

function createNewVersion(versions, changes) {
    var newVersion = JSON.parse(JSON.stringify(getLastVersion(versions)));

    if(typeof changes === 'object') {
        Object.keys(changes).forEach(function(key) {
            newVersion[key] = changes[key];
        });
    }

    if(newVersion.timestamp) {
        delete newVersion.timestamp;
    }

    return newVersion;
}

function isBetween(a, b, c) {
    return Math.min(b, c) <= a && a <= Math.max(b, c);
}

module.exports = {
	getLastVersion:   getLastVersion,
	createNewVersion: createNewVersion,
    isBetween:        isBetween
};
