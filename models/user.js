// TABLE NAME : USER (사용자 정보)

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

/* DB schema
  (이름, 이메일(PK), 비밀번호, 페이스북 정보, 카카오톡 정보, 등급(회원/매니저)++, 즐겨찾기*/
var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  facebook: {id: String, token: String, photo: String},
  kakaotalk: {id: String, token: String, photo: String},
  role: {type:String},
  favorite: [{type: Schema.Types.ObjectId, ref: 'Comp_info'}],
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.methods.generateHash = function(password) {
  return bcrypt.hash(password, 10); // return Promise
};

schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password); // return Promise
};

var User = mongoose.model('User', schema);

module.exports = User;
