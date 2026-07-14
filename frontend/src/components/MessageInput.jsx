import React, { useState } from 'react';
import { socket } from '../context/UserContext';

export default function MessageInput({ conversationId }) {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim() || !socket) return;
    socket.emit('sendMessage', { conversationId, text: text.trim() });
    setText('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm transition focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-800">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
          placeholder="Write a message"
        />
        <button
          type="button"
          onClick={send}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
