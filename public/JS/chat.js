$(function () {
/*--------------------------------------------------- Click events ---------------------------------------------------*/
    // Sends the message entered to the chat
    $('#messageForm').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        console.log("emitted message");
        $('#m').val('');
        return false;
    });
/*--------------------------------------------------- Socket.on events ---------------------------------------------------*/
/*--------------------------------------------------- Functions ---------------------------------------------------*/

});