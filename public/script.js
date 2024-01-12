var socket = io('/'); // It initialises the connection between the client side and the server side at the root path.
var videoGrid = document.getElementById('video-grid') //The getElementById method of the document object in JavaScript returns a reference to the first element with the specified ID in the HTML document. 
var myVideo = document.createElement('video'); //is a way to create a new HTML element. Specifically, in this case, it's creating a video element, just like the ones you see when you watch videos online.
myVideo.muted = true; //so that we will not hear our own voice.
var peers={};     

var peer = new Peer();  
// var peer = new Peer(undefined, {   //undefined because system will  automatically generate a new ID for peer.
//     path:'/peerjs', //This code initializes a new instance of the Peer class from the PeerJS library. 
//     host: '/',
//     secure: true, //the connection to the server should be made using HTTPS, ensuring a secure communication channel.
//     port:'3000'
// });  

  

var myVideoStream;
navigator.mediaDevices.getUserMedia({ //.then it is a promise in javascript.
    video: true, //getuserMedia requests access to the user's camera and microphone.
    audio: true  //It specifies that requested stream should contain both video and audio.
}).then(stream => {  //When the user grants permission, this returns a stream, containing the user's video and audio data.
    myVideoStream = stream;
    addVideoStream(myVideo, stream) //this thing is to integrate my stream. 

    peer.on('call', call => { //Set up an event listener for incoming calls.  //'call' is an event name and call is an object.
        call.answer(stream) //this stream is our stream.
        var video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream) //userVideostrwam is peerstream.
        })
        console.log(call)
    })

    socket.on('user-connected', (userId) => {        //sockets.on means basically it listens for the event emitted by server that a user is connected. 
        setTimeout(connectToNewUser, 1000, userId, stream) // this is basically for frontend 
    })

    var text = $("input"); //It's intended to perform an action when a key is pressed on the keyboard within the HTML document and dollar sign is JQuery.
  
    $('html').keydown((e) => { //This code sets up an event listener using jQuery. It targets the entire HTML document ('html') and listens for a keydown event (when a key is pressed and held down). When a key is pressed, it triggers a function that takes an event object (e) as a parameter.
        if (e.which == 13 && text.val().length !== 0) { //13 is code for enter key
            socket.emit('message', text.val());
            text.val('') //After emitting the message, it clears the content of the text input field by setting its value to an empty string. 
        }
    })

    socket.on('createMessage', message => { //This code listens for a 'createMessage' event sent by the server to the client (your browser).
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`) //$('.messages') represents a specific HTML element (likely a chat area or a message container) selected by its class 'messages'.
        scrollToBottom(); //.append(...) is a jQuery method used to add content (in this case, a new message) to the selected element.
    }) //<li class="message"><b>user</b><br/>${message}</li> creates a new list item (<li>) to display a message, showing 'user' in bold and the actual message.
})
 
peer.on('open', id => {  //It listens for the event when the user gets connected
    socket.emit('join-room', ROOM_ID, id);  // This code sends an event to server  when the peer object is successfully connected and has an assigned ID.
})  //socket.emit: This is using the socket object to send a special message to the server.

socket.on('user-disconnected',userId=>{
    if(peers[userId]) peers[userId].close();
})

var connectToNewUser = (userId, stream) => {
    var call = peer.call(userId, stream) //This call sends the current user's stream (video and audio data) with a user id to peer.
    var video = document.createElement('video') //
    call.on('stream', userVideoStream => {  //Listens for the 'stream' event from the remote user. When the remote user starts sharing their video stream, this event gets triggered.
        addVideoStream(video, userVideoStream)
    })

    call.on('close',()=>{
        video.remove();
    })

    peers[userId]=call;

}

var addVideoStream = (video, stream) => {
    console.log(stream)
    video.srcObject = stream; // This Sets the source of the myVideo element to the obtained media stream.Sets the source of the myVideo element to the obtained media stream.In HTML5, the <video> element is used to embed video content in a document. One of its attributes is src, which traditionally points to a URL (source) of the video file to be displayed. However, in the context of using WebRTC and capturing live media from the user's camera and microphone, the srcObject property is used instead of the traditional src attribute.
    video.addEventListener('loadedmetadata', () => {  //The 'loadedmetadata' event in the context of a video element occurs when the browser has gathered the essential details about the video, such as its duration, dimensions, and other technical aspects, but has not yet fully loaded the content for playback.


        video.play();
    })  //In JavaScript, event listeners are used to execute code in response to specific events happening on a webpage, such as a button click, a form submission, or in this case, when a video's metadata is loaded.
    videoGrid.append(video);
}

var scrollToBottom=()=>{
  var d=$('.main_chat_window'); //chatWindow.scrollTop(...) sets the scroll position to this height.
  d.scrollTop(d.prop("scrollHeight")); //The scrollTop function is then used to set the vertical scrollbar's position of the chat window to the value of its scrollHeight property.


}

var muteUnmute=()=>{
  var enabled=myVideoStream.getAudioTracks()[0].enabled;

  if(enabled){
      myVideoStream.getAudioTracks()[0].enabled=false;
      setUnmuteButton();
  }
  else{
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled=true;
  }
}
 

var setMuteButton = () => {
  var html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

var setUnmuteButton = () => {
  var html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

var playStop=()=>{
  var enabled=myVideoStream.getVideoTracks()[0].enabled;
  if(enabled){
      myVideoStream.getVideoTracks()[0].enabled=false;
      setPlayVideo();
  }
  else{
      setStopVideo();
      myVideoStream.getVideoTracks()[0].enabled=true;
  }
}

var setStopVideo=()=>{
  var html=`<i class="fas fa-video"></i>
  <span>Stop Video</span>`
  document.querySelector('.main_video_button').innerHTML=html;
}

var setPlayVideo=()=>{
  var html=`<i class="stop fas fa-video-slash"></i>
  <span>Play Video</span>`
  document.querySelector('.main_video_button').innerHTML=html;
}

var canvas = document.getElementById('canvas');

canvas.width = 0.98 * window.innerWidth;
canvas.height = window.innerHeight;

var skt = socket.connect('http://localhost:3030/')

var ctx = canvas.getContext("2d");

var x;
var y;
var mouseDown = false;
window.onmousedown = (e) => {
    ctx.moveTo(x, y);
    skt.emit('down',{x,y});
    mouseDown = true;
}

window.onmouseup = (e) => {
    mouseDown = false;
}

skt.on('ondraw',({x,y})=>{
    ctx.lineTo(x, y);
    ctx.stroke();
})

skt.on('ondown',({x,y})=>{
    ctx.moveTo(x,y);
})

window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;

    if (mouseDown) {
        skt.emit('draw',{x,y});
        ctx.lineTo(x, y);
        ctx.stroke();
    }

}