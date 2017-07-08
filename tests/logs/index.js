'use strict';

module.exports = function() {

    describe('get', function() {
        var tests = require('./log.get');

        it('should get all logs', tests.getAll);
        it('should get a specific log', tests.getOne);
        it('should get all logs related to a user', tests.getUser);
        it('should get all logs related to a contest', tests.getContest);
        it('should get all logs related to a problem', tests.getProblem);
    });

    describe('post', function() {
        var tests = require('./log.post');

        // it('should add a new contest', tests.add);
        // it('should fail to add if a param is missing', tests.addFail);
        // it('should add a new contributor to a contest', tests.addContributor);
    });

    describe('put', function() {
        var tests = require('./log.put');

        // it('should edit a contest', tests.edit);
    });

    describe('delete', function() {
        var tests = require('./log.delete');

        // it('should delete a contest', tests.removeContest);
        // it('should delete a contest contributor', tests.removeContributor);
    });

};
