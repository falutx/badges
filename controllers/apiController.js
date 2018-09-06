var Badge = require('../models/badge');
var userSrv = require('../service/userSrv');
var badgesSrv = require('../service/badgeSrv');
var badgesInstancesSrv = require('../service/badgeInstanceSrv');
var url = require('url');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/////////////////////
///      USERS    ///
/////////////////////
// return the list of users
exports.user_list = function(req, res, next) {
    userSrv.getUsers(function(err, list) {
        if (err) {res.send(err);}
        res.send(list);
    });
}

// Get one user
exports.user_get = function(req, res, next) {
    userSrv.getUserById(req.params.id, function(err, results) {
        if (err) {res.send(err);}
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return res.send(err);
        }

        res.send(results)
    })
}

exports.user_delete = function(req, res) {
    res.send('User Deletion to be implemented');
}

exports.user_create = [
    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    // Sanitize fields.
    sanitizeBody('email').trim().escape(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.send(errors);
        } else {
            // Data from form is valid
            // Create user data
            var user = new User({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth
            });

            user.save(function(err){
                if (err) {res.send(err);}

                res.send(user);
            });
        }
    }
]

exports.user_update = [
    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    // Sanitize fields.
    sanitizeBody('email').trim().escape(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.send(errors);
            return;
        } else {
            // Data from form is valid
            // Create user data
            var user = new User({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
                _id: req.params.id
            });

            userSrv.updateUser(req.params.id, user, function(err, theUser){
                if (err) { req.send(err) }

                res.send(theUser);
            });
        }
    }
]

///////////////////////
/// BADGE INSTANCES ///
///////////////////////
exports.badgeInstances_byUserEmail = function(req, res, next) {
    badgesInstancesSrv.getBadgesByUserEmail(req.params.email, function(err, result){
        if (err) {res.send(err);}

        for (var i=0; i < result.length; i++) {
            if (result[i].badge.image && result[i].badge.image.indexOf('http') === -1) {
                result[i].badge.image = url.format({
                    protocol: req.protocol,
                    host: req.get('host'),
                    pathname: result[i].badge.image
                });
            }
        }
        res.send(result);
    });
}

/////////////////////
///     BADGES    ///
/////////////////////
exports.badge_list = function(req, res, next) {
    badgesSrv.getBadges(function(err, results){
        if (err) { res.send(err); }
        res.send(results);
    });
}

exports.badge_get = function(req, res, next) {
    badgesSrv.getBadge(req.params.id, function(err, result) {
        if (err) { res.send(err); }
        res.send(result);
    });
}

exports.badge_update = [
    // Validate fields.
    body('title').isLength({ min: 1 }).trim().withMessage('Title must be specified.'),
    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('image').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.send(errors);
        } else {
            // Data from form is valid
            // Create badge data
            //var badge = req.body;
            var badge = new Badge({
                _id: req.body._id,
                title: req.body.title,
                image: req.body.image
            });

            badgesSrv.updateBadge(req.params.id, badge, function(err){
                if (err) {res.send(err);}

                res.send(badge);
            });
        }
    }
]