//Server code that handles all database queries from client
//Uses node/express, MongoDB/Mongoose and Socket.io

//Initialize packages and socket connection
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/funchat';
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

//Load static client-side files
app.use(express.static('public'));

//Initialize mongoose - import schema models
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
const user = require('./models/user');
const chat = require('./models/chat');

//Connect to database and print message to console
const db = mongoose.connection;
db.once('open', _ => {
  console.log('Database connected:', url)
})

db.on('error', err => {
  console.error('connection error:', err)
})

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
          else{
            socket.emit("login success", document);
          }
        }
      }
    })
  })
  
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
        else socket.emit("register error", "This email already exists!");
      } 
    }); 
  });


  //Get User list
  socket.on('get users for create chat', function(obj){
    //Fetch list of all users in database
    user.find({}, {}, function(err, users){
      if(err){
        console.log(err);
      } else{
        socket.emit('user list for create chat' ,users);
      }
    })
    
  });

  //Create Chat
  socket.on('create chat', function(obj){
    //Check if a chat already exists with the chatname
    let chatNameCheck = (obj.chatname === "");
    let userSelectCheck = (obj.users.length === 0);
    let modSelectCheck = (obj.mods.length === 0);

    if(chatNameCheck || userSelectCheck || modSelectCheck)
    {
      console.log("fail");
      let chatInputFail = "";
      if(chatNameCheck)
      {
        chatInputFail = chatInputFail + "Input Error: Need to Fill in Chat Name\n";
      }
      if(userSelectCheck)
      {
        chatInputFail = chatInputFail + "Input Error: Select at Least One User\n";
      }
      if(modSelectCheck)
      {
        chatInputFail = chatInputFail + "Input Error: Select at Least One Moderator\n";
      }
      socket.emit("chat create failure", chatInputFail);
    }
    else{
      chat.exists({name: obj.chatname}, function (error, document) { 
        if (error){ 
            console.log(error)
            //socket.emit("register error", "Error: unable to register"); 
        }
        else{
          //If there is no existing chat with given name then proceed with registering new user
          if(document === false){
            //Create new user object with submitted info
            let newChat = new chat({approved: false, name: obj.chatname, participants: obj.users, mods: obj.mods});
            //Save user to the database
            newChat.save(function (error, document) {
              if (error){
                console.error(error)
              }
              else 
              {
                console.log("added");
                socket.emit("chat create success", "Creation of Chat: " + obj.chatname + " Successful");
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
    console.log(obj);

    
  });
  

  //if a chat is rejected, this chat will be romove from the database
  socket.on("rejectChat", function(name){
    //find the rejected chat room
    chat.findOne({name:name}, function(error, document){
      if (error)console.error(error);
      else{
        //if there is no error, delete the chat room
        chat.deleteOne({ name: name }, function (err) {
          if(err) console.log(err);
          console.log("Successful deletion");
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
          console.log(name)  
          //if there is no error update the approved to true at database
          document.update({approved:true}, function (err, result) { 
            if (err){ 
                console.log(err) 
            }else{ 
                console.log("Result :", result)  
            } 
        });   
      }
    })
  })

  
  socket.on("refreshChatList", function(userName){
    updatechat(userName);
  })

  //read the chat rooms from database, send them to client side
 async function updatechat(userName){
  var chats = []
  //read all the chat rooms in chat and put them into a array called chats
  await chat.find({}, function(err, result) {
   result.forEach(function(userChat) {
     if(userChat.participants.includes(userName) || userChat.mods.includes(userName)){
      console.log(userChat.name);
      chats.push(userChat.name);
     }
    
    }); 
  });
  console.log(chats)
  //send the chats to client side
  socket.emit("updateChats",chats);

 }

  //Friends page events
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

  
  socket.on("accept friend request", function(obj){
    user.findById(obj.request, function (err, doc) {
      if(err) socket.emit("friends page error", "Error accepting request");
      else{
        if(doc === null) socket.emit("friends page error", "Error accepting request");
        else{
          
          doc.friends.push(obj.user);
          
          doc.save(function (err) {
            if(err) socket.emit("friends page error", "Error accepting request");
          });
        }
      }
    })

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

  socket.on("unfriend", function(obj){
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

  socket.on("decline friend request", function(obj){
   
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
  
});


//Socket listening on port 
http.listen(port, function(){
  console.log('listening on *:' + port);
});


