'use strict';

var request    = require('request-promise'),
    status     = require('http-status'),
    libraries  = require('../libraries'),
    userLib    = libraries.userLib,
    contestLib = libraries.contestLib,
    assertLib  = libraries.assertLib,
    Log        = require('mongoose').models.Log;

var url = global.URL_ROOT + '/contest';

function add(done) {
    var me = global.me;

    var newContest;
    userLib.createUser(2)
        .then(function(userDocs) {
            newContest = {
                name: 'abc'
            };

            return request({
                uri   : url,
                method: 'POST',
                body  : newContest,
                qs    : { token: me.token },
                json  : true
            });
        })
        .then(function(contestDoc) {
            newContest.author = me._id.toString();
            newContest.contributors = [me._id.toString()];

            return assertLib.equalRecursive(newContest, contestDoc.contest);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function addFail(done) {
    userLib.createUser(2)
        .then(function(userDocs) {
            return request({
                uri                    : url,
                method                 : 'POST',
                body                   : {},
                qs                     : { token: global.me.token },
                json                   : true,
                simple                 : false,
                resolveWithFullResponse: true
            });
        })
        .then(assertLib.apiStatus.bind(null, status.BAD_REQUEST))
        .then(assertLib.hasError)
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function addLog(done) {
    var me = global.me;

    var localContestDoc;
    userLib.createUser(null)
        .then(function(userDoc) {
            var newContest = {
                name: 'abc'
            };

            return request({
                uri   : url,
                method: 'POST',
                body  : newContest,
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
                author : me._id.toString(),
                contest: localContestDoc.contest._id
            }, logDocs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    add    : add,
    addFail: addFail,
    addLog : addLog
};
