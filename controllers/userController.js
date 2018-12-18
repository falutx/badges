var User = require('../models/user');
var badgeInstance = require('../models/badgeInstance');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var userSrv = require('../service/userSrv');

exports.user_signup_get = function(req, res, next) {
    res.render('userForm', {title: 'User Sign up'});
}

exports.user_login_get = function(req, res, next) {
    res.render('userLogin', {title: 'User login'});
}

// Check user  password
exports.user_login_post = [
    // Sanitize fields.
    sanitizeBody('email').trim().escape(),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('userForm', { title: 'Create user', user: req.body, errors: errors.array() });
            return;
        }
        // Data from form is valid
        // Create user data
        var user = new User({
            email: req.body.email,
            password: req.body.password
        });

        userSrv.validateLogin(user, function(err, isOk) {
            if (err) { return next(err); }
            if (isOk) {
                // Create session cookie
            } else {
                res.render('userLogin', {title: 'User login', errors: [{msg:'Invalid credentials'}]})
            }
        })
}]

// Display the list of users
exports.user_list = function(req, res, next) {
    userSrv.getUsers(function(err, list) {
        if (err) { return next(err); }
        res.render('userList', {title: 'User List', userList: list});
    });
}

// Display detail page for one user
exports.user_detail = function(req, res, next) {
    userDisplay(req, res, next, "userDetail", "User detail");
}

// Display create form for one user on GET
exports.user_create_get = function(req, res) {
    res.render('userForm', {title: 'Create user'});
}

// Handle create form for one user on POST
exports.user_create_post = [
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
            res.render('userForm', { title: 'Create user', user: req.body, errors: errors.array() });
            return;
        } else {
            // Data from form is valid
            // Create user data
            var user = new User({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
                password: req.body.password
            });

            userSrv.saltHashPassword(user.password, function(err, data){
                if (err) {next(err);}
                user.password = data.passwordHash;
                user.salt = data.salt;

                // User creation
                user.save(function(err){
                    if (err) {return next(err);}
    
                    res.redirect(user.url);
                });    
            });
        }
    }
]

// Display delete form for one user on GET
exports.user_delete_get = function(req, res, next) {
    userDisplay(req, res, next, "userDelete", "Delete User");
}

// Handle delete form for one user on POST
exports.user_delete_post = function(req, res, next) {
    userSrv.deleteUser(req.params.id, function(err){
        if (err) { return next(err); };        
        res.redirect('/users');
    });
}

// Display update form for one user on GET
exports.user_update_get = function(req, res, next) {
    userDisplay(req, res, next, "userForm", "User update");
}

// Handle update form for one user on POST
exports.user_update_post = [
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
            res.render('userForm', { title: 'User update', user: req.body, errors: errors.array() });
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

            if (req.body.password !== "") {
                user.password = req.body.password;
                userSrv.saltHashPassword(user.password, function(err, data){
                    if (err) {next(err);}
                    user.password = data.passwordHash;
                    user.salt = data.salt;
    
                    // User update
                    userSrv.updateUser(req.params.id, user, function(err, theUser){
                        if (err) { return next(err); }
        
                        res.redirect(theUser.url);
                    });    
                });
            } else {
                userSrv.updateUser(req.params.id, user, function(err, theUser){
                    if (err) { return next(err); }
    
                    res.redirect(theUser.url);
                });    
            }
        }
    }
]

function userDisplay(req, res, next, template, title) {
    userSrv.getUserById(req.params.id, function(err, results) {
        if (err) {return next(err)};
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }

        res.render(template, {title: title, user: results.user, user_badges: results.user_badges});
    });
}