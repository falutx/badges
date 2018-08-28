var badgeInstance = require('../models/badgeInstance');
var User = require('../models/user');
var Badge = require("../models/badge");

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display the list of badgeInstances
exports.badgeInstance_list = function(req, res, next) {
    badgeInstance.find({user: req.params.userId})
    .populate('badge')
    .populate('user')
    .exec((err, badgeInstanceList) => {
        if (err) { return next(err); }
        res.render('badgeInstanceList', {title: 'Badges obtained by user', badgeInstanceList: badgeInstanceList});
    });
}

// Display detail page for one badgeInstance
exports.badgeInstance_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: badgeInstance detail: ' + req.params.id);
}

// Display create form for one badgeInstance on GET
exports.badgeInstance_create_get = function(req, res, next) {
    instanceDisplay(req, res, next, 'badgeInstanceForm', 'Add Badge');
}

// Handle create form for one badgeInstance on POST
exports.badgeInstance_create_post = [
    // Validate fields.
    body('user', 'User must not be empty.').isLength({ min: 1 }).trim(),
    body('badge', 'badge must not be empty.').isLength({ min: 1 }).trim(),
    body('dateObtained', 'Invalid date obtained').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create badge instace with sanitized data
        var badgeInst = new badgeInstance({
            user:  req.body.user,
            badge: req.body.badge,
            dateObtained: req.body.dateObtained
        });
        
        if (!errors.isEmpty()) {
            async.parallel({
                user: function(callback) {
                    User.findById(req.params.userId, callback);
                },
                badges: function(callback) {
                    Badge.find(callback);
                }
            }, function(err, results){
                if (err) { next(err); }
                res.render('badgeInstanceForm', {title: 'Add badge', user: results.user, badges: results.badges, badgeInstance: badgeInst, errors: errors.array() });
            });
        
        } else {
            badgeInst.save(function(err){
                if (err) {return next(err);}
                User.findById(badgeInst.user, function(err, result) {
                    if (err) {return next(err);}
                    res.redirect(result.url);
                });
            });
        }
    }
]

// Display delete form for one badgeInstance on GET
exports.badgeInstance_delete_get = function(req, res, next) {
    badgeInstance.findById(req.params.id)
        .populate('user')
        .populate('badge')
        .exec(function(err, result) {
            if (err) {next(err);}
            res.render('badgeInstanceDelete', {title: 'Delete Badge Instance', badgeInstance: result});
        })
}

// Handle delete form for one badgeInstance on POST
exports.badgeInstance_delete_post = function(req, res, next) {
    badgeInstance.findById(req.body.badgeInstanceId)
        .populate('user')
        .exec(function(err, result) {
            if (err) {next(err);}

            var user = result.user;
            // Badge instance exists
            badgeInstance.findByIdAndRemove(req.body.badgeInstanceId, function(err){
                if (err) {next(err);}
                res.redirect(user.url);
            });
        });
}

// Display update form for one badgeInstance on GET
exports.badgeInstance_update_get = function(req, res, next) {
    instanceDisplay(req, res, next, 'badgeInstanceForm', 'Update Badge', req.params.id);
}

// Handle update form for one badgeInstance on POST
exports.badgeInstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: badgeInstance update POST');
}

function instanceDisplay(req, res, next, template, title, badgeId) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.userId, callback);
        },
        badges: function(callback) {
            Badge.find(callback);
        }
    }, function(err, results){
        if (err) { next(err); }

        if (badgeId) {
            var badgeInst =  badgeInstance.findById(badgeId)
            .exec(function(err, result) {
                if (err) { next(err); }
                res.render(template, {title: title, user: results.user, badges: results.badges, badgeInstance: result}); 
            });
        } else {
            var badgeInst = new badgeInstance({
                user:  results.user,
                dateObtained: new Date()
            });
            res.render(template, {title: title, user: results.user, badges: results.badges, badgeInstance: badgeInst});    
        }
    });
}