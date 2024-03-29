const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages') ;
const {userJoin, getCurrUser,userLeave,getRoomUsers}= require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'chatcord bot';

//set static folder
app.use(express.static(path.join(__dirname,'public')));
//run when client connects
io.on('connection',socket=>{


    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room)
         //notify current user
        socket.emit('message',formatMessage(botName,'Welcome to chatcord'));
        //bradcast will notify everyone lese on network except current user
         socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
        //send users and room info
         io.to(user.room).emit('roomUsers',{
             room:user.room,
             users: getRoomUsers(user.room)
         });
    })

    
   

    //listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        const user = getCurrUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })
    //runs when client disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            //notify all users
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
            //send users and room info
            io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: getRoomUsers(user.room)
            });
        }
        
        
    })

});

const PORT = 3000 || process.env.PORT;

server.listen(PORT,()=>{
    console.log(`server running at ${PORT}`);
});