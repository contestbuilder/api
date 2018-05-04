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
async function addContributor(req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the user.
		var user = await userQuery.getOneUser(req.conn, {
			user_id: req.body.user_id
		}, req.user);

		// insert user as contributor.
		await utilQuery.insert(req.conn, 'contest_contributor', {
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
		return next();
	}
}

/**
  * Remove a contributor.
  */
async function removeContributor(req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the user.
		var user = await userQuery.getOneUser(req.conn, {
			user_id: +req.params.user_id
		}, req.user);

		// get the contributor.
		var contributor = await utilQuery.selectOne(
			req.conn,
			'cb.*',
			'contest_contributor cb',
			null,
			{
				'cb.contest_id': contest.id,
				'cb.user_id':    user.id
			}
		);

		// remove contributor.
		await utilQuery.hardDelete(
			req.conn,
			'contest_contributor',
			{
				'contest_id': contest.id,
				'user_id':    user.id
			}
		);

		// return ok result.
		return res.json({
			success: true,
			contest: contest
		});
	} catch(err) {
		return next({
			error: err
		});
	} finally {
		return next();
	}
}


/**
 * Routes
 */

var router = express.Router();

router.route('/contest/:nickname/contributor/')
    .post(addContributor);

router.route('/contest/:nickname/contributor/:user_id')
    .delete(removeContributor);

module.exports = router;
