$(function () {
  $('#returnToProfileButton').click(function(){
    $('#editProfile').hide();
    $('#profile').show();
  })

  $('#editProfileToHomeButton').click(function(){
    $('#editProfile').hide();
    $('#home').show();
  })
});