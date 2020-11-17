/*
Client-side JavaScript for the application.
Deals with button clicks and displays correct module based on login/registration status
*/

$(function () {
  let socket = io();

  //userID variable stores current user's database id upon login for future database queries
  let userID = "";
  
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

  //Server returns login success
  socket.on('login success', function(userObj){
    $('#authentication').hide();
    $('#home').show();
    $('#displayName').text("Welcome " + userObj.displayName + "!");
    userID = userObj._id;     //store user's id for future database queries
  })

  //Server returns lobby entered
  socket.on('lobby entered', function(userObj){
    $('#home').hide();
    $('#lobby').show();

    //Buttons displayed based on user type
    if (userObj.type == "User"){
      $('#chatEnterButton').show();
      $('#chatApprovalButtons').hide();
    }
    else if(userObj.type == "Moderator"){
      $('#chatEnterButton').hide();
      $('#chatApprovalButtons').show();
    }
  })  
  

  
});