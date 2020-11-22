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
          let newUser = new user({type: obj.type, approved: true, email:obj.em, password:obj.pass, displayName:obj.dn, chats:[], friends:[]});
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


  updatechat()
  

  //read the chat rooms from database, send them to client side
 async function updatechat(){
  var chats = []
  //read all the chat rooms in chat and put them into a array called chats
  await chat.find({}, function(err, result) {
   result.forEach(function(user) {
    console.log(user.name);
    chats.push(user.name);
    }); 
  });
  console.log(chats)
  //send the chats to client side
  socket.emit("updateChats",chats,function(){

  });

 }
});





//Socket listening on port 
http.listen(port, function(){
  console.log('listening on *:' + port);
});


