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
			req.body.variables || {},
			{
				conn: conn,
				user: req.user
			}
		).then(result => {
			res.json(result);
		}).catch(err => {
			res.json({
				success: false,
				error:   err
			});
		});
	} catch(err) {
		return next({
			error: err
		});
	}
}

function expressGraphqlQuery(req, res, next) {
	try {
		return expressGraphql({
			schema:   schemas,
			context:  req,
			graphiql: true
		})(req, res, next);
	} catch(err) {
		return next({
			error: err
		});
	} finally {
		// next();
	}
}

function whatever(req, res, next) {
	res.json({ ok: 1 });
	next();
}



/**
 * Routes
 */

var router = express.Router();

router.route('/graphql')
	.post(query);

router.route('/graphqli')
	.get(expressGraphqlQuery)
	.post(expressGraphqlQuery);

router.get('/whatever', whatever);

module.exports = router;
