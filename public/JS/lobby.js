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
    socket.emit('get users for create chat', userID);
  })

  //Button that directs user from lobby to chat screen
  $('#enterChatButton').click(() => {
    let chatname = $('#chatsDisplayed option:selected').text();
    if(chatname !== "") socket.emit("chatApprovedOrNot",chatname)
    else alert("Please select a chat to enter");
    
    
  });

  /*---------------- Socket.on events ----------------*/

  //if user enter a approved chat
  socket.on("chatApproved",function(chatname){
    socket.emit('join chat', {
      name: chatname
    });

  //Make chat users selectable - additional code disables multiple selections
  $('#chatUsers').selectable({selected: function(event, ui){
    $(ui.selected).addClass('ui-selected').siblings().removeClass('ui-selected');
   }
  });
  
  //Make chat messages selectable - currently multiple selections allowed
  $('#chatMessages').selectable();

    // If person is a regular user, hide remove user and message buttons
    if (userType == "User"){
      $('#chatRemoveUserButton').hide();
      $('#chatRemoveMessageButton').hide();
    }
    else{
      $('#chatRemoveUserButton').show();
      $('#chatRemoveMessageButton').show();
    }

    // Clear previous chat information
    $('#chatMessages').empty();
    $('#chatUsers').empty();
    $('#chatTitle').html('');
    $('#lobby').hide();
    $('#chat').css('display', 'contents');
  })

  //if user try to enter a not approved chat
  socket.on("chatNotApproved",function(){
    alert("You can't enter this chat as it is not approved yet")
  })

  socket.on("update chats for all",function(){
    updateChats();
  })
});
