//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Bad Words ---------------------------------------------------*/
$(function () {
    /*---------------- Click events ----------------*/
    // Button that directs user from Word List to home screen
    $('#badWordsToHomeButton').click(function(){
        $('#badWords').hide();
        $('#home').show();
    })

    // Button that requests new bad Word
    $('#addWord').click(function(){
        var word=document.getElementById("badWord").value;
        console.log(word)
        //if it is a word , add it to database and show it.
        if(!word.includes(" ")&&word.length>1){
            socket.emit("addword",word)
            var wordsDisplayed = document.getElementById("wordDisplay");
            var words=[]
            wordsDisplayed.childNodes.forEach(node=>{
                words.push(node.innerHTML)
            })
            if(!words.includes(word)){
                var newword=document.createElement("option");
                newword.innerHTML=word;
                wordsDisplayed.appendChild(newword)
            }
        }
        else{
            alert("Please enter a word")
        }
        
        $('#badWord').val('');    
    })

    // Button that requests deletion of bad Word
    $('#deleteWord').click(function(){
        var wordDisplayed = document.getElementById("wordDisplay")
        var index = wordDisplayed.selectedIndex;
        var word=wordDisplayed.children[index].innerHTML
        //ask database to delete this word
        socket.emit("deleteword",word)
        updateWords()
    })
    
    /*---------------- Socket.on events ----------------*/
      socket.on("wordAlreadyInDatabase",function(){
          alert("The word is already in list")
      })
});
    