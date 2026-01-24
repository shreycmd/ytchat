import { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId] = useState(() => Math.floor(Math.random() * 1000000));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/user_query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          thread_id: threadId,
          video_id: "j2lGFm1i91s",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const aiContent = await response.text();

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[1024px] h-[calc(100vh-2rem)] flex flex-col bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <h1 className="text-xl font-semibold text-white">AI Chat</h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 hide-scrollbar">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {/* YouTube Play Button */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                      fill="#FF0000"
                    />
                  </svg>

                  {/* AI Chat Bubble Overlay */}
                  <svg
                    className="absolute -bottom-1 -right-1 w-10 h-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                      fill="#3B82F6"
                      opacity="0.9"
                    />
                    {/* AI Sparkle */}
                    <circle cx="12" cy="10" r="1.5" fill="#FBBF24" />
                    <circle cx="8" cy="10" r="1" fill="#FBBF24" />
                    <circle cx="16" cy="10" r="1" fill="#FBBF24" />
                  </svg>

                  {/* AI Sparkles */}
                  <svg
                    className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  Chat with YouTube AI
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Ask questions about video content
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.error
                      ? "bg-red-900/30 text-red-200 border border-red-800"
                      : "bg-gray-700 text-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[100px]"
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
