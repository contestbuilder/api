'use strict';

var status       = require('http-status'),
    express      = require('express'),
    utilLib      = require('../../libraries/util.lib'),
    fileLib      = require('../../libraries/file.lib'),
    utilQuery    = require('../../queries/util.query'),
    problemQuery = require('../../queries/problem.query');

async function getSignedUploadUrl(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // get the signed upload url.
        var signedUrl = await fileLib.getSignedUploadUrl('testCaseTempFile', {
            contest_nickname: req.params.contest_nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        req.body.name
        });

        // return it.
        return res.json({
            signedUrl: signedUrl
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        conn.release();
    }
}

async function registerFile(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // get the file VersionId.
        var VersionId = await fileLib.getFileVersionId('testCaseTempFile', {
            contest_nickname: req.params.contest_nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        req.params.file_name
        });

        // insert file.
        var insertResult = await utilQuery.insert(conn, 'file', {
            name:       req.params.file_name,
            version_id: VersionId
        });

        // return it.
        return res.json({
            success: true,
            file_id: insertResult.insertId
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        conn.release();
    }
}

async function getSignedDownloadUrl(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // get the file.
        var file = await utilQuery.selectOne(conn, '*', 'file', [], {
            id: +req.params.file_id
        });

        // get the signed upload url.
        var signedUrl = await fileLib.getSignedDownloadUrl('testCaseTempFile', {
            contest_nickname: req.params.contest_nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        file.name
        }, file.version_id);

        // return it.
        return res.json({
            signedUrl: signedUrl
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        conn.release();
    }
}

async function removeFile(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // get the file.
        var file = await utilQuery.selectOne(conn, '*', 'file', [], {
            id: +req.params.file_id
        });

        // remove the file.
        await fileLib.removeFile('testCaseTempFile', {
            contest_nickname: req.params.contest_nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        file.name
        }, file.version_id);

        // remove the file on database.
        await utilQuery.hardDelete(conn, 'file', {
            id: +req.params.file_id
        });

        return res.json({
            success: true
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        conn.release();
    }
}


var router = express.Router();

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case/file')
    .post(global.poolConnection.bind(null, getSignedUploadUrl));

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case/file/:file_name')
    .post(global.poolConnection.bind(null, registerFile));

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case/file/:file_id')
    .get(global.poolConnection.bind(null, getSignedDownloadUrl))
    .delete(global.poolConnection.bind(null, removeFile));

module.exports = router;
