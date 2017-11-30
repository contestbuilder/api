'use strict';

var express   = require('express'),
	utilQuery = require('../queries/util.query'),
	userQuery = require('../queries/user.query'),
	userLib   = require('../libraries/user.lib');


/**
 * Controllers
 */

/**
 * Get a user.
 */
async function getUser(conn, req, res, next) {
	try {
		// get user.
		var user = await utilQuery.selectOne(
			conn,
			'u.id, u.name, u.username, u.email',
			'user u',
			[],
			{
				'u.id': +req.params.user_id,
				'u.password': {
					$isNull: true
				}
			}, true
		);

		// return it.
		return res.json({
			success: true,
			user:    user
		});
	} catch(err) {
		return next({
			error: err
		});
	} finally {
		conn.release();
	}
}

/**
 * Edit a user.
 */
async function editUser(conn, req, res, next) {
	try {
		// get user.
		var user = await utilQuery.selectOne(
			conn,
			'u.id, u.name, u.username',
			'user u',
			[],
			{
				id: +req.params.user_id,
				password: {
					$isNull: true
				}
			}
		);

		// identify the fields that will be edited.
		var fieldsToEdit = {};
		[
			'name',
			'username'
		].forEach(paramName => {
			if(req.body[paramName] !== undefined) {
				fieldsToEdit[paramName] = req.body[paramName];
			}
		});

		// rehash the password, if necessary.
		if(req.body.password) {
			fieldsToEdit['password'] = userLib.hashPassword(req.body.password);
		}

		// edit the user.
		await utilQuery.edit(conn, 'user', fieldsToEdit, {
			id: user.id
		});

		// get the user updated.
		user = await userQuery.getOneUser(conn, {
			id: user.id
		}, req.user);

		// return it.
		return res.json({
			success: true,
			user:    user
		});
	} catch(err) {
		return next({
			error: err
		});
	} finally {
		conn.release();
	}
}


/**
 * Routes
 */

var router = express.Router();

router.route('/invitation/user/:user_id')
    .get(global.poolConnection.bind(null, getUser))
    .put(global.poolConnection.bind(null, editUser));

module.exports = router;
