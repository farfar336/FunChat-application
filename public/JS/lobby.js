 $(function () {
/*--------------------------------------------------- Click events ---------------------------------------------------*/

  //Button that directs user from lobby to home screen
  $('#lobbyToHomeButton').click(function(){
    $('#lobby').hide();
    $('#home').show();
  })

  //Button that directs user from lobby to chat creation screen and tells server to retrieve a list of users
  $('#createChatButton').click(function(){
    $('#lobby').hide();
    $('#chatCreate').show();
    socket.emit('get users for create chat', {});
  })

  //Button that directs user from lobby to chat screen
  $('#enterChatButton').click(function(){
    $('#lobby').hide();
    $('#chat').css('display', 'contents');
  })

/*--------------------------------------------------- Socket.on events ---------------------------------------------------*/
/*--------------------------------------------------- Functions ---------------------------------------------------*/
});
