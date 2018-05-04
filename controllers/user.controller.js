'use strict';

var express   = require('express'),
	utilQuery = require('../queries/util.query'),
	userQuery = require('../queries/user.query'),
	userLib   = require('../libraries/user.lib'),
	emailLib  = require('../libraries/email.lib');


/**
 * Controllers
 */

/**
 * Create a user.
 */
async function createUser(req, res, next) {
	try {
		// new user object.
		var newUser = {
			name:     req.body.name || req.body.username,
			username: req.body.username,
			email:    req.body.email
		};

		// insert the user.
		var insertResult = await utilQuery.insert(req.conn, 'user', newUser);

		// get the inserted user.
		newUser = await userQuery.getOneUser(req.conn, {
			user_id: insertResult.insertId
		}, req.user);

		// send invitation e-mail.
		if(req.body.sendEmailInvitation) {
			await emailLib.regularInvitation(
                newUser.email,
                newUser.id,
                newUser.name
            );
		}

		// return it.
		return res.json({
			success: true,
			user:    newUser
		});
	} catch(err) {
		return next({
			error: err
		});
	} finally {
		return next();
	}
}

/**
 * Edit a user.
 */
async function editUser(req, res, next) {
	try {
		// get the user.
		var user = await userQuery.getOneUser(req.conn, {
			user_id: +req.params.user_id
		}, req.user);

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
		await utilQuery.edit(req.conn, 'user', fieldsToEdit, {
			id: user.id
		});

		// get the user updated.
		user = await userQuery.getOneUser(req.conn, {
			user_id: user.id
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
		return next();
	}
}


/**
 * Routes
 */

var router = express.Router();

router.route('/user/')
    .post(createUser);

router.route('/user/:user_id')
    .put(editUser);

module.exports = router;
