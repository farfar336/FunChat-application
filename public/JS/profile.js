$(function () {
  $('#editProfileButton').click(function(){
      $('#profile').hide();
      $('#editProfile').show();
    })

  $('#profileToFriendsButton').click(function(){
    $('#profile').hide();
    $('#friends').show();
    refreshFriends();
  })

  $('#profileToHomeButton').click(function(){
    $('#profile').hide();
    $('#home').show();
  })
});