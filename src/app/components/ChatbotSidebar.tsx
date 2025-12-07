"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import gsap from "gsap"
import { sendMessageToGemini } from "../services/chatbotGemini"
import { GOOGLE_API_KEY, HandleGetUserData, HandlerRequestData, InventoryItem } from "../globalvariables"
import { Input } from "./ui/Input"
import { Modal } from "./ui/Modal"
import { Send } from "lucide-react"
import { getAllInformDatabase, handlerRequestSqlFromAi } from "../services/post"
import { fetchInventoryData, getUserAuth } from "../services/get"
import { Button } from "./ui/Button"

interface ChatBotProps {
  token: string
  onLoadData: (data: InventoryItem[]) => void
}

export const ChatbotSidebar = ({ token, onLoadData }: ChatBotProps) => {
  const [user, setUser] = useState<HandleGetUserData>({
    auth: false,
    user: {
      exp: 0,
      iat: 0,
      isAdmin: "No",
      session_token: "",
      username: "",
    }
  });
  const [isOpen, setIsOpen] = useState(false)
  type Message = { role: 'user' | 'bot'; content: string; time?: string }
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Halo! Saya Chatbot Inventory. Ada yang bisa dibantu?' },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarHeaderRef = useRef(null);

  interface ChatRow {
    request: string;
    response: string;
    created_at?: string;
    time?: string;
    createdAt?: string;
    datetime?: string;
  }
  const [historyChat, setHistoryChat] = useState<ChatRow[]>([])
  const [tableModel, setTableModel] = useState<unknown[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<HandlerRequestData>({
    action: "ask_ai",
    request: "",
    response: "",
    sql_script: "",
    token: ""
  })

  const formatTimeLabel = (value: string | undefined) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
    } catch (e) {
      return value;
    }
  }

  const getHistoryChat = useCallback(async () => {
    try {
      const response = await getAllInformDatabase("history_chat", token);
      const rows: ChatRow[] = response?.data ?? [];
      setHistoryChat(rows);

      // only append historical messages if there are none besides the initial bot prompt
      if (messages.length <= 1 && rows.length > 0) {
        const histMessages: Message[] = [];
        // map oldest first
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const time = formatTimeLabel(r.created_at ?? r.time ?? r.createdAt ?? r.datetime);
          histMessages.push({ role: 'user', content: r.request, time });
          histMessages.push({ role: 'bot', content: r.response, time });
        }
        setMessages(prev => [...prev, ...histMessages]);
      }
    } catch (err) {
      // keep console.error but avoid `any` in signature
       
      console.error('Failed to load history chat', err);
    }
  }, [token, messages]);

  const getUserData = useCallback(async () => {
    const data = await getUserAuth();
    if (data && 'user' in data) setUser({ auth: true, user: data.user });
    else if (data) setUser({ auth: true, user: data as HandleGetUserData['user'] });
  }, []);

  const getTableModel = useCallback(async () => {
    if (messages.length >= 2) return;
    const response = await getAllInformDatabase("tables", token)
    setTableModel(response || [])
  }, [token, messages]);

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

        gsap.to(sidebarRef.current, { width: 420, duration: 0.3, ease: "power2.out" })
      } else {
        gsap.to(sidebarRef.current, { width: 64, duration: 0.3, ease: "power2.out" })
      }
    }

    getHistoryChat()
    getTableModel()
    getUserData()
  }, [isOpen, getHistoryChat, getTableModel, getUserData])

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

  const executeWithAI = async (data: HandlerRequestData) => {
    const response = await handlerRequestSqlFromAi(data)
    onLoadData(await fetchInventoryData(user.user.username))
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

      Nama Pengguna : ${user.user.username}
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

      // Parse JSON safely into expected shape
      type Parsed = { explain?: string; sql_script?: string | null }
      let parsed: Parsed = { explain: 'Response bukan JSON valid', sql_script: null };
      try {
        parsed = JSON.parse(cleaned) as Parsed;
      } catch (parseErr) {
         
        console.error("Parsing error:", parseErr);
      }

      setMessages(msgs => [...msgs, { role: "bot", content: parsed.explain ?? 'Tidak ada penjelasan' }]);
      setFormData({
        action: "ask_ai",
        request: input,
        response: parsed.explain ?? '',
        sql_script: parsed.sql_script ?? null,
        token: token
      })

      if (parsed.sql_script) {
        setIsModalOpen(true)
      } else {
        executeWithAI(formData);
      }
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
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg flex flex-col transition-all z-40 justify-between"
        style={{ width: 64 }}
      >
        <div className={`border-b border-slate-100 flex items-center h-14 gap-3 ${isOpen ? "px-3 justify-between" : "px-1 justify-center"}`}>
          <button
            onClick={() => setIsOpen(prev => !prev)}
            aria-expanded={isOpen}
            title={isOpen ? 'Tutup Chatbot' : 'Buka Chatbot'}
            className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            AI
          </button>
          {isOpen && (
            <h2 ref={sidebarHeaderRef} className="text-indigo-600 font-semibold text-lg">Inventory Chatbot</h2>
          )}
        </div>
        {isOpen && (
          <div className="flex-1 flex flex-col pt-0 overflow-auto z-40" style={{ minWidth: 420 }}>
            <div className="flex-1 overflow-y-auto pb-4 space-y-3 px-4 border-b border-slate-200">
              {messages.map((msg: Message, idx) => (
                <div key={idx} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[78%] p-3 rounded-lg shadow-sm ${msg.role === 'bot' ? 'bg-slate-50 text-slate-800 rounded-br-none' : 'bg-indigo-600 text-white rounded-bl-none'}`}>
                    {msg.time && <div className={`text-xs mt-2 ${msg.role === 'bot' ? 'text-slate-400' : 'text-white/80'}`}>{msg.time}</div>}
                    <span>{msg.content}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-indigo-500 text-sm">AI sedang mengetik...</div>
              )}
            </div>

            <div className="py-2 px-3">
              <div className="p-3 border border-slate-300 rounded-lg bg-slate-100">
                <div className="flex gap-2 items-center">
                  <Input
                    className="flex-1 outline-none border border-indigo-300 bg-slate-50 rounded px-3 py-2 h-10 focus:ring-2 focus:ring-indigo-600/40 transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pesan..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                  />
                  <button
                    className="bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 transition-all"
                    onClick={sendMessage}
                    disabled={isLoading}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <div>{isOpen ? 'Chat aktif' : 'Collapsed'}</div>
                  <div>{messages.length - 1} pesan</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {ModalConfirm()}
    </>
  );
};
