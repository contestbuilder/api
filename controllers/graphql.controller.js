'use strict';

var express = require('express'),
	graphql = require('graphql'),
	schemas = require('../schemas');


function query(conn, req, res, next) {
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
	});
}



/**
 * Routes
 */

var router = express.Router();

router.route('/graphql')
	.post(global.poolConnection.bind(null, query));

module.exports = router;
