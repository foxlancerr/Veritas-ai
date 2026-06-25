import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../features/conversations/conversationsSlice';
import { UserDataContext } from '../context/UserContext';

export default function ConversationList({ onSelect }) {
  const dispatch = useDispatch();
  const convos = useSelector(s => Array.isArray(s.conversations?.items) ? s.conversations.items : []);
  const { userData, onlineUsers } = useContext(UserDataContext);

  console.log('ConversationList render, convos:', convos);
  useEffect(() => { dispatch(fetchConversations()); }, [dispatch]);

  return (
    <div className="w-80 border-r overflow-auto">
      {convos.map((c) => {
        const other = (c.participants || []).find(p => p._id !== userData?._id) || {};
        const isOnline = onlineUsers?.includes?.(other._id?.toString());
        return (
          <div key={c._id} className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3" onClick={() => onSelect(c)}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <img src={other.profileImage || '/logo.svg'} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{other.firstName ? `${other.firstName} ${other.lastName}` : other.userName || 'Unknown'}</div>
                <div className="text-xs text-gray-400">{new Date(c.lastMessageAt).toLocaleTimeString()}</div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span className="truncate">{c.lastMessage || 'No messages yet'}</span>
                {isOnline ? <span className="text-green-500">●</span> : <span className="text-gray-300">●</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
