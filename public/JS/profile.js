$(function () {
 /*--------------------------------------------------- Click events ---------------------------------------------------*/
  //Button that directs user from profile to edit profile screen
  $('#editProfileButton').click(function(){
      $('#profile').hide();
      $('#editProfile').show();
    })

  //Button that directs user from profile to friends screen
  $('#profileToFriendsButton').click(function(){
    $('#profile').hide();
    $('#friends').show();
    refreshFriends();
  })

  //Button that directs user from profile to home screen
  $('#profileToHomeButton').click(function(){
    $('#profile').hide();
    $('#home').show();
  })

/*--------------------------------------------------- Socket.on events ---------------------------------------------------*/
/*--------------------------------------------------- Functions ---------------------------------------------------*/
});