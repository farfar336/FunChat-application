/*
Client-side JavaScript for the application.
Deals with button clicks and displays correct module based on login/registration status
*/

$(function () {
  let socket = io();

  //userID variable stores current user's database id upon login for future database queries
  let userID = "";
  let displayName = "";
  let userType = "";
  
  //Event handler for login button
  $('#loginButton').click(function(){
    let email = $('#logEmail').val();
    let password = $('#logPassword').val();

    socket.emit('login', {em:email, pass:password});
    
    $('#logEmail').val('');
    $('#logPassword').val('');
  });
  
  //Event handler for registration form button
  $('#registerButton').click(function(){
    $('#loginForm').hide();
    $('#registerForm').show();
  });

  //Event handler for register as user or moderator button
  $('.regButton').click(function(){
    let userType = $(this).attr("id");
    let email = $('#regEmail').val();
    let password = $('#regPassword').val();
    let displayName = $('#regDispName').val();

    //checking to see if any field is left blank
    if(email.trim() != "" && password.trim() != "" && displayName.trim() != ""){
      socket.emit('register', {em:email, pass:password, dn:displayName, type:userType});
      $('#regEmail').val('');
      $('#regPassword').val('');
      $('#regDispName').val('');
    }
    else alert("Please fill all required fields");
  });

  //Event handler for return to login link in registration form
  $('#returnToLoginLink').click(function(){
    $('#registerForm').hide();
    $('#loginForm').show();

    //clear registration form in case anything was entered
    $('#regEmail').val('');
    $('#regPassword').val('');
    $('#regDispName').val('');
  })

  //Server returns registration error
  socket.on('register error', function(msg){
    alert(msg);
  })

  //Server returns registration success
  socket.on('register success', function(msg){
    alert("Registration successful!");
    $('#registerForm').hide();
    $('#loginForm').show();
  })

  //Server returns login error
  socket.on('login error', function(msg){
    alert(msg);
  })

  // Note:  May need to store other variables as well such a displayname to reduce the amount of socket events
  socket.on('login success', function(userObj){
    $('#authentication').hide();
    $('#home').show();
    $('#displayName').text("Welcome " + userObj.displayName + "!");
    userID = userObj._id;     //store user's id for future database queries
    displayName = userObj.displayName;
    userType = userObj.type;
  })

  //a button in home,take user to lobby,
  $('#lobbyButton').click(function(){
    $('#home').hide();
    $('#lobby').show();
    updateChats();

    //Buttons displayed based on user type
    if (userType == "User"){
      $('#approveChatButton').hide();
      $('#rejectChatButton').hide();
    }
    else if(userType == "Moderator"){
      $('#approveChatButton').show();
      $('#rejectChatButton').show();
      
    }
  })  

  //a button in lobby page, take user to home
  $('#homeToLobbyButton').click(function(){
    $('#lobby').hide();
    $('#home').show();
  })
  
  //a button in home page take user to login page
  $('.logOutButton').click(function(){
    $('#authentication').siblings().hide();
    $('#authentication').show();
  })

  
  /**
   * @Section Chat Creation
   */
  $('#createChatButton').click(function(){
    $('#lobby').hide();
    $('#chatCreate').show();
    socket.emit('get users for create chat', {});
  })
  $('#createChatToLobby').click(function(){
    $('#lobby').show();
    $('#chatCreate').hide();
    updateChats();
  })


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

    console.log(userObj);
  })

  $('#submitChat').click(function(){
    //Check if user has selected themselves or not. We cannot allow a user to create a chat in which they are not participating
    if($('#modDisplay').val().includes(displayName) || $('#usersDisplay').val().includes(displayName)){
      socket.emit('create chat', {users: $('#usersDisplay').val(), mods: $('#modDisplay').val(), chatname: $('#chatname').val()});
      $('#chatname').val('');    //clear the chat name text box
    }
    else alert("Please include yourself as a participant in this chat");
  })

  socket.on('chat create success', function(userObj){
    updateChats();
    alert(userObj);
    $('#lobby').show();
    $('#chatCreate').hide();
  })

  socket.on('chat create failure', function(userObj){
    alert(userObj);
  })

  //a button take user to char create page
  $('#createChatButton').click(function(){
    $('#lobby').hide();
    $('#chatCreate').show();
  })

  //reject chat room button, delete this chat, and send the chat name to server
  $('#rejectChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    var name=chatsDisplayed.children[chat].innerHTML
    socket.emit("rejectChat",name)
    chatsDisplayed.options.remove(chat);
  })  

