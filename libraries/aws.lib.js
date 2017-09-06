'use strict';

var AWS    = require('aws-sdk'),
	config = require('../config');


// main configuration
AWS.config = new AWS.Config({
	accessKeyId:     config.AWS.accessKeyId,
	secretAccessKey: config.AWS.secretAccessKey,
	region:          config.AWS.region
});

// simple email service
var ses = new AWS.SES({
	apiVersion: '2010-12-01'
});


module.exports = {
	ses: ses
};
