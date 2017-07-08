'use strict';

var request    = require('request-promise'),
    status     = require('http-status'),
    libraries  = require('../libraries'),
    utilLib    = libraries.utilLib,
    userLib    = libraries.userLib,
    assertLib  = libraries.assertLib,
    contestLib = libraries.contestLib;

var url = global.URL_ROOT + '/contest';

function getAll(done) {
    var me = global.me;
    var newUserDoc;

    var newContests;
    userLib.createUser(null)
        .then(function(userDoc) {
            newUserDoc = userDoc;

            newContests = [{
                author      : me._id.toString(),
                name        : 'abc',
                contributors: [
                    me._id.toString(),
                    userDoc._id.toString()
                ]
            }, {
                author      : userDoc._id.toString(),
                name        : 'qwe',
                contributors: [
                    me._id.toString()
                ]
            }, {
                author      : userDoc._id.toString(),
                name        : 'ghi',
                contributors: [
                    userDoc._id.toString()
                ]
            }];

            return contestLib.createContest(newContests);
        })
        .then(function(contestDocs) {
            newContests.pop();
            newContests.forEach(function(newContest) {
                utilLib.replaceIds(newContest.contributors, [me, newUserDoc], utilLib.userFields);
                newContest.author = utilLib.replaceId(newContest.author, [me, newUserDoc], utilLib.userFields);
            });

            return request({
                uri : url,
                qs  : { token: me.token },
                json: true
            });
        })
        .then(function(contestDocs) {
            return assertLib.equalRecursive(newContests, contestDocs.contests);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getOne(done) {
    var me = global.me;

    var newContest;
    var newUserDocs;
    userLib.createUser(2)
        .then(function(userDocs) {
            newUserDocs = userDocs;
            newContest = {
                author      : me._id.toString(),
                name        : 'Abc',
                contributors: [
                    me._id.toString(),
                    userDocs[0]._id.toString(),
                    userDocs[1]._id.toString()
                ]
            };

            return contestLib.createContest(newContest);
        })
        .then(function(contestDoc) {
            utilLib.replaceIds(newContest.contributors, [me].concat(newUserDocs), utilLib.userFields);
            newContest.author = utilLib.replaceId(newContest.author, [me].concat(newUserDocs), utilLib.userFields);

            return request({
                uri : url + '/' + contestDoc.nickname,
                qs  : { token: me.token },
                json: true
            });
        })
        .then(function(contestDoc) {
            return assertLib.equalRecursive(newContest, contestDoc.contest);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getOneNotFound(done) {
    request({
        uri                    : url + '/abc',
        qs                     : { token: global.me.token },
        json                   : true,
        simple                 : false,
        resolveWithFullResponse: true
    })
        .then(assertLib.apiStatus.bind(null, status.NOT_FOUND))
        .then(assertLib.hasError)
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    getAll        : getAll,
    getOne        : getOne,
    getOneNotFound: getOneNotFound
};
