var User = require('../models/user');
var badgeInstance = require('../models/badgeInstance');

exports.getBadgesByUserEmail = function(email, myCallback) {
    User.find({email: email})
        .exec(function(err, user) {
            if (err) {myCallback({email: email, error: err});}

            if (user == null) {
                var err = new Error('User not found');
                err.status = 404;
                myCallback(err);
            }
            badgeInstance.find({user: user[0]._id})
                .populate('badge')
                .exec(myCallback);
        });
}
