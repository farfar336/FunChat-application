//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file

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
