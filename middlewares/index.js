'use strict';

var express = require('express');

module.exports = function(baseUrl) {
	var api = express.Router();

	api.use(require('./auth')(baseUrl));
	api.use(require('./database'));

	return api;
};