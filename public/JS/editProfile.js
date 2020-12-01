$(function () {
/*--------------------------------------------------- Click events ---------------------------------------------------*/
  //Button that directs user from edit profile to profile screen
  $('#returnToProfileButton').click(function(){
    $('#editProfile').hide();
    $('#profile').show();
  })

  //Button that directs user from edit profile to home screen
  $('#editProfileToHomeButton').click(function(){
    $('#editProfile').hide();
    $('#home').show();
  })

/*--------------------------------------------------- Socket.on events ---------------------------------------------------*/
/*--------------------------------------------------- Functions ---------------------------------------------------*/
});