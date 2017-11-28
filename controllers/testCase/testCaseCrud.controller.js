'use strict';

var express       = require('express'),
	utilQuery     = require('../../queries/util.query'),
	contestQuery  = require('../../queries/contest.query'),
	problemQuery  = require('../../queries/problem.query'),
	testCaseQuery = require('../../queries/testCase.query'),
    aws           = require('../../libraries/aws.lib'),
    fileLib       = require('../../libraries/file.lib'),
	utilLib       = require('../../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a test case.
 */
async function createTestCase(conn, req, res, next) {
	await utilQuery.beginTransaction(conn);
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
			input:          req.body.input,
			output:         req.body.output,
			input_file_id:  req.body.input_file_id,
			output_file_id: req.body.output_file_id,
			input_text_id:  null,
			output_text_id: null,
			order:          currentTestCasesCount.count + 1,
			last_edit:      new Date(),
			author_id:      req.user._id,
			problem_id:     problem.id
		};

		// large input.
		if(req.body.input_file_id && req.body.input_large) {
			var file = await utilQuery.selectOne(conn, '*', 'file', [], {
				id: req.body.input_file_id
			});

			var inputFile = await aws.s3downloadFile(
                fileLib.replacePathWithParams('testCaseTempFile', {
                    contest_nickname: contest.nickname,
                    problem_nickname: problem.nickname,
                    file_name:        file.name
                }),
                file.version_id
            );

            var textInsertResult = await utilQuery.insert(conn, 'text', {
            	text: inputFile.Body
            });

            newTestCase.input_text_id = textInsertResult.insertId;
		}

		// large output.
		if(req.body.output_file_id && req.body.output_large) {
			var file = await utilQuery.selectOne(conn, '*', 'file', [], {
				id: req.body.output_file_id
			});

			var outputFile = await aws.s3downloadFile(
                fileLib.replacePathWithParams('testCaseTempFile', {
                    contest_nickname: contest.nickname,
                    problem_nickname: problem.nickname,
                    file_name:        newTestCase.output_file_id
                }),
                file.version_id
            );

            var textInsertResult = await utilQuery.insert(conn, 'text', {
            	text: outputFile.Body
            });

            newTestCase.output_text_id = textInsertResult.insertId;
		}

		// insert the test case.
		var insertResult = await utilQuery.insert(conn, 'test_case', newTestCase);

		// commit it all.
		await utilQuery.commit(conn);

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
		await utilQuery.rollback(conn);

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
			{ key: 'input',       critical: true },
			{ key: 'output',      critical: true },
			{ key: 'input_file',  critical: true },
			{ key: 'output_file', critical: true }
		].forEach(param => {
			if(req.body[param.key] !== undefined) {
				fieldsToEdit[param.key] = req.body[param.key];

				if(param.critical) {
					fieldsToEdit['last_edit'] = new Date();
				}
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
