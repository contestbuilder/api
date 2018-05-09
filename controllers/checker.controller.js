'use strict';

var express      = require('express'),
    utilQuery    = require('../queries/util.query'),
    contestQuery = require('../queries/contest.query'),
    problemQuery = require('../queries/problem.query'),
    checkerQuery = require('../queries/checker.query'),
    utilLib      = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a checker.
 */
async function createChecker(req, res, next) {
    try {
        // get the contest.
        var contest = await contestQuery.getOneContest(req.conn, {
            contest_nickname: req.params.nickname
        }, req.user);

        // get the problem.
        var problem = await problemQuery.getOneProblem(req.conn, {
            problem_nickname: req.params.problem_nickname
        }, req.user);

        // count how many active checkers there are for this problem.
        var currentCheckersCount = await problemQuery.countCheckers(req.conn, {
            contest_id: contest.id,
            problem_id: problem.id
        }, req.user);

        // new checker object.
        var newChecker = {
            name:        req.body.name,
            nickname:    utilLib.getNickname(req.body.name),
            language:    req.body.language,
            source_code: req.body.source_code,
            order:       currentCheckersCount.count + 1,
            last_edit:   new Date(),
            author_id:   req.user.id,
            problem_id:  problem.id
        };

        // file.
        if(req.body.file && req.body.file.name && req.body.file.path) {
            var insertFileResult = await utilQuery.insert(req.conn, 'file', {
                name: req.body.file.name,
                path: req.body.file.path
            });

            newChecker.file_id = insertFileResult.insertId;

            // large input file.
            if(req.body.file.large) {
                var inputFile = await aws.s3downloadFile(req.body.file.path);

                var textInsertResult = await utilQuery.insert(req.conn, 'text', {
                    text: inputFile.Body
                });

                newChecker.text_id = textInsertResult.insertId;
            }
        }

        // insert the problem.
        var insertResult = await utilQuery.insert(req.conn, 'checker', newChecker);

        // get the inserted checker.
        newChecker = await checkerQuery.getOneChecker(req.conn, {
            checker_id: insertResult.insertId
        }, req.user);

        // return it.
        return res.json({
            success: true,
            checker: newChecker
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        return next();
    }
}

/**
 * Edit a checker.
 */
async function editChecker(req, res, next) {
    try {
        // get the contest.
        var contest = await contestQuery.getOneContest(req.conn, {
            contest_nickname: req.params.nickname
        }, req.user);

        // get the problem.
        var problem = await problemQuery.getOneProblem(req.conn, {
            problem_nickname: req.params.problem_nickname,
            deleted_at: {
                $isNull: true
            }
        }, req.user);

        // get the checker.
        var checker = await checkerQuery.getOneChecker(req.conn, {
            checker_nickname: req.params.checker_nickname,
            deleted_at: {
                $isNull: true
            }
        }, req.user);

        // identify the fields that will be edited.
        var fieldsToEdit = {};
        [
            { key: 'name',             critical: false },
            { key: 'language',         critical: true  },
            { key: 'source_code',      critical: true  }
        ].forEach(param => {
            if(req.body[param.key] !== undefined) {
                fieldsToEdit[param.key] = req.body[param.key];

                if(param.critical) {
                    fieldsToEdit['last_edit'] = new Date();
                }
            }
        });

        // file.
        if(req.body.file && req.body.file.name && req.body.file.path) {
            // if it's the old file, then there's no need to update it.
            if(req.body.file.id && req.body.file.id === checker.file_id) {
            } else {
                var insertFileResult = await utilQuery.insert(req.conn, 'file', {
                    name: req.body.file.name,
                    path: req.body.file.path
                });

                fieldsToEdit['file_id'] = insertFileResult.insertId;
                fieldsToEdit['last_edit'] = new Date();

                // large input file.
                if(req.body.file.large) {
                    var inputFile = await aws.s3downloadFile(req.body.file.path);

                    var textInsertResult = await utilQuery.insert(req.conn, 'text', {
                        text: inputFile.Body
                    });

                    fieldsToEdit['text_id'] = textInsertResult.insertId;
                }
            }
        }
        if(checker.file_id && !req.body.file) {
            fieldsToEdit['file_id'] = null;
        }
        if(checker.text_id && (!req.body.file || !req.body.file.large)) {
            fieldsToEdit['text_id'] = null;
        }

        // edit the checker.
        await utilQuery.edit(req.conn, 'checker', fieldsToEdit, {
            id: checker.id
        });

        // get the checker updated.
        checker = await checkerQuery.getOneChecker(req.conn, {
            checker_id: checker.id,
            deleted_at: {
                $isNull: true
            }
        }, req.user);

        // return it.
        return res.json({
            success: true,
            checker: checker
        });
    } catch(err) {
        return next({
            error: err
        });
    } finally {
        return next();
    }
}

/**
 * Disable a checker.
 */
async function removeChecker(req, res, next) {
    await utilQuery.beginTransaction(req.conn);
    try {
        // get the contest.
        var contest = await contestQuery.getOneContest(req.conn, {
            contest_nickname: req.params.nickname
        }, req.user);

        // get the problem.
        var problem = await problemQuery.getOneProblem(req.conn, {
            problem_nickname: req.params.problem_nickname,
            deleted_at: {
                $isNull: true
            }
        }, req.user);

        // get the checker.
        var checker = await checkerQuery.getOneChecker(req.conn, {
            checker_nickname: req.params.checker_nickname,
            deleted_at: {
                $isNull: true
            }
        }, req.user);

        // remove the checker.
        await utilQuery.edit(req.conn, 'checker', {
            deleted_at: new Date()
        }, {
            id: checker.id
        });

        // reorder the checkers accordingly.
        var remainingCheckers = await checkerQuery.getCheckers(req.conn, {
            problem_id: problem.id,
            deleted_at: {
                $isNull: true
            }
        }, req.user);
        for(var index=0; index<remainingCheckers.length; index++) {
            var remainingChecker = remainingCheckers[index];

            if(remainingChecker.order > checker.order) {
                await utilQuery.edit(req.conn, 'checker', {
                    order: remainingChecker.order - 1
                }, {
                    id: remainingChecker.id
                });
            }
        }
        await utilQuery.commit(req.conn);

        // get the checker updated.
        checker = await checkerQuery.getOneChecker(req.conn, {
            checker_id: checker.id,
            deleted_at: {
                $isNull: false
            }
        }, req.user);

        // return it.
        return res.json({
            success: true,
            checker: checker
        });
    } catch(err) {
        await utilQuery.rollback(req.conn);

        return next({
            error: err
        });
    } finally {
        return next();
    }
}


/**
 * Routes
 */

var router = express.Router();

router.route('/contest/:nickname/problem/:problem_nickname/checker')
    .post(createChecker);

router.route('/contest/:nickname/problem/:problem_nickname/checker/:checker_nickname')
    .put(editChecker)
    .delete(removeChecker);

module.exports = router;
