 $(function () {
    //a button in lobby page, take user to home
    $('#lobbyToHomeButton').click(function(){
      $('#lobby').hide();
      $('#home').show();
    })
  
    $('#createChatButton').click(function(){
      $('#lobby').hide();
      $('#chatCreate').show();
    socket.emit('get users for create chat', {});
    })

    //a button take user to char create page
    $('#createChatButton').click(function(){
      $('#lobby').hide();
      $('#chatCreate').show();
    })

     // Chat Logic
  $('#enterChatButton').click(function(){
    $('#lobby').hide();
    $('#chat').css('display', 'contents');
  })

  $('#messageForm').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    console.log("emitted message");
    $('#m').val('');
    return false;
  });
});