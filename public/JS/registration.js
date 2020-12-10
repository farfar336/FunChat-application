//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Registration ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
  // Button that submits entered info to register
  $('.regButton').click(function(){
      let userType = $(this).attr("id");
      let email = $('#regEmail').val();
      email = email.toLowerCase();
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

  // Button that clears entered info for registration and directs user from registration to login screen
  $('#returnToLoginLink').click(function(){
    $('#registerForm').hide();
    $('#loginForm').show();

    //clear registration form in case anything was entered
    $('#regEmail').val('');
    $('#regPassword').val('');
    $('#regDispName').val('');
  })

/*---------------- Socket.on events ----------------*/
  // If registration was unsuccesful, then notify the user
  socket.on('register error', function(msg){
    alert(msg);
  })

  // If registration was succesful, then notify the user and direct them from registration to login screen
  socket.on('register success', function(msg){
    alert("Registration successful!");
    $('#registerForm').hide();
    $('#loginForm').show();
  })

/*---------------- Functions ----------------*/
});
