// TABLE NAME : COMMENT (about comment_info)

var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

/* DB schema
  (글쓴이, 해당글, 댓글내용, 좋아요횟수)*/
var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  comp_info: { type: Schema.Types.ObjectId, ref: 'comp_info' },
  content: {type: String, trim: true, required: true},
  numLikes: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);
var comment = mongoose.model('comment', schema);

module.exports = comment;