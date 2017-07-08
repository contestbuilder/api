'use strict';

module.exports = function() {

    describe('get', function() {
    });

    describe('post', function() {
        var tests = require('./contributor.post');

        it('should add a new contributor to a contest', tests.addContributor);
        it('should add a new log when adding a contributor to a contest', tests.addContributorLog);
    });

    describe('put', function() {
    });

    describe('delete', function() {
        var tests = require('./contributor.delete');

        it('should delete a contest contributor', tests.removeContributor);
        it('should add a new log when deleting a contest contributor', tests.removeContributorLog);
    });

};
