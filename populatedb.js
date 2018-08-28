#! /usr/bin/env node

console.log('This script populates some test instances in the DB. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var User = require('./models/user')
var BadgeInstance = require('./models/badgeInstance')
var Badge = require('./models/badge')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []
var badgeInstances = []
var badges = []

function userCreate(email, first_name, family_name, d_birth, cb) {
  userdetail = {email: email, first_name: first_name , family_name: family_name }
  if (d_birth != false) userdetail.date_of_birth = d_birth
  
  var user = new User(userdetail);
       
  user.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New User: ' + user);
    users.push(user)
    cb(null, user)
  }  );
}

function badgeInstanceCreate(user, badge, dObtained, cb) {
  var badgeInstance = new BadgeInstance({ user: user, badge:badge, dateObtained:dObtained });
       
  badgeInstance.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New user badge: ' + badgeInstance);
    badgeInstances.push(badgeInstance)
    cb(null, badgeInstance);
  }   );
}

function badgeCreate(title, image, cb) {
  badgeDetail = { 
    title: title,
    image: image
  }
    
  var badge = new Badge(badgeDetail);    
  badge.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New badge: ' + badge);
    badges.push(badge)
    cb(null, badge)
  }  );
}

function createUsers(cb) {
    async.parallel([
        function(callback) {
            userCreate('garciac@unicc.org', 'Carlos', 'Garcia', '1976-09-19', callback);
        },
        function(callback) {
            userCreate('smith@company.com', 'John', 'Smith', '1956-01-11', callback);
        },
        function(callback) {
            userCreate('morrisp@organization.org', 'Patricia', 'Morris', '1982-06-09', callback);
        }
        ],
        // optional callback
        cb);
}


function createBadges(cb) {
    async.parallel([
        function(callback) {
            badgeCreate('Best of the world', '', callback);
        },
        function(callback) {
            badgeCreate('Best team player of the week', '', callback);
        },
        function(callback) {
            badgeCreate('Agile Master', '', callback);
        }
        ],
        // optional callback
        cb);
}


function createBadgeInstances(cb) {
    async.parallel([
        function(callback) {
            badgeInstanceCreate(users[0], badges[0], '2016-04-01', callback)
        },
        function(callback) {
            badgeInstanceCreate(users[0], badges[1], '2017-10-11', callback)
        },
        function(callback) {
            badgeInstanceCreate(users[0], badges[2], '2018-01-01', callback)
        },
        function(callback) {
            badgeInstanceCreate(users[1], badges[1], '2018-05-11', callback)
        },
        function(callback) {
            badgeInstanceCreate(users[2], badges[1], '2018-06-01', callback)
        },
        function(callback) {
            badgeInstanceCreate(users[2], badges[1], '2017-03-05', callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createUsers,
    createBadges,
    createBadgeInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Badges: '+badges);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




