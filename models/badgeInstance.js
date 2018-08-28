// Schema creation
var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var badgeInstanceSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    badge: {type: Schema.Types.ObjectId, ref: 'badge', required: true},
    dateObtained: {type: Date, required: true}
});

badgeInstanceSchema
.virtual('title')
.get(function() {
    return this.badge.title;
})

// Virtual for URL
badgeInstanceSchema
.virtual('url')
.get(function () {
    return '/users/' + this.user._id + '/badges/' + this._id;
});

badgeInstanceSchema
.virtual('dateObtainedStr')
.get(function() {
    return moment(this.dateObtained).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('badgeInstance', badgeInstanceSchema);