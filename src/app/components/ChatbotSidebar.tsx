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
    { role: "", content: "" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [historyChat, setHistoryChat] = useState([]) as any
  const [tableModel, setTableModel] = useState([]) as any[]
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<HandlerRequestData>({
    action: "ask_ai",
    request: "",
    response: "",
    sql_script: "",
    token: ""
  })

  const getHistoryChat = async() => {
    if (messages.length >= 2) {
      return
    }

    const reponse = await getAllInformDatabase("history_chat", token)

    setHistoryChat(reponse.data)

    for (let i = 0; i < historyChat.length; i++) {
      setMessages(prevMessages => [
        ...prevMessages,
        { role: "user", content: historyChat[i].request }
      ]);

      setMessages(prevMessages => [
        ...prevMessages,
        { role: "bot", content: historyChat[i].response }
      ]);
    }
  }

  const getTableModel = async() => {
    if (messages.length >= 2) {
      return
    }
    const response = await getAllInformDatabase("tables", token)

    setTableModel(response)
  }

  useEffect(() => {
    if (sidebarRef.current) {
      if (isOpen) {
        gsap.to(sidebarRef.current, { width: 320, duration: 0.3, ease: "power2.out" })
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
      setMessages(msgs => [...msgs, { role: "bot", content: "Tidak ada pesan yang dikirimkan." }]);
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

      Jika user bertanya di luar konteks tabel, tetap balas dengan JSON di atas,
      dan isi "sql_script" dengan null atau kosong.
      Jangan berikan jawaban lain selain JSON.
    `;

    setMessages([...messages, { role: "user", content: input }]);
    setIsLoading(true);
    setInput("");

    try {
      const reply = await sendMessageToGemini(formattedRequest, GOOGLE_API_KEY);
      console.log("Raw reply:", reply);

      const cleaned = cleanJsonResponse(reply);
      console.log("Cleaned:", cleaned);

      // Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        console.error("Parsing error:", err);
        parsed = { explain: "Response bukan JSON valid", sql_script: null };
      }

      // Simpan ke messages
      console.log(parsed.explain)
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
    <div
      ref={sidebarRef}
      className="fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg flex flex-col transition-all z-40"
      style={{ width: 56 }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center justify-center h-14">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-600"
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
      </div>
      {isOpen && (
      <div className="flex flex-col h-full p-4 pt-0 min-w-[264px]">
        <h2 className="font-bold text-lg mb-2 text-blue-700">Chatbot Support</h2>

        {/* Chat area scrollable */}
        <div className="flex-1 overflow-y-auto mb-2 border rounded p-2 bg-white">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 ${
                msg.role === "bot" ? "text-blue-700" : "text-slate-800 text-right"
              }`}
            >
              <span>{msg.content}</span>
            </div>
          ))}
          {isLoading && (
            <div className="text-blue-400 text-sm">AI sedang mengetik...</div>
          )}
        </div>

        {/* Input bar tetap di bawah */}
        <div className="flex gap-2 border-t pt-2 bg-white">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center justify-center"
            onClick={sendMessage}
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
    {ModalConfirm()}
    </div>
  )
}
