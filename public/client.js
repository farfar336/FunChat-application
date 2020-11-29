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
  $('#logOutButton').click(function(){
    $('#home').hide();
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
  
    // To do: For profile screen backend to complete
  $('#profileButton').click(function(){
    $('#home').hide();
    $('#profile').show();

    //If user is viewing their own profile
    if (userID == viewedUserID){
      $('#editProfileButton').show();
    }
  })  
  
});
