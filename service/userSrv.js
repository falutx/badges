var User = require('../models/user');
var badgeInstance = require('../models/badgeInstance');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display the list of users
exports.getUsers = function(callback) {
    User.find()
    .sort([['family_name', 'asc']])
    .exec(callback);
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