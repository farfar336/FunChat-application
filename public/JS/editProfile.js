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

/*---------------- Socket.on events ----------------*/

//if user's chhanged display name
socket.on("changeDisplaynameSuccessful",function(){
  alert("change displayname successfully")
})

//if this name exist in database
socket.on("invalidDisplayname",function(){
  alert("The display name already exists. Choose a different one")
})


/*---------------- Functions ----------------*/



});
