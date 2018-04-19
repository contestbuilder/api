'use strict';

console.log('register');

module.exports = function(req, res, next) {
	try {
		console.log('release');
		req.conn.release();
		return next();
	} catch(err) {
		return next(err);
	}
};
