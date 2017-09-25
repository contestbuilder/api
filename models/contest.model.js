'use strict';

var mongoose      = require('mongoose'),
    contestSchema = require('../schemas/contest.schema');

var max_characters_for_input = 100;

function getNickname(name) {
	return name.replace(/\s/g, '_').toLowerCase();
}

contestSchema.pre('save', function(next) {
	var _contest = this;
    // generate contest nickname.
    if(!_contest.nickname) {
        _contest.nickname = getNickname(_contest.name);
    }

    if(Array.isArray(_contest.problems)) {
    	_contest.problems.forEach(function(_problem) {
            // generate problem nickname.
    		if(!_problem.nickname) {
    			_problem.nickname = getNickname(_problem.name);
    		}

            if(Array.isArray(_problem.solutions)) {
                _problem.solutions.forEach(function(_solution) {
                    // generate solution nickname.
                    if(!_solution.nickname) {
                        _solution.nickname = getNickname(_solution.name);
                    }
                });
            }

            if(Array.isArray(_problem.checkers)) {
                _problem.checkers.forEach(function(_checker) {
                    // generate checker nickname.
                    if(!_checker.nickname) {
                        _checker.nickname = getNickname(_checker.name);
                    }
                });
            }

            if(Array.isArray(_problem.test_cases)) {
                _problem.test_cases.forEach(function(_test_case) {
                    if(Array.isArray(_test_case.v)) {
                        // generate samples for input and output.
                        _test_case.v.forEach(function(_v) {
                            if(_v.input) {
                                _v.sample_input = _v.input.substr(0, max_characters_for_input);
                                _v.large_input = _v.input.length > max_characters_for_input;
                            }

                            if(_v.output) {
                                _v.sample_output = _v.output.substr(0, max_characters_for_input);
                                _v.large_output = _v.output.length > max_characters_for_input;
                            }
                        });
                    }
                });
            }
    	});
    }

    next();
});

module.exports = mongoose.model('Contest', contestSchema, 'contests');
