'use strict';

var express       = require('express'),
	utilQuery     = require('../queries/util.query'),
	contestQuery  = require('../queries/contest.query'),
	problemQuery  = require('../queries/problem.query'),
	solutionQuery = require('../queries/solution.query'),
	testCaseQuery = require('../queries/testCase.query'),
	utilLib       = require('../libraries/util.lib'),
	runLib        = require('../libraries/run.lib');


/**
 * Controllers
 */

/**
 * Create a solution.
 */
async function runSolutions(conn, req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// get the problem.
		var problem = await problemQuery.getOneProblem(conn, {
			problem_nickname: req.params.problem_nickname
		}, req.user);

		// count how many runs were made for this solution.
		var highestRunNumber = await problemQuery.getHighestSolutionRunNumber(conn, {
			problem_id: problem.id
		}, req.user);

		// get the solutions to be run.
		var solutions = [];
		for(var solutionIndex=0; solutionIndex<req.body.solutions.length; solutionIndex++) {
			var solution = await solutionQuery.getOneSolution(conn, {
				solution_nickname: req.body.solutions[solutionIndex]
			}, req.user);

			solutions.push(solution);
		}

		// get the test cases to be run.
		var testCases = [];
		for(var testCaseIndex=0; testCaseIndex<req.body.test_cases.length; testCaseIndex++) {
			var testCase = await testCaseQuery.getOneTestCase(conn, {
				test_case_id: req.body.test_cases[testCaseIndex]
			}, req.user);

			if(testCase.input_text_id) {
				var text = await utilQuery.selectOne(conn, '*', 'text', null, {
					id: testCase.input_text_id
				});

				testCase.input = text.text;
			}

			if(testCase.output_text_id) {
				var text = await utilQuery.selectOne(conn, '*', 'text', null, {
					id: testCase.output_text_id
				});

				testCase.output = text.text;
			}

			testCases.push(testCase);
		}

		// run it all.
		var results = [];
		for(var solutionIndex=0; solutionIndex<solutions.length; solutionIndex++) {
			var solution = solutions[solutionIndex];

			for(var testCaseIndex=0; testCaseIndex<testCases.length; testCaseIndex++) {
				var testCase = testCases[testCaseIndex];

				results.push(await runLib.run(
                    solution.source_code,
                    solution.language,
                    problem.time_limit,
                    testCase.input,
                    testCase.output,
                    {
                        solution: solution,
                        testCase: testCase
                    }
                ));
			}
		}

		// save runs.
		for(var resultIndex=0; resultIndex<results.length; resultIndex++) {
			var result = results[resultIndex];

			var solutionRun = {
				number:       (highestRunNumber.highest_run_number || 0) + 1,
				solution_id:  result.context.solution.id,
				test_case_id: result.context.testCase.id,
				duration:     result.duration || 0,
				success:      result.success,
				verdict:      result.verdict,
				timestamp:    new Date()
			};

			if(result.success) {
				if((result.output || '').length <= 1024) {
					solutionRun.output = (result.output || '');
				} else {
					solutionRun.output = result.output.substr(0, 1024);

					var textInsertResult = await utilQuery.insert(conn, 'text', {
		            	text: result.output
		            });
					result.output = solutionRun.output;

		            solutionRun.output_text_id = textInsertResult.insertId;
				}
			} else {
				solutionRun.output = (result.err || '').substr(0, 1024);
			}

			await utilQuery.insert(conn, 'solution_run', solutionRun);

			delete result.context;
		}

		// return it.
		return res.json({
			success: true,
			results: results
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

router.route('/contest/:contest_nickname/problem/:problem_nickname/run/solutions')
    .post(global.poolConnection.bind(null, runSolutions));

// router.route('/contest/:contest_nickname/problem/:problem_nickname/run/checkers')
//     .post(runCheckers);

module.exports = router;
