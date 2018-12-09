// TABLE NAME : COMP_INFO (공모전 정보)

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

/* DB schema
  (공모전 정보의 스키마: 업로드 가능한지, 글쓴이, 글제목, 본문(공모요강을 써야 할 부분/UI에서 언급필요), 주제, 장소(맵), 위도, 경도,
  태그, 기한, 참가대상, 좋아요수, 댓글수, 조회수, 주최사, 담당자, 연락처, 홍보용이미지, 참고할 정보(선택입력/기타정보해당))*/
var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  topic: {type: String, trim:true, required:true},
  location: {type: String, trim: true, required: false},
  location_map: {type: String, trim: true, required: false},
  lat:{type:String},
  lng:{type:String},
  tags: [String],
  start: {type:String, required: false},
  end: {type:String, required: false},
  applicant: {type: String, required: false},
  special: {type: Number, default:0},
  numLikes: {type: Number, default: 0},
  numComments: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  host: {type: String, trim:true},
  manager: {type: String, trim:true},
  contact: {type: String, trim:true},
  //img: {type: String},  // 이미지의 path를 저장하기 위해 추가 1209:본문삽입으로 수정
  ref: {type: String},
  ulif: {type:String},
  off: {type:Number, default:0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);
var Comp_info = mongoose.model('Comp_info', schema);

module.exports = Comp_info;
