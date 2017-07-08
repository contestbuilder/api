'use strict';

var config = require('../config.js'),
	env    = JSON.parse(JSON.stringify(process.env));

Object.keys(config).forEach(function(configKey) {
	env[configKey] = config[configKey];
});

module.exports = {
	env: env
};
