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


  // Chat Logic
  $('#enterChatButton').click(function(){
    $('#lobby').hide();
    $('#chat').css('display', 'contents');
  })

  $('#messageForm').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(msg){
    let messages = [];
    // msg.forEach(message => {
    //     let un = message.user.username;
    //     un = un.fontcolor(message.user.color);
    //     if(message.msg == " connected...") messages.unshift($('<li class="connection">').text(message.timeStamp).append(un).append(': ' + message.msg));
    //     else if(message.msg == " disconnected...") messages.unshift($('<li class="disconnection">').text(message.timeStamp).append(un).append(': ' + message.msg));
    //     else if(message.msg == "changed username...") messages.unshift($('<li class="nameChange">').text(message.timeStamp).append(un).append(': ' + message.msg));
    //     else if(message.msg == "changed color...") messages.unshift($('<li class="colorChange">').text(message.timeStamp).append(un).append(': ' + message.msg));
    //     else if(message.user.username == myUsername) {
    //         // normal message from this user
    //         messages.unshift($('<li class="normalMessage" style="font-weight:bold">').text(message.timeStamp).append(un).append(': ' + message.msg.replace(':)', '😁').replace(':(', '🙁').replace(':o', '😲')));
    //     } else {
    //         // normal message from another user
    //         messages.unshift($('<li class="normalMessage">').text(message.timeStamp).append(un).append(': ' + message.msg.replace(':)', '😁').replace(':(', '🙁').replace(':o', '😲')));
    //     }
    // });
    messages.unshift($('<li>').text(msg));
    $('#chatMessages').empty().append(messages);
    $('#chatMessages').animate({scrollTop: $('#chatMessages').prop("scrollHeight")}, 500);
});
  
});