$(function () {

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
});