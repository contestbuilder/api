'use strict';

var express = require('express'),
	graphql = require('graphql'),
	schemas = require('../schemas');


function query(req, res) {
	console.log(req.user);
	graphql.graphql(schemas, req.body.query, req.body.variables || {}, { args: req.user }, { a: 3 })
	.then(result => {
		res.json(result);
	});
}



/**
 * Routes
 */

var router = express.Router();

router.route('/graphql')
	.post(query);

module.exports = router;
