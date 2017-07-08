'use strict';

var request    = require('request-promise'),
    status     = require('http-status'),
    libraries  = require('../libraries'),
    contestLib = libraries.contestLib,
    assertLib  = libraries.assertLib,
    Log        = require('mongoose').models.Log;

var url = global.URL_ROOT + '/contest';

function removeContest(done) {
    var me = global.me;

    var newContest = {
        author      : me._id.toString(),
        name        : 'Abc',
        contributors: [
            me._id.toString()
        ]
    };

    contestLib.createContest(newContest)
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname,
                method: 'DELETE',
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            newContest.active = false;

            return assertLib.equalRecursive(newContest, contestDoc.contest);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function addLog(done) {
    var me = global.me;

    var newContest = {
        author      : me._id.toString(),
        name        : 'Abc',
        contributors: [
            me._id.toString()
        ]
    };

    var localContestDoc;
    contestLib.createContest(newContest)
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname,
                method: 'DELETE',
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            localContestDoc = contestDoc.contest;

            return Log.find({
                contest: localContestDoc._id
            });
        })
        .then(function(logDocs) {
            return assertLib.assertLog(1, {
                author : me._id,
                contest: localContestDoc._id
            }, logDocs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
}

module.exports = {
    removeContest: removeContest,
    addLog       : addLog
};
