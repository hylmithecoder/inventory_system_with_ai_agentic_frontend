"use client"
import { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { sendMessageToGemini } from "../services/chatbotGemini"
import { GOOGLE_API_KEY, HandlerRequestData, InventoryItem } from "../globalvariables"
import { Input } from "./ui/Input"
import { Modal } from "./ui/Modal"
import { Send } from "lucide-react"
import { getAllInformDatabase, handlerRequestSqlFromAi } from "../services/post"
import { fetchInventoryData } from "../services/get"
import { Button } from "./ui/Button"

interface ChatBotProps {
  token: string
  onLoadData: (data: InventoryItem[]) => void
}

export const ChatbotSidebar = ({token, onLoadData}: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false)
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
          width: 360,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(sidebarRef.current, { width: 56, duration: 0.3, ease: "power2.out" })
      }
    }

    getHistoryChat()
    getTableModel()
  }, [isOpen])

  const openModal = () => {
    setIsOpen(!isModalOpen)
  }

  const ModalConfirm = () => {
    return <>
      <Modal
        isOpen={isModalOpen}
        onClose={openModal}
        title="Informasi"
      >
        <div>
          <p className="text-slate-700">
            Apakah Anda yakin ingin melanjutkan eksekusi?
          </p>
          
        <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="button" variant="primary" onClick={() => executeWithAI(formData)}>Ya</Button>
          </div>
        </div>
      </Modal>
    </>
  }

  function cleanJsonResponse(input: string): string {
    return input
      .replace(/```json\s*/i, "")
      .replace(/```/g, "")
      .trim();
  }

  const executeWithAI = async(data: HandlerRequestData) => {
    const response = await handlerRequestSqlFromAi(data)
    onLoadData(await fetchInventoryData())
    setIsModalOpen(false)
    return response
  }

  const sendMessage = async () => {
    if (input.trim() === "") {
      return;
    }


    const formattedRequest = `
      Kamu adalah AI yang hanya menjawab dalam format JSON valid.
      Format wajib:
      {
        "explain": "penjelasan singkat dalam bahasa manusia",
        "sql_script": "query SQL yang dihasilkan"
      }

      User message: ${input}
      Table model: ${JSON.stringify(tableModel)}

      Aturan tambahan:
      - Jika perintah INSERT atau UPDATE memiliki lebih dari 3 values (contoh: INSERT INTO name_table (...) VALUES (...), (...), (...), (...)),
        maka pecah menjadi beberapa perintah INSERT INTO terpisah, masing-masing maksimal 3 values.
      - Jangan gabungkan lebih dari 3 values dalam satu query.
      - Jika sql_script terlalu besar, tetap pecah sesuai aturan di atas.
      - Jika user bertanya di luar konteks tabel, tetap balas dengan JSON di atas,
        dan isi "sql_script" dengan null atau kosong.
      - Jangan berikan jawaban lain selain JSON.
    `;

    setMessages([...messages, { role: "user", content: input }]);
    setIsLoading(true);
    setInput("");

    try {
      const reply = await sendMessageToGemini(formattedRequest, GOOGLE_API_KEY);

      const cleaned = cleanJsonResponse(reply);

      // Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        console.error("Parsing error:", err);
        parsed = { explain: "Response bukan JSON valid", sql_script: null };
      }


      setMessages(msgs => [...msgs, { role: "bot", content: parsed.explain }]);
      setFormData({
        action: "ask_ai",
        request: input,
        response: parsed.explain,
        sql_script: parsed.sql_script,
        token: token
      })
      setIsModalOpen(true)
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
        <div className="flex-1 flex flex-col p-4 pt-0 overflow-auto z-40" style={{ minWidth: 320 }}>
          <h2 className="font-bold text-lg mb-2 text-blue-700">
            Inventory Chatbot
          </h2>
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
                      ? "text-blue-700 bg-slate-200 rounded-r-2xl rounded-tl-2xl max-w-[80%]"
                      : "text-slate-800 bg-blue-100 rounded-l-2xl rounded-tr-2xl max-w-[80%]"
                  }`}
                >
                  <span>{msg.content}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-blue-400 text-sm">AI sedang mengetik...</div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border-0 bg-gray-100 rounded px-2 py-1 w-0 h-10 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
            />
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={sendMessage}
                disabled={isLoading}
              >
                Kirim
              </button>
            </div>
          </div>
        )}
        <div className="fixed bottom-24 right-24 bg-indigo-600 text-white w-10 z-10">tes</div>
    </div>
  );
};
