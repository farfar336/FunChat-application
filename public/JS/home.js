//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Home ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
  //Button that directs user from home to login screen
  $('.logOutButton').click(function(){
    $('#authentication').siblings().hide();
    $('#authentication').show();
    socket.emit("leave chat");
  })
  
  //Button that directs user from home to lobby screen, updates the list of chat to display, and displays button depending on the user type
  $('#lobbyButton').click(function(){
    $('#home').hide();
    $('#lobby').show();
    updateChats();

    //Buttons displayed based on user type
    if (userType == "User"){
        $('#chatApprovalButtons').hide();
    }
    else if(userType == "Moderator"){
      $('#chatApprovalButtons').show();
    }
  })  

  //Button that directs user from home to friends screen and refreshes their friends list so its up to date
  $('#friendsButton').click(function(){
    $('#home').hide();
    $('#friends').show();
    //Show the most updated version of the friends page
    refreshFriends();
  });

  //Button that directs user from home to another users profile screen 
  $('#profileButton').click(function(){
    $('#home').hide();
    $('#profile').show();

    //To-do Backend: Use id stored in 'viewedUserID' to fetch profile details
    //Clicking this button will show current user's profile
    //Clicking a display name in the friends page will store friend's id in 'viewedUserID'
    viewedUserID = userID;
    
    //If user is viewing their own profile
    if (userID == viewedUserID){
      $('#editProfileButton').show();
      $('#profileToHomeButton').show();
      $('#profileToFriendsButton').hide();
      $('#profileToChatButton').hide();
    }
  })

  //Button that directs user from home to another users profile screen 
  $('#wordButton').click(function(){
    $('#home').hide();
    $('#wordList').show();
    updateWords()
    socket.emit('get words for word List', {});

  })

/*---------------- Socket.on events ----------------*/
/*---------------- Functions ----------------*/
});
