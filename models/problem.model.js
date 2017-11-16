'use strict';

var mongoose      = require('mongoose'),
    problemSchema = require('../schemas/problem.schema');

var max_characters_for_input = 100;

function getNickname(name) {
	return name.replace(/\s/g, '_').toLowerCase();
}

problemSchema.pre('save', function(next) {
    var _problem = this;

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

    next();
});

module.exports = mongoose.model('Problem', problemSchema, 'problems');
