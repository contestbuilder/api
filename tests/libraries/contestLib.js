'use strict';

var Contest = require('mongoose').models.Contest,
    userLib = require('./userLib');

function newContest(user) {
    if(!user) {
        user = global.me;
    }

    return {
        author      : user._id.toString(),
        name        : 'abc_' + Math.random().toString(36).substring(7),
        contributors: [
            me._id.toString()
        ]
    };
}

function newContests(qty) {
    var users = [];
    for(var i = 0; i < qty; i++) {
        users.push(newContest());
    }
    return users;
}

function createContest(option) {
    return new Promise(function(resolve, reject) {
        var contest;
        if(typeof option === 'number') {
            contest = newContests(option);
        }
        else if(option !== null && typeof option === 'object') {
            contest = option;
        }
        else {
            contest = newContest();
        }

        if(contest instanceof Contest) {
            return resolve(contest);
        } else {
            Contest.create(contest, function(err, contestDoc) {
                if(err) {
                    return reject(err);
                }

                return resolve(contestDoc);
            });
        }
    });
}

module.exports = {
    newContest   : newContest,
    newContests  : newContests,
    createContest: createContest
};
