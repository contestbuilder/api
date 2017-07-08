var assert = require('assert'),
    status = require('http-status');

module.exports = function(wagner) {
    wagner.factory('assertService', function(User) {

        function convertResult(res) {
            var result;
            assert.doesNotThrow(function() {
                result = JSON.parse(res.text);
            }, SyntaxError, 'Erro ao converter a resposta em formato JSON.');

            return result;
        }


        function apiCall(cb, err, res) {
            assert.ifError(err);

            var result = convertResult(res);
            cb(result);
        }

        function apiError(expectedStatus, cb, err, res) {
            assert.equal(err.response.status, expectedStatus);

            var result = convertResult(res);
            assert.ok(result.error);

            cb();
        }


        function create(cb, err, docs) {
            assert.ifError(err);

            cb(docs);
        }


        function equalRecursive(obj1, obj2, comparePath) {
            if(!comparePath) {
                comparePath = 'root';
            }

            if(obj1 !== undefined && obj2 === undefined) {
                assert.ok(false, 'equalRecursive: Value defined on first obj not on the second (' + comparePath + ').');
            }

            if(Array.isArray(obj1)) {
                obj1.forEach(function(value, index) {
                    equalRecursive(obj1[index], obj2[index], comparePath + '[' + index + ']');
                });
            }
            else if(obj1 instanceof Object) {
                Object.keys(obj1).forEach(function(key) {
                    equalRecursive(obj1[key], obj2[key], comparePath + '.' + key);
                });
            }
            else {
                assert.equal(obj1, obj2, 'equalRecursive: Different value (' + comparePath + ').');
            }
        }


        function assertLog(logsQtde, logsObj, cb, err, logDocs) {
            assert.ifError(err);
            assert.equal(logsQtde, logDocs.length);

            if(logsQtde === 1) {
                equalRecursive(logsObj, logDocs[0]);
            } else {
                equalRecursive(logsObj, logDocs);
            }

            logDocs.forEach(function(logDoc) {
                assert.ok(logDoc.message);
            });

            cb(logDocs);
        }

        return {
            apiCall:        apiCall,
            apiError:       apiError,
            create:         create,
            equalRecursive: equalRecursive,
            assertLog:      assertLog
        };
    });
}
