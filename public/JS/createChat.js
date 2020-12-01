$(function () {
/*--------------------------------------------------- Click events ---------------------------------------------------*/
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
    //Check if user has selected themselves or not. We cannot allow a user to create a chat in which they are not participating
    if($('#modDisplay').val().includes(displayName) || $('#usersDisplay').val().includes(displayName)){
      socket.emit('create chat', {users: $('#usersDisplay').val(), mods: $('#modDisplay').val(), chatname: $('#chatname').val()});
      $('#chatname').val('');    //clear the chat name text box
    }
    else alert("Please include yourself as a participant in this chat");
  })

   //Button that rejects chat creation request
   $('#rejectChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    var name=chatsDisplayed.children[chat].innerHTML
    socket.emit("rejectChat",name)
    chatsDisplayed.options.remove(chat);
  })  

  //Button that approves chat creation request
  $('#approveChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    var name=chatsDisplayed.children[chat].innerHTML
    socket.emit("approveChat",name)
    alert(name + " has been approved");
  })

/*--------------------------------------------------- Socket.on events ---------------------------------------------------*/
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
    updateChats();
    alert(userObj);
    $('#lobby').show();
    $('#chatCreate').hide();
  })
    
  // If chat creation request was unsuccesful, notify the user
  socket.on('chat create failure', function(userObj){
    alert(userObj);
  })
 
/*--------------------------------------------------- Functions ---------------------------------------------------*/
  // Updates the list of chats
  function updateChats(){
    //Emit an event to server to pull the latest chat list
    socket.emit("refreshChatList", userID);

    //read a  array from server, this array called chats will include all the chat room name
    socket.on('updateChats', function(chats){
      var chatsDisplayed = document.getElementById("chatsDisplayed");
      //clear current chat displayed
      chatsDisplayed.innerHTML="";
      console.log(chats)
      chats.forEach(element => {
        var chat=document.createElement("option");
        chat.innerHTML=element;
        chatsDisplayed.appendChild(chat)
      });
    })
  }
});
