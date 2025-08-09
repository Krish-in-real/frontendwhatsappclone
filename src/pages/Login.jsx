import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api";
import { initSocket } from "../socket";

export default function Login() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name || !phone) {
            alert("Enter name and phone");
            return;
        }
        try {
            const payload = { name, phone, email };
            const user = await createUser(payload);
            // backend returns created user doc (with _id). normalize id field
            const id = user._id || user.id || user._id;
            const stored = { ...user, _id: id };
            localStorage.setItem("wh_user", JSON.stringify(stored));
            initSocket(stored._id);
            navigate("/chats");
        } catch (err) {
            console.error(err);
            alert("Failed to register. Check backend.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

                <label className="text-sm font-medium">Name</label>
                <input className="w-full p-2 border rounded mb-3" value={name} onChange={(e) => setName(e.target.value)} />

                <label className="text-sm font-medium">Phone (wa_id)</label>
                <input className="w-full p-2 border rounded mb-3" value={phone} onChange={(e) => setPhone(e.target.value)} />

                <label className="text-sm font-medium">Email (optional)</label>
                <input className="w-full p-2 border rounded mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />

                <button className="w-full bg-green-500 text-white py-2 rounded">Continue</button>
            </form>
        </div>
    );
}
