var async = require('async');
var Badge = require("../models/badge");
var badgeInstance = require('../models/badgeInstance');
var User = require('../models/user');

exports.getBadges = function(myCallback) {
    Badge.find({}, 'title image')
    .exec(myCallback);
};

exports.getBadge = function(id, myCallback) {
    Badge.findById(id)
    .exec(myCallback); 
}

exports.updateBadge = function(id, badge, myCallback) {
    Badge.findByIdAndUpdate(id, badge, {}, myCallback);
}