'use strict';

var express      = require('express'),
	utilQuery    = require('../queries/util.query'),
	contestQuery = require('../queries/contest.query'),
	userQuery    = require('../queries/user.query'),
	utilLib      = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Add a contributor.
 */
async function addContributor(conn, req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the user.
		var user = await userQuery.getOneUser(conn, {
			user_id: req.body.user_id
		}, req.user);

		// insert user as contributor.
		await utilQuery.insert(conn, 'contest_contributor', {
			contest_id: contest.id,
			user_id:    user.id
		});

		// return ok result.
		return res.json({
			success: true
		});
	} catch(err) {
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

router.route('/contest/:nickname/contributor/')
    .post(global.poolConnection.bind(null, addContributor));

// router.route('/contest/:nickname/contributor/:user_id')
//     .delete(removeContributor);

module.exports = router;
