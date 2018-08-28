// Schema creation
var url = require('url');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var badgeSchema = new Schema({
    title: {type: String, required: true},
    image: {type: String}
});

badgeSchema
.virtual('url')
.get(function() {
    return '/showcase/badges/' + this._id;
});

module.exports = mongoose.model('badge', badgeSchema);