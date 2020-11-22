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

    //Buttons displayed based on user type
    if (userType == "User"){
      $('#chatEnterButton').show();
      $('#chatApprovalButtons').hide();
    }
    else if(userType == "Moderator"){
      $('#chatEnterButton').hide();
      $('#chatApprovalButtons').show();
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


  // a button in lobby page, will take user to chat screen
  $('#enterChatButton').click(function(){
    $('#lobby').hide();
    $('#chat').show();
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
   
  })
  updateChats();


  // this function will upload the chatname at displayed chat
  function updateChats(){
    var chatsDisplayed = document.getElementById("chatsDisplayed");
    //clear current chat displayed
    chatsDisplayed.innerHTML="";
    //read a  array from server, this array called chats will include all the chat room name
    socket.on('updateChats', function(chats){
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
  
});