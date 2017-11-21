'use strict';

var express      = require('express'),
	utilQuery    = require('../../queries/util.query'),
	contestQuery = require('../../queries/contest.query'),
	problemQuery = require('../../queries/problem.query'),
	utilLib      = require('../../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a problem.
 */
async function createProblem(conn, req, res, next) {
	await utilQuery.beginTransaction(conn);
	try {
		var contest = await contestQuery.getOneContest(conn, {
			nickname: req.params.nickname
		}, req.user);

		var newProblem = {
			name:        req.body.name,
			nickname:    utilLib.getNickname(req.body.name),
			description: req.body.description,
			time_limit:  req.body.time_limit || 1,
			order:       1,
			author_id:   req.user._id
		};

		newProblem = await utilQuery.insert(conn, 'problem', newProblem);
		await utilQuery.insert(conn, 'contest_problem', {
			contest_id: contest.id,
			problem_id: newProblem.insertId
		});
		await utilQuery.commit(conn);

		return res.json({
			success: true,
			problem: newProblem
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
 * Edit a problem.
 */
async function editProblem(conn, req, res, next) {
	try {
		var contest = await contestQuery.getOneContest(conn, {
			nickname: req.params.nickname
		}, req.user);

		var problem = await problemQuery.getOneProblem(conn, {
			contest_nickname: req.params.nickname,
			problem_nickname: req.params.problem_nickname
		}, req.user);

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

router.route('/contest/:nickname/problem/')
    .post(global.poolConnection.bind(null, createProblem));

router.route('/contest/:nickname/problem/:problem_nickname')
    .put(editProblem);
    // .delete(removeProblem);

module.exports = router;
