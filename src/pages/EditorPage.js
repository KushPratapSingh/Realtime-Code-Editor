import React, { useEffect, useRef, useState } from 'react'
import Editor from '../components/Editor';
import Client from '../components/Client';
import { initSocket } from '../socket';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';


const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null); 

  const reactNavigator = useNavigate();

  const socketRef = useRef(null);
  const location = useLocation();
  const {roomId} = useParams();
  useEffect(()=>{

    const init = async ()=>{

      // imported from socket.js
      socketRef.current = await initSocket();

      // error handling while connect
      socketRef.current.on('connect_error', (err)=>handleErrors(err));
      socketRef.current.on('connect_failed', (err)=>handleErrors(err));

      function handleErrors(err){
        console.log('socket error', err);
        toast.error('Socket connection failed , trya again later');
        reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        userName:location.state?.userName 
      });

      // listening for joined events
      socketRef.current.on(ACTIONS.JOINED, ({clients, userName, socketId})=>{

        if(userName !== location.state?.userName){
            toast.success(`${userName} joined the room`);
            console.log(`${userName} joined`);

        }

        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          
          code:codeRef.current,
          socketId

        });
      });

      // listening for
      socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, userName})=>{
        toast.success(`${userName} left the rooms` );
        setClients((prev)=>{
          return prev.filter((client)=>{
            return client.socketId !== socketId; 
          })
        })
      })


    }
    init();


    // clear listeners 
    return ()=>{
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();

    }
  }, [])

  if(!location.state){
    return <Navigate to={'/'} ></Navigate>
  }

  const leaveRoom = ()=>{
    reactNavigator('/');
  }
  const copyRoomId = async(roomId)=>{
    try {
      console.log(roomId)
      await navigator.clipboard.writeText(roomId);
      toast.success('Room Id Pasted On Your Clipboard');
    } catch (error) {
      toast.error('Failed');
      console.log(error);
    }
  }
  return (
    <div className='mainWrap'>
        <div className="aside">
            <div className="asideInner">
              <div className="logo">
                <img src="/code-sync.png" className='logoImage' alt="" />
              </div>
              <h3>Connected</h3>
              <div className="clientsList">
                {clients.map((client)=>(
                    <Client key={client.socketId} userName={client.userName} />
                ))}

              </div> 
            </div>

            <button className="btn copyBtn" onClick={()=>copyRoomId(roomId)}>Copy RoomID</button>
            <button className='btn leaveBtn' onClick={leaveRoom} >Leave</button>
            
        </div>


        <div className='editorWrap'>
                {/* {console.log('rendering twice')} */}
              <Editor socketRef = {socketRef} roomId = {roomId} onCodeChange={(code)=>{codeRef.current=code;}} />
        </div>
    </div>
  )
}

export default EditorPage
