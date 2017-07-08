module.exports = function(wagner) { return function() {

    describe('get', function() {
        var tests = require('./problem.get')(wagner);

        it('should get all problems', tests.getAll);
        it('should get one problem', tests.getOne);
        it('should not find a problem that doesn\'t exist', tests.getOneNotFound);
    });

    describe('post', function() {
        var tests = require('./problem.post')(wagner);

        it('should add a new problem', tests.add);
        it('should add two new problems', tests.addTwo);
        it('should fail to add if a param is missing', tests.addFail);
        it('should add a log when a problem is inserted', tests.addLog);
    });

    // describe('put', function() {
    //     var tests = require('./problem.put')(wagner);

    //     it('should edit a problem (no critical changes)', tests.editNonCritical);
    //     it('should edit a problem (critical changes)', tests.editCritical);
    //     it('should edit a problem\'s order (ascending)', tests.editOrderAsc);
    //     it('should edit a problem\'s order (descending)', tests.editOrderDesc);
    // });

    // describe('delete', function() {
    //     var tests = require('./problem.delete')(wagner);

    //     it('should delete a contest problem', tests.removeProblem);
    //     it('should delete a contest problem (and reorder others accordingly)', tests.removeProblem2);
    // });

}};
