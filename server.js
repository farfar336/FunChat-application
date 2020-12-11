//Server code that handles all database queries from client
//Uses node/express, MongoDB/Mongoose and Socket.io

/*--------------------------------------------------- Server Initialization ---------------------------------------------------*/
//Initialize packages and socket connection
const express = require('express');
const app = express();
const mongoose = require('mongoose');
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Load configurable data from environment
require('dotenv').config();

let port = process.env.PORT || 3000;
let dbConn = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || "27017",
  name: process.env.DB_NAME || "funchat",
};

const url = `mongodb://${dbConn.host}:${dbConn.port}/${dbConn.name}`;

//Load static client-side files
app.use(express.static('public'));

//Initialize mongoose - import schema models
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
const user = require('./models/user');
const chat = require('./models/chat');
const message = require('./models/message');

//Connect to database and print message to console
const db = mongoose.connection;
db.once('open', _ => {
  console.log('Database connected:', url)
  mongoose.connection.db.listCollections({name: 'badWordsAndLinks'})
  .next(function(err, collinfo) {
      if (collinfo) {
          console.log("badWordsAndLinks collection exists")
      }
      else{
        db.createCollection("badWordsAndLinks");
      }
  });

  db.collection("badWordsAndLinks").findOne({}, function(error, result) {
    if (error) console.log(error);
    else{
      if(result === null){
        db.collection("badWordsAndLinks").insertOne({name:"wordsAndLinks", Words: [], Links: []}, function(err, res) {
          if (err) console.log(err);
          console.log("Bad Words and Bad Links arrays created");
        });
      }
    }
  
  });
})

db.on('error', err => {
  console.error('connection error:', err)
})

//Socket listening on port 
http.listen(port, function(){
  console.log('listening on *:' + port);
});

