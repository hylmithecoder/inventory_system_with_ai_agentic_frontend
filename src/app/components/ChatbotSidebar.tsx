"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { sendMessageToGemini } from "../services/chatbotGemini";
import { GOOGLE_API_KEY } from "../globalvariables"; 

export const ChatbotSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Halo! Saya Chatbot Inventory. Ada yang bisa dibantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarHeaderRef = useRef(null);

  useEffect(() => {
    if (sidebarRef.current) {
      if (isOpen) {
        gsap.to(sidebarRef.current, {
          width: 420,
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.fromTo(sidebarHeaderRef.current,
          { 
            opacity: 0,
            x: -20
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.3, 
            delay: 0.3,
            ease: "power2.out",
          }
        );

      } else {
        gsap.to(sidebarRef.current, {
          width: 56,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setIsLoading(true);
    setInput("");
    try {
      const reply = await sendMessageToGemini(input, GOOGLE_API_KEY!);
      setMessages((msgs) => [...msgs, { role: "bot", content: reply }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "bot", content: "Terjadi kesalahan: " + err },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {/* <div>tes</div> */}
    <div
      ref={sidebarRef}
      className="fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg flex flex-col transition-all z-40 justify-between"
      style={{ width: 56 }}
    >
      <div className="flex items-center justify-center h-14 gap-3">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-indigo-600 cursor-default"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
          >
            AI
          </text>
        </svg>
        {isOpen && (
        <h2 ref={sidebarHeaderRef} className="font-boldtext-lg text-indigo-600 cursor-default">
            Inventory Chatbot
        </h2>)}
      </div>
      {isOpen && (
        <div className="flex-1 flex flex-col p-4 pt-0 overflow-auto z-40" style={{ minWidth: 420 }}>
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex mb-2 p-1 ${
                  msg.role === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`p-3 ${
                    msg.role === "bot"
                      ? "text-indigo-600 bg-slate-200 rounded-r-2xl rounded-tl-2xl max-w-[80%]" 
                      : "text-slate-800 bg-indigo-100 rounded-l-2xl rounded-tr-2xl max-w-[80%]"
                  }`} 
                >
                  <span>{msg.content}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-indigo-400 text-sm">AI sedang mengetik...</div>
            )}
          </div>
          
          </div>
        )}
        <div className="flex m-2 gap-2">
        <div className="flex text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 shadow-xs font-medium leading-5 rounded px-4 py-2.5 focus:outline-none w-fit cursor-default"
        onClick={isOpen ? () => setIsOpen(false) : () => setIsOpen(true)}
        >{!isOpen ?"<" : ">"}
        </div>
        <div className="flex gap-2">
            <input
              className="flex-1 border-0 bg-gray-100 rounded px-2 py-1 w-full h-10 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
            />
              <button
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 cursor-default"
                onClick={sendMessage}
                disabled={isLoading}
              >
                Kirim
              </button>
            </div>
          </div>
        {/* <div className="fixed bottom-24 right-24 bg-indigo-600 text-white w-10 z-10">tes</div> */}
    </div>
    </>
  );
};
