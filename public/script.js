const socket = io('/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers={};     

var peer = new Peer(undefined, {
    host: "peerjs-server.herokuapp.com",
    secure: true, port:
        443,
});



let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {        
        setTimeout(connectToNewUser, 1000, userId, stream)
    })

    let text = $("input");
  
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    })

    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom();
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

socket.on('user-disconnected',userId=>{
    if(peers[userId]) peers[userId].close();
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close',()=>{
        video.remove();
    })

    peers[userId]=call;

}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom=()=>{
  let d=$('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute=()=>{
  const enabled=myVideoStream.getAudioTracks()[0].enabled;

  if(enabled){
      myVideoStream.getAudioTracks()[0].enabled=false;
      setUnmuteButton();
  }
  else{
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled=true;
  }
}


const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const playStop=()=>{
  let enabled=myVideoStream.getVideoTracks()[0].enabled;
  if(enabled){
      myVideoStream.getVideoTracks()[0].enabled=false;
      setPlayVideo();
  }
  else{
      setStopVideo();
      myVideoStream.getVideoTracks()[0].enabled=true;
  }
}

const setStopVideo=()=>{
  const html=`<i class="fas fa-video"></i>
  <span>Stop Video</span>`
  document.querySelector('.main_video_button').innerHTML=html;
}

const setPlayVideo=()=>{
  const html=`<i class="stop fas fa-video-slash"></i>
  <span>Play Video</span>`
  document.querySelector('.main_video_button').innerHTML=html;
}

let canvas = document.getElementById('canvas');

canvas.width = 0.98 * window.innerWidth;
canvas.height = window.innerHeight;

const skt = socket.connect('http://localhost:3030/')

let ctx = canvas.getContext("2d");

var x;
var y;
let mouseDown = false;
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