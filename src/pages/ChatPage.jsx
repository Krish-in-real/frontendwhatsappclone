import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMessages, sendMessage as apiSendMessage } from "../api";
import { initSocket, getSocket } from "../socket";
import MessageBubble from "../components/MessageBubble";

export default function ChatPage() {
  function getISTTime() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60 * 1000; // +05:30 in ms
    return new Date(utc + istOffset).toISOString(); // or return formatted string
  }
  const { receiverId } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const meRef = useRef(null);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Stable handler using ref
  const handleReceive = useCallback(
    (data) => {
      const myId = meRef.current?._id;
      if (!myId) return;

      const cond1 = data.sender_id === receiverId && data.receiver_id === myId;
      const cond2 = data.sender_id === myId && data.receiver_id === receiverId;

      if (cond1 || cond2) {
        setMessages((prev) => [...prev, data]);
      }
    },
    [receiverId]
  );

  // Load "me" once and set ref
  useEffect(() => {
    const s = localStorage.getItem("wh_user");
    if (!s) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(s);
    setMe(user);
    meRef.current = user;
  }, [navigate]);

  // Fetch receiver only when receiverId changes
  const usersCache = useRef(null);

  useEffect(() => {
    async function fetchReceiver(id) {
      try {
        let users;
        if (usersCache.current) {
          users = usersCache.current;
        } else {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/users/`);
          users = await res.json();
          usersCache.current = users;
        }
        const r = users.find((u) => (u._id || u.id) === id);
        setReceiver(r);
      } catch (err) {
        console.error(err);
      }
    }
    if (receiverId) fetchReceiver(receiverId);
  }, [receiverId]);

  // Load messages when me and receiverId are ready
  useEffect(() => {
    if (!me?._id || !receiverId) return;

    async function loadMessages() {
      try {
        const msgs = await getMessages(me._id, receiverId);
        setMessages(msgs || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadMessages();
  }, [me, receiverId]);

  // Setup socket once when "me" is set
  useEffect(() => {
    if (!me?._id) return;

    const socket = initSocket(me._id);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("register", { user_id: me._id });
    });

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("connect");
    };
  }, [me, handleReceive]);

  // Send message handler
  async function handleSend(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    if (!me?._id) return;
    const timestamp = getISTTime();
    console.log(timestamp)

    const payload = {
      sender_id: me._id,
      receiver_id: receiverId,
      content: text.trim(),
      timestamp: timestamp,
    };

    try {
      const saved = await apiSendMessage(payload);
      const socket = getSocket(me._id); // ✅ fixed
      if (socket) socket.emit("send_message", payload);
      setMessages((prev) => [...prev, { ...payload, ...saved }]);
      setText("");
    } catch (err) {
      console.error(err);
      alert("Failed to send");
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r hidden md:flex flex-col">
        <div className="p-4 border-b">
          <div className="font-semibold">{me?.name}</div>
          <div className="text-xs text-gray-500">{me?.phone}</div>
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold">
            {receiver?.name?.[0] || "?"}
          </div>
          <div>
            <div className="font-semibold">{receiver?.name || receiverId}</div>
            <div className="text-xs text-gray-500">{receiver?.phone}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            {messages.map((m, i) => (
              <MessageBubble
                key={m._id || m.id || m.content + i}
                message={m}
                meId={me?._id}
              />
            ))}
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t flex items-center gap-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message"
            className="flex-1 px-4 py-2 rounded-full border"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-full"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
