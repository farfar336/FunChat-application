//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Lobby ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/

  //Button that directs user from lobby to home screen
  $('#lobbyToHomeButton').click(function(){
    $('#lobby').hide();
    $('#home').show();
  })

  //Button that directs user from lobby to chat creation screen and tells server to retrieve a list of users
  $('#createChatButton').click(function(){
    $('#lobby').hide();
    $('#chatCreate').show();
    socket.emit('get users for create chat', {});
  })

  //Button that directs user from lobby to chat screen
  $('#enterChatButton').click(function(){
    $('#lobby').hide();

    // If person is a regular user, hide remove user and message buttons
    if (userType == "User"){
      $('#chatRemoveUserButton').hide();
      $('#chatRemoveMessageButton').hide();
    }
    else{
      $('#chatRemoveUserButton').show();
      $('#chatRemoveMessageButton').show();
    }


  })

/*---------------- Socket.on events ----------------*/
/*---------------- Functions ----------------*/
});
