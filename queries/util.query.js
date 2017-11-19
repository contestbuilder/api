'use strict';

function query(queryStr) {
	return new Promise((resolve, reject) => {
		global.db.query(queryStr, (err, response) => {
			if(err) {
				return reject(err);
			}

			return resolve(response);
		});
	});
}

function select(fields, tableName, joins, conditions, debug) {
	return new Promise((resolve, reject) => {
		var queryStr = 'SELECT ';

		// fields
		if(Array.isArray(fields)) {
			queryStr += (fields || []).join(', ') + ' \n';
		} else {
			queryStr += fields + ' \n';
		}

		// from table
		queryStr += '  FROM ' + (tableName || '') + ' \n';

		// joins
		(joins || []).forEach(join => {
			queryStr += ' INNER JOIN ' + join.table + '\n';
			queryStr += '    ON ' + join.condition + '\n';
		});

		// conditions
		if(conditions) {
			queryStr += ' WHERE \n';
			var conditionsCount = 0;

			if(Array.isArray(conditions)) {
				conditions.forEach(condition => {
					if(condition.value === undefined) {
						return;
					}

					if(conditionsCount++) {
						queryStr += '   AND ';
					}

					queryStr += condition.key + ' = ' + global.db.escape(condition.value) + '\n';
				});
			} else {
				Object.keys(conditions).forEach(conditionKey => {
					if(conditions[conditionKey] === undefined) {
						return;
					}

					if(conditionsCount++) {
						queryStr += '   AND ';
					}

					queryStr += conditionKey + ' = ' + global.db.escape(conditions[conditionKey]) + '\n';
				});
			}
		}

		if(debug) {
			console.log(queryStr);
		}

		// select it all
		global.db.query(queryStr, (err, response) => {
			if(err) {
				return reject(err);
			}

			return resolve(response);
		});
	});
}

function selectOne(fields, tableName, joins, conditions, debug) {
	return new Promise((resolve, reject) => {
		select(fields, tableName, joins, conditions, debug)
		.then(response => {
			if(Array.isArray(response)) {
				if(response.length < 1) {
					return reject('No rows found.');
				}

				return resolve(response[0]);
			}

			return resolve(response);
		})
		.catch(err => {
			return reject(err);
		})
	})
}

function insert(connection, table, data) {
	return new Promise((resolve, reject) => {
		connection.query(`
			INSERT INTO ${table}
			   SET ?
		`, data, (err, results, fields) => {
			if(err) {
				return reject(err);
			}

			return resolve(results);
		});
	});
}

function beginTransaction(conn) {
	return new Promise((resolve, reject) => {
		conn.beginTransaction(err => {
			if(err) {
				return reject(err);
			}

			return resolve();
		});
	});
}

function commit(conn) {
	return new Promise((resolve, reject) => {
		conn.commit(err => {
			if(err) {
				return reject(err);
			}

			return resolve();
		});
	});
}

function rollback(conn) {
	return new Promise((resolve, reject) => {
		conn.rollback(() => {
			return resolve();
		});
	});
}

module.exports = {
	query: query,

	select:    select,
	selectOne: selectOne,

	insert: insert,

	beginTransaction: beginTransaction,
	commit:           commit,
	rollback:         rollback
};
