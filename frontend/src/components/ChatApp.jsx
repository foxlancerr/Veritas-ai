import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { store } from "../store/store";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import apiHelpers from "../../api/apiHelper";

function Inner() {
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const token = localStorage.getItem("token");
  const chatWith = searchParams.get("chatWith");

  useEffect(() => {
    if (!chatWith) {
      setOpen(false);
      setActive(null);
      return;
    }

    setOpen(true);
    setActive(null);

    const fetchConversation = async () => {
      try {
        setLoading(true);
        const response = await apiHelpers.post("/chat/conversation", {
          participantId: chatWith,
        });
        setActive(response);
      } catch (error) {
        console.error("Failed to open conversation", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [chatWith, token]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const closeChat = () => {
    setOpen(false);
    searchParams.delete("chatWith");
    setSearchParams(searchParams);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="w-full flex-col max-w-5xl h-[80vh] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <div className="font-semibold">Messenger</div>
            <div className="text-xs text-gray-500">
              Real-time one-to-one chat
            </div>
          </div>
          <button
            onClick={closeChat}
            className="text-gray-500 hover:text-gray-900"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-gray-200 overflow-y-scroll">
            <ConversationList onSelect={(c) => setActive(c)} />
          </div>
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                Loading...
              </div>
            ) : (
              <ChatWindow conversation={active} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatApp() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
