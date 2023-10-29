import { useContext, useEffect, useState } from "react"
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { UserContext } from "./UserContext";

export default function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlinePeople, setOnlinePeople] = useState<{ [key: string]: string }>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const {username} = useContext(UserContext);

  useEffect(() => {
    const nws = new WebSocket('ws://localhost:4000');
    setWs(nws);
    nws.addEventListener('message', handleMessage);
    return () => {
      nws.removeEventListener('message', handleMessage);
      nws.close();
    };
  }, []);

  function showOnlinePeople(peopleArray: { userId: string, username: string }[]) {
    const people: { [key: string]: string } = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(e: MessageEvent) {
    const messageData = JSON.parse(e.data);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    }
  }

  const onlinePeopleExcludeMe = Object.keys(onlinePeople).filter(userId => userId !== username);

  return (
    <div className='flex h-screen'>
      <div className='bg-white w-1/3'>
        <Logo />
        {onlinePeopleExcludeMe.map(userId => (
          <div onClick={() => setSelectedUserId(userId)} key={userId} className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${userId === selectedUserId && 'bg-blue-50'}`}>
            {userId === selectedUserId && (
              <div className="2-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
            <Avatar userId={userId} username={onlinePeople[userId]} />
            <span className='text-gray-800'>{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className='flex flex-col bg-blue-50 flex-1 p-2'>
        <div className='flex-grow'>
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-300">&larr; Select a person from the sidebar</div>
            </div>
          )}
        </div>
        <div className='flex gap-2 mx-2'>
          <input
            type='text'
            className='bg-white flex-grow border rounded-sm p-2'
            placeholder="type your message here" />
          <button className='bg-blue-500 p-2 rounded-sm text-white'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}