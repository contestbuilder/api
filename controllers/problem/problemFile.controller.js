'use strict';

var status       = require('http-status'),
    express      = require('express'),
    utilLib      = require('../../libraries/util.lib'),
    fileLib      = require('../../libraries/file.lib'),
    utilQuery    = require('../../queries/util.query'),
    problemQuery = require('../../queries/problem.query');


async function getSignedDownloadUrl(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // check if problem has a file attached.
        if(!problem.file_url) {
            throw 'Problem does\'t have a file attached.';
        }

        // get the signed url.
        var signedUrl = await fileLib.getSignedDownloadUrl('problemDescription', {
            contest_nickname: req.params.nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        problem.file_url
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

async function getSignedUploadUrl(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // get the signed upload url.
        var signedUrl = await fileLib.getSignedUploadUrl('problemDescription', {
            contest_nickname: req.params.nickname,
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

async function uploadFile(conn, req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // set the file name on the problem.
        await utilQuery.edit(conn, 'problem', {
           file_url: req.body.name 
        }, {
            id: problem.id
        });

        // get the problem updated.
        problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // return it.
        return res.json({
            success: true,
            problem: problem
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
        if(!problem.file_url) {
            throw 'Problem does\'t have a file attached.';
        }

        // remove the problem from s3.
        await fileLib.removeFile('problemDescription', {
            contest_nickname: req.params.nickname,
            problem_nickname: req.params.problem_nickname,
            file_name:        problem.file_url
        });

        // edit the problem.
        utilQuery.edit(conn, 'problem', {
            file_url: null
        }, {
            id: problem.id
        });

        // get the problem updated.
        problem = await problemQuery.getOneProblem(conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // return it.
        return res.json({
            success: true,
            problem: problem
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

router.route('/contest/:nickname/problem/:problem_nickname/file')
    .get(global.poolConnection.bind(null, getSignedDownloadUrl))
    .post(global.poolConnection.bind(null, getSignedUploadUrl))
    .put(global.poolConnection.bind(null, uploadFile))
    .delete(global.poolConnection.bind(null, removeFile));

module.exports = router;
