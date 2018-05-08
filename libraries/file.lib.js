'use strict';

var aws = require('./aws.lib'),
	s3  = aws.s3;


function getSignedDownloadUrl(filePath) {
	var signParamObj = {
        Key:       filePath,
        Expires:   600
	};

    return s3.getSignedUrl('getObject', signParamObj);
}

function getSignedUploadUrl(fileName) {
	var path = 'files/'
		+ (new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''))
		+ '/'
		+ fileName;

    var signedUrl = s3.createPresignedPost({
        Expires: 600,
        Fields:  {
            key: path
        }
    });
    signedUrl.key = path;

    return signedUrl;
}

function removeFile(filePath) {
    return aws.s3removeFile(filePath);
}



module.exports = {
	getSignedDownloadUrl: getSignedDownloadUrl,
	getSignedUploadUrl:   getSignedUploadUrl,
	removeFile:           removeFile
};