//approved chat button, will approved this chat, send the chat name to server
  $('#approveChatButton').click(function(){
    var chatsDisplayed = document.getElementById("chatsDisplayed")
    var chat = chatsDisplayed.selectedIndex;
    var name=chatsDisplayed.children[chat].innerHTML
    socket.emit("approveChat",name)
    alert(name + " has been approved");
   
  })
  

  // this function will upload the chatname at displayed chat
  function updateChats(){
    //Emit an event to server to pull the latest chat list
    socket.emit("refreshChatList", displayName);

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


  // Chat Logic
  $('#enterChatButton').click(function(){
    $('#lobby').hide();
    $('#chat').css('display', 'contents');
  })

  $('#messageForm').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    console.log("emitted message");
    $('#m').val('');
    return false;
  });

  //Friends page logic
  $('#friendsButton').click(function(){
    $('#home').hide();
    $('#friends').show();

    refreshFriends();

  });

  function refreshFriends(){
    //Get friend requests and added friends from the database
    socket.emit('fetch friend requests', userID);
    socket.emit('fetch added friends', userID);

  }

  socket.on('friends page error', function(msg){
    alert(msg);
  });

  socket.on('display friend requests successful', function(requests){
    $('#friendRequests').html("");
    if(requests.length > 0){
      $.each(requests, function(index, value) {
        $('#friendRequests').append("<div id=\"" + "req-" + value._id + "\" class=\"userTile flexCol\"><img src=\"person-icon.png\" width=\"30%\"><p class=\"dispName\">" + value.displayName + "</p><p class=\"acctType\">" + value.type + "</p><div id=\"" + "dec-" + value._id + "\" class=\"reqDecision flexRow\"><img class=\"accept\" src=\"accept.png\" width=\"20%\"><img class=\"decline\" src=\"decline.jpg\" width=\"20%\"></div></div>");
      });
    }
    else $('#friendRequests').append("<p class=\"emptyFriends\">There are no friend requests.</p>");
    
  });

  
  socket.on('display added friends successful', function(requests){
    $('#approvedFriends').html("");
    if(requests.length > 0){
      $.each(requests, function(index, value) {
        $('#approvedFriends').append("<div id=\"" + "req-" + value._id + "\" class=\"userTile flexCol\"><img src=\"person-icon.png\" width=\"30%\"><p class=\"dispName\">" + value.displayName + "</p><p class=\"acctType\">" + value.type + "</p><div class=\"unFriend\">Unfriend</div></div>");
      });
    }
    else $('#friendRequests').append("<p class=\"emptyFriends\">You don't have any friends added yet. Enter a display name to send a request!</p>");
    
  });
  

  $('#friendsToHomeButton').click(function(){
    $('#friends').hide();
    $('#home').show();
  });

  //Enter a display name in the search box and click the send button
  $('#submitFriend').click(function(){
    if($('#friendName').val() === displayName) alert("You cannot send a friend request to yourself!")
    else socket.emit('send friend request', {senderID:userID, senderName:displayName, receiver:$('#friendName').val(), senderType:userType});
    $('#friendName').val('')
  });


  //Event handler for successfully sending friend request
  socket.on('friend request success', function(msg){
    alert(msg);
  })

  //Event handler for an incoming friend request. Refresh the friends page only if it is the sender/receiver of the request
  /*
  socket.on('friend request received', function(obj){
    if(obj.receiver === userID){
      refreshFriends();
    }
  })*/

socket.on('friend lists refresh', function(obj){
  if(obj.user == userID || obj.friend == userID){
    refreshFriends();
  }
})
/*
  socket.on('friend request declined', function(id){
    refreshFriends();
  
})*/

  //Event handler for user accepting a friend request
  $( "#friendRequests" ).on( "click", ".accept", function() {
    //Get the id of the friend requesting to be added. 
    let pid = $(this).parent().attr("id");
    //In the parent div of the buttons it is stored as dec-id so we are using substring to remove dec-
    pid = pid.substring(4);

    socket.emit('accept friend request', {user:userID, request:pid});
  });

  //Event handler for user rejecting a friend request
  $( "#friendRequests" ).on( "click", ".decline", function() {
    //Get the id of the friend requesting to be added. 
    let pid = $(this).parent().attr("id");
    //In the parent div of the buttons it is stored as dec-id so we are using substring to remove dec-
    pid = pid.substring(4);

    socket.emit('decline friend request', {user:userID, request:pid});
  });

  $( "#approvedFriends" ).on( "click", ".unFriend", function() {
    //Get the id of the friend to be removed. 
    let pid = $(this).parent().attr("id");
    //In the parent div of the link it is stored as req-id so we are using substring to remove req-
    pid = pid.substring(4);

    socket.emit('unfriend', {user:userID, friend:pid});
  });
     
});