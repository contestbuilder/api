'use strict';

var aws = require('./aws.lib'),
	s3  = aws.s3;

var filePaths = [{
	key:    'problemDescription',
	path:   'contests/:contest_nickname/:problem_nickname/:file_name',
	params: [{
		key: 'contest_nickname'
	}, {
		key: 'problem_nickname'
	}, {
		key: 'file_name'
	}]
}];


function getSignedDownloadUrl(key, params) {
	var filePath = filePaths.filter(function(filePath) {
		return filePath.key === key;
	})[0];
	if(!filePath) {
		throw new Error('Invalid file path key.');
	}

	if(!filePath.params.every(function(param) {
		return !!params[param.key];
	})) {
		throw new Error('Mising parameters.');
	}

    var signedUrl = s3.getSignedUrl('getObject', {
        Key:     replacePathWithParams(filePath, params),
        Expires: 600
    });

    return signedUrl;
}

function getSignedUploadUrl(key, params) {
	var filePath = filePaths.filter(function(filePath) {
		return filePath.key === key;
	})[0];
	if(!filePath) {
		throw new Error('Invalid file path key.');
	}

	if(!filePath.params.every(function(param) {
		return !!params[param.key];
	})) {
		throw new Error('Mising parameters.');
	}

    var path = replacePathWithParams(filePath, params);
    var signedUrl = s3.createPresignedPost({
        Expires: 600,
        Fields:  {
            key: path
        }
    });
    signedUrl.key = path;

    return signedUrl;
}

function removeFile(key, params) {
	var filePath = filePaths.filter(function(filePath) {
		return filePath.key === key;
	})[0];
	if(!filePath) {
		throw new Error('Invalid file path key.');
	}

	if(!filePath.params.every(function(param) {
		return !!params[param.key];
	})) {
		throw new Error('Mising parameters.');
	}

    return aws.s3removeFile(
    	replacePathWithParams(filePath, params)
    );
}

function replacePathWithParams(filePath, params) {
	var path = filePath.path;
	filePath.params.forEach(function(param) {
		path = path.replace(':' + param.key, params[param.key]);
	});
	return path;
}


module.exports = {
	getSignedDownloadUrl: getSignedDownloadUrl,
	getSignedUploadUrl:   getSignedUploadUrl,
	removeFile:           removeFile
};
