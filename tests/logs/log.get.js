'use strict';

var request    = require('request-promise'),
    status     = require('http-status'),
    libraries  = require('../libraries'),
    utilLib    = libraries.utilLib,
    userLib    = libraries.userLib,
    contestLib = libraries.contestLib,
    assertLib  = libraries.assertLib,
    logLib     = libraries.logLib;

var url = global.URL_ROOT + '/log';

function getAll(done) {
    var logs;
    var newUserDocs;
    userLib.createUser(2)
        .then(function(userDocs) {
            newUserDocs = userDocs;
            logs = [{
                message: 'first log',
                author : userDocs[0]._id.toString()
            }, {
                message: 'second log',
                author : userDocs[1]._id.toString()
            }];

            return logLib.createLog(logs);
        })
        .then(function(logDocs) {
            logs.forEach(function(log) {
                log.author = utilLib.replaceId(log.author, newUserDocs, utilLib.userFields);
            });

            return request({
                uri : url,
                qs  : { token: global.me.token },
                json: true
            });
        })
        .then(function(logDocs) {
            return assertLib.equalRecursive(logs, logDocs.logs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getOne(done) {
    var logs;
    var newUserDocs;
    userLib.createUser(2)
        .then(function(userDocs) {
            newUserDocs = userDocs;
            logs = [{
                message: 'first log',
                author : userDocs[0]._id.toString()
            }, {
                message: 'second log',
                author : userDocs[1]._id.toString()
            }];

            return logLib.createLog(logs);
        })
        .then(function(logDocs) {
            logs.forEach(function(log) {
                log.author = utilLib.replaceId(log.author, newUserDocs, utilLib.userFields);
            });

            return request({
                uri : url + '/' + logDocs[1]._id.toString(),
                qs  : { token: global.me.token },
                json: true
            });
        })
        .then(function(logDocs) {
            return assertLib.equalRecursive(logs[1], logDocs.log);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getUser(done) {
    var logs, localUserDocs;
    userLib.createUser(2)
        .then(function(userDocs) {
            localUserDocs = userDocs;
            logs = [{
                message: 'first log',
                author : userDocs[0]._id.toString()
            }, {
                message: 'second log',
                author : userDocs[1]._id.toString()
            }];

            return logLib.createLog(logs);
        })
        .then(function(logDocs) {
            logs.forEach(function(log) {
                log.author = utilLib.replaceId(log.author, localUserDocs, utilLib.userFields);
            });

            return request({
                uri : url,
                qs  : {
                    token : global.me.token,
                    author: localUserDocs[1]._id.toString()
                },
                json: true
            });
        })
        .then(function(logDocs) {
            return assertLib.equalRecursive([logs[1]], logDocs.logs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getContest(done) {
    var logs, localContestDocs;
    contestLib.createContest(2)
        .then(function(contestDocs) {
            localContestDocs = contestDocs;
            logs = [{
                message: 'first log',
                author : contestDocs[0].author.toString(),
                contest: contestDocs[0]._id.toString()
            }, {
                message: 'second log',
                author : contestDocs[1].author.toString(),
                contest: contestDocs[1]._id.toString()
            }];

            return logLib.createLog(logs);
        })
        .then(function(logDocs) {
            logs.forEach(function(log) {
                log.author = utilLib.replaceId(log.author, [ global.me ], utilLib.userFields);
                log.contest = utilLib.replaceId(log.contest, localContestDocs, utilLib.contestFields);
                log.contest.author = utilLib.replaceId(log.contest.author, [ global.me ], utilLib.userFields);
            });

            return request({
                uri : url,
                qs  : {
                    token  : global.me.token,
                    contest: localContestDocs[1]._id.toString()
                },
                json: true
            });
        })
        .then(function(logDocs) {
            return assertLib.equalRecursive([logs[1]], logDocs.logs);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    getAll    :     getAll,
    getOne    :     getOne,
    getUser   :    getUser,
    getContest: getContest
    // getProblem: getProblem
};
