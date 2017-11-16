'use strict';

var query = (root, args) => {
    console.log(root, args);
    return new Promise((resolve, reject) => {
        global.db.query(`
            SELECT c.*
              FROM contest
             INNER JOIN contest_contributor cb
                ON cb.contest_id =  c.id
             WHERE cb.user_id = ${args.me.id}
        `, (err, result) => {
            if(err) {
                return reject(err);
            }

            return resolve(result);
        });
    });
};

var fields = {
    author: (parent, args) => {
        return new Promise((resolve, reject) => {
            global.db.query(`
                SELECT *
                  FROM user
                 WHERE id=${parent.author_id}
            `, (err, result) => {
                if(err) {
                    return reject(err);
                }

                return resolve(result[0]);
            });
        });
    },
    contributors: (parent, args) => {
        return new Promise((resolve, reject) => {
            global.db.query(`
                SELECT u.*
                  FROM user u
                 INNER JOIN contest_contributor cb
                    ON cb.user_id = u.id
                 WHERE cb.contest_id = ${parent.id}
            `, (err, result) => {
                if(err) {
                    return reject(err);
                }

                return resolve(result);
            });
        });
    }
};

module.exports = {
	query:  query,
	fields: fields
};
