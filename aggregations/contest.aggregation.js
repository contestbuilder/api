'use strict';


function filterOnlyLastVersions(contestMatch, problemMatch, solutionMatch, testCaseMatch, checkerMatch, opt) {
	opt = opt || {};

	// hides the test cases input/output fields, unless it is specified to include.
	var testCaseProject = {
		'problems.test_cases.v': false
	};
	if(!opt.show_test_case_input) {
		testCaseProject['problems.test_cases.current.input'] = false;
	}
	if(!opt.show_test_case_output) {
		testCaseProject['problems.test_cases.current.output'] = false;
	}

	return [
		// filter contests
		{
			$match: contestMatch || {}
		},

		// lookup problems
		{
			$unwind: {
				path:                       '$problems',
				preserveNullAndEmptyArrays: true
			}
		}, {
			$lookup: {
				from:         'problems',
				localField:   'problems',
				foreignField: '_id',
				as:           'problems'
			}
		}, {
			$addFields: {
				problems: {
					$arrayElemAt: [ '$problems', 0 ]
				}
			}
		},

		// filter problems
		{
			$addFields: {
				'problems.current': {
					$arrayElemAt: [ '$problems.v', -1 ]
				}
			}
		}, {
			$project: {
				'problems.v': false
			}
		}, {
			$match: problemMatch || {}
		},

		// unwind and filter test_cases
		{
			$unwind: {
				path:                       '$problems.test_cases',
				preserveNullAndEmptyArrays: true
			}
		}, {
			$addFields: {
				'problems.test_cases.current': {
					$arrayElemAt: [ '$problems.test_cases.v', -1 ]
				}
			}
		}, {
			$project: testCaseProject
		}, {
			$match: testCaseMatch || {}
		},

		// unwind and filter solutions
		{
			$unwind: {
				path:                       '$problems.solutions',
				preserveNullAndEmptyArrays: true
			}
		}, {
			$addFields: {
				'problems.solutions.current': {
					$arrayElemAt: [ '$problems.solutions.v', -1 ]
				}
			}
		}, {
			$project: {
				'problems.solutions.v': false
			}
		}, {
			$match: solutionMatch || {}
		},

		// unwind and filter checkers
		{
			$unwind: {
				path:                       '$problems.checkers',
				preserveNullAndEmptyArrays: true
			}
		}, {
			$addFields: {
				'problems.checkers.current': {
					$arrayElemAt: [ '$problems.checkers.v', -1 ]
				}
			}
		}, {
			$project: {
				'problems.checkers.v': false
			}
		}, {
			$match: checkerMatch || {}
		},

		// group it all
		{
			$group: {
				_id: {
					contest_id: '$_id',
					problem_id: '$problems._id'
				},
				problems: {
					$first: '$problems'
				},
				problems_test_cases: {
					$addToSet: '$problems.test_cases'
				},
				problems_solutions: {
					$addToSet: '$problems.solutions'
				},
				problems_checkers: {
					$addToSet: '$problems.checkers'
				},
				allFields: {
					$first: '$$ROOT'
				}
			}
		}, {
			$addFields: {
				'problems.test_cases': {
					$cond: {
						if: {
							$eq: [ '$problems_test_cases', [ { current: null } ] ]
						},
						then: [],
						else: '$problems_test_cases'
					}
				},
				'problems.solutions': {
					$cond: {
						if: {
							$eq: [ '$problems_solutions', [ { current: null } ] ]
						},
						then: [],
						else: '$problems_solutions'
					}
				},
				'problems.checkers': {
					$cond: {
						if: {
							$eq: [ '$problems_checkers', [ { current: null } ] ]
						},
						then: [],
						else: '$problems_checkers'
					}
				}
			}
		}, {
			$project: {
				'problems_test_cases': false,
				'problems_solutions':  false,
				'problems_checkers':   false
			}
		}, {
			$group: {
				_id: '$_id.contest_id',
				problems: {
					$push: '$problems'
				},
				allFields: {
					$first: '$allFields'
				}
			}
		}, {
			$addFields: {
				'allFields.problems': '$problems'
			}
		}, {
			$replaceRoot: {
				newRoot: '$allFields'
			}
		}, {
			$addFields: {
				'problems': {
					$filter: {
						input: '$problems',
						as:    'problem',
						cond: {
							$ne: [ '$$problem.current', null ]
						}
					}
				}
			}
		}
	];
}

var populateAuthorAndContributors = [
	// lookup author
	{
		$lookup: {
			from:         'users',
			localField:   'author',
			foreignField: '_id',
			as:           'author'
		}
	}, {
		$addFields: {
			author: {
				$arrayElemAt: [ '$author', 0 ]
			}
		}
	},

	// lookup contributors
	{
		$unwind: {
			path:                       '$contributors',
			preserveNullAndEmptyArrays: true
		}
	}, {
		$lookup: {
			from:         'users',
			localField:   'contributors',
			foreignField: '_id',
			as:           'contributors'
		}
	}, {
		$addFields: {
			contributors: {
				$arrayElemAt: [ '$contributors', 0 ]
			}
		}
	},

	// group it all
	{
		$group: {
			_id: '$_id',
			contributors: {
				$push: '$contributors'
			},
			allFields: {
				$first: '$$ROOT'
			}
		}
	}, {
		$addFields: {
			'allFields.contributors': '$contributors'
		}
	}, {
		$replaceRoot: {
			newRoot: '$allFields'
		}
	},

	// hide password and other data
	{
		$project: {
			'author.password':       false,
			'contributors.password': false
		}
	}
];


module.exports = {
	filterOnlyLastVersions: filterOnlyLastVersions,

	populateAuthorAndContributors: populateAuthorAndContributors
};
