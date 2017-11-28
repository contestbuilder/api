'use strict';

var fs     = require('fs'),
	AWS    = require('aws-sdk'),
	config = require('../config');


// main configuration
AWS.config = new AWS.Config({
	accessKeyId:     config.AWS.accessKeyId,
	secretAccessKey: config.AWS.secretAccessKey
});

// simple email service
var ses = new AWS.SES({
	apiVersion: '2010-12-01',
	region:     config.AWS.SES.region
});

// simple storage service
var s3 = new AWS.S3({
	apiVersion: '2006-03-01',
	region:     config.AWS.S3.region,
	params: {
		Bucket: config.AWS.S3.bucket
	}
});


// useful functions
function s3downloadFile(s3Path, VersionId) {
	return new Promise(function(resolve, reject) {
		s3.getObject({
			Key:       s3Path,
			VersionId: VersionId
		}, function(err, data) {
			if(err) {
				return reject(err);
			}

			return resolve(data);
		});
	});
}

function s3uploadFile(s3Path, filePath) {
	return new Promise(function(resolve, reject) {
		s3.upload({
			Key:  s3Path,
			Body: fs.createReadStream(filePath, {})
		}, function(err, data) {
			if(err) {
				return reject(err);
			}

			return resolve(data);
		});
	});
}

function s3removeFile(s3Path, VersionId) {
	return new Promise(function(resolve, reject) {
		s3.deleteObject({
			Key:       s3Path,
			VersionId: VersionId
		}, function(err, data) {
			if(err) {
				return reject(err);
			}

			return resolve(data);
		});
	});
}

function s3headObject(s3Path) {
	return new Promise(function(resolve, reject) {
		s3.headObject({
			Key: s3Path
		}, function(err, data) {
			if(err) {
				return reject(err);
			}

			return resolve(data);
		});
	});
}


module.exports = {
	ses: ses,

	s3:             s3,
	s3downloadFile: s3downloadFile,
	s3uploadFile:   s3uploadFile,
	s3removeFile:   s3removeFile,
	s3headObject:   s3headObject
};
