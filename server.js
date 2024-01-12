const express = require('express');    //require is a function in nodejs used to import modules.Now express module is available to use in server.js.//express is used to create backend server,handle HTTP request etc.
const app = express(); //app object has methods for routing HTTP requests,configuring middleware etc.
const {ExpressPeerServer}=require('peer'); //imports peer module
const server = require('http').Server(app); //creation of a server to be used with socketio. //why to create own server instead of using express default ? The second form (creating an HTTP server yourself, instead of having Express create one for you) is useful if you want to reuse the HTTP server, for example to run socket.io.
const peerServer=ExpressPeerServer(server,{
  debug:true
});   //ExpressPeerServer is a kind of function provided by peer Library,helps in integrating PeerServer functionality into an Express server environment.

const io=require('socket.io')(server);  //require('socket.io') is basically a function.The imported Socket.IO library is called like a function, passing the existing HTTP server instance (server) as an argument. 
const { v4: uuidv4 } = require('uuid'); // unique ids for rooms
const passport = require("passport");
const googleStratergy = require("passport-google-oauth20");
passport.use(new googleStratergy({
    clientID: "410907086160-n89fr0tmqv9rvu4jj4phs5op8abl8hh5.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/google/callback"
}, (accessToken, refreshToken, profile, done) => {
   
}))

connections=[];
       
app.set('view engine', 'ejs');  //to render webpages, basically you are telling express to use ejs as a view engine.
app.use(express.static('public'));//express.static is a built in middleware means middleware,they are functions which have access to request object,response object. public folder contains css and javascript code.
app.use('/peerjs',peerServer); //this means any requests made to the route that starts with /peerjs will be managed through peerServers which is responsible for managing WebRTC connections with peers.
app.get("/join", passport.authenticate("google", {
    scope: ["profile", "email"],}
    
))

app.get("/",(req,res) => {
  res.sendStatus(200)
})

app.get('/google/callback', (req, res) => {
    res.redirect(`/${uuidv4()}`); //random uuid will be attached to the end of URL.
})
            

app.get('/:room',(req,res)=>{
    res.render('room',{ roomId: req.params.room})
})

io.on('connection',socket=>{   //io.on->Listens for incoming connections from clients.
    connections.push(socket);  //When a new user connects, their socket (a communication channel between the server and the user) is added to a list of connections.
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId);  //directs the user to join a specific room.
        socket.broadcast.to(roomId).emit("user-connected", userId); //  it will give message to all other users except the one currently joined.
        socket.on('message',message=>{ //This code snippet sets up a listener for the 'message' event sent from a client. When a client emits (sends) a 'message' event to the server, this block of code will execute.

            io.to(roomId).emit('createMessage',message);
        })

        socket.on('disconnect',()=>{
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
    socket.on('draw',(data)=>{
      connections.forEach(con=>{
          if(con.id!==socket.id){
              con.emit('ondraw',{x:data.x, y:data.y});
          }
      })
  })

  socket.on('down',(data)=>{
      connections.forEach(con=>{
          if(con.id!==socket.id){
              con.emit('ondown',{x:data.x,y:data.y});
          }
      })
  })
})
          
server.listen(3000);
        
