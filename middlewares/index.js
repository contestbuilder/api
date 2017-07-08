var express = require('express');

module.exports = function(wagner, baseUrl) {
	var api = express.Router();

	api.use(require('./auth')(wagner, baseUrl));

	return api;
};