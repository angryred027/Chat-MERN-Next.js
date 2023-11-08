import { useContext, useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { UserContext } from "./UserContext";

import _ from "lodash";

export default function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlinePeople, setOnlinePeople] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>("");
  const [messages, setMessages] = useState<unknown[]>([]);
  const { username, id } = useContext(UserContext);

  useEffect(() => {
    const nws = new WebSocket("ws://localhost:4000");
    setWs(nws);
    nws.addEventListener("message", handleMessage);
    return () => {
      nws.removeEventListener("message", handleMessage);
      nws.close();
    };
  }, []);

  function showOnlinePeople(
    peopleArray: { userId: string; username: string }[],
  ) {
    const people: { [key: string]: string } = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(e: MessageEvent) {
    const messageData = JSON.parse(e.data);
    console.log({ e, messageData });
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [
        ...prev,
        { ...messageData },
      ]);
    }
  }

  function sendMessage(ev: { preventDefault: () => void }) {
    ev.preventDefault();
    if (!ws) return;
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      }),
    );
    setNewMessageText("");
    setMessages((prev) => [...prev, { text: newMessageText, sender: id, recipient: selectedUserId, id: Date.now() }]);
  }

  const onlinePeopleExclOurUser = { ...onlinePeople };
  id && delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = _.uniqBy(messages, "id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">
        <Logo />
        {onlinePeopleExclOurUser.map((userId) => (
          <div
            onClick={() => setSelectedUserId(userId)}
            key={userId}
            className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${
              userId === selectedUserId && "bg-blue-50"
            }`}
          >
            {userId === selectedUserId && (
              <div className="2-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar userId={userId} username={onlinePeople[userId]} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-50 flex-1 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-300">
                &larr; Select a person from the sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className='overflow-y-scroll'>
              {messagesWithoutDupes.map((message) => (
                <div className={(message.sender === id ? 'text-right' : 'text-left')}>
                  <div className={"text-left inline-block p-2 my-2 rounded-md text-sm" + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>sender: {message.sender}<br />ID: {id}<br />{message.text}</div>
                </div>
                
              ))}
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2 mx-2" onSubmit={sendMessage}>
            <input
              type={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              className="bg-white flex-grow border rounded-sm p-2"
              placeholder="type your message here"
            />
            <button
              type="submit"
              className="bg-blue-500 p-2 rounded-sm text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
