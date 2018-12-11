// TABLE NAME : COMMENT (댓글)

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

/* DB schema
  (글쓴이, 해당글, 댓글내용, 좋아요횟수)*/
var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  compInfo: { type: Schema.Types.ObjectId, ref: 'CompInfo' },
  content: {type: String, trim: true, required: true},
  numLikes: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Comment = mongoose.model('Comment', schema);

module.exports = Comment;
