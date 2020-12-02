//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- createChat ---------------------------------------------------*/
$(function () {
    /*---------------- Click events ----------------*/

    // Button that directs user from Word List to home screen
    $('#wordListToHomeButton').click(function(){
        $('#wordList').hide();
        $('#home').show();
    })

    // Button that requests new Restricted Word
    $('#addWord').click(function(){
       
        //socket.emit('create chat', {users: $('#usersDisplay').val(), mods: $('#modDisplay').val(), chatname: $('#chatname').val()});
        $('#restrictedWord').val('');    //clear the chat name text box
    })

    // Button that requests deletion of Restricted Word
    $('#deleteWord').click(function(){
       
        //socket.emit('create chat', {users: $('#usersDisplay').val(), mods: $('#modDisplay').val(), chatname: $('#chatname').val()});
    })
    

    
    
    /*---------------- Socket.on events ----------------*/
      // Removes the current list of words displayed, and then displays their updated version
      //TODO AM
      socket.on('word list for create chat', function(userObj){
        //clear all previous information
        $('#wordDisplay').empty();
    
        for(let i = 0; i < userObj.length; i++)
        {
            $('#wordDisplay').append($('<option>', {
                value: userObj[i].displayName
            }));
          
        }
      })
    
     
    /*---------------- Functions ----------------*/
    
    });
    