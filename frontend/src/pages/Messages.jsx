import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiMessageCircle, FiSearch } from "react-icons/fi";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import ConversationList from "../components/ConversationList";
import apiHelpers from "../../api/apiHelper";
import { fetchConversations } from "../features/conversations/conversationsSlice";
import { store } from "../store/store";
import { UserDataContext } from "../context/UserContext";

function MessagesPageContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConversation, setActiveConversation] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userData } = useContext(UserDataContext);

  const conversations = useSelector((state) =>
    Array.isArray(state.conversations?.items) ? state.conversations.items : []
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const result = await apiHelpers.get("/connection/");
        setConnections(Array.isArray(result.connections) ? result.connections : []);
      } catch (error) {
        console.error("Failed to load connections", error);
      }
    };

    loadConnections();
  }, []);

  useEffect(() => {
    const chatWith = searchParams.get("chatWith");
    if (!chatWith) return;

    const openConversationFromParam = async () => {
      try {
        setLoadingConversation(true);
        const response = await apiHelpers.post("/chat/conversation", {
          participantId: chatWith,
        });

        let conversation = response;
        try {
          const updatedConversations = await apiHelpers.get("/chat/conversations");
          const matched = Array.isArray(updatedConversations)
            ? updatedConversations.find(
                (item) =>
                  item._id === response._id ||
                  (item.participants || []).some(
                    (participant) => participant._id === chatWith
                  )
              )
            : null;
          conversation = matched || response;
        } catch (error) {
          console.error("Failed to enrich conversation details", error);
        }

        setActiveConversation(conversation);
        if (isMobile) {
          setShowChatMobile(true);
        }
        setSearchParams((prev) => {
          prev.delete("chatWith");
          return prev;
        });
      } catch (error) {
        console.error("Failed to open chat from query param", error);
      } finally {
        setLoadingConversation(false);
      }
    };

    openConversationFromParam();
  }, [isMobile, searchParams, setSearchParams]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const other = (conversation.participants || []).find(
        (participant) => participant._id !== userData?._id
      );
      const fullName = `${other?.firstName || ""} ${other?.lastName || ""}`.trim();
      return [fullName, other?.userName, conversation.lastMessage]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [conversations, searchQuery, userData?._id]);

  const filteredConnections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const existingIds = new Set(
      conversations.flatMap((conversation) =>
        (conversation.participants || [])
          .filter((participant) => participant._id !== userData?._id)
          .map((participant) => participant._id?.toString())
      )
    );

    return connections.filter((connection) => {
      const id = connection._id?.toString();
      if (existingIds.has(id)) return false;
      if (!query) return true;
      const fullName = `${connection.firstName || ""} ${connection.lastName || ""}`.trim();
      return [fullName, connection.userName, connection.headline]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [connections, conversations, searchQuery, userData?._id]);

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    if (isMobile) {
      setShowChatMobile(true);
    }
  };

  const handleStartConversation = async (participantId) => {
    try {
      setLoadingConversation(true);
      const response = await apiHelpers.post("/chat/conversation", {
        participantId,
      });

      let conversation = response;
      try {
        const updatedConversations = await apiHelpers.get("/chat/conversations");
        const matched = Array.isArray(updatedConversations)
          ? updatedConversations.find(
              (item) =>
                item._id === response._id ||
                (item.participants || []).some(
                  (participant) => participant._id === participantId
                )
            )
          : null;
        conversation = matched || response;
      } catch (error) {
        console.error("Failed to enrich conversation details", error);
      }

      setActiveConversation(conversation);
      if (isMobile) {
        setShowChatMobile(true);
      }
      dispatch(fetchConversations());
    } catch (error) {
      console.error("Failed to start conversation", error);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleBackToList = () => {
    setShowChatMobile(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[80px] transition-colors duration-300 dark:bg-slate-950">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col px-3 py-4 sm:px-4 lg:px-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-4 text-white dark:border-slate-800">
            <div>
              <div className="text-lg font-semibold">Messages</div>
              <div className="text-sm text-sky-100">Your conversations and connections</div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full border border-white/30 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Back home
            </button>
          </div>

          <div className="flex h-[calc(100vh-220px)] min-h-[680px] flex-col lg:flex-row">
            <aside
              className={`${isMobile && showChatMobile ? "hidden" : "flex"} w-full flex-col border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60 lg:w-[360px] lg:border-b-0 lg:border-r`}
            >
              <div className="border-b border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <FiSearch className="text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search conversations"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {filteredConnections.length > 0 && (
                  <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Connections
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {filteredConnections.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {filteredConnections.map((connection) => (
                        <button
                          key={connection._id}
                          type="button"
                          onClick={() => handleStartConversation(connection._id)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <img
                              src={connection.profileImage || "/logo.svg"}
                              alt="avatar"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {connection.firstName && connection.lastName
                                ? `${connection.firstName} ${connection.lastName}`
                                : connection.userName || "Unknown"}
                            </div>
                            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {connection.headline || "Connected"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <ConversationList
                  conversations={filteredConversations}
                  onSelect={handleSelectConversation}
                  activeConversation={activeConversation}
                  loadingConversation={loadingConversation}
                />
              </div>
            </aside>

            <main
              className={`${isMobile && !showChatMobile ? "hidden" : "flex"} min-w-0 flex-1 flex-col bg-white dark:bg-slate-900`}
            >
              {activeConversation ? (
                <>
                  {isMobile && (
                    <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={handleBackToList}
                        className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <FiArrowLeft />
                      </button>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Conversation
                      </div>
                    </div>
                  )}
                  <ChatWindow conversation={activeConversation} />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  <div className="rounded-full bg-sky-100 p-4 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                    <FiMessageCircle className="text-2xl" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Choose a conversation
                    </div>
                    <div>Pick a chat from the list or start one from your connections.</div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <Provider store={store}>
      <MessagesPageContent />
    </Provider>
  );
}
