import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../features/conversations/conversationsSlice';
import { UserDataContext } from '../context/UserContext';

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffInHours < 48) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function ConversationList({ onSelect, conversations, activeConversation, loadingConversation }) {
  const dispatch = useDispatch();
  const storeConversations = useSelector(s => Array.isArray(s.conversations?.items) ? s.conversations.items : []);
  const { userData, onlineUsers } = useContext(UserDataContext);
  const convos = conversations || storeConversations;

  useEffect(() => {
    if (!conversations) dispatch(fetchConversations());
  }, [conversations, dispatch]);

  if (!convos.length) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        {loadingConversation ? 'Loading conversations...' : 'No conversations yet'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-1 overflow-auto p-1 sm:p-2">
      {convos.map((c) => {
        const other = (c.participants || []).find(p => p._id !== userData?._id) || {};
        const isOnline = onlineUsers?.includes?.(other._id?.toString());
        const isActive = activeConversation?._id?.toString() === c._id?.toString();

        return (
          <button
            key={c._id}
            type="button"
            className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition ${isActive ? 'border-sky-200 bg-sky-50 shadow-sm dark:border-sky-800 dark:bg-sky-900/20' : 'border-transparent hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800'}`}
            onClick={() => onSelect?.(c)}
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <img src={other.profileImage || '/logo.svg'} alt="avatar" className="h-full w-full object-cover" />
              <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {other.firstName ? `${other.firstName} ${other.lastName}` : other.userName || 'Unknown'}
                </div>
                <div className="text-[11px] text-slate-400">{formatTimestamp(c.lastMessageAt)}</div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{c.lastMessage || 'No messages yet'}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
