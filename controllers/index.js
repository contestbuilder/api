'use strict';

var bodyparser = require('body-parser'),
    status     = require('http-status'),
    express    = require('express');

var api = express.Router();

api.use(bodyparser.json());

// crud
// api.use(require('./user.controller'));
// api.use(require('./contest.controller'));
// api.use(require('./contributor.controller'));
// api.use(require('./problem/problemCrud.controller'));
// api.use(require('./problem/problemFile.controller'));
// api.use(require('./solution.controller'));
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

api.use(function(req, res) {
    return res
        .status(status.NOT_FOUND)
        .json({ error: 'Url not found' });
});

module.exports = api;
