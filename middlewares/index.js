'use strict';

var express = require('express');

module.exports = function(baseUrl) {
	var api = express.Router();

	api.use(require('./database'));
	api.use(require('./auth')(baseUrl));

	return api;
};