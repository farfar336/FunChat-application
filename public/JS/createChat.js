//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- createChat ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
  // Button that directs user from chat create to lobby screen and show updated list of chats
  $('#createChatToLobby').click(function(){
    $('#lobby').show();
    $('#chatCreate').hide();
    updateChats();
  })

  // Button that directs user from chat create to home screen
  $('#createChatToHomeButton').click(function(){
    $('#chatCreate').hide();
    $('#home').show();
  })

  // Button that requests creating a chat
  $('#submitChat').click(function(){
    let chatUsers = [];
    let chatMods = [];
    if($('#usersDisplay').val() !== null) chatUsers = $('#usersDisplay').val();
    if($('#modDisplay').val() !== null) chatMods = $('#modDisplay').val();
    if(userType === "Moderator") chatMods.push(displayName);
    else chatUsers.push(displayName);
    if((chatUsers.length + chatMods.length) === 1) alert("Please select at least one participant");
    else socket.emit('create chat', {users: chatUsers, mods: chatMods, chatname: $('#chatname').val(), userType: userType});
    
  })

   //Button that removes a chat
   $('#removeChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    var name=chatsDisplayed.children[chat].innerHTML
    socket.emit("removeChat",name)
    chatsDisplayed.options.remove(chat);
  })  

  //Button that approves chat creation request
  $('#approveChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    chatsDisplayed.children[chat].style.fontWeight="bold"
    var name=chatsDisplayed.children[chat].innerHTML
    socket.emit("approveChat",name)
    alert(name + " has been approved");
  })

  /*---------------- Socket.on events ----------------*/
  // Removes the current list of users and mods displayed, and then displays their updated version
  socket.on('user list for create chat', function(userObj){
    //clear all previous information
    $('#usersDisplay').empty();
    $('#modDisplay').empty();
    
    for(let i = 0; i < userObj.length; i++)
    { 
      if(userObj[i].type === "Moderator")
      {
        $('#modDisplay').append($('<option>', {
          value: userObj[i].displayName,
          text: userObj[i].displayName
        }));
      }
      else{
        $('#usersDisplay').append($('<option>', {
          value: userObj[i].displayName,
          text: userObj[i].displayName 
        }));
      }
    }
  })

  // If chat creation request was succesful, notify the user and add it to the list of chats
  socket.on('chat create success', function(userObj){
    $('#chatname').val('');    //clear the chat name text box
    updateChats();
    alert(userObj);
    $('#lobby').show();
    $('#chatCreate').hide();
  })
    
  // If chat creation request was unsuccesful, notify the user
  socket.on('chat create failure', function(userObj){
    alert(userObj);
  })
});
