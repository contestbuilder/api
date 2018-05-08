'use strict';

var express       = require('express'),
	utilQuery     = require('../queries/util.query'),
	contestQuery  = require('../queries/contest.query'),
	problemQuery  = require('../queries/problem.query'),
	testCaseQuery = require('../queries/testCase.query'),
    aws           = require('../libraries/aws.lib'),
    fileLib       = require('../libraries/file.lib'),
	utilLib       = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a test case.
 */
async function createTestCase(req, res, next) {
	await utilQuery.beginTransaction(req.conn);
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(req.conn, {
			problem_nickname: req.params.problem_nickname
		}, req.user);

		// count how many active test cases there are for this problem.
		var currentTestCasesCount = await problemQuery.countTestCases(req.conn, {
			contest_id: contest.id,
			problem_id: problem.id
		}, req.user);

		// new test case object.
		var newTestCase = {
			input:          req.body.input,
			output:         req.body.output,
			input_file_id:  null,
			output_file_id: null,
			input_text_id:  null,
			output_text_id: null,
			order:          currentTestCasesCount.count + 1,
			last_edit:      new Date(),
			author_id:      req.user.id,
			problem_id:     problem.id
		};

		// input file.
		if(req.body.input_file && req.body.input_file.name && req.body.input_file.path) {
	        var insertFileResult = await utilQuery.insert(req.conn, 'file', {
	            name: req.body.input_file.name,
	            path: req.body.input_file.path
	        });

	        newTestCase.input_file_id = insertFileResult.insertId;

	        // large input file.
			if(req.body.input_large) {
				var inputFile = await aws.s3downloadFile(req.body.input_file.path);

	            var textInsertResult = await utilQuery.insert(req.conn, 'text', {
	            	text: inputFile.Body
	            });

	            newTestCase.input_text_id = textInsertResult.insertId;
			}
		}

		// output file.
		if(req.body.output_file && req.body.output_file.name && req.body.output_file.path) {
	        var insertFileResult = await utilQuery.insert(req.conn, 'file', {
	            name: req.body.output_file.name,
	            path: req.body.output_file.path
	        });

	        newTestCase.output_file_id = insertFileResult.insertId;

	        // large input file.
			if(req.body.output_large) {
				var outputFile = await aws.s3downloadFile(req.body.output_file.path);

	            var textInsertResult = await utilQuery.insert(req.conn, 'text', {
	            	text: outputFile.Body
	            });

	            newTestCase.output_text_id = textInsertResult.insertId;
			}
		}

		// insert the test case.
		var insertResult = await utilQuery.insert(req.conn, 'test_case', newTestCase);

		// commit it all.
		await utilQuery.commit(req.conn);

		// get the inserted test case.
		newTestCase = await testCaseQuery.getOneTestCase(req.conn, {
			test_case_id: insertResult.insertId
		}, req.user);

		// return it.
		return res.json({
			success:   true,
			test_case: newTestCase
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
 * Edit a test case.
 */
async function editTestCase(req, res, next) {
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

		// get the test case.
		var test_case = await testCaseQuery.getOneTestCase(req.conn, {
			test_case_id: +req.params.test_case_id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// identify the fields that will be edited.
		var fieldsToEdit = {};
		[
			{ key: 'input',  critical: true },
			{ key: 'output', critical: true }
		].forEach(param => {
			if(req.body[param.key] !== undefined) {
				fieldsToEdit[param.key] = req.body[param.key];

				if(param.critical) {
					fieldsToEdit['last_edit'] = new Date();
				}
			}
		});

		// input file.
		if(req.body.input_file && req.body.input_file.name && req.body.input_file.path) {
			// if it's the old file, then there's no need to update it.
			if(req.body.input_file.id && req.body.input_file.id === test_case.input_file_id) {
			}
			// otherwise, update the file.
			else {
		        var insertFileResult = await utilQuery.insert(req.conn, 'file', {
		            name: req.body.input_file.name,
		            path: req.body.input_file.path
		        });

				fieldsToEdit['input_file_id'] = insertFileResult.insertId;
				fieldsToEdit['last_edit'] = new Date();

		        // large input file.
				if(req.body.input_large) {
					var inputFile = await aws.s3downloadFile(req.body.input_file.path);

		            var textInsertResult = await utilQuery.insert(req.conn, 'text', {
		            	text: inputFile.Body
		            });

					fieldsToEdit['input_text_id'] = textInsertResult.insertId;
				}
			}
		}
		if(test_case.input_file_id && !req.body.input_file) {
			fieldsToEdit['input_file_id'] = null;
		}
		if(test_case.input_text_id && !req.body.input_large) {
			fieldsToEdit['input_text_id'] = null;
		}

		// output file.
		if(req.body.output_file && req.body.output_file.name && req.body.output_file.path) {
			// if it's the old file, then there's no need to update it.
			if(req.body.output_file.id && req.body.output_file.id === test_case.output_file_id) {
			}
			// otherwise, update the file.
			else {
		        var insertFileResult = await utilQuery.insert(req.conn, 'file', {
		            name: req.body.output_file.name,
		            path: req.body.output_file.path
		        });

				fieldsToEdit['output_file_id'] = insertFileResult.insertId;
				fieldsToEdit['last_edit'] = new Date();

		        // large input file.
				if(req.body.output_large) {
					var outputFile = await aws.s3downloadFile(req.body.output_file.path);

		            var textInsertResult = await utilQuery.insert(req.conn, 'text', {
		            	text: outputFile.Body
		            });

					fieldsToEdit['output_text_id'] = textInsertResult.insertId;
				}
			}
		}
		if(test_case.output_file_id && !req.body.output_file) {
			fieldsToEdit['output_file_id'] = null;
		}
		if(test_case.output_text_id && !req.body.output_large) {
			fieldsToEdit['output_text_id'] = null;
		}

		// edit the test_case.
		await utilQuery.edit(req.conn, 'test_case', fieldsToEdit, {
			id: test_case.id
		});

		// get the test_case updated.
		test_case = await testCaseQuery.getOneTestCase(req.conn, {
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
		return next();
	}
}

/**
 * Disable a test case.
 */
async function removeTestCase(req, res, next) {
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

		// get the test case.
		var test_case = await testCaseQuery.getOneTestCase(req.conn, {
			test_case_id: +req.params.test_case_id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);

		// remove the test case.
		await utilQuery.edit(req.conn, 'test_case', {
			deleted_at: new Date()
		}, {
			id: test_case.id
		});

		// reorder the test cases accordingly.
		var remainingTestCases = await testCaseQuery.getTestCases(req.conn, {
			problem_id: problem.id,
			deleted_at: {
				$isNull: true
			}
		}, req.user);
		for(var index=0; index<remainingTestCases.length; index++) {
			var remainingTestCase = remainingTestCases[index];

			if(remainingTestCase.order > test_case.order) {
				await utilQuery.edit(req.conn, 'test_case', {
					order: remainingTestCase.order - 1
				}, {
					id: remainingTestCase.id
				});
			}
		}
		await utilQuery.commit(req.conn);

		// get the test case updated.
		test_case = await testCaseQuery.getOneTestCase(req.conn, {
			test_case_id: test_case.id,
			deleted_at: {
				$isNull: false
			}
		}, req.user);

		// return it.
		return res.json({
			success:   true,
			test_case: test_case
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

router.route('/contest/:nickname/problem/:problem_nickname/test_case')
    .post(createTestCase);

router.route('/contest/:nickname/problem/:problem_nickname/test_case/:test_case_id')
    .put(editTestCase)
    .delete(removeTestCase);

module.exports = router;