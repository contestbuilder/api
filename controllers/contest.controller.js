'use strict';

var express   = require('express'),
	utilQuery = require('../queries/util.query'),
	utilLib   = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a contest.
 */
async function createContest(conn, req, res, next) {
	await utilQuery.beginTransaction(conn);
	try {
		var newContest = {
			author_id:  req.user._id,
			name:       req.body.name,
			nickname:   utilLib.getNickname(req.body.name),
			created_at: new Date()
		};

		newContest = await utilQuery.insert(conn, 'contest', newContest);
		await utilQuery.insert(conn, 'contest_contributor', {
			contest_id: newContest.insertId,
			user_id:    req.user._id
		});
		await utilQuery.commit(conn);

		return res.json({
			success: true,
			contest: newContest
		});
	} catch(err) {
		await utilQuery.rollback(conn);
		return next({
			error: err
		});
	} finally {
		conn.release();
	}
}


/**
 * Routes
 */

var router = express.Router();

router.route('/contest/')
    .post(global.poolConnection.bind(null, createContest));

module.exports = router;
