'use strict';

module.exports = function() {

    describe('get', function() {
        var tests = require('./contest.get');

        it('should get all contests', tests.getAll);
        it('should get one contest', tests.getOne);
        it('should not find a contest that doesn\'t exist', tests.getOneNotFound);
    });

    describe('post', function() {
        var tests = require('./contest.post');

        it('should add a new contest', tests.add);
        it('should fail to add if a param is missing', tests.addFail);
        it('should add a log when a contest is created', tests.addLog);
    });

    describe('put', function() {
        var tests = require('./contest.put');

        it('should edit a contest', tests.edit);
        it('should add a log when a contest is edited', tests.editLog);
    });

    describe('delete', function() {
        var tests = require('./contest.delete');

        it('should delete a contest', tests.removeContest);
        it('should add a log by the logged in user', tests.addLog);
    });

};
