'use strict';

var express      = require('express'),
	utilQuery    = require('../queries/util.query'),
	contestQuery = require('../queries/contest.query'),
	problemQuery = require('../queries/problem.query'),
	utilLib      = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a problem.
 */
async function createProblem(req, res, next) {
	try {
		// get the contest in which the problem will be inserted.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// count how many active problems there on this contest.
		var currentProblemsCount = await contestQuery.countProblems(req.conn, {
			contest_id: contest.id
		}, req.user);

		// new problem object.
		var newProblem = {
			name:        req.body.name,
			nickname:    utilLib.getNickname(req.body.name),
			description: req.body.description,
			time_limit:  req.body.time_limit,
			order:       currentProblemsCount.count + 1,
			author_id:   req.user.id,
			contest_id:  contest.id
		};

		// insert file.
		if(req.body.file && req.body.file.name && req.body.file.path) {
	        var insertFileResult = await utilQuery.insert(req.conn, 'file', {
	            name: req.body.file.name,
	            path: req.body.file.path
	        });

	        newProblem.file_id = insertFileResult.insertId;
		}

		// insert the problem.
		var insertResult = await utilQuery.insert(req.conn, 'problem', newProblem);

		// get the inserted problem.
		newProblem = await problemQuery.getOneProblem(req.conn, {
			problem_id: insertResult.insertId
		}, req.user);

		// return it.
		return res.json({
			success: true,
			problem: newProblem
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
 * Edit a problem.
 */
async function editProblem(req, res, next) {
	try {
		// get the contest that has the problem being edited.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem to be edited.
		var problem = await problemQuery.getOneProblem(req.conn, {
			problem_nickname: req.params.problem_nickname,
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

		// check if the file was edited.
		// old file removed:
		if(problem.file_id && !req.body.file) {
			delete problem.file_id;
			fieldsToEdit['file_id'] = null;
		}
		// file added:
		if(!problem.file_id && req.body.new_file) {
	        var insertFileResult = await utilQuery.insert(req.conn, 'file', {
	            name: req.body.new_file.name,
	            path: req.body.new_file.path
	        });

	        problem.file_id = insertFileResult.insertId;
	        fieldsToEdit['file_id'] = problem.file_id;
		}

		// edit the problem.
		await utilQuery.edit(req.conn, 'problem', fieldsToEdit, {
			id: problem.id
		});

		// get the problem updated.
		problem = await problemQuery.getOneProblem(req.conn, {
			problem_id: problem.id,
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
		return next();
	}
}

/**
 * Disable a problem.
 */
async function removeProblem(req, res, next) {
	await utilQuery.beginTransaction(req.conn);
	try {
		// get the contest that has the problem that will be removed.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem to be removed.
		var problem = await problemQuery.getOneProblem(req.conn, {
			problem_nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// remove the problem.
		await utilQuery.edit(req.conn, 'problem', {
			deleted_at: new Date()
		}, {
			id: problem.id
		});

		// reorder the problems accordingly.
		var remainingProblems = await problemQuery.getProblems(req.conn, {
			contest_id: contest.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);
		for(var index=0; index<remainingProblems.length; index++) {
			var remainingProblem = remainingProblems[index];

			if(remainingProblem.order > problem.order) {
				await utilQuery.edit(req.conn, 'problem', {
					order: remainingProblem.order - 1
				}, {
					id: remainingProblem.id
				});
			}
		}
		await utilQuery.commit(req.conn);

		// get the problem updated.
		problem = await problemQuery.getOneProblem(req.conn, {
			problem_id: problem.id,
			deleted_at: {
				$isNull: false
			}
		}, req.user);

		// return it.
		return res.json({
			success: true,
			problem: problem
		});
	} catch(err) {
		await utilQuery.rollback(req.conn);

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

router.route('/contest/:nickname/problem/')
    .post(createProblem);

router.route('/contest/:nickname/problem/:problem_nickname')
    .put(editProblem)
    .delete(removeProblem);

module.exports = router;
