//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Edit Profile ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
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

/*---------------- Socket.on events ----------------*/
/*---------------- Functions ----------------*/
});
