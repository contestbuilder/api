'use strict';

var mongoose   = require('mongoose'),
    bcrypt     = require('bcrypt-nodejs'),
    userSchema = require('../schemas/user.schema');

userSchema.pre('save', function(next) {
    var user = this;

    // Hash the password only if the user is changed or user is new
    if(!user.isModified('password')) {
        return next();
    }

    // Generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if(err) {
            return next(err);
        }

        // Change the password to the hashed version
        user.password = hash;
        next();
    });
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema, 'users');
