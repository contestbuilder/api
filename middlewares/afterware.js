'use strict';

module.exports = function(req, res, next) {
	try {
		console.log('release connection');
		req.conn.release();

		return next();
	} catch(err) {
		return next(err);
	}
};
