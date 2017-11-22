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

		var currentProblemsCount = await contestQuery.countProblems(conn, {
			contest_id: contest.id
		}, req.user);

		var newProblem = {
			name:        req.body.name,
			nickname:    utilLib.getNickname(req.body.name),
			description: req.body.description,
			time_limit:  req.body.time_limit || 1,
			order:       currentProblemsCount.count + 1,
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
			nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		var fieldsToEdit = {};
		[
			'time_limit', 'description'
		].forEach(paramName => {
			if(req.body[paramName] !== undefined) {
				fieldsToEdit[paramName] = req.body[paramName];
			}
		});

		await utilQuery.edit(conn, 'problem', fieldsToEdit, {
			id: problem.id
		});

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
 * Disable a problem.
 */
async function removeProblem(conn, req, res, next) {
	await utilQuery.beginTransaction(conn);
	try {
		var contest = await contestQuery.getOneContest(conn, {
			nickname: req.params.nickname
		}, req.user);

		var problem = await problemQuery.getOneProblem(conn, {
			nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		await utilQuery.edit(conn, 'problem', {
			deleted_at: new Date()
		}, {
			id: problem.id
		});

		// reorder the problems accordingly.
		var remainingProblems = await problemQuery.getProblems(conn, {
			contest_id: contest.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);
		for(var index=0; index<remainingProblems.length; index++) {
			var remainingProblem = remainingProblems[index];

			if(remainingProblem.order > problem.order) {
				await utilQuery.edit(conn, 'problem', {
					order: remainingProblem.order - 1
				}, {
					id: remainingProblem.id
				});
			}
		}
		await utilQuery.commit(conn);

		return res.json({
			success: true
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

router.route('/contest/:nickname/problem/')
    .post(global.poolConnection.bind(null, createProblem));

router.route('/contest/:nickname/problem/:problem_nickname')
    .put(global.poolConnection.bind(null, editProblem))
    .delete(global.poolConnection.bind(null, removeProblem));

module.exports = router;
