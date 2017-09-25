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
}, {
	key:    'bocaZip',
	path:   'contests/:contest_nickname/:contest_nickname.zip',
	params: [{
		key: 'contest_nickname'
	}]
}, {
	key:    'testCaseTempFile',
	path:   'contests/:contest_nickname/:problem_nickname/test_cases/:file_name',
	params: [{
		key: 'contest_nickname'
	}, {
		key: 'problem_nickname'
	}, {
		key: 'file_name'
	}]
}];


function getSignedDownloadUrl(key, params, opt) {
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


	var signParamObj = {
        Key:     replacePathWithParams(key, params),
        Expires: 600
	};

	opt = opt || {};
	if(opt.VersionId) {
		signParamObj.VersionId = opt.VersionId;
	}

    return s3.getSignedUrl('getObject', signParamObj);
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

    var path = replacePathWithParams(key, params);
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
    	replacePathWithParams(key, params)
    );
}

function replacePathWithParams(key, params) {
	var filePath = filePaths.filter(function(filePath) {
		return filePath.key === key;
	})[0];

	var path = filePath.path;
	filePath.params.forEach(function(param) {
		path = path.replace(new RegExp(':' + param.key, 'g'), params[param.key]);
	});
	return path;
}


module.exports = {
	getSignedDownloadUrl: getSignedDownloadUrl,
	getSignedUploadUrl:   getSignedUploadUrl,
	removeFile:           removeFile,

	replacePathWithParams: replacePathWithParams
};
