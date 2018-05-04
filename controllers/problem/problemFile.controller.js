'use strict';

var express      = require('express'),
    fileLib      = require('../../libraries/file.lib'),
    utilQuery    = require('../../queries/util.query'),
    problemQuery = require('../../queries/problem.query');


async function getSignedDownloadUrl(req, res, next) {
    try {
        // get the problem.
        var problem = await problemQuery.getOneProblem(req.conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // check if problem has a file attached.
        if(!problem.file_id) {
            throw 'Problem does\'t have a file attached.';
        }

        // get the file.
        var file = await utilQuery.selectOne(req.conn, '*', 'file', [], {
            id: problem.file_id
        });

        // get the signed url.
        var signedUrl = await fileLib.getSignedDownloadUrl(file.path);

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

router.route('/contest/:contest_nickname/problem/:problem_nickname/file')
    .get(getSignedDownloadUrl);

module.exports = router;
