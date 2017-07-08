'use strict';

var request    = require('request-promise'),
    libraries  = require('../libraries'),
    userLib    = libraries.userLib,
    contestLib = libraries.contestLib,
    assertLib  = libraries.assertLib,
    status     = require('http-status'),
    Log        = require('mongoose').models.Log;

var url = global.URL_ROOT + '/contest';

function removeContributor(done) {
    var me = global.me;

    var newContest, localUserDoc;
    userLib.createUser(null)
        .then(function(userDoc) {
            localUserDoc = userDoc;
            newContest = {
                author      : me._id.toString(),
                name        : 'abC',
                contributors: [
                    me._id.toString(),
                    userDoc._id.toString()
                ]
            };

            return contestLib.createContest(newContest);
        })
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname + '/contributor/' + localUserDoc._id.toString(),
                method: 'DELETE',
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            newContest.contributors.pop();

            return assertLib.equalRecursive(newContest, contestDoc.contest);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function removeContributorLog(done) {
    var me = global.me;

    var newContest, localContestDoc, localUserDoc;
    userLib.createUser(null)
        .then(function(userDoc) {
            localUserDoc = userDoc;
            newContest = {
                author      : me._id.toString(),
                name        : 'abC',
                contributors: [
                    me._id.toString(),
                    userDoc._id.toString()
                ]
            };

            return contestLib.createContest(newContest);
        })
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname + '/contributor/' + localUserDoc._id.toString(),
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
};

module.exports = {
    removeContributor   : removeContributor,
    removeContributorLog: removeContributorLog
};
