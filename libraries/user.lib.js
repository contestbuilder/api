'use strict';

var bcrypt = require('bcrypt-nodejs');


function hashPassword(password) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(password, null, null, function(err, hash) {
	        if(err) {
	            return reject(err);
	        }

	        return resolve(hash);
	    });
	});
}

function comparePassword(correctPassword, informedPassword) {
	return bcrypt.compareSync(informedPassword, correctPassword);
}


module.exports = {
	hashPassword:    hashPassword,
	comparePassword: comparePassword
};
