'use strict';

var bcrypt = require('bcrypt-nodejs');


function hashPassword(password) {
	return bcrypt.hashSync(password);
}

function comparePassword(informedPassword, correctPassword) {
	return bcrypt.compareSync(informedPassword, correctPassword);
}


module.exports = {
	hashPassword:    hashPassword,
	comparePassword: comparePassword
};
