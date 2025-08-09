import React, { useEffect, useState } from "react";
import { getUsers } from "../api";
import { initSocket } from "../socket";
import { useNavigate } from "react-router-dom";

export default function Chats() {
    const [me, setMe] = useState(null);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const s = localStorage.getItem("wh_user");
        if (!s) { navigate("/login"); return; }
        const user = JSON.parse(s);
        setMe(user);
        initSocket(user._id);
        loadUsers();
        // eslint-disable-next-line
    }, []);

    async function loadUsers() {
        try {
            const u = await getUsers();
            // filter out self
            const filtered = u.filter(x => (x._id || x.id) !== (JSON.parse(localStorage.getItem("wh_user"))._id));
            setUsers(filtered);
        } catch (err) { console.error(err); }
    }

    return (
        <div className="flex h-screen">
            <aside className="w-80 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="font-semibold">{me?.name}</div>
                    <div className="text-xs text-gray-500">{me?.phone}</div>
                </div>
                <div className="flex-1 overflow-auto">
                    {users.map(u => (
                        <button key={u._id || u.id}
                            onClick={() => navigate(`/chat/${u._id || u.id}`)}
                            className="flex items-center gap-3 p-3 w-full text-left hover:bg-gray-50">
                            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold">{u.name?.[0] || "U"}</div>
                            <div className="flex-1">
                                <div className="font-medium">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.phone}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a chat from the left to start messaging
            </div>
        </div>
    );
}
