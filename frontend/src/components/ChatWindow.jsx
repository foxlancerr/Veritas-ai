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
    // auto-scroll
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  console.log("messgaers", messages, conversation);

  if (!conversation) return <div className="flex-1 flex items-center justify-center">Select a conversation</div>;

  const other = (conversation.participants || []).find(p => p._id !== userData?._id) || {};
  const isOnline = onlineUsers?.includes?.(other._id?.toString());

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <img src={other.profileImage || '/logo.svg'} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{other.firstName ? `${other.firstName} ${other.lastName}` : other.userName || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{isOnline ? 'Online' : 'Last seen recently'}</div>
        </div>
      </div>

      <div className="h-[300px] overflow-auto p-4" ref={containerRef}>
        {messages.map(m => {
          const mine = m.sender?._id?.toString() === userData?._id?.toString();
          return (
            <div key={m._id} className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} inline-block p-2 rounded max-w-[70%]`}>{m.text}
                <div className="text-[10px] mt-1 text-right opacity-80">{mine && (m.seenBy?.length ? 'Seen' : 'Delivered')}</div>
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput conversationId={conversation._id} />
    </div>
  );
}
