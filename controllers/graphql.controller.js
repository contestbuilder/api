'use strict';

var express        = require('express'),
	graphql        = require('graphql'),
	expressGraphql = require('express-graphql'),
	schemas        = require('../schemas');


function query(req, res, next) {
	try {
		graphql.graphql(
			schemas,
			req.body.query,
			null,
			{
				conn: req.conn,
				user: req.user
			},
			req.body.variables || {}
		).then(result => {
			res.json(result);

			return next();
		});
	} catch(err) {
		return next({
			success: false,
			error:   err
		});
	}
}

// https://github.com/graphql/express-graphql/issues/279
const stream = require('stream');
function graphqlMiddlewareWrapper(graphqlMiddleware) {
    return (req, res, next) => {
        const resProxy = new stream.PassThrough();
        resProxy.headers = new Map();
        resProxy.statusCode = 200;
        resProxy.setHeader = (name, value) => {
            resProxy.headers.set(name, value);
        };
        res.graphqlResponse = (cb) => {
            res.statusCode = resProxy.statusCode;
            resProxy.headers.forEach((value, name) => {
                res.setHeader(name, value);
            });
            resProxy.pipe(res).on('finish', cb);
        };
        graphqlMiddleware(req, resProxy).then(() => next(), next);
    };
}



/**
 * Routes
 */

var router = express.Router();

router.route('/graphql')
	.post(query);

router.use('/graphqli',
    graphqlMiddlewareWrapper(expressGraphql({
		schema:   schemas,
		graphiql: true
	})),
    (req, res, next) => {
        res.graphqlResponse(next);
    },
    (err, req, res, next) => {
        res.status(500).end(err.message);
        next();
    }
);

module.exports = router;
