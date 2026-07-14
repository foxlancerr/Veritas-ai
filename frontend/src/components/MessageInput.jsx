import React, { useState, useRef, useEffect } from 'react';
import { socket } from '../context/UserContext';
import ReplySuggestionsPanel from './ReplySuggestionsPanel';
import apiHelpers from '../../api/apiHelper';

export default function MessageInput({ conversationId }) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const suggestionsTimeoutRef = useRef(null);
  const suggestionsAbortControllerRef = useRef(null);

  // Fetch reply suggestions from backend
  const fetchReplySuggestions = async () => {
    if (!conversationId) return;

    try {
      setLoadingSuggestions(true);
      setSuggestions([]);

      // Cancel previous request if still pending
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }

      suggestionsAbortControllerRef.current = new AbortController();

      const response = await apiHelpers.get(
        `/chat/conversations/${conversationId}/reply-suggestions`,
        {
          withCredentials: true,
          signal: suggestionsAbortControllerRef.current.signal,
        }
      );

      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching reply suggestions:', error);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced suggestion fetch on new message
  const debouncedFetchSuggestions = () => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      fetchReplySuggestions();
    }, 500);
  };

  // Listen for new messages and fetch suggestions
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      debouncedFetchSuggestions();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [conversationId]);

  // Fetch suggestions when conversation opens
  useEffect(() => {
    if (conversationId) {
      // Small delay to ensure messages are loaded
      const timer = setTimeout(() => {
        fetchReplySuggestions();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [conversationId]);

  // Hide suggestions when user starts typing
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Hide suggestions while typing
    if (newText.trim().length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setText(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const send = () => {
    if (!text.trim() || !socket) return;
    socket.emit('send-message', { conversationId, text: text.trim() });
    setText('');
    setShowSuggestions(true);
    setSuggestions([]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900">
      <ReplySuggestionsPanel
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        isLoading={loadingSuggestions}
        isVisible={showSuggestions && suggestions.length > 0}
      />
      
      <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm transition focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-800">
          <textarea
            value={text}
            onChange={handleTextChange}
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
    </div>
  );
}
