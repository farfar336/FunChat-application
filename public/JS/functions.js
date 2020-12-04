/*--------------------------------------------------- Functions ---------------------------------------------------*/

//Function to refresh the friends page after changes
function refreshFriends(){
    //Get friend requests and added friends from the database
    socket.emit('fetch friend requests', userID);
    socket.emit('fetch added friends', userID);
}

// Updates the list of chats
function updateChats(){
    //Emit an event to server to pull the latest chat list
    socket.emit("refreshChatList", userID);

    //read a  array from server, this array called chats will include all the chat room name
    socket.on('updateChats', function(chats){
            var chatsDisplayed = document.getElementById("chatsDisplayed");
            //clear current chat displayed
            chatsDisplayed.innerHTML="";
            console.log(chats)
            chats.forEach(element => {
            var chat=document.createElement("option");
            chat.innerHTML=element[0];
            if(element[1]==true){
                chat.style.fontWeight="bold";
            }
           
            
            
            chatsDisplayed.appendChild(chat)
        });
    })
}