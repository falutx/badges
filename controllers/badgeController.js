var Badge = require("../models/badge");
var badgeInstance = require('../models/badgeInstance');
var User = require('../models/user');
var BadgeSrv = require("../service/badgeSrv");
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {
    BadgeSrv.getBadges(function(err, results) {
        res.render('index', {title: 'Showcase Home', error: err, data: results });
    });

    async.parallel({
        badge_count: (callback) => {
            Badge.countDocuments({}, callback);
        },
        badgeInstance_count: (callback) => {
            badgeInstance.countDocuments({}, callback);
        },
        user_count: (callback) => {
            User.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', {title: 'Showcase Home', error: err, data: results });
    });
}

// Display the list of badges
exports.badge_list = function(req, res, next) {
    BadgeSrv.getBadges(function(err, badges) {
        if (err) {return next(err); }
        res.render('badgeList', {title: 'Badge List', badges: badges});
    });
}

// Display detail page for one badge
exports.badge_detail = function(req, res, next) {
    async.parallel({
        badge: function(callback) {
            BadgeSrv.getBadge(req.params.id, callback);
        },
        badgeInstances: function(callback) {
            badgeInstance.find({badge: req.params.id})
            .populate('user')
            .exec(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.badge==null) { // Badge not found
            var err = new Error('Badge not found');
            err.status = 404;
            return next(err);
        }

        // found, lets render
        res.render('badgeDetail', {title: 'Badge Details', badge: results.badge, badgeInstances:results.badgeInstances});
    });
}

// Display create form for one badge on GET
exports.badge_create_get = function(req, res, next) {
    res.render('badgeForm', {title: 'Create badge'});
}

// Handle create form for one badge on POST
exports.badge_create_post = [
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
            res.render('badgeForm', { title: 'Create badge', badge: req.body, errors: errors.array() });
            return;
        } else {
            // Data from form is valid
            // Create badge data
            var badge = new Badge({
                title: req.body.title,
                image: req.body.image
            });

            badge.save(function(err){
                if (err) {return next(err);}

                res.redirect(badge.url);
            });
        }
    }
]

// Display delete form for one badge on GET
exports.badge_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Badge delete GET');
}

// Handle delete form for one badge on POST
exports.badge_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Badge delete POST');
}

// Display update form for one badge on GET
exports.badge_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Badge update GET');
}

// Handle update form for one badge on POST
exports.badge_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Badge update POST');
}