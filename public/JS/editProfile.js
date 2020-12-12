//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Edit Profile ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
  //Button that directs user from edit profile to profile screen
  $('#returnToProfileButton').click(function(){
    $('#editProfile').hide();
    $('#profile').show();
  })

  //Button that directs user from edit profile to home screen
  $('#editProfileToHomeButton').click(function(){
    $('#editProfile').hide();
    $('#home').show();
  })

  //ask to change the display name
  $('#changeDisplayNameButton').click(function(){
    var displayname=document.getElementById("newDisplayNameField").value;
    socket.emit("changeDisplayname",{displayname:displayname, id:userID})
  
  })

  //ask to change the email
  $('#changeEmailButton').click(function(){
    var email=document.getElementById("newEmailField").value;
    socket.emit("changeEmail",{id:userID, newEmail:email})
  
  })

  //ask to change the password
  $('#changePasswordButton').click(function(){
    var pass=document.getElementById("newPasswordField").value;
    socket.emit("changePassword",{id:userID, newPass:pass})
  
  })

/*---------------- Socket.on events ----------------*/

//if user's chhanged display name
socket.on("changeDisplaynameSuccessful",function(){
  alert("change displayname successfully")

  displayName = $("#newDisplayNameField").val();

  // Update profile display name
  $('#dispName').html(`Display Name: ${displayName}`);
  $('#displayName').text(displayName);
  $('#newDisplayNameField').val('');
})

//email change successful
socket.on("email change successful",function(){
  alert("Email updated successfully")
  $('#newEmailField').val('');
})

//password change successful
socket.on("password change successful",function(){
  alert("Password updated successfully")
  $('#newPasswordField').val('');
})

//if this name exist in database
socket.on("invalidDisplayname",function(){
  alert("The display name already exists. Choose a different one")
})

//change email error
socket.on("change email error",function(msg){
  alert(msg)
})

//change password error
socket.on("change pass error",function(msg){
  alert(msg)
})


/*---------------- Functions ----------------*/



});
