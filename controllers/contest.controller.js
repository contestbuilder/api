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
async function createContest(req, res, next) {
	await utilQuery.beginTransaction(req.conn);
	try {
		// new contest object.
		var newContest = {
			author_id:  req.user._id,
			name:       req.body.name,
			nickname:   utilLib.getNickname(req.body.name),
			created_at: new Date()
		};

		// insert the contest.
		var insertResult = await utilQuery.insert(req.conn, 'contest', newContest);

		// insert the author (current logged user) as a contributor.
		await utilQuery.insert(req.conn, 'contest_contributor', {
			contest_id: insertResult.insertId,
			user_id:    req.user._id
		});

		// commit changes.
		await utilQuery.commit(req.conn);

		// get the inserted contest.
		newContest = await contestQuery.getOneContest(req.conn, {
			contest_id: insertResult.insertId
		}, req.user);

		// return it.
		return res.json({
			success: true,
			contest: newContest
		});
	} catch(err) {
		await utilQuery.rollback(req.conn);

		return next({
			error: err
		});
	} finally {
		req.conn.release();
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
			contest_id: contest.id
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
			contest_id: contest.id
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

router.route('/contest/')
    .post(createContest);

router.route('/contest/:nickname')
    .put(global.poolConnection.bind(null, editContest))
    .delete(global.poolConnection.bind(null, removeContest));

module.exports = router;
