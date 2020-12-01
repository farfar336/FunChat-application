$(function () {
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
});