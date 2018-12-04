$(function() {
  $('.comp_info-like-btn').click(function(e) {
    var $el = $(e.currentTarget); //-눌러진 부분 레퍼런스
    if ($el.hasClass('loading')) return;
    $el.addClass('loading');
    $.ajax({
      url: '/api/comp_infos/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $('.comp_info .num-likes').text(data.numLikes);
        $('.comp_info-like-btn').hide();
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('로그인이 필요합니다.');
          location = '/signin';
        }
        console.log(data, status);
      },
      complete: function(data) {
        $el.removeClass('loading');
      }
    });
  });

  $('.comment-like-btn').click(function(e) {
    var $el = $(e.currentTarget);
    if ($el.hasClass('disabled')) return;
    $.ajax({
      url: '/api/comments/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $el.parents('.comment').find('.num-likes').text(data.numLikes);
        $el.addClass('disabled');
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('로그인이 필요합니다.');
          location = '/signin';
        }
        console.log(data, status);
      }
    });
  });
}); 