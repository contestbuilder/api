'use strict';

var express      = require('express'),
	utilQuery    = require('../queries/util.query'),
	contestQuery = require('../queries/contest.query'),
	utilLib      = require('../libraries/util.lib');


/**
 * Controllers
 */

/**
 * Create a contest.
 */
async function createContest(conn, req, res, next) {
	await utilQuery.beginTransaction(conn);
	try {
		// new contest object.
		var newContest = {
			author_id:  req.user._id,
			name:       req.body.name,
			nickname:   utilLib.getNickname(req.body.name),
			created_at: new Date()
		};

		// insert the contest.
		var insertResult = await utilQuery.insert(conn, 'contest', newContest);

		// insert the author (current logged user) as a contributor.
		await utilQuery.insert(conn, 'contest_contributor', {
			contest_id: insertResult.insertId,
			user_id:    req.user._id
		});

		// commit changes.
		await utilQuery.commit(conn);

		// get the inserted contest.
		newContest = await contestQuery.getOneContest(conn, {
			contest_nickname: newContest.nickname
		}, req.user);

		// return it.
		return res.json({
			success: true,
			contest: newContest
		});
	} catch(err) {
		await utilQuery.rollback(conn);

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
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		var fieldsToEdit = {};
		[
			'name', 'scheduled_to'
		].forEach(paramName => {
			if(req.body[paramName] !== undefined) {
				fieldsToEdit[paramName] = req.body[paramName];
			}
		});

		await utilQuery.edit(conn, 'contest', fieldsToEdit, {
			id: contest.id
		});

		return res.json({
			success: true
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
		var contest = await contestQuery.getOneContest(conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		await utilQuery.edit(conn, 'contest', {
			deleted_at: new Date()
		}, {
			id: contest.id
		});

 		return res.json({
 			success: true
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

router.route('/contest/')
    .post(global.poolConnection.bind(null, createContest));

router.route('/contest/:nickname')
    .put(global.poolConnection.bind(null, editContest))
    .delete(global.poolConnection.bind(null, removeContest));

module.exports = router;
