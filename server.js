const express = require('express');


const app = express();
const http = require('http');

const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');



const server = http.createServer(app);
const io = new Server(server)

const userSocketMap = {}


const getAllConnectedClients = (roomId)=>{
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return {
            socketId,
            userName:userSocketMap[socketId]
        }
    })
}
io.on('connection', (socket)=>{
    console.log('socket connected', socket.id);
    socket.on(ACTIONS.JOIN, ({roomId, userName})=>{

        userSocketMap[socket.id] = userName;
        socket.join(roomId);
        // to display toast to other cnctd users when adding another client
        const clients = getAllConnectedClients(roomId) ;     
        // console.log(clients);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                userName:userName,
                socketId:socket.id
            });
        });

    });

    // recieve codechange from editor and send to other clients
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code})=>{
        // console.log('recieving', code)
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code})
    })
    socket.on(ACTIONS.SYNC_CODE, ({socketId, code})=>{
        // console.log('recieving', code)
        
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
    })


    socket.on('disconnecting', ()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {

                socketId:socket.id,
                userName:userSocketMap[socket.id],
            });
        })

        delete userSocketMap[socket.id];
        socket.leave();

    });

});




    

const PORT = process.env.PORT || 8080

server.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`);
})
