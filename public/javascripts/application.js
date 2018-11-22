$(function () {
  $('.need-confirm-btn').click(function () {
    if (confirm('정말 삭제하시겠습니까?')) {
      return true;
    }
    return false;
  });
});

$(document).ready(function () {
  $('.summernote').summernote({
    lang: 'ko-KR'
  });
});

$('.summernote').summernote({
  height: 300,                 // set editor height
  minHeight: 300,             // set minimum height of editor
  maxHeight: 300,             // set maximum height of editor
  focus: true                  // set focus to editable area after initializing summernote
});

$('.summernote').summernote({
  toolbar: [
    // [groupName, [list of button]]
    ['style', ['bold', 'italic', 'underline', 'clear']],
    ['font', ['strikethrough', 'superscript', 'subscript']],
    ['fontsize', ['fontsize']],
    ['color', ['color']],
    ['para', ['ul', 'ol', 'paragraph']],
    ['height', ['height']]
  ]
});

$(".btn.btn-outline-primary").click(function() {
  $('textarea[name="content"]').val($('.summernote').summernote('code'));
});