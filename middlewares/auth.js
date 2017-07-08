'use strict';

var status     = require('http-status'),
    express    = require('express'),
    jwt        = require('jsonwebtoken'),
    bodyparser = require('body-parser'),
    secret     = require('../config').secret,
    handleLib  = require('../libraries/handle.lib'),
    models     = require('mongoose').models,
    User       = models.User;

module.exports = function(wagner, baseUrl) {
    var api = express.Router();

    api.use(bodyparser.json());

    api.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-access-token');

        next();
    });

    api.options('/*', function(req, res, next) {
        res.sendStatus(200);
    });

    // check if the user has a token
    api.use(function(req, res, next) {
        var token = req.headers['x-access-token'] || req.body.token || req.query.token;

        if(token) {
            jwt.verify(token, secret, function(err, decoded) {
                if(err) {
                    return res
                     .status(status.INTERNAL_SERVER_ERROR)
                     .json({ error: err.toString() });
                }

                req.user = decoded;
                next();
            });
        } else {
            next();
        }
    });

    // check if the user is authorized to access that specific route
    api.use(function(req, res, next) {
        if(!isAuthorized(
			req.user,
			req.url.substr(baseUrl.length),
			req.method
        )) {
            return res
             .status(status.UNAUTHORIZED)
             .json({
                'error': 'Access denied'
            });
        }

        next();
    });

    api.route(baseUrl + '/me')
    .get(function(req, res) {
        return res.json({
            me: req.user
        });
    });

    function login(req, res) {
        User.findOne({
            username: req.body.username
        })
			.then(handleLib.handleFindOne)
			.then(function(userDoc) {
                if(userDoc.comparePassword(req.body.password)) {
                    var token = jwt.sign({
                        _id        : userDoc._id,
                        username   : userDoc.username,
                        email      : userDoc.email,
                        permissions: userDoc.permissions
                    }, secret, {
                        expiresIn: 7 * 24 * 60 * 60 // expires in a week
                    });

                    return Promise.resolve({
                        success: true,
                        token  : token
                    });
                } else {
                	return Promise.reject({
                		code   : status.UNAUTHORIZED,
                		message: 'Wrong password.'
                	});
                }
            })
            .then(handleLib.handleReturn.bind(null, res, null))
			.catch(handleLib.handleError.bind(null, res));
    }

    api.route(baseUrl + '/login')
    	.post(login);

    return api;
};

function isAuthorized(user, url, method) {
    if(user === undefined) {
        var ok = false;
        visitorsAllowed.forEach(function(allowed) {
            if(allowed.url == url && allowed.method == method) {
                ok = true;
            }
        });

        return ok;
    } else {
        return true;
    }
}

var visitorsAllowed = [
{
    url   : '/user',
    method: 'POST'
}, {
    url   : '/login',
    method: 'POST'
}
];
