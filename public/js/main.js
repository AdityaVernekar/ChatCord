const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const UserList = document.getElementById('users');
//get username,room from URL
const {username,room}= Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const socket = io();

socket.emit('joinRoom',{username ,room});
//message from  server
socket.on('message',message=>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
//get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//message submit
chatForm.addEventListener('submit',(e)=>{
e.preventDefault();
const msg = e.target.elements.msg.value;
//emit message to the server
socket.emit('chatMessage',msg);
//clear input
e.target.elements.msg.value="";
e.target.elements.msg.focus();
});
//funtion to outputmessage
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);

}

// add room name to DOM
function outputRoomName(room){
roomName.innerText=room;
}
function outputUsers(users){
UserList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}    
`;
}