import React, { useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, addMessage } from '../features/messages/messagesSlice';
import MessageInput from './MessageInput';
import { socket, UserDataContext } from '../context/UserContext';

const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatLastSeen = (value) => {
  if (!value) return 'Last seen recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last seen recently';

  const diffInMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `Last seen ${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Last seen ${diffInHours} hr ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Last seen ${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;

  return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
};

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
  const otherLastSeen = other.lastSeen || other.lastSeenAt;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/90">
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <img src={other.profileImage || '/logo.svg'} alt="avatar" className="h-full w-full object-cover" />
          <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {other.firstName ? `${other.firstName} ${other.lastName}` : other.userName || 'Unknown'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isOnline ? 'Online' : formatLastSeen(otherLastSeen)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-3 sm:p-4 dark:bg-slate-950" ref={containerRef}>
        {messages.map(m => {
          const mine = m.sender?._id?.toString() === userData?._id?.toString();
          return (
            <div key={m._id} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`${mine ? 'bg-sky-600 text-white' : 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100'} max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[75%]`}>
                <div className="break-words text-sm">{m.text}</div>
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  <span>{formatMessageTime(m.createdAt)}</span>
                  {mine && <span>{m.seenBy?.length ? 'Seen' : 'Delivered'}</span>}
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
