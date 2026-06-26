import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../features/conversations/conversationsSlice';
import { UserDataContext } from '../context/UserContext';

export default function ConversationList({ onSelect }) {
  const dispatch = useDispatch();
  const convos = useSelector(s => Array.isArray(s.conversations?.items) ? s.conversations.items : []);
  const { userData, onlineUsers } = useContext(UserDataContext);

  useEffect(() => { dispatch(fetchConversations()); }, [dispatch]);

  return (
    <div className="w-full overflow-auto p-1 sm:p-2">
      {convos.map((c) => {
        const other = (c.participants || []).find(p => p._id !== userData?._id) || {};
        const isOnline = onlineUsers?.includes?.(other._id?.toString());
        const displayedTime = c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

        return (
          <div
            key={c._id}
            className="my-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => onSelect(c)}
          >
            <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <img src={other.profileImage || '/logo.svg'} alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {other.firstName ? `${other.firstName} ${other.lastName}` : other.userName || 'Unknown'}
                </div>
                <div className="text-[11px] text-slate-400">{displayedTime}</div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{c.lastMessage || 'No messages yet'}</span>
                {isOnline ? <span className="text-emerald-500">●</span> : <span className="text-slate-300 dark:text-slate-600">●</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
