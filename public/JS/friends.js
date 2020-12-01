$(function () {
  $('#friendsToHomeButton').click(function(){
    $('#friends').hide();
    $('#home').show();
  });

  //Function to refresh the friends page after changes
  function refreshFriends(){
      //Get friend requests and added friends from the database
      socket.emit('fetch friend requests', userID);
      socket.emit('fetch added friends', userID);
  }

  //Displays any error messages
  socket.on('friends page error', function(msg){
    alert(msg);
  });

  //Update the 'Friend Requests' section 
  socket.on('display friend requests successful', function(requests){
    $('#friendRequests').html("");
    if(requests.length > 0){
      $.each(requests, function(index, value) {
        $('#friendRequests').append("<div id=\"" + "req-" + value._id + "\" class=\"userTile flexCol\"><img src=\"person-icon.png\" width=\"30%\"><p class=\"dispName\">" + value.displayName + "</p><p class=\"acctType\">" + value.type + "</p><div id=\"" + "dec-" + value._id + "\" class=\"reqDecision flexRow\"><img class=\"accept\" src=\"accept.png\" width=\"20%\"><img class=\"decline\" src=\"decline.jpg\" width=\"20%\"></div></div>");
      });
    }
    else $('#friendRequests').append("<p class=\"emptyFriends\">There are no friend requests.</p>");
    
  });

  //Update the 'Added Friends' section
  socket.on('display added friends successful', function(requests){
    $('#approvedFriends').html("");
    if(requests.length > 0){
      $.each(requests, function(index, value) {
        $('#approvedFriends').append("<div id=\"" + "req-" + value._id + "\" class=\"userTile flexCol\"><img src=\"person-icon.png\" width=\"30%\"><p class=\"dispName\">" + value.displayName + "</p><p class=\"acctType\">" + value.type + "</p><div class=\"unFriend\">Unfriend</div></div>");
      });
    }
    else $('#approvedFriends').append("<p class=\"emptyFriends\">You don't have any friends added yet. Enter a display name to send a request!</p>");
  });
  
  //Enter a display name in the search box and click the send button
  $('#submitFriend').click(function(){
    if($('#friendName').val() === displayName) alert("You cannot send a friend request to yourself!")
    else socket.emit('send friend request', {senderID:userID, senderName:displayName, receiver:$('#friendName').val(), senderType:userType});
    $('#friendName').val('')
  });


  //Give user message when friend request sent successfully
  socket.on('friend request success', function(msg){
    alert(msg);
  })

  //Refresh the friends page when a new request arrives, request is accepted/decline or a user is unfriended
  socket.on('friend lists refresh', function(obj){
    if(obj.user == userID || obj.friend == userID){
      refreshFriends();
    }
  })


  //Event handler for user accepting a friend request
  $("#friendRequests").on( "click", ".accept", function() {
    //Get the id of the friend requesting to be added. 
    let pid = $(this).parent().attr("id");
    //In the parent div of the buttons it is stored as dec-id so we are using substring to remove dec-
    pid = pid.substring(4);

    socket.emit('accept friend request', {user:userID, request:pid});
  });

  //Event handler for user rejecting a friend request
  $("#friendRequests").on( "click", ".decline", function() {
    //Get the id of the friend requesting to be added. 
    let pid = $(this).parent().attr("id");
    pid = pid.substring(4);

    socket.emit('decline friend request', {user:userID, request:pid});
  });

  //Event handler for user unfriending another user
  $("#approvedFriends").on( "click", ".unFriend", function() {
    //Get the id of the friend to be removed. 
    let pid = $(this).parent().attr("id");
    pid = pid.substring(4);

    socket.emit('unfriend', {user:userID, friend:pid});
  });

  //Event handler for viewing friend's profile
  $(".tileContainers").on( "click", ".dispName", function() {
    //Get the id of the friend. 
    let pid = $(this).parent().attr("id");
    pid = pid.substring(4);

    //store id of friend to use in fetching profile info from database
    viewedUserID = pid;
    $('#friends').hide();
    $('#profile').show();

    $('#editProfileButton').hide();
    $('#profileToFriendsButton').show();
  });
});