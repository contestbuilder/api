'use strict';

var express = require('express'),
    fileLib = require('../libraries/file.lib');


async function getSignedUploadUrl(req, res, next) {
    try {
        // get the signed upload url.
        var signedUrl = await fileLib.getSignedUploadUrl(req.body.name);

        // return it.
        return res.json({
            signedUrl: signedUrl
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        return next();
    }
}

async function getSignedDownloadUrl(req, res, next) {
    try {
        // get the signed url.
        var signedUrl = await fileLib.getSignedDownloadUrl(req.body.path);

        // return it.
        return res.json({
            signedUrl: signedUrl
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        return next();
    }
}


var router = express.Router();

router.route('/file')
    .post(getSignedUploadUrl);

router.route('/file/download')
    .post(getSignedDownloadUrl);

module.exports = router;
