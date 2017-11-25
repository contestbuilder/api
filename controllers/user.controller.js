'use strict';

var express   = require('express'),
	utilQuery = require('../queries/util.query'),
	userQuery = require('../queries/user.query'),
	utilLib   = require('../libraries/util.lib'),
	emailLib  = require('../libraries/email.lib');


/**
 * Controllers
 */

/**
 * Create a user.
 */
async function createUser(conn, req, res, next) {
	try {
		// new user object.
		var newUser = {
			name:     req.body.name || req.body.username,
			username: req.body.username,
			email:    req.body.email
		};

		// insert the user.
		var insertResult = await utilQuery.insert(conn, 'user', newUser);

		// get the inserted user.
		newUser = await userQuery.getOneUser(conn, {
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
		conn.release();
	}
}

/**
 * Edit a contest.
 */
async function editContest(conn, req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// identify the fields that will be edited.
		var fieldsToEdit = {};
		[
			'name', 'scheduled_to'
		].forEach(paramName => {
			if(req.body[paramName] !== undefined) {
				fieldsToEdit[paramName] = req.body[paramName];
			}
		});

		// edit the contest.
		await utilQuery.edit(conn, 'contest', fieldsToEdit, {
			id: contest.id
		});

		// get the contest updated.
		contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// return it.
		return res.json({
			success: true,
			contest: contest
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
 * Disable a contest.
 */
 async function removeContest(conn, req, res, next) {
 	try {
 		// get the contest to be removed.
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// remove it.
		await utilQuery.edit(conn, 'contest', {
			deleted_at: new Date()
		}, {
			id: contest.id
		});

 		// get the contest updated.
		contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// return it.
 		return res.json({
 			success: true,
 			contest: contest
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

router.route('/user/')
    .post(global.poolConnection.bind(null, createUser));

// router.route('/contest/:nickname')
//     .put(global.poolConnection.bind(null, editContest))
//     .delete(global.poolConnection.bind(null, removeContest));

module.exports = router;
