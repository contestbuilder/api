'use strict';

function query(conn, queryStr) {
	return new Promise((resolve, reject) => {
		conn.query(queryStr, (err, response) => {
			if(err) {
				return reject(err);
			}

			return resolve(response);
		});
	});
}

function select(conn, fields, tableName, joins, conditions, debug) {
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
		queryStr += getConditionStr(conn, conditions);

		if(debug) {
			console.log(queryStr);
		}

		// select it all
		conn.query(queryStr, (err, response) => {
			if(err) {
				return reject(err);
			}

			return resolve(response);
		});
	});
}

function selectOne(conn, fields, tableName, joins, conditions, debug) {
	return new Promise((resolve, reject) => {
		select(conn, fields, tableName, joins, conditions, debug)
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
		});
	});
}

function insert(conn, table, data) {
	return new Promise((resolve, reject) => {
		conn.query(`
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

function edit(conn, table, fields, conditions) {
	return new Promise((resolve, reject) => {
		var conditionStr = getConditionStr(conn, conditions);

		conn.query(`
			UPDATE ${table}
			   SET ?
			 ${conditionStr}
		`, fields, (err, results, fields) => {
			if(err) {
				return reject(err);
			}

			return resolve(results);
		});
	});
}

function softDelete(conn, table, conditions, deletedAt) {
	return new Promise((resolve, reject) => {
		var conditionStr = getConditionStr(conn, conditions);

		conn.query(`
			UPDATE ${table}
			   SET deleted_at = ${deletedAt || new Date()}
			 ${conditionStr}
		`, (err, results, fields) => {
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

function getConditionStr(conn, conditions) {
	var conditionStr = '';
	if(conditions) {
		conditionStr += ' WHERE \n';
		var conditionsCount = 0;

		if(Array.isArray(conditions)) {
			conditions.forEach(condition => {
				if(condition.value === undefined) {
					return;
				}

				if(conditionsCount++) {
					conditionStr += '   AND ';
				}

				conditionStr += condition.key + ' = ' + conn.escape(condition.value) + '\n';
			});
		} else {
			Object.keys(conditions).forEach(conditionKey => {
				if(conditions[conditionKey] === undefined) {
					return;
				}

				if(conditionsCount++) {
					conditionStr += '   AND ';
				}

				conditionStr += conditionKey + ' = ' + conn.escape(conditions[conditionKey]) + '\n';
			});
		}
	}
	return conditionStr;
}

module.exports = {
	query: query,

	select:    select,
	selectOne: selectOne,

	insert:     insert,
	edit:       edit,
	softDelete: softDelete,

	beginTransaction: beginTransaction,
	commit:           commit,
	rollback:         rollback
};
