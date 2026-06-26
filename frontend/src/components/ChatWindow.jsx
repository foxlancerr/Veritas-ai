import React, { useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, addMessage } from '../features/messages/messagesSlice';
import MessageInput from './MessageInput';
import { socket, UserDataContext } from '../context/UserContext';

export default function ChatWindow({ conversation }) {
  const dispatch = useDispatch();
  const messages = useSelector(s => (conversation ? s.messages.byConversation[conversation._id] || [] : []));
  const containerRef = useRef();

  const previousConversationRef = useRef(null);
  const { userData, onlineUsers } = useContext(UserDataContext);

  useEffect(() => {
    if (!conversation) return;
    if (!socket) return;

    const prevId = previousConversationRef.current;
    if (prevId && prevId !== conversation._id) {
      socket.emit('leaveConversation', { conversationId: prevId });
    }
    previousConversationRef.current = conversation._id;

    dispatch(fetchMessages({ conversationId: conversation._id }));
    socket.emit('joinConversation', { conversationId: conversation._id });

    const onNew = (payload) => {
      const { message } = payload;
      const messageConversationId = message?.conversationId?._id || message?.conversationId;
      if (messageConversationId?.toString() === conversation._id?.toString()) {
        dispatch(addMessage({ conversationId: conversation._id, message }));
      }
    };

    socket.on('newMessage', onNew);
    return () => {
      socket.off('newMessage', onNew);
      socket.emit('leaveConversation', { conversationId: conversation._id });
    };
  }, [conversation, dispatch]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Select a conversation
      </div>
    );
  }

  const other = (conversation.participants || []).find(p => p._id !== userData?._id) || {};
  const isOnline = onlineUsers?.includes?.(other._id?.toString());

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/90">
        <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <img src={other.profileImage || '/logo.svg'} alt="avatar" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {other.firstName ? `${other.firstName} ${other.lastName}` : other.userName || 'Unknown'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isOnline ? 'Online' : 'Last seen recently'}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-3 sm:p-4 dark:bg-slate-950" ref={containerRef}>
        {messages.map(m => {
          const mine = m.sender?._id?.toString() === userData?._id?.toString();
          return (
            <div key={m._id} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100'} max-w-[80%] rounded-2xl px-3 py-2`}>
                <div className="break-words text-sm">{m.text}</div>
                <div className="mt-1 text-[10px] text-right opacity-80">
                  {mine && (m.seenBy?.length ? 'Seen' : 'Delivered')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput conversationId={conversation._id} />
    </div>
  );
}
