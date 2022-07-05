const express = require('express');
const app = express();
const {ExpressPeerServer}=require('peer');
const server = require('http').Server(app);
const peerServer=ExpressPeerServer(server,{
  debug:true
});

const io=require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const passport = require("passport");
const googleStratergy = require("passport-google-oauth20");
passport.use(new googleStratergy({
    clientID: "628412409662-7q1enniq3ah2q49g9rp320smmggv4uei.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/google/callback"
}, (accessToken, refreshToken, profile, done) => {
   
}))

connections=[];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs',peerServer);
app.get("/", passport.authenticate("google", {
    scope: ["profile", "email"],}
    
))

app.get('/google/callback', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})
            

app.get('/:room',(req,res)=>{
    res.render('room',{ roomId: req.params.room})
})

io.on('connection',socket=>{
    connections.push(socket);
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
        socket.on('message',message=>{
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
          
server.listen(3030);
