'use strict';

var express       = require('express'),
	utilQuery     = require('../../queries/util.query'),
	contestQuery  = require('../../queries/contest.query'),
	problemQuery  = require('../../queries/problem.query'),
	testCaseQuery = require('../../queries/testCase.query'),
	utilLib       = require('../../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a test case.
 */
async function createTestCase(conn, req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(conn, {
			problem_nickname: req.params.problem_nickname
		}, req.user);

		// count how many active test cases there are for this problem.
		var currentTestCasesCount = await problemQuery.countTestCases(conn, {
			contest_id: contest.id,
			problem_id: problem.id
		}, req.user);

		// new test case object.
		var newTestCase = {
			input:       req.body.input,
			output:      req.body.output,
			input_file:  req.body.input_file,
			output_file: req.body.output_file,
			order:       currentTestCasesCount.count + 1,
			author_id:   req.user._id,
			problem_id:  problem.id
		};

		// insert the test case.
		var insertResult = await utilQuery.insert(conn, 'test_case', newTestCase);

		// get the inserted test case.
		newTestCase = await testCaseQuery.getOneTestCase(conn, {
			test_case_id: insertResult.insertId
		}, req.user);

		// return it.
		return res.json({
			success:   true,
			test_case: newTestCase
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
 * Edit a test case.
 */
async function editTestCase(conn, req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(conn, {
			problem_nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// get the test case.
		var test_case = await testCaseQuery.getOneTestCase(conn, {
			test_case_id: +req.params.test_case_id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// identify the fields that will be edited.
		var fieldsToEdit = {};
		[
			'input', 'output', 
			'input_file', 'output_file'
		].forEach(paramName => {
			if(req.body[paramName] !== undefined) {
				fieldsToEdit[paramName] = req.body[paramName];
			}
		});

		// edit the test_case.
		await utilQuery.edit(conn, 'test_case', fieldsToEdit, {
			id: test_case.id
		});

		// get the test_case updated.
		test_case = await testCaseQuery.getOneTestCase(conn, {
			test_case_id: test_case.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// return it.
		return res.json({
			success:   true,
			test_case: test_case
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
 * Disable a test case.
 */
async function removeTestCase(conn, req, res, next) {
	await utilQuery.beginTransaction(conn);
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(conn, {
			problem_nickname: req.params.problem_nickname,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// get the test case.
		var test_case = await testCaseQuery.getOneTestCase(conn, {
			test_case_id: req.params.test_case_id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// remove the test case.
		await utilQuery.edit(conn, 'test_case', {
			deleted_at: new Date()
		}, {
			id: test_case.id
		});

		// reorder the test cases accordingly.
		var remainingTestCases = await testCaseQuery.getTestCases(conn, {
			problem_id: problem.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);
		for(var index=0; index<remainingTestCases.length; index++) {
			var remainingTestCase = remainingTestCases[index];

			if(remainingTestCase.order > solution.order) {
				await utilQuery.edit(conn, 'test_case', {
					order: remainingTestCase.order - 1
				}, {
					id: remainingTestCase.id
				});
			}
		}
		await utilQuery.commit(conn);

		// get the test case updated.
		test_case = await testCaseQuery.getOneTestCase(conn, {
			test_case_id: test_case.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// return it.
		return res.json({
			success:   true,
			test_case: test_case
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

router.route('/contest/:nickname/problem/:problem_nickname/test_case')
    .post(global.poolConnection.bind(null, createTestCase));

router.route('/contest/:nickname/problem/:problem_nickname/test_case/:test_case_id')
    .put(global.poolConnection.bind(null, editTestCase))
    .delete(global.poolConnection.bind(null, removeTestCase));

module.exports = router;
