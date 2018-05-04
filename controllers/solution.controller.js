'use strict';

var express       = require('express'),
	utilQuery     = require('../queries/util.query'),
	contestQuery  = require('../queries/contest.query'),
	problemQuery  = require('../queries/problem.query'),
	solutionQuery = require('../queries/solution.query'),
	utilLib       = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a solution.
 */
async function createSolution(req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(req.conn, {
			problem_nickname: req.params.problem_nickname
		}, req.user);

		// count how many active solutions there are for this problem.
		var currentSolutionsCount = await problemQuery.countSolutions(req.conn, {
			contest_id: contest.id,
			problem_id: problem.id
		}, req.user);

		// new solution object.
		var newSolution = {
			name:             req.body.name,
			nickname:         utilLib.getNickname(req.body.name),
			language:         req.body.language,
			expected_verdict: req.body.expected_verdict,
			source_code:      req.body.source_code,
			order:            currentSolutionsCount.count + 1,
			last_edit:        new Date(),
			author_id:        req.user.id,
			problem_id:       problem.id
		};

		// insert the problem.
		var insertResult = await utilQuery.insert(req.conn, 'solution', newSolution);

		// get the inserted solution.
		newSolution = await solutionQuery.getOneSolution(req.conn, {
			solution_id: insertResult.insertId
		}, req.user);

		// return it.
		return res.json({
			success:  true,
			solution: newSolution
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
 * Edit a solution.
 */
async function editSolution(req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(req.conn, {
			problem_nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// get the solution.
		var solution = await solutionQuery.getOneSolution(req.conn, {
			solution_nickname: req.params.solution_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// identify the fields that will be edited.
		var fieldsToEdit = {};
		[
			{ key: 'name',             critical: false },
			{ key: 'language',         critical: true  },
			{ key: 'expected_verdict', critical: true  },
			{ key: 'source_code',      critical: true  }
		].forEach(param => {
			if(req.body[param.key] !== undefined) {
				fieldsToEdit[param.key] = req.body[param.key];

				if(param.critical) {
					fieldsToEdit['last_edit'] = new Date();
				}
			}
		});

		// edit the solution.
		await utilQuery.edit(req.conn, 'solution', fieldsToEdit, {
			id: solution.id
		});

		// get the solution updated.
		solution = await solutionQuery.getOneSolution(req.conn, {
			solution_id: solution.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// return it.
		return res.json({
			success:  true,
			solution: solution
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
 * Disable a solution.
 */
async function removeSolution(req, res, next) {
	await utilQuery.beginTransaction(req.conn);
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(req.conn, {
			problem_nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// get the solution.
		var solution = await solutionQuery.getOneSolution(req.conn, {
			solution_nickname: req.params.solution_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// remove the solution.
		await utilQuery.edit(req.conn, 'solution', {
			deleted_at: new Date()
		}, {
			id: solution.id
		});

		// reorder the solutions accordingly.
		var remainingSolutions = await solutionQuery.getSolutions(req.conn, {
			problem_id: problem.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);
		for(var index=0; index<remainingSolutions.length; index++) {
			var remainingSolution = remainingSolutions[index];

			if(remainingSolution.order > solution.order) {
				await utilQuery.edit(req.conn, 'solution', {
					order: remainingSolution.order - 1
				}, {
					id: remainingSolution.id
				});
			}
		}
		await utilQuery.commit(req.conn);

		// get the solution updated.
		solution = await solutionQuery.getOneSolution(req.conn, {
			solution_id: solution.id,
			deleted_at: {
				$isNull: false
			}
		}, req.user);

		// return it.
		return res.json({
			success:  true,
			solution: solution
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

router.route('/contest/:nickname/problem/:problem_nickname/solution')
    .post(createSolution);

router.route('/contest/:nickname/problem/:problem_nickname/solution/:solution_nickname')
    .put(editSolution)
    .delete(removeSolution);

module.exports = router;
