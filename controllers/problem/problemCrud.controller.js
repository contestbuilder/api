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
		// get the contest in which the problem will be inserted.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// count how many active problems there on this contest.
		var currentProblemsCount = await contestQuery.countProblems(conn, {
			contest_id: contest.id
		}, req.user);

		// new problem object.
		var newProblem = {
			name:        req.body.name,
			nickname:    utilLib.getNickname(req.body.name),
			description: req.body.description,
			time_limit:  req.body.time_limit || 1,
			order:       currentProblemsCount.count + 1,
			author_id:   req.user._id
		};

		// insert the problem.
		var insertResult = await utilQuery.insert(conn, 'problem', newProblem);

		// add the problem to the contest.
		await utilQuery.insert(conn, 'contest_problem', {
			contest_id: contest.id,
			problem_id: insertResult.insertId
		});

		// commit changes.
		await utilQuery.commit(conn);

		// get the inserted problem.
		newProblem = await problemQuery.getOneProblem(conn, {
			nickname: newProblem.nickname
		}, req.user);

		// return it.
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
		// get the contest that has the problem being edited.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem to be edited.
		var problem = await problemQuery.getOneProblem(conn, {
			nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// identify the fields that will be edited.
		var fieldsToEdit = {};
		[
			'name', 'time_limit', 'description'
		].forEach(paramName => {
			if(req.body[paramName] !== undefined) {
				fieldsToEdit[paramName] = req.body[paramName];
			}
		});

		// edit the problem.
		await utilQuery.edit(conn, 'problem', fieldsToEdit, {
			id: problem.id
		});

		// get the problem updated.
		problem = await problemQuery.getOneProblem(conn, {
			nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// return it.
		return res.json({
			success: true,
			problem: problem
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
		// get the contest that has the problem that will be removed.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem to be removed.
		var problem = await problemQuery.getOneProblem(conn, {
			nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// remove the problem.
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

		// get the problem updated.
		var problem = await problemQuery.getOneProblem(conn, {
			nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// return it.
		return res.json({
			success: true,
			problem: problem
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
