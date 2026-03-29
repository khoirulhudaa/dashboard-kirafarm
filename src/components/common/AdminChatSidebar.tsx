import { Edit3, Send, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { parseMessage } from "../../hooks/parserMessage";

const socket = io("https://be-kirafarm.kiraproject.id");

interface Props {
  orderId: string;
  onClose: () => void;
}

const AdminChatSidebar = ({ orderId, onClose }: Props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // UI States untuk Edit & Delete
  const [editingMsg, setEditingMsg] = useState<{ id: string; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // FETCH + SOCKET
  useEffect(() => {
    fetch(`https://be-kirafarm.kiraproject.id/api/chat/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.data);
      });

    socket.emit("join_order", orderId);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("message_deleted", (id) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    socket.on("message_edited", ({ id, message }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, message } : m))
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_deleted");
      socket.off("message_edited");
    };
  }, [orderId]);

  // AUTO SCROLL
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // HANDLERS
  const sendMessage = async () => {
    if (!message.trim()) return;
    await fetch(`https://be-kirafarm.kiraproject.id/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, message, sender: "ADMIN" }),
    });
    setMessage("");
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    await fetch(`https://be-kirafarm.kiraproject.id/api/chat/${deleteConfirmId}`, {
      method: "DELETE",
    });
    setDeleteConfirmId(null);
  };

  const saveEdit = async () => {
    if (!editingMsg) return;
    await fetch(`https://be-kirafarm.kiraproject.id/api/chat/${editingMsg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: editingMsg.text }),
    });
    setEditingMsg(null);
  };

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[40vw] h-full bg-white z-[999999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center bg-white z-10">
        <div>
          <h2 className="font-bold text-black font-bold uppercase">Chat Admin</h2>
          <p className="text-xs text-gray-400">Order ID: {orderId.slice(-8)}</p>
        </div>
        <button onClick={onClose} className="relative mt-[-8px] mr-[-4px] p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
          <X size={20} />
        </button>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => {
          const isAdmin = msg.sender === "ADMIN" || msg.sender === "SELLER";
          const parsed = parseMessage(msg.message);

          return (
            <div key={i} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
              <div className={`flex items-start gap-2 max-w-[85%] ${isAdmin ? "flex-row" : "flex-row-reverse"}`}>
                
                {/* ACTIONS (Hanya untuk pesan ADMIN dan tipe TEXT) */}
                {isAdmin && parsed.type === "TEXT" && (
                  <div className="flex flex-col gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity group">
                    {/* Menggunakan class group pada pembungkus utama jika ingin hover effect */}
                  </div>
                )}
                
                {/* Hover Container */}
                <div className="group relative flex items-center gap-2">
                  {isAdmin && parsed.type === "TEXT" && (
                     <div className="flex gap-1 items-center gap-2">
                        <button onClick={() => setEditingMsg({ id: msg.id, text: msg.message })} className="p-1 text-blue-600"><Edit3 size={16}/></button>
                        <button onClick={() => setDeleteConfirmId(msg.id)} className="p-1 text-red-600"><Trash2 size={16}/></button>
                     </div>
                  )}

                  {/* BUBBLE */}
                  <div className={`shadow-sm overflow-hidden ${
                      parsed.type === "PRODUCT" ? "w-56 bg-white rounded-xl border" : 
                      isAdmin ? "bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm" : 
                      "bg-white border text-gray-700 rounded-2xl rounded-tl-none px-4 py-2 text-sm"
                    }`}>
                    {parsed.type === "PRODUCT" ? (
                      <>
                        <img src={parsed.data.image} className="w-full h-28 object-cover" alt="product" />
                        <div className="p-3">
                          <p className="font-bold text-[11px] truncate">{parsed.data.name}</p>
                          <p className="text-blue-600 font-black text-[10px] mt-1">Rp{parseFloat(parsed.data.price).toLocaleString("id-ID")}</p>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold text-right italic">Buyer Attachment</p>
                        </div>
                      </>
                    ) : (
                      parsed.data
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-gray-400 mt-1 font-bold px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="Ketik balasan admin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 rounded-xl flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>

      {/* --- MODALS (Copy dari User Style) --- */}

      {/* 1. Modal Konfirmasi Hapus */}
      {deleteConfirmId && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-6">
          <div className="bg-white rounded-[28px] w-full max-w-[280px] p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">Hapus Pesan?</h3>
            <p className="text-xs text-gray-400 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl text-xs hover:bg-gray-200 transition-all">Batal</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-100">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Edit Pesan */}
      {editingMsg && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-end justify-center p-4">
          <div className="bg-white rounded-t-[32px] w-full p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xs font-black text-gray-900 mb-4 uppercase tracking-widest">Edit Balasan Admin</h3>
            <textarea 
              className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium h-32"
              value={editingMsg.text}
              onChange={(e) => setEditingMsg({...editingMsg, text: e.target.value})}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingMsg(null)} className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all text-xs uppercase">Batal</button>
              <button onClick={saveEdit} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-xs uppercase tracking-widest">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminChatSidebar;