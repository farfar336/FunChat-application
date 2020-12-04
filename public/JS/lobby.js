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
  $('#enterChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    var chatname=chatsDisplayed.children[chat].innerHTML
    socket.emit("chatApprovedOrNot",chatname)
    
  })

/*---------------- Socket.on events ----------------*/
socket.on("chatApproved",function(){
  $('#lobby').hide();
  $('#chat').css('display', 'contents');
})

socket.on("chatNotApproved",function(){
  alert("this chat is not approved, please wait")
})


/*---------------- Functions ----------------*/
});
