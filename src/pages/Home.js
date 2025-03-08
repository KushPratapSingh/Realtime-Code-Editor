import React, { useState } from 'react'

// module for generating unique ids
import {v4 as uuidV4} from 'uuid'

// toast module
import toast from 'react-hot-toast';

import {useNavigate} from 'react-router-dom'
const Home = () => {

  const handleInputEnter = (e)=>{

    if(e.code === 'Enter'){
      joinRoom();
    }
  }

  const navigate = useNavigate();
  const[roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  
  
  const createNewRoom = (e)=>{
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    // console.log(id)    
    toast.success('new room created');
  }


  const joinRoom = ()=>{
    if(!roomId || !userName){
      toast.error('Please Fill RoomId And userName');

    }

    navigate(`/editor/${roomId}`, 
      {state:{
        userName,
      },}
    )
  }
  return (
    <div>
      <div className="homePageWrapper">
        <div className="formWrapper">
        <img className='homePageLogo' src="/code-sync.png" alt="desc" />
        <h4 className='mainLabel'>Paste Invitation Room ID</h4>
        <div className='inputGroup'>
          <input onKeyUp={handleInputEnter} type="text" className='inputBox' onChange={(e)=>setRoomId(e.target.value)} value={roomId} placeholder='Room ID' name="" id="" />
          <input onKeyUp={handleInputEnter} type="text" className='inputBox' onChange={(e)=>setUserName(e.target.value)} value={userName} placeholder='userName' name="" id="" />
          <button  onClick={joinRoom} className='btn joinBtn'>Join</button>   
        
          <span className='createInfo'>
            If you don't have an invite then create &nbsp;

            <a onClick={createNewRoom} href="" className='createNewBtn'>
              New Room
            </a>
          </span>
        </div>
        </div>

        <footer>
          <h4>Built With Love By &nbsp; <a href="https://github.com/KushPratapSingh">Kush</a> </h4>
        </footer>
      </div>
      
    </div>
  )
}

export default Home
