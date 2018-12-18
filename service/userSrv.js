var User = require('../models/user');
var badgeInstance = require('../models/badgeInstance');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const crypto = require('crypto');

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password 
 * @param {string} salt 
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

exports.saltHashPassword = function(userpassword, callback) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);

    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);

    callback(null, passwordData);
}


// Validate user
exports.validateLogin = function(user, myCallback) {
    this.getUserByEmail(user.email, function(err, dbUser){
        if (err) { myCallback(err); }
        if (dbUser == null) {
            myCallback(null, false);            
        }

        var value = sha512(user.password, dbUser.salt);
        myCallback(null, (value.passwordHash === dbUser.password));
    });
}

// Display the list of users
exports.getUsers = function(callback) {
    User.find()
    .sort([['family_name', 'asc']])
    .exec(callback);
}

exports.getUserByEmail = function(email, myCallback) {
    User.findOne({email: email})
        .exec(myCallback);
}

exports.getUserById = function(id, myCallback) {
    async.parallel({
        user: function(callback) {
            User.findById(id)
                .exec(callback);
        },
        user_badges: function(callback) {
            badgeInstance.find({user: id})
            .populate('badge')
            .exec(callback);
        }
    }, myCallback);
}

exports.updateUser = function(id, user, myCallback) {
    User.findByIdAndUpdate(id, user, {}, myCallback);
}

exports.deleteUser = function(id, myCallback) {
    this.getUserById(id, function(err, results) {
        if (err) {myCallback(err)};
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            myCallback(err);
        }
        async.each(
            results.user_badges,
            function(instance, callback) {
                badgeInstance.findByIdAndRemove(instance._id)
                    .exec(callback);
            },
            function(err) {
                if (err) { myCallback(err); };
                User.findByIdAndRemove(results.user._id, myCallback);
            }
        );
    });
}