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

// if (typeof(grecaptcha) != 'undefined'){
//   if (grecaptcha.getResponse() == ""){
//     alert("스팸방지코드를 제대로 체크해 주세요.")
//     return false;
//   }
// }

// $(function chk_recaptcha(){
//   if (!isset($_POST['g-recaptcha-response']))return false;

//   $gg_response = trim($_POST['g-recaptcha-response']);
//   if ($gg_response == "") return false;

//   $url = 'https://www.google.com/recaptcha/api/siteverify';
//   $data = array('secret' = '6LdRlX0UAAAAAPXXlRva71vooMWOlfJvXMn8ntE2',
//                 'response' = $gg_response,
//                 'remoteip' = $_SERVER['REMOTE_ADDR']);
//   $ch = curl_init();
//   curl_setopt($ch, CURLOPT_URL, $url);
//   curl_setopt($ch, CURLOPT_POST, sizeof($data));
//   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//   $result = curl_exec($ch);
//   curl_closr($ch);

//   $obj = json_decode($result);
//   if ($obj = success ==false){
//     alert("리캡차 에러!"); 
//     history.go(-1);
//   }
//   return true;
// });