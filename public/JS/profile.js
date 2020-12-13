//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Profile ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
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

  //Button that directs user from profile to chat screen
  $('#profileToChatButton').click(function(){
    $('#profile').hide();
    $('#chat').show();
    $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
  })

  //Button that directs user from profile to home screen
  $('#profileToHomeButton').click(function(){
    $('#profile').hide();
    $('#home').show();
    socket.emit("leave chat");
  })

  /*---------------- Socket.on events ----------------*/
  socket.on('show profile success', (res) => {
    viewedUserID = res.id;

    $('#dispName').html(`Display Name: ${res.name}`);
    $('#acctType').html(`Account Type: ${res.type}`);
  });

  socket.on('show profile error', (res) => {
    alert(res);
  });
});
