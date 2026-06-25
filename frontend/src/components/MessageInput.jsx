import React, { useState } from 'react';
import { socket } from '../context/UserContext';

export default function MessageInput({ conversationId }) {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim() || !socket) return;
    socket.emit('sendMessage', { conversationId, text });
    setText('');
  };

  return (
    <div className="p-2 border-t flex">
      <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2" placeholder="Write a message" />
      <button onClick={send} className="ml-2 px-3 bg-blue-600 text-white">Send</button>
    </div>
  );
}