/*--------------------------------------------------- Login  ---------------------------------------------------*/
//User events upon connection to application
io.on('connection', function(socket){
  console.log("connected to server through socket!");
 
  //Login event received from client - after error checking send back login success or error event
  socket.on('login', function(obj){
    user.findOne({email:obj.em}, function(error, document){
      if (error){
        console.error(error);
        socket.emit("login error", "Login error");
      }
      else{
        if(document == null) socket.emit("login error", "This email does not exist!");
        else{
          if(document.password != obj.pass) socket.emit("login error", "Wrong password!");
          else if(document.approved != true) socket.emit("login error", "Access Denied: This account has been suspended");
          else{
            socket.user = {
              id: document._id.toString(),
              displayName: document.displayName,
              type: document.type,
            };
            socket.emit("login success", document);
          }
        }
      }
    })
  })
  
/*--------------------------------------------------- Registration  ---------------------------------------------------*/
  //Register event received from client - create and save new user object in database - send back register success or error event
  socket.on('register', function(obj){
    //Check if a user already exists with the submitted email
    user.exists({email:obj.em}, function (error, document) { 
      if (error){ 
          console.log(error)
          socket.emit("register error", "Error: unable to register"); 
      }
      
      else{

        //If there is no existing user with given email then proceed with registering new user
        if(document === false){
          user.exists({displayName:obj.dn}, function (error, doc) { 
            if (error){ 
                console.log(error)
                socket.emit("register error", "Error: unable to register"); 
            }
            
            else{
              //If there is no existing user with given email then proceed with registering new user
              if(doc === false){
                //Create new user object with submitted info
                let newUser = new user({type: obj.type, approved: true, email:obj.em, password:obj.pass, displayName:obj.dn, friends:[], friendRequests:[]});
                //Save user to the database
                newUser.save(function (error, document) {
                  if (error){
                    console.error(error)
                    socket.emit("register error", "Error: unable to register");
                  }
                  else socket.emit("register success", "Registration Successful");
                })
              }
              //If a user with the submitted email exists then return a registration error event
              else socket.emit("register error", "This display name already exists!");
            }
        })
      }
        //If a user with the submitted email exists then return a registration error event
        else socket.emit("register error", "This email already exists!");
      } 
    }); 
  });


/*--------------------------------------------------- Create Chat  ---------------------------------------------------*/
  //Get User list
  socket.on('get users for create chat', function(userID){
    //Find this user 
    user.findOne({_id:userID}, function(err, thisuser){
      if(err){
        console.log(err);
      } else{  
        var users=[]
        
        //get id of this user, and push into users
        thisuser.friends.forEach(ID=>{
          user.findOne({_id:ID},function(err,friend){
            if(err)console.error(err)
            else{
              if(friend.type!="Moderator"){
                users.push(friend)
              }
            }
          })
        })
        //push all moderator
        user.find({type:"Moderator"},function(err, allmoderator){
          if(err)console.log(err);
          else{
            allmoderator.forEach(moderator => {
              if(thisuser.friends.includes(moderator._id)) users.push(moderator)
            })
            socket.emit('user list for create chat', users);
          }
        })
        
      }
    })
    
  });

  //Create Chat
  socket.on('create chat',  function(obj){
    //Check if a chat already exists with the chatname
    let chatNameCheck = (obj.chatname === "");
    let modSelectCheck = (obj.mods.length === 0);

    if(chatNameCheck || modSelectCheck)
    {
      console.log("Chat creation failed");
      let chatInputFail = "";
      if(chatNameCheck)
      {
        chatInputFail = chatInputFail + "Input Error: Need to Fill in Chat Name\n";
      }
      
      if(obj.userType === "User" && modSelectCheck)
      {
        chatInputFail = chatInputFail + "Input Error: Select at Least One Moderator\n";
      }
      socket.emit("chat create failure", chatInputFail);
    }
    else{
      chat.exists({name: obj.chatname}, async function (error, document) { 
        if (error){ 
            console.log(error)
            //socket.emit("register error", "Error: unable to register"); 
        }
        else{
          //If there is no existing chat with given name then proceed with registering new user
          if(document === false){
            //Convert displayNames of mods and users to IDs and store it in the array
            let modsID = await convertDisplayNamesToIDs(obj.mods);
            let usersID = await convertDisplayNamesToIDs(obj.users);
            // let userDisplayNames = await convertIDsToDisplayNames(usersID); this is an example of how to convert an array of IDs to an array of DisplayNames

            //Create new user object with submitted info
            let newChat = new chat({approved: false, name: obj.chatname, participants: usersID, mods: modsID});
            //Save user to the database
            newChat.save(function (error, document) {
              if (error){
                console.error(error)
              }
              else 
              {
                console.log("Chat created");
                socket.emit("chat create success", "Creation of Chat: " + obj.chatname + " Successful");
                io.emit('update chats for all');
              }
            })
          }
          //Display error message for failing to create a chat
          else 
          {
            socket.emit("chat create failure", "This chat already exists!");
          }
        } 
      });
    }
  });

  //Converts array of IDs to an array of displayNames
  async function convertDisplayNamesToIDs(displayNames){
    let IDs = [];
    await user.find({displayName: { $in: displayNames}}, function(error, requests){
      if(error) socket.emit("chat page error", "Unable to find users id");
      else {
        for (i = 0; i < requests.length; i++){
          IDs.push(requests[i]._id)
        }
      }
    }); 
    return IDs;
  }

  //Converts array of displayNames to an array of IDs
  async function convertIDsToDisplayNames(IDs){
    let displaynames = [];
    await user.find({_id: { $in: IDs}}, function(error, requests){
      if(error) socket.emit("chat page error", "Unable to find users id");
      else {
        for (i = 0; i < requests.length; i++){
          displaynames.push(requests[i].displayName)
        }
      }
    }); 
    return displaynames;
  }

/*-------------------------------------------------- Use Chat  -------------------------------------------------*/
  socket.on("join chat", async (req) => {
    let chatInst = await chat.findOne({name: req.name}).exec();

    if(chatInst == null) {
      socket.emit("chat join failure", "The chat room was not found or does not exist");
      return;
    }

    // Set user's active chat
    socket.chat = chatInst.name;
    socket.join(socket.chat);
    socket.emit("chat join success", {
      name: chatInst.name,
    });

    // Send user list
    let userIds = chatInst.mods.concat(chatInst.participants);
    let users = await user.find({_id: { $in: userIds }});

    users.forEach((chatUser) => {
      socket.emit("chat user added", {
        id: chatUser._id,
        name: chatUser.displayName,
        type: chatUser.type,
      });
    });

    // Send message backlog
    let messages = await message.find({chat: chatInst._id}).sort({time: -1}).limit(200).exec(); // Grab max 200 latest messages from the backlog
    messages.sort((a, b) => { // Sort messages with the latest message last
      return a.time - b.time;
    });

    let messageDTO = await Promise.all(messages.map(async (msg) => {
      let sender = await user.findOne({_id: msg.sender}).exec();
      return {
        content: msg.content,
        id: msg._id,
        sender: sender.displayName,
        time: msg.time,
        type: sender.type,
      }
    }));

    socket.emit("chat message", {
      messages: messageDTO,
    });
  });

  socket.on("leave chat", (req) => {
    if(socket.chat == null)
      return;

    socket.leave(socket.chat);
    socket.chat = null;
  });

  socket.on("chat message", async (req) => {
    let content = req.content;
    let date = new Date();

    // Store message to database
    let chatInst = await chat.findOne({name: socket.chat}).exec();
    let msgInst = await message.create({
      chat: chatInst._id,
      sender: socket.user.id,
      time: date,
      content: content,
    });

    // Send message to users in channel
    io.to(socket.chat).emit("chat message", {
      content: content,
      id: msgInst._id,
      sender: socket.user.displayName,
      time: date,
      type: socket.user.type,
    });
  });

  //Check message for any bad words or bad links
  socket.on("filter message", function(mess){
    //get bad words and links lists
    db.collection("badWordsAndLinks").findOne({}, function(err, result){
      if(err) console.error(err)
      else{
        //Convert everything to lowercase to ensure bad words/links are caught regardless of how they are typed
        let lowerCaseWords = result.Words.map(word => word.toLowerCase());
        let lowerCaseLinks = result.Links.map(link => link.toLowerCase());
        let lowerCaseMessage = mess.toLowerCase();
        let wordFlag = false;
        let linkFlag = false;
        //Validate message with each item in bad words list
        for(let i = 0; i < lowerCaseWords.length; i++){
          //Bad word found, set flag and break loop
          if(lowerCaseMessage.includes(lowerCaseWords[i])){
            wordFlag = true;
            break;
          }
        }
         //Validate message with each item in bad links list
        for(let i = 0; i < lowerCaseLinks.length; i++){
          //Bad link found, set flag and break loop
          if(lowerCaseMessage.includes(lowerCaseLinks[i])){
            linkFlag = true;
            break;
          }
        }
        //Send rejection if message contains bad words/links, else approve message
        if(wordFlag && linkFlag) socket.emit("message rejected", "This message was not sent as it contains bad words and bad links");
        else if(wordFlag) socket.emit("message rejected", "This message contains a bad word and was not sent");
        else if(linkFlag) socket.emit("message rejected", "This message contains a bad link and was not sent");
        else socket.emit("message approved", mess);
      }
    })
  })

  socket.on("remove message", async (req) => {
    if(socket.user.type != "Moderator") {
      socket.emit("remove message error", "You do not have permission to remove a message!");
      return;
    }

    let msgObj = await message.findOne({_id: req.id}).exec();
    if(msgObj == null) {
      socket.emit("remove message error", "Message not found or does not exist!");
      return;
    }

    message.deleteOne({_id: req.id}, (err) => {
      if(err) {
        socket.emit("remove message error", "Failed to delete message");
        return;
      }

      io.to(socket.chat).emit("remove message", {
        id: req.id,
      });
    });
  });

  socket.on("add user to chat", async (req) => {
    let userObj = await user.findOne({displayName: req.name}).exec();
    if(userObj == null) {
      socket.emit("add user to chat error", "User not found or does not exist!");
      return;
    }

    console.log(userObj.friends);
    console.log(socket.user.id);
    if(!userObj.friends.includes(socket.user.id)) {
      socket.emit("add user to chat error", "You cannot add a user who is not your friend!");
      return;
    }

    let chatObj = await chat.findOne({name: socket.chat}).exec();
    if(chatObj == null) {
      socket.emit("add user to chat error", "An error occurred while getting the chat");
      return;
    }

    let userIds = chatObj.mods.concat(chatObj.participants);
    if(userIds.includes(userObj._id)) {
      socket.emit("add user to chat error", "That user is already in this chat!");
      return;
    }

    chatObj.participants.push(userObj._id);
    await chatObj.save();
    io.emit('update chats for all');
    io.to(socket.chat).emit("chat user added", {
      id: userObj._id,
      name: userObj.displayName,
      type: userObj.type,
    });
  });

  socket.on("remove user from chat", async (req) => {
    if(socket.user.type != "Moderator") {
      socket.emit("remove user from chat error", "You do not have permission to kick a user!");
      return;
    }

    let userObj = await user.findOne({_id: req.id}).exec();
    if(userObj == null) {
      socket.emit("remove user from chat error", "User not found or does not exist!");
      return;
    }

    let chatObj = await chat.findOne({name: socket.chat}).exec();
    if(chatObj == null) {
      socket.emit("remove user from chat error", "Chat not found. Was it deleted?");
      return;
    }

    // Remove user from chat list in database
    if(chatObj.participants.includes(userObj._id)) {
      chatObj.participants = chatObj.participants.filter((id) => { id !== userObj._id });
    } else if(chatObj.mods.includes(userObj._id)) {
      chatObj.mods = chatObj.mods.filter((id) => { id !== userObj._id });
    } else {
      socket.emit("remove user from chat error", "That user is not in this chat!");
      return;
    }

    await chatObj.save();
    io.emit('update chats for all');
    // Remove user from chat if actively participating in chat
    io.of('/').in(chatObj.name).clients((err, clients) => {
      clients.forEach((id) => {
        let client = io.sockets.connected[id];
        if(client.user.id == userObj._id) {
          client.leave(chatObj.name);
          client.chat = null;
          client.emit("removed from chat");
        }
      });
    });

    // Remove user from chat list
    io.to(chatObj.name).emit("chat user removed", {
      id: userObj._id,
    });
  });

  socket.on("get user ID", function(name){
    user.findOne({displayName:name}, function(error, document){
      if (error)console.error(error);
      else{
        socket.emit("return user ID", document._id);
      }
    })
  })
  
/*--------------------------------------------------- Lobby  ---------------------------------------------------*/
  //if a chat is rejected, this chat will be romove from the database
  socket.on("removeChat", function(name){
    //find the removed chat room
    chat.findOne({name:name}, function(error, document){
      if (error)console.error(error);
      else{
        //if there is no error, delete the chat room
        chat.deleteOne({ name: name }, function (err) {
          if(err) console.log(err);
          
          else{ 
            console.log("Successful deletion");
            io.emit('update chats for all');  
          } 
        });
      }
    })
  })

  //if a chat is proved, the approved will be true
  socket.on("approveChat", function(name){
    //find this chat
    chat.findOne({name:name}, function(error, document){
      if (error)console.error(error);
      else{ 
          //if there is no error update the approved to true at database
          document.update({approved:true}, function (err, result) { 
            if (err){ 
                console.log(err) 
            }else{ 
                console.log("Result :", result)
                io.emit('update chats for all');  
            } 
        });   
      }
    })
  })

  socket.on("refreshChatList", function(userID){
    updatechat(userID);
  })

  //read the chat rooms from database, send them to client side
 async function updatechat(userID){
  var chats = []
  //read all the chat rooms in chat and put them into a array called chats
  await chat.find({}, function(err, result) {
   result.forEach(function(userChat) {
     if(userChat.participants.includes(userID) || userChat.mods.includes(userID)){
      chats.push([userChat.name,userChat.approved]);
     }
    
    }); 
  });
  //send the chats to client side
  socket.emit("updateChats",chats);
 }

 socket.on("chatApprovedOrNot",function(chatname){
   chat.findOne({name:chatname},function(err,chat){
     if(err)console.error(err)
     else{
       if(chat.approved){
         socket.emit("chatApproved", chatname)
       }else{
         socket.emit("chatNotApproved")
       }
     }
   })
 })



/*--------------------------------------------------- Friend List  ---------------------------------------------------*/
  //Handle incoming friend request
  socket.on("send friend request", function(reqObj){
    user.findOne({displayName: reqObj.receiver}, function (err, doc) {
      if(err) socket.emit("friends page error", "Error sending friend request");
      else{
        if(doc === null) socket.emit("friends page error", "This user does not exist");
        else{
          if(doc.friendRequests.includes(reqObj.senderID) === true || doc.friends.includes(reqObj.senderID) === true) socket.emit("friends page error", "This user is already a friend or has sent a friend request");
          else{
            doc.friendRequests.push(reqObj.senderID);

            doc.save(function (err) {
              if(err) socket.emit("friends page error", "Error sending friend request");
              else{
                socket.emit("friend request success", "Friend request sent successfully!");
                io.emit("friend lists refresh", {friend:reqObj.senderID, user:doc._id});
              }
            
            });
          }
        }
      }
    });
  })

  //Fetch and return friend requests for current user
  socket.on("fetch friend requests", function(userID){
    user.findById(userID, function (err, doc) {
      if(err) socket.emit("friends page error", "Unable to load user's friend requests");
      else{
        if(doc === null) socket.emit("friends page error", "Unable to load user's friend requests");
        else{
          user.find({_id: { $in: doc.friendRequests}}, function(error, requests){
            if(error) socket.emit("friends page error", "Unable to load user's friend requests");
            else socket.emit("display friend requests successful", requests);
          }); 
        }
      }
    });
  });

  //Fetch and return added friends for current user
  socket.on("fetch added friends", function(userID){
    user.findById(userID, function (err, doc) {
      if(err) socket.emit("friends page error", "Unable to load user's friends");
      else{
        if(doc === null) socket.emit("friends page error", "Unable to load user's friends");
        else{
          user.find({_id: { $in: doc.friends}}, function(error, requests){
            if(error) socket.emit("friends page error", "Unable to load user's friends");
            else socket.emit("display added friends successful", requests);
          });
          
        }
      }
    });
  });

  //Handle friend request acceptance
  socket.on("accept friend request", function(obj){
    //Save information in database for sender of friend request
    user.findById(obj.request, function (err, doc) {
      if(err) socket.emit("friends page error", "Error accepting request");
      else{
        if(doc === null) socket.emit("friends page error", "Error accepting request");
        else{
          var filtered = doc.friendRequests.filter(function(value, index, arr){
            return value !== obj.user;
          });
          doc.friendRequests = filtered;
          doc.friends.push(obj.user);
          
          doc.save(function (err) {
            if(err) socket.emit("friends page error", "Error accepting request");
          });
        }
      }
    })

    //Save information in database for receiver of friend request
    user.findById(obj.user, function (err, doc) {
      if(err) socket.emit("friends page error", "Error accepting request");
      else{
        if(doc === null) socket.emit("friends page error", "Error accepting request");
        else{
          var filtered = doc.friendRequests.filter(function(value, index, arr){
            return value !== obj.request;
          });
          doc.friendRequests = filtered;
          doc.friends.push(obj.request);
          
          doc.save(function (err) {
            if(err) socket.emit("friends page error", "Error accepting request");
            else io.emit("friend lists refresh", {friend:obj.request, user:doc._id});
          }); 
        }
      }
    })
  })

  //Handle friend request rejection
  socket.on("decline friend request", function(obj){
    //Save information in database for user who received friend request and declined it
     user.findById(obj.user, function (err, doc) {
       if(err) console.log(err); 
       else{
         if(doc === null) socket.emit("friends page error", "Error declining request");
         else{
           var filtered = doc.friendRequests.filter(function(value, index, arr){
             return value !== obj.request;
           });
           doc.friendRequests = filtered;
           
           doc.save(function (err) {
             if(err) console.log(err);
             else io.emit("friend lists refresh", {friend:obj.request, user:doc._id});
           }); 
         }
       }
     }) 
   })
  
  //Handle unfriending action
  socket.on("unfriend", function(obj){
    //Save information in database for user being unfriended
    user.findById(obj.friend, function (err, doc) {
      if(err) socket.emit("friends page error", "Error unfriending");
      else{
        if(doc === null) socket.emit("friends page error", "Error unfriending");
        else{
          
          var filtered = doc.friends.filter(function(value, index, arr){
            return value !== obj.user;
          });
          doc.friends = filtered;
          
          doc.save(function (err) {
            if(err) socket.emit("friends page error", "Error unfriending");
          });
        }
      }
    })

    //Save information in database for user doing the unfriending
    user.findById(obj.user, function (err, doc) {
      if(err) socket.emit("friends page error", "Error unfriending");
      else{
        if(doc === null) socket.emit("friends page error", "Error unfriending");
        else{
          var filtered = doc.friends.filter(function(value, index, arr){
            return value !== obj.friend;
          });
          doc.friends = filtered;
          
          doc.save(function (err) {
            if(err) socket.emit("friends page error", "Error unfriending");
            else io.emit("friend lists refresh", {friend:obj.friend, user:doc._id});
          }); 
        }
      }
    })  
  })
  
  /* -------------------------------------show profile screen ----------------------------------------------------------------------*/
  socket.on("show profile", async (req) => {

    // Default to sender
    let user = socket.user;
    // Lookup requested user
    if(req != null && req.hasOwnProperty('name')) {
      user = await User.findOne({displayName: req.name}).exec();
      if(user == null) {
        socket.emit("show profile error", "User not found or does not exist");
        return;
      }
    }

    socket.emit("show profile success", {
      id: user.id,
      name: user.displayName,
      type: user.type,
    });
  });

  /* -------------------------------------edit profile screen ----------------------------------------------------------------------*/ 
  

  //user  change the display name
  socket.on("changeDisplayname", function(data){
    //check if this name already exist in database
    user.findOne({displayName:data.displayname}, function(error, document){
    if (error)console.error(error);
    else{
      if(document==null){
        //if this name is not in databse, find this user by it's id
        user.findOne({_id:data.id}, function(error, thisuser){
          if (error)console.error(error);
          else{
            console.log(thisuser)
            //upload display name
            thisuser.update({displayName:data.displayname}, function (err, result) { 
              if (err){ 
                  console.log(err) 
              }else{ 
                  console.log("Result :", result)  
              } 
          }); 
          }
        })
        socket.emit("changeDisplaynameSuccessful")
        socket.user.displayName = data.displayname
      }
      else{
        socket.emit("invalidDisplayname")
      }
    }
    })
  })

  /*--------------------------------------------------restricted words-----------------------------------------------------*/ 
 



  socket.on("fetch words list",function(){
    db.collection("badWordsAndLinks").findOne({}, function(err, result){
      if(err) console.error(err)
      else{
        socket.emit("updatewords",result.Words)
        
      }
    })
  })

  socket.on("addword",function(word){
    db.collection("badWordsAndLinks").findOne({}, function(err, result) {
      if (err) throw err;
      if(!result.Words.includes(word)){
        db.collection("badWordsAndLinks").findOneAndUpdate(
          { name: "wordsAndLinks" },
          { $push: { Words: word } }
        
        );
      }
      else{
        socket.emit("wordAlreadyInDatabase")
      }
      
   

    })
  })


  socket.on("deleteword",function(word){
        db.collection("badWordsAndLinks").findOneAndUpdate(
          { name: "wordsAndLinks" },
          { $pull: { Words: word } }
        
        );
  
  })


    /*--------------------------------------------------restricted links-----------------------------------------------------*/ 
 



    socket.on("fetch links list",function(){
      db.collection("badWordsAndLinks").findOne({}, function(err, result){
        if(err) console.error(err)
        else{
          socket.emit("updatelinks",result.Links)
          
        }
      })
    })
  
    socket.on("addlink",function(link){
      db.collection("badWordsAndLinks").findOne({}, function(err, result) {
        if (err) throw err;
        if(!result.Links.includes(link)){
          db.collection("badWordsAndLinks").findOneAndUpdate(
            { name: "wordsAndLinks" },
            { $push: { Links: link } }
          
          );
        }
        else{
          socket.emit("linkAlreadyInDatabase")
        }
        
     
  
      })
    })
  
  
    socket.on("deletelink",function(link){
          db.collection("badWordsAndLinks").findOneAndUpdate(
            { name: "wordsAndLinks" },
            { $pull: { Links: link } }
          
          );
    
    })

});




