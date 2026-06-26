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

        let conversation = response;
        try {
          const conversations = await apiHelpers.get("/chat/conversations");
          const matchedConversation = Array.isArray(conversations)
            ? conversations.find(
                (item) =>
                  item._id === response._id ||
                  (item.participants || []).some((participant) => participant._id === chatWith)
              )
            : null;
          conversation = matchedConversation || response;
        } catch (conversationListError) {
          console.error("Failed to enrich conversation details", conversationListError);
        }

        setActive(conversation);
      } catch (error) {
        console.error("Failed to open conversation", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [chatWith, token]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4">
      <div className="flex h-[95dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:h-[88vh]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-white dark:border-slate-700 sm:px-5">
          <div>
            <div className="text-lg font-semibold">Messenger</div>
            <div className="text-xs text-blue-50/90">Real-time one-to-one chat</div>
          </div>
          <button
            onClick={closeChat}
            className="rounded-full border border-white/30 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <div className="w-full border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/60 md:w-80 md:border-b-0 md:border-r">
            <ConversationList onSelect={(c) => setActive(c)} />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden bg-white dark:bg-slate-900">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Loading conversation...
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
