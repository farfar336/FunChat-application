$(function () {

  //a button in home page take user to login page
  $('.logOutButton').click(function(){
    $('#authentication').siblings().hide();
    $('#authentication').show();
  })
  
  //a button in home,take user to lobby,
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

  //Friends page logic

//Home to friends page button
  $('#friendsButton').click(function(){
    $('#home').hide();
    $('#friends').show();
    //Show the most updated version of the friends page
    refreshFriends();
  });

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
    }
  })
});