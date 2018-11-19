$(function() {
  $('.need-confirm-btn').click(function() {
    if (confirm('정말 삭제하시겠습니까?')) {
      return true;
    }
    return false;
  });
});
