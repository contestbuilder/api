'use strict';

module.exports = function() {

    describe('get', function() {
        var tests = require('./user.get');

        it('should get all users', tests.getAll);
        it('should get one user', tests.getOne);
        it('should not find an user that doesn\'t exist', tests.getOneNotFound);
    });

    describe('post', function() {
        var tests = require('./user.post');

        it('should add a new user', tests.add);
        it('should add a new user while not logged', tests.addUnlogged);
        it('should fail to add if a param is missing', tests.addFail);
    });

    describe('put', function() {
        var tests = require('./user.put');

        it('should edit an user', tests.edit);
    });

    describe('delete', function() {
        var tests = require('./user.delete');

        it('should delete an user', tests.remove);
    });

};
