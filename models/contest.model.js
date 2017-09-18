'use strict';

var mongoose      = require('mongoose'),
    contestSchema = require('../schemas/contest.schema');

function getNickname(name) {
	return name.replace(/\s/g, '_').toLowerCase();
}

contestSchema.pre('save', function(next) {
	var _contest = this;
    if(!_contest.nickname) {
        _contest.nickname = getNickname(_contest.name);
    }

    if(Array.isArray(_contest.problems)) {
    	_contest.problems.forEach(function(_problem) {
    		if(!_problem.nickname) {
    			_problem.nickname = getNickname(_problem.name);
    		}

            if(Array.isArray(_problem.solutions)) {
                _problem.solutions.forEach(function(_solution) {
                    if(!_solution.nickname) {
                        _solution.nickname = getNickname(_solution.name);
                    }
                });
            }

            if(Array.isArray(_problem.checkers)) {
                _problem.checkers.forEach(function(_checker) {
                    if(!_checker.nickname) {
                        _checker.nickname = getNickname(_checker.name);
                    }
                });
            }
    	});
    }

    next();
});

module.exports = mongoose.model('Contest', contestSchema, 'contests');
