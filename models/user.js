// Schema creation
var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;
var userSchema = new Schema({
    email: {type: String, required: true},
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
});

// Virtual for full name
userSchema
.virtual('name')
.get(function() {
    return this.family_name + ',' + this.first_name;
});

userSchema
.virtual('dateOfBirthStr')
.get(function() {
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
});

// Virtual for URL
userSchema
.virtual('url')
.get(function() {
    return '/users/' + this._id;
});

// Export the model
module.exports = mongoose.model('User', userSchema);