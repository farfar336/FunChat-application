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
  let viewedUserID ="";
  
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
      $('#chatApprovalButtons').hide();
    }
    else if(userType == "Moderator"){
      $('#chatApprovalButtons').show();
    }
  })  

  //a button in lobby page, take user to home
  $('#lobbyToHomeButton').click(function(){
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

  $('#createChatToHomeButton').click(function(){
    $('#chatCreate').hide();
    $('#home').show();
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
  
  //Home to friends page button
  $('#friendsButton').click(function(){
    $('#home').hide();
    $('#friends').show();
    //Show the most updated version of the friends page
    refreshFriends();
  });

  //Return to home button
  $('#friendsToHomeButton').click(function(){
    $('#friends').hide();
    $('#home').show();
  });

  //Function to refresh the friends page after changes
  function refreshFriends(){
    //Get friend requests and added friends from the database
    socket.emit('fetch friend requests', userID);
    socket.emit('fetch added friends', userID);
  }

  //Displays any error messages
  socket.on('friends page error', function(msg){
    alert(msg);
  });

  //Update the 'Friend Requests' section 
  socket.on('display friend requests successful', function(requests){
    $('#friendRequests').html("");
    if(requests.length > 0){
      $.each(requests, function(index, value) {
        $('#friendRequests').append("<div id=\"" + "req-" + value._id + "\" class=\"userTile flexCol\"><img src=\"/Images/person-icon.png\" width=\"30%\"><p class=\"dispName\">" + value.displayName + "</p><p class=\"acctType\">" + value.type + "</p><div id=\"" + "dec-" + value._id + "\" class=\"reqDecision flexRow\"><img class=\"accept\" src=\"/Images/accept.png\" width=\"20%\"><img class=\"decline\" src=\"/Images/decline.jpg\" width=\"20%\"></div></div>");
      });
    }
    else $('#friendRequests').append("<p class=\"emptyFriends\">There are no friend requests.</p>");
    
  });

  //Update the 'Added Friends' section
  socket.on('display added friends successful', function(requests){
    $('#approvedFriends').html("");
    if(requests.length > 0){
      $.each(requests, function(index, value) {
        $('#approvedFriends').append("<div id=\"" + "req-" + value._id + "\" class=\"userTile flexCol\"><img src=\"/Images/person-icon.png\" width=\"30%\"><p class=\"dispName\">" + value.displayName + "</p><p class=\"acctType\">" + value.type + "</p><div class=\"unFriend\">Unfriend</div></div>");
      });
    }
    else $('#approvedFriends').append("<p class=\"emptyFriends\">You don't have any friends added yet. Enter a display name to send a request!</p>");
    
  });
  
  //Enter a display name in the search box and click the send button
  $('#submitFriend').click(function(){
    if($('#friendName').val() === displayName) alert("You cannot send a friend request to yourself!")
    else socket.emit('send friend request', {senderID:userID, senderName:displayName, receiver:$('#friendName').val(), senderType:userType});
    $('#friendName').val('')
  });


  //Give user message when friend request sent successfully
  socket.on('friend request success', function(msg){
    alert(msg);
  })

  //Refresh the friends page when a new request arrives, request is accepted/decline or a user is unfriended
  socket.on('friend lists refresh', function(obj){
    if(obj.user == userID || obj.friend == userID){
      refreshFriends();
    }
  })


  //Event handler for user accepting a friend request
  $("#friendRequests").on( "click", ".accept", function() {
    //Get the id of the friend requesting to be added. 
    let pid = $(this).parent().attr("id");
    //In the parent div of the buttons it is stored as dec-id so we are using substring to remove dec-
    pid = pid.substring(4);

    socket.emit('accept friend request', {user:userID, request:pid});
  });

  //Event handler for user rejecting a friend request
  $("#friendRequests").on( "click", ".decline", function() {
    //Get the id of the friend requesting to be added. 
    let pid = $(this).parent().attr("id");
    pid = pid.substring(4);

    socket.emit('decline friend request', {user:userID, request:pid});
  });

  //Event handler for user unfriending another user
  $("#approvedFriends").on( "click", ".unFriend", function() {
    //Get the id of the friend to be removed. 
    let pid = $(this).parent().attr("id");
    pid = pid.substring(4);

    socket.emit('unfriend', {user:userID, friend:pid});
  });

  //Event handler for viewing friend's profile
  $(".tileContainers").on( "click", ".dispName", function() {
    //Get the id of the friend. 
    let pid = $(this).parent().attr("id");
    pid = pid.substring(4);

    //store id of friend to use in fetching profile info from database
    viewedUserID = pid;
    $('#friends').hide();
    $('#profile').show();

    $('#editProfileButton').hide();
    $('#profileToFriendsButton').show();
  });
     
  //Profile Page Logic

  $('#profileButton').click(function(){
    $('#home').hide();
    $('#profile').show();

    //To-do Backend: Use id stored in 'viewedUserID' to fetch profile details
    //Clicking this button will show current user's profile
    //Clicking a display name in the friends page will store friend's id in 'viewedUserID'
    viewedUserID = userID;
    
    //If user is viewing their own profile
    if (userID == viewedUserID){
      $('#editProfileButton').show();
      $('#profileToHomeButton').show();
      $('#profileToFriendsButton').hide();
    }
  })

  $('#editProfileButton').click(function(){
    $('#profile').hide();
    $('#editProfile').show();
  })

  $('#returnToProfileButton').click(function(){
    $('#editProfile').hide();
    $('#profile').show();
  })
  
  $('#profileToFriendsButton').click(function(){
    $('#profile').hide();
    $('#friends').show();
    refreshFriends();
  })

  $('#editProfileToHomeButton').click(function(){
    $('#editProfile').hide();
    $('#home').show();
  })

  $('#profileToHomeButton').click(function(){
    $('#profile').hide();
    $('#home').show();
  })
  
});
