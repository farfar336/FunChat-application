//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Chat ---------------------------------------------------*/
$(function () {
/*---------------- Click events ----------------*/
  //Button that directs user from lobby to home screen
  $('#chatToLobbyButton').click(() => {
    // Inform server
    socket.emit("leave chat");

    // Clear previous chat information
    // $('#chatMessages').empty();
    // $('#chatUsers').empty();
    // $('#chatTitle').html('');

    $('#chat').css('display', '');
    $('#lobby').show();
  });

  // Sends the message entered to the chat
  $('#messageForm').submit(function(e){
    e.preventDefault(); // prevents page reloading
    let content = $('#m').val().trim();
    if(content === "")
      return;
    
    socket.emit('filter message', content);    
    
  });

  socket.on("message contains bad word", function(){
    alert("Message contains a restricted word!")
  })

  socket.on("message approved", function(mess){
    //Check for emojis  
    let content = mess.replaceAll(":)", "&#128513;").replaceAll(":(", "&#128577;").replaceAll(":o", "&#128562;");
    socket.emit('chat message', {content: content});
    $('#m').val('');
  })

  

  $('#chatViewUser').click(() => {
    let getClass = $("#chatUsers .ui-selected").attr("class");
    if(getClass !== undefined){
      getClass = getClass.split(" ");
      let userName = getClass[0];
      userName = userName.substring(10);
      userName = userName.replaceAll("-", " ");
    
      socket.emit('get user ID', userName);
    }
    socket.on('return user ID', function(userID){
      //TODO: use viewedUserID to display the right content on profile page
      viewedUserID = userID;
      $('#chat').hide();
      $('#profile').show();

     $('#editProfileButton').hide();
     $('#profileToFriendsButton').hide();
     $('#profileToChatButton').show();
     
    })

  })


/*---------------- Socket.on events ----------------*/

socket.on('chat join failure', (res) => {
  $('#lobby').show();
  alert(res);
});

socket.on('chat join success', (res) => {
  $('#chat').css('display', 'contents');
  $('#chatTitle').html(res.name);
});

socket.on('chat message', (res) => {
  let messages = [];
  if('messages' in res) {
    messages = res.messages;
  } else {
    messages = [res];
  }

  messages.forEach((msg) => {
    let chatObj = $(`<li class="user-name-${cssSafeName(msg.sender)} user-type-${msg.type}">`);

    chatObj.append($('<span class="messageTime">').html(new Date(msg.time).toLocaleTimeString()));
    chatObj.append(' ');
    chatObj.append($('<span class="messageUser">').html(msg.sender));
    chatObj.append(': ');
    chatObj.append($('<span class="messageContent">').html(msg.content));

    $('#chatMessages').append(chatObj);
  });
  //automatically scroll to the bottom any time a new message arrives
  $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
});

socket.on('chat user added', (res) => {
  let userObj = $(`<li class="user-name-${cssSafeName(res.name)} user-type-${res.type}"}>`);
  if(res.name == displayName) userObj.append($('<span class="userName">').html(res.name + " (You)"));
  else userObj.append($('<span class="userName">').html(res.name));

  $('#chatUsers').append(userObj);
});

socket.on('chat user removed', (res) => {
  $('#chatUsers').find(`.user-${cssSafeName(res.sender)}`).remove();
});

/*---------------- Functions ----------------*/
  function cssSafeName(name) {
    return name.replaceAll(' ', '-');
  }
});
