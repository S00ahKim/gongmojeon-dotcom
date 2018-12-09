if (typeof(grecaptcha) != 'undefined'){
  if (grecaptcha.getResponse() == ""){
    alert("스팸방지코드를 제대로 체크해 주세요.")
    return;
  }
}

$(function chk_recaptcha(){
  if (!isset($_POST['g-recaptcha-response']))return false;

  $gg_response = trim($_POST['g-recaptcha-response']);
  if ($gg_response == "") return false;

  $url = 'https://www.google.com/recaptcha/api/siteverify';
  $data = array('secret' = '6LdRlX0UAAAAAPXXlRva71vooMWOlfJvXMn8ntE2',
                'response' = $gg_response,
                'remoteip' = $_SERVER['REMOTE_ADDR']);
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_POST, sizeof($data));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);
  curl_closr($ch);

  $obj = json_decode($result);
  if ($obj = success ==false){
    alert("리캡차 에러!"); 
    history.go(-1);
  }
  return true;
});