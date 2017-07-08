'use strict';

var assert     = require('assert'),
    express    = require('express'),
    superagent = require('superagent'),
    wagner     = require('wagner-core');

global.URL_ROOT = 'http://localhost:3010';
var models    = require('../models')('contest_builder_test');
var libraries = require('./libraries');

describe('Test API', function() {
    var server;
    var User, Contest, Log;

    before(function(done) {
        var app = express();

        // Bootstrap server
        app.use(require('../middlewares')(wagner, ''));
        app.use(require('../controllers'));

        // test services
        require('./services')(wagner);

        // start server
        server = app.listen(3010);

        // Make models available in tests
        User    = models.User;
        Contest = models.Contest;
        Log     = models.Log;

        // login
        User.remove({}, function(error) {
            libraries.loginLib.login().then(function(userDoc) {
                global.me = userDoc;

                done();
            });
        });
    });

    beforeEach(function(done) {
        // Make sure categories are empty before each test
        Log.remove({}, function(error) {
            assert.ifError(error);

            Contest.remove({}, function(error) {
                assert.ifError(error);

                // delete all users but the one that is logged
                User.remove({
                    username: { '$ne': global.me.username }
                }, function(error) {
                    assert.ifError(error);

                    done();
                });
            });
        });
    });

    describe('/users',        require('./users'));
    describe('/contests',     require('./contests'));
    describe('/contributors', require('./contributors'));
    // describe('/problems',     require('./problems')(wagner));
    describe('/logs',         require('./logs'));

    after(function() {
        // Shut the server down when we're done
        server.close();
    });
});
