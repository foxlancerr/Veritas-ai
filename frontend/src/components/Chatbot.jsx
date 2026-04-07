import { useState, useRef, useEffect } from "react";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaLightbulb,
  FaChartLine,
  FaNewspaper,
  FaSearch,
  FaCommentDots,
  FaWifi,
} from "react-icons/fa";
import { RiAiGenerate2 } from "react-icons/ri";
import { MdOutlineTopic } from "react-icons/md";
import io from "socket.io-client";
import {  VITE_BACKEND_WEB_SOCKET_URI } from "../../api/url_helper"; // adjust path

import ReactMarkdown from "react-markdown";
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi there! 👋 I'm your AI assistant. Ask me about post ideas, trending topics, your stats, or just chat!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {

     // Clean up existing connection first
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }

    const token = localStorage.getItem("token");
    if (!token) return;

   
    socketRef.current = io(VITE_BACKEND_WEB_SOCKET_URI, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Chatbot WebSocket connected");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Chatbot WebSocket disconnected");
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setIsConnected(false);
    });

    // Listen for bot replies
    socketRef.current.on("bot-reply", (data) => {
      setMessages((prev) => [...prev, { role: "bot", content: data.content }]);
      setIsTyping(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [localStorage.getItem("token")]);

  // Send message via WebSocket
  const sendMessage = (message, intent = null) => {
    if (!socketRef.current || !isConnected) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Connection lost. Please refresh the page.",
        },
      ]);
      return false;
    }
    socketRef.current.emit("chat-message", { message, intent });
    return true;
  };

  // Handle user sending a message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !isConnected) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: trimmedInput }]);
    setInput("");
    setIsTyping(true);

    // Send to backend
    sendMessage(trimmedInput, null);
  };

  // Handle quick action buttons
  const handleQuickAction = (intent, promptText) => {
    if (!isConnected) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ No connection to server. Please check your network.",
        },
      ]);
      return;
    }

    // Add user message (what they clicked)
    const userMsgContent =
      promptText || `Tell me about ${intent.replace("_", " ")}`;
    setMessages((prev) => [...prev, { role: "user", content: userMsgContent }]);
    setIsTyping(true);

    // Send intent to backend (message can be empty or a hint)
    sendMessage(promptText, intent);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick actions configuration
  const quickActions = [
    {
      icon: <FaLightbulb />,
      label: "Post Idea",
      intent: "post_idea",
      prompt: "Give me a post idea",
    },
    {
      icon: <MdOutlineTopic />,
      label: "Top Topics",
      intent: "top_topics",
      prompt: "What are trending topics?",
    },
    {
      icon: <FaChartLine />,
      label: "My Stats",
      intent: "profile_stats",
      prompt: "Show my profile stats",
    },
    {
      icon: <FaNewspaper />,
      label: "Latest Post",
      intent: "latest_post",
      prompt: "What's my latest post?",
    },
    {
      icon: <FaSearch />,
      label: "Search",
      intent: "search",
      prompt: "Search for ",
    },
    {
      icon: <FaCommentDots />,
      label: "General",
      intent: "general",
      prompt: "",
    },
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          <FaRobot className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 !z-100 w-[380px] sm:w-[380px] h-[560px] bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-slideUp">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <RiAiGenerate2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">AI Assistant</h3>
                <div className="flex items-center gap-1 text-xs text-white/80">
                  {isConnected ? (
                    <>
                      <FaWifi className="w-3 h-3" />
                      <span>Online • Real‑time</span>
                    </>
                  ) : (
                    <>
                      <i class="fa-solid fa-wifi-slash"></i>
                      <span>Connecting...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#121212]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 p-[2px] mr-2 flex-shrink-0 mt-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <FaRobot className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 p-[2px] mr-2">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <FaRobot className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Row */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] overflow-x-auto flex gap-2 scrollbar-thin">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.intent, action.prompt)}
                disabled={!isConnected}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-blue-500">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-[#1f1f1f] border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Ask anything..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1 h-10 px-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConnected || isTyping}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
