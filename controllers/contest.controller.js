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
			author_id:  req.user.id,
			name:       req.body.name,
			nickname:   utilLib.getNickname(req.body.name),
			created_at: new Date()
		};

		// insert the contest.
		var insertResult = await utilQuery.insert(req.conn, 'contest', newContest);

		// insert the author (current logged user) as a contributor.
		await utilQuery.insert(req.conn, 'contest_contributor', {
			contest_id: insertResult.insertId,
			user_id:    req.user.id
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
		return next();
	}
}

/**
 * Edit a contest.
 */
async function editContest(req, res, next) {
	try {
		// get the contest.
		var contest = await contestQuery.getOneContest(req.conn, {
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
		await utilQuery.edit(req.conn, 'contest', fieldsToEdit, {
			id: contest.id
		});

		// get the contest updated.
		contest = await contestQuery.getOneContest(req.conn, {
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
		return next();
	}
}

/**
 * Disable a contest.
 */
 async function removeContest(req, res, next) {
 	try {
 		// get the contest to be removed.
		var contest = await contestQuery.getOneContest(req.conn, {
			contest_nickname: req.params.nickname
		}, req.user);

		// remove it.
		await utilQuery.edit(req.conn, 'contest', {
			deleted_at: new Date()
		}, {
			id: contest.id
		});

 		// get the contest updated.
		contest = await contestQuery.getOneContest(req.conn, {
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
 		return next();
 	}
 }


/**
 * Routes
 */

var router = express.Router();

router.route('/contest/')
    .post(createContest);

router.route('/contest/:nickname')
    .put(editContest)
    .delete(removeContest);

module.exports = router;
