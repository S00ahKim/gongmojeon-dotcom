const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User'},
  comp_info: { type: Schema.Types.ObjectId, ref: 'Comp_info'}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Favorite = mongoose.model('Favorite', schema);

module.exports = Favorite;
