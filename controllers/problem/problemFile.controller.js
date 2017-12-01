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
        var signedUrl = await fileLib.getSignedUploadUrl('problemDescription', {
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
    await utilQuery.beginTransaction(conn);
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // get the file VersionId.
        var VersionId = await fileLib.getFileVersionId('problemDescription', {
            contest_nickname: req.params.contest_nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        req.params.file_name
        });

        // insert file.
        var insertResult = await utilQuery.insert(conn, 'file', {
            name:       req.params.file_name,
            version_id: VersionId
        });

        // update problem.
        await utilQuery.edit(conn, 'problem', {
            file_id: insertResult.insertId
        }, {
            id: problem.id
        });

        // commit changes.
        await utilQuery.commit(conn);

        // return it.
        return res.json({
            success: true,
            file_id: insertResult.insertId
        });
    } catch(err) {
        await utilQuery.rollback(conn);

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

        // check if problem has a file attached.
        if(!problem.file_id) {
            throw 'Problem does\'t have a file attached.';
        }

        // get the file.
        var file = await utilQuery.selectOne(conn, '*', 'file', [], {
            id: problem.file_id
        });

        // get the signed url.
        var signedUrl = await fileLib.getSignedDownloadUrl('problemDescription', {
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

        // check if there's a file to remove.
        if(!problem.file_id) {
            throw 'Problem does\'t have a file attached.';
        }

        // get the file.
        var file = await utilQuery.selectOne(conn, '*', 'file', [], {
            id: problem.file_id
        });

        // remove the problem from s3.
        await fileLib.removeFile('problemDescription', {
            contest_nickname: req.params.contest_nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        file.name
        }, file.version_id);

        // edit the problem.
        utilQuery.edit(conn, 'problem', {
            file_id: null
        }, {
            id: problem.id
        });

        // return it.
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

router.route('/contest/:contest_nickname/problem/:problem_nickname/file')
    .post(global.poolConnection.bind(null, getSignedUploadUrl))
    .get(global.poolConnection.bind(null, getSignedDownloadUrl))
    .delete(global.poolConnection.bind(null, removeFile));

router.route('/contest/:contest_nickname/problem/:problem_nickname/file/:file_name')
    .put(global.poolConnection.bind(null, registerFile));

module.exports = router;
