$(function () {
/*--------------------------------------------------- Click events ---------------------------------------------------*/

  //Button that directs user from profile to edit profile screen
  $('#loginButton').click(function(){
      let email = $('#logEmail').val();
      let password = $('#logPassword').val();

      socket.emit('login', {em:email, pass:password});
      
      $('#logEmail').val('');
      $('#logPassword').val('');
  });

  //Button that directs user from login to registration screen
  $('#registerButton').click(function(){
    $('#loginForm').hide();
    $('#registerForm').show();
  });

/*--------------------------------------------------- Socket.on events ---------------------------------------------------*/
  // If login was unsuccesful, then notify the user
  socket.on('login error', function(msg){
    alert(msg);
  })

  // If login was succesful, then direct user from login to home screen and store their info for future queries
  socket.on('login success', function(userObj){
    $('#authentication').hide();
    $('#home').show();
    $('#displayName').text("Welcome " + userObj.displayName + "!");
    userID = userObj._id;     //store user's id for future database queries
    displayName = userObj.displayName;
    userType = userObj.type;
  })

/*--------------------------------------------------- Functions ---------------------------------------------------*/
});