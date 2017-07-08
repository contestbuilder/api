'use strict';

var request    = require('request-promise'),
    libraries  = require('../libraries'),
    userLib    = libraries.userLib,
    contestLib = libraries.contestLib,
    assertLib  = libraries.assertLib,
    Log        = require('mongoose').models.Log;

var url = global.URL_ROOT + '/contest';

function addContributor(done) {
    var me = global.me;

    var newContest = {
        author      : me._id.toString(),
        name        : 'aBc',
        contributors: [
            me._id.toString()
        ]
    };
    var localUserDoc;
    userLib.createUser(null)
        .then(function(userDoc) {
            localUserDoc = userDoc;

            return contestLib.createContest(newContest);
        })
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname + '/contributor',
                method: 'POST',
                body  : {
                    user_id: localUserDoc._id.toString()
                },
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            newContest.contributors.push(localUserDoc._id.toString());

            return assertLib.equalRecursive(newContest, contestDoc.contest);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function addContributorLog(done) {
    var me = global.me;

    var newContest = {
        author      : me._id.toString(),
        name        : 'aBc',
        contributors: [
            me._id.toString()
        ]
    };
    var localUserDoc, localContestDoc;
    userLib.createUser(null)
        .then(function(userDoc) {
            localUserDoc = userDoc;

            return contestLib.createContest(newContest);
        })
        .then(function(contestDoc) {
            return request({
                uri   : url + '/' + contestDoc.nickname + '/contributor',
                method: 'POST',
                body  : {
                    user_id: localUserDoc._id.toString()
                },
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            localContestDoc = contestDoc.contest;

            return Log.find({
                contest: contestDoc.contest._id
            });
        })
        .then(function(logDocs) {
            return assertLib.assertLog.bind(null, 1, {
                author : me._id,
                contest: localContestDoc._id
            }, logDocs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    addContributor   : addContributor,
    addContributorLog: addContributorLog
};
