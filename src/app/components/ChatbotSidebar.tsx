"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { sendMessageToGemini } from "../services/chatbotGemini";

export const ChatbotSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Halo! Saya Chatbot Inventory. Ada yang bisa dibantu?" }
  ]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      if (isOpen) {
        gsap.to(sidebarRef.current, { width: 320, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.to(sidebarRef.current, { width: 56, duration: 0.3, ease: "power2.out" });
      }
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setIsLoading(true);
    setInput("");
    try {
      const reply = await sendMessageToGemini(input, apiKey);
      setMessages(msgs => [...msgs, { role: "bot", content: reply }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { role: "bot", content: "Terjadi kesalahan: " + err }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className="fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg flex flex-col transition-all z-40"
      style={{ width: 56 }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center justify-center h-14">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-600">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">AI</text>
        </svg>
      </div>
      {isOpen && (
        <div className="flex-1 flex flex-col p-4 pt-0" style={{ minWidth: 264 }}>
          <h2 className="font-bold text-lg mb-2 text-blue-700">Chatbot Inventory</h2>
          <div className="mb-2">
            <input
              className="w-full border rounded px-2 py-1 text-xs mb-2"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Masukkan Gemini API Key..."
            />
          </div>
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 ${msg.role === "bot" ? "text-blue-700" : "text-slate-800 text-right"}`}>
                <span>{msg.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="text-blue-400 text-sm">AI sedang mengetik...</div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tulis pesan..."
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
            />
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={sendMessage} disabled={isLoading || !apiKey.trim()}>Kirim</button>
          </div>
        </div>
      )}
    </div>
  );
};
