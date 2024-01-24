import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import Logo from './Logo'
import Contact from './Contact'
import { uniqBy } from 'lodash'

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState([]);
  const { username, id, setUsername, setId } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");

  const handleLogout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  };

  useEffect(() => {
    connectToWs();
  }, [setSelectedUserId])

  const connectToWs = () => {
    const ws = new WebSocket('ws://localhost:4000')
    setWs(ws);
    ws.addEventListener('message', handleMessage)
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    })
  }

  //handleMessage เช็คว่าแค่ online หรือ  Chat กัน
  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    //กรณีที่ online
    if ('online' in messageData) {
      showOnlinePeople(messageData.online)
    }
    //กรณีที่ Chat
    else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessage((prev) => [...prev, { ...messageData }])
      }
    }
  }

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      if (userId !== id) {
        people[userId] = username;
      }
    });
    setOnlinePeople(people);
  };

  //เมื่อ setOnlinePeople เปลี่ยน useEffect นี้จะทำงาน
  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople,id]);
  
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const sendMessage = (e, file = null) => {
    if (e) e.preventDefault();
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
      file,
    }));
    if (file) {
      axios.get("/message/" + selectedUserId).then((res) => {
        setMessage(res.data);
      });
    } else {
      setNewMessageText("");
      setMessage((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/message/" + selectedUserId).then((res) => {
        setMessage(res.data);
      });
    }
  }, [selectedUserId]);

  const messageWithoutDups = uniqBy(message, "_id")

  const sendFile = (e) => {
    const reader = new FileReader
    reader.readAsArrayBuffer(e.target.files[0])
    reader.onload = () => {
      sendMessage(null, {name:e.target.files[0].name, data:reader.result})
    }
  }
  return (
    <div className='flex h-screen '>
      <div className='flex flex-col w-1/3'>
        <div className='flex-grow '>
          <Logo />
          {/* Object.entries จะแปลง onlinePeople ที่เป็น Obj ให้เป็น Array ของ userId,username */}
          {Object.entries(onlinePeople).map(([userId, username]) => (
            <Contact
              key={userId}
              username={username}
              id={userId}
              online={true}
              selected={userId === selectedUserId}
              onClick={() => setSelectedUserId(userId)}
            />
          ))}
          {/* Object.entries จะแปลง offlinePeople ที่เป็น Obj ให้เป็น Array ของ userId,userData */}
          {Object.entries(offlinePeople).map(([userId, userData]) => (
            <Contact
              key={userId}
              username={userData.username}
              id={userId}
              online={false}
              selected={userId === selectedUserId}
              onClick={() => setSelectedUserId(userId)}
            />
          ))}
        </div>
        <div className='p-2 text-center flex items-center justify-center'>
          <span className='mr-2 text-sm text-gray-600 flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {username}
          </span>
          <button className='btn btn-ghost text-sm' onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className='bg-blue-100 flex flex-col w-2/3 p-2 '>
        <div className="flex-grow">
          {!selectedUserId && (
            <div className='flex h-full flex-grow items-center justify-center'>
              <div className='text-gray-600 '>
                &larr; Select a person from sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className='relative h-full'>
              <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>
                {messageWithoutDups.map((message) => (
                  <div key={message._id} className={(message.sender === id ? "text-right" : "text-left")}>
                    <div className={'text-left inline-block p-2 my-2 rounded-md text-sm ' + 
                    (message.sender === id ? 
                    "bg-blue-500 text-white" : 
                    "bg-white text-gray-500")}>
                      {message.text}
                      {message.file &&(
                        <div className=''>
                          <a target='_blank' href={axios.defaults.baseURL + "/uploads/"+message.file} className="flex items-center gap-1 border-b">
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <form className='px-8 flex items-center justify-center space-x-2' onSubmit={sendMessage}>
          <input type="text" placeholder="Type here massge" className="input input-bordered w-full "
            value={newMessageText} onChange={e => setNewMessageText(e.target.value)} />
          <label className='bg-blue-200 p-3 text-gray-600 cursor-pointer rounded-sm border-blue-200' >
            <input type="file" className='hidden' onChange={sendFile}/>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
          </label>
          <button type="submit" className='bg-blue-500 p-3 text-white rounded-sm' >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat