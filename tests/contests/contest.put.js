'use strict';

var request    = require('request-promise'),
    status     = require('http-status'),
    libraries  = require('../libraries'),
    userLib    = libraries.userLib,
    contestLib = libraries.contestLib,
    assertLib  = libraries.assertLib,
    Log        = require('mongoose').models.Log;

var url = global.URL_ROOT + '/contest';

function edit(done) {
    var me = global.me;

    var newContest = {
        author      : me._id.toString(),
        name        : 'abc',
        contributors: [
            me._id.toString()
        ]
    };

    contestLib.createContest(newContest)
        .then(function(contestDoc) {
            newContest.name = 'def';

            return request({
                uri   : url + '/' + contestDoc.nickname,
                method: 'PUT',
                body  : { name: newContest.name },
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            return assertLib.equalRecursive(newContest, contestDoc.contest);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function editLog(done) {
    var me = global.me;

    var newContest = {
        author      : me._id.toString(),
        name        : 'abc',
        contributors: [
            me._id.toString()
        ]
    };

    var localContestDoc;
    contestLib.createContest(newContest)
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname,
                method: 'PUT',
                body  : { name: 'def' },
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            localContestDoc = contestDoc;

            return Log.find({
                contest: contestDoc.contest._id
            });
        })
        .then(function(logDocs) {
            return assertLib.assertLog(1, {
                author : me._id,
                contest: localContestDoc.contest._id
            }, logDocs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    edit   : edit,
    editLog: editLog
};
