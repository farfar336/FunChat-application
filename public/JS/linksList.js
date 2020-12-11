//socket, userID, displayName, userType, viewedUserID are global variables that are initialized in index.html, near the top of the file
/*--------------------------------------------------- Bad Links ---------------------------------------------------*/
$(function () {
    /*---------------- Click events ----------------*/

    // Button that directs user from Links List to home screen
    $('#linksListToHomeButton').click(function(){
        $('#linksList').hide();
        $('#home').show();
    })

    // Button that requests new Restricted Link
    $('#addLink').click(function(){
        var link=document.getElementById("restrictedLink").value;
        console.log(link)
        //if it is a link, add it to database and show it.
        if(!link.includes(" ")&&link.length>1){
            socket.emit("addlink",link)
            var linksDisplayed = document.getElementById("linksDisplay");
            var links=[]
            linksDisplayed.childNodes.forEach(node=>{
                links.push(node.innerHTML)
            })
            if(!links.includes(link)){
                var newlink=document.createElement("option");
                newlink.innerHTML=link;
                linksDisplayed.appendChild(newlink)
            }
        }
        else{
            alert("Please enter a link")
        }
        
        $('#restrictedLink').val('');    
    })

    // Button that requests deletion of Restricted Link
    $('#deleteLink').click(function(){
        var linksDisplayed = document.getElementById("linksDisplay")
        var index = linksDisplayed.selectedIndex;
        var link=linksDisplayed.children[index].innerHTML
        //ask database to delete this link
        socket.emit("deletelink",link)
        updateLinks();
        
    })
    

    
    
    /*---------------- Socket.on events ----------------*/
      

      socket.on("linkAlreadyInDatabase",function(){
          alert("This link is already in the list");
      });
    
     
    /*---------------- Functions ----------------*/
    
    });
    