'use strict';

var query = (root, args) => {
    return new Promise((resolve, reject) => {
        global.db.query('SELECT * FROM user', (err, result) => {
            if(err) {
                return reject(err);
            }

            return resolve(result);
        });
    });
};

var fields = {
    contests: (parent, args) => {
        return new Promise((resolve, reject) => {
            global.db.query(`
                SELECT c.*
                  FROM contest c
                 INNER JOIN contest_contributor cb
                    ON cb.contest_id = c.id
                 WHERE cb.user_id = ${parent.id}
            `, (err, result) => {
                if(err) {
                    return reject(err);
                }

                return resolve(result);
            })
        })
    }
};

module.exports = {
    query:  query,
    fields: fields
};
