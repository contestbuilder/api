'use strict';

var bodyparser = require('body-parser'),
    status     = require('http-status'),
    express    = require('express');

var api = express.Router();

api.use(bodyparser.json());

// crud
// api.use(require('./user.controller'));
api.use(require('./contest.controller'));
// api.use(require('./contributor.controller'));
api.use(require('./problem/problemCrud.controller'));
// api.use(require('./problem/problemFile.controller'));
api.use(require('./solution.controller'));
// api.use(require('./checker.controller'));
// api.use(require('./testCase/testCaseCrud.controller'));
// api.use(require('./testCase/testCaseFile.controller'));
// api.use(require('./log.controller'));
// api.use(require('./email.controller'));
// api.use(require('./boca.controller'));

// run
// api.use(require('./run.controller'));

// graphql
api.use(require('./graphql.controller'));

// route not found.
api.use(function(req, res, next) {
	return next({
		status: status.NOT_FOUND,
		error:  'Url not found.'
	});
});

// error handling.
api.use(function(err, req, res, next) {
	return res.status(err.status || 500)
	.json({
		error: err.error
	});
});

module.exports = api;
