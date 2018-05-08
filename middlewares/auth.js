'use strict';

var status     = require('http-status'),
    express    = require('express'),
    jwt        = require('jsonwebtoken'),
    bodyparser = require('body-parser'),
    secret     = require('../libraries/config.lib').env.secret,
    userLib    = require('../libraries/user.lib'),
    utilQuery  = require('../queries/util.query'),
    userQuery  = require('../queries/user.query');

module.exports = function(baseUrl) {
    var api = express.Router();

    // parse as json.
    api.use(bodyparser.json());

    // add necessary cors headers.
    api.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin',  '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-access-token');

        next();
    });

    // sends ok to "options" requests.
    api.options('/*', function(req, res, next) {
        req.conn.release();

        return res.sendStatus(200);
    });

    // check if the user has a token.
    // if he has, append it to the req object.
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

    // check if the user is authorized to access that specific route.
    api.use(function(req, res, next) {
        if(!isAuthorized(
			req.user,
			req.url.substr(baseUrl.length),
			req.method
        )) {
            return next({
                status: status.UNAUTHORIZED,
                error:  'Access denied'
            });
        }

        next();
    });

    // token info.
    api.route(baseUrl + '/me')
    .get(function(req, res, next) {
        res.json({
            me: req.user
        });

        return next();
    });

    // login route.
    api.route(baseUrl + '/login')
    	.post(async function login(req, res, next) {
            try {
                // search the user.
                var user = await userQuery.getOneUser(req.conn, {
                    user_username: req.body.username
                });

                // check the password
                if(userLib.comparePassword(req.body.password, user.password)) {
                    var token = jwt.sign({
                        id:       user.id,
                        name:     user.name,
                        username: user.username,
                        email:    user.email
                    }, secret, {
                        expiresIn: 7 * 24 * 60 * 60 // expires in a week
                    });

                    res.json({
                        success: true,
                        token:   token
                    });
                    return next();
                } else {
                    throw 'Wrong password.';
                }
            } catch(err) {
                return next({
                    error: err
                });
            }
        });

    // error handling.
    api.use(function(err, req, res, next) {
        req.conn.release();

        return res.status(err.status || 500)
        .json({
            error: err.error
        });
    });

    return api;
};

function isAuthorized(user, url, method) {
    if(user === undefined) {
        var ok = false;
        visitorsAllowed.forEach(function(allowed) {
            if(url.indexOf(allowed.url) === 0 && allowed.method == method) {
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
    url:    '/login',
    method: 'POST'
}, {
    url:    '/invitation/user',
    method: 'GET'
}, {
    url:    '/invitation/user',
    method: 'PUT'
}, {
    url:    '/graphqli',
    method: 'GET'
}, {
    url:    '/graphqli',
    method: 'POST'
}
];
